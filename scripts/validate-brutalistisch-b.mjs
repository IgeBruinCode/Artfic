#!/usr/bin/env node
// Regressiecontrole van variant Brutalistisch B (tabloid register) tegen de gedeelde bron.
// Gebruik: node scripts/validate-brutalistisch-b.mjs (dependency-vrij, Node-standaardbibliotheek).
// Gedeelde trust-boundarychecks staan in scripts/lib/variant-checks.mjs; hieronder alleen de
// variant-specifieke structuur van deze compositie.
import { readFileSync } from 'node:fs';
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

const html = read('brutalistisch-b/index.html');
const css = read('brutalistisch-b/styles.css');
const js = read('brutalistisch-b/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- document, metadata & foliovolgorde ---
checkDocumentMetadata(html, fail);
const requiredSections = ['intro', 'visie', 'platform', 'organisatie', 'bewijs', 'contact'];
checkSectionOrder(html, requiredSections, fail);
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html) || !/<aside[\s>]/.test(html)) {
  fail('index.html: landmarks header/aside/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');

// --- eigen tabloid-registerstructuur: masthead, hoofdstukregister, folio's, modulespread, grootboek ---
if (!/class="masthead"/.test(html)) fail('index.html: statische masthead ontbreekt');
if (!/class="register"/.test(html) || !/class="register__lijst"/.test(html)) fail('index.html: hoofdstukregister ontbreekt');
const registerAnchors = [...html.matchAll(/class="register__lijst"[\s\S]*?<\/ol>/g)].flatMap((m) => [...m[0].matchAll(/href="#([^"]+)"/g)].map((a) => a[1]));
if (registerAnchors.length !== requiredSections.length || !requiredSections.every((id) => registerAnchors.includes(id))) {
  fail('index.html: het register verwijst niet naar exact de zes folio\'s');
}
for (const anchor of registerAnchors) {
  if (!html.includes(`id="${anchor}"`)) fail(`index.html: registeranker '#${anchor}' wijst naar een niet-bestaand ID`);
}
if ((html.match(/class="folio__nummer"/g) ?? []).length !== 6) fail('index.html: elke folio hoort een zichtbaar folionummer te dragen (zes verwacht)');
// Eén aaneengesloten modulespread met exact de drie modules, geen losse platen/cards.
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
const spreads = html.match(/class="spread"/g) ?? [];
if (spreads.length !== 1) fail(`index.html: verwacht exact één modulespread, gevonden: ${spreads.length}`);
if ((html.match(/class="spread__deel"/g) ?? []).length !== 3 || !moduleClaims.every((id) => new RegExp(`class="spread__deel"[^>]*data-claim-id="${id}"`).test(html))) {
  fail('index.html: de drie moduledelen van de spread ontbreken of zijn onvolledig');
}
if ((html.match(/class="grootboek__post"/g) ?? []).length < 5) fail('index.html: het security-grootboek is onvolledig');
// Verbod op Brutalistisch A-signaturen: dit moet een zelfstandige tweede interpretatie zijn.
// (alleen in klasse-/selectornamen, zodat inhoudswoorden als 'Marktplaats' niet vals alarmeren)
for (const [file, text] of [['index.html', html], ['styles.css', css], ['main.js', js]]) {
  for (const signatuur of ['commandobar', 'sectiecode', 'plaat', 'pipeline', 'signaalstrook']) {
    if (new RegExp(`(class="[^"]*|\\.)${signatuur}`).test(text)) fail(`${file}: Brutalistisch A-signatuur '${signatuur}' hoort niet in variant B`);
  }
  if (/box-shadow/.test(text)) fail(`${file}: offset-/box-schaduwen horen niet in variant B`);
}
if (/position:\s*sticky/.test(css) && !/\.register\s*{[^}]*position:\s*sticky/s.test(css)) {
  fail('styles.css: sticky gedrag is alleen toegestaan voor het hoofdstukregister');
}
if (/\.masthead\s*{[^}]*position:\s*(sticky|fixed)/s.test(css)) fail('styles.css: de masthead hoort statisch te zijn, niet sticky/fixed');

// --- claims (gedeeld, met per-variant vastgelegde strikte teksten) ---
checkClaims(html, content, {
  strictVariantTexts: {
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
  },
  requiredClaims: [
    'pos-belofte', 'pos-agentic-platform', 'pos-badges',
    'dm-kop', 'vvt-veilig', 'vvt-voorspelbaar', 'vvt-transparant',
    'reis-fase-1', 'reis-fase-2', 'reis-fase-3',
    'ctl-positie', 'ctl-tussen-model-en-proces',
    'mod-overzicht', 'mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation',
    'ph-portal', 'ph-headless',
    'cc-een-plek', 'sec-ontwerp', 'sec-eu', 'sec-iso', 'sec-audit',
    'pm-markt', 'bo-vijf-stappen', 'bw-100-klanten', 'cv-versnellen',
  ],
}, fail);

// --- links, CTA's, afbeeldingen & kleuren (gedeeld) ---
checkLinksAndCtas(html, content, { minCtaCount: 3, minCtaHint: 'masthead, intro, slot' }, fail);
checkImages(html, css, brand, root, 'brutalistisch-b', fail);
// Logo-uitvoering: masthead en footer zijn donker, dus uitsluitend het witte logo.
if (/artific-logo-blauw\.svg/.test(html)) fail('index.html: het blauwe logo hoort niet op de donkere vlakken van deze variant');
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
checkContrastUsage(html, css, brand, [
  { foregroundSelector: 'body', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.skiplink', backgroundSelector: '.skiplink', pairId: 'navy-op-geel' },
  { foregroundSelector: '.masthead', backgroundSelector: '.masthead', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--masthead', backgroundSelector: '.cta--masthead', pairId: 'navy-op-geel' },
  { foregroundSelector: '.register__lijst a', backgroundSelector: '.register', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.register__lijst a[aria-current="location"]', backgroundSelector: '.register__lijst a[aria-current="location"]', pairId: 'wit-op-navy' },
  { foregroundSelector: '.margewoord', backgroundSelector: 'body', pairId: 'blauw-op-wit-groot' },
  { foregroundSelector: '.reis li::before', backgroundSelector: 'body', pairId: 'blauw-op-wit-groot' },
  { foregroundSelector: '.spread__folio', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: '.folio--slot', backgroundSelector: '.folio--slot', pairId: 'wit-op-navy' },
  { foregroundSelector: '.folio--slot .cta--zwaar', backgroundSelector: '.folio--slot .cta--zwaar', pairId: 'navy-op-geel' },
  { foregroundSelector: '.colofonvoet', backgroundSelector: '.colofonvoet', pairId: 'wit-op-navy' },
  { foregroundSelector: '.colofonvoet__noot', backgroundSelector: '.colofonvoet', pairId: 'lichtblauw-op-navy' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);
if (/rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: afgeleide/transparante kleuren of standaard-verborgen inhoud zijn niet toegestaan');
}
if (/border-radius|linear-gradient|radial-gradient|blur\(/.test(css)) {
  fail('styles.css: afronding, gradients of blur passen niet in deze brutalistische variant');
}

// --- progressive enhancement & motion (gedeeld + variantdoelen) ---
checkMotionGuards(html, css, js, fail);
if (/data-marge/.test(js) && !/\sdata-marge[\s>]/.test(html)) fail('index.html: main.js animeert data-marge-doelen maar de pagina bevat er geen');
if (/data-regel/.test(js) && !/\sdata-regel[\s>]/.test(html)) fail('index.html: main.js animeert data-regel-doelen maar de pagina bevat er geen');
if (!/aria-current/.test(js)) fail('main.js: registerstatus via aria-current ontbreekt');

// --- ontwerpdocument & oplevergate ---
checkDesignDoc(root, 'brutalistisch-b/DESIGN.md', () => read('brutalistisch-b/DESIGN.md'),
  ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion', 'Responsief gedrag'], fail);
checkBrandGate(brand, 'Brutalistisch B', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Variant Brutalistisch B: alle structurele controles geslaagd.');
