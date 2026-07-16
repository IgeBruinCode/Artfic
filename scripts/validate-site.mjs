#!/usr/bin/env node
// Setbrede controle van de rootkeuzepagina en de vijf variantroutes.
// Gebruik: node scripts/validate-site.mjs (dependency-vrij, Node-standaardbibliotheek).
// Controleert de rootkeuze (exact vijf benoemde varianten), per variant route/H1/kernclaims/
// officiële CTA's/ontwerpdocument, en voert daarna alle bestaande validators uit.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), 'utf8');

const content = JSON.parse(read('content/artific-content.nl.json'));
const brand = JSON.parse(read('assets/brand/brand.json'));

// --- rootkeuzepagina: metadata, blauw logo, precies vijf gelijkwaardige keuzes ---
const rootHtml = read('index.html');
const keuzeCss = read('keuze.css');
if (!/<html[^>]*\slang="nl"/.test(rootHtml)) fail('index.html (root): documenttaal is niet nl');
if (!/<meta name="viewport"/.test(rootHtml)) fail('index.html (root): viewport-metadata ontbreekt');
if (((rootHtml.match(/<title>([^<]*)<\/title>/)?.[1]) ?? '').length < 10) fail('index.html (root): Nederlandse paginatitel ontbreekt');
if (((rootHtml.match(/<meta name="description" content="([^"]+)"/)?.[1]) ?? '').length < 50) fail('index.html (root): meta-description ontbreekt of is te kort');
if ((rootHtml.match(/<h1[\s>]/g) ?? []).length !== 1) fail('index.html (root): verwacht exact één <h1>');
if (!/Kies een Artific-ontwerprichting/.test(rootHtml)) fail('index.html (root): H1 "Kies een Artific-ontwerprichting" ontbreekt');
if (!/assets\/brand\/artific-logo-blauw\.svg/.test(rootHtml)) fail('index.html (root): het blauwe logo op lichte achtergrond ontbreekt');
if (/<script/i.test(rootHtml)) fail('index.html (root): de keuzepagina hoort geen JavaScript nodig te hebben');
if (/aanbevolen|voorkeur|badge/i.test(rootHtml)) fail('index.html (root): keuzes horen neutraal te zijn, zonder voorkeurslabel');

const expectedChoices = [
  ['Minimalistisch', 'minimalistisch/'],
  ['Brutalistisch A', 'brutalistisch-a/'],
  ['Brutalistisch B', 'brutalistisch-b/'],
  ['Veilig / conventioneel', 'conventioneel/'],
  ['Premium', 'premium/'],
];
const choiceAnchors = [...rootHtml.matchAll(/<a\b[^>]*class="keuze__optie"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
if (choiceAnchors.length !== 5) fail(`index.html (root): verwacht exact vijf keuzeanchors, gevonden: ${choiceAnchors.length}`);
for (const [naam, href] of expectedChoices) {
  const anchor = choiceAnchors.find(([, aHref]) => aHref === href);
  if (!anchor) fail(`index.html (root): keuze naar '${href}' ontbreekt`);
  else if (!anchor[2].includes(naam)) fail(`index.html (root): keuze '${href}' draagt niet de naam '${naam}'`);
}
const allowedHex = new Set(brand.colors.map((c) => c.value.toUpperCase()));
for (const [hex] of keuzeCss.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
  if (!allowedHex.has(hex.toUpperCase())) fail(`keuze.css: kleur '${hex}' staat niet in brand.json`);
}
if (!/:focus-visible/.test(keuzeCss)) fail('keuze.css: zichtbare focusstijl ontbreekt');

// --- per variant: route, H1, kernclaims, beide officiële conversie-CTA's, ontwerpdocument ---
const variants = ['minimalistisch', 'brutalistisch-a', 'brutalistisch-b', 'conventioneel', 'premium'];
const kernClaims = ['pos-belofte', 'mod-ai-assistant', 'mod-ai-toolbox', 'mod-conversation', 'sec-eu', 'sec-iso', 'bw-100-klanten'];
const ctaCard = content.ctas.canonical;
for (const variant of variants) {
  const routePath = `${variant}/index.html`;
  if (!existsSync(join(root, routePath))) { fail(`${routePath}: routebestand ontbreekt`); continue; }
  const html = read(routePath);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(`${routePath}: verwacht exact één <h1>`);
  if (/noindex/i.test(html)) fail(`${routePath}: noindex hoort niet op een opgeleverde variant`);
  for (const claimId of kernClaims) {
    if (!new RegExp(`data-claim-id="[^"]*\\b${claimId}\\b`).test(html)) fail(`${routePath}: kernclaim '${claimId}' ontbreekt`);
  }
  for (const ctaId of ['vraag-een-demo-aan', 'maak-een-afspraak']) {
    const entry = ctaCard[ctaId];
    const occurrences = [...html.matchAll(new RegExp(`<a\\b([^>]*\\sdata-cta-id="${ctaId}"[^>]*)>([\\s\\S]*?)</a>`, 'g'))];
    if (!occurrences.length) { fail(`${routePath}: officiële CTA '${ctaId}' ontbreekt`); continue; }
    for (const [, attrs, inner] of occurrences) {
      const label = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (label !== entry.label) fail(`${routePath}: CTA '${ctaId}' heeft label '${label}' i.p.v. '${entry.label}'`);
      if (attrs.match(/href="([^"]+)"/)?.[1] !== entry.destination) fail(`${routePath}: CTA '${ctaId}' wijst niet naar '${entry.destination}'`);
      if (/target=/.test(attrs)) fail(`${routePath}: CTA '${ctaId}' mag geen target-attribuut hebben (zelfde tabblad)`);
    }
  }
  const designPath = `${variant}/DESIGN.md`;
  if (!existsSync(join(root, designPath))) { fail(`${designPath}: ontwerpdocument ontbreekt`); continue; }
  const design = read(designPath);
  if (!/gefinaliseerd via Google Stitch-MCP/i.test(design)) fail(`${designPath}: geen geslaagde Stitch-finalisatie in de provenance`);
  if (/niet beschikbaar|blijft (expliciet )?open|niet als Stitch-output|handmatig opgesteld|oplevering geblokkeerd/i.test(design)) {
    fail(`${designPath}: provenance meldt een open of mislukte Stitch-status`);
  }
}

// --- alle inhouds- en variantvalidators ---
for (const script of ['validate-content.mjs', 'validate-minimalistisch.mjs', 'validate-brutalistisch-a.mjs',
  'validate-brutalistisch-b.mjs', 'validate-conventioneel.mjs', 'validate-premium.mjs']) {
  const result = spawnSync(process.execPath, [join(root, 'scripts', script)], { encoding: 'utf8' });
  if (result.status !== 0) fail(`scripts/${script}: validator faalt\n${(result.stderr || result.stdout).trim()}`);
}

if (errors.length) {
  console.error(`FOUT — ${errors.length} probleem(en):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('Set: rootkeuze, vijf routes, gedeelde CTA-contracten, ontwerpdocumenten en alle validators geslaagd.');
