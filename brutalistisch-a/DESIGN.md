# Ontwerpdocument — variant Brutalistisch A

Stijlgids voor de landingspagina op `/brutalistisch-a/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-15):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd: het document is met `upload_design_md` geüpload naar Stitch-project `1690036173306872204` ("Artific — Brutalistisch A (operationele blauwdruk)", screen `17075234946990203806`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/83c3c1bbd8044fa7b8deb472eb956fc1` ("Blueprint Brutalist"). De door Stitch teruggegeven named colors zijn exact de vijf merktokens plus wit uit `assets/brand/brand.json` (`artific-blue #287CEB`, `artific-dark #0A213D`, `artific-marine #062244`, `artific-light-blue #E5EDF8`, `artific-signal-yellow #ECA414`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. De Stitch-stijlrichtlijnen (4px-borders, 8/12px offset-schaduwen in effen blauw, sectiecodes donkerblauw-op-licht/geel-op-donker, moduleplaten `#E5EDF8`, sticky commandobar met gele onderrand en blauwe voortgangsbalk, -3px hover-offset, 3px focusring) komen overeen met de implementatie; waar Stitch generieker formuleert blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

> **Huisstijlherijking:** de Stitch-provenance hierboven blijft als historische runregistratie letterlijk behouden. De daarin genoemde toenmalige token-snapshot is niet langer de merkbasis; de actuele implementatie en onderstaande kleurregels volgen de twee lokale primaire PDF’s en `assets/brand/brand.json`.

## Ontwerpprincipes

Rauwe "operationele blauwdruk" binnen een beheerst werkvlak: de buitenste commandobar, sectiebanden, scheidingslijnen en footer blijven viewportbreed, terwijl alle leesinhoud, technische platen en conversiepunten binnen één gecentreerd werkvlak staan. Harde 4px-lijnen, zichtbare codes `00 / INTRO` tot en met `07 / CONTACT`, donkere technische vlakken, zware kapitalen, gele signaalstroken en effen blauwe offsets houden de variant herkenbaar. De opgevoerde versie voegt daar een kinetische control-roomlaag aan toe: een in kleurblokken opgebroken hero, live systeemmeters, een scheef commandoticker, module-statusmeters en een monumentale FC Twente-caseplaat. Er zijn geen foto's buiten de bewijssectie, afrondingen, gradients, blur, filters of transparante kleuren. De commandobar, pipeline en genummerde platen vormen een eigen blueprintsignatuur die bewust niet leunt op tabloid-, SaaS- of dossiercomponenten.

## Kleurgebruik

Uitsluitend de waarden uit `assets/brand/brand.json` (status `verified`) worden gebruikt.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Wit | `#FFFFFF` | lichte secties, tekst op donker en chipvlakken |
| Artific-navy | `#042244` | donkere full-bleed banden, commandobar/footer, tekst, lijnen en koplabels |
| Artific-blauw | `#287CEB` | voortgangsbalk, decoratieve grote cijfers, focus op licht en harde offsets |
| Artific-lichtblauw | `#E5EDF8` | moduleplaten |
| Artific-geel | `#FFD602` | signaalstroken, accentranden, CTA en focus op donker |

Lopende tekst is navy op wit/lichtblauw of wit op navy. Blauw op wit blijft beperkt tot grote vette cijfers en non-text-accenten; geel als tekst staat alleen op navy. De gele CTA en signaalstroken gebruiken navy tekst.

## Spacing

Het gedeelde `--werkvlak` is `1280px` breed en wordt voor `.blok__binnen`, `.commandobar__binnen` en `.site-footer__binnen` gecentreerd met `margin-inline: auto`. Een vloeiende gutter `clamp(16px, 4vw, 48px)` houdt inhoud en offsets vrij van de viewport. Secties gebruiken een compacter verticaal ritme van `clamp(64px, 6vw, 88px)`; binnen componenten blijft de 8/16/32/56px-schaal leidend. Buitenste secties dragen alleen ruimte, achtergrond en de viewportbrede 4px-scheidingsrand. Offset-schaduwen zijn 12px en worden op maximaal 480px 6px, steeds zonder blur.

## Visuele hiërarchie

- De systeemfont-stack `"Helvetica Neue", Helvetica, Arial, sans-serif` gebruikt gewichten 800–900 voor kapitale koppen.
- De H1 schaalt van `3.25rem` tot maximaal `7rem` en is in drie kinetische regels verdeeld; geel, navy en blauw markeren de woorden `AI`, `die werkt` en `en blijft`. H2 schaalt van `2.25rem` tot `5.5rem` en kan grote gele of blauwe woordblokken dragen. Lopende tekst blijft op 55–62ch begrensd.
- Exact één H1 draagt de merkbelofte. Iedere hoofdsectie opent met een omkaderde code en een H2; onderliggende vragen, fasen, modules en specificaties gebruiken H3/H4.
- Grote `decimal-leading-zero`-tellers, plaatnummers tot 7rem en navy koplabels maken de technische registratielagen zichtbaar.
- Vanaf 1000px gebruikt de hero een 7/4-verdeling en vormt de modulelijst een brede twaalfkoloms trap. Daaronder blijft de canonieke DOM- en leesvolgorde leidend.

## Componentstijl

- **Commandobar:** sticky navy buitenband met 4px gele onderrand en een decoratieve 6px blauwe `scaleX`-voortgang. Logo, vier lokale ankers en gele bar-CTA delen het gecentreerde werkvlak. Onder 768px staan logo/CTA op rij één en alle vier zichtbare navigatiedoelen op rij twee; ieder doel is minimaal 44px hoog.
- **CTA's:** rechte blokken met 4px rand, kapitaal en minimaal 52px hoogte (44px in de bar). Primaire en signaal-CTA's hebben een harde 8px blauwe offset; focus is een 3px blauwe ring op licht of gele ring op donker.
- **Pipeline en technische vakken:** drie hard omkaderde stations, aaneengesloten vragen/fasen/specsheet-rijen en gele signaalstroken. Alleen de pipeline wisselt op 1000px van verticale pijlen naar een horizontale technische keten.
- **Kinetische systeemobjecten:** de hero combineert een blokkerige livecode, zes stapsgewijs pulserende balken en een dubbele oneindige commandoticker. Ze zijn decoratief gemarkeerd, bevriezen bij reduced motion en gebruiken uitsluitend transform-keyframes.
- **Moduleplaten:** lichtblauwe platen met 4px navy rand, 12px effen blauwe offset, oversized nummer, navy koplabel, statuslabel, rechte chips en een vijfdelige activiteitsmeter. Vanaf 1000px staan ze elk tien van twaalf kolommen breed op `1 / 11`, `2 / 12` en `3 / 13`, ieder op een eigen rij. Onder 1000px worden kolom, rij, marge en breedte expliciet naar één lineaire kolom gereset.
- **FC Twente-caseplaat:** een zelfstandige navy/geel/blauwe bewijsplaat vertaalt de canonieke drie-seizoenenclaim naar een groot `03`-cijfer, een typografisch FC Twente-woordmerk en een roterende Enschede × Artific-stempel. Dit maakt FC Twente zichtbaar bewijs in plaats van alleen een logo in de rail.
- **Footer:** viewportbrede navy band met gele toprand; binnen het gedeelde werkvlak staan het officiële witte logo en de vaste contactlinks.

## Motion

Beweging is uitsluitend een transform-gebaseerde progressive enhancement. De HTML/CSS toont alle inhoud direct; JavaScript-uitval of een geblokkeerd CDN verandert geen inhoud, links of layout.

- GSAP 3.12.5 en ScrollTrigger laden gepind en met `defer`. `main.js` stopt vóór registratie bij `prefers-reduced-motion: reduce` of ontbrekende globals. Wordt reduced motion tijdens een open sessie ingeschakeld, dan stopt het script zijn actieve ScrollTriggers en tweens en wist het de inline transforms.
- De decoratieve voortgangsbalk volgt de scroll met `scaleX`. De hero gebruikt één GSAP-timeline waarin woordblokken van onder inslaan, tekst/specs van tegengestelde kanten binnenkomen en de commandoticker als laatste het werkvlak binnenveegt.
- Sectiecodes, H2's en gekleurde woordblokken krijgen gecombineerde translate-, scale- en rotation-reveals. Modules, pipeline, vragen, fasen, vakken, securityregels, stappen, signaalstroken, reviews en de FC Twente-plaat hebben ieder een gerichte choreografie met kleine staggers en harde overshoot.
- Op apparaten met een fijne pointer reageren moduleplaten, reviews en de FC Twente-plaat via herbruikte `quickTo`-tweens met maximaal vijf graden 3D-rotatie. CTA-hover verschuift maximaal −3px/−3px en roteert één graad.
- Alle scroll-entrees gebruiken `immediateRender: false`, `once: true`, `overwrite: "auto"` en wissen hun inline transform. De continue CSS-systeemmeters gebruiken alleen transforms en stoppen via de reduced-motion mediaquery.
- Er is geen opacity-animatie, pinning, snap, automatisch scrollen, parallax of animatie van layoutproperties. Reduced motion verbergt alleen de decoratieve voortgangsbalk en laat de pagina statisch.

## Responsief gedrag

Bij 1000px schakelen hero, pipeline en moduletrap naar desktopopstelling; onder 1000px staan de platen in DOM-volgorde AI Assistant → AI ToolBox → Conversation Module, elk op volle beschikbare breedte. Bij 700px worden wel/niet-vakken en de security-specsheet tweekoloms. Onder 768px gebruikt de commandobar bewust twee rijen; zowel de acht secties als `#inhoud` krijgen daar 116px ankeroffset, zodat ook skiplink en logo het intro niet achter de sticky bar plaatsen. Vanaf 768px is de offset 96px. Op maximaal 480px worden offsetschaduwen 6px en fasen één kolom. Op 320px blijven navigatie, CTA's, plaatranden en schaduwen binnen de viewport.
