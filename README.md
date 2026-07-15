# Artific — vijf landingspagina-varianten

Statische HTML-website met vijf onafhankelijk bekijkbare, klantgerichte landingspagina-varianten voor Artific, gebouwd op één gedeelde content-, CTA- en huisstijlbron. Bewust zonder framework, bundler of dependencies: elke variant is een zelfstandige, servergerenderde/statische HTML-pagina (goed voor SEO/GEO en eenvoudig onderhoud).

## Routecontract (vast, wijzigt niet)

| Variant | Adres |
| --- | --- |
| Minimalistisch | `/minimalistisch/` |
| Brutalistisch A | `/brutalistisch-a/` |
| Brutalistisch B | `/brutalistisch-b/` |
| Conventioneel (SaaS) | `/conventioneel/` |
| Premium | `/premium/` |

Lokaal bekijken:

```sh
python3 -m http.server 4173
# daarna bijv. http://localhost:4173/minimalistisch/
```

De routes zijn in dit baseticket minimale `noindex`-statuspagina's; de varianttickets vervangen telkens alleen de inhoud, nooit het pad. De root-keuzepagina (`/`) komt pas in het premium-/afrondingsticket.

## Gedeelde bronnen

- `content/artific-content.nl.json` — **de enige canonieke inhouds- en CTA-bron.** Compacte Nederlandse claims per themagroep, elk met `sourceRefs` naar de originele passage; plus de canonieke CTA-kaart (labels, bestemmingen, gedrag, demo-fallbackmotivering).
- `content/sources/*.md` — gedateerde snapshots van de oorspronkelijke SEO-/paginatekst van artific.nl, vision.artific.nl/nl en product.artific.nl/nl, met stabiele ankers (`<a id="..."></a>`).
- `content/sources/demo-trigger-observation.md` — geobserveerd live clientgedrag van "Vraag een demo aan" en het vastgelegde fallbackbesluit.
- `assets/brand/brand.json` + `assets/brand/README.md` + `assets/brand/*.svg` — huisstijlbron: kandidaatkleuren en zelfstandige logo-assets met volledige herkomst per waarde. **Status: `pdf-verificatie-vereist`** — definitieve goedkeuring vereist kruisverificatie tegen de twee referentie-PDF's met document- en paginaverwijzing per waarde; de validator faalt bewust zolang die ontbreekt (procedure: `assets/brand/README.md`).

### Redactionele regels voor varianten

1. Kies variantcopy uit de claim-IDs in `content/artific-content.nl.json` en schrijf de gekozen tekst statisch als semantische HTML uit (geen client-side fetch van de contentbron).
2. Claims met `strict: true` (cijfers, complianceformuleringen) mogen worden ingekort maar nooit aangescherpt, gecombineerd of sterker beloofd.
3. CTA's uitsluitend uit de CTA-kaart; nooit een kale `#` of verzonnen bestemming. Demo-aanvragen gaan naar de officiële contactpagina (gedocumenteerde afwijking).
4. Kleuren en logo's uitsluitend uit `assets/brand/`; varianten voegen nooit eigen of ad-hoc afgeleide merkwaarden toe.

## Kwaliteitscontrole

```sh
node scripts/validate-content.mjs
```

Controleert JSON-syntax, unieke claim-IDs, oplosbaarheid van alle bronankers, de verplichte themagroepen, exact drie benoemde modules, de volledige CTA-kaart met veilige bestemmingen, het demo-besluit, de huisstijlbron en de vijf routebestanden. Dependency-vrij (Node-standaardbibliotheek).

De huisstijlgate accepteert alleen `status: "verified"` mét per kleur/logo een `pdfProvenance` (documentId + paginanummer) en beide referentiedocumenten op `available: true`. Zolang de twee referentie-PDF's niet zijn aangeleverd en verwerkt, eindigt de validator dus met een fout op uitsluitend de huisstijlonderdelen — dat is de bedoelde bewaking, geen defect; de content-, CTA- en routecontroles slagen onafhankelijk daarvan.

## Referentiemateriaal en secrets

- `260506 Artific brand manual v1.0.pdf` en `260506 Voorbeelden creative materials.pdf` zijn genegeerde referentiebestanden: plaats ze lokaal in de repository-root, commit ze nooit en maak runtime nooit van ze afhankelijk. Zie `assets/brand/README.md` voor de verwerkingsprocedure.
- Commit geen API-sleutels of andere credentials. `.env`-varianten staan in `.gitignore`. De Google Stitch-MCP voor de designdocumenten van de varianttickets gebruikt een veilig aangeboden omgevingscredential, nooit een waarde in de repository.
