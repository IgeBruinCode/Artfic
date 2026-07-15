#!/usr/bin/env node
// Regressiecontrole van de minimalistische variant tegen de gedeelde content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-minimalistisch.mjs (dependency-vrij, Node-standaardbibliotheek).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), 'utf8');

const html = read('minimalistisch/index.html');
const css = read('minimalistisch/styles.css');
const js = read('minimalistisch/main.js');
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
// (cijfers, compliance, letterlijke citaten) de check laat falen in plaats van alleen het claim-ID.
// De vergelijking gebeurt per element dat het claim-ID draagt, niet tegen de hele pagina —
// dezelfde tekst elders op de pagina kan een gewijzigd claimelement dus niet maskeren.
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
    claimScopes.set(id, `${claimScopes.get(id) ?? ''} ${inner}`);
  }
}
const strictVariantTexts = {
  'pos-besparing-30': ['bespaar 30% van je tijd met één AI-platform'],
  'pos-nederlands': ['Gebouwd door Nederlandse AI-professionals. NL-gehost, AVG-proof en snel inzetbaar.'],
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
  // Direct citaat: letterlijk gelijk aan content/sources/artific.nl.md#h-quote-leqqr.
  'bw-quote-leqqr': ['"De Artific AI-Assistent werkt als een trein. In drie weken tijd hebben we al een enorme bespaard op personele kosten en de kwaliteit van onze support is alleen maar beter geworden." — Arjan Zwarteveen, Senior Marketeer Leqqr'],
};
for (const id of usedClaims) {
  if (!knownClaims.get(id)?.strict) continue;
  const snippets = strictVariantTexts[id];
  if (!snippets) { fail(`index.html: strikte claim '${id}' heeft geen vastgelegde varianttekst in deze validator`); continue; }
  const scope = normalize(claimScopes.get(id) ?? '');
  for (const snippet of snippets) {
    if (!scope.includes(normalize(snippet))) fail(`index.html: zichtbare tekst binnen het element met strikte claim '${id}' wijkt af van de vastgelegde varianttekst: '${snippet}'`);
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
// Toegestane externe bestemmingen: de canonieke footerlinks plus alle CTA-kaartbestemmingen.
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
if (ctaCount < 3) fail(`index.html: verwacht minimaal 3 CTA-voorkomens (header, hero, slot), gevonden: ${ctaCount}`);

// --- afbeeldingen: alleen goedgekeurde lokale logo's ---
const allowedImages = new Set(brand.logos.map((l) => `../assets/brand/${l.file}`));
for (const [, src] of html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) {
  if (!allowedImages.has(src)) fail(`index.html: afbeelding '${src}' is geen goedgekeurd lokaal logo`);
  if (!existsSync(join(root, 'minimalistisch', src))) fail(`index.html: afbeelding '${src}' bestaat niet`);
}

// --- kleuren: uitsluitend uit brand.json, in CSS én HTML ---
const allowedHex = new Set(brand.colors.map((c) => c.value.toUpperCase()));
for (const [file, text] of [['styles.css', css], ['index.html', html], ['main.js', js]]) {
  for (const [hex] of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    if (!allowedHex.has(hex.toUpperCase())) fail(`${file}: kleur '${hex}' staat niet in brand.json`);
  }
}
if (/rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: afgeleide/transparante kleuren of standaard-verborgen inhoud zijn niet toegestaan');
}

// --- progressive enhancement & motion ---
if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/gsap\.min\.js/.test(html)) fail('index.html: gepinde GSAP-CDN ontbreekt');
if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/ScrollTrigger\.min\.js/.test(html)) fail('index.html: gepinde ScrollTrigger-CDN ontbreekt');
if ((html.match(/<script[^>]*\sdefer/g) ?? []).length < 3) fail('index.html: scripts moeten met defer laden');
if (/data-reveal/.test(js) && !/\sdata-reveal[\s>]/.test(html)) {
  fail('index.html: main.js implementeert data-reveal-scrollreveals maar de pagina bevat geen enkel data-reveal-doel');
}
if (!/prefers-reduced-motion/.test(js)) fail('main.js: reduced-motion-guard ontbreekt');
if (!/window\.gsap\s*&&\s*window\.ScrollTrigger|!window\.gsap\s*\|\|\s*!window\.ScrollTrigger/.test(js)) {
  fail('main.js: guard op ontbrekende GSAP/ScrollTrigger ontbreekt');
}
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) fail('styles.css: prefers-reduced-motion-blok ontbreekt');
if (!/:focus-visible/.test(css)) fail('styles.css: zichtbare focusstijl ontbreekt');
if (!/scroll-margin-top/.test(css)) fail('styles.css: scroll-margin-top voor ankersecties ontbreekt');

// --- ontwerpdocument ---
const designPath = 'minimalistisch/DESIGN.md';
if (!existsSync(join(root, designPath))) {
  fail(`${designPath}: ontwerpdocument ontbreekt`);
} else {
  const design = read(designPath);
  for (const hoofdstuk of ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijlen', 'Bewegingsprincipes']) {
    if (!new RegExp(`^#{2,3} .*${hoofdstuk}`, 'im').test(design)) fail(`${designPath}: hoofdstuk '${hoofdstuk}' ontbreekt`);
  }
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Minimalistische variant: alle structurele controles geslaagd.');
