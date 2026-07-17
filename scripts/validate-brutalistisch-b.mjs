#!/usr/bin/env node
// Regressiecontrole van de geel/navy-relatiedeckvariant Brutalistisch B.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import {
  checkBrandColors,
  checkBrandGate,
  checkClaims,
  checkCustomerReviews,
  checkContrastUsage,
  checkDesignDoc,
  checkDocumentMetadata,
  checkImages,
  checkLinksAndCtas,
  checkNoPdfRuntime,
  checkSectionOrder,
  parseCssRules,
  parseHtmlNodes,
} from './lib/variant-checks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (message) => errors.push(message);
const read = (path) => readFileSync(join(root, path), 'utf8');

const html = read('brutalistisch-b/index.html');
const css = read('brutalistisch-b/styles.css');
const js = read('brutalistisch-b/main.js');
const design = read('brutalistisch-b/DESIGN.md');
const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));
const nodes = parseHtmlNodes(html);
const cssModel = parseCssRules(css);

const textContent = (source) => source.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const directChildren = (parent, tagName) => nodes.filter((node) => node.parent === parent && (!tagName || node.tagName === tagName));
const declarations = (selector, property) => cssModel.rules
  .filter((rule) => rule.selectors.includes(selector) && rule.declarations.has(property))
  .map((rule) => rule.declarations.get(property));

// Document, landmarks en nieuwe sectievolgorde.
checkDocumentMetadata(html, fail);
const sectionOrder = ['intro', 'bewijs', 'visie', 'platform', 'organisatie', 'contact'];
checkSectionOrder(html, sectionOrder, fail);
for (const tagName of ['header', 'main', 'footer']) {
  if (!nodes.some((node) => node.tagName === tagName)) fail(`index.html: landmark <${tagName}> ontbreekt`);
}
if (!nodes.some((node) => node.classes.has('skiplink'))) fail('index.html: skiplink ontbreekt');
if (!/<main\s+id="inhoud"[^>]*tabindex="-1"/.test(html)) fail('index.html: focusbaar main#inhoud ontbreekt');
const sections = nodes.filter((node) => node.tagName === 'section' && sectionOrder.includes(node.attributes.get('id')));
if (sections.length !== 6 || sections.map((node) => node.attributes.get('id')).join('|') !== sectionOrder.join('|')) {
  fail(`index.html: verwacht zes semantische hoofdsecties in volgorde ${sectionOrder.join(' → ')}`);
}
for (const section of sections) {
  const id = section.attributes.get('id');
  const labelledBy = section.attributes.get('aria-labelledby');
  if (!labelledBy || !nodes.some((node) => node.attributes.get('id') === labelledBy && /^h[12]$/.test(node.tagName))) {
    fail(`index.html: sectie #${id} mist een geldige koprelatie`);
  }
}

// Ongeordende onderwerpstrip in plaats van een hoofdstukconstructie.
const topicNavs = nodes.filter((node) => node.tagName === 'nav' && node.classes.has('topic-switcher'));
if (topicNavs.length !== 1 || topicNavs[0].attributes.get('aria-label') !== 'Direct naar onderwerp') {
  fail('index.html: exact één gelabelde topic-switcher ontbreekt');
} else {
  const hrefs = directChildren(topicNavs[0], 'a').map((node) => node.attributes.get('href'));
  const expected = sectionOrder.map((id) => `#${id}`);
  if (hrefs.join('|') !== expected.join('|')) fail(`index.html: topic-switcher moet exact ${expected.join(' → ')} volgen`);
  if (directChildren(topicNavs[0]).some((node) => ['ol', 'ul'].includes(node.tagName))) {
    fail('index.html: topic-switcher mag geen genummerde of lijstvormige hoofdstuknavigatie zijn');
  }
}

// Relatiedeck: negen zelfstandige logo-items met progressieve autoplaybediening.
const decks = nodes.filter((node) => node.classes.has('relationship-deck') && node.attributes.has('data-relationship-deck'));
const tracks = nodes.filter((node) => node.tagName === 'ol' && node.classes.has('relationship-track'));
if (decks.length !== 1 || tracks.length !== 1 || !tracks[0].parent || tracks[0].parent !== decks[0]) {
  fail('index.html: één relatiedeck met een directe, statische track ontbreekt');
}
const slides = tracks.length === 1
  ? directChildren(tracks[0], 'li').filter((node) => node.attributes.has('data-relation-id'))
  : [];
const expectedRelations = [
  ['fc-twente', 'FC Twente'],
  ['basic-fit', 'Basic-Fit'],
  ['eneco', 'Eneco'],
  ['marktplaats', 'Marktplaats'],
  ['hollandsnieuwe', 'hollandsnieuwe'],
  ['gemeente-den-haag', 'Gemeente Den Haag'],
  ['rtv-oost', 'RTV Oost'],
  ['veiligheidsregio-zuid-limburg', 'Veiligheidsregio Zuid-Limburg'],
  ['vechtsteden-notarissen', 'Vechtsteden Notarissen'],
];
if (slides.length !== expectedRelations.length) {
  fail(`index.html: relatiedeck bevat ${slides.length} in plaats van negen directe items`);
} else {
  slides.forEach((slide, index) => {
    const [id, name] = expectedRelations[index];
    if (slide.attributes.get('data-relation-id') !== id || slide.attributes.get('data-relation-name') !== name) {
      fail(`index.html: relatie ${index + 1} moet '${id}' / '${name}' zijn`);
    }
    if (!slide.attributes.get('id')) fail(`index.html: relatie '${id}' mist een stabiel anker-ID`);
  });
}
if (!tracks[0] || tracks[0].attributes.get('tabindex') !== '0' ||
    tracks[0].attributes.get('aria-roledescription') !== 'carousel' || !tracks[0].attributes.get('aria-label')) {
  fail('index.html: relatietrack mist toetsenbordfocus of toegankelijke carrouselnaam');
}
const pagination = nodes.find((node) => node.classes.has('relationship-pagination'));
const paginationLinks = pagination ? directChildren(pagination, 'a') : [];
if (paginationLinks.length !== 9 || paginationLinks.some((link, index) =>
  link.attributes.get('href') !== `#${slides[index]?.attributes.get('id')}` || !link.attributes.get('aria-label'))) {
  fail('index.html: de no-JS-relatienavigatie moet negen gelabelde ankerlinks bevatten');
}
const enhancement = nodes.filter((node) => node.classes.has('relationship-enhancement') && node.attributes.has('data-deck-enhancement'));
if (enhancement.length !== 1 || enhancement[0].attributes.get('aria-label') !== 'Slideshowbediening') {
  fail('index.html: lege, gelabelde enhancement-mount ontbreekt');
}
const customerImages = nodes.filter((node) => node.tagName === 'img' && node.attributes.has('data-client-logo'));
if (customerImages.length !== expectedRelations.length || slides.some((slide) =>
  !directChildren(slide).some((child) => directChildren(child, 'img').some((image) => image.attributes.has('data-client-logo'))))) {
  fail('index.html: iedere klantrelatie moet exact één lokaal, herkenbaar klantlogo bevatten');
}
if (html.indexOf('data-relationship-deck') > html.indexOf('id="bewijs"')) {
  fail('index.html: het relatiedeck moet bovenaan in intro vóór de bewijssectie staan');
}

// Canonieke inhoud, strikte formuleringen, CTA's en merkasset.
checkClaims(html, content, {
  strictVariantTexts: {
    'pos-besparing-30': ['Bespaar 30% van je tijd met één AI-platform.'],
    'pos-nederlands': ['Door Nederlandse AI-professionals gebouwd; NL-gehost, AVG-proof en snel inzetbaar.'],
    'pos-badges': ['EU-gehost, ISO 27001 gecertificeerd, API-first en model-agnostisch.'],
    'pos-award': ['Artific is uitgeroepen tot AI Company of the Year 2025 tijdens de Nationale AI Awards.'],
    'bw-quote-leqqr': ['De Artific AI-Assistent werkt als een trein. In drie weken tijd hebben we al een enorme bespaard op personele kosten en de kwaliteit van onze support is alleen maar beter geworden.'],
    'bw-100-klanten': ['We helpen meer dan 100 klanten om AI voor hen te laten werken.', 'Van enterprise tot overheid, bij organisaties die security, governance en betrouwbaarheid serieus nemen.'],
    'sec-eu': ['Alle data, alle infrastructuur, alle processing binnen de EU.'],
    'sec-iso': ['Onafhankelijke audit van het informatiebeveiligingssysteem, continu onderhouden.'],
    'sec-pseudo': ['Persoonlijk identificeerbare informatie wordt gedetecteerd en gepseudonimiseerd voordat het ooit een model bereikt.'],
    'sec-audit': ['Elke prompt, elke tool-call, elke beslissing wordt vastgelegd in het systeem.'],
    'bo-aftercare': ['Na livegang blijven we betrokken: monitoring, optimalisatie en minimaal één update-sync-meeting per kwartaal.'],
    'bo-support': ['Met 1e-, 2e- en 3e-lijns support ben je altijd verzekerd van de juiste ondersteuning.'],
  },
  requiredClaims: [
    'pos-belofte', 'pos-agentic-platform', 'pos-badges',
    'bw-100-klanten',
    'dm-kop', 'vvt-veilig', 'vvt-voorspelbaar', 'vvt-transparant',
    'reis-fase-1', 'reis-fase-2', 'reis-fase-3',
    'ctl-positie', 'ctl-tussen-model-en-proces', 'ctl-platformlagen',
    'mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation',
    'ph-portal', 'ph-headless', 'cc-een-plek', 'cc-it-kaders',
    'sec-ontwerp', 'sec-eu', 'sec-iso', 'sec-pseudo', 'sec-audit',
    'pm-markt', 'pm-laag-artific', 'pm-laag-partners', 'pm-laag-klanten',
    'bo-vijf-stappen', 'bo-aftercare', 'bo-support', 'cv-versnellen',
  ],
}, fail);
checkLinksAndCtas(html, content, { minCtaCount: 5, minCtaHint: 'header, intro en contact' }, fail);
checkImages(html, css, brand, root, 'brutalistisch-b', fail);
checkCustomerReviews(html, fail);
checkBrandColors([['brutalistisch-b/index.html', html], ['brutalistisch-b/styles.css', css], ['brutalistisch-b/main.js', js]], brand, fail);
checkNoPdfRuntime([['index.html', html], ['styles.css', css], ['main.js', js]], fail);

const logos = nodes.filter((node) => node.tagName === 'img' && node.classes.has('brand-logo'));
const logoIsInBrandStage = logos[0] && (() => {
  for (let ancestor = logos[0].parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.classes?.has('brand-stage')) return true;
  }
  return false;
})();
if (logos.length !== 1 || logos[0].attributes.get('src') !== '../assets/brand/artific-logo-navy.png' ||
    logos[0].attributes.get('data-brand-background') !== 'artific-geel' || !logoIsInBrandStage) {
  fail('index.html: exact één officieel navy Artific-logo moet in de gele brand-stage staan');
}

// Geel/navy-oppervlakken, contrast en visuele eigenheid.
const surfaceContracts = [
  ['body', 'color', 'var(--navy)'], ['body', 'background-color', 'var(--yellow)'],
  ['.brand-stage', 'color', 'var(--navy)'], ['.brand-stage', 'background-color', 'var(--yellow)'],
  ['.section-yellow', 'color', 'var(--navy)'], ['.section-yellow', 'background-color', 'var(--yellow)'],
  ['.section-navy', 'color', 'var(--white)'], ['.section-navy', 'background-color', 'var(--navy)'],
  ['.button--navy', 'color', 'var(--white)'], ['.button--navy', 'background-color', 'var(--navy)'],
  ['.button--yellow', 'color', 'var(--navy)'], ['.button--yellow', 'background-color', 'var(--yellow)'],
  ['.relationship-card', 'color', 'var(--navy)'], ['.relationship-card', 'background-color', 'var(--light-blue)'],
  ['.site-footer', 'color', 'var(--white)'], ['.site-footer', 'background-color', 'var(--navy)'],
];
for (const [selector, property, value] of surfaceContracts) {
  const foundValues = declarations(selector, property);
  const expectedValue = value.replace(/\s+/g, '');
  if (foundValues.length === 0 || foundValues.some((foundValue) => foundValue.replace(/\s+/g, '') !== expectedValue)) {
    fail(`styles.css: contrastcontract '${selector} { ${property}: ${value} }' ontbreekt of wordt overschreven`);
  }
}

const bodyTextContrastSelectors = ['.control-stack .control-stack__core', '.module-block--conversation'];
const bodyTextContrastHooks = ['.control-stack__core', '.module-block--conversation'];
const contrastRules = cssModel.rules.filter((rule) => rule.selectors.some((selector) =>
  bodyTextContrastHooks.some((hook) => selector.includes(hook))
));
const contrastCss = [
  `:root { ${[...cssModel.variables].map(([property, value]) => `${property}: ${value};`).join(' ')} }`,
  ...contrastRules.map((rule) => `${rule.selectors.join(', ')} { ${[...rule.declarations].map(([property, value]) => `${property}: ${value};`).join(' ')} }`),
].join('\n');
checkContrastUsage(html, contrastCss, brand, bodyTextContrastSelectors.map((selector) => ({
  foregroundSelector: selector,
  backgroundSelector: selector,
  pairId: 'wit-op-navy',
})), fail);

const elementMatchesCompound = (element, rawCompound) => {
  let compound = rawCompound.replace(/:(?:hover|focus|focus-visible|focus-within|active|target)\b/g, '');
  for (const match of compound.matchAll(/:not\(([^)]+)\)/g)) {
    if (elementMatchesCompound(element, match[1])) return false;
  }
  compound = compound.replace(/:not\([^)]+\)/g, '');
  const nthChild = compound.match(/:nth-child\((\d+)\)/);
  if (nthChild && element.childIndex !== Number(nthChild[1])) return false;
  compound = compound.replace(/:nth-child\([^)]+\)/g, '');
  const tagName = compound.match(/^[a-z][\w-]*/i)?.[0];
  if (tagName && element.tagName !== tagName.toLowerCase()) return false;
  for (const className of compound.matchAll(/\.([\w-]+)/g)) {
    if (!element.classes.has(className[1])) return false;
  }
  for (const id of compound.matchAll(/#([\w-]+)/g)) {
    if (element.id !== id[1]) return false;
  }
  return true;
};
const selectorMatchesChain = (selector, chain) => {
  const tokens = selector.replace(/\s*>\s*/g, ' > ').trim().split(/\s+/).filter(Boolean);
  const matchAt = (chainIndex, tokenIndex) => {
    if (!chain[chainIndex] || tokenIndex < 0 || !elementMatchesCompound(chain[chainIndex], tokens[tokenIndex])) return false;
    if (tokenIndex === 0) return true;
    if (tokens[tokenIndex - 1] === '>') return matchAt(chainIndex + 1, tokenIndex - 2);
    for (let ancestorIndex = chainIndex + 1; ancestorIndex < chain.length; ancestorIndex += 1) {
      if (matchAt(ancestorIndex, tokenIndex - 1)) return true;
    }
    return false;
  };
  return !/[+~]/.test(selector) && matchAt(0, tokens.length - 1);
};
const selectorSpecificity = (selector) => {
  const ids = (selector.match(/#[\w-]+/g) ?? []).length;
  const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
  const tags = selector.replace(/:not\(([^)]+)\)/g, ' $1 ')
    .split(/[\s>+~]+/).filter((part) => /^[a-z]/i.test(part)).length;
  return ids * 100 + classes * 10 + tags;
};
const resolveCssColor = (value) => {
  let resolved = value?.trim();
  const variable = resolved?.match(/^var\((--[\w-]+)\)$/)?.[1];
  if (variable) resolved = cssModel.variables.get(variable);
  return resolved?.toUpperCase();
};
const computedCriticalColors = (chain) => {
  const winners = { color: null, background: null };
  cssModel.rules.forEach((rule, sourceIndex) => {
    rule.selectors.forEach((selector) => {
      if (!selectorMatchesChain(selector, chain)) return;
      const specificity = selectorSpecificity(selector);
      const candidates = [
        ['color', rule.declarations.get('color')],
        ['background', rule.declarations.get('background-color') ?? rule.declarations.get('background')],
      ];
      candidates.forEach(([property, value]) => {
        if (!value) return;
        const winner = winners[property];
        if (!winner || specificity > winner.specificity || (specificity === winner.specificity && sourceIndex >= winner.sourceIndex)) {
          winners[property] = { value, specificity, sourceIndex, selector };
        }
      });
    });
  });
  return winners;
};
const criticalContrastChains = [
  {
    label: 'controlelaag-kern',
    chain: [
      { tagName: 'div', classes: new Set(['control-stack__core']), childIndex: 2 },
      { tagName: 'div', classes: new Set(['control-stack']) },
      { tagName: 'section', classes: new Set(['platform-zone', 'section-navy']) },
      { tagName: 'main', classes: new Set() },
      { tagName: 'body', classes: new Set() },
    ],
  },
  {
    label: 'conversation-module',
    chain: [
      { tagName: 'article', classes: new Set(['module-block', 'module-block--conversation']) },
      { tagName: 'div', classes: new Set(['module-blocks']) },
      { tagName: 'section', classes: new Set(['platform-zone', 'section-navy']) },
      { tagName: 'main', classes: new Set() },
      { tagName: 'body', classes: new Set() },
    ],
  },
];
for (const { label, chain } of criticalContrastChains) {
  const computed = computedCriticalColors(chain);
  if (resolveCssColor(computed.color?.value) !== '#FFFFFF' || resolveCssColor(computed.background?.value) !== '#042244') {
    fail(`styles.css: cascade voor ${label} moet wit op Deep Navy blijven; gevonden '${computed.color?.selector ?? 'geen kleur'}' / '${computed.background?.selector ?? 'geen achtergrond'}'`);
  }
}

if ((css.match(/background-image\s*:/g) ?? []).length < 7 ||
    !/radial-gradient/.test(css) || !/conic-gradient/.test(css) || !/repeating-linear-gradient/.test(css)) {
  fail('styles.css: gelaagde shader-velden met meerdere goedgekeurde gradientvormen ontbreken');
}
for (const hook of ['relationship-card', 'question-burst', 'module-block', 'control-stack', 'build-mode', 'governance-card', 'partner-relay', 'guidance-steps']) {
  if (!html.includes(hook) || !css.includes(`.${hook}`)) fail(`brutalistisch-b: onderscheidende kaartvorm '${hook}' ontbreekt`);
}
if (!/@media \(max-width: 699px\)/.test(css) || !/@media \(min-width: 700px\)/.test(css) || !/@media \(min-width: 1080px\)/.test(css)) {
  fail('styles.css: compacte, midden- en brede layoutcontracten ontbreken');
}
if (!/overflow-x:\s*auto/.test(css) || !/scroll-snap-type:\s*inline mandatory/.test(css) || !/overflow-wrap:\s*anywhere/.test(css)) {
  fail('styles.css: begrensde deckscroll, snapping of veilige woordafbreking ontbreekt');
}
if (!/:focus-visible/.test(css) || !/outline:\s*3px solid/.test(css) || !/scroll-margin-top/.test(css)) {
  fail('styles.css: focus- of ankercontract ontbreekt');
}
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css) || !/scroll-behavior:\s*auto/.test(css) ||
    !/animation-duration:\s*0\.01ms/.test(css) || !/transition-duration:\s*0\.01ms/.test(css)) {
  fail('styles.css: volledige reduced-motion-afbouw ontbreekt');
}
if (/\b(?:visibility\s*:\s*hidden|display\s*:\s*none)\b/i.test(css) ||
    /<[^>]+\s(?:hidden|inert)(?:\s|=|>)/i.test(html)) {
  fail('brutalistisch-b: kerninhoud mag niet standaard verborgen of inert zijn');
}
if (!/\.motion-ready \[data-motion-text\]/.test(css) || !/\.motion-ready \[data-motion-surface\]/.test(css) ||
    !/motion-ready/.test(js) || !/IntersectionObserver/.test(js)) {
  fail('brutalistisch-b: progressieve tekst- en oppervlakchoreografie ontbreekt');
}
if (!/data-shader-canvas/.test(html) || !/fragmentSource/.test(js) || !/getContext\("webgl"/.test(js)) {
  fail('brutalistisch-b: lokale WebGL-shaderlaag ontbreekt');
}

const retiredRuntime = /\b(?:masthead|folio|hoofdstukregister|krantkolom|modulespread|grootboek|tabloid|registertaal)\b/i;
if (retiredRuntime.test(`${html}\n${css}\n${js}`)) fail('brutalistisch-b: een oude redactionele B-signatuur is teruggekeerd');
if (/\b(?:commandobar|sectiecode|blueprint-grid|trust-console|bewijsrail|boekdeel|dossierregel|evidence-index|assurance-ledger)\b/i.test(`${html}\n${css}\n${js}`)) {
  fail('brutalistisch-b: runtime bevat een herkenbare zustervariantsignatuur');
}
const runtimeScripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"[^>]*>/gi)].map((match) => match[1]);
const approvedRuntimeScripts = new Set(['assets/vendor/gsap-3.13.0.min.js', 'main.js']);
if (/https?:\/\//.test(js) || runtimeScripts.some((source) => !approvedRuntimeScripts.has(source)) ||
    /fetch\s*\(|XMLHttpRequest|WebSocket/.test(js)) {
  fail('brutalistisch-b: runtime moet lokaal en netwerk-onafhankelijk blijven');
}
if (runtimeScripts.join('|') !== 'assets/vendor/gsap-3.13.0.min.js|main.js' ||
    !/gsap\.matchMedia\(\)/.test(js) || !/gsap\.timeline\(/.test(js) ||
    !/willChange/.test(js) || !/ambient-paused/.test(`${js}\n${css}`)) {
  fail('brutalistisch-b: lokale GSAP loading-, timeline- of performancechoreografie ontbreekt');
}
if (/21st\.dev|magic(?:-mcp)?|api[_-]?key|x-api-key/i.test(`${html}\n${css}\n${js}\n${design}`)) {
  fail('brutalistisch-b: externe provider-, configuratie- of secretmarker mag niet in route/documentatie staan');
}

// Progressieve deckbediening met pauzeerbare autoplay.
if (!/setInterval/.test(js) || !/autoplayDelay\s*=\s*4200/.test(js) || !/Automatische slideshow pauzeren/.test(js)) {
  fail('main.js: pauzeerbare autoplay voor het relatiedeck ontbreekt');
}
if (/classList\.(?:add|remove)\([^)]*hidden|style\.(?:display|visibility)|setAttribute\(["']hidden/.test(js)) {
  fail('main.js: enhancement mag geen kerninhoud tonen of verbergen');
}

try {
  const listeners = new Map();
  const animationFrames = [];
  const makeInteractive = () => ({
    attributes: new Map(),
    listeners: new Map(),
    className: '', type: '', textContent: '',
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
    removeAttribute(name) { this.attributes.delete(name); },
    getAttribute(name) { return this.attributes.get(name) ?? null; },
    addEventListener(type, listener) { this.listeners.set(type, listener); },
  });
  const scrollCalls = [];
  const slidesStub = expectedRelations.map(([id, name], index) => {
    const slide = makeInteractive();
    slide.offsetLeft = index * 300;
    slide.setAttribute('data-relation-id', id);
    slide.setAttribute('data-relation-name', name);
    slide.scrollIntoView = () => { throw new Error('carrousel mag de documentpositie niet via scrollIntoView wijzigen'); };
    return slide;
  });
  const linksStub = expectedRelations.map(() => makeInteractive());
  const trackStub = makeInteractive();
  trackStub.scrollLeft = 0;
  trackStub.scrollTo = (options) => scrollCalls.push(options);
  const mountStub = makeInteractive();
  mountStub.children = [];
  mountStub.appendChild = (child) => mountStub.children.push(child);
  const deckStub = {
    listeners: new Map(),
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    contains() { return false; },
    querySelector(selector) {
      if (selector === '.relationship-track') return trackStub;
      if (selector === '[data-deck-enhancement]') return mountStub;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-relation-id]') return slidesStub;
      if (selector === '.relationship-pagination a') return linksStub;
      return [];
    },
  };
  const motionPreference = {
    matches: false,
    addEventListener(type, listener) { if (type === 'change') listeners.set(type, listener); },
  };
  const documentStub = {
    hidden: false,
    listeners: new Map(),
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    querySelector(selector) { return selector === '[data-relationship-deck]' ? deckStub : null; },
    querySelectorAll() { return []; },
    createElement() { return makeInteractive(); },
  };
  const windowStub = {
    matchMedia() { return motionPreference; },
    requestAnimationFrame(callback) { animationFrames.push(callback); },
    setInterval(callback) { this.intervalCallback = callback; return 1; },
    clearInterval() { this.intervalCallback = null; },
  };
  const flushAnimationFrames = () => {
    while (animationFrames.length) animationFrames.splice(0).forEach((callback) => callback());
  };
  runInNewContext(js, { document: documentStub, window: windowStub, Infinity });

  if (mountStub.children.length !== 4) throw new Error('enhancement maakt status en drie bedieningsknoppen');
  const [status, previous, pause, next] = mountStub.children;
  if (status.attributes.get('aria-live') !== 'polite' || status.attributes.get('aria-atomic') !== 'true' ||
      status.textContent !== 'Relatie 1 van 9: FC Twente') {
    throw new Error('initiële live-status klopt niet');
  }
  if (typeof windowStub.intervalCallback !== 'function') throw new Error('autoplaytimer wordt niet gestart');
  pause.listeners.get('click')?.({});
  if (pause.attributes.get('aria-pressed') !== 'true' || windowStub.intervalCallback !== null) {
    throw new Error('pauzeknop stopt autoplay niet');
  }
  pause.listeners.get('click')?.({});
  if (pause.attributes.get('aria-pressed') !== 'false' || typeof windowStub.intervalCallback !== 'function') {
    throw new Error('pauzeknop hervat autoplay niet');
  }

  linksStub[6].listeners.get('click')?.({ preventDefault() {} });
  if (scrollCalls.at(-1)?.left !== 1800 || scrollCalls.at(-1)?.behavior !== 'smooth') {
    throw new Error('niet-aangrenzende paginatie scrolt de interne track niet naar relatie 7');
  }
  trackStub.scrollLeft = 300;
  trackStub.listeners.get('scroll')?.({});
  if (status.textContent !== 'Relatie 1 van 9: FC Twente' || linksStub[0].attributes.get('aria-current') !== 'true') {
    throw new Error('tussenliggende scroll overschrijft de actieve relatie tijdens programmatische navigatie');
  }

  next.listeners.get('click')?.({});
  if (scrollCalls.at(-1)?.left !== 2100 || status.textContent !== 'Relatie 1 van 9: FC Twente') {
    throw new Error('snelle Volgende bouwt niet voort op de nog aangevraagde relatie');
  }
  flushAnimationFrames();
  if (status.textContent !== 'Relatie 1 van 9: FC Twente') {
    throw new Error('verouderde scrollcallback commit een tussenliggende relatie');
  }
  trackStub.listeners.get('scrollend')?.({});
  if (status.textContent !== 'Relatie 8 van 9: Veiligheidsregio Zuid-Limburg' || linksStub[7].attributes.get('aria-current') !== 'true') {
    throw new Error('programmatische beweging commit niet exact eenmaal op de laatst aangevraagde relatie');
  }

  trackStub.scrollLeft = 1200;
  trackStub.listeners.get('scroll')?.({});
  flushAnimationFrames();
  if (status.textContent !== 'Relatie 5 van 9: hollandsnieuwe') {
    throw new Error('handmatig scrollen commit niet vanuit de enige passieve scrollbron');
  }

  trackStub.listeners.get('keydown')?.({ key: 'End', preventDefault() {} });
  if (status.textContent !== 'Relatie 5 van 9: hollandsnieuwe') {
    throw new Error('End kondigt een relatie aan voordat smooth scroll is gesetteld');
  }
  trackStub.listeners.get('scrollend')?.({});
  if (status.textContent !== 'Relatie 9 van 9: Vechtsteden Notarissen') throw new Error('End commit de laatste relatie niet');

  motionPreference.matches = true;
  listeners.get('change')?.({ matches: true });
  next.listeners.get('click')?.({});
  if (scrollCalls.at(-1)?.left !== 0 || scrollCalls.at(-1)?.behavior !== 'auto' || status.textContent !== 'Relatie 1 van 9: FC Twente') {
    throw new Error('reduced motion stopt animatie, auto-scroll of directe statuscommit niet');
  }
  previous.listeners.get('click')?.({});
  if (status.textContent !== 'Relatie 9 van 9: Vechtsteden Notarissen') throw new Error('Vorige wrapt niet veilig bij reduced motion');
} catch (error) {
  fail(`main.js: dependency-vrije gedragscontrole faalt (${error.message})`);
}

checkDesignDoc(root, 'brutalistisch-b/DESIGN.md', () => design,
  ['Kleurgebruik', 'Spacing', 'Visuele hiërarchie', 'Componentstijl', 'Motion', 'Responsief gedrag', 'Toegankelijkheid en fallback', 'Provenance'], fail);
checkBrandGate(brand, 'Brutalistisch B', fail);

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('Variant Brutalistisch B: geel/navy-relatiedeck en alle regressiecontracten geslaagd.');
