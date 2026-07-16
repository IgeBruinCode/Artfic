#!/usr/bin/env node
// Regressiecontrole van variant Conventioneel (trust-center SaaS) tegen de gedeelde bron.
// Gebruik: node scripts/validate-conventioneel.mjs (dependency-vrij, Node-standaardbibliotheek).
// Gedeelde trust-boundarychecks staan in scripts/lib/variant-checks.mjs; hieronder alleen de
// variant-specifieke structuur van deze compositie.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBrandColors, checkBrandGate, checkClaims, checkDesignDoc, checkDocumentMetadata,
  checkImages, checkLinksAndCtas, checkMotionGuards, checkSectionOrder,
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
if (!/class="saas-header"/.test(html)) fail('index.html: saas-header ontbreekt');
if (!/\.saas-header\s*{[^}]*position:\s*sticky/s.test(css)) fail('styles.css: de saas-header hoort sticky te zijn');
const navAnchors = [...(html.match(/class="saas-header__nav"[\s\S]*?<\/nav>/)?.[0] ?? '').matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
if (!navAnchors.length) fail('index.html: lokale sectienavigatie in de header ontbreekt');
for (const anchor of navAnchors) {
  if (!html.includes(`id="${anchor}"`)) fail(`index.html: navigatieanker '#${anchor}' wijst naar een niet-bestaand ID`);
}
if ((html.match(/class="trust-console"/g) ?? []).length !== 1) fail('index.html: verwacht exact één trust-console');
if ((html.match(/class="trust-console__laag[" ]/g) ?? []).length !== 3) fail('index.html: de trust-console hoort drie lagen (modellen → Artific → processen) te tonen');
if ((html.match(/class="bewijsrail"/g) ?? []).length !== 1) fail('index.html: verwacht exact één bewijsrail');
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
const moduleCards = html.match(/class="module-card"/g) ?? [];
if (moduleCards.length !== 3 || !moduleClaims.every((id) => new RegExp(`class="module-card"[^>]*data-claim-id="${id}"`).test(html))) {
  fail('index.html: verwacht exact drie module-cards met de drie canonieke moduleclaims');
}
if ((html.match(/class="assurance-matrix__item"/g) ?? []).length < 6) fail('index.html: de assurance-matrix hoort minimaal zes onderbouwde items te bevatten');
if ((html.match(/class="stappen__stap"/g) ?? []).length !== 5) fail('index.html: verwacht exact vijf implementatiestappen');
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
if (/display:\s*none/.test(css) && !/@media[^{]*max-width[^{]*{[^@]*\.saas-header__nav\s*{\s*display:\s*none/s.test(css)) {
  fail('styles.css: display:none is alleen toegestaan voor de headernavigatie op smalle schermen');
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
checkImages(html, brand, root, 'conventioneel', fail);
// Logo-uitvoering: blauw logo alleen in de lichte header, wit logo alleen in de donkere footer.
if (!/saas-header[\s\S]*artific-logo-blauw\.svg/.test(html)) fail('index.html: de lichte header hoort het blauwe logo te dragen');
if (!/saas-footer[\s\S]*artific-logo-wit\.svg/.test(html)) fail('index.html: de donkere footer hoort het witte logo te dragen');
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);

// --- progressive enhancement & motion (gedeeld + variantdoelen) ---
checkMotionGuards(html, css, js, fail);
if (/data-reveal/.test(js) && !/\sdata-reveal[\s>]/.test(html)) fail('index.html: main.js animeert data-reveal-doelen maar de pagina bevat er geen');
if (/data-verbinding/.test(js) && !/\sdata-verbinding[\s>]/.test(html)) fail('index.html: main.js animeert data-verbinding-doelen maar de pagina bevat er geen');
if (!/aria-current/.test(js)) fail('main.js: navigatiestatus via aria-current ontbreekt');

// --- ontwerpdocument & oplevergate ---
checkDesignDoc(root, 'conventioneel/DESIGN.md', () => read('conventioneel/DESIGN.md'),
  ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion', 'Responsief gedrag'], fail);
checkBrandGate(brand, 'Conventioneel', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Variant Conventioneel: alle structurele controles geslaagd.');
