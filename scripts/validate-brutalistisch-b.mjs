#!/usr/bin/env node
// Regressiecontrole van variant Brutalistisch B (tabloid register) tegen de gedeelde bron.
// Gebruik: node scripts/validate-brutalistisch-b.mjs (dependency-vrij, Node-standaardbibliotheek).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
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
  extractSingleCssBlock,
  hasCssRule,
  normalizeCssSelector as normalizeSelector,
  normalizeCssValue,
  parseCssRules,
  parseHtmlNodes,
} from './lib/variant-checks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (path) => readFileSync(join(root, path), 'utf8');

const html = read('brutalistisch-b/index.html');
const css = read('brutalistisch-b/styles.css');
const js = read('brutalistisch-b/main.js');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));
const htmlNodes = parseHtmlNodes(html);
const cssModel = parseCssRules(css);

// --- Document en tabloidstructuur ---
checkDocumentMetadata(html, fail);
const requiredSections = ['intro', 'visie', 'platform', 'organisatie', 'bewijs', 'contact'];
checkSectionOrder(html, requiredSections, fail);
const landmarkTags = new Set(htmlNodes.map((node) => node.tagName));
if (!['header', 'aside', 'main', 'footer'].every((tagName) => landmarkTags.has(tagName))) {
  fail('index.html: landmarks header/aside/main/footer zijn niet compleet');
}
if (!htmlNodes.some((node) => node.classes.has('skiplink'))) fail('index.html: skiplink ontbreekt');
if ((html.match(/<h1\b/g) ?? []).length !== 1) fail('index.html: de tabloid hoort exact één H1 te hebben');

const mastheads = htmlNodes.filter((node) => node.tagName === 'header' && node.classes.has('masthead'));
if (mastheads.length !== 1) fail(`index.html: verwacht exact één statische masthead, gevonden ${mastheads.length}`);
const registers = htmlNodes.filter((node) => node.tagName === 'aside' && node.classes.has('register'));
if (registers.length !== 1) fail(`index.html: verwacht exact één hoofdstukregister, gevonden ${registers.length}`);
const registerLists = htmlNodes.filter((node) => node.tagName === 'ol' && node.classes.has('register__lijst'));
const registerAnchors = registerLists.length === 1
  ? htmlNodes.filter((node) => node.tagName === 'a' && node.parent?.parent === registerLists[0])
    .map((node) => (node.attributes.get('href') ?? '').replace(/^#/, ''))
  : [];
if (registerLists.length !== 1 || registerAnchors.join('|') !== requiredSections.join('|')) {
  fail(`index.html: het register moet exact naar ${requiredSections.join(' → ')} verwijzen`);
}

const folios = htmlNodes.filter((node) => node.tagName === 'article' && node.classes.has('folio'));
const folioIds = folios.map((node) => node.attributes.get('id'));
if (folios.length !== 6 || folioIds.join('|') !== requiredSections.join('|')) {
  fail('index.html: verwacht exact zes folio-artikelen in registervolgorde');
}
const expectedFolioClasses = new Map([
  ['intro', 'folio--donker'],
  ['visie', 'folio--geel'],
  ['platform', 'folio--donker'],
  ['organisatie', 'folio--geel'],
  ['bewijs', 'folio--geel'],
  ['contact', 'folio--slot'],
]);
for (const folio of folios) {
  const id = folio.attributes.get('id');
  if (!folio.classes.has(expectedFolioClasses.get(id))) {
    fail(`index.html: folio #${id} mist oppervlakklasse '${expectedFolioClasses.get(id)}'`);
  }
  const directNumbers = htmlNodes.filter((node) => node.classes.has('folio__nummer') && node.parent === folio);
  if (directNumbers.length !== 1) fail(`index.html: folio #${id} moet exact één direct folionummer hebben`);
}
if (htmlNodes.filter((node) => node.classes.has('folio__nummer')).length !== 6) {
  fail('index.html: buiten de zes folio’s mogen geen extra folionummers staan');
}

const spreads = htmlNodes.filter((node) => node.classes.has('spread'));
const moduleClaims = ['mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation'];
if (spreads.length !== 1) {
  fail(`index.html: verwacht exact één modulespread, gevonden ${spreads.length}`);
} else {
  const allParts = htmlNodes.filter((node) => node.classes.has('spread__deel'));
  const parts = allParts.filter((node) => node.tagName === 'section' && node.parent === spreads[0]);
  const foundClaims = parts.map((node) => node.attributes.get('data-claim-id'));
  if (allParts.length !== 3 || parts.length !== 3 || foundClaims.join('|') !== moduleClaims.join('|')) {
    fail(`index.html: modulevolgorde moet ${moduleClaims.join(' → ')} zijn binnen één directe spread`);
  }
}
const ledgers = htmlNodes.filter((node) => node.tagName === 'dl' && node.classes.has('grootboek'));
const ledgerPosts = ledgers.length === 1
  ? htmlNodes.filter((node) => node.classes.has('grootboek__post') && node.parent === ledgers[0])
  : [];
if (ledgers.length !== 1 || ledgerPosts.length !== 6) {
  fail('index.html: het security-grootboek moet exact zes directe posten bevatten');
}

// --- Claims, CTA's en merkassets ---
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
checkLinksAndCtas(html, content, { minCtaCount: 5, minCtaHint: 'masthead, intro en slot' }, fail);
checkImages(html, css, brand, root, 'brutalistisch-b', fail);

const logos = htmlNodes.filter((node) => node.tagName === 'img' && node.classes.has('brand-logo'));
if (logos.length !== 2) fail(`index.html: verwacht exact masthead- en footerlogo, gevonden ${logos.length}`);
const mastheadLogo = logos.find((node) => node.parent === mastheads[0]);
if (!mastheadLogo || mastheadLogo.attributes.get('src') !== '../assets/brand/artific-logo-navy.png' ||
    mastheadLogo.attributes.get('data-brand-logo') !== 'logo-navy' ||
    mastheadLogo.attributes.get('data-brand-background') !== 'artific-geel') {
  fail('index.html: de gele masthead moet exact het originele lokale logo-navy-PNG gebruiken');
}
const footerLogo = logos.find((node) => node.parent?.tagName === 'footer');
if (!footerLogo || footerLogo.attributes.get('src') !== '../assets/brand/artific-logo-wit.svg' ||
    footerLogo.attributes.get('data-brand-logo') !== 'logo-wit' ||
    footerLogo.attributes.get('data-brand-background') !== 'artific-navy') {
  fail('index.html: de navy footer moet exact het witte lokale logo gebruiken');
}
if (/<svg\b/i.test(html)) fail('index.html: inline SVG is niet toegestaan');

// --- Kleur- en oppervlaktecontracten ---
checkBrandColors([['styles.css', css], ['index.html', html], ['main.js', js]], brand, fail);
checkContrastUsage(html, css, brand, [
  { foregroundSelector: 'body', backgroundSelector: 'body', pairId: 'navy-op-geel' },
  { foregroundSelector: '.skiplink', backgroundSelector: '.skiplink', pairId: 'wit-op-navy' },
  { foregroundSelector: '.masthead', backgroundSelector: '.masthead', pairId: 'navy-op-geel' },
  { foregroundSelector: '.register', backgroundSelector: '.register', pairId: 'navy-op-geel' },
  { foregroundSelector: '.register__lijst a', backgroundSelector: '.register', pairId: 'navy-op-geel' },
  { foregroundSelector: '.register__lijst a:hover', backgroundSelector: '.register__lijst a:hover', pairId: 'geel-op-navy' },
  { foregroundSelector: '.register__lijst a[aria-current="location"]', backgroundSelector: '.register__lijst a[aria-current="location"]', pairId: 'geel-op-navy' },
  { foregroundSelector: '.folio--geel', backgroundSelector: '.folio--geel', pairId: 'navy-op-geel' },
  { foregroundSelector: '.folio--donker', backgroundSelector: '.folio--donker', pairId: 'wit-op-navy' },
  { foregroundSelector: '.folio--slot', backgroundSelector: '.folio--slot', pairId: 'wit-op-navy' },
  { foregroundSelector: '.folio--geel .margewoord', backgroundSelector: '.folio--geel', pairId: 'navy-op-geel' },
  { foregroundSelector: '.folio--donker .margewoord', backgroundSelector: '.folio--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.folio--donker .folio__nummer', backgroundSelector: '.folio--donker', pairId: 'geel-op-navy' },
  { foregroundSelector: '.folio--slot .folio__nummer', backgroundSelector: '.folio--slot', pairId: 'geel-op-navy' },
  { foregroundSelector: '.reis li::before', backgroundSelector: '.folio--geel', pairId: 'navy-op-geel' },
  { foregroundSelector: '.kader--niet', backgroundSelector: '.kader--niet', pairId: 'navy-op-lichtblauw' },
  { foregroundSelector: '.spread__deel', backgroundSelector: '.spread__deel', pairId: 'navy-op-geel' },
  { foregroundSelector: '.spread__folio', backgroundSelector: '.spread__deel', pairId: 'navy-op-geel' },
  { foregroundSelector: '.cta--masthead', backgroundSelector: '.cta--masthead', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--zwaar', backgroundSelector: '.cta--zwaar', pairId: 'wit-op-navy' },
  { foregroundSelector: '.cta--licht', backgroundSelector: '.cta--licht', pairId: 'navy-op-geel' },
  { foregroundSelector: '.folio--donker .cta--zwaar', backgroundSelector: '.folio--donker .cta--zwaar', pairId: 'navy-op-geel' },
  { foregroundSelector: '.folio--slot .cta--zwaar', backgroundSelector: '.folio--slot .cta--zwaar', pairId: 'navy-op-geel' },
  { foregroundSelector: '.folio--donker .cta--licht', backgroundSelector: '.folio--donker .cta--licht', pairId: 'wit-op-navy' },
  { foregroundSelector: '.folio--slot .cta--licht', backgroundSelector: '.folio--slot .cta--licht', pairId: 'wit-op-navy' },
  { foregroundSelector: '.colofonvoet', backgroundSelector: '.colofonvoet', pairId: 'wit-op-navy' },
  { foregroundSelector: '.colofonvoet__noot', backgroundSelector: '.colofonvoet', pairId: 'lichtblauw-op-navy' },
], fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);

if (/rgba?\(|hsla?\(|color-mix|\btransparent\b|opacity\s*:|visibility\s*:\s*hidden|display\s*:\s*none/.test(css) ||
    /<[^>]+\shidden(?:\s|=|>)/i.test(html)) {
  fail('styles.css/index.html: afgeleide kleuren, transparantie of standaard-verborgen inhoud zijn niet toegestaan');
}
if (/border-radius|(?:linear|radial|conic)-gradient|blur\(|filter\s*:|box-shadow|text-shadow/.test(css)) {
  fail('styles.css: afronding, gradients, blur, filters en schaduwen zijn niet toegestaan');
}
if (/\b(?:commandobar|sectiecode|plaat|pipeline|signaalstrook|trust-console|module-card|bewijsrail|boekdeel|dossierregel|evidence-index|assurance-ledger)\b/i.test(`${html}\n${css}\n${js}`)) {
  fail('brutalistisch-b: runtime bevat een verboden signatuur van een zustervariant');
}
if (/21st\.dev|magic-mcp/i.test(`${html}\n${css}\n${js}`)) {
  fail('brutalistisch-b: 21st.dev mag geen runtime-afhankelijkheid zijn');
}

const stickyRules = cssModel.rules.filter((rule) => normalizeCssValue(rule.declarations.get('position') ?? '') === 'sticky');
if (stickyRules.length !== 1 || stickyRules[0].selectors.length !== 1 || normalizeSelector(stickyRules[0].selectors[0]) !== '.register') {
  fail('styles.css: alleen .register mag position: sticky gebruiken');
}
if (cssModel.rules.some((rule) => rule.selectors.some((selector) => normalizeSelector(selector) === '.masthead') &&
    ['sticky', 'fixed'].includes(rule.declarations.get('position')))) {
  fail('styles.css: de masthead hoort statisch in de documentflow te staan');
}

// --- Brede desktoptrap en expliciete mobiele reset ---
const desktopModel = parseCssRules(extractSingleCssBlock(
  css,
  /@media\s*\(\s*min-width\s*:\s*1040px\s*\)\s*\{/g,
  'desktopmediaquery (min-width: 1040px)',
  fail
));
const mobileModel = parseCssRules(extractSingleCssBlock(
  css,
  /@media\s*\(\s*max-width\s*:\s*1039px\s*\)\s*\{/g,
  'mobiele mediaquery (max-width: 1039px)',
  fail
));
const desktopSpreadContracts = [
  ['.spread', { 'grid-template-columns': 'repeat(12, minmax(0, 1fr))', 'row-gap': '0' }],
  ['.spread > .spread__deel:nth-child(1)', { 'grid-column': '1 / 11', 'grid-row': '1' }],
  ['.spread > .spread__deel:nth-child(2)', { 'grid-column': '2 / 12', 'grid-row': '2' }],
  ['.spread > .spread__deel:nth-child(3)', { 'grid-column': '3 / 13', 'grid-row': '3' }],
  ['.spread__deel', { 'grid-template-columns': 'minmax(180px, 1fr) minmax(0, 2fr)' }],
];
for (const [selector, declarations] of desktopSpreadContracts) {
  if (!hasCssRule(desktopModel, selector, declarations)) {
    fail(`styles.css: desktopspread '${selector}' mist zijn brede twaalfkolomscontract`);
  }
}
if (!hasCssRule(mobileModel, '.spread', { 'grid-template-columns': 'minmax(0, 1fr)', width: '100%' })) {
  fail('styles.css: de spread mist haar volledige lineaire reset onder 1040px');
}
for (const selector of [
  '.spread > .spread__deel',
  '.spread > .spread__deel:nth-child(1)',
  '.spread > .spread__deel:nth-child(2)',
  '.spread > .spread__deel:nth-child(3)',
]) {
  if (!hasCssRule(mobileModel, selector, { 'grid-column': 'auto', 'grid-row': 'auto', margin: '0', width: '100%' })) {
    fail(`styles.css: mobiele spread '${selector}' mist een volledige lineaire reset`);
  }
}

// --- Progressive enhancement en korte transformbeweging ---
checkMotionGuards(html, css, js, fail);
if (/\b(?:pin|snap|scrollTo|autoScroll|parallax|marquee|scrub)\b/.test(js)) {
  fail('main.js: voortdurende, gepinde of automatisch scrollende beweging is niet toegestaan');
}
if (/\b(?:width|height|top|right|bottom|left|margin|padding|filter)\s*:/.test(js)) {
  fail('main.js: motion mag geen layout- of filterproperty animeren');
}
if (!/immediateRender:\s*false/.test(js) || !/once:\s*true/.test(js) || !/overwrite:\s*"auto"/.test(js)) {
  fail('main.js: redactionele entrees missen immediateRender/once/overwrite-afspraken');
}
if (!/\.folio__nummer, \[data-marge\]/.test(js) || !/\[data-regel\]/.test(js) || !/\.spread__deel/.test(js)) {
  fail('main.js: gerichte beweging voor foliolabels, regels en spreadbanden ontbreekt');
}
const spreadOffsetContract = js.match(
  /var\s+spreadOffset\s*=\s*window\.innerWidth\s*>=\s*1040\s*\?\s*(\d+)\s*:\s*(\d+)/
);
if (!spreadOffsetContract || Number(spreadOffsetContract[1]) > 18 || Number(spreadOffsetContract[2]) > 8 ||
    !/x:\s*index === 1 \? spreadOffset : -spreadOffset/.test(js)) {
  fail('main.js: de spreadentree mist een desktopoffset van maximaal 18px en mobiele veilige offset van maximaal 8px');
}
if (/\w+\.push\(\s*gsap\.to/.test(js)) {
  fail('main.js: CTA-hover-tweens mogen niet onbeperkt in de redactionele tweenregistratie blijven staan');
}
if (!/addEventListener\(\s*"change"/.test(js) || !/scrollTrigger\) \{ scrollTrigger\.kill\(\)/.test(js) ||
    !/gsap\.set\(motionTargets, \{ clearProps: "transform" \}\)/.test(js) || !/gsap\.killTweensOf\(/.test(js)) {
  fail('main.js: dynamische reduced-motion-opruiming van triggers, CTA-tweens en transforms ontbreekt');
}

try {
  const motionPreference = {
    matches: false,
    addEventListener(type, listener) {
      if (type === 'change') this.changeListener = listener;
    },
  };
  const ctaListeners = new Map();
  const cta = {
    addEventListener(type, listener) { ctaListeners.set(type, listener); },
  };
  const ctaTargets = [cta];
  let ctaTweenCount = 0;
  let killedCtaTargets = null;
  let clearedTargets = null;
  const gsapStub = {
    registerPlugin() {},
    from() { return { kill() {}, scrollTrigger: { kill() {} } }; },
    to() { ctaTweenCount += 1; return { kill() {} }; },
    killTweensOf(targets) { killedCtaTargets = targets; },
    set(targets, vars) {
      if (vars.clearProps === 'transform') clearedTargets = targets;
    },
  };
  const documentStub = {
    querySelectorAll(selector) {
      if (selector === '.cta') return ctaTargets;
      if (selector.includes('.cta')) return ctaTargets;
      return [];
    },
    querySelector() { return null; },
  };
  runInNewContext(js, {
    window: {
      matchMedia() { return motionPreference; },
      innerWidth: 320,
      gsap: gsapStub,
      ScrollTrigger: { create() { return { kill() {} }; } },
    },
    document: documentStub,
  });

  const enter = ctaListeners.get('mouseenter');
  const leave = ctaListeners.get('mouseleave');
  if (!enter || !leave) throw new Error('CTA-hoverhandlers ontbreken');
  enter({ currentTarget: cta });
  if (ctaTweenCount !== 1) throw new Error('CTA-hover maakt zonder reduced motion geen tween');
  motionPreference.matches = true;
  motionPreference.changeListener?.({ matches: true });
  const countAfterCleanup = ctaTweenCount;
  enter({ currentTarget: cta });
  leave({ currentTarget: cta });
  if (ctaTweenCount !== countAfterCleanup) throw new Error('CTA-hover maakt na reduced motion nog tweens');
  if (killedCtaTargets !== ctaTargets) throw new Error('bestaande CTA-tweens worden niet gericht gestopt');
  if (clearedTargets === null) throw new Error('transforms worden niet gewist');
} catch (error) {
  fail(`main.js: dynamisch reduced-motion-contract voor CTA’s faalt (${error.message})`);
}
if (!/aria-current/.test(js)) fail('main.js: registerstatus via aria-current ontbreekt');

// --- Ontwerpdocument en oplevergate ---
checkDesignDoc(root, 'brutalistisch-b/DESIGN.md', () => read('brutalistisch-b/DESIGN.md'),
  ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion', 'Responsief gedrag'], fail);
checkBrandGate(brand, 'Brutalistisch B', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('Variant Brutalistisch B: alle structurele controles geslaagd.');
