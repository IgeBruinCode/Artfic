# QA-log — Brutalistisch B: geel/navy-relatiedeck

Datum: 2026-07-17 · Route: `http://127.0.0.1:4277/brutalistisch-b/` · Server: `node scripts/serve.mjs 4277` (4173 was al bezet door een andere lokale werkboom). Layoutmetingen en screenshots zijn uitgevoerd met lokaal headless Chromium; semantiek is aanvullend via de lokale browser-sidecar gecontroleerd.

## Responsief en visueel

| Viewport | Gemeten resultaat |
| --- | --- |
| 320 × 900 | `documentElement.scrollWidth = innerWidth = 320`; negen dia’s aanwezig. De relatietrack is 246px breed en heeft een eigen scrollWidth van 2360px. Screenshot bevestigt een leesbaar navy logo op geel, tweekoloms onderwerpknoppen en een volledig binnen de viewport vallende hero. |
| 768 × 900 | Documentbreedte 753px bij `innerWidth = 768` (15px browser-scrollbar, dus geen horizontale uitloop). Track 624/5796px. Screenshot bevestigt de bredere onderwerpstrook, het gele hero-oppervlak en de navy controlekaart zonder afsnijding. |
| 1440 × 900 | Documentbreedte 1425px bij `innerWidth = 1440` (15px browser-scrollbar, dus geen horizontale uitloop). Track 1203/6608px. Screenshot bevestigt het dominante gele canvas, groot navy logo/woordbeeldcontrast, asymmetrische hero en gelaagde shadercirkels. |

De Chromium-metingen gaven op alle breedtes exact de hoofdsecties `intro, bewijs, visie, platform, organisatie, contact`, één zichtbare Nederlandse H1 en negen tekstuele relaties. De lokale browser-snapshot las ook de lange namen en de volledige FC Twente-zin uit. Er zijn geen klantafbeeldingen geladen. Op 320px rapporteerden zowel `.control-stack__core` (18,4px/950) als `.module-block--conversation` (16px/400) computed wit `rgb(255, 255, 255)` op Deep Navy `rgb(4, 34, 68)`; Artific Blue wordt daar alleen voor rand en blokschaduw gebruikt.

## Bediening, focus en links

In een echte Chromium-CDP-sessie werkte de gegenereerde bediening als volgt:

- beginsituatie: `Relatie 1 van 9: Basic-Fit`, met alleen paginatie-index 0 als `aria-current`;
- een niet-aangrenzende actie naar relatie 7, direct gevolgd door “Volgende”, hield tijdens smooth scroll status en `aria-current` stabiel op Basic-Fit;
- tijdens dertig metingen om de 30ms kwamen alleen de beginstatus en de eindstatus voor, zonder tussenliggende relaties;
- na settle was de enige nieuwe status `Relatie 8 van 9: Vechtsteden Notarissen` en stond alleen paginatie-index 7 actueel;
- de track behield browserfocus; `End` hield de oude status tijdens de lange beweging en committe daarna alleen FC Twente, waarna `Home` op dezelfde manier terugkeerde naar Basic-Fit;
- de VM-test controleerde aanvullend veilige wrap, handmatige scrollsettling en een scrollupdate vanaf de oude positie;
- een gefocuste onderwerplink had computed `3px solid` outline.

Alle zes onderwerpankers stonden in de gemeten volgorde en directe lokale opens van `#platform` en `#contact` behielden het juiste hashdoel. Alle vijf conversie-CTA’s hadden exact het canonieke label en `https://artific.nl/contact-opnemen/`. De mail- en telefoonlinks stonden in hoofdcontent en footer als `mailto:info@artific.nl` en `tel:053 203 0123`.

## Motion en fallback

| Scenario | Gemeten resultaat |
| --- | --- |
| Normale Chromium-run | Twee deckknoppen en live-status werden toegevoegd. Alleen lokale CSS, logo en `main.js` werden geladen. Web Animations gebruikten uitsluitend transforms; alle inhoud was al zichtbaar. |
| `prefers-reduced-motion: reduce` vóór laden | Mediaquery was `true`, `document.getAnimations().length` was 0, negen dia’s, vijf CTA’s en zes secties bleven aanwezig. |
| JavaScript uit vóór laden | Negen dia’s, negen statische ankerlinks, vijf CTA’s, H1 en zes secties bleven aanwezig; gegenereerde deckknoppen waren terecht afwezig. De track bleef een native horizontaal scrolloppervlak. |
| Ontbrekende optionele API’s / dynamische motionwijziging | Een echte CDP-omschakeling tijdens de sessie zette de mediaquery op `true`; de eerstvolgende deckactie gebruikte `behavior: auto` en bleef correct Eneco aankondigen. De dependency-vrije VM-test draaide daarnaast zonder `IntersectionObserver` en bevestigde dat de eigen Web Animations worden geannuleerd. |

De Chromium resource-lijst bevatte uitsluitend `/brutalistisch-b/styles.css`, `/assets/brand/artific-logo-navy.png` en `/brutalistisch-b/main.js`: geen CDN, PDF, klantasset of runtime-netwerkcomponent.

## Automatische controles

Geslaagd:

- `node --check brutalistisch-b/main.js`
- `node --check scripts/validate-brutalistisch-b.mjs`
- `node --check scripts/validate-site.mjs`
- `node scripts/validate-content.mjs`
- alle vijf variantvalidators
- `node scripts/validate-site.mjs`
- `git diff --check`

Twee teruggedraaide contrastmutaties bevestigden de nieuwe gates: het verlagen van de control-stack-specificiteit naar de gele basisregel faalde op de cascadecheck; wit-op-Artific-Blue in Conversation Module faalde op zowel het merkcontrastpaar als de cascadecheck. De uitgebreide VM-test faalt wanneer een tussenliggende programmatic-scrollupdate de actuele relatie kan overschrijven.

De browser-sidecar gebruikte Lightpanda en kon daarom geen eigen screenshots exporteren; de drie genoemde screenshots en exacte layoutmetingen zijn in lokaal headless Chromium uitgevoerd.
