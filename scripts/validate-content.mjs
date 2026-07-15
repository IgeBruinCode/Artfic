#!/usr/bin/env node
// Structurele en referentiële controle van de gedeelde Artific-content-, CTA- en huisstijlbron.
// Gebruik: node scripts/validate-content.mjs (dependency-vrij, Node-standaardbibliotheek).
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
  const requiredCtas = ['vraag-een-demo-aan', 'maak-een-afspraak', 'informatie-aanvragen', 'over-onze-partners', 'meer-lezen', 'klantbeoordelingen', 'registreren', 'inloggen'];
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
  // De eindoplevering vereist verificatie tegen de twee referentie-PDF's: status 'verified',
  // beide documenten beschikbaar en per waarde documentId + paginanummer in pdfProvenance.
  // Webherkomst (provenance) is alleen traceerbaarheid en vervangt die verificatie niet.
  const knownDocs = {
    'brand-manual': '260506 Artific brand manual v1.0.pdf',
    'creative-materials': '260506 Voorbeelden creative materials.pdf',
  };
  if (brand.status !== 'verified') {
    fail(`brand.json: status is '${brand.status}' — de huisstijlbron is pas een geldige eindoplevering na kruisverificatie tegen de twee referentie-PDF's (zie assets/brand/README.md)`);
  }
  for (const [docId, filename] of Object.entries(knownDocs)) {
    const doc = (brand.referenceDocuments ?? []).find((d) => d.id === docId);
    if (!doc || doc.filename !== filename) fail(`brand.json: referenceDocuments mist '${docId}' met exact bestandsnaam '${filename}'`);
    else if (doc.available !== true) fail(`brand.json: referentiedocument '${filename}' is niet beschikbaar (available !== true) — zonder de PDF's kan geen waarde als goedgekeurd gelden`);
  }
  const hasProvenance = (p) => p && Array.isArray(p.assets) && p.assets.length > 0 && p.fetchedAt;
  const hasPdfProvenance = (p) => p && knownDocs[p.documentId] && Number.isInteger(p.page) && p.page >= 1;
  if (!brand.colors?.length) fail('brand.json: colors is leeg — er zijn geen goedgekeurde kleuren opgeleverd');
  for (const [i, c] of (brand.colors ?? []).entries()) {
    for (const f of ['id', 'value', 'role']) if (!c[f]) fail(`brand.json colors[${i}]: veld '${f}' ontbreekt`);
    if (c.value && !/^#[0-9A-Fa-f]{6}$/.test(c.value)) fail(`brand.json colors[${i}]: '${c.value}' is geen geldige hexwaarde`);
    if (!hasProvenance(c.provenance)) fail(`brand.json colors[${i}]: provenance met assets en fetchedAt ontbreekt`);
    if (!hasPdfProvenance(c.pdfProvenance)) fail(`brand.json colors[${i}] ('${c.id ?? '?'}'): pdfProvenance met documentId en paginanummer ontbreekt — niet geverifieerd tegen de referentie-PDF's`);
  }
  if (!brand.logos?.length) fail('brand.json: logos is leeg — er zijn geen goedgekeurde logo-assets opgeleverd');
  const backgrounds = new Set((brand.logos ?? []).map((l) => l.background));
  if (!backgrounds.has('licht') || !backgrounds.has('donker')) {
    fail('brand.json: er moet een logo-uitvoering voor zowel lichte als donkere achtergronden zijn');
  }
  for (const [i, l] of (brand.logos ?? []).entries()) {
    for (const f of ['id', 'file', 'background', 'exportMethod', 'usage']) if (!l[f]) fail(`brand.json logos[${i}]: veld '${f}' ontbreekt`);
    if (!hasProvenance(l.provenance)) fail(`brand.json logos[${i}]: provenance met assets en fetchedAt ontbreekt`);
    if (!hasPdfProvenance(l.pdfProvenance)) fail(`brand.json logos[${i}] ('${l.id ?? '?'}'): pdfProvenance met documentId en paginanummer ontbreekt — niet geverifieerd tegen de referentie-PDF's`);
    if (l.file) {
      const p = join(root, 'assets/brand', l.file);
      if (!existsSync(p)) fail(`brand.json logos[${i}]: bestand '${l.file}' bestaat niet in assets/brand/`);
      else {
        const svg = readFileSync(p, 'utf8');
        if (!svg.trimStart().startsWith('<svg')) fail(`brand.json logos[${i}]: '${l.file}' is geen SVG`);
        if (/https?:\/\/(?!www\.w3\.org\/)/.test(svg)) fail(`brand.json logos[${i}]: '${l.file}' bevat externe URL's en is niet zelfstandig`);
        if (/<script|<text|<image|@font-face|font-family/i.test(svg)) fail(`brand.json logos[${i}]: '${l.file}' bevat scripts, tekst-elementen of fontafhankelijkheden`);
      }
    }
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
    console.error('\nContent-, CTA- en routecontroles zijn geslaagd; alleen de huisstijlverificatie tegen de twee referentie-PDF\'s ontbreekt nog. Afrondingsprocedure: assets/brand/README.md.');
  }
  process.exit(1);
}
console.log('OK — content-, CTA-, huisstijl- en routecontroles geslaagd.');
