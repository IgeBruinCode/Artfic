# Artific — vijf landingspagina-varianten

Statische HTML-website met vijf onafhankelijk bekijkbare, klantgerichte landingspagina-varianten voor Artific, gebouwd op één gedeelde content-, CTA- en huisstijlbron. Bewust zonder framework, bundler of dependencies: elke variant is een zelfstandige, servergerenderde/statische HTML-pagina (goed voor SEO/GEO en eenvoudig onderhoud).

## Routecontract (vast, wijzigt niet)

| Variant | Adres | Status |
| --- | --- | --- |
| Minimalistisch | `/minimalistisch/` | **Gebouwd** — volledige landingspagina met eigen stijlgids; `minimalistisch/DESIGN.md` is via de Google Stitch-MCP gefinaliseerd in een afzonderlijk Stitch-project (provenance in het document zelf) |
| Brutalistisch A | `/brutalistisch-a/` | **Gebouwd** — volledige landingspagina; `brutalistisch-a/DESIGN.md` is via de Google Stitch-MCP gefinaliseerd (provenance in het document zelf) |
| Brutalistisch B | `/brutalistisch-b/` | **Gebouwd** — volledige landingspagina ("tabloid register") met eigen stijlgids en QA-log; `brutalistisch-b/DESIGN.md` is via de Google Stitch-MCP gefinaliseerd in een afzonderlijk Stitch-project (provenance in het document zelf) |
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
- `assets/brand/brand.json` + `assets/brand/README.md` + `assets/brand/*.svg` — huisstijlbron: geverifieerde merkkleuren en zelfstandige logo-assets. **Status: `verified`** — elke waarde en logo-uitvoering is meetbaar geverifieerd tegen vier officieel door Artific gepubliceerde, huisstijldragende PDF-documenten (documentId + paginanummers + evidence per waarde; documenten met URL en SHA-256). De twee oorspronkelijk aangewezen interne referentie-PDF's (brand manual en creative materials) zijn nooit aangeleverd; bij alsnog aanleveren wordt elke waarde daartegen hertoetst. Afwijking en herverificatieprocedure: `assets/brand/README.md` en het `deviation`-blok van `brand.json`.

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

Controleert JSON-syntax, unieke claim-IDs, oplosbaarheid van alle bronankers, de verplichte themagroepen, exact drie benoemde modules, de volledige CTA-kaart met veilige bestemmingen, het demo-besluit, de huisstijlbron en de vijf routebestanden. Dependency-vrij (Node-standaardbibliotheek).

Handmatige browser-QA is reproduceerbaar via `node scripts/serve.mjs 4173` vanuit de root (dependency-vrij; `python3 -m http.server` kan ook). De setbrede QA-matrix van de afronding (rootkeuze plus alle vijf routes op 320/768/1440 px, toetsenbord, CTA's, reduced motion, JS/CDN-uitval) staat in `QA.md`; eerdere per-variantmatrices staan in `brutalistisch-a/QA.md`, `brutalistisch-b/QA.md` en `conventioneel/QA.md`.

`validate-site.mjs` controleert de set als geheel: de rootkeuzepagina (exact vijf benoemde, gelijkwaardige keuzes met de vaste routes, alleen merkkleuren en het blauwe logo), per variant de route, één H1, kernclaims, beide officiële conversie-CTA's tegen de canonieke kaart en een geslaagd Stitch-ontwerpdocument; daarna draait hij de contentvalidator en alle vijf variantvalidators.

`validate-premium.mjs` bewaakt variant Premium op dezelfde manier als de zustervalidators, aangevuld met de eigen dossierstructuur (statische donkere header, exact één evidence-index, drie maturity-fasen, één controle-architectuur met drie lagen, exact drie module-sequence-hoofdstukken, minimaal zes assurance-ledger-items, exact vijf begeleidingsstappen) en een verbod op zustervariant-signaturen, inline SVG, gradients/blur/schaduwen/afronding/transparante kleuren en standaard verborgen inhoud.

`validate-conventioneel.mjs` bewaakt variant Conventioneel op dezelfde manier, aangevuld met de eigen trust-center-SaaS-structuur (sticky SaaS-header met lokale navigatie, exact één trust-console met drie lagen, één bewijsrail, exact drie module-cards, minimaal zes assurance-items, exact vijf implementatiestappen) en een verbod op signaturen van de drie zustervarianten (commandobar, sectiecodes, platen, folio's, register, spread), inline SVG, gradients/blur/transparante kleuren en standaard verborgen inhoud. De uitgevoerde handmatige QA-matrix staat in `conventioneel/QA.md`.

`validate-brutalistisch-b.mjs` bewaakt variant Brutalistisch B op dezelfde manier, aangevuld met de eigen tabloid-registerstructuur (statische masthead, hoofdstukregister naar exact zes folio's, één aaneengesloten modulespread, security-grootboek) en een verbod op Brutalistisch A-signaturen (commandobar, sectiecodes, platen, pipeline, offset-schaduwen). De uitgevoerde handmatige QA-matrix staat in `brutalistisch-b/QA.md`.

`validate-brutalistisch-a.mjs` bewaakt variant Brutalistisch A op dezelfde manier, aangevuld met de brutalistische structuurkenmerken (zichtbare sectiecodes, exact drie moduleplaten, geen afronding/gradients/blur, uitsluitend transform-animaties) en de verplichte hoofdstukken in `brutalistisch-a/DESIGN.md`. Ook deze validator faalt bewust zolang `brand.json` niet `verified` is.

`validate-minimalistisch.mjs` bewaakt de opgeleverde minimalistische variant: Nederlandse metadata, exact één H1, sectievolgorde, geldige `data-claim-id`'s (incl. de drie modules), uitsluitend CTA's/links uit de canonieke kaart, alleen goedgekeurde lokale logo's, alleen hexkleuren uit `brand.json`, gepinde GSAP/ScrollTrigger-CDN met reduced-motion-guards en de verplichte hoofdstukken in `minimalistisch/DESIGN.md`. Ook deze validator faalt bewust zolang `brand.json` niet `verified` is: de variant kan niet als opgeleverd gelden op een ongeverifieerde huisstijl.

De huisstijlgate in `validate-content.mjs` is hard: de eindoplevering vereist `status: "verified"`, waarbij elke kleur en logo-uitvoering meetbaar is geverifieerd tegen officieel door Artific gepubliceerde PDF-documenten. De twee oorspronkelijk aangewezen interne PDF's (`260506 Artific brand manual v1.0.pdf`, `260506 Voorbeelden creative materials.pdf`) zijn nooit aan de buildomgeving aangeleverd; zolang dat zo is, is een volledig `deviation`-blok met herverificatiepad verplicht (zie `assets/brand/README.md`). Daarnaast blijft per kleur/logo `pdfProvenance` (beschikbaar documentId, geldige paginanummers en evidence), reproduceerbare referentiedocumenten (artific.nl-URL + SHA-256, `available: true`) en een gedocumenteerde `deviation` verplicht.

## Referentiemateriaal en secrets

- `260506 Artific brand manual v1.0.pdf` en `260506 Voorbeelden creative materials.pdf` zijn genegeerde referentiebestanden: plaats ze lokaal in de repository-root, commit ze nooit en maak runtime nooit van ze afhankelijk. Ze zijn nooit aan de buildomgeving aangeleverd; de huisstijlbron is daarom geverifieerd tegen openbaar door Artific gepubliceerde PDF-documenten en wordt bij alsnog aanleveren van de interne PDF's daartegen hertoetst (zie `assets/brand/README.md` voor afwijking en herverificatieprocedure). Ook de verificatie-PDF's van artific.nl worden niet gecommit; ze zijn via URL en SHA-256 in `brand.json` reproduceerbaar.
- Commit geen API-sleutels of andere credentials. `.env`-varianten staan in `.gitignore`. De Google Stitch-MCP voor de designdocumenten van de varianttickets gebruikt een veilig aangeboden omgevingscredential, nooit een waarde in de repository.
