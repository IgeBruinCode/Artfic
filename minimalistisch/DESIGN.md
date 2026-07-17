# Ontwerpdocument — variant Minimalistisch

Stijlgids voor de landingspagina op `/minimalistisch/`. Dit document legt de
daadwerkelijk gebouwde variant in `index.html`, `styles.css` en `main.js` vast.

> **Historische provenance — gefinaliseerd via Google Stitch-MCP
> (2026-07-16):** de oorspronkelijke minimalistische richting is in
> Stitch-project `10126708337972370583`, screen `17171847500156386945` en design
> system `assets/f503f899b0534601b77f334f334c4d98` vastgelegd. De huidige variant
> vervangt die compositie volledig, maar behoudt deze run als auditspoor.

> **Creatieve bron — 21st.dev (2026-07-17):** de officiële Shader Builder
> `Flow field`, de `Reveal Text`-component en de ritmiek van compacte logo-clouds
> zijn als bron gebruikt. De fragmentshader is ongewijzigd als plain WebGL1
> opgenomen; alleen de uniforme kleurwaarden zijn naar Deep Navy, Artific Blue,
> Light Blue en wit vertaald. De tekst- en merkbewegingen zijn vervolgens
> dependency-vrij opnieuw gebouwd. React, Tailwind, Framer Motion en generieke
> demo-inhoud zijn niet overgenomen.

## Ontwerpprincipes

De pagina combineert de rustige ritmiek van de Codex-referentie met een
duidelijk eigen Artific-identiteit. Grote typografie, brede witruimte en
afwisselende lichte en donkere secties vormen de basis. De productvisuals zijn
code-native interfaces die AI-assistenten, workflows, safeguards en governance
van Artific tonen; ze blijven scherp op ieder scherm en hebben geen stockbeeld
nodig.

De hero loopt visueel door in het platformdashboard en daarna in een bewegende
klantlogo-rail. De rest van de pagina wisselt redactionele tekstblokken af met
procesvisualisaties. Zo blijft het geheel minimalistisch, maar niet leeg of
generiek.

## Kleurgebruik

Alle kleuren komen rechtstreeks uit `assets/brand/brand.json`.

| Kleur | Hex | Gebruik |
| --- | --- | --- |
| Artific Blue | `#287CEB` | hero-shader, actieve states, proceslijnen en accenten |
| Deep Navy | `#042244` | tekst, platforminterface, donkere secties en primaire CTA |
| Light Blue | `#E5EDF8` | rustige achtergronden, panelen en scheidingslijnen |
| Artific Yellow | `#FFD602` | statusindicatoren, nadruk en CTA op navy |
| Neutral Gray | `#64748B` | secundaire tekst en interface-metadata |
| Wit | `#FFFFFF` | hoofdcanvas, kaarten en tekst op donkere oppervlakken |

De hero-shader wordt op canvas opgebouwd met Deep Navy, Artific Blue, Light
Blue en wit; Artific Yellow blijft een spaarzaam UI-accent erboven. Een afzonderlijke witte fade verbindt
het bewegende hero-oppervlak zonder zichtbare knip met het witte paginacanvas.
Er worden geen vreemde merkkleuren, fototinten of externe design-tokens
toegevoegd. Tekst gebruikt steeds een in het stijlboek toegestane
contrastcombinatie.

## Spacing en grid

- Maximale inhoudsbreedte: `1240px`.
- Horizontale gutter: `clamp(20px, 4vw, 56px)`.
- Verticale sectieruimte: `clamp(84px, 10vw, 152px)`.
- Componentafronding: `12px`, `22px` en `34px`.
- Desktopmodules: drie gelijke kolommen met `16px` tussenruimte.
- Reviewgrid: drie kolommen op desktop, twee op tablet en één op mobiel.

Alle acht hoofdsecties gebruiken één `.sectie__grid`-container. Onder `980px`
worden complexe composities lineair; onder `700px` worden CTA's, modules,
reviews en footeronderdelen over de volledige breedte gestapeld.

## Visuele hiërarchie

- Systeemfont-stack zonder externe webfont.
- H1: `clamp(3.25rem, 7.4vw, 7.25rem)` op desktop en een compactere schaal op
  mobiel.
- H2: `clamp(2.5rem, 5.3vw, 5.25rem)`.
- Eyebrows: compacte kapitalen met een blauwe of gele statusstip.
- Grote sectienummers markeren het ritme zonder de semantische kopstructuur te
  vervangen.
- Interfacecopy is bewust kleiner dan marketingcopy, maar gebruikt altijd navy
  op wit/lichtblauw of wit/lichtblauw op navy.

## Componentstijlen

- **Navbar:** vaste witte balk met officieel blauw Artific-logo, vijf
  sectielinks, een navy demo-CTA en een toegankelijke mobiele menuknop.
- **Hero-shader:** de exacte 21st.dev Flow field-fragmentshader in een plain
  WebGL1 fullscreen triangle, met gepakte uniforms, DPR-cap op 2, filmgrain en
  zonder cursorinteractie. De RAF stopt wanneer het tabblad verborgen is. Zonder
  WebGL valt het component terug op Light Blue.
- **Workflow builder:** navy shell met vijf verbonden procesnodes: nieuwe
  klantvraag, goedgekeurde bronnen, Artific AI-assistent, menselijke controle
  en veilig resultaat. Een apart live-paneel toont de actuele uitvoering.
- **Brand stepper:** acht lokale, officiële klantlogo-assets in vier vaste
  slots. De eerste set wordt per slot van links naar rechts door de tweede set
  vervangen: een kort `tik, tik, tik`-ritme in plaats van een generieke marquee.
  De klantmerken worden visueel zwart gemaakt en behouden hun verhouding.
- **Workflowvisual:** vier zichtbare stappen van inkomend bericht tot menselijke
  goedkeuring.
- **Controlelaag:** model-naar-proceskaart met Artific als centrale laag en
  safeguards, governance en audit trail als vaste onderbouw.
- **Modules:** Light Blue voor AI Assistant, Artific Blue voor AI ToolBox en
  Deep Navy voor Conversation Module.
- **Safeguards:** controlepaneel met EU-verwerking, bescherming van
  persoonsgegevens en beheerde modeltoegang.
- **Klantbeoordelingen:** zes kaarten met volledige quote, naam en
  functie/organisatie; de Leqqr-review krijgt een blauwe bewijskaart.
- **Contact:** donker slot met geel CTA-accent, officiële witte logo-uitvoering
  en een rustige orbitvisual.

## Bewegingsprincipes

Beweging ondersteunt de inhoud en is nooit nodig om die te begrijpen.

- De hero-shader gebruikt `requestAnimationFrame`, pauzeert bij een verborgen
  tabblad én buiten de viewport en rendert bij reduced motion één statisch frame.
- De brand stepper wisselt de vier slots in maximaal 420 ms van links naar
  rechts. Zonder beweging staan alle acht merken leesbaar onder elkaar.
- Hero-regels onthullen vanuit een masker; secties settelen maximaal `24px`,
  groepen arriveren binnen één halve seconde en workflowlijnen tekenen één keer.
- Knoppen gebruiken een korte press/release-reactie; de animatie verandert geen
  navigatiegedrag en wordt bij reduced motion volledig uitgeschakeld.
- De GSAP-performanceprincipes vormen de technische motionstandaard: alleen
  transform/opacity voor DOM-beweging, geen layouttweens, geen concurrerende
  transforms en offscreen pauzering van alle ambient motion-islands. De site
  vertaalt die principes naar native CSS/WAAPI zodat de statische build geen
  externe runtime nodig heeft.
- Draaiende statusindicatoren, chart-bars en orbits zijn decoratief.
- `prefers-reduced-motion: reduce` schakelt smooth scrolling, transitions en
  herhalende animaties uit.
- De hele pagina blijft zonder JavaScript zichtbaar, navigeerbaar en bruikbaar.

## Responsief gedrag

Op tablet verdwijnen alleen niet-essentiële dashboarddelen, zoals de sidebar en
de live chart. Op mobiel blijven de Service Assistent, taakstatussen, CTA's,
logo's en alle reviewteksten behouden. Het mobiele menu ondersteunt toetsenbord,
Escape en correcte `aria-expanded`-status. Logo's hebben een vaste veilige
container en behouden hun eigen beeldverhouding.

De breakpoints op `1100px`, `979px` en `700px` sturen respectievelijk de
hoofdlayout, navigatie en compacte mobiele compositie. Reduced-motion-regels
vormen een afzonderlijk toegankelijkheidscontract.
