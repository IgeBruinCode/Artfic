# Ontwerpdocument — variant Brutalistisch B (tabloid register)

Stijlgids voor de landingspagina op `/brutalistisch-b/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: het document is met `upload_design_md` geüpload naar Stitch-project `10169354303324654831` ("Artific — Brutalistisch B (tabloid register)", screen `9186885638307782`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/ebb8bf2ae57343d6b6557a334acf8510` ("Editorial Tabloid Brutalist"). De door Stitch vastgelegde override-/named colors zijn exact de merktokens uit `assets/brand/brand.json` (primary `#0A213D`, secondary `#287CEB`, tertiary `#ECA414`, neutral `#FFFFFF`, plus de named colors `marine-navy #062244` en `soft-blue-bg #E5EDF8`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. De door Stitch teruggegeven stijlrichtlijnen (3px-regels zonder afronding, 2:1-tabloidkolommen, 240px sticky register met 44px-doelen en donkerblauw/oranjegele actieve status, serif/sans-koppeling Georgia/Arial, modulespread en grootboek met 3px/1px-regels, CTA-hover met korte skew, focusringen blauw-op-licht/oranjegeel-op-donker) komen overeen met de implementatie; waar Stitch generieker formuleert blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

> **Huisstijlherijking:** de Stitch-provenance hierboven blijft als historische runregistratie letterlijk behouden. De daarin genoemde toenmalige token-snapshot is niet langer de merkbasis; de actuele implementatie en onderstaande kleurregels volgen de twee lokale primaire PDF’s en `assets/brand/brand.json`.

## Ontwerpprincipes

Rauwe "editorial tabloid": een geel krantencanvas met een statische masthead, een hoofdstukregister en zes opeenvolgende folio's. Gele redactionele pagina's worden afgewisseld met massieve navy hoofdverhaalvlakken. Op brede schermen staat links alleen het register sticky; rechts blijft alle inhoud in de gewone documentflow. Zware Georgia-koppen, compacte Arial-metadata, Romeinse registernummers, harde 1–3px registratielijnen, 2:1-kolommen, margewoorden, een brede moduletrap en het security-grootboek vormen het zelfstandige tabloidregister.

De variant blijft wezenlijk anders dan Brutalistisch A: geen commandobar, sectiecodes, blueprintplaten, pipeline of offsetschaduwen. Ook bevat zij geen SaaS-carddashboard of premiumdossier. Er zijn geen gradients, blur, transparantie, afronding, inline SVG of schaduwen.

## Kleurgebruik

Uitsluitend waarden uit `assets/brand/brand.json` (status `verified`), zonder afgeleide tinten.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Artific Yellow | `#FFD602` | dominant krantencanvas; masthead, register, folio's II/IV/V, modulebanden, donkere focusringen en primaire CTA's op navy |
| Deep Navy | `#042244` | tekst en regels op geel; folio's I/III/VI, registerstatus, masthead-CTA en footer |
| Wit | `#FFFFFF` | lopende tekst op navy en secundaire CTA-rand/tekst op navy |
| Artific Light Blue | `#E5EDF8` | contrasterend kader in folio III en de footernoot |
| Artific Blue | `#287CEB` | uitsluitend de hoverrand van CTA's op geel; geen kleine tekst op geel |

Op geel gebruikt lopende tekst Deep Navy (`navy-op-geel`); op navy gebruikt zij wit (`wit-op-navy`). Gele folionummers en margewoorden op navy volgen `geel-op-navy`; de footernoot volgt `lichtblauw-op-navy`. Focus is 3px navy op gele delen en 3px geel op navy. De masthead gebruikt uitsluitend het originele `artific-logo-navy.png` met merkmetadata `logo-navy` + `artific-geel`; het beeldmerk wordt niet door CSS herkleurd of vervormd. De footer gebruikt het officiële witte SVG-logo op navy.

## Spacing

De vaste schaal is `--r1` 8px, `--r2` 16px, `--r3` 28px, `--r4` 48px en `--r5` 88px. Masthead en folio's gebruiken responsieve zijguters `clamp(16px, 5vw, 64px)`; binnen het desktopregistergrid worden foliogutters 48px. Bodytekst is maximaal 62ch, de aanhef 42ch en koppen 16–22ch. Interactieve doelen zijn minimaal 44px hoog. Hoofdregels en CTA-randen zijn 3px; secundaire scheidingen 1–2px.

## Visuele hiërarchie

- H1: Georgia 700, `clamp(2.5rem, 8vw, 6.5rem)`, regelafstand 1.02 en maximaal 16ch.
- Folio-H2's: Georgia 700, `clamp(1.9rem, 5vw, 3.75rem)`, maximaal 22ch.
- Tussenkoppen: kapitale Arial met brede tracking en een harde topregel; modules en grootboektitels keren terug naar serif.
- Body: Arial `1.0625rem` met regelafstand 1.55; metadata en grootboektoelichtingen `0.9375rem`.
- Folio I en III zijn navy lead stories; II, IV en V zijn geel; VI is het navy slot. Ieder folio heeft een zichtbaar cursief folionummer en een afsluitende registratielijn.
- Vanaf 700px staan de hoofd- en margekolom 2:1 met een oppervlakteafhankelijke scheidingslijn.

## Componentstijl

- **Masthead:** statisch geel vlak met 12px navy bovenregel en 3px onderregel. Het navy PNG-logo, editielabel, cursieve ondertitel en navy CTA staan vanaf 700px op een ruim twaalfkoloms krantengrid.
- **Hoofdstukregister:** geel `aside` met Romeinse I–VI-links. Vanaf 1040px is het een sticky kolom van 240px; op kleinere schermen blijft het een gewone wrappende strook. Hover en actuele status zijn navy met gele tekst.
- **CTA's:** rechte 3px kaders, kapitale vette sans en minimaal 44px hoog. Op geel is primair navy/wit en secundair geel/navy; op navy wisselt primair naar geel/navy en secundair naar navy/wit.
- **Modulespread:** één `.spread` in het navy platformfolio. De drie gele banden hebben gedeelde harde randen en staan op desktop op afzonderlijke aansluitende rijen, ieder tien van twaalf kolommen breed: `1 / 11`, `2 / 12`, `3 / 13`. Elke band heeft intern een titelkolom en een tekstkolom; het zijn geen losse kaarten.
- **Grootboek:** een definitielijst met exact zes securityposten, vanaf 700px in een 1:2 redactionele verdeling onder een 3px hoofdregel.
- **Footer:** navy met gele topregel, wit logo, witte contactlinks en lichtblauwe noot.

## Motion

Motion is uitsluitend een korte transform-enhancement; HTML en CSS tonen standaard alle inhoud.

- `main.js` stopt vóór initialisatie bij reduced motion of ontbrekende GSAP/ScrollTrigger-globals.
- Folionummers en margewoorden krijgen een eenmalige horizontale entree van 16px; redactionele regels lopen eenmalig vanaf `scaleX(0.35)` in. Spreadbanden bewegen richtingsgebonden 18px vanaf 1040px en maximaal 8px daaronder, zodat hun actieve transform ook op 320px binnen de viewportgutters blijft.
- Entrees gebruiken `immediateRender: false`, `once: true`, `overwrite: "auto"`, duren 0,42s en wissen daarna de inline transform.
- CTA-hover skewt kort naar −4° in 0,12s en ruimt de transform bij verlaten op. Hovertweens worden niet in de blijvende redactionele tweenlijst opgeslagen.
- ScrollTrigger markeert alleen het actuele registeranker via `aria-current="location"`; er is geen pinning, scrub, opacity, automatische scroll of layoutanimatie.
- Als reduced motion tijdens een sessie wordt ingeschakeld, worden alle bijgehouden entreetweens, CTA-tweens en ScrollTriggers gestopt, inline transforms gewist en de dynamische registerstatus verwijderd. Beide CTA-hoverhandlers controleren bij iedere event opnieuw de actuele mediaquery en blijven tijdens reduce statisch.

## Responsief gedrag

Bij 700px schakelen masthead en redactionele inhoud naar hun desktopkolommen. Bij 1040px ontstaat het `240px + inhoud`-krantgrid, wordt alleen het register sticky en krijgt de modulespread haar twaalfkoloms trap. De expliciete `max-width: 1039px`-reset zet de spread en ieder moduledeel terug naar één volle kolom, automatische rij, nul marge en 100% breedte. Daardoor blijft de DOM- en leesvolgorde op 768px en 320px AI Assistant → AI ToolBox → Conversation Module. Op kleine schermen wrappen register en CTA's, koppen blijven binnen de viewport en de route heeft geen horizontale uitloop. Reduced motion zet smooth scrolling uit.
