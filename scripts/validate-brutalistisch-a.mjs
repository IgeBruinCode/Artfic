#!/usr/bin/env node
// Regressiecontrole van variant Brutalistisch A tegen de gedeelde content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-brutalistisch-a.mjs (dependency-vrij, Node-standaardbibliotheek).
import { readFileSync } from 'node:fs';
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

const normalizeSelector = (selector) => selector.replace(/\s+/g, ' ').replace(/\s*>\s*/g, '>').trim();
const normalizeCssValue = (value) => value.replace(/\s+/g, '');

function hasExpectedDeclarations(rule, expectedDeclarations) {
  return Object.entries(expectedDeclarations).every(([property, expected]) => {
    const actual = rule.declarations.get(property);
    return actual !== undefined && normalizeCssValue(actual) === normalizeCssValue(expected);
  });
}

function hasCssRule(model, selector, expectedDeclarations) {
  const expectedSelector = normalizeSelector(selector);
  return model.rules.some((rule) => {
    const selectorMatches = rule.selectors.some((candidate) => normalizeSelector(candidate) === expectedSelector);
    return selectorMatches && hasExpectedDeclarations(rule, expectedDeclarations);
  });
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
const htmlNodes = parseHtmlNodes(html);
const landmarkTags = new Set(htmlNodes.map((node) => node.tagName));
if (!['header', 'main', 'footer'].every((tagName) => landmarkTags.has(tagName))) {
  fail('index.html: landmarks header/main/footer zijn niet compleet');
}
if (!htmlNodes.some((node) => node.classes.has('skiplink'))) fail('index.html: skiplink ontbreekt');

const sections = htmlNodes.filter((node) => node.tagName === 'section' && node.classes.has('blok'));
const innerWrappers = htmlNodes.filter((node) => node.classes.has('blok__binnen'));
if (innerWrappers.length !== 8) fail(`index.html: verwacht exact acht .blok__binnen-wrappers, gevonden ${innerWrappers.length}`);
for (const sectionId of requiredSections) {
  const section = sections.find((node) => node.attributes.get('id') === sectionId);
  const directWrappers = innerWrappers.filter((node) => node.parent === section);
  if (directWrappers.length !== 1) fail(`index.html: sectie #${sectionId} moet exact één directe .blok__binnen-wrapper hebben`);
}

const sectionCodes = [...html.matchAll(/<p\b[^>]*>([^<]+)<\/p>/g)]
  .filter((match) => parseHtmlNodes(match[0])[0]?.classes.has('sectiecode'))
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

const cssModel = parseCssRules(css);
const rootContract = {
  '--werkvlak': '1280px',
  '--gutter': 'clamp(16px, 4vw, 48px)',
  '--sectieruimte': 'clamp(64px, 6vw, 88px)',
};
if (!hasCssRule(cssModel, ':root', rootContract)) {
  fail('styles.css: het compacte 1280px-werkvlak met 48px-gutter en 64–88px sectieritme ontbreekt');
}
for (const selector of ['.blok__binnen', '.commandobar__binnen', '.site-footer__binnen']) {
  if (!hasCssRule(cssModel, selector, { 'max-width': 'var(--werkvlak)', 'margin-inline': 'auto' })) {
    fail(`styles.css: ${selector} deelt het gecentreerde werkvlak niet`);
  }
}

const desktopModel = parseCssRules(extractSingleCssBlock(
  css,
  /@media\s*\(\s*min-width\s*:\s*1000px\s*\)\s*\{/g,
  'desktopmediaquery (min-width: 1000px)'
));
const mobileModel = parseCssRules(extractSingleCssBlock(
  css,
  /@media\s*\(\s*max-width\s*:\s*999px\s*\)\s*\{/g,
  'mobiele mediaquery (max-width: 999px)'
));
const desktopPlateContracts = [
  ['.platen', { 'grid-template-columns': 'repeat(12, minmax(0, 1fr))' }],
  ['.platen > .plaat:nth-child(1)', { 'grid-column': '1 / 11', 'grid-row': '1' }],
  ['.platen > .plaat:nth-child(2)', { 'grid-column': '2 / 12', 'grid-row': '2' }],
  ['.platen > .plaat:nth-child(3)', { 'grid-column': '3 / 13', 'grid-row': '3' }],
];
for (const [selector, declarations] of desktopPlateContracts) {
  if (!hasCssRule(desktopModel, selector, declarations)) {
    fail(`styles.css: desktopplaat '${selector}' mist zijn twaalfkoloms positie binnen de 1000px-mediaquery`);
  }
}
if (!hasCssRule(mobileModel, '.platen', { 'grid-template-columns': 'minmax(0, 1fr)', width: '100%' })) {
  fail('styles.css: de plaatlijst mist haar lineaire reset binnen de mobiele mediaquery');
}
for (const selector of ['.platen > .plaat', '.platen > .plaat:nth-child(1)', '.platen > .plaat:nth-child(2)', '.platen > .plaat:nth-child(3)']) {
  if (!hasCssRule(mobileModel, selector, { 'grid-column': 'auto', 'grid-row': 'auto', margin: '0', width: '100%' })) {
    fail(`styles.css: mobiele plaat '${selector}' mist een volledige lineaire reset`);
  }
}

const commandobarMobileModel = parseCssRules(extractSingleCssBlock(
  css,
  /@media\s*\(\s*max-width\s*:\s*767px\s*\)\s*\{/g,
  'commandobarmediaquery (max-width: 767px)'
));
const commandobarContracts = [
  [commandobarMobileModel, '.commandobar__binnen', { display: 'grid', 'grid-template-areas': '"logo cta" "nav nav"' }],
  [commandobarMobileModel, '.commandobar__nav', { 'grid-area': 'nav', width: '100%' }],
  [commandobarMobileModel, '.commandobar__nav a', { width: '100%' }],
  [cssModel, '.commandobar__nav a', { 'min-height': '44px' }],
  [commandobarMobileModel, '#inhoud', { 'scroll-margin-top': '116px' }],
  [commandobarMobileModel, '.blok', { 'scroll-margin-top': '116px' }],
];
if (!commandobarContracts.every(([model, selector, declarations]) => hasCssRule(model, selector, declarations))) {
  fail('styles.css: de commandobar mist onder 768px de tweerijenlayout, 44px-doelen of passende ankeroffset');
}

const reducedMotionModel = parseCssRules(extractSingleCssBlock(
  css,
  /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/g,
  'reduced-motionmediaquery'
));
const hiddenRules = cssModel.rules.filter((rule) => normalizeCssValue(rule.declarations.get('display') ?? '') === 'none');
const onlyProgressIsHidden = hiddenRules.length === 1 &&
  hiddenRules[0].selectors.some((selector) => normalizeSelector(selector) === '.commandobar__voortgang');
if (!onlyProgressIsHidden || !hasCssRule(reducedMotionModel, '.commandobar__voortgang', { display: 'none' })) {
  fail('styles.css: alleen de decoratieve voortgangsbalk mag uitsluitend bij reduced motion worden verborgen');
}
if (/21st\.dev|magic-mcp/i.test(`${html}\n${css}\n${js}`)) {
  fail('brutalistisch-a: 21st.dev mag geen runtime-afhankelijkheid zijn');
}

// --- progressive enhancement & motion ---
checkMotionGuards(html, css, js, fail);
if (/data-plaat/.test(js) && !htmlNodes.some((node) => node.attributes.has('data-plaat'))) {
  fail('index.html: main.js animeert data-plaat-doelen maar de pagina bevat er geen');
}
if (/\b(?:pin|snap|scrollTo|autoScroll|parallax)\b/.test(js)) fail('main.js: pinning, snap, automatische scroll en parallax zijn niet toegestaan');
if (/\b(?:width|height|top|right|bottom|left|margin|padding|filter)\s*:/.test(js)) {
  fail('main.js: motion mag geen layout- of filterproperty animeren');
}
if (!/immediateRender:\s*false/.test(js) || !/once:\s*true/.test(js) || !/overwrite:\s*"auto"/.test(js)) {
  fail('main.js: transform-entrees missen immediateRender/once/overwrite-afspraken');
}
if (/querySelectorAll\("\[data-plaat\]"\)/.test(js)) fail('main.js: generieke beweging van alle data-plaat-vakken is niet toegestaan');
if (!/addEventListener\(\s*["']change["']/.test(js) || !/scrollTrigger[\s\S]*\.kill\(\)/.test(js)) {
  fail('main.js: een tijdens de sessie ingeschakelde reduced-motion-voorkeur moet actieve ScrollTriggers stoppen');
}

// --- ontwerpdocument & brandgate ---
const designPath = 'brutalistisch-a/DESIGN.md';
checkDesignDoc(root, designPath, () => read(designPath), ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion'], fail);
checkBrandGate(brand, 'Brutalistisch A', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Variant Brutalistisch A: alle structurele controles geslaagd.');
