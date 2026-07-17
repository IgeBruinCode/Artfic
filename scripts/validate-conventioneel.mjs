#!/usr/bin/env node
// Regressiecontrole van variant Conventioneel (trust-center SaaS) tegen de gedeelde bron.
// Gebruik: node scripts/validate-conventioneel.mjs (dependency-vrij, Node-standaardbibliotheek).
// Gedeelde trust-boundarychecks staan in scripts/lib/variant-checks.mjs; hieronder alleen de
// variant-specifieke structuur van deze compositie.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors, checkBrandGate, checkClaims, checkContrastUsage, checkCustomerReviews, checkDesignDoc, checkDocumentMetadata,
  checkImages, checkLinksAndCtas, checkMotionGuards, checkNoPdfRuntime, checkSectionOrder,
  extractSingleCssBlock, hasCssRule, parseCssRules, parseHtmlNodes,
} from './lib/variant-checks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), 'utf8');

const html = read('conventioneel/index.html');
const css = read('conventioneel/styles.css');
const js = read('conventioneel/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- document, metadata & sectievolgorde ---
checkDocumentMetadata(html, fail);
const requiredSections = ['intro', 'vertrouwen', 'visie', 'controlelaag', 'platform', 'governance', 'aanpak', 'contact'];
checkSectionOrder(html, requiredSections, fail);
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html) || !/<aside[\s>]/.test(html)) {
  fail('index.html: landmarks header/main/aside/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');

// --- eigen trust-center-structuur: sticky SaaS-header, gekoppelde console,
// --- bewijsrail, brede moduletrap, assurance-register en vijf stappen ---
const nodes = parseHtmlNodes(html);
const nodesWithClass = (token) => nodes.filter((node) => node.classes.has(token));
const directChildrenWithClass = (parent, token) =>
  nodes.filter((node) => node.parent === parent && node.classes.has(token));
const hasExactValues = (actual, expected) =>
  actual.length === expected.length && actual.every((value, index) => value === expected[index]);
const isDescendantOf = (node, ancestor) => {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent === ancestor) return true;
  }
  return false;
};
const cssModel = parseCssRules(css);

const headers = nodesWithClass('saas-header');
if (headers.length !== 1) fail(`index.html: verwacht exact één saas-header, gevonden ${headers.length}`);
if (!hasCssRule(cssModel, '.saas-header', { position: 'sticky', top: '0' })) {
  fail('styles.css: de saas-header hoort sticky aan de bovenzijde te zijn');
}
const navs = nodesWithClass('saas-header__nav');
const expectedNavHrefs = ['#vertrouwen', '#visie', '#platform', '#governance', '#aanpak'];
const navLinks = navs.length === 1
  ? nodes.filter((node) => node.tagName === 'a' && isDescendantOf(node, navs[0]))
  : [];
const navHrefs = navLinks.map((node) => node.attributes.get('href'));
if (navs.length !== 1 || !hasExactValues(navHrefs, expectedNavHrefs)) {
  fail(`index.html: headernavigatie moet exact vijf lokale links in vaste volgorde bevatten (${expectedNavHrefs.join(', ')})`);
}
for (const href of navHrefs) {
  if (!href?.startsWith('#') || !nodes.some((node) => node.attributes.get('id') === href.slice(1))) {
    fail(`index.html: navigatieanker '${href}' wijst naar een niet-bestaand ID`);
  }
}

const consoles = nodesWithClass('trust-console');
if (consoles.length !== 1) fail('index.html: verwacht exact één trust-console');
if (nodesWithClass('trust-console__laag').length !== 3) {
  fail('index.html: de trust-console hoort drie lagen (modellen → Artific → processen) te tonen');
}
const statusLists = nodesWithClass('trust-console__status');
const expectedStatusHrefs = ['#assurance-eu', '#assurance-iso', '#platform', '#assurance-model'];
const statusLinks = statusLists.length === 1
  ? nodes.filter((node) => node.tagName === 'a' && isDescendantOf(node, statusLists[0]))
  : [];
if (!hasExactValues(statusLinks.map((node) => node.attributes.get('href')), expectedStatusHrefs)) {
  fail(`index.html: de vier consolelinks moeten naar ${expectedStatusHrefs.join(', ')} wijzen`);
}
if (nodesWithClass('bewijsrail').length !== 1 || nodesWithClass('bewijsrail__item').length !== 3) {
  fail('index.html: verwacht één bewijsrail met exact drie bewijsitems');
}

const modules = nodesWithClass('modules');
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
const moduleCards = modules.length === 1 ? directChildrenWithClass(modules[0], 'module-card') : [];
if (modules.length !== 1 || !hasExactValues(
  moduleCards.map((node) => node.attributes.get('data-claim-id')),
  moduleClaims,
)) {
  fail('index.html: verwacht exact drie directe module-cards in canonieke volgorde');
}

const assurance = nodesWithClass('assurance-matrix');
const expectedAssurance = [
  ['assurance-eu', 'sec-eu'],
  ['assurance-iso', 'sec-iso'],
  ['assurance-pseudonimisering', 'sec-pseudo'],
  ['assurance-model', 'sec-model-agnostisch'],
  ['assurance-toegang', 'sec-access'],
  ['assurance-audit', 'sec-audit'],
];
const assuranceItems = assurance.length === 1 ? directChildrenWithClass(assurance[0], 'assurance-matrix__item') : [];
if (assurance.length !== 1 || assuranceItems.length !== 6 || assuranceItems.some((node, index) =>
  node.attributes.get('id') !== expectedAssurance[index][0] ||
  node.attributes.get('data-claim-id') !== expectedAssurance[index][1]
)) {
  fail('index.html: assurance-register moet exact zes ge-ID’de canonieke items in vaste volgorde bevatten');
}
if (nodesWithClass('stappen__stap').length !== 5) fail('index.html: verwacht exact vijf implementatiestappen');

const desktopModulesCss = extractSingleCssBlock(css, /@media\s*\(min-width:\s*1024px\)\s*{/g, 'module-desktopquery vanaf 1024px', fail);
const desktopModulesModel = parseCssRules(desktopModulesCss);
if (!hasCssRule(desktopModulesModel, '.modules', { 'grid-template-columns': 'repeat(12, minmax(0, 1fr))' })) {
  fail('styles.css: .modules mist het twaalfkoloms desktopgrid vanaf 1024px');
}
for (const [index, column, row] of [[1, '1 / 11', '1'], [2, '2 / 12', '2'], [3, '3 / 13', '3']]) {
  if (!hasCssRule(desktopModulesModel, `.module-card:nth-child(${index})`, { 'grid-column': column, 'grid-row': row })) {
    fail(`styles.css: module ${index} mist desktopplaatsing ${column} op rij ${row}`);
  }
}
const mobileModulesCss = extractSingleCssBlock(css, /@media\s*\(max-width:\s*1023px\)\s*{/g, 'module-reset t/m 1023px', fail);
const mobileModulesModel = parseCssRules(mobileModulesCss);
if (!hasCssRule(mobileModulesModel, '.modules', { 'grid-template-columns': 'minmax(0, 1fr)' }) ||
    !hasCssRule(mobileModulesModel, '.module-card', {
      display: 'block', 'grid-column': '1 / -1', 'grid-row': 'auto', width: '100%', margin: '0',
    }) ||
    !hasCssRule(mobileModulesModel, '.module-card__kop', { display: 'block', width: '100%', margin: '0' }) ||
    !hasCssRule(mobileModulesModel, '.module-card__inhoud', { display: 'block', width: '100%', margin: '0' })) {
  fail('styles.css: volledige lineaire module-reset t/m 1023px ontbreekt');
}

// Verbod op signaturen van zustervarianten: dit blijft een zelfstandige SaaS-compositie.
for (const [file, text] of [['index.html', html], ['styles.css', css], ['main.js', js]]) {
  for (const signatuur of [
    'commandobar', 'sectiecode', 'plaat', 'folio', 'register', 'spread', 'margewoord',
    'boekdeel', 'dossierregel', 'evidence-index', 'assurance-ledger',
  ]) {
    if (new RegExp(`(class="[^"]*|\\.)${signatuur}(?![A-Za-z])`).test(text)) {
      fail(`${file}: zustervariant-signatuur '${signatuur}' hoort niet in variant Conventioneel`);
    }
  }
}
if (/<svg/i.test(html)) fail('index.html: inline SVG is niet toegestaan; alleen lokale logo-bestanden');
if (/21st\.dev/i.test(`${html}\n${css}\n${js}`)) fail('runtimebestanden: 21st.dev-runtimeverwijzing is niet toegestaan');
if (/linear-gradient|radial-gradient|conic-gradient|blur\(|rgba?\(|hsla?\(|color-mix|(?:box|text)-shadow\s*:|\bfilter\s*:/i.test(css)) {
  fail('styles.css: gradients, blur/filter, schaduwen of transparante/afgeleide kleuren zijn niet toegestaan');
}
if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$)/i.test(css)) {
  fail('styles.css: inhoud of navigatie mag niet standaard of responsief worden verborgen');
}

// --- claims (gedeeld, met per-variant vastgelegde strikte teksten) ---
checkClaims(html, content, {
  strictVariantTexts: {
    'pos-besparing-30': ['Bespaar 30% van je tijd met één AI-platform.'],
    'pos-nederlands': ['Door Nederlandse AI-professionals gebouwd; NL-gehost, AVG-proof en snel inzetbaar.'],
    'pos-badges': ['EU-gehost', 'ISO 27001 gecertificeerd', 'API-first', 'Model-agnostisch'],
    'pos-usps': ['AVG-proof & NL-gehost, taalmodel- en tool-onafhankelijk, mensgericht.'],
    'pos-award': ['Artific is uitgeroepen tot AI Company of the Year 2025 tijdens de Nationale AI Awards.'],
    'sec-eu': ['Alle data, alle infrastructuur, alle processing binnen de EU.'],
    'sec-iso': ['Onafhankelijke audit van het informatiebeveiligingssysteem, continu onderhouden.'],
    'sec-pseudo': ['Persoonlijk identificeerbare informatie (PII) wordt gedetecteerd en gepseudonimiseerd voordat het ooit een model bereikt.'],
    'sec-audit': ['Elke prompt, elke tool-call, elke beslissing wordt vastgelegd in het systeem.'],
    'bo-aftercare': ['Na livegang blijven we betrokken: monitoring, optimalisatie en minimaal één update-sync-meeting per kwartaal.'],
    'bo-support': ['Met 1e-, 2e- en 3e-lijns support ben je altijd verzekerd van de juiste ondersteuning.'],
    'bw-100-klanten': ['We helpen meer dan 100 klanten om AI voor hen te laten werken — van enterprise tot overheid, bij organisaties die security, governance en betrouwbaarheid serieus nemen.'],
    'bw-klantnamen': ['Klanten zijn onder meer Basic-Fit, Eneco, Marktplaats, hollandsnieuwe, Gemeente Den Haag, RTV Oost, Veiligheidsregio Zuid-Limburg en Vechtsteden Notarissen.'],
    'bw-quote-leqqr': ['De Artific AI-Assistent werkt als een trein. In drie weken tijd hebben we al een enorme bespaard op personele kosten en de kwaliteit van onze support is alleen maar beter geworden.'],
  },
  requiredClaims: [
    'pos-belofte', 'pos-agentic-platform', 'pos-badges', 'pos-nederlands', 'pos-award',
    'dm-kop', 'dm-potentieel-risico', 'vvt-veilig', 'vvt-voorspelbaar', 'vvt-transparant', 'vvt-antwoord',
    'reis-overzicht', 'reis-fase-1', 'reis-fase-2', 'reis-fase-3',
    'ctl-positie', 'ctl-tussen-model-en-proces', 'ctl-wat-we-bouwen', 'ctl-wat-we-niet-bouwen',
    'mod-overzicht', 'mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation',
    'ph-keuze', 'ph-portal', 'ph-headless',
    'cc-een-plek', 'cc-it-kaders', 'cc-teams',
    'sec-ontwerp', 'sec-eu', 'sec-iso', 'sec-pseudo', 'sec-model-agnostisch', 'sec-access', 'sec-audit',
    'pm-markt', 'pm-laag-artific', 'pm-laag-partners', 'pm-laag-klanten',
    'bo-vijf-stappen', 'bo-aftercare', 'bo-support',
    'bw-100-klanten', 'bw-klantnamen', 'cv-versnellen',
  ],
}, fail);

// --- links, CTA's, afbeeldingen & kleuren (gedeeld) ---
checkLinksAndCtas(html, content, { minCtaCount: 5, minCtaHint: 'header, hero (2×), slot (2×)' }, fail);
checkImages(html, css, brand, root, 'conventioneel', fail);
checkCustomerReviews(html, fail);
if ((html.match(/\sdata-company-logo(?=\s|>)/g) ?? []).length !== 9 || !/data-company-slider/.test(html) || !/animation:\s*company-loop-conventional/.test(css)) {
  fail('bedrijven-slideshow: verwacht negen lokale klantlogo’s in de bewegende SaaS-rail');
}
// Logo-uitvoering: blauw logo alleen in de lichte header, wit logo alleen in de donkere footer.
if (!/saas-header[\s\S]*artific-logo-blauw\.svg/.test(html)) fail('index.html: de lichte header hoort het blauwe logo te dragen');
if (!/saas-footer[\s\S]*artific-logo-wit\.svg/.test(html)) fail('index.html: de donkere footer hoort het witte logo te dragen');
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
checkContrastUsage(html, css, brand, [
  { foregroundSelector: 'body', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.skiplink', backgroundSelector: '.skiplink', pairId: 'wit-op-navy' },
  { foregroundSelector: '::selection', backgroundSelector: '::selection', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.saas-header__nav a', backgroundSelector: '.saas-header', pairId: 'navy-op-wit' },
  { foregroundSelector: '.cta--primair', backgroundSelector: '.cta--primair', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--primair:hover', backgroundSelector: '.cta--primair:hover', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--secundair:hover', backgroundSelector: '.cta--secundair:hover', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.cta--accent', backgroundSelector: '.cta--accent', pairId: 'navy-op-geel' },
  { foregroundSelector: '.cta--omlijnd', backgroundSelector: '.sectie--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--omlijnd:hover', backgroundSelector: '.cta--omlijnd:hover', pairId: 'wit-op-navy' },
  { foregroundSelector: '.eyebrow', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.hero__noot', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.sectie--tint', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: 'body', backgroundSelector: '.trust-console', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: 'body', backgroundSelector: '.trust-console__laag', pairId: 'navy-op-wit' },
  { foregroundSelector: '.trust-console__laag--artific', backgroundSelector: '.trust-console__laag--artific', pairId: 'wit-op-navy' },
  { foregroundSelector: '.trust-console__status a', backgroundSelector: '.trust-console__status a', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.paneel', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.assurance-matrix__item', pairId: 'navy-op-wit' },
  { foregroundSelector: '.stappen__stap h4::before', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.module-card__nummer', backgroundSelector: '.module-card', pairId: 'navy-op-wit' },
  { foregroundSelector: '.sectie--donker', backgroundSelector: '.sectie--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.saas-footer', backgroundSelector: '.saas-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.saas-footer__links a', backgroundSelector: '.saas-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.bewijsrail__cijfer', backgroundSelector: '.bewijsrail__item', pairId: 'blauw-op-wit-groot' },
  { foregroundSelector: 'body', backgroundSelector: '.klantnamen', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.company-showcase', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.company-tile', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.customer-story', pairId: 'navy-op-wit' },
  { foregroundSelector: '.customer-story--featured', backgroundSelector: '.customer-story--featured', pairId: 'wit-op-navy' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);

// --- progressive enhancement & gerichte transform-motion ---
checkMotionGuards(html, css, js, fail);
for (const hook of ['bewijs', 'modules', 'assurance']) {
  if (!html.includes(`data-motion-group="${hook}"`) || !js.includes(`data-motion-group="${hook}"`)) {
    fail(`HTML/main.js: gerichte motiongroep '${hook}' ontbreekt of is niet gekoppeld`);
  }
}
if (!/\sdata-verbinding[\s>]/.test(html) || !/data-verbinding/.test(js)) {
  fail('HTML/main.js: gerichte consoleverbinding-motion ontbreekt');
}
if (/\b(?:opacity|filter|clipPath|height|width|top|left|margin|padding)\s*:/.test(js)) {
  fail('main.js: motion mag uitsluitend transform-properties gebruiken');
}
if (/\b(?:pin|scrub|toggleActions|repeat)\s*:|ScrollToPlugin|scrollTo\s*:/.test(js)) {
  fail('main.js: pinning, scrub, herhaling of automatische scroll is niet toegestaan');
}
for (const contract of ['immediateRender: false', 'once: true', 'overwrite: "auto"', 'clearProps: "transform"']) {
  if (!js.includes(contract)) fail(`main.js: motioncontract '${contract}' ontbreekt`);
}
if (!/addEventListener\("change"/.test(js) || !/stopMotion/.test(js) || !/\.kill\(\)/.test(js) ||
    !/removeProperty\("transform"\)/.test(js) || !/removeAttribute\("aria-current"\)/.test(js)) {
  fail('main.js: dynamische reduced-motion-opruiming van triggers, transforms en navigatiestatus ontbreekt');
}
if (!/aria-current/.test(js)) fail('main.js: navigatiestatus via aria-current ontbreekt');

// --- ontwerpdocument & oplevergate ---
const designPath = 'conventioneel/DESIGN.md';
const designExists = existsSync(join(root, designPath));
const design = designExists ? read(designPath) : '';
checkDesignDoc(root, designPath, () => design,
  ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion', 'Responsief gedrag'], fail);

if (designExists) {
  if (!/gefinaliseerd via Google Stitch-MCP/i.test(design)) fail('DESIGN.md: provenance verklaart niet dat het document via de Google Stitch-MCP is gefinaliseerd');
  if (!/Stitch-project\s*`\d{15,}`/.test(design)) fail('DESIGN.md: concreet Stitch-project-ID ontbreekt in de provenance');
  if (!/screen\s*`\d{10,}`/.test(design)) fail('DESIGN.md: concreet Stitch-screen-ID ontbreekt in de provenance');
  if (!/design system\s*`assets\/[0-9a-f]{32}`/.test(design)) fail('DESIGN.md: concreet Stitch-design-system-ID ontbreekt in de provenance');
  if (/niet beschikbaar|blijft (expliciet )?open|niet als Stitch-output|handmatig opgesteld/i.test(design)) {
    fail('DESIGN.md: provenance meldt een open of mislukte Stitch-status; de finalisatie is niet afgerond');
  }
}
checkBrandGate(brand, 'Conventioneel', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('Variant Conventioneel: alle structurele controles geslaagd.');
