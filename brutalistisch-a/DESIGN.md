# Ontwerpdocument — variant Brutalistisch A

Stijlgids voor de landingspagina op `/brutalistisch-a/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-15):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd: het document is met `upload_design_md` geüpload naar Stitch-project `1690036173306872204` ("Artific — Brutalistisch A (operationele blauwdruk)", screen `17075234946990203806`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/83c3c1bbd8044fa7b8deb472eb956fc1` ("Blueprint Brutalist"). De door Stitch teruggegeven named colors zijn exact de vijf merktokens plus wit uit `assets/brand/brand.json` (`artific-blue #287CEB`, `artific-dark #0A213D`, `artific-marine #062244`, `artific-light-blue #E5EDF8`, `artific-signal-yellow #ECA414`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. De Stitch-stijlrichtlijnen (4px-borders, 8/12px offset-schaduwen in effen blauw, sectiecodes donkerblauw-op-licht/geel-op-donker, moduleplaten `#E5EDF8`, sticky commandobar met gele onderrand en blauwe voortgangsbalk, -3px hover-offset, 3px focusring) komen overeen met de implementatie; waar Stitch generieker formuleert blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

## Ontwerpprincipes

Rauwe "operationele blauwdruk": de pagina leest als een technisch spec-document dat op groot formaat is afgedrukt. Uitgesproken typografische schaal (H1 tot 9rem, alles kapitaal), harde 4px-lijnen, full-bleed donkere marineblauwe zones afgewisseld met wit, zichtbare sectiecodes (`00 / INTRO` … `07 / CONTACT`), oranjegele signaalstroken voor kernclaims en oversized moduleplaten met harde offset-schaduwen in effen merkblauw. Geen foto's, illustraties, iconengrids, afronding, gradients of transparantie; het enige beeldmateriaal is het officiële witte Artific-logo op de donkere commandobar en footer. De compositie (donkere sticky commandobar met scrollvoortgang, verspringende platen, verticale pipeline, genummerde vakken) verschilt bewust van de rustige editorial leeskolom van `/minimalistisch/`.

## Kleurgebruik

Uitsluitend de waarden uit `assets/brand/brand.json` (status: `unverified` — per waarde gedocumenteerd tegen openbare Artific-PDF-documenten; definitieve goedkeuring wacht op de interne brand manual, zie `assets/brand/README.md`). Geen afgeleide tinten, geen transparante merkkleuren.

| Kleur | Hex | Rol op deze pagina | Aandeel (indicatief) |
| --- | --- | --- | --- |
| Wit | `#FFFFFF` | canvas van de lichte blokken, tekst op donker | ± 45% |
| Artific-marineblauw | `#062244` | full-bleed donkere blokken (`#controlelaag`, `#controle`, `#contact`) en commandobar | ± 30% |
| Artific-donkerblauw | `#0A213D` | alle tekst en 4px-lijnen op licht, gevulde koplabels, primaire CTA, footer | ± 12% |
| Artific-blauw | `#287CEB` | scrollvoortgangsbalk, grote decoratieve faserings-/stappennummers (≥ 24px vet), offset-schaduwen van platen en CTA's, focusring op licht | ± 8% |
| Artific-lichtblauw | `#E5EDF8` | vulling van de drie moduleplaten | ± 4% |
| Artific-oranjegeel | `#ECA414` | signaal: accentranden van de donkere blokken, signaalstroken, slot-CTA, security-kopjes en focusring op donker | ± 1–2% |

Contrastregels: lopende tekst is altijd `#0A213D` op wit/lichtblauw of `#FFFFFF` op marine-/donkerblauw (ruim boven WCAG AA 4,5:1). `#287CEB` haalt tegen wit/marine slechts ± 3,9–4,1:1 en wordt daarom **nooit** met kleine tekst gecombineerd: het is beperkt tot vlakken zonder tekst (voortgangsbalk, offset-schaduwen), grote vette decoratieve cijfers (≥ 24px/700, WCAG-grens 3:1) en de 3px focusring op licht (non-text, ≥ 3:1). Sectiecodes staan in `#0A213D` op licht en `#ECA414` op donker; het Artific-pipelinestation is `#0A213D` met oranjegele rand en witte tekst; de bar-CTA is oranjegeel vlak met donkerblauwe tekst (± 7,6:1). `#ECA414` staat als tekstkleur alleen op `#062244`/`#0A213D` (± 7,5:1) en als vlak altijd met `#0A213D`-tekst.

## Spacing

8px-gebaseerde maar bewust grove schaal: `--r-1` 8px, `--r-2` 16px, `--r-3` 32px, `--r-4` 56px, `--r-5` 96px. Blokken krijgen `96px` verticale padding en `clamp(16px, 5vw, 72px)` gutters; geen maximale paginabreedte — vlakken en lijnen lopen full-bleed door, alleen lopende tekst wordt op 55–62ch begrensd. Lijndikte is overal 4px (3px voor chips/sectiecoderand), offset-schaduwen 12px (6px op ≤480px).

## Visuele hiërarchie

- Systeemfont-stack `"Helvetica Neue", Helvetica, Arial, sans-serif` met zeer zware gewichten (800–900) voor alle koppen, kapitaal gezet via `text-transform`.
- Schaal via `clamp()`: H1 `3.25rem–9rem` (10vw), H2 `2.25rem–5.5rem`, tussenkoppen `1.5rem–2.5rem`, H3/H4 in vakken `1.1–1.35rem`, body `1.0625rem` (regelafstand 1.55, 55–62ch).
- Exact één H1 (de merkbelofte); H2 per hoofdsectie (`#visie` t/m `#contact`), H3 voor vragen/lagen/modules/tussenkoppen, H4 voor fasen en specsheet-rijen.
- Zichtbare structuur: elk blok opent met een omkaderde sectiecode (`aria-hidden`; donkerblauw op licht, oranjegeel op donker), fasen en stappen tonen grote `decimal-leading-zero`-tellers in merkblauw, moduleplaten dragen oversized nummers (tot 7rem).
- Verspringing op ≥1000px: hero in 7/4-grid, moduleplaten 02 en 03 schuiven horizontaal in; op mobiel valt alles lineair terug.

## Componentstijl

- **Commandobar:** sticky, marineblauw met 4px oranjegele onderrand en een 6px blauwe scroll-voortgangsbalk (decoratief, `aria-hidden`); wit logo, kapitaal-navigatie (verborgen ≤480px), oranjegele bar-CTA met donkerblauwe tekst. Alle interactieve doelen ≥ 44px.
- **CTA's:** blokvormig, 4px rand, kapitaal, gewicht 800, ≥ 52px hoog. Primair: donkerblauw vlak + 8px blauwe offset-schaduw; secundair: wit omlijnd; slot: oranjegeel vlak respectievelijk wit omlijnd op marine. Hover: 3px onderstreping (CSS) plus −3px GSAP-offset; focus: 3px ring in blauw (licht) of oranjegeel (donker).
- **Signaalstroken:** oranjegele balken met 4px rand voor kernclaims (award, "Artific lost ze op", ChatGPT≠GPT, governance-balans).
- **Vragen/fasen/specsheet:** aaneengesloten omkaderde rijen met 4px scheidingslijnen; vraagkoppen als gevulde donkerblauwe labels; security-specsheet op ≥700px twee kolommen met doorlopende witte lijnen.
- **Pipeline:** drie omkaderde stations (Artific-station donkerblauw gevuld met oranjegele rand) verticaal met ↓-koppelingen; op ≥1000px horizontaal met →. Koppelingen `aria-hidden`, het geheel heeft een beschrijvend `aria-label`.
- **Moduleplaten:** lichtblauwe platen met 4px rand, 12px blauwe offset-schaduw, gevulde kapitaalkop en oversized nummer; toepassingen als omkaderde chips.
- **Footer:** donkerblauw met oranjegele toprand, wit logo, officiële contactlinks (contactpagina, e-mail, telefoon).

## Motion

Beweging is een detail, nooit een voorwaarde: de volledige pagina is leesbaar en bedienbaar zonder JavaScript, bij geblokkeerd CDN en met reduced motion.

- GSAP 3.12.5 + ScrollTrigger, gepind via jsDelivr-CDN met `defer`; `main.js` stopt direct bij `prefers-reduced-motion: reduce` of ontbrekende `window.gsap`/`window.ScrollTrigger`.
- Scrollvoortgang: de decoratieve balk in de commandobar volgt de paginascroll via `scaleX` 0→1 (scrub); in CSS staat hij standaard op `scaleX(0)` en bij reduced motion is hij verborgen.
- Entrees: sectiecodes en H2's schuiven éénmalig 24px van links in (0,4s), platen en vakken (`data-plaat`) 28px van onder (0,45s); geen opacity — niets staat ooit onzichtbaar. Properties worden na afloop gewist (`clearProps`).
- Pipeline: de koppelingspijlen schalen gestaffeld op (0,15s stagger) zodra de pipeline in beeld komt.
- Hover: CTA's verschuiven −3px/−3px richting hun offset-schaduw bij mouseenter en herstellen bij mouseleave; klik- en focusgedrag hangt nergens van GSAP af.
- Geen pinning, geen marquee, geen scroll-jacking.

## Responsief gedrag

Breakpoints op 480px (navigatie verbergen, compacter logo/bar-CTA, kleinere offset-schaduwen, fasen één kolom), 700px (wel/niet-vakken en specsheet in twee kolommen, pipeline gecentreerd) en 1000px (7/4-hero, horizontale pipeline, verspringende moduleplaten). Op 320px: één kolom, geen horizontale overflow, hero-kop breekt binnen het scherm, alle CTA's volledig zichtbaar en bereikbaar. Blokken krijgen `scroll-margin-top: 96px` vanwege de sticky commandobar.
