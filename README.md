# Artific — vijf landingspagina-varianten

Statische HTML-website met vijf onafhankelijk bekijkbare, klantgerichte landingspagina-varianten voor Artific, gebouwd op één gedeelde content-, CTA- en huisstijlbron. Bewust zonder framework, bundler of dependencies: elke variant is een zelfstandige, servergerenderde/statische HTML-pagina (goed voor SEO/GEO en eenvoudig onderhoud).

## Routecontract (vast, wijzigt niet)

| Variant | Adres | Status |
| --- | --- | --- |
| Minimalistisch | `/minimalistisch/` | **Gebouwd** — Codex-geïnspireerde Artific-landingspagina met 21st.dev-geïnspireerde WebGL-shader en workflowvisual, officiële klantlogo-rail, zes klantbeoordelingen en eigen stijlgids |
| Brutalistisch A | `/brutalistisch-a/` | **Gebouwd** — volledige landingspagina; `brutalistisch-a/DESIGN.md` is via de Google Stitch-MCP gefinaliseerd (provenance in het document zelf) |
| Brutalistisch B | `/brutalistisch-b/` | **Gebouwd** — dominante geel/navy-landingspagina met een toegankelijk relatiedeck, gelaagde shaders, asymmetrische kaarten, eigen stijlgids en QA-log |
| Conventioneel (SaaS) | `/conventioneel/` | **Gebouwd** — volledige landingspagina ("trust-center SaaS") met eigen stijlgids en QA-log (`conventioneel/QA.md`); `conventioneel/DESIGN.md` is via de Google Stitch-MCP gefinaliseerd in een afzonderlijk Stitch-project (provenance in het document zelf) |
| Premium | `/premium/` | **Gebouwd** — volledige landingspagina ("executive evidence dossier") met eigen stijlgids; `premium/DESIGN.md` is via de Google Stitch-MCP gefinaliseerd in een afzonderlijk Stitch-project (provenance in het document zelf) |

Het standaard openingsadres `/` is een neutrale keuzepagina (`index.html` + `keuze.css`, zonder JavaScript) die naar exact deze vijf varianten linkt, zonder voorkeurslabel.

Lokaal bekijken:

```sh
node scripts/serve.mjs 4173   # of: python3 -m http.server 4173
# daarna http://localhost:4173/ en kies een variant
```

Alle vijf routes zijn gebouwd; wijzigingen vervangen telkens alleen inhoud, nooit een pad.

## Gedeelde bronnen

- `content/artific-content.nl.json` — **de enige canonieke inhouds- en CTA-bron.** Compacte Nederlandse claims per themagroep, elk met `sourceRefs` naar de originele passage; plus de canonieke CTA-kaart (labels, bestemmingen, gedrag, demo-fallbackmotivering).
- `content/sources/*.md` — gedateerde snapshots van de oorspronkelijke SEO-/paginatekst van artific.nl, vision.artific.nl/nl en product.artific.nl/nl, met stabiele ankers (`<a id="..."></a>`).
- `content/sources/demo-trigger-observation.md` — geobserveerd live clientgedrag van "Vraag een demo aan" en het vastgelegde fallbackbesluit.
- `assets/brand/brand.json` + `assets/brand/README.md` + `assets/brand/*.{svg,png}` — canonieke huisstijlbron met geverifieerde tokens, contrastregels, logo-uitvoeringen en toegestane logo-achtergronden. De twee aanwezige root-PDF's zijn de primaire auditbron; ieder item bevat document-ID, 1-gebaseerde pagina en concrete evidence. De PDF's blijven build-time bron en worden nooit door de website geladen.

### Redactionele regels voor varianten

1. Kies variantcopy uit de claim-IDs in `content/artific-content.nl.json` en schrijf de gekozen tekst statisch als semantische HTML uit (geen client-side fetch van de contentbron).
2. Claims met `strict: true` (cijfers, complianceformuleringen) mogen worden ingekort maar nooit aangescherpt, gecombineerd of sterker beloofd.
3. CTA's uitsluitend uit de CTA-kaart; nooit een kale `#` of verzonnen bestemming. Demo-aanvragen gaan naar de officiële contactpagina (gedocumenteerde afwijking).
4. Kleuren en logo's uitsluitend uit `assets/brand/`; varianten voegen nooit eigen of ad-hoc afgeleide merkwaarden toe.

## Kwaliteitscontrole

```sh
node scripts/validate-content.mjs
node scripts/validate-minimalistisch.mjs
node scripts/validate-brutalistisch-a.mjs
node scripts/validate-brutalistisch-b.mjs
node scripts/validate-conventioneel.mjs
node scripts/validate-premium.mjs
node scripts/validate-site.mjs
```

Controleert JSON-syntax, unieke claim-IDs, oplosbaarheid van alle bronankers, de verplichte themagroepen, exact drie benoemde modules, de volledige CTA-kaart met veilige bestemmingen, het demo-besluit, de huisstijlbron en de vijf routebestanden. De huisstijlcontrole verifieert tevens beide lokale PDF-hashes en paginatellingen, brand-manual-provenance per kleur, assethashes, directionele WCAG-paren met werkelijke CSS-oppervlakken, tekstgrootte en DOM-ancestry, alle relevante CSS-kleurnotaties inclusief opgeloste shorthand-variabelen, logo-achtergronden plus structurele ancestry- en renderregels en het ontbreken van runtime-PDF-verwijzingen. Dependency-vrij (Node-standaardbibliotheek).

Handmatige browser-QA is reproduceerbaar via `node scripts/serve.mjs 4173` vanuit de root (dependency-vrij; `python3 -m http.server` kan ook). De setbrede QA-matrix van de afronding (rootkeuze plus alle vijf routes op 320/768/1440 px, toetsenbord, CTA's, reduced motion, JS/CDN-uitval) staat in `QA.md`; eerdere per-variantmatrices staan in `brutalistisch-a/QA.md`, `brutalistisch-b/QA.md` en `conventioneel/QA.md`.

`validate-site.mjs` controleert de set als geheel: de rootkeuzepagina (exact vijf benoemde, gelijkwaardige keuzes met de vaste routes, alleen merkkleuren en het blauwe logo), per variant de route, één H1, kernclaims en beide officiële conversie-CTA's tegen de canonieke kaart. De controle bewaakt daarnaast de actuele lokale provenance en unieke relatiedecksignatuur van Brutalistisch B, behoudt de bestaande provenancecontracten van de vier ongewijzigde varianten en draait daarna de contentvalidator en alle vijf variantvalidators.

`validate-premium.mjs` bewaakt variant Premium op dezelfde manier als de zustervalidators, aangevuld met de eigen dossierstructuur (statische donkere header, exact één evidence-index, drie maturity-fasen, één controle-architectuur met drie lagen, exact drie module-sequence-hoofdstukken, minimaal zes assurance-ledger-items, exact vijf begeleidingsstappen) en een verbod op zustervariant-signaturen, inline SVG, gradients/blur/schaduwen/afronding/transparante kleuren en standaard verborgen inhoud.

`validate-conventioneel.mjs` bewaakt variant Conventioneel op dezelfde manier, aangevuld met de eigen trust-center-SaaS-structuur (sticky SaaS-header met lokale navigatie, exact één trust-console met drie lagen, één bewijsrail, exact drie module-cards, minimaal zes assurance-items, exact vijf implementatiestappen) en een verbod op signaturen van de drie zustervarianten (commandobar, sectiecodes, platen, folio's, register, spread), inline SVG, gradients/blur/transparante kleuren en standaard verborgen inhoud. De uitgevoerde handmatige QA-matrix staat in `conventioneel/QA.md`.

`validate-brutalistisch-b.mjs` bewaakt variant Brutalistisch B op dezelfde manier, aangevuld met de volgorde intro → bewijs → visie → platform → organisatie → contact, het gele merkpodium met officieel navy logo, exact negen tekstuele klantrelaties, de canonieke FC Twente-claim, no-JS-ankernavigatie, progressieve bediening, dynamische reduced-motion-afbouw, geel/navy-oppervlakken, shader-velden en de afwezigheid van de vervallen redactionele en zustervariantsignaturen. Een dependency-vrije gedragsstub test deckknoppen, toetsen, settling zonder tussenliggende aankondigingen, snelle vervolgnavigatie en motionwijziging; een cascade-aware contrastgate bewaakt normale tekst in de control-stack en Conversation Module als wit op Deep Navy. De uitgevoerde handmatige QA-matrix staat in `brutalistisch-b/QA.md`.

`validate-brutalistisch-a.mjs` bewaakt variant Brutalistisch A op dezelfde manier, aangevuld met de brutalistische structuurkenmerken (zichtbare sectiecodes, exact drie moduleplaten, geen afronding/gradients/blur, uitsluitend transform-animaties) en de verplichte hoofdstukken in `brutalistisch-a/DESIGN.md`. Ook deze validator faalt bewust zolang `brand.json` niet `verified` is.

`validate-minimalistisch.mjs` bewaakt de opgeleverde minimalistische variant: Nederlandse metadata, exact één H1, sectievolgorde, geldige `data-claim-id`'s, de drie modules, uitsluitend CTA's/links uit de canonieke kaart, de Artific Blue WebGL mesh-shader, de inhoudelijke workflowvisual, acht lokale klantlogo's, zes volledige klantbeoordelingen, canonieke merkkleuren, transparant-naar-solide navigatie, mobiele navigatie en reduced-motion-afbouw. Ook deze validator faalt bewust zolang `brand.json` niet `verified` is.

De huisstijlgate in `validate-content.mjs` is hard: `status: "verified"` vereist exact de aanwezige primaire bestanden `260506 Artific brand manual v1.0.pdf` (15 pagina's) en `260506 Voorbeelden creative materials.pdf` (3 pagina's), met de vastgelegde SHA-256. Elke kleur, logo-uitvoering, logo-achtergrond en contrastregel moet naar een geldige pagina in deze documenten verwijzen. De actuele basis is Artific Blue `#287CEB`, Artific Yellow `#FFD602`, Deep Navy `#042244`, Light Blue `#E5EDF8`, Neutral Gray `#64748B` en wit `#FFFFFF`; zie `assets/brand/README.md` voor de auditmatrix en de gedocumenteerde inconsistentie in de manual.
