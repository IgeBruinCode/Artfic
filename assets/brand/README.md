# Artific huisstijlbron

`brand.json` is de canonieke huisstijlbron voor de keuzepagina en alle vijf landingspagina's. De browser leest dit bestand en de PDF's niet; statische HTML/CSS gebruikt alleen de vooraf vastgelegde tokens en lokale logo-assets.

## Primaire documenten

De twee aangeleverde documenten staan in de repository-root en zijn de primaire auditbasis:

| Document-ID | Bestand | Pagina's | SHA-256 | Rol |
| --- | --- | ---: | --- | --- |
| `brand-manual` | `260506 Artific brand manual v1.0.pdf` | 15 | `b69b324c3b22c5ac38e793d76646b140617658c7c45854dc8fa60c74d3df9ea6` | normbron voor palet, logo, contrast en gebruik |
| `creative-materials` | `260506 Voorbeelden creative materials.pdf` | 3 | `63a1b03638a90ffc896e1b8e8755b59fa5fb8591ab854e53a41b988cd287a578` | bevestiging van concrete toepassingen; geen bron voor nieuwe kleurwaarden |

De bestandsnaam van de manual noemt v1.0; de zichtbare documenttitel binnen de PDF is "Artific Brand Manual v2.2". Provenance gebruikt steeds het rootpad en het zichtbare, 1-gebaseerde PDF-paginanummer.

## Auditmethode

1. SHA-256 en paginatelling zijn op de lokale bytes gecontroleerd.
2. Contentstreams, ToUnicode-tabellen en exacte kleur-operators zijn dependency-vrij uitgelezen met Node.js en `node:zlib`.
3. De 15 manual-pagina's zijn paginagewijs op uitgelezen tekst, kleur-operators en ingesloten beelden gecontroleerd. De drie creative-material-pagina's zijn als hun originele ingesloten JPEG's visueel bekeken; de logo-XObjects van manual p. 4 zijn lossless geëxtraheerd en op hoge resolutie vergeleken.
4. Alleen expliciete paletwaarden en geschreven regels uit de brand manual zijn toegestaan. Foto-, screenshot-, antialiasing- en hulpkleuren zijn niet als merkwaarde geoogst.
5. De validator herberekent contrast uit de hexwaarden. Daardoor geldt blauw op wit, ondanks de gedrukte `4.6:1` op pagina 7, op basis van `#287CEB` en `#FFFFFF` als `4.06:1` en dus alleen voor grote tekst.

## Bevestigde tokens

- Artific Blue `#287CEB` — manual p. 6 en 15.
- Artific Yellow `#FFD602` — manual p. 6 en 15.
- Deep Navy `#042244` — de expliciete swatch op p. 6, de onderliggende kleuroperator en de quick reference op p. 15. De losse regel `Deep Navy #062244` op p. 6 is intern tegenstrijdig en is daarom niet als extra token toegelaten.
- Light Blue `#E5EDF8` — manual p. 6 en 15.
- Neutral Gray `#64748B` — manual p. 6.
- Wit `#FFFFFF` — bevestigd door de logo-, contrast- en toepassingsregels op p. 4, 5, 7 en 14.

`brand.json` legt per token de concrete evidence vast. De oude collateralwaarden `#0A213D`, `#062244` en `#ECA414` zijn geen toegestane tokens in de nieuwe primaire basis. Alle zes stylesheets gebruiken dezelfde duidelijke custom-propertynamen `--blauw`, `--geel`, `--navy`, `--lichtblauw` en `--wit`; er zijn geen dubbele donker-/marine- of oranjegele legacy-aliassen.

## Logo-assets en achtergronden

- `artific-logo-blauw.svg` — officiële bestaande SVG, byte-ongewijzigd behouden; hash en vorm/vulling gecontroleerd. Alleen op wit of Light Blue (manual p. 4–5).
- `artific-logo-wit.svg` — officiële bestaande SVG, byte-ongewijzigd behouden; hash en vorm/vulling gecontroleerd. Alleen op Artific Blue of Deep Navy (manual p. 4–5).
- `artific-logo-navy.png` — het originele navy logo lossless geëxtraheerd uit RGB-XObject 43 en transparantiemasker 17 op manual p. 4, zonder hertekenen of herkleurwerk. Alleen op Artific Yellow.

De SVG's bevatten alleen paden en geen scripts, fonts, tekstobjecten, externe URL's of PDF-verwijzingen. De PNG is lokaal en transparant. `sha256` in `brand.json` borgt alle drie assets.

`logoUsageRules` legt de manualregels met stabiele IDs en eigen pagina-evidence vast: minimaal 80px digitale renderbreedte, automatische hoogte zonder transform/filter en handmatige clearspace-QA van minimaal één letter-`a` rondom. De validator leest de 80px uit deze structuur, controleert het werkelijke CSS-minimum en verbiedt vervorming/filtering op alle beperkte logoselectors; clearspace blijft expliciet een visuele QA-controle.

## Contrast- en gebruiksregels

`contrastPairs` bevat directionele paren uit de manual en uit herberekende toepassingen van het bevestigde palet. De validator berekent WCAG opnieuw: bodytekst vereist minimaal 4.5:1, grote tekst minimaal 3:1. Naast navy op wit/lichtblauw/geel zijn wit, lichtblauw en geel op navy canoniek vastgelegd; blauw op wit en wit op blauw zijn beperkt tot grote tekst. De variantvalidators eisen voor iedere niet-decoratieve CSS-tekst- en achtergronddeclaratie een expliciet oppervlaktecontract of een veilig paar in dezelfde regel. Voor ieder HTML-voorkomen controleren ze bovendien dat de voorgrond werkelijk binnen het geregistreerde DOM-oppervlak staat en dat andere klassen op dat element de achtergrond niet overschrijven. Daardoor falen ook een gedupliceerde of verplaatste CTA en hover-, compound- en responsieve overrides die in de uiteindelijke structuur een laag contrast vormen. Kleurvariabelen in border-, outline- en schaduwshorthands worden recursief opgelost; een onbekende of named-color custom property is geen geldige merkwaarde.

Logo-achtergrondregels staan afzonderlijk in `logoBackgrounds`. Iedere logo-tag koppelt logo-ID en achtergrond-ID aan een concrete CSS-oppervlakselector; de validator bewijst via de geparste HTML-ancestry dat het logo werkelijk een descendant van dat oppervlak en elementtype is. Daarna lost hij alle op dat concrete DOM-element toepasselijke `background`-regels inclusief specifieke en hover-overrides op. Globale/gerichte afbeeldingsfilters, logo-eigen achtergronden, te kleine dimensies en vervormende transforms/hoogtes falen. Alleen metadata naar een elders bestaand donker oppervlak laten wijzen is daardoor niet voldoende om een verplaatst logo te laten slagen.

## Build-time gate, geen runtime-afhankelijkheid

`scripts/validate-content.mjs` vereist exact beide root-PDF's, controleert hun hashes en paginatellingen, provenance/paginabereik, unieke IDs, kleur- en logoreferenties, assethashes/-veiligheid en berekende contrastdrempels. `scripts/validate-site.mjs` en de variantvalidators controleren vervolgens de gebruikte kleuren, assets, logo-achtergronden en het ontbreken van `.pdf`-runtimeverwijzingen. Bezoekers hoeven nooit een PDF te laden of te downloaden.
