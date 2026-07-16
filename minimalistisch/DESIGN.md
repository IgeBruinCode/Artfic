# Ontwerpdocument — variant Minimalistisch

Stijlgids voor de landingspagina op `/minimalistisch/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de in dit document vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: het document is met `upload_design_md` geüpload naar Stitch-project `10126708337972370583` ("Artific — Minimalistisch (rustige editorial)", screen `17171847500156386945`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/f503f899b0534601b77f334f334c4d98` ("Artific Minimalist"). De door Stitch vastgelegde named colors bevatten exact de merktokens uit `assets/brand/brand.json` (`artific-blauw #287CEB`, `artific-donkerblauw #0A213D`, `artific-lichtblauw #E5EDF8`, `artific-oranjegeel #ECA414`, `surface_container_lowest #FFFFFF`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. Er zijn bij deze finalisatie geen ontwerpwaarden gewijzigd die niet in de bestaande CSS/JS staan; de implementatie blijft leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

> **Huisstijlherijking:** de Stitch-provenance hierboven blijft als historische runregistratie letterlijk behouden. De daarin genoemde toenmalige token-snapshot is niet langer de merkbasis; de actuele implementatie en onderstaande kleurregels volgen de twee lokale primaire PDF’s en `assets/brand/brand.json`.

## Ontwerpprincipes

Rustig en doelbewust: tekst, witruimte en uitlijning dragen de aandacht. Alle acht hoofdsecties gebruiken één gecentreerde `.sectie__grid`; dunne rails en brede open composities nemen de plaats in van cards, dashboards, fotografie en iconengrids. De flow-compositie is het enige abstracte schema. Verder gebruikt de pagina uitsluitend typografie, lijnen, de bevestigde merkkleuren en de officiële logo's.

Vanaf 980px verdeelt iedere sectie dezelfde inhoudsbreedte in twaalf kolommen. Marge-informatie staat op kolommen 1–2, sectiekoppen op 3–9, lees- en ondersteunende tekst hoofdzakelijk op 5–10 en hoofdcomposities op 3–12. De hero gebruikt 1–8 voor het verhaal en 10–12 voor bewijs. Daardoor ontstaan betekenisvolle open zones, geen toevallige lege helften.

## Kleurgebruik

Uitsluitend de waarden uit `assets/brand/brand.json` (status: `verified` — per waarde meetbaar geverifieerd tegen de twee aanwezige primaire PDF-documenten, met pagina-evidence in `brand.json`). Geen afgeleide tinten, gradients of transparante merkkleuren.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Wit | `#FFFFFF` | hoofdcanvas, tekst op donkere vlakken |
| Artific-donkerblauw | `#042244` | lopende tekst en koppen, primaire CTA-vulling, donkere contactsectie en footer |
| Artific-blauw | `#287CEB` | eyebrow- en sectierails, onderstrepingen, grote fasenummers, flow-pijlen en focusring op licht |
| Artific-lichtblauw | `#E5EDF8` | rustige sectiebanden, scheidingslijnen op wit, badge-randen, decoratieve modulenummers en selectie-achtergrond |
| Artific-geel | `#FFD602` | accentregels, primaire CTA en focusring op donkere oppervlakken |

Kleine lopende tekst is `#042244` op wit of lichtblauw en `#FFFFFF` op donkerblauw. `#287CEB` wordt op lichte oppervlakken alleen decoratief of op grote cijfers gebruikt. `#FFD602` is geen tekstkleur op wit; geel op donkerblauw is de toegankelijke accent- en focuscombinatie.

## Spacing en grid

De 8px-schaal blijft leidend: `--ruimte-1` 8px, `--ruimte-2` 16px, `--ruimte-3` 24px, `--ruimte-4` 40px en `--ruimte-5` 64px. Sectieruimte is verkort tot `clamp(64px, 7.5vw, 104px)` en de hero start met `clamp(56px, 8vw, 96px)`. Horizontale gutters zijn `clamp(16px, 5vw, 48px)`.

De maximale inhoudsbreedte is 1120px binnen een 1216px container inclusief desktopgutters. Het desktopgrid gebruikt `repeat(12, minmax(0, 1fr))`, een vaste kolomgap van 24px en een basis-row-gap van 24px. Header, secties en footer delen dezelfde containergrenzen. Lopende tekst blijft begrensd op `62ch`.

## Visuele hiërarchie

- Systeemfont-stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`; geen webfonts.
- Typografische schaal via `clamp()`: H1 `2.25–4rem`, H2 `1.75–2.75rem`, H3 `1.25–1.5rem`, H4 `1.05–1.2rem`, body `1–1.125rem` met regelafstand 1.6.
- Exact één H1; H2 per hoofdsectie, H3 voor vragen, fasen, modules en sublagen, H4 binnen onderliggende rijen.
- Eyebrows staan op desktop in de linker marge-as naast de H2. Hairlines verbinden de daaronder liggende hoofdstukken.
- Grote decoratieve nummers zijn `aria-hidden`; inhoud en documentvolgorde blijven zonder die nummers volledig begrijpelijk.

## Componentstijlen

- **Header:** sticky, wit met 1px lichtblauwe onderrand; blauw logo, vijf sectieankers op brede schermen en een compacte donkere CTA. Alle interactieve doelen zijn minimaal 44px hoog.
- **CTA's:** rechthoekig, 2px rand, gewicht 600 en minimaal 48px hoog. Primair is donkerblauw met wit; secundair wit met donkerblauw. Op de donkere slotsectie staan geel met donkerblauw en wit omlijnd naast elkaar. Focus is een zichtbare 3px blauwe of gele ring.
- **Editorial rijen en fasen:** open tekstgroepen tussen hairlines, zonder achtergrondvlak, schaduw of afgeronde kaartvorm. Vanaf 700px benutten de rijen twee kolommen.
- **Moduletrap:** `.modules` beslaat op desktop alle twaalf kolommen. AI Assistant staat op 1–8, AI ToolBox op 3–10 en Conversation Module op 5–12, elk op een eigen rij. Elke module is een open band met nummerrail, tekst en gedeelde hairline; de gezamenlijke bounds lopen van de linker- tot rechtergridrand.
- **Flow-compositie:** drie omlijnde tekstblokken met pijlen, verticaal op klein en horizontaal vanaf 700px. Het middelste Artific-blok is donkerblauw gevuld.
- **Tintbanden:** de controlelaag, governance en bewijssectie gebruiken Artific Light Blue met navy tekst en blauwe scheidingslijnen.
- **Quote en badges:** een quote met blauwe linkerlijn en sobere tekstchips met 1px lijn, zonder achtergrondvulling.
- **Footer:** donkerblauw met wit logo en de officiële contactlinks.

## Bewegingsprincipes

Beweging is een detail, nooit een voorwaarde. De volledige pagina is zichtbaar en bedienbaar zonder JavaScript, bij een geblokkeerd CDN en met reduced motion.

- GSAP 3.12.5 en ScrollTrigger zijn als optionele, gepinde jsDelivr-enhancement geladen. `main.js` stopt vóór registratie bij `prefers-reduced-motion: reduce` of ontbrekende GSAP-globals.
- Expliciete `data-reveal`-koppen komen éénmalig 14px omhoog met een opacity-inloop van 0,48s, `power2.out`, vanaf 88% van de viewport.
- De drie modules gebruiken dezelfde enter als één groep met 0,08s stagger. Flow-pijlen faden in 0,4s in met 0,2s stagger.
- CTA's krijgen op pointer-hover een lift van 2px in 0,18s. `overwrite: "auto"` voorkomt gestapelde tweens bij snelle pointerwissels.
- `immediateRender: false` laat inhoud zichtbaar tot de trigger werkelijk start; iedere enter wist daarna `opacity` en `transform`. CSS of HTML verbergt nooit standaard inhoud.
- Het reduced-motion-blok schakelt smooth scrolling, transitions en animaties uit.

## Responsief gedrag

Het editoriale twaalfkoloms grid en de moduletrap starten op 980px. Daaronder is `.sectie__grid` lineair en wordt `.modules` expliciet naar `display: block`, volle breedte en automatische gridpositie gereset. Daardoor blijft de canonieke DOM-volgorde AI Assistant → AI ToolBox → Conversation Module ook de visuele en toetsenbordvolgorde.

Vanaf 700px worden tweeluiken en editorial rijen tweekoloms en wordt de flow horizontaal. Tot en met 860px is de sectienavigatie verborgen zodat logo en header-CTA op 768px en kleiner niet botsen. Op 400px krijgt de header compactere afmetingen en gebruikt een module een compacte, wrapbare nummer-/tekstverdeling. Op 320px blijven CTA's, chips en tekst binnen de viewport zonder horizontale scroll. Sectieankers gebruiken `scroll-margin-top: 96px` voor de sticky header.
