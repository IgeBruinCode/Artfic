# Artific huisstijlbron

`brand.json` is de enige geldige bron voor kleuren en logo's van de vijf landingspagina-varianten. De waarden mogen **uitsluitend** komen uit de twee aangeleverde referentiedocumenten:

- `260506 Artific brand manual v1.0.pdf`
- `260506 Voorbeelden creative materials.pdf`

Beide bestanden staan in `.gitignore`: ze worden **nooit gecommit** en zijn **geen runtime-afhankelijkheid**. Alleen daaruit geverifieerde kleurwaarden, gebruiksregels en als zelfstandige lokale SVG geëxporteerde logo's horen in deze map.

## Huidige status: `pending-source-material`

Op 2026-07-15 waren de twee PDF's nergens op de buildomgeving aanwezig (volledige zoekactie over het bestandssysteem). Omdat de opdracht verbiedt kleuren of logo's van de live websites of uit aannames af te leiden, zijn `colors` en `logos` in `brand.json` bewust leeg gelaten in plaats van gevuld met ongeverifieerde waarden.

## Werkwijze zodra de PDF's beschikbaar zijn

1. Plaats de PDF's in de repository-root (de `.gitignore`-regels houden ze buiten Git).
2. Inspecteer beide documenten visueel én met PDF-extractietooling.
3. Neem per kleur op: documentnaam/-id, paginanummer, kleurmodus en waarde exact zoals in het document, rol (bijv. primair/accent/achtergrond) en gebruiksbeperkingen.
4. Exporteer de toegestane logo-uitvoeringen voor lichte en donkere achtergronden als zelfstandige SVG's in deze map (semantische namen, tekst omgezet naar paden, geen externe URL's) en registreer per logo herkomst, exportmethode en toegestane toepassing in `brand.json`.
5. Vergelijk elke SVG en kleurstaal visueel met de genoemde PDF-pagina's en zet `status` op `verified`.
6. Draai `node scripts/validate-content.mjs`; die controleert de structuur en dat alle geregistreerde assetpaden lokaal bestaan.
