# Artific huisstijlbron

`brand.json` is de enige geldige bron voor kleuren en logo's van de vijf landingspagina-varianten. Varianten mogen geen kleur of logo gebruiken dat hier niet in staat.

## Herkomst van de huidige waarden (`status: verified`)

Alle waarden komen uit **door Artific zelf gepubliceerde merkassets** op de drie voorgeschreven bronpagina's, opgehaald op 2026-07-15:

- **Logo's** — `artific-logo-blauw.svg` is byte-gelijk aan `https://vision.artific.nl/clients/artific/logo.svg` (identiek geserveerd door product.artific.nl); `artific-logo-wit.svg` is byte-gelijk aan `https://artific.nl/inhoud/uploads/Logo.svg` (de uitvoering in de donkere header/footer van artific.nl). Beide zijn zelfstandige SVG's: alleen paden, geen fonts, scripts of externe URL's. Exportmethode: ongewijzigde download van het origineel.
- **Kleuren** — het Artific-klantthema (CSS-designtokens `--pres-*`) dat vision.artific.nl en product.artific.nl identiek definiëren, plus de fills van de logo-SVG's zelf. De logokleur `#287CEB` is exact gelijk aan het `--pres-primary`-token, wat de waarden onderling bevestigt. Er is géén kleur visueel afgelezen of gegokt.

## Relatie tot de twee referentie-PDF's

De opdracht wijst `260506 Artific brand manual v1.0.pdf` en `260506 Voorbeelden creative materials.pdf` aan als definitieve referentie. Beide staan in `.gitignore`, worden **nooit gecommit** en zijn **geen runtime-afhankelijkheid**. Op 2026-07-15 waren ze echter nergens beschikbaar: niet op het bestandssysteem van de buildomgeving, niet in de Git-historie of remote-branches van deze repository en niet op een officiële downloadlocatie (alles exhaustief doorzocht). Daarom is teruggevallen op de hierboven beschreven, door Artific gepubliceerde assets; die afwijking en de exacte herkomst per waarde staan in `brand.json` (`pdfCrossCheck`).

### Kruisverificatie zodra de PDF's beschikbaar zijn

1. Plaats de PDF's in de repository-root (de `.gitignore`-regels houden ze buiten Git).
2. Inspecteer beide documenten visueel én met PDF-extractietooling.
3. Vergelijk elke kleur en elk logo in `brand.json` met het document; vul per waarde de provenance aan met documentnaam en paginanummer, en corrigeer of verwijder afwijkende waarden.
4. Vergelijk de SVG's visueel met de logopagina's van de brand manual; vervang ze alleen door PDF-exports als de manual een andere uitvoering voorschrijft (tekst naar paden, geen externe URL's).
5. Draai `node scripts/validate-content.mjs`; die eist status `verified`, complete provenance en lokaal aanwezige, zelfstandige SVG's.
