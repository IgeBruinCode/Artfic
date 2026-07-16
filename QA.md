# QA-log — setbrede afronding (rootkeuze + vijf varianten)

Uitgevoerd op **2026-07-16** met **Chromium (headless, via CDP-sidecar aangestuurd)** tegen `node scripts/serve.mjs 4173` vanuit de repository-root. Alle genoemde controles zijn daadwerkelijk uitgevoerd; de fallbackmatrix hieronder is per variant interactief gedraaid met echte `prefers-reduced-motion`-emulatie (`Emulation.setEmulatedMedia`), echte jsDelivr-blokkering (`Network.setBlockedURLs`) en echte CTA-kliks met request-interceptie.

## Responsieve matrix (exact 320 / 768 / 1440 px)

| Route | 320 px | 768 px | 1440 px | Uitkomst |
| --- | --- | --- | --- | --- |
| `/` (keuzepagina) | ✓ | ✓ | ✓ | Eén kolom op alle breedtes, precies vijf benoemde keuzes, geen horizontale scroll, blauw logo op wit |
| `/minimalistisch/` | ✓ | ✓ | ✓ | Rustige editorial leeskolom intact; lineaire afbouw op mobiel; geen overflow |
| `/brutalistisch-a/` | ✓ | ✓ | ✓ | Operationele blauwdruk met sectiecodes/platen intact; harde vlakken stapelen zonder afsnijding |
| `/brutalistisch-b/` | ✓ | ✓ | ✓ | Tabloidregister met folio's en hoofdstukregister intact; serif-koppen breken netjes op 320 px |
| `/conventioneel/` | ✓ | ✓ | ✓ | Trust-center SaaS met trust-console/bewijsrail intact; cards stapelen lineair op mobiel |
| `/premium/` | ✓ | ✓ | ✓ | Donkere boekdelen, dossierregels, evidence-index, module-sequentie en assurance-ledger; hero 7/4 op desktop, volledig lineair op 320 px zonder horizontale scroll |

Alle zes routes gaven direct HTTP 200; klikken op elke rootkeuze opende de bijbehorende variant en de terugknop keerde naar `/` terug (gecontroleerd via klik vanaf `/` naar `/premium/`; overige vier routes rechtstreeks geopend en gecontroleerd).

## Toetsenbord, landmarks & CTA's

- **Premium:** eerste Tab focust de skiplink (zichtbaar, donker blok linksboven met oranjegele focusring); daarna logo, vijf lokale navigatieankers, header-CTA, hero-CTA's, slot-CTA's en footerlinks in documentvolgorde. Landmark-inspectie (accessibility tree): `banner`, gelabelde `navigation` ("Secties op deze pagina"), `main#inhoud`, footer; kopoutline H1 → per sectie H2 met geneste H3/H4, geen niveausprongen.
- **CTA-kliks (alle vijf varianten, elk voorkomen):** per variant zijn alle vijf CTA-anchors (header-demo, hero-demo, hero-afspraak, slot-demo, slot-afspraak) daadwerkelijk aangeklikt in de browser, met request-interceptie op `https://artific.nl/*` zodat de klik-navigatie wordt vastgelegd zonder de productiesite te bezoeken. Resultaat: 25/25 kliks navigeerden naar exact `https://artific.nl/contact-opnemen/`, alle labels exact canoniek (`Vraag een demo aan` / `Maak een afspraak`), nergens een `target`-attribuut. Dit wordt daarnaast automatisch afgedwongen door `node scripts/validate-site.mjs`.
- **Rootkeuze:** vijf anchors, zichtbare focusring (3px donkerblauw op wit, ≥ 3:1 — oranjegeel is als focusindicator gereserveerd voor donkere oppervlakken), doelhoogte ≥ 44px, geen JavaScript-afhankelijkheid.
- **Contrast premium:** de evidence-termen en maturity-koppen zijn donkerblauw (`#0A213D`) op licht; helder blauw `#287CEB` wordt op lichte vlakken alleen voor lijnen en decoratieve `aria-hidden` indexcijfers gebruikt (zie de oppervlakte-afhankelijke contrastregel in `premium/DESIGN.md`).

## Reduced motion, geblokkeerd CDN & JavaScript uit — interactief getest per variant

Per variant drie afzonderlijke browserruns (echte emulatie/blokkering via CDP), met per run controle op zichtbare H1 (`offsetParent` + computed opacity 1), vijf bereikbare CTA's, geen horizontale overflow en werkende lokale ankers:

| Route | Normaal (ScrollTriggers/tweens actief) | `prefers-reduced-motion: reduce` (geëmuleerd) | jsDelivr geblokkeerd |
| --- | --- | --- | --- |
| `/minimalistisch/` | 8 triggers / 9 tweens | **0 ScrollTriggers**, geen animatie; inhoud & CTA's identiek | `window.gsap` ontbreekt; pagina volledig statisch bruikbaar; ankerklik werkt |
| `/brutalistisch-a/` | 34 / 34 | **0 ScrollTriggers**; inhoud & CTA's identiek | idem — volledig bruikbaar |
| `/brutalistisch-b/` | 16 / 11 | **0 ScrollTriggers**; inhoud & CTA's identiek | idem — volledig bruikbaar |
| `/conventioneel/` | 25 / 21 | **0 ScrollTriggers**; inhoud & CTA's identiek | idem — volledig bruikbaar |
| `/premium/` | 39 / 49 | **0 ScrollTriggers**; inhoud & CTA's identiek | idem — volledig bruikbaar |

- Bij reduced motion resteert in de gsap-tijdlijn uitsluitend één interne, duurloze `ScrollTrigger._refreshAll`-delayedCall (geen visuele beweging, nul triggers); elke `main.js` stopt vóór `registerPlugin`, dus er ontstaan geen animaties of `aria-current`-mutaties.
- Het CDN-blokkeringsscenario dekt tegelijk JavaScript-uit: zonder de GSAP-globals stopt elk `main.js` direct en is de pagina puur statische HTML/CSS. De statische HTML van alle zes routes is daarnaast zonder JavaScript gecontroleerd (volledige inhoud, ankers en CTA's in de kale serverrespons).
- **Motionkarakter per variant:** `premium`, `conventioneel`, `brutalistisch-a` en `brutalistisch-b` animeren uitsluitend transforms; `minimalistisch/main.js` animeert (bewust, conform haar eigen validator) óók opacity in haar reveals — dat is daar veilig omdat de CSS niets standaard verbergt en de reveal alleen draait wanneer GSAP geladen is én reduced motion uit staat. Geen enkele stylesheet verbergt reveal-doelen (`display:none` alleen voor headernavigatie in één max-width-query; geen `visibility:hidden`, geen `opacity: 0`).

## Onderlinge vergelijking (eigenheid per variant)

Naast elkaar bekeken op 1440 px: Minimalistisch blijft rustig/editorial (licht, één leeskolom), Brutalistisch A blijft operationele blauwdruk (sectiecodes, harde offsetvlakken), Brutalistisch B blijft tabloidregister (serif-krantentypografie, folio's), Conventioneel blijft trust-center SaaS (afgeronde panelen, sticky header, bewijsrail) en Premium onderscheidt zich duidelijk: donkere marineblauwe boekdelen, dossierregels met hairlines en indexnummers, verfijnde lichte koppen, evidence-index, drie door hairlines verbonden modulehoofdstukken en een donker assurance-ledger. Geen van de vier bestaande varianten is inhoudelijk of visueel gewijzigd (git-diff op hun mappen: alleen `minimalistisch/DESIGN.md`-provenance).

## Afsluitende automatische controles

- `node scripts/validate-site.mjs` — geslaagd (rootkeuze, vijf routes, CTA-contracten, ontwerpdocumenten en alle zes onderliggende validators).
- Mutatietests uitgevoerd en teruggedraaid: ontbrekende module, onbekende claim, aangescherpte strikte claim (30%→50%), afwijkend CTA-label, extra kleur (#D4AF37), verwijderde rootkeuze en "open" DESIGN-provenance lieten de betreffende validator elk aantoonbaar falen.
- `git diff --check` — geen whitespace-fouten; diff- en werkboomscan op API-keys, `.env`, MCP-config en PDF-bestanden — niets aangetroffen.
