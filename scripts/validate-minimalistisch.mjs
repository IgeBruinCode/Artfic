#!/usr/bin/env node
// Regressiecontrole van de minimalistische variant tegen de gedeelde content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-minimalistisch.mjs (dependency-vrij, Node-standaardbibliotheek).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors, checkClaims, checkDocumentMetadata, checkImages,
  checkLinksAndCtas, checkMotionGuards, checkSectionOrder,
} from './lib/variant-checks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), 'utf8');

const html = read('minimalistisch/index.html');
const css = read('minimalistisch/styles.css');
const js = read('minimalistisch/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

checkDocumentMetadata(html, fail);
const requiredSections = ['intro', 'visie', 'controlelaag', 'platform', 'controle', 'aanpak', 'bewijs', 'contact'];
checkSectionOrder(html, requiredSections, fail);
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html)) {
  fail('index.html: landmarks header/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');

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
  // Direct citaat uit content/sources/artific.nl.md#h-quote-leqqr.
  'bw-quote-leqqr': ['"De Artific AI-Assistent werkt als een trein. In drie weken tijd hebben we al een enorme bespaard op personele kosten en de kwaliteit van onze support is alleen maar beter geworden." — Arjan Zwarteveen, Senior Marketeer Leqqr'],
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

checkLinksAndCtas(html, content, {
  minCtaCount: 3,
  minCtaHint: 'header, hero, slot',
}, fail);
checkImages(html, brand, root, 'minimalistisch', fail);
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
if (/rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: afgeleide/transparante kleuren of standaard-verborgen inhoud zijn niet toegestaan');
}

checkMotionGuards(html, css, js, fail, {
  allowOpacity: true,
  requireClearProps: false,
});
if (/data-reveal/.test(js) && !/\sdata-reveal[\s>]/.test(html)) {
  fail('index.html: main.js implementeert data-reveal-scrollreveals maar de pagina bevat geen enkel data-reveal-doel');
}

// --- ontwerpdocument ---
const designPath = 'minimalistisch/DESIGN.md';
if (!existsSync(join(root, designPath))) {
  fail(`${designPath}: ontwerpdocument ontbreekt`);
} else {
  const design = read(designPath);
  for (const hoofdstuk of ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijlen', 'Bewegingsprincipes']) {
    if (!new RegExp(`^#{2,3} .*${hoofdstuk}`, 'im').test(design)) fail(`${designPath}: hoofdstuk '${hoofdstuk}' ontbreekt`);
  }
  if (!/gefinaliseerd via Google Stitch-MCP/i.test(design)) fail(`${designPath}: provenance verklaart niet dat het document via de Google Stitch-MCP is gefinaliseerd`);
  if (!/Stitch-project\s*`\d{15,}`/.test(design)) fail(`${designPath}: concreet Stitch-project-ID ontbreekt in de provenance`);
  if (!/screen\s*`\d{10,}`/.test(design)) fail(`${designPath}: concreet Stitch-screen-ID ontbreekt in de provenance`);
  if (!/design system\s*`assets\/[0-9a-f]{32}`/.test(design)) fail(`${designPath}: concreet Stitch-design-system-ID ontbreekt in de provenance`);
  if (/niet beschikbaar|blijft (expliciet )?open|niet als Stitch-output|handmatig opgesteld|oplevering geblokkeerd/i.test(design)) {
    fail(`${designPath}: provenance meldt een open of mislukte Stitch-status; de finalisatie is niet afgerond`);
  }
}

// --- oplevergate: de variant is pas opleverbaar met een geverifieerde huisstijlbron ---
if (brand.status !== 'verified') {
  fail(`brand.json: status is '${brand.status}' — de minimalistische variant kan niet als opgeleverd gelden zolang de huisstijlbron niet 'verified' is (zie assets/brand/README.md); de oplevering is GEBLOKKEERD`);
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Minimalistische variant: alle structurele controles geslaagd.');
