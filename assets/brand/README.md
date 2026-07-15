# Artific huisstijlbron

`brand.json` is de enige geldige bron voor kleuren en logo's van de vijf landingspagina-varianten. Varianten mogen geen kleur of logo gebruiken dat hier niet in staat.

## Huidige status: `pdf-verificatie-vereist`

De opdracht wijst twee documenten aan als definitieve referentie voor goedgekeurde kleuren en logo's:

- `260506 Artific brand manual v1.0.pdf`
- `260506 Voorbeelden creative materials.pdf`

Beide staan in `.gitignore`, worden **nooit gecommit** en zijn **geen runtime-afhankelijkheid**. Ze waren echter tijdens alle drie de bouwpogingen (laatst 2026-07-15) aantoonbaar afwezig in de buildomgeving: niet op het bestandssysteem (volledige schijfscan), niet in de Git-historie of op enige remote-branch, niet in de openbare WordPress-mediabibliotheek van artific.nl en niet op een andere officiële locatie; ook de planningsfase trof ze niet aan. **Ze moeten door de opdrachtgever buiten Git in de repository-root worden geplaatst.**

Daarom bevat `brand.json` nu uitsluitend **kandidaatwaarden** met volledige, controleerbare webherkomst: het officiële Artific-logo-SVG (byte-gelijk overgenomen van vision.artific.nl/product.artific.nl en artific.nl) en het Artific-klantthema (CSS-designtokens, identiek op vision én product). Er is géén kleur visueel afgelezen of gegokt. Deze kandidaten zijn **niet goedgekeurd voor definitief gebruik** totdat ze tegen de PDF's zijn geverifieerd; `scripts/validate-content.mjs` faalt bewust zolang die verificatie ontbreekt en accepteert `verified` niet zonder per-waarde PDF-provenance.

## Afrondingsprocedure (zodra de PDF's beschikbaar zijn)

1. Plaats de twee PDF's in de repository-root (de `.gitignore`-regels houden ze buiten Git).
2. Inspecteer beide documenten visueel én met PDF-extractietooling.
3. Vergelijk elke kleur en elk logo in `brand.json` met het document. Corrigeer of verwijder afwijkende waarden; voeg ontbrekende goedgekeurde waarden toe.
4. Vul per kleur en per logo `pdfProvenance` in: `{ "documentId": "brand-manual" | "creative-materials", "page": <paginanummer> }`.
5. Vergelijk de SVG's visueel met de logopagina's van de brand manual; vervang ze alleen door PDF-exports als de manual een andere uitvoering voorschrijft (tekst naar paden, zelfstandig, geen externe URL's).
6. Zet per referentiedocument `available` op `true` en de `status` op `verified`.
7. Draai `node scripts/validate-content.mjs`; die eist status `verified`, beide documenten `available`, per waarde `pdfProvenance` met geldig documentId en paginanummer, en lokaal aanwezige, zelfstandige SVG's.
