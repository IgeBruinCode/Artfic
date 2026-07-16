#!/usr/bin/env node
// Regressiecontrole van variant Brutalistisch B (tabloid register) tegen de gedeelde bron.
// Gebruik: node scripts/validate-brutalistisch-b.mjs (dependency-vrij, Node-standaardbibliotheek).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), 'utf8');

const html = read('brutalistisch-b/index.html');
const css = read('brutalistisch-b/styles.css');
const js = read('brutalistisch-b/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- document & metadata ---
if (!/<html[^>]*\slang="nl"/.test(html)) fail('index.html: documenttaal is niet nl');
const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
if (!title || /in aanbouw/i.test(title)) fail('index.html: unieke paginatitel ontbreekt of is nog de statustitel');
const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '';
if (desc.length < 50) fail('index.html: Nederlandse meta-description ontbreekt of is te kort');
if (/noindex/i.test(html)) fail('index.html: noindex-markering hoort niet op de opgeleverde variant');
if (!/<meta name="viewport"/.test(html)) fail('index.html: viewport-metadata ontbreekt');

const h1s = html.match(/<h1[\s>]/g) ?? [];
if (h1s.length !== 1) fail(`index.html: verwacht exact één <h1>, gevonden: ${h1s.length}`);

// --- landmarks & foliovolgorde ---
const requiredSections = ['intro', 'visie', 'platform', 'organisatie', 'bewijs', 'contact'];
let cursor = -1;
for (const id of requiredSections) {
  const idx = html.indexOf(`id="${id}"`);
  if (idx === -1) fail(`index.html: folio '#${id}' ontbreekt`);
  else if (idx < cursor) fail(`index.html: folio '#${id}' staat niet in de vereiste volgorde`);
  else cursor = idx;
}
if (!/<main[\s>]/.test(html) || !/<header[\s>]/.test(html) || !/<footer[\s>]/.test(html) || !/<aside[\s>]/.test(html)) {
  fail('index.html: landmarks header/aside/main/footer zijn niet compleet');
}
if (!/class="skiplink"/.test(html)) fail('index.html: skiplink ontbreekt');

// Eigen tabloid-registerstructuur: masthead, hoofdstukregister, folio's, modulespread, grootboek.
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

// --- claims ---
const knownClaims = new Map();
for (const topic of Object.values(content.topics)) {
  for (const claim of topic.claims) knownClaims.set(claim.id, claim);
}
const usedClaims = new Set(
  [...html.matchAll(/data-claim-id="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean)
);
for (const id of usedClaims) {
  if (!knownClaims.has(id)) fail(`index.html: onbekende data-claim-id '${id}'`);
}

// Strikte claims: de zichtbare varianttekst ligt vast, zodat inhoudelijke drift de check laat falen.
const normalize = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;|\s+/g, ' ').trim();
const claimScopes = new Map();
for (const m of html.matchAll(/<([a-z0-9]+)\b[^>]*\sdata-claim-id="([^"]+)"[^>]*>/g)) {
  const [openTag, tag, ids] = m;
  const start = m.index + openTag.length;
  const tokenRe = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'g');
  tokenRe.lastIndex = start;
  let depth = 1;
  let end = html.length;
  let t;
  while ((t = tokenRe.exec(html))) {
    depth += t[0].startsWith('</') ? -1 : 1;
    if (depth === 0) { end = t.index; break; }
  }
  if (depth !== 0) fail(`index.html: sluittag voor <${tag} data-claim-id="${ids}"> niet gevonden`);
  const inner = normalize(html.slice(start, end).replace(/<[^>]+>/g, ' '));
  for (const id of ids.split(/\s+/).filter(Boolean)) {
    if (!claimScopes.has(id)) claimScopes.set(id, []);
    claimScopes.get(id).push(inner);
  }
}
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
for (const id of usedClaims) {
  if (!knownClaims.get(id)?.strict) continue;
  const snippets = strictVariantTexts[id];
  if (!snippets) { fail(`index.html: strikte claim '${id}' heeft geen vastgelegde varianttekst in deze validator`); continue; }
  const scopes = (claimScopes.get(id) ?? []).map(normalize);
  for (const scope of scopes) {
    if (!snippets.some((snippet) => scope.includes(normalize(snippet)))) {
      fail(`index.html: een voorkomen van strikte claim '${id}' bevat geen van de vastgelegde variantteksten: '${scope.slice(0, 80)}…'`);
    }
  }
  for (const snippet of snippets) {
    if (!scopes.some((scope) => scope.includes(normalize(snippet)))) {
      fail(`index.html: zichtbare tekst binnen het element met strikte claim '${id}' wijkt af van de vastgelegde varianttekst: '${snippet}'`);
    }
  }
}
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
for (const id of requiredClaims) {
  if (!usedClaims.has(id)) fail(`index.html: vereiste claim '${id}' wordt niet gebruikt`);
}

// --- links & CTA's ---
if (/href="#"[\s>]/.test(html)) fail('index.html: kale href="#" gevonden');
if (/vision\.artific\.nl|product\.artific\.nl/.test(html)) {
  fail('index.html: inhoudelijke doorlink naar vision-/productsubpagina is niet toegestaan');
}
const allowedExternal = new Set([
  ...Object.values(content.ctas.navigation['artific.nl-footer'].links),
  ...Object.values(content.ctas.canonical)
    .map((c) => c.destination)
    .filter((d) => typeof d === 'string' && /^https?:/.test(d)),
]);
for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
  if (href.startsWith('#') || href === 'styles.css') continue;
  if (!allowedExternal.has(href)) fail(`index.html: niet-toegestane externe link '${href}'`);
}

const ctaCard = content.ctas.canonical;
const ctaRe = /<a\b([^>]*\sdata-cta-id="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g;
let ctaCount = 0;
for (const [, attrs, ctaId, inner] of html.matchAll(ctaRe)) {
  ctaCount += 1;
  const entry = ctaCard[ctaId];
  if (!entry) { fail(`index.html: data-cta-id '${ctaId}' staat niet in de CTA-kaart`); continue; }
  const label = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (label !== entry.label) fail(`index.html: CTA '${ctaId}' heeft label '${label}' i.p.v. '${entry.label}'`);
  const href = attrs.match(/href="([^"]+)"/)?.[1];
  if (href !== entry.destination) fail(`index.html: CTA '${ctaId}' wijst naar '${href}' i.p.v. '${entry.destination}'`);
  if (/target=/.test(attrs)) fail(`index.html: CTA '${ctaId}' mag geen target-attribuut hebben (zelfde tabblad)`);
}
const ctaAttrTotal = (html.match(/data-cta-id="/g) ?? []).length;
if (ctaAttrTotal !== ctaCount) fail(`index.html: ${ctaAttrTotal} data-cta-id-attributen gevonden maar slechts ${ctaCount} als anchor gevalideerd`);
if (ctaCount < 3) fail(`index.html: verwacht minimaal 3 CTA-voorkomens (masthead, intro, slot), gevonden: ${ctaCount}`);

// --- afbeeldingen: alleen goedgekeurde lokale logo's ---
const allowedImages = new Set(brand.logos.map((l) => `../assets/brand/${l.file}`));
for (const [, src] of html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) {
  if (!allowedImages.has(src)) fail(`index.html: afbeelding '${src}' is geen goedgekeurd lokaal logo`);
  if (!existsSync(join(root, 'brutalistisch-b', src))) fail(`index.html: afbeelding '${src}' bestaat niet`);
}
// Logo-uitvoering: masthead en footer zijn donker, dus uitsluitend het witte logo.
if (/artific-logo-blauw\.svg/.test(html)) fail('index.html: het blauwe logo hoort niet op de donkere vlakken van deze variant');

// --- kleuren: uitsluitend uit brand.json, in CSS én HTML ---
const allowedHex = new Set(brand.colors.map((c) => c.value.toUpperCase()));
for (const [file, text] of [['styles.css', css], ['index.html', html], ['main.js', js]]) {
  for (const [hex] of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    if (!allowedHex.has(hex.toUpperCase())) fail(`${file}: kleur '${hex}' staat niet in brand.json`);
  }
}
if (/rgba?\(|hsla?\(|color-mix|opacity:\s*0[^;]/.test(css)) {
  fail('styles.css: afgeleide/transparante kleuren of standaard-verborgen inhoud zijn niet toegestaan');
}
if (/border-radius|linear-gradient|radial-gradient|blur\(/.test(css)) {
  fail('styles.css: afronding, gradients of blur passen niet in deze brutalistische variant');
}

// --- progressive enhancement & motion ---
if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/gsap\.min\.js/.test(html)) fail('index.html: gepinde GSAP-CDN ontbreekt');
if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/ScrollTrigger\.min\.js/.test(html)) fail('index.html: gepinde ScrollTrigger-CDN ontbreekt');
if ((html.match(/<script[^>]*\sdefer/g) ?? []).length < 3) fail('index.html: scripts moeten met defer laden');
if (/data-marge/.test(js) && !/\sdata-marge[\s>]/.test(html)) fail('index.html: main.js animeert data-marge-doelen maar de pagina bevat er geen');
if (/data-regel/.test(js) && !/\sdata-regel[\s>]/.test(html)) fail('index.html: main.js animeert data-regel-doelen maar de pagina bevat er geen');
if (/opacity/.test(js)) fail('main.js: deze variant animeert alleen transforms; opacity-animaties zijn niet toegestaan');
if (!/prefers-reduced-motion/.test(js)) fail('main.js: reduced-motion-guard ontbreekt');
if (!/window\.gsap\s*&&\s*window\.ScrollTrigger|!window\.gsap\s*\|\|\s*!window\.ScrollTrigger/.test(js)) {
  fail('main.js: guard op ontbrekende GSAP/ScrollTrigger ontbreekt');
}
if (!/clearProps/.test(js)) fail('main.js: clearProps-opruiming van inline transforms ontbreekt');
if (!/aria-current/.test(js)) fail('main.js: registerstatus via aria-current ontbreekt');
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) fail('styles.css: prefers-reduced-motion-blok ontbreekt');
if (!/:focus-visible/.test(css)) fail('styles.css: zichtbare focusstijl ontbreekt');
if (!/scroll-margin-top/.test(css)) fail('styles.css: scroll-margin-top voor ankerfolio\'s ontbreekt');

// --- ontwerpdocument ---
const designPath = 'brutalistisch-b/DESIGN.md';
if (!existsSync(join(root, designPath))) {
  fail(`${designPath}: ontwerpdocument ontbreekt`);
} else {
  const design = read(designPath);
  for (const hoofdstuk of ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion', 'Responsief gedrag']) {
    if (!new RegExp(`^#{2,3} .*${hoofdstuk}`, 'im').test(design)) fail(`${designPath}: hoofdstuk '${hoofdstuk}' ontbreekt`);
  }
  if (!/Provenance/i.test(design)) fail(`${designPath}: provenance-verklaring (Stitch-status) ontbreekt`);
}

// --- oplevergate: de variant is pas opleverbaar met een geverifieerde huisstijlbron ---
if (brand.status !== 'verified') {
  fail(`brand.json: status is '${brand.status}' — Brutalistisch B kan niet als opgeleverd gelden zolang de huisstijlbron niet 'verified' is (zie assets/brand/README.md); de oplevering is GEBLOKKEERD`);
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Variant Brutalistisch B: alle structurele controles geslaagd.');
