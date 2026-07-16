#!/usr/bin/env node
// Regressiecontrole van variant Brutalistisch A tegen de gedeelde content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-brutalistisch-a.mjs (dependency-vrij, Node-standaardbibliotheek).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors,
  checkBrandGate,
  checkClaims,
  checkContrastUsage,
  checkDesignDoc,
  checkDocumentMetadata,
  checkImages,
  checkLinksAndCtas,
  checkMotionGuards,
  checkNoPdfRuntime,
  checkSectionOrder,
  parseCssRules,
  parseHtmlNodes,
} from './lib/variant-checks.mjs';

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

function hasCssRule(source, selector, expectedDeclarations) {
  return parseCssRules(source).rules.some((rule) => rule.selectors.includes(selector) &&
    Object.entries(expectedDeclarations).every(([property, expected]) => {
      const actual = rule.declarations.get(property) ?? '';
      return typeof expected === 'string' ? actual === expected : expected.test(actual);
    }));
}

const html = read('brutalistisch-a/index.html');
const css = read('brutalistisch-a/styles.css');
const js = read('brutalistisch-a/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- document & structure ---
checkDocumentMetadata(html, fail);
const requiredSections = ['intro', 'visie', 'controlelaag', 'platform', 'controle', 'aanpak', 'bewijs', 'contact'];
checkSectionOrder(html, requiredSections, fail);
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html)) {
  fail('index.html: landmarks header/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');

const htmlNodes = parseHtmlNodes(html);
const sections = htmlNodes.filter((node) => node.tagName === 'section' && node.classes.has('blok'));
const innerWrappers = htmlNodes.filter((node) => node.classes.has('blok__binnen'));
if (innerWrappers.length !== 8) fail(`index.html: verwacht exact acht .blok__binnen-wrappers, gevonden ${innerWrappers.length}`);
for (const sectionId of requiredSections) {
  const section = sections.find((node) => node.attributes.get('id') === sectionId);
  const directWrappers = innerWrappers.filter((node) => node.parent === section);
  if (directWrappers.length !== 1) fail(`index.html: sectie #${sectionId} moet exact één directe .blok__binnen-wrapper hebben`);
}

const sectionCodes = [...html.matchAll(/<p\b(?=[^>]*\bclass="[^"]*\bsectiecode\b[^"]*")[^>]*>([^<]+)<\/p>/g)]
  .map((match) => match[1].trim());
const requiredSectionCodes = ['00 / INTRO', '01 / VISIE', '02 / POSITIE', '03 / PLATFORM', '04 / CONTROLE', '05 / AANPAK', '06 / BEWIJS', '07 / CONTACT'];
if (sectionCodes.join('|') !== requiredSectionCodes.join('|')) {
  fail(`index.html: sectiecodes moeten zichtbaar in de volgorde ${requiredSectionCodes.join(' → ')} staan`);
}

const plateLists = htmlNodes.filter((node) => node.tagName === 'ol' && node.classes.has('platen'));
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
if (plateLists.length !== 1) {
  fail(`index.html: verwacht exact één .platen-lijst, gevonden ${plateLists.length}`);
} else {
  const moduleItems = htmlNodes.filter((node) => node.tagName === 'li' && node.classes.has('plaat') && node.parent === plateLists[0]);
  const foundClaims = moduleItems.map((node) => node.attributes.get('data-claim-id'));
  if (moduleItems.length !== 3) fail(`index.html: verwacht exact drie .plaat-items, gevonden ${moduleItems.length}`);
  if (foundClaims.join('|') !== moduleClaims.join('|')) fail(`index.html: modulevolgorde moet ${moduleClaims.join(' → ')} zijn`);
  if (moduleItems.some((node) => !node.attributes.has('data-plaat'))) {
    fail('index.html: iedere moduleplaat moet de gerichte data-plaat-motionhook behouden');
  }
}

// --- claims ---
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
checkClaims(html, content, { strictVariantTexts, requiredClaims }, fail);
checkLinksAndCtas(html, content, { minCtaCount: 3, minCtaHint: 'commandobar, hero, slot' }, fail);

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
if (/rgba?\(|hsla?\(|color-mix|\btransparent\b|opacity:\s*0(?:\D|$)|visibility\s*:\s*hidden/.test(css)) {
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
const commandobarMobileCss = extractSingleCssBlock(
  css,
  /@media\s*\(\s*max-width\s*:\s*480px\s*\)\s*\{/g,
  'commandobarmediaquery (max-width: 480px)'
).replace(/\s+/g, ' ');
if (!/\.commandobar__binnen\s*\{[^}]*display:\s*grid[^}]*grid-template-areas:\s*"logo cta"\s*"nav nav"/.test(commandobarMobileCss)
    || !/\.commandobar__nav\s*\{[^}]*grid-area:\s*nav[^}]*width:\s*100%/.test(commandobarMobileCss)
    || !/\.commandobar__nav a\s*\{[^}]*width:\s*100%/.test(commandobarMobileCss)
    || !/\.commandobar__nav a\s*\{[^}]*min-height:\s*44px/.test(compactCss)) {
  fail('styles.css: de commandobar mist de zichtbare, tweerijige mobiele navigatie met 44px-doelen');
}
const reducedMotionCss = extractSingleCssBlock(
  css,
  /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/g,
  'reduced-motionmediaquery'
).replace(/\s+/g, ' ');
const displayNoneCount = (css.match(/display\s*:\s*none/g) ?? []).length;
if (displayNoneCount !== 1 || !/\.commandobar__voortgang\s*\{[^}]*display:\s*none/.test(reducedMotionCss)) {
  fail('styles.css: alleen de decoratieve voortgangsbalk mag uitsluitend bij reduced motion worden verborgen');
}
if (/21st\.dev|magic-mcp/i.test(`${html}\n${css}\n${js}`)) {
  fail('brutalistisch-a: 21st.dev mag geen runtime-afhankelijkheid zijn');
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
if (/\b(?:width|height|top|right|bottom|left|margin|padding|filter)\s*:/.test(js)) {
  fail('main.js: motion mag geen layout- of filterproperty animeren');
}
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
