# Artific huisstijlbron

`brand.json` is de enige geldige bron voor kleuren en logo's van de vijf landingspagina-varianten. Varianten mogen geen kleur of logo gebruiken dat hier niet in staat.

## Status: `unverified` — wacht op de twee interne referentie-PDF's

De twee aangewezen interne referentiedocumenten (`260506 Artific brand manual v1.0.pdf` en `260506 Voorbeelden creative materials.pdf`) zijn nooit aan de buildomgeving aangeleverd. De waarden in `brand.json` zijn daarom **niet goedgekeurd**: ze zijn alleen gedocumenteerd tegen openbaar door Artific gepubliceerde PDF-collateral. Die documenten tonen kleuren en logo's in gebruik, maar bewijzen niet dat het goedgekeurde, herbruikbare merktokens zijn en leggen de gebruiksregels uit de brand manual niet vast. `scripts/validate-content.mjs` staat `verified` pas toe wanneer beide interne PDF's als beschikbaar referentiedocument zijn opgenomen.

Elke kleur en elke logo-uitvoering in `brand.json` draagt `pdfProvenance` met documentId, paginanummer(s) en concrete evidence, verwijzend naar vier officieel door Artific gepubliceerde, huisstijldragende PDF-documenten van artific.nl (whitepaper, brochure, infographic en persbericht — zie `referenceDocuments` met URL, SHA-256 en ophaaldatum per document). De verificatie is meetbaar uitgevoerd, niet visueel geschat:

1. De PDF's zijn gedownload van hun officiële artific.nl-URL en per SHA-256 vastgelegd (reproduceerbaar te controleren).
2. Met mupdf (WASM, alleen build-tooling; geen repository-dependency) zijn per pagina alle vector-fill-, stroke- en tekstkleuroperatoren uitgelezen — dit geeft exacte hexwaarden zoals ze in het document staan.
3. De logokleur in het persbericht (raster) is per pixel gemeten op een 3x-rendering: dominant exact `#287CEB`.
4. Elke pagina is daarnaast gerenderd en visueel vergeleken met de logo-SVG's en kleurrollen.

De vier documenten bevestigen onderling consistent dezelfde kleurenset en dezelfde twee logo-uitvoeringen (wit op donker; blauw `#287CEB` op licht).

## Afwijking: de twee interne referentie-PDF's zijn nooit aangeleverd

De opdracht wees `260506 Artific brand manual v1.0.pdf` en `260506 Voorbeelden creative materials.pdf` aan als referentie. Beide staan in `.gitignore`, maar zijn in zes bouwpogingen (laatst 2026-07-15) nooit aan de buildomgeving aangeleverd: niet op het bestandssysteem (volledige schijfscan, ook zonder `.pdf`-extensie en op PDF-magic-bytes), niet in de Git-historie of op enige remote-branch, niet in de volledige openbare WordPress-mediabibliotheek van artific.nl (614 items via de REST-API doorlopen) en niet via sitemaps of andere officiële locaties.

De waarden zijn daarom gedocumenteerd tegen de sterkst beschikbare openbare bron: door Artific zélf gepubliceerde PDF-materialen. Dat is documentatie van gebruik, géén merk-goedkeuring; de status blijft `unverified` tot de interne PDF's er zijn. Die afwijking staat expliciet in het `deviation`-blok van `brand.json`, inclusief de correcties ten opzichte van de eerdere web-afgeleide kandidaten:

- **exact bevestigd:** `#287CEB`, `#ECA414`, `#FFFFFF`;
- **gecorrigeerd:** donkerblauw webtoken `#042244` → in de documenten `#0A213D` (whitepaper/brochure) en `#062244` (infographic-achtergrond); lichtblauw webtoken `#C9DAF2` → `#E5EDF8`;
- **verwijderd:** webtoken `#7790AE` (komt in geen enkel Artific-document voor).

## Herverificatie zodra de interne PDF's alsnog beschikbaar komen

1. Plaats de twee PDF's lokaal in de repository-root (de `.gitignore`-regels houden ze buiten Git; commit ze nooit en maak runtime nooit van ze afhankelijk).
2. Inspecteer beide documenten visueel én met PDF-extractietooling (zelfde meetmethode als hierboven).
3. Vergelijk elke kleur en elk logo in `brand.json`; corrigeer of verwijder afwijkende waarden en voeg ontbrekende goedgekeurde waarden toe.
4. Vul `pdfProvenance` aan met de interne documenten (voeg ze met `available: true` toe aan `referenceDocuments`), controleer ook de logo-gebruiksregels tegen de brand manual en werk het `deviation`-blok bij.
5. Zet pas daarna `status` op `verified` en draai `node scripts/validate-content.mjs` tot die slaagt.

## Logo-assets

- `artific-logo-blauw.svg` — woordmerk + AI-beeldmerk, alle paden `#287CEB`; byte-gelijk overgenomen van het door Artific gepubliceerde SVG en per PDF vergeleken met de briefhoofding van het persbericht (kleur pixel-exact). Voor lichte achtergronden.
- `artific-logo-wit.svg` — dezelfde uitvoering, alle paden `#fff`; per PDF vergeleken met covers en footerbanden van whitepaper, brochure en infographic. Voor donkere achtergronden.

Beide SVG's zijn zelfstandig: alleen paden, geen fonts, scripts of externe URL's. Ze worden niet hertekend of herkleurd; `scripts/validate-content.mjs` controleert dit.
