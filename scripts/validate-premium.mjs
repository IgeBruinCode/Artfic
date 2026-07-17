#!/usr/bin/env node
// Regressiecontrole van variant Premium (executive evidence dossier) tegen de gedeelde bron.
// Gebruik: node scripts/validate-premium.mjs (dependency-vrij, Node-standaardbibliotheek).
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

const html = read('premium/index.html');
const css = read('premium/styles.css');
const js = read('premium/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- document, metadata & sectievolgorde ---
checkDocumentMetadata(html, fail);
const requiredSections = ['intro', 'bewijs', 'visie', 'controlelaag', 'platform', 'governance', 'aanpak', 'contact'];
checkSectionOrder(html, requiredSections, fail);
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html)) {
  fail('index.html: landmarks header/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');

// --- eigen dossierstructuur: statische donkere header, gerichte evidencegroepen,
// --- brede moduletrap, assurance-ledger en vijf begeleidingsstappen ---
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

const headers = nodesWithClass('premium-header');
if (headers.length !== 1) fail(`index.html: verwacht exact één premium-header, gevonden ${headers.length}`);
if (!hasCssRule(cssModel, '.premium-header', { position: 'static' })) {
  fail('styles.css: de premium-header hoort expliciet statisch in de documentflow te staan');
}
for (const rule of cssModel.rules) {
  if (!rule.selectors.some((selector) => selector.includes('.premium-header'))) continue;
  if (['sticky', 'fixed'].includes(rule.declarations.get('position'))) {
    fail('styles.css: geen enkele premium-header-regel mag sticky of fixed positioneren');
  }
}
const navs = nodesWithClass('premium-header__nav');
const expectedNavHrefs = ['#bewijs', '#visie', '#platform', '#governance', '#aanpak'];
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
for (const rule of cssModel.rules) {
  if (!rule.selectors.some((selector) => selector.includes('.premium-header__nav'))) continue;
  if (rule.declarations.get('display') === 'none' || rule.declarations.get('visibility') === 'hidden') {
    fail('styles.css: de lokale headernavigatie mag op geen enkele breedte worden verborgen');
  }
}

const evidence = nodesWithClass('evidence-index');
if (evidence.length !== 1 || directChildrenWithClass(evidence[0], 'evidence-index__regel').length !== 5) {
  fail('index.html: verwacht één evidence-index met exact vijf directe bewijsregels');
}
const maturity = nodesWithClass('maturity-track');
if (maturity.length !== 1 || directChildrenWithClass(maturity[0], 'maturity-track__fase').length !== 3) {
  fail('index.html: verwacht één maturity-track met exact drie directe fasen');
}
const architecture = nodesWithClass('controle-architectuur');
if (architecture.length !== 1 || directChildrenWithClass(architecture[0], 'controle-architectuur__laag').length !== 3) {
  fail('index.html: verwacht één controle-architectuur met drie directe lagen');
}
const modules = nodesWithClass('module-sequence');
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
const moduleItems = modules.length === 1 ? directChildrenWithClass(modules[0], 'module-sequence__hoofdstuk') : [];
if (modules.length !== 1 || !hasExactValues(
  moduleItems.map((node) => node.attributes.get('data-claim-id')),
  moduleClaims,
)) {
  fail('index.html: verwacht exact drie directe modulehoofdstukken in canonieke volgorde');
}
const assurance = nodesWithClass('assurance-ledger');
const assuranceClaims = ['sec-eu', 'sec-iso', 'sec-pseudo', 'sec-model-agnostisch', 'sec-access', 'sec-audit'];
const assuranceItems = assurance.length === 1 ? directChildrenWithClass(assurance[0], 'assurance-ledger__item') : [];
if (assurance.length !== 1 || !hasExactValues(
  assuranceItems.map((node) => node.attributes.get('data-claim-id')),
  assuranceClaims,
)) {
  fail('index.html: assurance-ledger moet exact zes canonieke items in vaste volgorde bevatten');
}
if (nodesWithClass('begeleiding__stap').length !== 5) fail('index.html: verwacht exact vijf begeleidingsstappen');
if (nodes.filter((node) => node.attributes.has('data-motion-heading')).length !== 8) {
  fail('index.html: de acht hoofdheadings moeten exact de gerichte motionhook dragen');
}
for (const group of ['evidence', 'maturity', 'controle', 'modules', 'assurance']) {
  if (nodes.filter((node) => node.attributes.get('data-motion-group') === group).length !== 1) {
    fail(`index.html: verwacht exact één gerichte motiongroep '${group}'`);
  }
}

const desktopCss = extractSingleCssBlock(css, /@media\s*\(min-width:\s*1040px\)\s*{/g, 'dossiergrid vanaf 1040px', fail);
const desktopModel = parseCssRules(desktopCss);
if (!hasCssRule(desktopModel, '.boekdeel > .kader', {
  display: 'grid', 'grid-template-columns': 'repeat(12, minmax(0, 1fr))', 'column-gap': 'var(--r-3)',
})) {
  fail('styles.css: het algemene twaalfkoloms dossiergrid met 24px gutter ontbreekt vanaf 1040px');
}
if (!hasCssRule(desktopModel, '.module-sequence', {
  display: 'grid', 'grid-template-columns': 'repeat(12, minmax(0, 1fr))',
})) {
  fail('styles.css: .module-sequence mist het twaalfkoloms desktopgrid vanaf 1040px');
}
for (const [index, column, row] of [[1, '1 / 11', '1'], [2, '2 / 12', '2'], [3, '3 / 13', '3']]) {
  if (!hasCssRule(desktopModel, `.module-sequence__hoofdstuk:nth-child(${index})`, {
    'grid-column': column, 'grid-row': row,
  })) {
    fail(`styles.css: module ${index} mist desktopplaatsing ${column} op rij ${row}`);
  }
}
const mobileCss = extractSingleCssBlock(css, /@media\s*\(max-width:\s*1039px\)\s*{/g, 'lineaire module-reset t/m 1039px', fail);
const mobileModel = parseCssRules(mobileCss);
if (!hasCssRule(mobileModel, '.module-sequence', {
  display: 'grid', 'grid-template-columns': 'minmax(0, 1fr)', 'grid-template-rows': 'auto',
  width: '100%', 'margin-left': '0', 'margin-right': '0',
}) || !hasCssRule(mobileModel, '.module-sequence__hoofdstuk', {
  display: 'block', 'grid-column': '1 / -1', 'grid-row': 'auto', width: '100%', margin: '0',
})) {
  fail('styles.css: volledige lineaire module-reset t/m 1039px ontbreekt');
}

const moduleItemSelector = (selector) => {
  const token = '.module-sequence__hoofdstuk';
  const index = selector.lastIndexOf(token);
  if (index === -1) return false;
  const suffix = selector.slice(index + token.length).trim();
  return suffix === '' || /^[:.#\[]/.test(suffix);
};
const modulePlacementProperties = new Set([
  'grid-area', 'grid-column', 'grid-column-start', 'grid-column-end',
  'grid-row', 'grid-row-start', 'grid-row-end',
  'width', 'min-width', 'max-width', 'inline-size', 'min-inline-size', 'max-inline-size',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',
  'left', 'right', 'inset', 'inset-inline', 'inset-inline-start', 'inset-inline-end',
  'translate', 'transform', 'justify-self', 'order', 'position',
]);
const placementDeclarations = (rule) => [...rule.declarations]
  .filter(([property]) => modulePlacementProperties.has(property));

const cssOutsideModuleQueries = css.replace(desktopCss, '').replace(mobileCss, '');
for (const rule of parseCssRules(cssOutsideModuleQueries).rules) {
  if (!rule.selectors.some(moduleItemSelector)) continue;
  for (const [property] of placementDeclarations(rule)) {
    fail(`styles.css: module-itemplaatsing '${property}' is uitsluitend toegestaan binnen de 1040px-desktopquery of 1039px-reset`);
  }
}

const safeMobilePlacement = new Map([
  ['grid-column', '1/-1'],
  ['grid-row', 'auto'],
  ['width', '100%'], ['inline-size', '100%'],
  ['margin', '0'],
  ['margin-top', '0'], ['margin-right', '0'], ['margin-bottom', '0'], ['margin-left', '0'],
  ['margin-block', '0'], ['margin-block-start', '0'], ['margin-block-end', '0'],
  ['margin-inline', '0'], ['margin-inline-start', '0'], ['margin-inline-end', '0'],
  ['left', 'auto'], ['right', 'auto'],
  ['inset', 'auto'], ['inset-inline', 'auto'], ['inset-inline-start', 'auto'], ['inset-inline-end', 'auto'],
  ['translate', 'none'], ['transform', 'none'], ['justify-self', 'stretch'],
]);
for (const rule of mobileModel.rules) {
  if (!rule.selectors.some(moduleItemSelector)) continue;
  for (const [property, value] of placementDeclarations(rule)) {
    const expected = safeMobilePlacement.get(property);
    if (expected === undefined || value.replace(/\s+/g, '') !== expected) {
      fail(`styles.css: conflicterende mobiele moduleplaatsing '${property}: ${value}' overschrijft de lineaire 1039px-reset`);
    }
  }
}

const tabletEvidenceCss = extractSingleCssBlock(css, /@media\s*\(max-width:\s*768px\)\s*{/g, 'evidence-reset t/m exact 768px', fail);
const tabletEvidenceModel = parseCssRules(tabletEvidenceCss);
if (/\.premium-header/.test(tabletEvidenceCss)) {
  fail('styles.css: de componentreset op 768px mag de aparte vijf-link-headerindeling niet wijzigen');
}
if (!hasCssRule(tabletEvidenceModel, '.evidence-index__regel', {
  'grid-template-columns': 'minmax(180px, 4fr) minmax(0, 8fr)',
}) || !hasCssRule(tabletEvidenceModel, '.maturity-track', {
  'grid-template-columns': 'minmax(0, 1fr)',
}) || !hasCssRule(tabletEvidenceModel, '.controle-architectuur', {
  'grid-template-columns': 'minmax(0, 1fr)',
})) {
  fail('styles.css: evidence-index, maturity-track en controle-architectuur missen hun leesbare reset op exact 768px');
}

// Premium blijft een zelfstandig dossier zonder card-, tabloid- of blueprintsignaturen.
for (const [file, text] of [['index.html', html], ['styles.css', css], ['main.js', js]]) {
  for (const signatuur of [
    'commandobar', 'sectiecode', 'plaat', 'folio', 'register', 'spread', 'margewoord',
    'trust-console', 'bewijsrail', 'module-card', 'saas-header',
  ]) {
    if (new RegExp(`(class="[^"]*|\\.)${signatuur}(?![A-Za-z])`).test(text)) {
      fail(`${file}: zustervariant-signatuur '${signatuur}' hoort niet in variant Premium`);
    }
  }
}
if (/<svg/i.test(html)) fail('index.html: inline SVG is niet toegestaan; alleen lokale logo-bestanden');
if (/21st\.dev/i.test(`${html}\n${css}\n${js}`)) fail('runtimebestanden: 21st.dev-runtimeverwijzing is niet toegestaan');
if (/linear-gradient|radial-gradient|conic-gradient|blur\(|rgba?\(|hsla?\(|color-mix|\btransparent\b|(?:box|text)-shadow\s*:|border-radius\s*:/i.test(css) || /\bfilter\s*:(?!\s*none)/i.test(css)) {
  fail('styles.css: gradients, blur/filter, schaduwen, afronding of transparante/afgeleide kleuren zijn niet toegestaan');
}
if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$)/i.test(css)) {
  fail('styles.css: inhoud of navigatie mag niet standaard of responsief worden verborgen');
}

// --- claims (gedeeld, met per-variant vastgelegde strikte teksten) ---
checkClaims(html, content, {
  strictVariantTexts: {
    'pos-besparing-30': ['Bespaar 30% van je tijd met één AI-platform.'],
    'pos-nederlands': ['Door Nederlandse AI-professionals gebouwd; NL-gehost, AVG-proof en snel inzetbaar.'],
    'pos-badges': ['EU-gehost, ISO 27001 gecertificeerd, API-first en model-agnostisch.'],
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
checkImages(html, css, brand, root, 'premium', fail);
checkCustomerReviews(html, fail);
if ((html.match(/\sdata-company-logo(?=\s|>)/g) ?? []).length !== 9 || !/data-company-slider/.test(html) || !/animation:\s*client-ledger-loop/.test(css)) {
  fail('bedrijven-slideshow: verwacht negen lokale klantlogo’s in de bewegende premium-ledger');
}
// Logo-uitvoering: op de donkere header en footer hoort uitsluitend het witte logo.
if (!/premium-header[\s\S]*artific-logo-wit\.svg/.test(html)) fail('index.html: de donkere header hoort het witte logo te dragen');
if (!/premium-footer[\s\S]*artific-logo-wit\.svg/.test(html)) fail('index.html: de donkere footer hoort het witte logo te dragen');
if (/artific-logo-blauw\.svg/.test(html)) fail('index.html: het blauwe logo hoort niet op de donkere vlakken van deze variant');
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
checkContrastUsage(html, css, brand, [
  { foregroundSelector: 'body', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.skiplink', backgroundSelector: '.skiplink', pairId: 'wit-op-navy' },
  { foregroundSelector: '.premium-header', backgroundSelector: '.premium-header', pairId: 'wit-op-navy' },
  { foregroundSelector: '.premium-header__nav a', backgroundSelector: '.premium-header', pairId: 'wit-op-navy' },
  { foregroundSelector: 'body', backgroundSelector: '.boekdeel--tint', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.cta--accent', backgroundSelector: '.cta--accent', pairId: 'navy-op-geel' },
  { foregroundSelector: '.cta--accent:hover', backgroundSelector: '.cta--accent:hover', pairId: 'navy-op-wit' },
  { foregroundSelector: '.cta--omlijnd', backgroundSelector: '.boekdeel--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--omlijnd:hover', backgroundSelector: '.boekdeel--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.cta--licht:hover', backgroundSelector: '.cta--licht:hover', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.evidence-index__regel dt', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.boekdeel--donker', backgroundSelector: '.boekdeel--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.boekdeel--donker .dossierregel__index', backgroundSelector: '.boekdeel--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.controle-architectuur__laag--artific h3', backgroundSelector: '.controle-architectuur__laag--artific', pairId: 'geel-op-navy' },
  { foregroundSelector: '.module-sequence__detail', backgroundSelector: '.boekdeel--tint', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.begeleiding__stap::before', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.assurance-ledger__item dt', backgroundSelector: '.boekdeel--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.premium-footer', backgroundSelector: '.premium-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: 'body', backgroundSelector: '.client-mark', pairId: 'navy-op-wit' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);

// --- progressive enhancement & gerichte transform-motion ---
checkMotionGuards(html, css, js, fail);
if (!/data-motion-heading/.test(js) || !/data-hairline/.test(js)) {
  fail('HTML/main.js: gerichte heading- of hairline-motion ontbreekt');
}
for (const group of ['evidence', 'maturity', 'controle', 'modules', 'assurance']) {
  if (!js.includes(`name: "${group}"`)) {
    fail(`main.js: gerichte motiongroep '${group}' is niet gekoppeld`);
  }
}
if (!/scaleX/.test(js)) fail('main.js: de hairline-opbouw met scaleX ontbreekt');
if (/\b(?:opacity|filter|clipPath|height|width|top|left|margin|padding)\s*:/.test(js)) {
  fail('main.js: dossiermotion mag uitsluitend transform-properties gebruiken');
}
if (/\b(?:pin|scrub|snap|toggleActions|repeat)\s*:|ScrollToPlugin|scrollTo\s*:|marquee|parallax/i.test(js)) {
  fail('main.js: pinning, scrub, herhaling of automatische scroll is niet toegestaan');
}
for (const contract of ['immediateRender: false', 'once: true', 'overwrite: "auto"', 'clearProps: "transform"']) {
  if (!js.includes(contract)) fail(`main.js: motioncontract '${contract}' ontbreekt`);
}
if (!/function groupEntrance/.test(js) || !/cleanupTargets\.add\(target\)/.test(js) ||
    !/addEventListener\("change"/.test(js) || !/function stopMotion/.test(js) ||
    !/\.kill\(\)/.test(js) || !/removeProperty\("transform"\)/.test(js)) {
  fail('main.js: dynamische reduced-motion-opruiming van triggers, tweens en transforms ontbreekt');
}

// --- ontwerpdocument & oplevergate ---
const designPath = 'premium/DESIGN.md';
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
checkBrandGate(brand, 'Premium', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('Variant Premium: alle structurele controles geslaagd.');
