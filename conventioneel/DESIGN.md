# Ontwerpdocument — variant Conventioneel (trust-center SaaS)

Stijlgids voor de landingspagina op `/conventioneel/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: het document is met `upload_design_md` geüpload naar Stitch-project `5627763905823275232` ("Artific — Conventioneel (trust-center SaaS)", screen `16895288171644647696`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/3d7545ac2c3843e389918d2d7421e7e1` ("Conventional Trust"). De door Stitch vastgelegde named colors bevatten exact de merktokens uit `assets/brand/brand.json` (`primary_container #0A213D`, `marine-blue #062244`, `surface-light #E5EDF8`, `surface_container_lowest #FFFFFF`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. De door Stitch teruggegeven stijlrichtlijnen (wit→lichtblauw→donkerblauw sectieritme, 12-koloms 1200px-grid op 8px-schaal, tonale gelaagdheid zonder schaduwen/gradients, 12–20px afronding, 1–2px effen randen, donkerblauwe primaire en oranjegele accent-CTA's, 2px hover-lift, 3px focusringen, gestapelde trust-console met statuschips) komen overeen met de implementatie; waar Stitch generieker formuleert (zoals de headernavigatie-afbouw, hier op 900px) blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

> **Huisstijlherijking:** de Stitch-provenance hierboven blijft als historische runregistratie letterlijk behouden. De daarin genoemde toenmalige token-snapshot is niet langer de merkbasis; de actuele implementatie en onderstaande kleurregels volgen de twee lokale primaire PDF’s en `assets/brand/brand.json`.

## Ontwerpprincipes

Een herkenbare, lichte B2B-SaaS-route die vertrouwen stap voor stap opbouwt: een altijd zichtbare sticky sectienavigatie, split hero met governance-console, een bewijsrail, platformmodules, een zichtbaar assurance-register en de vaste conversiesectie. Consolechips zijn gewone ankerlinks naar hun onderbouwing; geen claim, navigatiedoel of assurance-item is afhankelijk van JavaScript. Afgeronde effen panelen, blauwe randen en het ritme wit → lichtblauw → wit houden deze route duidelijk los van de editorial, brutalistische en dossiergerichte varianten.

## Kleurgebruik

Uitsluitend de bevestigde waarden uit `assets/brand/brand.json` (status `verified`). Er zijn geen afgeleide tinten, transparante kleuren, gradients, filters, blur of schaduwen.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Wit | `#FFFFFF` | hoofdcanvas, panelen, chips en tekst op donker |
| Artific Navy | `#042244` | lopende tekst, primaire CTA, Artific-laag, slotsectie en footer |
| Artific Blue | `#287CEB` | randen, bewijsrail, grote bewijscijfers en focus op lichte oppervlakken |
| Artific Light Blue | `#E5EDF8` | tintsecties, consolevlak, scheidingslijnen en selectie |
| Artific Yellow | `#FFD602` | conversie-CTA op donker, donkere focusring en conclusieregel |

Kleine tekst staat navy op wit/lichtblauw of wit op navy. Blue op wit is gereserveerd voor grote bewijscijfers en decoratieve lijnen. Yellow draagt navy tekst. Het blauwe logo staat alleen op de witte header; het witte logo alleen op de navy footer.

## Spacing

De 8px-schaal loopt via `--ruimte-1` (8px) tot `--ruimte-5` (64px). Secties gebruiken `clamp(64px, 8vw, 104px)`, de hero `clamp(48px, 7vw, 88px)` en containers maximaal 1200px met `clamp(16px, 5vw, 48px)` gutters. Leestekst blijft maximaal 64ch. Panelen gebruiken 12–20px radius en doorgaans 24px binnenruimte.

Anker-offsets volgen de feitelijke sticky header: 170px op klein mobiel, 166px vanaf 420px, 126px vanaf 720px en 88px vanaf 900px. Dit geldt voor hoofdsecties én de zes assurance-items.

## Visuele hiërarchie

- Systeemfont-stack `"Helvetica Neue", Helvetica, Arial, sans-serif`; geen webfonts.
- Eén H1 van `clamp(2.25rem, 5vw, 3.75rem)`, H2 `1.75–2.625rem`, H3 `1.2–1.5rem`, H4 `1.05–1.2rem`; body 1.0625rem met regelafstand 1.6.
- De hero zet de belofte links en het controlepad rechts. De bewijsrail volgt direct en verbindt de drie bewijsitems met één effen CSS-lijn.
- Product en governance vormen de kern: eerst de brede moduletrap, daarna de volledig zichtbare assurance-items waar de console naartoe verwijst.

## Componentstijl

- **Header:** wit, sticky en met 2px Light Blue-onderrand. Logo, vijf lokale links en demo-CTA zijn op iedere breedte zichtbaar en hebben doelen van minimaal 44px.
- **Trust-console:** Light Blue-paneel met 20px radius, consolekop, drie gestapelde lagen en effen verbindingen. Vier statuschips zijn echte links: EU en ISO naar hun assurance-item, API-first naar `#platform`, Model-agnostisch naar zijn assurance-item.
- **Bewijsrail:** drie witte 16px-panelen langs één doorlopende Blue-lijn, gevolgd door de canonieke klantnamen in een eigen effen bewijsregel.
- **Moduletrap:** één twaalfkoloms compositie vanaf 1024px. De drie directe cards zijn tien kolommen breed op `1 / 11`, `2 / 12` en `3 / 13`, elk op een eigen rij en intern verdeeld in een 3/7 kop-/inhoudsgrid. Tot en met 1023px worden kolom, rij, breedte, marge en interne layout expliciet lineair gereset; de DOM-volgorde blijft AI Assistant → AI ToolBox → Conversation Module.
- **Assurance-register:** een altijd zichtbare `dl` met zes stabiele IDs. `:target` geeft het gekozen item een 3px Blue-outline zonder inhoud te verbergen of de layout te verschuiven.
- **CTA's en focus:** 12px radius en minimaal 48px hoog (44px in de compacte header). Focus is 3px Blue op licht en Yellow op navy.
- **Footer:** navy met wit logo en de vaste contact-, mail- en telefoonlinks.

## Motion

GSAP 3.12.5 en ScrollTrigger zijn optionele progressive enhancement. `main.js` stopt vóór pluginregistratie wanneer reduced motion al actief is of een CDN-global ontbreekt. CSS zet niets vooraf verborgen of verplaatst.

- De drie bewijsitems en zes assurance-items krijgen een eenmalige 12px verticale groepsentree; de modules gebruiken korte x-translates van -16px, 12px en -12px.
- De twee consoleverbindingen bouwen via `scaleY` op. Alle groepsentrees duren 0,48s, gebruiken `immediateRender: false`, `once: true`, overwrite en wissen daarna hun inline transform.
- CTA's krijgen alleen een 2px transform-lift. ScrollTrigger beheert `aria-current="location"` voor de lokale navigatie.
- Wanneer reduced motion tijdens een sessie wordt ingeschakeld, worden eigen tweens, triggers en CTA-tweens gestopt; inline transforms en navigatiestatus worden opgeruimd.
- Bij JavaScript- of CDN-uitval blijft de definitieve statische toestand volledig zichtbaar en bedienbaar.

## Responsief gedrag

Mobile-first. Onder 720px staat de header in twee functionele zones: logo + demo-CTA op de eerste rij en de vijf links op een 3-koloms raster van twee rijen. Vanaf 720px staan de links op één rij onder logo/CTA. Vanaf 900px vormt de header één compacte desktopregel; vanaf 1100px worden logo, links, gaps en CTA ruimer. Het logo wisselt op 420px van 104 naar 120px en gebruikt vanaf 1100px de intrinsieke 132px-breedte.

Inhoudsgrids schakelen vanaf 720px naar twee of drie kolommen waar dat leesbaar is. Hero en de brede moduletrap starten op 1024px; assurance gebruikt daar drie kolommen en implementatiestappen vijf. Tot en met 1023px staan modules volledig lineair in canonieke volgorde. Op 320px blijven header, vijf links, CTA's, consolechips en focusringen binnen de viewport.
