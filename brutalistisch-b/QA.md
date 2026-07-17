# QA-log — Brutalistisch B: motion- en klantlogo-update

Datum: 2026-07-17 · Route: `http://127.0.0.1:4388/brutalistisch-b/` · Server: `node scripts/serve.mjs 4388`. Layoutmetingen en screenshots zijn uitgevoerd met lokaal headless Chromium via het DevTools-protocol.

## Responsief en visueel

| Viewport | Gemeten resultaat |
| --- | --- |
| 320 × 1000 | Document- en viewportbreedte zijn beide 320px; geen horizontale pagina-uitloop. Onderwerpnavigatie en relatiedeck behouden hun eigen begrensde horizontale scroll. |
| 405 × 1000 | Document- en viewportbreedte zijn beide 405px; de hero, dikke ring en cards blijven binnen het routecanvas. |
| 768 × 1000 | Document- en clientbreedte zijn beide 753px naast de 15px browser-scrollbar; geen horizontale pagina-uitloop. |
| 1440 × 1000 | Document- en clientbreedte zijn beide 1425px naast de 15px browser-scrollbar. De drie modulekaarten zijn elk circa 384px breed. |

De relatievolgorde is gemeten als FC Twente, Basic-Fit, Eneco, Marktplaats, hollandsnieuwe, Gemeente Den Haag, RTV Oost, Veiligheidsregio Zuid-Limburg en Vechtsteden Notarissen. Alle negen lokale logo’s rapporteerden `complete: true` en een positieve `naturalWidth`. De eerste screenshot van het relatiedeck toont FC Twente volledig met logo, naam en relatiezin; de volgende kaart blijft als visuele uitnodiging gedeeltelijk in beeld.

De Conversation Module-kaart is op desktop even breed als de twee andere modulekaarten. Kop en lopende tekst vallen binnen de kaart en de screenshot bevestigt dat de regelafbreking niet meer tegen de rechterrand botst. De contactapostrof heeft computed transform `matrix(0, 1, -1, 0, 0, 0)`, gelijk aan 90 graden rotatie.

## Sticky navigatie, motion en shader

- De header rapporteert `position: sticky` en `top: 0px`; de actieve onderwerplink en blauwe leesvoortgang volgen de scrollpositie.
- De browser rapporteert GSAP `3.13.0`, scripts in de volgorde `assets/vendor/gsap-3.13.0.min.js` en `main.js`, en na 2,2 seconden de rootstatus `motion-ready motion-loaded`.
- De ring rapporteert animatienaam `orbit-turn`; zijn wrapper houdt de vaste hero-positie en de gesegmenteerde rand draait in 32 seconden rond.
- Het hero-canvas is aanwezig en initialiseert een lokale WebGL-context. De shader is begrensd op 40 fps, gebruikt maximaal 1,25× pixelratio op mobiel en 1,5× op grotere schermen. Bij ontbreken van WebGL blijft de onderliggende CSS-compositie zichtbaar.
- De GSAP-loadingtimeline liet na settle nul verborgen hero-items achter. Tekstwoorden en cards worden daarna één keer via `IntersectionObserver` onthuld.
- De logo-platen en sectieachtergronden gebruiken afzonderlijke rustige lussen. In de bovenzijde van de pagina stonden 16 buitenbeeldanimaties gepauzeerd.
- Het relatiedeck heeft geen timer of autoplay; bediening blijft handmatig via scroll, paginatie, knoppen en toetsenbord.
- Bij een live omschakeling naar `prefers-reduced-motion: reduce` waren nul motion-items verborgen en nul `ambient-paused`-restklassen aanwezig; de shaderloop wordt uitgeschakeld.

## Bediening en fallback

De dependency-vrije decktest controleert de beginstatus met FC Twente op positie 1, volgende/vorige, wrap, Home/End, toetsenbordbediening, veilige scrollsettling en `aria-current`. Zonder JavaScript blijven negen kaarten en negen ankerlinks aanwezig. De track is native horizontaal scrollbaar en de broninhoud wordt niet door motioncode vervangen.

De browser laadt de Artific-asset, negen lokale klantlogo’s, de lokale stylesheet en `main.js`; de pagina heeft geen runtime-afhankelijkheid van een externe component- of animatiebibliotheek.

## Automatische controles

Geslaagd:

- `node --check brutalistisch-b/main.js`
- `node --check scripts/validate-brutalistisch-b.mjs`
- `node scripts/validate-brutalistisch-b.mjs`
- Chromium-layoutmetingen op 320, 405, 768 en 1440px
- visuele screenshots van hero, relatiedeck, modulekaarten en contactslot
- Chromium-runtimecheck op lokale GSAP-versie, loading-settle, buitenbeeldpauze en live reduced-motion-omschakeling

De overkoepelende `node scripts/validate-site.mjs` wordt buiten deze variant alleen nog geblokkeerd doordat de twee in `brand.json` genoemde referentie-PDF-bestandsnamen lokaal niet bestaan. De variantchecks zelf zijn geslaagd; de PDF-bronnen zijn voor deze opdracht niet aangepast.
