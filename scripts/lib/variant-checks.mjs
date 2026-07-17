// Gedeelde, dependency-vrije variantcontroles tegen de canonieke content-, CTA- en huisstijlbron.
// Elke helper meldt problemen via de meegegeven fail(msg); varianten houden hun eigen structuurchecks.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function checkDocumentMetadata(html, fail) {
  if (!/<html[^>]*\slang="nl"/.test(html)) fail('index.html: documenttaal is niet nl');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
  if (!title || /in aanbouw/i.test(title)) fail('index.html: unieke paginatitel ontbreekt of is nog de statustitel');
  const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '';
  if (desc.length < 50) fail('index.html: Nederlandse meta-description ontbreekt of is te kort');
  if (/noindex/i.test(html)) fail('index.html: noindex-markering hoort niet op de opgeleverde variant');
  if (!/<meta name="viewport"/.test(html)) fail('index.html: viewport-metadata ontbreekt');
  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(`index.html: verwacht exact één <h1>, gevonden: ${h1s.length}`);
}

export function checkSectionOrder(html, requiredSections, fail) {
  let cursor = -1;
  for (const id of requiredSections) {
    const idx = html.indexOf(`id="${id}"`);
    if (idx === -1) fail(`index.html: sectie '#${id}' ontbreekt`);
    else if (idx < cursor) fail(`index.html: sectie '#${id}' staat niet in de vereiste volgorde`);
    else cursor = idx;
  }
}

const normalize = (text) => text.replace(/<!--[\s\S]*?-->/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;|\s+/g, ' ').trim();

// Strikte claims: de zichtbare varianttekst ligt per validator vast, zodat inhoudelijke drift
// (cijfers, compliance) de check laat falen in plaats van alleen het claim-ID.
export function checkClaims(html, content, { strictVariantTexts, requiredClaims }, fail) {
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

  const claimScopes = new Map();
  for (const match of html.matchAll(/<([a-z0-9]+)\b[^>]*\sdata-claim-id="([^"]+)"[^>]*>/g)) {
    const [openingTag, tagName, claimIds] = match;
    const contentStart = match.index + openingTag.length;
    const tagPattern = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, 'g');
    tagPattern.lastIndex = contentStart;

    let depth = 1;
    let contentEnd = html.length;
    let tagMatch;
    while ((tagMatch = tagPattern.exec(html))) {
      depth += tagMatch[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        contentEnd = tagMatch.index;
        break;
      }
    }

    if (depth !== 0) {
      fail(`index.html: sluittag voor <${tagName} data-claim-id="${claimIds}"> niet gevonden`);
    }

    const scope = normalize(html.slice(contentStart, contentEnd).replace(/<[^>]+>/g, ' '));
    for (const claimId of claimIds.split(/\s+/).filter(Boolean)) {
      if (!claimScopes.has(claimId)) claimScopes.set(claimId, []);
      claimScopes.get(claimId).push(scope);
    }
  }
  for (const id of usedClaims) {
    if (!knownClaims.get(id)?.strict) continue;
    const snippets = strictVariantTexts[id];
    if (!snippets) {
      fail(`index.html: strikte claim '${id}' heeft geen vastgelegde varianttekst in deze validator`);
      continue;
    }
    const scopes = (claimScopes.get(id) ?? []).map(normalize);
    // Ieder voorkomen wordt afzonderlijk gecontroleerd: één geldig voorkomen mag
    // een tweede, afwijkend voorkomen van dezelfde strikte claim niet maskeren.
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
  for (const id of requiredClaims) {
    if (!usedClaims.has(id)) fail(`index.html: vereiste claim '${id}' wordt niet gebruikt`);
  }
}

export function checkLinksAndCtas(html, content, { minCtaCount, minCtaHint }, fail) {
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
  if (ctaCount < minCtaCount) fail(`index.html: verwacht minimaal ${minCtaCount} CTA-voorkomens (${minCtaHint}), gevonden: ${ctaCount}`);
}

export const parseCssRules = (css) => {
  const rules = [];
  const variables = new Map();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = match[1].split(',').map((selector) => selector.trim()).filter(Boolean);
    const declarations = new Map();
    for (const declaration of match[2].matchAll(/([\w-]+)\s*:\s*([^;]+)\s*;?/g)) {
      declarations.set(declaration[1], declaration[2].trim());
    }
    if (selectors.includes(':root')) {
      for (const [property, value] of declarations) if (property.startsWith('--')) variables.set(property, value);
    }
    rules.push({ selectors, declarations });
  }
  return { rules, variables };
};

export function extractSingleCssBlock(source, headerPattern, label, fail) {
  const matches = [...source.matchAll(headerPattern)];
  if (matches.length !== 1) {
    fail(`styles.css: verwacht exact één ${label}-blok, gevonden ${matches.length}`);
    return '';
  }

  const openingBrace = matches[0].index + matches[0][0].lastIndexOf('{');
  let depth = 1;
  let quote = '';
  for (let index = openingBrace + 1; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && next === '*') {
      const commentEnd = source.indexOf('*/', index + 2);
      if (commentEnd === -1) {
        fail(`styles.css: onafgesloten comment in ${label}-blok`);
        return '';
      }
      index = commentEnd + 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  fail(`styles.css: onafgesloten ${label}-blok`);
  return '';
}

export const normalizeCssSelector = (selector) => selector
  .replace(/\s+/g, ' ')
  .replace(/\s*>\s*/g, '>')
  .trim();
export const normalizeCssValue = (value) => value.replace(/\s+/g, '');

const hasExpectedDeclarations = (rule, expectedDeclarations) =>
  Object.entries(expectedDeclarations).every(([property, expected]) => {
    const actual = rule.declarations.get(property);
    return actual !== undefined && normalizeCssValue(actual) === normalizeCssValue(expected);
  });

export function hasCssRule(model, selector, expectedDeclarations) {
  const expectedSelector = normalizeCssSelector(selector);
  return model.rules.some((rule) =>
    rule.selectors.some((candidate) => normalizeCssSelector(candidate) === expectedSelector) &&
    hasExpectedDeclarations(rule, expectedDeclarations)
  );
}

const rulesFor = (model, selector) => model.rules.filter((rule) => rule.selectors.includes(selector));
const backgroundProperties = ['background-color', 'background'];
const valuesForProperties = (declarations, properties) => properties
  .flatMap((property) => declarations.has(property) ? [declarations.get(property)] : []);

const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export const parseHtmlNodes = (html) => {
  const root = { tagName: '#document', parent: null };
  const nodes = [];
  const stack = [root];
  for (const match of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>/gi)) {
    const token = match[0];
    const closing = token.match(/^<\/\s*([a-z][\w:-]*)/i);
    if (closing) {
      const tagName = closing[1].toLowerCase();
      while (stack.length > 1 && stack.at(-1).tagName !== tagName) stack.pop();
      if (stack.length > 1) stack.pop();
      continue;
    }
    const opening = token.match(/^<\s*([a-z][\w:-]*)\b([^>]*)>/i);
    if (!opening) continue;
    const tagName = opening[1].toLowerCase();
    const attributes = new Map();
    for (const attribute of opening[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      attributes.set(attribute[1].toLowerCase(), attribute[2] ?? attribute[3] ?? attribute[4] ?? '');
    }
    const parent = stack.at(-1);
    const node = {
      tagName,
      attributes,
      classes: new Set((attributes.get('class') ?? '').split(/\s+/).filter(Boolean)),
      parent,
    };
    nodes.push(node);
    if (!voidElements.has(tagName) && !/\/\s*>$/.test(token)) stack.push(node);
  }
  return nodes;
};

const stripSelectorStates = (selector) => selector
  .replace(/::[\w-]+(?:\([^)]*\))?/g, '')
  .replace(/:(?:hover|focus|focus-visible|focus-within|active|visited|link|checked|disabled|enabled|target)(?:\([^)]*\))?/g, '')
  .replace(/\[aria-current(?:=(?:"[^"]*"|'[^']*'|[^\]]+))?\]/g, '');

const matchesCompound = (node, compound) => {
  let rest = stripSelectorStates(compound.trim());
  if (!rest) return false;
  const tag = rest.match(/^[a-z][\w-]*/i)?.[0];
  if (tag && node.tagName !== tag.toLowerCase()) return false;
  if (tag) rest = rest.slice(tag.length);
  if (rest.startsWith('*')) rest = rest.slice(1);
  for (const id of rest.matchAll(/#([\w-]+)/g)) {
    if (node.attributes.get('id') !== id[1]) return false;
  }
  for (const className of rest.matchAll(/\.([\w-]+)/g)) {
    if (!node.classes.has(className[1])) return false;
  }
  for (const attribute of rest.matchAll(/\[([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\]/g)) {
    const actual = node.attributes.get(attribute[1].toLowerCase());
    const expected = attribute[2] ?? attribute[3] ?? attribute[4];
    if (actual === undefined || (expected !== undefined && actual !== expected)) return false;
  }
  return rest.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]/g, '').trim() === '';
};

const matchesSelector = (node, selector) => {
  const normalized = stripSelectorStates(selector).trim();
  if (!normalized || normalized === '::selection') return false;
  const tokens = normalized.replace(/\s*>\s*/g, ' > ').split(/\s+/).filter(Boolean);
  const matchAt = (candidate, index) => {
    if (!candidate || candidate.tagName === '#document' || !matchesCompound(candidate, tokens[index])) return false;
    if (index === 0) return true;
    if (tokens[index - 1] === '>') return matchAt(candidate.parent, index - 2);
    for (let ancestor = candidate.parent; ancestor && ancestor.tagName !== '#document'; ancestor = ancestor.parent) {
      if (matchAt(ancestor, index - 1)) return true;
    }
    return false;
  };
  return matchAt(node, tokens.length - 1);
};

const closestMatch = (node, selector) => {
  for (let candidate = node; candidate && candidate.tagName !== '#document'; candidate = candidate.parent) {
    if (matchesSelector(candidate, selector)) return candidate;
  }
  return null;
};

const selectorTargets = (candidate, base) => {
  if (!base || /[>+~,]/.test(base)) return candidate === base;
  const targetCompound = candidate.trim().split(/[\s>+~]+/).filter(Boolean).at(-1) ?? '';
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?![\\w-])`).test(targetCompound);
};

const selectorMayAffectImage = (selector) => /(^|[\s>+~,(])img(?=[:.#\[\s>+~),]|$)/.test(selector) ||
  /\.brand-logo(?![\w-])|\[data-brand-logo\]|(^|[\s>+~,(])\*(?=[:.#\[\s>+~),]|$)/.test(selector);

const expandVariables = (value, variables, seen = new Set()) => {
  if (typeof value !== 'string') return value;
  let invalid = false;
  const expanded = value.replace(/var\((--[\w-]+)\)/g, (_, variable) => {
    if (seen.has(variable) || !variables.has(variable)) {
      invalid = true;
      return '';
    }
    const nested = expandVariables(variables.get(variable), variables, new Set([...seen, variable]));
    if (nested === null) invalid = true;
    return nested ?? '';
  });
  return invalid || /var\(/.test(expanded) ? null : expanded;
};

const colorlessShorthandWords = new Set([
  'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset',
  'currentcolor', 'px', 'rem', 'em', 'vw', 'vh', 'vmin', 'vmax', 'ch', 'ex', 'calc', 'clamp', 'min', 'max',
]);

const shorthandHasOnlyCanonicalColor = (value, variables, allowedHex) => {
  const expanded = expandVariables(value, variables);
  if (expanded === null) return false;
  const hexColors = [...expanded.matchAll(/#[0-9a-fA-F]+\b/g)].map(([hex]) => hex.toUpperCase());
  if (hexColors.some((hex) => !allowedHex.has(hex))) return false;
  const withoutHex = expanded.replace(/#[0-9a-fA-F]+\b/g, ' ');
  const words = [...withoutHex.matchAll(/\b[a-zA-Z][\w-]*\b/g)].map(([word]) => word.toLowerCase());
  if (words.some((word) => !colorlessShorthandWords.has(word))) return false;
  return hexColors.length > 0 || words.includes('currentcolor');
};

const colorIdForVariables = (value, variables, brand) => {
  const resolved = expandVariables(value, variables)?.toUpperCase();
  return brand.colors.find((color) => color.value === resolved)?.id ?? null;
};

const colorIdFor = (value, model, brand) => colorIdForVariables(value, model.variables, brand);

const declaredValues = (model, selector, properties) => rulesFor(model, selector)
  .flatMap((rule) => valuesForProperties(rule.declarations, properties));

const minimumFontPx = (value) => {
  const first = value?.match(/(?:clamp\(|^)([\d.]+)(px|rem)/);
  if (!first) return null;
  return Number(first[1]) * (first[2] === 'rem' ? 16 : 1);
};

const isLargeTextRule = (declarations) => {
  const size = minimumFontPx(declarations.get('font-size'));
  const weight = Number(declarations.get('font-weight') ?? 400);
  return size !== null && (size >= 24 || (size >= 18.66 && weight >= 700));
};

const selectorStaysLarge = (model, selector) => {
  const sizeRules = rulesFor(model, selector).filter((rule) => rule.declarations.has('font-size'));
  return sizeRules.length > 0 && sizeRules.every((rule) => isLargeTextRule(rule.declarations));
};

export function checkImages(html, css, brand, root, variantDir, fail) {
  const model = parseCssRules(css);
  const logosById = new Map(brand.logos.map((logo) => [logo.id, logo]));
  const allowedCombinations = new Set(
    brand.logoBackgrounds.map((rule) => `${rule.logoId}:${rule.backgroundColorId}`)
  );
  const minWidth = (brand.logoUsageRules ?? []).find((rule) => rule.id === 'logo-minimum-digital-width')?.minDigitalWidthPx;
  const artworkRule = (brand.logoUsageRules ?? []).find((rule) => rule.id === 'logo-preserve-artwork');
  const expectedPrefix = variantDir === '.' ? 'assets/brand/' : '../assets/brand/';
  const imageNodes = parseHtmlNodes(html).filter((node) => node.tagName === 'img');
  if (imageNodes.length === 0) fail('index.html: een canoniek Artific-logo ontbreekt');
  if (!Number.isInteger(minWidth)) fail('brand.json: gestructureerde minimale digitale logobreedte ontbreekt');

  for (const image of imageNodes) {
    const src = image.attributes.get('src') ?? '';
    if (image.attributes.has('data-client-logo')) {
      const alt = image.attributes.get('alt') ?? '';
      const width = Number(image.attributes.get('width'));
      if (!src || /^(?:https?:|data:)/i.test(src)) {
        fail(`index.html: klantlogo '${src || '?'}' moet als lokale asset worden geleverd`);
      } else if (!existsSync(join(root, variantDir, src))) {
        fail(`index.html: klantlogo '${src}' bestaat niet`);
      }
      if (!alt.trim()) fail(`index.html: klantlogo '${src || '?'}' mist een herkenbare alt-tekst`);
      if (!Number.isFinite(width) || width < minWidth) {
        fail(`index.html: klantlogo '${src || '?'}' is volgens het width-attribuut niet minimaal ${minWidth}px breed`);
      }
      continue;
    }
    const logoId = image.attributes.get('data-brand-logo') ?? '';
    const backgroundId = image.attributes.get('data-brand-background') ?? '';
    const surfaceSelector = image.attributes.get('data-brand-surface') ?? '';
    const surfaceTag = image.attributes.get('data-brand-surface-tag') ?? '';
    const logoSelector = image.attributes.get('data-brand-logo-selector') ?? '';
    const width = Number(image.attributes.get('width'));
    const logo = logosById.get(logoId);

    if (!logo) fail(`index.html: afbeelding '${src}' mist een geldig data-brand-logo`);
    else if (src !== `${expectedPrefix}${logo.file}`) {
      fail(`index.html: logo '${logoId}' gebruikt asset '${src}' in plaats van '${expectedPrefix}${logo.file}'`);
    }
    if (!Number.isFinite(width) || width < minWidth) {
      fail(`index.html: logo '${logoId || src}' is volgens het width-attribuut niet minimaal ${minWidth}px breed`);
    }
    if (!backgroundId) fail(`index.html: logo '${logoId || src}' mist data-brand-background`);
    else if (!allowedCombinations.has(`${logoId}:${backgroundId}`)) {
      fail(`index.html: logo-/achtergrondcombinatie '${logoId}:${backgroundId}' is niet toegestaan in brand.json`);
    }

    const surfaceAncestor = closestMatch(image.parent, surfaceSelector);
    if (!surfaceAncestor || surfaceAncestor.tagName !== surfaceTag) {
      fail(`index.html: logo '${logoId || src}' staat niet daadwerkelijk binnen oppervlak '${surfaceSelector}' op een <${surfaceTag || '?'}>`);
    }

    const surfaceRules = model.rules.filter((rule) => rule.selectors.some((selector) =>
      (surfaceAncestor && matchesSelector(surfaceAncestor, selector)) ||
      selectorTargets(selector, surfaceSelector) ||
      selectorTargets(selector, surfaceTag) ||
      selectorTargets(selector, '*')
    ));
    const backgrounds = surfaceRules.flatMap((rule) =>
      valuesForProperties(rule.declarations, backgroundProperties)
    );
    if (!surfaceSelector || !surfaceTag || backgrounds.length === 0) {
      fail(`index.html: logo '${logoId || src}' mist een controleerbaar CSS-oppervlak en elementtype`);
    } else {
      for (const background of backgrounds) {
        const actualId = colorIdFor(background, model, brand);
        if (actualId !== backgroundId) {
          fail(`styles.css: logo-oppervlak '${surfaceSelector}' rendert '${actualId ?? background}' in plaats van '${backgroundId}'`);
        }
      }
      for (const rule of surfaceRules) {
        for (const property of artworkRule?.forbiddenCssProperties ?? []) {
          if (rule.declarations.has(property) && rule.declarations.get(property) !== 'none') {
            fail(`styles.css: logo-oppervlak '${rule.selectors.join(', ')}' gebruikt verboden ${property}`);
          }
        }
      }
    }

    const minWidths = declaredValues(model, logoSelector, ['min-width']);
    if (!logoSelector || minWidths.length === 0 || minWidths.some((value) => minimumFontPx(value) < minWidth)) {
      fail(`styles.css: logo-selector '${logoSelector || '?'}' borgt geen minimale renderbreedte van ${minWidth}px`);
    }
    if (!existsSync(join(root, variantDir, src))) fail(`index.html: afbeelding '${src}' bestaat niet`);
  }

  for (const rule of model.rules) {
    if (rule.selectors.every((selector) => /(?:client-logo|logo-rail|logo-track)/i.test(selector))) continue;
    if (rule.declarations.has('filter') && rule.declarations.get('filter') !== 'none') {
      fail(`styles.css: globale/oppervlaktefilter in '${rule.selectors.join(', ')}' kan een logo herkleuren`);
    }
    if (!rule.selectors.some((selector) => /logo/i.test(selector) || selectorMayAffectImage(selector))) continue;
    for (const property of artworkRule?.forbiddenCssProperties ?? []) {
      if (rule.declarations.has(property) && rule.declarations.get(property) !== 'none') {
        fail(`styles.css: logo-selector '${rule.selectors.join(', ')}' gebruikt verboden ${property}`);
      }
    }
    if (artworkRule?.requireAutoHeight && rule.declarations.has('height') && rule.declarations.get('height') !== 'auto') {
      fail(`styles.css: logo-selector '${rule.selectors.join(', ')}' kan de logoverhouding vervormen (height is niet auto)`);
    }
    for (const property of ['width', 'min-width']) {
      if (rule.declarations.has(property) && minimumFontPx(rule.declarations.get(property)) < minWidth) {
        fail(`styles.css: logo-selector '${rule.selectors.join(', ')}' kan smaller dan ${minWidth}px renderen`);
      }
    }
    if (rule.declarations.has('background') || rule.declarations.has('background-color')) {
      fail(`styles.css: logo-selector '${rule.selectors.join(', ')}' mag geen eigen achtergrond over het gevalideerde oppervlak leggen`);
    }
  }
}

export function checkContrastUsage(html, css, brand, surfaces, fail) {
  const model = parseCssRules(css);
  const htmlNodes = parseHtmlNodes(html);
  const pairsById = new Map(brand.contrastPairs.map((pair) => [pair.id, pair]));
  const configuredForegrounds = new Set(surfaces.map((surface) => surface.foregroundSelector));
  const configuredBackgrounds = new Map(surfaces.map((surface) => [surface.backgroundSelector, surface]));
  const pairFor = (foregroundId, backgroundId, selector) => {
    const bodyPair = brand.contrastPairs.find((pair) => pair.foregroundColorId === foregroundId &&
      pair.backgroundColorId === backgroundId && pair.usage === 'body-text');
    if (bodyPair) return bodyPair;
    const largePair = brand.contrastPairs.find((pair) => pair.foregroundColorId === foregroundId &&
      pair.backgroundColorId === backgroundId && pair.usage === 'large-text-only');
    if (largePair && selectorStaysLarge(model, selector)) return largePair;
    return null;
  };

  for (const surface of surfaces) {
    const pair = pairsById.get(surface.pairId);
    if (!pair) {
      fail(`styles.css: contrastoppervlak '${surface.foregroundSelector}' verwijst naar onbekend paar '${surface.pairId}'`);
      continue;
    }
    const foregrounds = declaredValues(model, surface.foregroundSelector, ['color']);
    const backgrounds = declaredValues(model, surface.backgroundSelector, backgroundProperties);
    if (foregrounds.length === 0) fail(`styles.css: '${surface.foregroundSelector}' declareert geen controleerbare tekstkleur`);
    if (backgrounds.length === 0) fail(`styles.css: '${surface.backgroundSelector}' declareert geen controleerbare achtergrond`);
    for (const foreground of foregrounds) {
      if (colorIdFor(foreground, model, brand) !== pair.foregroundColorId) {
        fail(`styles.css: '${surface.foregroundSelector}' gebruikt niet de voor '${pair.id}' vastgelegde voorgrond`);
      }
    }
    for (const background of backgrounds) {
      if (colorIdFor(background, model, brand) !== pair.backgroundColorId) {
        fail(`styles.css: '${surface.backgroundSelector}' gebruikt niet de voor '${pair.id}' vastgelegde achtergrond`);
      }
    }
    if (pair.usage === 'large-text-only' && !selectorStaysLarge(model, surface.foregroundSelector)) {
      fail(`styles.css: '${surface.foregroundSelector}' voldoet niet aan de tekstgrootte/-gewichtregel van '${pair.id}'`);
    }

    if (surface.foregroundSelector === '::selection') continue;
    const backgroundNodes = htmlNodes.filter((node) => matchesSelector(node, surface.backgroundSelector));
    if (backgroundNodes.length === 0) {
      fail(`index.html: contrastoppervlak '${surface.backgroundSelector}' komt niet in de DOM voor`);
    }

    if (surface.foregroundSelector === 'body' && surface.backgroundSelector !== 'body') {
      for (const backgroundNode of backgroundNodes) {
        if (!closestMatch(backgroundNode, 'body')) {
          fail(`index.html: contrastoppervlak '${surface.backgroundSelector}' erft niet van de vastgelegde body-voorgrond`);
        }
      }
    } else {
      const foregroundNodes = htmlNodes.filter((node) => matchesSelector(node, surface.foregroundSelector));
      if (foregroundNodes.length === 0) {
        fail(`index.html: voorgrondselector '${surface.foregroundSelector}' komt niet in de DOM voor`);
      }
      for (const foregroundNode of foregroundNodes) {
        if (!closestMatch(foregroundNode, surface.backgroundSelector)) {
          fail(`index.html: element voor '${surface.foregroundSelector}' staat niet binnen contrastoppervlak '${surface.backgroundSelector}'`);
        }
      }
    }

    if (surface.foregroundSelector !== surface.backgroundSelector) {
      for (const backgroundNode of backgroundNodes) {
        const hasSpecificContract = surfaces.some((candidate) => candidate !== surface &&
          candidate.backgroundSelector !== surface.backgroundSelector && matchesSelector(backgroundNode, candidate.backgroundSelector));
        if (hasSpecificContract) continue;
        for (const rule of model.rules.filter((entry) => entry.selectors.some((selector) => matchesSelector(backgroundNode, selector)))) {
          for (const property of backgroundProperties) {
            if (!rule.declarations.has(property)) continue;
            const value = rule.declarations.get(property);
            const actualId = colorIdFor(value, model, brand);
            if (actualId !== pair.backgroundColorId) {
              fail(`styles.css: werkelijk DOM-oppervlak '${surface.backgroundSelector}' krijgt via '${rule.selectors.join(', ')}' '${actualId ?? value}' buiten contrastpaar '${pair.id}'`);
            }
          }
        }
      }
    }
  }

  for (const surface of surfaces) {
    if (!pairsById.has(surface.pairId)) continue;
    for (const rule of model.rules) {
      for (const selector of rule.selectors.filter((candidate) => selectorTargets(candidate, surface.backgroundSelector))) {
        const expectedSurface = configuredBackgrounds.get(selector) ?? surface;
        const expectedPair = pairsById.get(expectedSurface.pairId);
        for (const property of backgroundProperties) {
          if (!rule.declarations.has(property)) continue;
          const value = rule.declarations.get(property);
          const actualId = colorIdFor(value, model, brand);
          if (actualId !== expectedPair?.backgroundColorId) {
            fail(`styles.css: cascade-override '${selector}' wijzigt '${surface.backgroundSelector}' naar '${actualId ?? value}' buiten contrastpaar '${expectedPair?.id}'`);
          }
        }
      }
    }
  }

  for (const rule of model.rules) {
    const foregroundId = colorIdFor(rule.declarations.get('color'), model, brand);
    const backgroundValue = rule.declarations.get('background-color') ?? rule.declarations.get('background');
    const backgroundId = colorIdFor(backgroundValue, model, brand);
    const decorativeText = rule.declarations.get('--brand-text-role') === 'decorative';
    const decorativeSurface = rule.declarations.get('--brand-surface-role') === 'decorative';

    for (const selector of rule.selectors) {
      if (foregroundId && !decorativeText && !configuredForegrounds.has(selector)) {
        if (!backgroundId || !pairFor(foregroundId, backgroundId, selector)) {
          fail(`styles.css: tekstkleur in '${selector}' heeft geen afdwingbaar canoniek voorgrond/achtergrondpaar`);
        }
      }
      if (backgroundId && !foregroundId && !decorativeSurface && !configuredBackgrounds.has(selector)) {
        fail(`styles.css: achtergrond in '${selector}' mist een expliciet canoniek oppervlaktecontract`);
      }
    }
  }
}

export function checkNoPdfRuntime(files, fail) {
  for (const [file, text] of files) {
    if (/\.pdf(?:[?#"'\s)]|$)/i.test(text)) fail(`${file}: runtime-PDF-verwijzing is niet toegestaan`);
  }
}

export function checkBrandColors(files, brand, fail) {
  const allowedHex = new Set(brand.colors.map((color) => color.value.toUpperCase()));
  for (const [file, text] of files) {
    for (const [hex] of text.matchAll(/#[0-9a-fA-F]+\b/g)) {
      if (!/^#[0-9a-fA-F]{6}$/.test(hex) || !allowedHex.has(hex.toUpperCase())) {
        fail(`${file}: kleur '${hex}' is geen bevestigde zescijferige hexwaarde uit brand.json`);
      }
    }
    if (/\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/i.test(text)) {
      fail(`${file}: functionele/afgeleide CSS-kleurnotatie is niet toegestaan`);
    }
    if (!file.endsWith('.css')) continue;

    const model = parseCssRules(text);
    for (const rule of model.rules) {
      const variables = new Map(model.variables);
      for (const [property, value] of rule.declarations) {
        if (property.startsWith('--')) variables.set(property, value);
      }
      for (const [property, value] of rule.declarations) {
        if (property === 'color' || property.endsWith('-color') || property === 'background' ||
            property === 'fill' || property === 'stroke') {
          if (['inherit', 'currentColor', 'none'].includes(value)) continue;
          if (!colorIdForVariables(value, variables, brand)) {
            fail(`${file}: '${property}: ${value}' in '${rule.selectors.join(', ')}' gebruikt geen canonieke kleurvariabele of bevestigde hexwaarde`);
          }
        }
        if (['box-shadow', 'text-shadow'].includes(property) && value !== 'none' &&
            !shorthandHasOnlyCanonicalColor(value, variables, allowedHex)) {
          fail(`${file}: '${property}: ${value}' in '${rule.selectors.join(', ')}' mist een volledig opgeloste bevestigde schaduwkleur`);
        }
        if (/^(?:border(?:-(?:top|right|bottom|left|block(?:-(?:start|end))?|inline(?:-(?:start|end))?))?|outline)$/.test(property) && !/^(?:0|none)$/.test(value) &&
            !shorthandHasOnlyCanonicalColor(value, variables, allowedHex)) {
          fail(`${file}: '${property}: ${value}' in '${rule.selectors.join(', ')}' mist een volledig opgeloste bevestigde randkleur`);
        }
      }
    }
  }
}

export function checkMotionGuards(html, css, js, fail, {
  allowOpacity = false,
  requireClearProps = true,
} = {}) {
  if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/gsap\.min\.js/.test(html)) fail('index.html: gepinde GSAP-CDN ontbreekt');
  if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/ScrollTrigger\.min\.js/.test(html)) fail('index.html: gepinde ScrollTrigger-CDN ontbreekt');
  if ((html.match(/<script[^>]*\sdefer/g) ?? []).length < 3) fail('index.html: scripts moeten met defer laden');
  if (!allowOpacity && /opacity/.test(js)) fail('main.js: deze variant animeert alleen transforms; opacity-animaties zijn niet toegestaan');
  if (!/prefers-reduced-motion/.test(js)) fail('main.js: reduced-motion-guard ontbreekt');
  if (!/window\.gsap\s*&&\s*window\.ScrollTrigger|!window\.gsap\s*\|\|\s*!window\.ScrollTrigger/.test(js)) {
    fail('main.js: guard op ontbrekende GSAP/ScrollTrigger ontbreekt');
  }
  if (requireClearProps && !/clearProps/.test(js)) fail('main.js: clearProps-opruiming van inline transforms ontbreekt');
  if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) fail('styles.css: prefers-reduced-motion-blok ontbreekt');
  if (!/:focus-visible/.test(css)) fail('styles.css: zichtbare focusstijl ontbreekt');
  if (!/scroll-margin-top/.test(css)) fail('styles.css: scroll-margin-top voor ankersecties ontbreekt');
}

export function checkDesignDoc(root, designPath, readDesign, chapters, fail) {
  if (!existsSync(join(root, designPath))) {
    fail(`${designPath}: ontwerpdocument ontbreekt`);
    return;
  }
  const design = readDesign();
  for (const hoofdstuk of chapters) {
    if (!new RegExp(`^#{2,3} .*${hoofdstuk}`, 'im').test(design)) fail(`${designPath}: hoofdstuk '${hoofdstuk}' ontbreekt`);
  }
  if (!/Provenance/i.test(design)) fail(`${designPath}: provenance-verklaring (Stitch-status) ontbreekt`);
}

export function checkBrandGate(brand, variantName, fail) {
  if (brand.status !== 'verified') {
    fail(`brand.json: status is '${brand.status}' — ${variantName} kan niet als opgeleverd gelden zolang de huisstijlbron niet 'verified' is (zie assets/brand/README.md); de oplevering is GEBLOKKEERD`);
  }
}
