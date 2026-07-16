#!/usr/bin/env node
// Regressiecontrole van variant Conventioneel (trust-center SaaS) tegen de gedeelde bron.
// Gebruik: node scripts/validate-conventioneel.mjs (dependency-vrij, Node-standaardbibliotheek).
// Gedeelde trust-boundarychecks staan in scripts/lib/variant-checks.mjs; hieronder alleen de
// variant-specifieke structuur van deze compositie.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors, checkBrandGate, checkClaims, checkContrastUsage, checkDesignDoc, checkDocumentMetadata,
  checkImages, checkLinksAndCtas, checkMotionGuards, checkNoPdfRuntime, checkSectionOrder,
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

// --- eigen trust-center-structuur: sticky SaaS-header, trust-console, bewijsrail,
// --- drie modulecards, assurance-matrix en vijf implementatiestappen ---
const openingTags = [...html.matchAll(/<[a-z0-9]+\b[^>]*>/g)].map((match) => match[0]);
const hasAttributeToken = (tag, attribute, token) => {
  const value = tag.match(new RegExp(`\\s${attribute}="([^"]*)"`))?.[1];
  return value?.split(/\s+/).includes(token) ?? false;
};
const tagsWithClass = (token) => openingTags.filter((tag) => hasAttributeToken(tag, 'class', token));

if (tagsWithClass('saas-header').length !== 1) fail('index.html: saas-header ontbreekt');
if (!/\.saas-header\s*{[^}]*position:\s*sticky/s.test(css)) fail('styles.css: de saas-header hoort sticky te zijn');
const navAnchors = [...(html.match(/class="saas-header__nav"[\s\S]*?<\/nav>/)?.[0] ?? '').matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
if (!navAnchors.length) fail('index.html: lokale sectienavigatie in de header ontbreekt');
for (const anchor of navAnchors) {
  if (!html.includes(`id="${anchor}"`)) fail(`index.html: navigatieanker '#${anchor}' wijst naar een niet-bestaand ID`);
}
if (tagsWithClass('trust-console').length !== 1) fail('index.html: verwacht exact één trust-console');
if (tagsWithClass('trust-console__laag').length !== 3) fail('index.html: de trust-console hoort drie lagen (modellen → Artific → processen) te tonen');
if (tagsWithClass('bewijsrail').length !== 1) fail('index.html: verwacht exact één bewijsrail');
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
const moduleCardTags = tagsWithClass('module-card');
const hasAllModuleClaims = moduleClaims.every((claimId) =>
  moduleCardTags.some((tag) => hasAttributeToken(tag, 'data-claim-id', claimId))
);
if (moduleCardTags.length !== 3 || !hasAllModuleClaims) {
  fail('index.html: verwacht exact drie module-cards met de drie canonieke moduleclaims');
}
if (tagsWithClass('assurance-matrix__item').length < 6) fail('index.html: de assurance-matrix hoort minimaal zes onderbouwde items te bevatten');
if (tagsWithClass('stappen__stap').length !== 5) fail('index.html: verwacht exact vijf implementatiestappen');
// Verbod op signaturen van de drie zustervarianten: dit moet een zelfstandige SaaS-compositie zijn.
for (const [file, text] of [['index.html', html], ['styles.css', css], ['main.js', js]]) {
  for (const signatuur of ['commandobar', 'sectiecode', 'plaat', 'folio', 'register', 'spread', 'margewoord']) {
    if (new RegExp(`(class="[^"]*|\\.)${signatuur}(?![A-Za-z])`).test(text)) fail(`${file}: zustervariant-signatuur '${signatuur}' hoort niet in variant Conventioneel`);
  }
}
if (/<svg/i.test(html)) fail('index.html: inline SVG is niet toegestaan; alleen de twee logo-bestanden');
if (/linear-gradient|radial-gradient|conic-gradient|blur\(|rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: gradients, blur of afgeleide/transparante kleuren zijn niet toegestaan');
}
const displayNones = css.match(/display:\s*none/g) ?? [];
const hasAllowedDisplayNone = displayNones.length === 0 || (
  displayNones.length === 1 &&
  /@media \(max-width: \d+px\) {\s*\.saas-header__nav\s*{\s*display:\s*none;?\s*}/.test(css)
);
if (!hasAllowedDisplayNone) {
  fail('styles.css: display:none is uitsluitend toegestaan voor .saas-header__nav in één max-width-mediaquery');
}
if (/visibility:\s*hidden/.test(css)) fail('styles.css: standaard verborgen inhoud is niet toegestaan');

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
  { foregroundSelector: 'body', backgroundSelector: '.trust-console__status li', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.paneel', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.assurance-matrix__item', pairId: 'navy-op-wit' },
  { foregroundSelector: '.stappen__stap h4::before', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.module-card__nummer', backgroundSelector: '.module-card', pairId: 'navy-op-wit' },
  { foregroundSelector: '.sectie--donker', backgroundSelector: '.sectie--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.saas-footer', backgroundSelector: '.saas-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.saas-footer__links a', backgroundSelector: '.saas-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.bewijsrail__cijfer', backgroundSelector: '.bewijsrail__item', pairId: 'blauw-op-wit-groot' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);

// --- progressive enhancement & motion (gedeeld + variantdoelen) ---
checkMotionGuards(html, css, js, fail);
if (/data-reveal/.test(js) && !/\sdata-reveal[\s>]/.test(html)) fail('index.html: main.js animeert data-reveal-doelen maar de pagina bevat er geen');
if (/data-verbinding/.test(js) && !/\sdata-verbinding[\s>]/.test(html)) fail('index.html: main.js animeert data-verbinding-doelen maar de pagina bevat er geen');
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
