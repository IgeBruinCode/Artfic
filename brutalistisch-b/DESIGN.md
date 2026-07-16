# Ontwerpdocument — variant Brutalistisch B (tabloid register)

Stijlgids voor de landingspagina op `/brutalistisch-b/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: het document is met `upload_design_md` geüpload naar Stitch-project `10169354303324654831` ("Artific — Brutalistisch B (tabloid register)", screen `9186885638307782`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/ebb8bf2ae57343d6b6557a334acf8510` ("Editorial Tabloid Brutalist"). De door Stitch vastgelegde override-/named colors zijn exact de merktokens uit `assets/brand/brand.json` (primary `#0A213D`, secondary `#287CEB`, tertiary `#ECA414`, neutral `#FFFFFF`, plus de named colors `marine-navy #062244` en `soft-blue-bg #E5EDF8`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. De door Stitch teruggegeven stijlrichtlijnen (3px-regels zonder afronding, 2:1-tabloidkolommen, 240px sticky register met 44px-doelen en donkerblauw/oranjegele actieve status, serif/sans-koppeling Georgia/Arial, modulespread en grootboek met 3px/1px-regels, CTA-hover met korte skew, focusringen blauw-op-licht/oranjegeel-op-donker) komen overeen met de implementatie; waar Stitch generieker formuleert blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

## Ontwerpprincipes

Rauwe "editorial tabloid": de pagina leest als een op groot formaat gedrukt manifest met een krantenregister. Wezenlijk andere compositie dan Brutalistisch A (sticky commandobar, kapitale sans-koppen, sectiecodes, offset-schaduwen, pipeline, moduleplaten) en dan de rustige leeskolom van `/minimalistisch/`: hier een **statische donkere masthead**, op brede schermen een **smal sticky hoofdstukregister links** (Romeinse nummering I–VI), en rechts zes opeenvolgende **folio's** met asymmetrische krantencolommen (2:1), grote gemengde serif/sans-typografie (koppen in zware Georgia-serif, níet kapitaal; register/labels/body in compacte Arial-sans), initiaal-kapitaal in de aanhef, pullquotes tussen dubbele regels, decoratieve cursieve margewoorden, harde 1–3px redactionele regels en één aaneengesloten modulespread. Geen cards, dashboardvakken, sectiecodes, offset-schaduwen, iconengrids, foto's, gradients, blur of afronding; het enige beeldmateriaal is het officiële witte Artific-logo op masthead en footer.

## Kleurgebruik

Uitsluitend de waarden uit `assets/brand/brand.json` (status: `verified`). Geen afgeleide tinten, geen transparante merkkleuren.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Wit | `#FFFFFF` | krantenpapier: achtergrond van alle folio's; tekst op donker |
| Artific-donkerblauw | `#0A213D` | alle tekst op licht, alle redactionele regels/kaders, gevulde registerlink-status, primaire CTA, footer |
| Artific-marineblauw | `#062244` | masthead en slotfolio (`#contact`) |
| Artific-lichtblauw | `#E5EDF8` | achtergrond van het hoofdstukregister; footernoot-tekst op donkerblauw |
| Artific-blauw | `#287CEB` | grote decoratieve margewoorden en fasenummers (≥ 28px vet), 3px accentlijnen (vragenlijst, lagenketen), focusring op licht, CTA-hoverrand |
| Artific-oranjegeel | `#ECA414` | accent: 3px mastheadonderrand en toprand van slotfolio/footer, slot-CTA-vlak, actieve registeronderstreping, focusring op donker, skiplink |

Contrastregels: lopende tekst is altijd `#0A213D` op wit/lichtblauw of `#FFFFFF` op marine-/donkerblauw (ruim boven WCAG AA 4,5:1). `#287CEB` wordt nooit als kleine tekst op wit gebruikt: alleen als grote vette decoratieve display-tekst (≥ 28px/700, `aria-hidden`), lijnen en focusring (non-text ≥ 3:1). `#ECA414` staat als vlak altijd met `#0A213D`-tekst (± 7,6:1) en als lijn/focusring alleen op donker.

## Spacing

Grove 8px-schaal: `--r1` 8px, `--r2` 16px, `--r3` 28px, `--r4` 48px, `--r5` 88px. Folio's krijgen 48px verticale padding en `clamp(16px, 5vw, 64px)` gutters (op desktop 48px binnen de registergrid); lopende tekst is begrensd op 62ch, aanhef 42ch, koppen 16–22ch. Lijndikte: 3px voor hoofdregels/kaders/CTA-randen en de dubbele folionummer-rand, 1–2px voor secundaire scheidingen.

## Visuele hiërarchie

- Koppen in `Georgia, "Times New Roman", serif`, vet, normale kapitalisatie: H1 `clamp(2.5rem, 8vw, 6.5rem)` (regelafstand 1.02), folio-H2's `clamp(1.9rem, 5vw, 3.75rem)`; tussenkoppen (H3) juist in kapitale sans met topregel; H4's in kleine kapitale sans, module- en grootboektitels weer in serif.
- Body `1.0625rem` Arial, regelafstand 1.55; bijzaken (colofon, kaders, grootboek-dd's) 0.9375rem.
- Exact één H1 (de merkbelofte in folio I); H2 per folio (I–VI), H3 voor tussenhoofdstukken, H4 voor modules, fasen, lagen en portal/headless.
- Zichtbare structuur: elk folio opent met een cursief folionummer tussen dubbele regel; margewoorden ("Manifest", "Drie vragen", "Positie", "Controle", "Bewijs") staan als groot cursief blauw serif in de smalle kolom (`aria-hidden`); elk folio sluit met een 3px redactionele regel.
- Asymmetrie: kolommen 2:1 vanaf 700px met een verticale scheidingslijn; de modulespread verspringt op ≥1040px trapsgewijs (delen 2 en 3 met oplopende toppadding).

## Componentstijl

- **Masthead:** statisch (niet sticky), marineblauw met 3px oranjegele onderrand; editieregel, wit logo, cursieve serif-ondertitel en een oranjegele masthead-CTA.
- **Hoofdstukregister:** `aside` met `nav`; lichtblauw. Op ≥1040px een 240px brede sticky kolom met 3px rechterrand en gestapelde links; daaronder/op mobiel een gewone wrappende linkstrook boven de inhoud. Links (≥ 44px doelhoogte) dragen Romeinse nummers; hover en actueel hoofdstuk krijgen donkerblauw vlak met witte tekst en oranjegele onderstreping.
- **CTA's:** blokvormig, 3px rand, kapitale vette sans, ≥ 44px hoog. Primair donkerblauw vlak/witte tekst, secundair wit omlijnd; in masthead en slotfolio oranjegeel vlak met donkerblauwe tekst. Hover: blauwe/witte rand (CSS) plus korte GSAP-skew; focus: 3px ring in blauw (licht) of oranjegeel (donker).
- **Vragenlijst:** `dl` met serif-vragen en blauwe 3px linkerlijn per antwoord.
- **Pullquotes:** cursieve vette serif tussen 3px boven- en onderregels.
- **Modulespread:** één aaneengesloten `.spread` tussen 3px regels; drie tekstdelen gescheiden door 1px regels (mobiel horizontaal, desktop verticaal), elk met sans-label "Module 01–03" en serif-titel. Geen cards of schaduwen.
- **Grootboek:** security als redactioneel register (`dl`): posten met serif-titel links en toelichting rechts, gescheiden door 1px regels onder een 3px kopregel.
- **Keten:** partnerlagen als blauwe linkerlijn-items; de vijf begeleidingsstappen als doorlopende omkaderde keten met serif-tellers.
- **Footer:** donkerblauw met oranjegele toprand, wit logo, officiële contactlinks (contactpagina, e-mail, telefoon).

## Motion

Beweging is een detail, nooit een voorwaarde: de volledige pagina is leesbaar en bedienbaar zonder JavaScript, bij geblokkeerd CDN en met reduced motion.

- GSAP 3.12.5 + ScrollTrigger, gepind via jsDelivr-CDN met `defer`; `main.js` stopt direct bij `prefers-reduced-motion: reduce` of ontbrekende `window.gsap`/`window.ScrollTrigger`.
- Hoofdstukstatus: per folio markeert een ScrollTrigger uitsluitend de actuele registerlink (`aria-current="location"` + `.is-actueel`); zonder JS is het register onveranderd volledig bruikbaar.
- Margewoorden (`data-marge`, decoratief/`aria-hidden`) driften met scrub maximaal 12px tegen de scrollrichting in (y: 12 → −12).
- Redactionele folio-regels (`data-regel`) lopen eenmalig van `scaleX(0.35)` naar volledige breedte (0,5s); in CSS staan ze standaard op volledige lengte, dus zonder JS is niets korter of verborgen. Properties worden gewist met `clearProps`.
- CTA-hover: korte skew (−4°, 0,12s) met herstel en `clearProps`; klik- en focusgedrag hangt nergens van GSAP af.
- Geen opacity-animaties, geen pinning, geen marquee, geen scroll-jacking.

## Responsief gedrag

Breakpoints op 700px (kolommen 2:1 met verticale scheidingslijn, grootboek twee kolommen, spread drie kolommen) en 1040px (paginagrid met 240px sticky register links, trapsgewijs verspringende spread). Onder 700px is alles één lineaire kolom: register als wrappende linkstrook boven de inhoud, spread en grootboek gestapeld met horizontale regels. Op 320px: geen horizontale overflow, H1 breekt binnen het scherm, alle CTA's en registerlinks volledig zichtbaar en ≥ 44px. Folio's hebben `scroll-margin-top`; `scroll-behavior: smooth` wordt bij reduced motion uitgeschakeld.
