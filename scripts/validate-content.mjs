#!/usr/bin/env node
// Structurele en referentiële controle van de gedeelde Artific-content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-content.mjs (dependency-vrij, Node-standaardbibliotheek).
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'));
  } catch (e) {
    fail(`${path}: kan niet lezen of geen geldige JSON (${e.message})`);
    return null;
  }
}

const content = readJson('content/artific-content.nl.json');
const brand = readJson('assets/brand/brand.json');

if (content) {
  // --- bronnen en ankers ---
  const anchorsBySource = {};
  for (const [id, src] of Object.entries(content.sources ?? {})) {
    for (const field of ['url', 'title', 'fetchedAt', 'snapshot']) {
      if (!src[field]) fail(`sources.${id}: veld '${field}' ontbreekt of is leeg`);
    }
    if (src.snapshot && existsSync(join(root, src.snapshot))) {
      const md = readFileSync(join(root, src.snapshot), 'utf8');
      anchorsBySource[id] = new Set([...md.matchAll(/<a id="([^"]+)"><\/a>/g)].map((m) => m[1]));
      if (anchorsBySource[id].size === 0) fail(`${src.snapshot}: bevat geen ankers`);
    } else {
      fail(`sources.${id}: snapshotbestand '${src.snapshot}' bestaat niet`);
    }
  }

  const resolveRef = (ref, ctx) => {
    const [sourceId, anchor] = String(ref).split('#');
    if (!anchorsBySource[sourceId]) return fail(`${ctx}: onbekende bron '${sourceId}' in ref '${ref}'`);
    if (!anchor || !anchorsBySource[sourceId].has(anchor)) fail(`${ctx}: anker '${ref}' bestaat niet in snapshot`);
  };

  // --- verplichte themagroepen ---
  const requiredTopics = [
    'positionering', 'digitale-medewerker', 'visie-reis', 'veilig-voorspelbaar-transparant',
    'controlelaag', 'modules', 'centrale-controle', 'security-privacy', 'partnermodel',
    'portal-headless', 'capabilities', 'begeleiding-ondersteuning', 'conversie',
  ];
  for (const t of requiredTopics) {
    if (!content.topics?.[t]?.claims?.length) fail(`topics.${t}: ontbreekt of bevat geen claims`);
  }

  // --- claims: unieke IDs, tekst en oplosbare sourceRefs ---
  const ids = new Set();
  for (const [topicId, topic] of Object.entries(content.topics ?? {})) {
    for (const claim of topic.claims ?? []) {
      const ctx = `topics.${topicId}.${claim.id ?? '?'}`;
      if (!claim.id) fail(`${ctx}: claim zonder id`);
      else if (ids.has(claim.id)) fail(`${ctx}: dubbel claim-id '${claim.id}'`);
      else ids.add(claim.id);
      if (!claim.text?.trim()) fail(`${ctx}: lege tekst`);
      if (!claim.sourceRefs?.length) fail(`${ctx}: geen sourceRefs`);
      for (const ref of claim.sourceRefs ?? []) resolveRef(ref, ctx);
    }
  }

  // --- exact drie benoemde modules ---
  const modules = (content.topics?.modules?.claims ?? []).filter((c) => c.module).map((c) => c.module);
  const expectedModules = ['AI Assistant', 'AI ToolBox', 'Conversation Module'];
  if (modules.length !== 3 || !expectedModules.every((m) => modules.includes(m))) {
    fail(`topics.modules: verwacht exact de drie modules ${expectedModules.join(', ')}; gevonden: ${modules.join(', ') || 'geen'}`);
  }

  // --- CTA-kaart ---
  const ctas = content.ctas?.canonical ?? {};
  // Volledige CTA-inventaris uit de bronsnapshots: geen enkel canoniek item mag stilzwijgend verdwijnen.
  const requiredCtas = ['vraag-een-demo-aan', 'maak-een-afspraak', 'informatie-aanvragen', 'over-onze-partners', 'meer-lezen', 'klantbeoordelingen', 'award-blog', 'bulpe-video', 'registreren', 'inloggen'];
  for (const key of requiredCtas) if (!ctas[key]) fail(`ctas.canonical: verplicht CTA-item '${key}' ontbreekt`);

  const validDest = (d) => /^(https?:|mailto:|tel:)/.test(d);
  for (const [key, cta] of Object.entries(ctas)) {
    const ctx = `ctas.canonical.${key}`;
    if (!cta.label?.trim()) fail(`${ctx}: label ontbreekt`);
    if (!['conversie', 'ondersteunend', 'navigatie', 'inpage'].includes(cta.type)) fail(`${ctx}: ongeldig type '${cta.type}'`);
    if (!cta.occurrences?.length) fail(`${ctx}: geen bronvoorkomens`);
    for (const occ of cta.occurrences ?? []) {
      if (!occ.sourceRef) fail(`${ctx}: voorkomen zonder sourceRef`);
      else resolveRef(occ.sourceRef, ctx);
      if (!('rawHref' in occ)) fail(`${ctx}: voorkomen zonder rawHref`);
    }
    if (cta.type === 'conversie' || cta.type === 'ondersteunend') {
      const perOccurrence = typeof cta.destination === 'string' && cta.destination.startsWith('per-voorkomen');
      if (perOccurrence) {
        for (const occ of cta.occurrences ?? []) {
          if (!validDest(occ.rawHref ?? '')) fail(`${ctx}: per-voorkomen-bestemming '${occ.rawHref}' is geen geldige URL`);
        }
      } else if (!validDest(cta.destination ?? '') || cta.destination === '#') {
        fail(`${ctx}: conversie/ondersteunende CTA zonder geldige bestemming ('${cta.destination}')`);
      }
    } else if (cta.destination == null && !cta.decision?.trim()) {
      fail(`${ctx}: CTA zonder bestemming vereist een gedocumenteerd besluit ('decision')`);
    }
  }
  const demo = ctas['vraag-een-demo-aan'];
  if (demo && !(demo.deviation?.trim() && demo.sourceBehavior?.trim())) {
    fail("ctas.canonical.vraag-een-demo-aan: demo-CTA vereist 'sourceBehavior' en gedocumenteerde 'deviation' (fallbackmotivering)");
  }
  if (!existsSync(join(root, 'content/sources/demo-trigger-observation.md'))) {
    fail('content/sources/demo-trigger-observation.md ontbreekt');
  }

  const requiredNavGroups = ['artific.nl-header', 'artific.nl-footer', 'vision-inpage', 'product-inpage'];
  for (const g of requiredNavGroups) {
    if (!Object.keys(content.ctas?.navigation?.[g]?.links ?? {}).length) fail(`ctas.navigation: verplichte navigatiegroep '${g}' ontbreekt of heeft geen links`);
  }
  for (const [navId, nav] of Object.entries(content.ctas?.navigation ?? {})) {
    resolveRef(nav.sourceRef, `ctas.navigation.${navId}`);
    for (const [label, dest] of Object.entries(nav.links ?? {})) {
      if (!validDest(dest) && !dest.startsWith('#')) fail(`ctas.navigation.${navId}: '${label}' heeft ongeldige bestemming '${dest}'`);
      if (dest === '#') fail(`ctas.navigation.${navId}: '${label}' heeft kale '#' als bestemming`);
    }
  }

  // --- merkreferentie ---
  if (content.brand?.source !== 'assets/brand/brand.json') fail("brand.source moet 'assets/brand/brand.json' zijn");
}

// --- huisstijlbron ---
if (brand) {
  const requiredDocuments = new Map([
    ['brand-manual', '260506 Artific brand manual v1.0.pdf'],
    ['creative-materials', '260506 Voorbeelden creative materials.pdf'],
  ]);
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const unique = (items, label) => {
    const ids = new Set();
    for (const [index, item] of (items ?? []).entries()) {
      if (!item.id) fail(`brand.json ${label}[${index}]: id ontbreekt`);
      else if (ids.has(item.id)) fail(`brand.json ${label}: dubbel id '${item.id}'`);
      else ids.add(item.id);
    }
    return ids;
  };
  const requireExactTuples = (items, expected, tupleFor, label) => {
    const counts = new Map();
    for (const item of items ?? []) {
      const tuple = tupleFor(item);
      counts.set(tuple, (counts.get(tuple) ?? 0) + 1);
      if (!expected.has(tuple)) fail(`brand.json ${label}: niet-geaudite tuple '${tuple}'`);
    }
    for (const tuple of expected) {
      if (counts.get(tuple) !== 1) fail(`brand.json ${label}: verwachte tuple '${tuple}' moet exact eenmaal voorkomen`);
    }
  };

  if (brand.status !== 'verified') fail(`brand.json: status is '${brand.status}' in plaats van 'verified'`);
  if ((brand.referenceDocuments ?? []).length !== requiredDocuments.size) {
    fail(`brand.json: verwacht exact de twee aangeleverde primaire referenceDocuments, gevonden: ${(brand.referenceDocuments ?? []).length}`);
  }

  const documentIds = unique(brand.referenceDocuments, 'referenceDocuments');
  const primaryDocuments = new Map();
  for (const [index, document] of (brand.referenceDocuments ?? []).entries()) {
    const ctx = `brand.json referenceDocuments[${index}] ('${document.id ?? '?'}')`;
    const expectedPath = requiredDocuments.get(document.id);
    if (!expectedPath) fail(`${ctx}: document is niet een van de twee aangeleverde primaire PDF's`);
    for (const field of ['filename', 'path', 'sha256', 'pages', 'role']) {
      if (!document[field]) fail(`${ctx}: veld '${field}' ontbreekt`);
    }
    if (expectedPath && (document.filename !== expectedPath || document.path !== expectedPath)) {
      fail(`${ctx}: filename en path moeten exact '${expectedPath}' zijn`);
    }
    if (document.primary !== true || document.available !== true) fail(`${ctx}: primary en available moeten true zijn`);
    if (!/^[0-9a-f]{64}$/.test(document.sha256 ?? '')) fail(`${ctx}: ongeldige SHA-256`);
    if (!Number.isInteger(document.pages) || document.pages < 1) fail(`${ctx}: ongeldige paginatelling`);

    if (document.path) {
      const pdfPath = join(root, document.path);
      if (!existsSync(pdfPath)) fail(`${ctx}: lokaal PDF-bestand '${document.path}' ontbreekt`);
      else {
        const bytes = readFileSync(pdfPath);
        if (sha256(bytes) !== document.sha256) fail(`${ctx}: SHA-256 wijkt af van brand.json`);
        const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
        if (pageCount !== document.pages) fail(`${ctx}: verwacht ${document.pages} pagina's, PDF bevat ${pageCount}`);
      }
    }
    if (document.id) primaryDocuments.set(document.id, document);
  }
  for (const [id, path] of requiredDocuments) {
    if (!documentIds.has(id)) fail(`brand.json: primair document '${id}' (${path}) ontbreekt`);
  }

  const checkPrimaryProvenance = (provenance, ctx) => {
    if (!Array.isArray(provenance) || provenance.length === 0) {
      fail(`${ctx}: pdfProvenance ontbreekt`);
      return;
    }
    for (const [index, entry] of provenance.entries()) {
      const document = primaryDocuments.get(entry.documentId);
      const entryCtx = `${ctx}.pdfProvenance[${index}]`;
      if (!document) fail(`${entryCtx}: documentId '${entry.documentId}' is geen primaire PDF`);
      if (!Array.isArray(entry.pages) || entry.pages.length === 0) fail(`${entryCtx}: pages ontbreekt`);
      else if (document && entry.pages.some((page) => !Number.isInteger(page) || page < 1 || page > document.pages)) {
        fail(`${entryCtx}: paginanummer valt buiten 1-${document.pages}`);
      }
      if (!entry.evidence?.trim()) fail(`${entryCtx}: concrete evidence ontbreekt`);
    }
  };

  const auditedColors = new Map([
    ['artific-blauw', '#287CEB'],
    ['artific-geel', '#FFD602'],
    ['artific-navy', '#042244'],
    ['artific-lichtblauw', '#E5EDF8'],
    ['artific-grijs', '#64748B'],
    ['wit', '#FFFFFF'],
  ]);
  const colorIds = unique(brand.colors, 'colors');
  const colorsById = new Map();
  const colorValues = new Set();
  if ((brand.colors ?? []).length !== auditedColors.size) {
    fail(`brand.json: verwacht exact ${auditedColors.size} tegen de brand manual geaudite kleuren`);
  }
  for (const [index, color] of (brand.colors ?? []).entries()) {
    const ctx = `brand.json colors[${index}] ('${color.id ?? '?'}')`;
    for (const field of ['id', 'value', 'role']) if (!color[field]) fail(`${ctx}: veld '${field}' ontbreekt`);
    if (!/^#[0-9A-F]{6}$/.test(color.value ?? '')) fail(`${ctx}: '${color.value}' is geen uppercase hexwaarde`);
    if (!auditedColors.has(color.id)) fail(`${ctx}: kleur-id is niet opgenomen in de primaire PDF-audit`);
    else if (auditedColors.get(color.id) !== color.value) fail(`${ctx}: '${color.value}' wijkt af van de geaudite waarde '${auditedColors.get(color.id)}'`);
    if (colorValues.has(color.value)) fail(`${ctx}: dubbele kleurwaarde '${color.value}'`);
    colorValues.add(color.value);
    colorsById.set(color.id, color);
    checkPrimaryProvenance(color.pdfProvenance, ctx);
    if (!color.pdfProvenance?.some((entry) => entry.documentId === 'brand-manual')) {
      fail(`${ctx}: iedere kleur vereist expliciete provenance uit de brand manual; creative materials is alleen toepassingsevidence`);
    }
  }

  const auditedLogoUsageRules = new Map([
    ['logo-minimum-digital-width', (rule) => Number.isInteger(rule.minDigitalWidthPx) && rule.minDigitalWidthPx === 80],
    ['logo-preserve-artwork', (rule) => rule.requireAutoHeight === true &&
      JSON.stringify(rule.forbiddenCssProperties) === JSON.stringify(['filter', 'transform'])],
    ['logo-clearspace', (rule) => rule.manualQa === true && rule.requirement?.includes('hoogte van de letter a')],
  ]);
  unique(brand.logoUsageRules, 'logoUsageRules');
  if ((brand.logoUsageRules ?? []).length !== auditedLogoUsageRules.size) {
    fail(`brand.json: verwacht exact ${auditedLogoUsageRules.size} geaudite logo-gebruiksregels`);
  }
  for (const [index, rule] of (brand.logoUsageRules ?? []).entries()) {
    const ctx = `brand.json logoUsageRules[${index}] ('${rule.id ?? '?'}')`;
    if (!auditedLogoUsageRules.has(rule.id)) fail(`${ctx}: regel is niet opgenomen in de primaire PDF-audit`);
    else if (!auditedLogoUsageRules.get(rule.id)(rule)) fail(`${ctx}: gestructureerde regel wijkt af van de primaire PDF-audit`);
    checkPrimaryProvenance(rule.pdfProvenance, ctx);
    if (!rule.pdfProvenance?.some((entry) => entry.documentId === 'brand-manual')) {
      fail(`${ctx}: logo-gebruiksregel vereist provenance uit de brand manual`);
    }
  }

  const auditedLogos = new Map([
    ['logo-blauw', ['artific-logo-blauw.svg', 'aa9dd2935ef63ea6c4884a6d781721dd091a2b036095c795987888e766e2fb06']],
    ['logo-wit', ['artific-logo-wit.svg', '8735f58f7c16c15c8ba5eb133c3d920cf604a338db077babf25afbf1eaa859f4']],
    ['logo-navy', ['artific-logo-navy.png', 'd77170b6920cd645a751a4fb56bd55a7a9b0ff8b4e83b1d6afd2e1b56c894a7d']],
  ]);
  const logoIds = unique(brand.logos, 'logos');
  if ((brand.logos ?? []).length !== auditedLogos.size) fail(`brand.json: verwacht exact ${auditedLogos.size} geaudite logo-uitvoeringen`);
  for (const [index, logo] of (brand.logos ?? []).entries()) {
    const ctx = `brand.json logos[${index}] ('${logo.id ?? '?'}')`;
    for (const field of ['id', 'file', 'mediaType', 'sha256', 'exportMethod']) if (!logo[field]) fail(`${ctx}: veld '${field}' ontbreekt`);
    if (!auditedLogos.has(logo.id)) fail(`${ctx}: logo-id is niet opgenomen in de primaire PDF-audit`);
    else {
      const [expectedFile, expectedHash] = auditedLogos.get(logo.id);
      if (logo.file !== expectedFile || logo.sha256 !== expectedHash) fail(`${ctx}: bestand of hash wijkt af van de geaudite logo-uitvoering`);
    }
    checkPrimaryProvenance(logo.pdfProvenance, ctx);
    const assetPath = join(root, 'assets/brand', logo.file ?? '');
    if (!existsSync(assetPath)) {
      fail(`${ctx}: asset '${logo.file}' ontbreekt`);
      continue;
    }
    const bytes = readFileSync(assetPath);
    if (sha256(bytes) !== logo.sha256) fail(`${ctx}: assethash wijkt af`);
    if (logo.mediaType === 'image/svg+xml') {
      const svg = bytes.toString('utf8');
      if (!svg.trimStart().startsWith('<svg')) fail(`${ctx}: asset is geen SVG`);
      if (/https?:\/\/(?!www\.w3\.org\/)|<script|<text|<image|@font-face|font-family|\.pdf/i.test(svg)) {
        fail(`${ctx}: SVG bevat runtime-, script-, tekst-, image- of fontafhankelijkheid`);
      }
    } else if (logo.mediaType === 'image/png') {
      if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) fail(`${ctx}: asset is geen PNG`);
    } else {
      fail(`${ctx}: niet-toegestaan mediaType '${logo.mediaType}'`);
    }
  }

  const auditedLogoBackgrounds = new Set([
    'logo-blauw:wit',
    'logo-blauw:artific-lichtblauw',
    'logo-wit:artific-blauw',
    'logo-wit:artific-navy',
    'logo-navy:artific-geel',
  ]);
  unique(brand.logoBackgrounds, 'logoBackgrounds');
  requireExactTuples(brand.logoBackgrounds, auditedLogoBackgrounds,
    (rule) => `${rule.logoId}:${rule.backgroundColorId}`, 'logoBackgrounds');
  for (const [index, rule] of (brand.logoBackgrounds ?? []).entries()) {
    const ctx = `brand.json logoBackgrounds[${index}] ('${rule.id ?? '?'}')`;
    if (!logoIds.has(rule.logoId)) fail(`${ctx}: onbekend logoId '${rule.logoId}'`);
    if (!colorIds.has(rule.backgroundColorId)) fail(`${ctx}: onbekend backgroundColorId '${rule.backgroundColorId}'`);
    if (!auditedLogoBackgrounds.has(`${rule.logoId}:${rule.backgroundColorId}`)) {
      fail(`${ctx}: combinatie is niet opgenomen in de primaire PDF-audit`);
    }
    checkPrimaryProvenance(rule.pdfProvenance, ctx);
  }

  const relativeLuminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const contrastRatio = (foreground, background) => {
    const a = relativeLuminance(foreground);
    const b = relativeLuminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };

  const auditedContrastPairs = new Set([
    'artific-navy:wit:body-text',
    'artific-navy:artific-lichtblauw:body-text',
    'artific-navy:artific-geel:body-text',
    'artific-blauw:wit:large-text-only',
    'wit:artific-blauw:large-text-only',
    'wit:artific-navy:body-text',
    'artific-lichtblauw:artific-navy:body-text',
    'artific-geel:artific-navy:body-text',
  ]);
  unique(brand.contrastPairs, 'contrastPairs');
  requireExactTuples(brand.contrastPairs, auditedContrastPairs,
    (pair) => `${pair.foregroundColorId}:${pair.backgroundColorId}:${pair.usage}`, 'contrastPairs');
  for (const [index, pair] of (brand.contrastPairs ?? []).entries()) {
    const ctx = `brand.json contrastPairs[${index}] ('${pair.id ?? '?'}')`;
    const foreground = colorsById.get(pair.foregroundColorId);
    const background = colorsById.get(pair.backgroundColorId);
    if (!foreground) fail(`${ctx}: onbekend foregroundColorId '${pair.foregroundColorId}'`);
    if (!background) fail(`${ctx}: onbekend backgroundColorId '${pair.backgroundColorId}'`);
    if (!['body-text', 'large-text-only'].includes(pair.usage)) fail(`${ctx}: ongeldige usage '${pair.usage}'`);
    if (!auditedContrastPairs.has(`${pair.foregroundColorId}:${pair.backgroundColorId}:${pair.usage}`)) {
      fail(`${ctx}: combinatie/usage is niet opgenomen in de primaire PDF-audit`);
    }
    if (foreground && background) {
      const ratio = contrastRatio(foreground.value, background.value);
      const minimum = pair.usage === 'body-text' ? 4.5 : 3;
      if (ratio < minimum) fail(`${ctx}: berekende WCAG-ratio ${ratio.toFixed(2)}:1 is lager dan ${minimum}:1`);
    }
    checkPrimaryProvenance(pair.pdfProvenance, ctx);
  }
}

// --- vijf routes ---
for (const route of ['minimalistisch', 'brutalistisch-a', 'brutalistisch-b', 'conventioneel', 'premium']) {
  if (!existsSync(join(root, route, 'index.html'))) fail(`route ${route}/index.html ontbreekt`);
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const e of errors) console.error(`  - ${e}`);
  if (errors.every((e) => e.startsWith('brand.json'))) {
    console.error('\nContent-, CTA- en routecontroles zijn geslaagd; alleen de huisstijlverificatie tegen de referentie-PDF\'s ontbreekt nog. Procedure: assets/brand/README.md.');
  }
  process.exit(1);
}
console.log('OK — content-, CTA-, huisstijl- en routecontroles geslaagd.');
