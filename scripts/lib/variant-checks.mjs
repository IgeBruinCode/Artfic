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

export function checkImages(html, brand, root, variantDir, fail) {
  const allowedImages = new Set(brand.logos.map((l) => `../assets/brand/${l.file}`));
  for (const [, src] of html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) {
    if (!allowedImages.has(src)) fail(`index.html: afbeelding '${src}' is geen goedgekeurd lokaal logo`);
    if (!existsSync(join(root, variantDir, src))) fail(`index.html: afbeelding '${src}' bestaat niet`);
  }
}

export function checkBrandColors(files, brand, fail) {
  const allowedHex = new Set(brand.colors.map((c) => c.value.toUpperCase()));
  for (const [file, text] of files) {
    for (const [hex] of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      if (!allowedHex.has(hex.toUpperCase())) {
        fail(`${file}: kleur '${hex}' staat niet in brand.json`);
      }
    }
  }
}

export function checkMotionGuards(html, css, js, fail) {
  if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/gsap\.min\.js/.test(html)) fail('index.html: gepinde GSAP-CDN ontbreekt');
  if (!/cdn\.jsdelivr\.net\/npm\/gsap@3\.\d+\.\d+\/dist\/ScrollTrigger\.min\.js/.test(html)) fail('index.html: gepinde ScrollTrigger-CDN ontbreekt');
  if ((html.match(/<script[^>]*\sdefer/g) ?? []).length < 3) fail('index.html: scripts moeten met defer laden');
  if (/opacity/.test(js)) fail('main.js: deze variant animeert alleen transforms; opacity-animaties zijn niet toegestaan');
  if (!/prefers-reduced-motion/.test(js)) fail('main.js: reduced-motion-guard ontbreekt');
  if (!/window\.gsap\s*&&\s*window\.ScrollTrigger|!window\.gsap\s*\|\|\s*!window\.ScrollTrigger/.test(js)) {
    fail('main.js: guard op ontbrekende GSAP/ScrollTrigger ontbreekt');
  }
  if (!/clearProps/.test(js)) fail('main.js: clearProps-opruiming van inline transforms ontbreekt');
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
