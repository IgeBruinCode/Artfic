# QA-log — setbrede afronding (rootkeuze + vijf varianten)

Uitgevoerd op **2026-07-16** met **Chromium (headless, via CDP-sidecar aangestuurd)** tegen `node scripts/serve.mjs 4173` vanuit de repository-root. Alle genoemde controles zijn daadwerkelijk uitgevoerd; de fallbackmatrix hieronder is per variant interactief gedraaid met echte `prefers-reduced-motion`-emulatie (`Emulation.setEmulatedMedia`), echte jsDelivr-blokkering (`Network.setBlockedURLs`) en echte CTA-kliks met request-interceptie.

## Hercontrole na primaire PDF-audit

Na de huisstijlherijking zijn `/` en alle vijf routes opnieuw lokaal geopend op exact 320, 768 en 1440 px. Op 320 px zijn zichtbare content, landmarks, lokale navigatie en canonieke CTA-bestemmingen via de accessibility snapshot gecontroleerd; op 1440 px zijn de logo-oppervlakken en hero's visueel vastgelegd. De blauwe logo's bleven leesbaar op wit, de witte logo's op het nieuwe Deep Navy `#042244`; Artific Yellow is nu `#FFD602`. Alle logo's bleven visueel onvervormd, minimaal 80px breed en met voldoende vrije ruimte rondom; de letter-`a`-clearspace blijft overeenkomstig `logo-clearspace` een handmatige visuele gate. Er was geen zichtbare afsnijding of horizontale uitloop. De vijf rootlinks zijn automatisch tegen hun vaste routes gecontroleerd en de Minimalistisch-link is opnieuw in Chromium aangeklikt.

De fallbackcode en JavaScript zijn niet gewijzigd. De bestaande interactieve reduced-motion/CDN-/JS-uitvalmatrix hieronder blijft daarom de regressiebasis; aanvullend scant `validate-site.mjs` nu alle zes deploybare HTML/CSS/JS-oppervlakken op `.pdf`-runtimeverwijzingen. De lokale browser laadde op de gecontroleerde routes uitsluitend statische sitebestanden en de bestaande gepinde scripts, niet de twee PDF-auditbronnen.

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
- **Contrast premium:** de evidence-termen en maturity-koppen zijn Deep Navy (`#042244`) op licht; helder blauw `#287CEB` wordt op lichte vlakken alleen voor lijnen en decoratieve `aria-hidden` indexcijfers gebruikt (zie de oppervlakte-afhankelijke contrastregel in `premium/DESIGN.md`).

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

Naast elkaar bekeken op 1440 px: Minimalistisch blijft rustig/editorial (licht, één leeskolom), Brutalistisch A blijft operationele blauwdruk (sectiecodes, harde offsetvlakken), Brutalistisch B blijft tabloidregister (serif-krantentypografie, folio's), Conventioneel blijft trust-center SaaS (afgeronde panelen, sticky header, bewijsrail) en Premium onderscheidt zich duidelijk: donkere navy boekdelen, dossierregels met hairlines en indexnummers, verfijnde lichte koppen, evidence-index, drie door hairlines verbonden modulehoofdstukken en een donker assurance-ledger. Alle vijf stylesheets zijn visueel gemigreerd van de oude donker-/marine- en oranjegele tokens naar één `--navy` en `--geel`; alle route-HTML kreeg controleerbare logo-oppervlakmetadata en alle DESIGN-kleursecties zijn daarmee gesynchroniseerd. De canonieke inhoud, CTA's, routes, secties en `main.js`-bestanden zijn niet gewijzigd.

## Afsluitende automatische controles

- `node scripts/validate-site.mjs` — geslaagd (rootkeuze, vijf routes, CTA-contracten, ontwerpdocumenten en alle zes onderliggende validators).
- Mutatietests uitgevoerd en teruggedraaid: ontbrekende module, onbekende claim, aangescherpte strikte claim (30%→50%), afwijkend CTA-label, extra kleur (#D4AF37), verwijderde rootkeuze en "open" DESIGN-provenance lieten de betreffende validator elk aantoonbaar falen.
- Aanvullende brandmutaties uitgevoerd en teruggedraaid: gewijzigde PDF-hash, pagina 16, creative-materials-only kleurprovenance, niet-primaire provenance, dubbele logo-/contrasttuple, `#123456`, `red` en `#f00` (ook gericht in Brutalistisch A), normale of responsief te kleine blauwe tekst op wit, willekeurige gele tekst/achtergrond op een geërfd wit/donker oppervlak, hover- en compound-selector-contrastoverschrijvingen, gewijzigd logoasset, verkeerd werkelijk CSS-logo-oppervlak, specifieke/hover en globale `header`-logo-achtergrondoverschrijvingen, een wit footerlogo dat met ongewijzigde oppervlakmetadata naar het witte bodygedeelte was verplaatst, globale `img`-filter, CSS-logobreedte 70px, logorotatie, fout directioneel contrast, een gedupliceerde witte outlined CTA buiten haar donkere DOM-oppervlak, `red` via een custom property in zowel border- als box-shadow-shorthand, runtime-`.pdf` en gewijzigde CTA/route faalden elk op de bedoelde gate.
- `git diff --check` — geen whitespace-fouten; scan op API-keys, `.env` en nieuwe MCP-configuratie — niets aangetroffen. De twee root-PDF's zijn bewust aanwezig als primaire build-/auditbron en worden niet runtime geladen.

## Hercontrole herontwerp `/minimalistisch/` — 2026-07-16

Lokaal uitgevoerd met Chromium via de CDP-sidecar tegen `node scripts/serve.mjs 4173`. De route is visueel gecontroleerd op exact 320, 768 en 1440px. Op 320 en 768px stonden de modules lineair als AI Assistant → AI ToolBox → Conversation Module; gemeten modulebounds waren respectievelijk 16–304px en 38–730px en `scrollWidth === innerWidth`. Op 1440px mat het gecentreerde canvas 1216px inclusief gutters; de drie modulebanden versprongen van 160–899px via 351–1089px naar 541–1280px, zodat hun gezamenlijke compositie de volledige 1120px inhoudsbreedte gebruikt. Hero, marge-eyebrows, H2's en leeskolommen volgden zichtbaar dezelfde assen.

CDP-metingen bevestigden vijf lokale sectieankers, vijf canonieke CTA's met exact `https://artific.nl/contact-opnemen/`, en ongewijzigde mailto-/tel-links. Zeventien opeenvolgende Tab-stappen volgden skiplink, logo, vijf sectieankers, header- en hero-CTA's, de contactlinks en daarna expliciet alle drie footerlinks in documentvolgorde. Ieder doel had `:focus-visible` en een 3px ring: Artific Blue op licht en Artific Yellow op de donkere contactsectie en footer.

De fallbackmatrix is opnieuw werkelijk uitgevoerd. Bij geëmuleerd `prefers-reduced-motion: reduce` was de mediaquery actief, bleven H1 en alle modules op opacity 1 en ontstonden nul ScrollTriggers. Met beide jsDelivr-URL's via CDP geblokkeerd ontbrak `window.gsap`, bleven alle modules zichtbaar en was de route zonder overflow bruikbaar. Met scriptuitvoering vóór navigatie volledig uitgeschakeld gold hetzelfde. In normale motion ontstonden de korte enters wel; `immediateRender: false` liet niet-getriggerde inhoud zichtbaar. De netwerkcontrole vond in alle runs nul PDF- of 21st.dev-runtimeverzoeken.

Na review is ook de breakpointscope van de validator met teruggedraaide mutaties herbevestigd: een geldige derde module-offset buiten het 980px-desktopblok, een geldige lineaire reset buiten het 979px-mobielblok en een hernoemde desktopmediaquery faalden elk gericht. Dezelfde regels binnen hun balanced-brace-geëxtraheerde mediaqueryblokken slagen.

### 21st.dev Magic MCP-broncontrole

Op 2026-07-16 is via de officiële 21st.dev MCP een gerichte editorial schets gegenereerd en Take 1 verfijnd. De bruikbare output toonde één twaalfkoloms veld met 24px gap, compacte marge-labels, 1px sectierails, de brede hoofdstuktrap 1–8 / 3–10 / 5–12 en korte eenmalige 14px-enters. Deze patronen zijn tegen de statische implementatie gekruist; de doorlopende sectierail is daarbij expliciet toegevoegd en de al aanwezige grid-, label-, module- en motioncontracten zijn behouden. Frameworkcode, gegenereerde copy, afwijkende kleuren en CSS-initiële verborgen inhoud zijn niet overgenomen. De tijdelijke build-time client is verwijderd; repository en runtime bevatten geen 21st.dev-package, configuratie of netwerkverzoek. Na de railwijziging is `/minimalistisch/#platform` opnieuw lokaal bekeken op exact 320, 768 en 1440px: de rail bleef rustig, de modules bleven op klein scherm lineair en op 1440px duidelijk trapsgewijs, zonder zichtbare afsnijding of overflow.

## Hercontrole compacte blauwdruk `/brutalistisch-a/` — 2026-07-16

Lokaal gecontroleerd met Chromium via de CDP-sidecar op exact 320, 768 en 1440px. Op 1440px bleef alleen de achtergrond full-bleed; de inhoud liep visueel van 128 tot 1312px. De drie even brede platformplaten vormden de trap 128–1112px, 229–1212px en 329–1312px. Op 768 en 320px stonden AI Assistant, AI ToolBox en Conversation Module lineair in DOM-/leesvolgorde; op 320px bleven logo/CTA en alle vier sectieankers zichtbaar in twee commandobar-rijen, zonder zichtbare afsnijding of horizontale scrollbar.

De accessibilitysnapshot bevestigde de acht secties, vijf canonieke CTA-hrefs, mail-/telefoonlinks en documentvolgorde; de eerste Tab focuste de skiplink en `#platform` werkte lokaal met de mobiele ankeroffset. Externe CTA-bestemmingen zijn wegens de lokale-only QA-regel niet geopend, maar hun exacte href is zowel in de snapshot als validator bevestigd. Tijdelijke lokale kopieën bevestigden volledige zichtbaarheid en bediening met JavaScript verwijderd, met beide CDN-tags verwijderd en met de reduced-motion JavaScript-guard geforceerd. Echte OS-level reduced-motion-emulatie en een exporteerbare netwerklog waren niet beschikbaar in de sidecar; CSS-reduced-motion en de afwezigheid van PDF-/21st.dev-runtimeverwijzingen zijn daarom automatisch en bronmatig gecontroleerd. De tijdelijke kopieën zijn verwijderd.
