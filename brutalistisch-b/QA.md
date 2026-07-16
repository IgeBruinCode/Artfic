# QA-log — variant Brutalistisch B (tabloid register)

Datum: 2026-07-16 · Browser: Chromium via de CDP-sidecar en het browserhulpmiddel · Server: `node scripts/serve.mjs 4173` · Route: `http://127.0.0.1:4173/brutalistisch-b/`

## Responsief en visueel

| Breedte | Resultaat |
| --- | --- |
| 320px | **OK** — gele masthead en register direct zichtbaar; navy logo vrijstaand en onvervormd; zes folio's zichtbaar; geen overflow (`scrollWidth = innerWidth = 320`). Modules lineair AI Assistant → AI ToolBox → Conversation Module, ieder 288px breed van x=16 tot x=304. |
| 768px | **OK** — masthead op twaalf kolommen, register als wrappende strook en redactionele 2:1-kolommen. Geen overflow (`768 = 768`). Modules blijven lineair, ieder circa 691px breed van x=38 tot x=730. |
| 1440px | **OK** — alleen het 240px-register is sticky; masthead en folio's zijn statisch. De spread is 1104px breed (x=288–1392). De drie banden zijn elk 920px breed en verspringen x=288–1208, 380–1300 en 472–1392, dus de gezamenlijke trap raakt beide spreadranden. Geen overflow (`1440 = 1440`). |

De normale 1440px-screenshot bevestigde de gele masthead met het originele navy PNG-logo, het gele register, navy lead-story-folio's I/III/VI, gele folio's II/IV/V, serif/sans-hiërarchie, het security-grootboek en de brede aaneengesloten gele moduletrap. Computed styles waren `rgb(255, 214, 2)` + `rgb(4, 34, 68)` voor masthead/register/geel en `rgb(4, 34, 68)` + wit voor intro/platform. Het logo werd lokaal geladen als `/assets/brand/artific-logo-navy.png`; er waren geen PDF- of 21st.dev-runtimeverwijzingen.

## Toetsenbord, links en contrast

Zeventien opeenvolgende Tab-stappen op 320px volgden de volledige route: skiplink, masthead-CTA, zes registerankers, twee intro-CTA's, twee slot-CTA's, e-mail, telefoon en daarna alle drie footerlinks (`Contact opnemen`, `info@artific.nl`, `053-203 0123`). Elk doel rapporteerde een zichtbare 3px `solid` focusring: navy op geel en geel op navy. De skiplink verscheen bij de eerste Tab linksboven.

Alle vijf CTA's zijn lokaal met `preventDefault` onderschept en programmatisch geklikt: 5/5 gaven het canonieke label en exact `https://artific.nl/contact-opnemen/`. De zes hoofdstukhrefs bleven `#intro`, `#visie`, `#platform`, `#organisatie`, `#bewijs`, `#contact`; `#platform` en `#contact` zijn in Chromium direct geopend. De twee `mailto:info@artific.nl`- en twee `tel:053 203 0123`-voorkomens bleven aanwezig. Contrastparen en merkoppervlakken zijn aanvullend door `checkContrastUsage`/`checkImages` gevalideerd.

## Motion en uitval

| Scenario | Werkelijk gemeten resultaat |
| --- | --- |
| Normale motion | GSAP geladen; 25 ScrollTriggers voor zes registerzones en de korte folio-/regel-/spread-entrees. De drie mobiele spreadentrees zijn tijdens ieder actief tween gedurende 25 animation frames bemonsterd: `scrollWidth` bleef 320, de kleinste linkerrand was 8,93px en de grootste rechterrand 311,07px. Na afwerking stonden nul gemeten doeltransforms achter. |
| Reduced motion vóór laden | Echte CDP-emulatie via `Emulation.setEmulatedMedia`; `matchMedia` was `true`, 0 ScrollTriggers, 0 doeltransforms, zes zichtbare folio's en geen overflow. |
| Reduced motion tijdens sessie | Voor omschakeling 25 triggers en leverde een CTA-mouseenter één actieve skewtween. Na CDP-mediawijziging: 0 triggers, 0 CTA-tweens en 0 doeltransforms. Een nieuwe mouseenter én mouseleave terwijl reduce actief bleef maakten nog steeds 0 tweens; de handlers respecteerden dus de actuele mediaquery. |
| jsDelivr-uitval | Beide scripts samen geblokkeerd: 2 requests, `window.gsap` undefined. Daarna elk script apart: 1 geblokkeerd request per run; zonder GSAP was `window.gsap` undefined, zonder ScrollTrigger bleef GSAP aanwezig. Alle drie runs hadden 0 triggers/transforms, zes folio's en geen overflow. |
| JavaScript uit | `Emulation.setScriptExecutionDisabled` vóór navigatie; `window.gsap` afwezig, 0 triggers/transforms, zes folio's en alle vijf CTA's statisch beschikbaar. |

## Automatische controles

- `node scripts/validate-brutalistisch-b.mjs` — geslaagd.
- `node scripts/validate-site.mjs` — geslaagd.
- `node --check brutalistisch-b/main.js` en `node --check scripts/validate-brutalistisch-b.mjs` — geslaagd.
- `git diff --check` — geslaagd.
- Teruggedraaide mutatietests voor mastheadlogo, mastheadkleur, modulevolgorde, desktopoffset, extra sticky element, verboden scrub-motion, CTA-bestemming, ontbrekende CTA-reduced-motion-guard, ontbrekende `killTweensOf`-cleanup en een onveilige mobiele spreadoffset faalden alle gericht; na herstel slaagde de validator opnieuw.
- Scan van runtimebestanden vond geen credentials, MCP-configuratie, nieuwe dependency of 21st.dev-runtimecode. Er is in deze build geen Magic MCP-run uitgevoerd of gedocumenteerd, omdat in de werkomgeving geen geconfigureerde Magic MCP-client beschikbaar was.
