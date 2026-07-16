#!/usr/bin/env node
// Regressiecontrole van de minimalistische variant tegen de gedeelde content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-minimalistisch.mjs (dependency-vrij, Node-standaardbibliotheek).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors, checkClaims, checkContrastUsage, checkDocumentMetadata, checkImages,
  checkLinksAndCtas, checkMotionGuards, checkNoPdfRuntime, checkSectionOrder,
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

const gridWrapperCount = (html.match(/class="[^"]*\bsectie__grid\b[^"]*"/g) || []).length;
if (gridWrapperCount !== 8) {
  fail(`index.html: verwacht exact acht .sectie__grid-wrappers, gevonden ${gridWrapperCount}`);
}
for (const sectionId of requiredSections) {
  const sectionStart = new RegExp(`<section[^>]+id="${sectionId}"[^>]*>\\s*<div class="[^"]*\\bsectie__grid\\b`);
  if (!sectionStart.test(html)) fail(`index.html: sectie #${sectionId} begint niet met de gedeelde .sectie__grid-wrapper`);
}

const moduleLists = html.match(/<ol class="modules"[^>]*>[\s\S]*?<\/ol>/g) || [];
if (moduleLists.length !== 1) {
  fail(`index.html: verwacht exact één .modules-lijst, gevonden ${moduleLists.length}`);
} else {
  const moduleItems = [...moduleLists[0].matchAll(/<li class="module"\s+data-claim-id="([^"]+)"/g)];
  const moduleClaims = moduleItems.map((match) => match[1]);
  const canonicalModuleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
  if (moduleItems.length !== 3) fail(`index.html: verwacht exact drie .module-items, gevonden ${moduleItems.length}`);
  if (moduleClaims.join('|') !== canonicalModuleClaims.join('|')) {
    fail(`index.html: modulevolgorde moet ${canonicalModuleClaims.join(' → ')} zijn`);
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
checkImages(html, css, brand, root, 'minimalistisch', fail);
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
checkContrastUsage(html, css, brand, [
  { foregroundSelector: 'body', backgroundSelector: 'body', pairId: 'navy-op-wit' },
  { foregroundSelector: 'body', backgroundSelector: '.site-header', pairId: 'navy-op-wit' },
  { foregroundSelector: '.sectie--tint', backgroundSelector: '.sectie--tint', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.skiplink', backgroundSelector: '.skiplink', pairId: 'wit-op-navy' },
  { foregroundSelector: '.sectie--donker', backgroundSelector: '.sectie--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--licht', backgroundSelector: '.cta--licht', pairId: 'navy-op-geel' },
  { foregroundSelector: '.cta--omlijnd', backgroundSelector: '.sectie--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.flow__blok--artific', backgroundSelector: '.flow__blok--artific', pairId: 'wit-op-navy' },
  { foregroundSelector: '.site-footer', backgroundSelector: '.site-footer', pairId: 'wit-op-navy' },
  { foregroundSelector: '.site-footer__noot', backgroundSelector: '.site-footer', pairId: 'lichtblauw-op-navy' },
  { foregroundSelector: '.fasen > li::before', backgroundSelector: 'body', pairId: 'blauw-op-wit-groot' },
  { foregroundSelector: '.stappen li::before', backgroundSelector: 'body', pairId: 'navy-op-wit' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);
if (/rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: afgeleide/transparante kleuren of standaard-verborgen inhoud zijn niet toegestaan');
}
if (/\b(?:commandobar|sectiecode|plaat|masthead|folio|spread|trust-console|module-card|boekdeel|dossierregel)\b/i.test(`${html}\n${css}\n${js}`)) {
  fail('minimalistisch: runtime bevat een verboden signatuur van een zustervariant');
}
if (/(?:box-shadow\s*:|(?:linear|radial|conic)-gradient\s*\()/i.test(css)) {
  fail('styles.css: cardschaduwen en gradients horen niet bij de minimalistische editorial variant');
}
if (!/\.sectie\s*\+\s*\.sectie\s*\{[^}]*border-top:\s*1px solid var\(--lichtblauw\)/s.test(css)
    || !/\.sectie\s*\+\s*\.sectie--tint\s*,\s*\.sectie\s*\+\s*\.sectie--donker\s*\{[^}]*border-top-color:\s*var\(--blauw\)/s.test(css)) {
  fail('styles.css: de doorlopende 1px-sectierails ontbreken of gebruiken niet de gedocumenteerde merkkleuren');
}
const tintSectionRules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((match) => match[1].split(',').some((selector) => selector.trim() === '.sectie--tint'))
  .map((match) => match[2]);
const bottomBorderProperties = new Set([
  'border', 'border-width', 'border-style', 'border-color',
  'border-block', 'border-block-width', 'border-block-style', 'border-block-color',
  'border-block-end', 'border-bottom',
]);
const affectsBottomBorder = (property) =>
  bottomBorderProperties.has(property) || property.startsWith('border-block-end-') || property.startsWith('border-bottom-');
const tintSectionProperties = tintSectionRules.flatMap((rule) =>
  [...rule.matchAll(/(?:^|;)\s*([\w-]+)\s*:/g)].map((match) => match[1])
);
if (tintSectionProperties.some(affectsBottomBorder)) {
  fail('styles.css: .sectie--tint mag geen onderrand toevoegen naast de 1px-bovenrail van de volgende sectie');
}

const desktopCss = extractSingleCssBlock(
  css,
  /@media\s*\(\s*min-width\s*:\s*980px\s*\)\s*\{/g,
  'desktopmediaquery (min-width: 980px)'
).replace(/\s+/g, ' ');
const mobileCss = extractSingleCssBlock(
  css,
  /@media\s*\(\s*max-width\s*:\s*979px\s*\)\s*\{/g,
  'mobiele mediaquery (max-width: 979px)'
).replace(/\s+/g, ' ');

const desktopGridContracts = [
  /\.sectie__grid\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/,
  /\.sectie__grid\s*>\s*\.modules\s*\{[^}]*grid-column:\s*1\s*\/\s*13[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/,
  /\.modules\s*>\s*\.module:nth-child\(1\)\s*\{[^}]*grid-column:\s*1\s*\/\s*9[^}]*grid-row:\s*1/,
  /\.modules\s*>\s*\.module:nth-child\(2\)\s*\{[^}]*grid-column:\s*3\s*\/\s*11[^}]*grid-row:\s*2/,
  /\.modules\s*>\s*\.module:nth-child\(3\)\s*\{[^}]*grid-column:\s*5\s*\/\s*13[^}]*grid-row:\s*3/,
];
for (const contract of desktopGridContracts) {
  if (!contract.test(desktopCss)) fail('styles.css: twaalfkoloms grid- of moduletrapcontract ontbreekt binnen de desktopmediaquery');
}
if (!/\.modules\s*\{[^}]*display:\s*block[^}]*width:\s*100%/.test(mobileCss)
    || !/\.modules\s*>\s*\.module,[^{]*\.modules\s*>\s*\.module:nth-child\(3\)\s*\{[^}]*width:\s*100%[^}]*grid-column:\s*auto[^}]*grid-row:\s*auto/.test(mobileCss)) {
  fail('styles.css: mobiele lineaire reset voor de volledige moduletrap ontbreekt binnen de mobiele mediaquery');
}

checkMotionGuards(html, css, js, fail, {
  allowOpacity: true,
  requireClearProps: true,
});
if (/data-reveal/.test(js) && !/\sdata-reveal[\s>]/.test(html)) {
  fail('index.html: main.js implementeert data-reveal-scrollreveals maar de pagina bevat geen enkel data-reveal-doel');
}
if (!/immediateRender:\s*false/.test(js)) {
  fail('main.js: scroll-enters moeten inhoud zichtbaar laten tot de trigger werkelijk start');
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
  if (!/Creatieve bron — 21st\.dev Magic MCP/i.test(design)) fail(`${designPath}: de uitgevoerde 21st.dev Magic MCP-bronrun ontbreekt`);
  if (!/21st AI-schets[\s\S]*generatie\s*`[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}`[\s\S]*Take 1/i.test(design)) {
    fail(`${designPath}: concrete Magic-generatie en geraadpleegde take ontbreken in de provenance`);
  }
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
