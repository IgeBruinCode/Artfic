#!/usr/bin/env node
// Regressiecontrole voor de vernieuwde minimalistische Artific-landingspagina.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors,
  checkClaims,
  checkDocumentMetadata,
  checkImages,
  checkLinksAndCtas,
  checkNoPdfRuntime,
  checkSectionOrder,
} from './lib/variant-checks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (message) => errors.push(message);
const read = (path) => readFileSync(join(root, path), 'utf8');

const html = read('minimalistisch/index.html');
const css = read('minimalistisch/styles.css');
const js = read('minimalistisch/main.js');
const shaderJs = read('minimalistisch/flow-field-shader.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

checkDocumentMetadata(html, fail);
checkSectionOrder(html, ['intro', 'visie', 'controlelaag', 'platform', 'controle', 'aanpak', 'bewijs', 'contact'], fail);

if (!/<header\b/.test(html) || !/<main\b/.test(html) || !/<footer\b/.test(html)) {
  fail('index.html: landmarks header/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');
if ((html.match(/\bsectie__grid\b/g) ?? []).length !== 8) {
  fail('index.html: iedere hoofdsectie moet exact één gedeelde sectiecontainer hebben');
}

const strictVariantTexts = {
  'pos-besparing-30': ['Bespaar 30% van je tijd met één AI-platform.'],
  'pos-nederlands': ['Gebouwd door Nederlandse AI-professionals. NL-gehost, AVG-proof en snel inzetbaar.'],
  'pos-badges': ['EU-gehost', 'ISO 27001', 'API-first', 'Model-agnostisch'],
  'pos-award': ['Artific is uitgeroepen tot AI Company of the Year 2025 tijdens de Nationale AI Awards.'],
  'sec-eu': ['Alle data, infrastructuur en processing binnen de EU.'],
  'sec-iso': ['Onafhankelijke audit van het informatiebeveiligingssysteem, continu onderhouden.'],
  'sec-audit': ['Elke prompt, tool-call en beslissing wordt vastgelegd.'],
  'bw-100-klanten': ['Meer dan 100 klanten laten AI voor zich werken.'],
  'bw-klantnamen': ['Onder meer Basic-Fit, Eneco, Marktplaats, hollandsnieuwe, Gemeente Den Haag, RTV Oost, Veiligheidsregio Zuid-Limburg en Vechtsteden Notarissen.'],
  'bw-quote-leqqr': ['De Artific AI-Assistent werkt als een trein. In drie weken tijd hebben we al een enorme bespaard op personele kosten en de kwaliteit van onze support is alleen maar beter geworden.'],
};

checkClaims(html, content, {
  strictVariantTexts,
  requiredClaims: [
    'pos-belofte', 'pos-agentic-platform', 'pos-badges',
    'dm-kop', 'vvt-veilig', 'vvt-voorspelbaar', 'vvt-transparant',
    'reis-fase-1', 'reis-fase-2', 'reis-fase-3',
    'ctl-positie', 'ctl-tussen-model-en-proces',
    'mod-overzicht', 'mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation',
    'ph-portal', 'ph-headless', 'cc-een-plek',
    'sec-ontwerp', 'sec-eu', 'sec-iso', 'sec-audit',
    'pm-markt', 'bo-vijf-stappen', 'bw-100-klanten', 'bw-klantnamen',
    'bw-quote-leqqr', 'cv-versnellen',
  ],
}, fail);

checkLinksAndCtas(html, content, {
  minCtaCount: 4,
  minCtaHint: 'header, hero, controlelaag en slot',
}, fail);
checkImages(html, css, brand, root, 'minimalistisch', fail);
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js], ['flow-field-shader.js', shaderJs]], brand, fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js], ['flow-field-shader.js', shaderJs]], fail);

if (!/<canvas\b[^>]*\bdata-shader\b/.test(html)) fail('index.html: de Artific Blue hero-shader ontbreekt');
if (!/getContext\("webgl"/.test(shaderJs) || !/shaderSource/.test(shaderJs) || !/u_colors\[8\]/.test(shaderJs) || !/#287CEB/i.test(css)) {
  fail('flow-field-shader.js: de WebGL1 flow-field shader gebruikt het Artific-palet niet aantoonbaar');
}
if (!/devicePixelRatio[^\n]+2\)/.test(shaderJs) || !/visibilitychange/.test(shaderJs) || !/IntersectionObserver/.test(shaderJs) || !/uniform4f\(uniforms\.cursor, 0\.00/.test(shaderJs)) {
  fail('flow-field-shader.js: DPR-cap, visibility/viewport-pauze of uitgeschakelde cursor ontbreekt');
}
if (!/class="process-stage"/.test(html) || !/Artific AI-assistent/.test(html) || !/Human in control/.test(html)) {
  fail('index.html: de inhoudelijke Artific-workflowvisual ontbreekt');
}
if (!/Mesh Gradient Shader|21st\.dev-geïnspireerde workflow builder/.test(css) || !/Workflow live/.test(html)) {
  fail('21st.dev: shader- en workflowbron zijn niet aantoonbaar vertaald naar de variant');
}
if (!/\.site-header\.is-scrolled/.test(css) || !/classList\.toggle\("is-scrolled"/.test(js)) {
  fail('navbar: transparante hero-state en solide scrolled-state ontbreken');
}

const modules = [...html.matchAll(/<li class="module(?: [^"]*)?"\s+data-claim-id="(mod-[^"]+)"/g)];
if (modules.length !== 3) fail(`index.html: verwacht exact drie platformmodules, gevonden ${modules.length}`);
if (modules.map((match) => match[1]).join('|') !== 'mod-ai-assistant|mod-ai-toolbox|mod-conversation') {
  fail('index.html: de platformmodules staan niet in de canonieke volgorde');
}

const customerLogos = [...html.matchAll(/<img\b[^>]*\bdata-client-logo\b[^>]*>/g)];
if (customerLogos.length !== 8) fail(`index.html: verwacht acht officiële klantlogo's, gevonden ${customerLogos.length}`);
for (const logoPath of [
  'basic-fit.png', 'eneco.jpg', 'veiligheidsregio-zuid-limburg.png', 'marktplaats.jpg',
  'tonys-chocolonely.svg', 'rtv-oost.png', 'royal-de-ree-holland.jpg', 'previder.png',
]) {
  if (!existsSync(join(root, 'minimalistisch/assets/clients', logoPath))) {
    fail(`minimalistisch/assets/clients/${logoPath}: officieel klantlogo ontbreekt`);
  }
}
if (!/data-logo-rail/.test(html) || !/animation:\s*rail/.test(css)) {
  fail('klantlogo-presentatie: bewegende rail ontbreekt');
}

if (!/>Klantbeoordelingen</.test(html) || !/<strong>6<\/strong>\s*klantbeoordelingen/.test(html)) {
  fail('index.html: titel of aanduiding “6 klantbeoordelingen” ontbreekt');
}
const reviewCards = html.match(/<article class="review-card[^>]*>/g) ?? [];
if (reviewCards.length !== 6) fail(`index.html: verwacht zes reviewkaarten, gevonden ${reviewCards.length}`);
const reviewContracts = [
  ['Rogier Lukas', 'Notaris — Vechtstede Notarissen', 'Samen met Artific zijn we bezig de AI-Notaris Assistent te ontwikkelen.'],
  ['Maarten ter Velde', 'Co-founder', 'Artific heeft voor ons alle bestaande bedrijfsprocedures met AI uitgerust.'],
  ['Johan Evers', 'CEO — Human Talent Group', 'De AI Roadmap van Artific heeft tot veel nieuwe inzichten binnen onze organisatie geleid.'],
  ['Joshua Kuipers', 'Directeur — Webton', 'Binnen Webton werken we sinds september 2023 met de tooling van Artific.'],
  ['Sander van der Meer', 'Senior Online Marketeer — Harundo', 'De custom made AI-Assistent / Chatbot die voor onze klanten ontwikkeld is werkt uitstekend.'],
  ['Arjan Zwarteveen', 'Senior Marketeer — Leqqr', 'De Artific AI-Assistent werkt als een trein.'],
];
for (const [name, role, quoteStart] of reviewContracts) {
  if (!html.includes(name)) fail(`review: naam '${name}' ontbreekt`);
  if (!html.includes(role)) fail(`review: functie/organisatie '${role}' ontbreekt`);
  if (!html.includes(quoteStart)) fail(`review: citaat van '${name}' ontbreekt of is gewijzigd`);
}

if (!/class="nav-toggle"/.test(html) || !/aria-expanded="false"/.test(html) || !/Escape/.test(js)) {
  fail('mobiele navigatie: toegankelijke toggle of Escape-afhandeling ontbreekt');
}
if (!/@media \(max-width: 700px\)/.test(css) || !/@media \(max-width: 979px\)/.test(css)) {
  fail('styles.css: tablet- of mobiele layout ontbreekt');
}
if (!/prefers-reduced-motion: reduce/.test(css) || !/prefers-reduced-motion: reduce/.test(js)) {
  fail('reduced motion: CSS- en JavaScript-afbouw zijn beide verplicht');
}
if (!/IntersectionObserver/.test(js) || !/\.is-visible/.test(css)) {
  fail('progressive enhancement: zichtbare scrollreveal-implementatie ontbreekt');
}
if (!/:focus-visible/.test(css)) fail('styles.css: zichtbare focusstijl ontbreekt');
if (/https?:\/\/[^"')\s]+\.(?:js|css)/i.test(`${html}\n${css}\n${js}`)) {
  fail('runtime: externe script- of stylesheetafhankelijkheid gevonden');
}

if (brand.status !== 'verified') {
  fail(`brand.json: status is '${brand.status}' — de variant vereist een geverifieerde huisstijlbron`);
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Minimalistische Artific-variant: alle structurele, inhoudelijke en responsive controles geslaagd.');
