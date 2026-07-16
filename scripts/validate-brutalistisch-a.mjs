#!/usr/bin/env node
// Regressiecontrole van variant Brutalistisch A tegen de gedeelde content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-brutalistisch-a.mjs (dependency-vrij, Node-standaardbibliotheek).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBrandColors, checkContrastUsage, checkImages, checkNoPdfRuntime } from './lib/variant-checks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), 'utf8');

function extractSingleCssBlock(source, headerPattern, label) {
  const matches = [...source.matchAll(headerPattern)];
  if (matches.length !== 1) {
    fail(`styles.css: verwacht exact één ${label}-blok, gevonden ${matches.length}`);
    return '';
  }

  const openingBrace = matches[0].index + matches[0][0].lastIndexOf('{');
  let depth = 1;
  let quote = '';
  for (let i = openingBrace + 1; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && next === '*') {
      const commentEnd = source.indexOf('*/', i + 2);
      if (commentEnd === -1) {
        fail(`styles.css: onafgesloten comment in ${label}-blok`);
        return '';
      }
      i = commentEnd + 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, i);
  }

  fail(`styles.css: onafgesloten ${label}-blok`);
  return '';
}

const html = read('brutalistisch-a/index.html');
const css = read('brutalistisch-a/styles.css');
const js = read('brutalistisch-a/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- document & metadata ---
if (!/<html[^>]*\slang="nl"/.test(html)) fail('index.html: documenttaal is niet nl');
const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
if (!title || /in aanbouw/i.test(title)) fail('index.html: unieke paginatitel ontbreekt of is nog de statustitel');
const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '';
if (desc.length < 50) fail('index.html: Nederlandse meta-description ontbreekt of is te kort');
if (/noindex/i.test(html)) fail('index.html: noindex-markering hoort niet op de opgeleverde variant');
if (!/<meta name="viewport"/.test(html)) fail('index.html: viewport-metadata ontbreekt');

const h1s = html.match(/<h1[\s>]/g) ?? [];
if (h1s.length !== 1) fail(`index.html: verwacht exact één <h1>, gevonden: ${h1s.length}`);

// --- sectievolgorde ---
const requiredSections = ['intro', 'visie', 'controlelaag', 'platform', 'controle', 'aanpak', 'bewijs', 'contact'];
let cursor = -1;
for (const id of requiredSections) {
  const idx = html.indexOf(`id="${id}"`);
  if (idx === -1) fail(`index.html: sectie '#${id}' ontbreekt`);
  else if (idx < cursor) fail(`index.html: sectie '#${id}' staat niet in de vereiste volgorde`);
  else cursor = idx;
}
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html)) {
  fail('index.html: landmarks header/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');
// Brutalistische structuurkenmerken: zichtbare sectiecodes, binnenwrappers en moduleplaten.
if ((html.match(/class="sectiecode"/g) ?? []).length < 8) fail('index.html: elke sectie hoort een zichtbare sectiecode te dragen');
const innerWrapperCount = (html.match(/class="blok__binnen"/g) ?? []).length;
if (innerWrapperCount !== 8) fail(`index.html: verwacht exact acht .blok__binnen-wrappers, gevonden ${innerWrapperCount}`);
for (const sectionId of requiredSections) {
  const sectionStart = new RegExp(`<section[^>]+id="${sectionId}"[^>]*>\\s*<div class="blok__binnen">`);
  if (!sectionStart.test(html)) fail(`index.html: sectie #${sectionId} begint niet direct met de gedeelde .blok__binnen-wrapper`);
}

const moduleLists = html.match(/<ol class="platen"[^>]*>[\s\S]*?<\/ol>/g) ?? [];
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
if (moduleLists.length !== 1) {
  fail(`index.html: verwacht exact één .platen-lijst, gevonden ${moduleLists.length}`);
} else {
  const foundClaims = [...moduleLists[0].matchAll(/<li class="plaat"\s+data-claim-id="([^"]+)"/g)].map((match) => match[1]);
  if (foundClaims.length !== 3) fail(`index.html: verwacht exact drie .plaat-items, gevonden ${foundClaims.length}`);
  if (foundClaims.join('|') !== moduleClaims.join('|')) {
    fail(`index.html: modulevolgorde moet ${moduleClaims.join(' → ')} zijn`);
  }
}

// --- claims ---
const knownClaims = new Map();
for (const topic of Object.values(content.topics)) {
  for (const claim of topic.claims) knownClaims.set(claim.id, claim);
}
const usedClaims = new Set(
  [...html.matchAll(/data-claim-id="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean)
);
for (const id of usedClaims) {
  if (!knownClaims.has(id)) fail(`index.html: onbekende data-claim-id '${id}'`);
}

// Strikte claims: de zichtbare varianttekst ligt hier vast, zodat inhoudelijke drift
// (cijfers, compliance) de check laat falen in plaats van alleen het claim-ID.
const normalize = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;|\s+/g, ' ').trim();
const claimScopes = new Map();
for (const m of html.matchAll(/<([a-z0-9]+)\b[^>]*\sdata-claim-id="([^"]+)"[^>]*>/g)) {
  const [openTag, tag, ids] = m;
  const start = m.index + openTag.length;
  const tokenRe = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'g');
  tokenRe.lastIndex = start;
  let depth = 1;
  let end = html.length;
  let t;
  while ((t = tokenRe.exec(html))) {
    depth += t[0].startsWith('</') ? -1 : 1;
    if (depth === 0) { end = t.index; break; }
  }
  if (depth !== 0) fail(`index.html: sluittag voor <${tag} data-claim-id="${ids}"> niet gevonden`);
  const inner = normalize(html.slice(start, end).replace(/<[^>]+>/g, ' '));
  for (const id of ids.split(/\s+/).filter(Boolean)) {
    if (!claimScopes.has(id)) claimScopes.set(id, []);
    claimScopes.get(id).push(inner);
  }
}
const strictVariantTexts = {
  'pos-besparing-30': ['Bespaar 30% van je tijd met één AI-platform.'],
  'pos-nederlands': ['Door Nederlandse AI-professionals gebouwd; NL-gehost, AVG-proof en snel inzetbaar.'],
  'pos-badges': ['EU-gehost', 'ISO 27001 gecertificeerd', 'API-first', 'Model-agnostisch'],
  'pos-award': ['Artific is uitgeroepen tot AI Company of the Year 2025 tijdens de Nationale AI Awards.'],
  'sec-eu': ['Alle data, alle infrastructuur, alle processing binnen de EU.'],
  'sec-iso': ['Onafhankelijke audit van het informatiebeveiligingssysteem, continu onderhouden.'],
  'sec-pseudo': ['Persoonlijk identificeerbare informatie wordt gedetecteerd en gepseudonimiseerd voordat het ooit een model bereikt.'],
  'sec-audit': ['Elke prompt, elke tool-call, elke beslissing wordt vastgelegd in het systeem.'],
  'bo-aftercare': ['Na livegang blijven we betrokken: monitoring, optimalisatie en minimaal één update-sync-meeting per kwartaal.'],
  'bo-support': ['Met 1e-, 2e- en 3e-lijns support ben je altijd verzekerd van de juiste ondersteuning.'],
  'bw-100-klanten': ['Meer dan 100 klanten laten AI voor zich werken', 'Van enterprise tot overheid: organisaties die security, governance en betrouwbaarheid serieus nemen.'],
  'bw-klantnamen': ['Onder meer Basic-Fit, Eneco, Marktplaats, hollandsnieuwe, Gemeente Den Haag, RTV Oost, Veiligheidsregio Zuid-Limburg en Vechtsteden Notarissen.'],
};
for (const id of usedClaims) {
  if (!knownClaims.get(id)?.strict) continue;
  const snippets = strictVariantTexts[id];
  if (!snippets) { fail(`index.html: strikte claim '${id}' heeft geen vastgelegde varianttekst in deze validator`); continue; }
  const scopes = (claimScopes.get(id) ?? []).map(normalize);
  // Ieder voorkomen wordt afzonderlijk gecontroleerd: één geldig voorkomen mag
  // een tweede, afwijkend voorkomen van dezelfde strikte claim niet maskeren.
  for (const scope of scopes) {
    if (!snippets.some((snippet) => scope.includes(normalize(snippet)))) {
      fail(`index.html: een voorkomen van strikte claim '${id}' bevat geen van de vastgelegde variantteksten: '${scope.slice(0, 80)}…'`);
    }
  }
  for (const snippet of snippets) {
    if (!scopes.some((scope) => scope.includes(normalize(snippet)))) {
      fail(`index.html: zichtbare tekst binnen het element met strikte claim '${id}' wijkt af van de vastgelegde varianttekst: '${snippet}'`);
    }
  }
}
const requiredClaims = [
  'pos-belofte', 'pos-agentic-platform', 'pos-badges',
  'dm-kop', 'vvt-veilig', 'vvt-voorspelbaar', 'vvt-transparant',
  'reis-fase-1', 'reis-fase-2', 'reis-fase-3',
  'ctl-positie', 'ctl-tussen-model-en-proces',
  'mod-overzicht', 'mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation',
  'ph-portal', 'ph-headless',
  'cc-een-plek', 'sec-ontwerp', 'sec-eu', 'sec-iso', 'sec-audit',
  'pm-markt', 'bo-vijf-stappen', 'bw-100-klanten', 'cv-versnellen',
];
for (const id of requiredClaims) {
  if (!usedClaims.has(id)) fail(`index.html: vereiste claim '${id}' wordt niet gebruikt`);
}

// --- links & CTA's ---
if (/href="#"[\s>]/.test(html)) fail('index.html: kale href="#" gevonden');
if (/vision\.artific\.nl|product\.artific\.nl/.test(html)) {
  fail('index.html: inhoudelijke doorlink naar vision-/productsubpagina is niet toegestaan');
}
const allowedExternal = new Set([
  ...Object.values(content.ctas.navigation['artific.nl-footer'].links),
  ...Object.values(content.ctas.canonical)
    .map((c) => c.destination)
    .filter((d) => typeof d === 'string' && /^https?:/.test(d)),
]);
for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
  if (href.startsWith('#') || href === 'styles.css') continue;
  if (!allowedExternal.has(href)) fail(`index.html: niet-toegestane externe link '${href}'`);
}

const ctaCard = content.ctas.canonical;
const ctaRe = /<a\b([^>]*\sdata-cta-id="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g;
let ctaCount = 0;
for (const [, attrs, ctaId, inner] of html.matchAll(ctaRe)) {
  ctaCount += 1;
  const entry = ctaCard[ctaId];
  if (!entry) { fail(`index.html: data-cta-id '${ctaId}' staat niet in de CTA-kaart`); continue; }
  const label = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (label !== entry.label) fail(`index.html: CTA '${ctaId}' heeft label '${label}' i.p.v. '${entry.label}'`);
  const href = attrs.match(/href="([^"]+)"/)?.[1];
  if (href !== entry.destination) fail(`index.html: CTA '${ctaId}' wijst naar '${href}' i.p.v. '${entry.destination}'`);
  if (/target=/.test(attrs)) fail(`index.html: CTA '${ctaId}' mag geen target-attribuut hebben (zelfde tabblad)`);
}
const ctaAttrTotal = (html.match(/data-cta-id="/g) ?? []).length;
if (ctaAttrTotal !== ctaCount) fail(`index.html: ${ctaAttrTotal} data-cta-id-attributen gevonden maar slechts ${ctaCount} als anchor gevalideerd`);
if (ctaCount < 3) fail(`index.html: verwacht minimaal 3 CTA-voorkomens (commandobar, hero, slot), gevonden: ${ctaCount}`);

// --- afbeeldingen: alleen canonieke logo-/achtergrondcombinaties ---
checkImages(html, css, brand, root, 'brutalistisch-a', fail);
// Logo-uitvoering: op de donkere commandobar en footer hoort uitsluitend het witte logo.
if (/artific-logo-blauw\.svg/.test(html)) fail('index.html: het blauwe logo hoort niet op de donkere vlakken van deze variant');

// --- kleuren: uitsluitend uit brand.json, in CSS én HTML ---
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
checkContrastUsage(html, css, brand, [
  { foregroundSelector: 'body', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.skiplink', backgroundSelector: '.skiplink', pairId: 'navy-op-geel' },
  { foregroundSelector: '.commandobar', backgroundSelector: '.commandobar', pairId: 'wit-op-navy' },
  { foregroundSelector: '.commandobar__nav a', backgroundSelector: '.commandobar', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--bar', backgroundSelector: '.cta--bar', pairId: 'navy-op-geel' },
  { foregroundSelector: '.cta--primair', backgroundSelector: '.cta--primair', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--signaal', backgroundSelector: '.cta--signaal', pairId: 'navy-op-geel' },
  { foregroundSelector: '.sectiecode', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.blok--donker', backgroundSelector: '.blok--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.blok--donker .sectiecode', backgroundSelector: '.blok--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.pipeline__koppeling', backgroundSelector: '.blok--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: 'body', backgroundSelector: '.plaat', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: 'body', backgroundSelector: '.plaat__lijst li', pairId: 'navy-op-wit' },
  { foregroundSelector: '.specsheet__rij h4', backgroundSelector: '.blok--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.strakke-lijst li::before', backgroundSelector: '.blok--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.site-footer', backgroundSelector: '.site-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.site-footer__links a', backgroundSelector: '.site-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.fasen li::before', backgroundSelector: 'body', pairId: 'blauw-op-wit-groot' },
  { foregroundSelector: '.stappen li::before', backgroundSelector: 'body', pairId: 'blauw-op-wit-groot' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);
if (/rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: afgeleide/transparante kleuren of standaard-verborgen inhoud zijn niet toegestaan');
}
if (/border-radius|(?:linear|radial|conic)-gradient|blur\(|filter\s*:/.test(css)) {
  fail('styles.css: afronding, gradients, blur of filters passen niet in deze brutalistische variant');
}
if (/\b(?:masthead|folio|spread|trust-console|module-card|bewijsrail|boekdeel|dossierregel|evidence-index|assurance-ledger)\b/i.test(`${html}\n${css}\n${js}`)) {
  fail('brutalistisch-a: runtime bevat een verboden signatuur van een zustervariant');
}
const shadowValues = [...css.matchAll(/box-shadow\s*:\s*([^;}]+)/g)].map((match) => match[1].trim());
if (!shadowValues.length || shadowValues.some((value) => !/^(?:6|8|12)px\s+(?:6|8|12)px\s+0\s+0\s+var\(--blauw\)$/.test(value))) {
  fail('styles.css: offsetschaduwen moeten harde effen blauwe schaduwen zonder blur zijn');
}

const compactCss = css.replace(/\s+/g, ' ');
if (!/--werkvlak:\s*1280px/.test(compactCss)
    || !/--gutter:\s*clamp\(16px,\s*4vw,\s*48px\)/.test(compactCss)
    || !/--sectieruimte:\s*clamp\(64px,\s*6vw,\s*88px\)/.test(compactCss)) {
  fail('styles.css: het compacte 1280px-werkvlak met 48px-gutter en 64–88px sectieritme ontbreekt');
}
for (const selector of ['.blok__binnen', '.commandobar__binnen', '.site-footer__binnen']) {
  const escaped = selector.replace('.', '\\.');
  if (!new RegExp(`${escaped}\\s*\\{[^}]*max-width:\\s*var\\(--werkvlak\\)[^}]*margin-inline:\\s*auto`).test(compactCss)) {
    fail(`styles.css: ${selector} deelt het gecentreerde werkvlak niet`);
  }
}

const desktopCss = extractSingleCssBlock(
  css,
  /@media\s*\(\s*min-width\s*:\s*1000px\s*\)\s*\{/g,
  'desktopmediaquery (min-width: 1000px)'
).replace(/\s+/g, ' ');
const mobileCss = extractSingleCssBlock(
  css,
  /@media\s*\(\s*max-width\s*:\s*999px\s*\)\s*\{/g,
  'mobiele mediaquery (max-width: 999px)'
).replace(/\s+/g, ' ');
const desktopPlateContracts = [
  /\.platen\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/,
  /\.platen\s*>\s*\.plaat:nth-child\(1\)\s*\{[^}]*grid-column:\s*1\s*\/\s*11[^}]*grid-row:\s*1/,
  /\.platen\s*>\s*\.plaat:nth-child\(2\)\s*\{[^}]*grid-column:\s*2\s*\/\s*12[^}]*grid-row:\s*2/,
  /\.platen\s*>\s*\.plaat:nth-child\(3\)\s*\{[^}]*grid-column:\s*3\s*\/\s*13[^}]*grid-row:\s*3/,
];
for (const contract of desktopPlateContracts) {
  if (!contract.test(desktopCss)) fail('styles.css: twaalfkoloms 01–03-plaattrap ontbreekt binnen de desktopmediaquery');
}
if (!/\.platen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[^}]*width:\s*100%/.test(mobileCss)
    || !/\.platen\s*>\s*\.plaat,[^{]*\.platen\s*>\s*\.plaat:nth-child\(3\)\s*\{[^}]*grid-column:\s*auto[^}]*grid-row:\s*auto[^}]*margin:\s*0[^}]*width:\s*100%/.test(mobileCss)) {
  fail('styles.css: volledige lineaire reset van de plaattrap ontbreekt binnen de mobiele mediaquery');
}
if (/\.commandobar__nav\s*\{[^}]*display:\s*none/.test(compactCss)) {
  fail('styles.css: de lokale commandobarnavigatie mag op mobiel niet worden verborgen');
}

// --- progressive enhancement & motion ---
if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/gsap\.min\.js/.test(html)) fail('index.html: gepinde GSAP-CDN ontbreekt');
if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/ScrollTrigger\.min\.js/.test(html)) fail('index.html: gepinde ScrollTrigger-CDN ontbreekt');
if ((html.match(/<script[^>]*\sdefer/g) ?? []).length < 3) fail('index.html: scripts moeten met defer laden');
if (/data-plaat/.test(js) && !/\sdata-plaat[\s>]/.test(html)) {
  fail('index.html: main.js animeert data-plaat-doelen maar de pagina bevat er geen');
}
if (/opacity/.test(js)) fail('main.js: deze variant animeert alleen transforms; opacity-animaties zijn niet toegestaan');
if (/\b(?:pin|snap|scrollTo|autoScroll|parallax)\b/.test(js)) fail('main.js: pinning, snap, automatische scroll en parallax zijn niet toegestaan');
if (!/immediateRender:\s*false/.test(js) || !/once:\s*true/.test(js) || !/overwrite:\s*"auto"/.test(js)) {
  fail('main.js: transform-entrees missen immediateRender/once/overwrite-afspraken');
}
if (/querySelectorAll\("\[data-plaat\]"\)/.test(js)) fail('main.js: generieke beweging van alle data-plaat-vakken is niet toegestaan');
if (!/prefers-reduced-motion/.test(js)) fail('main.js: reduced-motion-guard ontbreekt');
if (!/window\.gsap\s*&&\s*window\.ScrollTrigger|!window\.gsap\s*\|\|\s*!window\.ScrollTrigger/.test(js)) {
  fail('main.js: guard op ontbrekende GSAP/ScrollTrigger ontbreekt');
}
if (!/clearProps/.test(js)) fail('main.js: clearProps-opruiming van inline transforms ontbreekt');
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) fail('styles.css: prefers-reduced-motion-blok ontbreekt');
if (!/:focus-visible/.test(css)) fail('styles.css: zichtbare focusstijl ontbreekt');
if (!/scroll-margin-top/.test(css)) fail('styles.css: scroll-margin-top voor ankersecties ontbreekt');

// --- ontwerpdocument ---
const designPath = 'brutalistisch-a/DESIGN.md';
if (!existsSync(join(root, designPath))) {
  fail(`${designPath}: ontwerpdocument ontbreekt`);
} else {
  const design = read(designPath);
  for (const hoofdstuk of ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion']) {
    if (!new RegExp(`^#{2,3} .*${hoofdstuk}`, 'im').test(design)) fail(`${designPath}: hoofdstuk '${hoofdstuk}' ontbreekt`);
  }
  if (!/Provenance/i.test(design)) fail(`${designPath}: provenance-verklaring (Stitch-status) ontbreekt`);
}

// --- oplevergate: de variant is pas opleverbaar met een geverifieerde huisstijlbron ---
if (brand.status !== 'verified') {
  fail(`brand.json: status is '${brand.status}' — Brutalistisch A kan niet als opgeleverd gelden zolang de huisstijlbron niet 'verified' is (zie assets/brand/README.md); de oplevering is GEBLOKKEERD`);
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Variant Brutalistisch A: alle structurele controles geslaagd.');
