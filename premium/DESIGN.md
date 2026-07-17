# Ontwerpdocument — variant Premium (executive evidence dossier)

Stijlgids voor de landingspagina op `/premium/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: eerst is met `create_project` en `generate_screen_from_text` (DESKTOP) een eigen conceptproject "Artific — Premium (executive evidence dossier)" opgezet met uitsluitend de centrale merktokens en logo-regels (concept-design-system `assets/28218d7c736747be98cad0364c23a049`, "Executive Evidence Dossier": hairline-dossierpanelen, tonale gelaagdheid zonder schaduwen, rechthoekige knoppen, evidence-definitielijsten en genummerde indexrail); daarna is dit document met `upload_design_md` geüpload naar Stitch-project `2405762213270064179` (screen `13176217260320799308`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/e0d0eb0396fc4e77b869197f47796338`. De door Stitch vastgelegde named colors bevatten exact de merktokens uit `assets/brand/brand.json` (`accent-focus #ECA414`, `background-tint #E5EDF8`, `primary_container #062244`, `surface_container_lowest #FFFFFF`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. Waar de Stitch-richtlijnen generieker formuleren (zoals een sticky indexrail op mobiel; deze pagina houdt de dossierregel bewust in de contentflow) blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

> **Huisstijlherijking:** de Stitch-provenance hierboven blijft als historische runregistratie letterlijk behouden. De daarin genoemde toenmalige token-snapshot is niet langer de merkbasis; de actuele implementatie en onderstaande kleurregels volgen de twee lokale primaire PDF’s en `assets/brand/brand.json`.

> **Narratieve revisie (2026-07-17):** de inhoud en claimvolgorde zijn behouden, maar de presentatie is lokaal herzien van een uniform dossier naar een visuele bestuursroute. De secties gebruiken nu afwisselend tellen, vergelijken, doorstromen, stapelen en doorlopen als compositieprincipe.

## Ontwerpprincipes

Een high-end executive evidence story: de pagina leidt een beslisser van belofte naar bewijs, risico, controlelaag, product, governance en implementatie. Donkere navy boekdelen openen en sluiten de route en dragen governance; witte en lichtblauwe boekdelen ordenen de argumentatie. Elke sectie begint met een dossierregel van index, hairline en label. Autoriteit komt uit vaste assen, typografische precisie en een wisselend maar logisch ritme — zonder schaduwen, afrondingen, dashboardsimulatie of decoratieve luxe.

## Kleurgebruik

Uitsluitend de bevestigde waarden uit `assets/brand/brand.json` (status: `verified`). Geen afgeleide tinten, transparantie, gradients of blur.

- `#042244` (Artific Navy) — header, hero, governance, slot, footer, tekst en betekenisvolle lijnen op licht.
- `#FFFFFF` (wit) — lichte boekdelen en lopende tekst op navy.
- `#E5EDF8` (Artific Light Blue) — getinte boekdelen en lichte evidence-scheidingen.
- `#287CEB` (Artific Blue) — hairlines, randen en decoratieve, `aria-hidden` indexcijfers op licht.
- `#FFD602` (Artific Yellow) — primaire CTA, indexcijfers en ledger-termen op navy en focus op donkere oppervlakken.

Kleine betekenisvolle tekst gebruikt navy op wit/Light Blue of wit/Artific Yellow op navy. Artific Blue blijft op lichte vlakken beperkt tot decoratieve cijfers en lijnen. Focus is 3px navy op licht en 3px Artific Yellow op navy, steeds met 3px offset.

## Spacing

De 8px-schaal loopt van `--r-1` (8px) tot `--r-12` (96px). Boekdelen gebruiken `clamp(88px, 11vw, 168px)`; dossierregels houden `clamp(32px, 5vw, 64px)` tot de sectiekop. Het kader is maximaal 1280px met `clamp(20px, 5vw, 64px)` zijruimte. Vanaf 1040px gebruikt ieder `.boekdeel > .kader` twaalf kolommen met een vaste 24px gutter (`--r-3`). De openingsalinea staat bij de hoofdstukken positie, product, governance en aanpak tegenover de H2, zodat de route eerst visueel landt en daarna pas toelicht.

## Visuele hiërarchie

Eén H1 opent het verhaal; de acht hoofdheadings vormen de primaire leeslijn. Koppen staan licht tot middelzwaar (450–500) in de lokale humanist-/neo-groteskstack. Dossierregels en ledger-termen gebruiken kleine kapitalen met ruime letterspatiëring. Bodyregels blijven binnen 62ch. De hero gebruikt een asymmetrische 7/4-verdeling met drie compacte kernsignalen. Daarna wisselt de compositie bewust tussen grote telankers, besluitvlakken, architectuurstromen, modulebanden en implementatiestappen.

## Componentstijlen

- **Dossierregel** — tabulair indexcijfer, 1px Artific Blue-hairline en uppercase hoofdstuklabel.
- **Hero-signalen** — drie omlijnde kernpunten met een vaste 01–03-index naast de hoofdstelling.
- **Evidence-index** — vijf bewijsregels met grote 01–05-telankers; op desktop staan bewijsroute en hoofdstukkop naast elkaar.
- **Directievragen** — drie aaneengesloten besluitvlakken die veilig, voorspelbaar en transparant als één besliskader presenteren.
- **Maturity-track** — één doorlopende rail met drie vierkante fasemarkeringen en een geaccentueerde eindfase.
- **Controle-architectuur** — drie aaneengesloten lagen modellen → Artific → processen, verbonden door richtingpijlen; de centrale Artific-laag is navy met Artific Yellow-kop.
- **Module-sequence** — vanaf 1040px een twaalfkoloms trap van drie brede productbanden op 1/11, 2/12 en 3/13. De middelste band is navy om de reeks een duidelijk visueel zwaartepunt te geven.
- **Assurance-ledger** — op navy een raster van zes beveiligingsvlakken in drie kolommen, elk met een compact controlemarkering.
- **Partnerlagen** — drie horizontale systeemlagen van fundament via domeinkennis naar bedrijfscontext.
- **Begeleiding** — vijf verbonden, genummerde stappen met richtingmarkering en een eindstatus.
- **Klantstemmen** — een horizontaal, handmatig te bedienen snap-spoor dat per keer een beperkt aantal verhalen toont zonder inhoud te verbergen.
- **CTA's** — rechte doelen van minimaal 44–48px; Artific Yellow gevuld, wit omlijnd of wit gevuld, afhankelijk van het oppervlak.

## Motion

GSAP 3.12.5 en ScrollTrigger laden via de bestaande gepinde jsDelivr-scripts en zijn uitsluitend progressive enhancement. Guards stoppen vóór pluginregistratie bij reduced motion of ontbrekende CDN-globals. De acht hoofdheadings bewegen eenmalig 12px verticaal; evidence- en assurance-regels 10px verticaal; maturity-, controle- en modulegroepen maximaal 14–16px horizontaal; iedere dossierhairline bouwt met `scaleX` op. Kernsignalen, directievragen, klantstemmen, partnerlagen en begeleidingsstappen krijgen dezelfde korte transformtaal. `groupEntrance` gebruikt 0,48s, `immediateRender: false`, `once: true`, `overwrite: "auto"` en wist alleen `transform`. CTA's krijgen een overwrite-safe lift van 2px. De lokale navigatie markeert het actieve hoofdstuk met `aria-current` via `IntersectionObserver`.

Er is geen opacity, scrub, pinning, parallax, automatische scroll of layoutanimatie. Bij dynamisch inschakelen van reduced motion stopt `stopMotion()` alle geregistreerde tweens en triggers, stopt CTA-tweens en wist inline transforms. Zonder JavaScript, GSAP of ScrollTrigger is alle inhoud direct zichtbaar.

## Responsief gedrag

- **Vanaf 1040px** — twaalf dossierkolommen; asymmetrische hero; hoofdstukkop en introductie staan waar relevant tegenover elkaar; modules vormen de brede trap 1/11 → 2/12 → 3/13; assurance gebruikt drie kolommen en begeleiding vijf.
- **Tot en met 1039px** — de statische header gebruikt twee rijen: logo en compacte CTA boven, alle vijf lokale links eronder. Directievragen en assurance gebruiken twee kolommen. De module-sequence reset volledig naar één kolom, auto-rijen, volle breedte, nul offset en lineaire interne flow; DOM- en leesvolgorde blijven AI Assistant → AI ToolBox → Conversation Module.
- **Tot en met 768px** — zonder de headerindeling te wijzigen krijgt de evidence-index een compacte `minmax(180px, 4fr) / 8fr`-term-/bewijskolom. Maturity-track en controle-architectuur stapelen tot één ruime kolom; architectuurpijlen wijzen dan naar beneden.
- **Tot en met 767px** — de vijf navlinks vormen een 3+2-raster met doelen van minimaal 44px. Evidence-index, vraag-ledger, tweeluiken, assurance-ledger, lagenraster en begeleiding worden één kolom. Op 320px gebruikt het kader 16px zijruimte en blijven CTA's, logo, navigatie en bewijsregels binnen de viewport.

De header is op iedere breedte expliciet `position: static`; ankers gebruiken daarom een bescheiden `scroll-margin-top: 24px`. Geen responsieve regel verbergt navigatie of inhoud.
