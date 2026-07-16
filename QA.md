# QA-log — setbrede afronding (rootkeuze + vijf varianten)

Uitgevoerd op **2026-07-16** met **Chromium (headless, CDP-sidecar)** tegen `node scripts/serve.mjs 4173` vanuit de repository-root. Alle genoemde controles zijn daadwerkelijk uitgevoerd; beperkingen staan expliciet onderaan.

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
- **CTA's (alle vijf varianten, vergeleken met de canonieke kaart):** elk voorkomen van `vraag-een-demo-aan` en `maak-een-afspraak` draagt exact het canonieke label, wijst naar `https://artific.nl/contact-opnemen/` en heeft geen `target` (zelfde tabblad). Automatisch afgedwongen door `node scripts/validate-site.mjs` en per variant handmatig aangeklikt op `/premium/` (beide hero-CTA's, header-CTA, beide slot-CTA's zichtbaar en bereikbaar op alle drie breedtes).
- **Rootkeuze:** vijf anchors, zichtbare focusring (3px oranjegeel), doelhoogte ≥ 44px, geen JavaScript-afhankelijkheid.

## Reduced motion, JavaScript uit & CDN-uitval

- **Structurele borging (alle vijf varianten):** geen enkele stylesheet verbergt reveal-doelen (`display:none` alleen voor de headernavigatie in één max-width-query; geen `visibility:hidden`, geen `opacity: 0`), dus zonder scripts is elke pagina byte-voor-byte volledig zichtbaar. Alle `main.js`-bestanden stoppen vóór GSAP-registratie bij `prefers-reduced-motion: reduce` of ontbrekende `window.gsap`/`window.ScrollTrigger` (CDN-uitval) en animeren uitsluitend transforms met `clearProps`-opruiming; de validators dwingen deze guards af.
- **Praktische controle:** de statische HTML van alle zes routes is zonder JavaScript gecontroleerd (volledige inhoud, ankers en CTA's aanwezig in de kale HTML-respons van de server). Premium bevat bij reduced motion nul tweens/ScrollTriggers (guard retourneert vóór `registerPlugin`).
- **Beperking:** de gebruikte headless-browsersessie biedt geen schakelaar voor `prefers-reduced-motion`-emulatie of selectieve requestblokkering van jsDelivr; die twee modi zijn daarom geverifieerd via de kale-HTML-controle en de code-/validatorguards hierboven, niet via een aparte browserrun.

## Onderlinge vergelijking (eigenheid per variant)

Naast elkaar bekeken op 1440 px: Minimalistisch blijft rustig/editorial (licht, één leeskolom), Brutalistisch A blijft operationele blauwdruk (sectiecodes, harde offsetvlakken), Brutalistisch B blijft tabloidregister (serif-krantentypografie, folio's), Conventioneel blijft trust-center SaaS (afgeronde panelen, sticky header, bewijsrail) en Premium onderscheidt zich duidelijk: donkere marineblauwe boekdelen, dossierregels met hairlines en indexnummers, verfijnde lichte koppen, evidence-index, drie door hairlines verbonden modulehoofdstukken en een donker assurance-ledger. Geen van de vier bestaande varianten is inhoudelijk of visueel gewijzigd (git-diff op hun mappen: alleen `minimalistisch/DESIGN.md`-provenance).

## Afsluitende automatische controles

- `node scripts/validate-site.mjs` — geslaagd (rootkeuze, vijf routes, CTA-contracten, ontwerpdocumenten en alle zes onderliggende validators).
- Mutatietests uitgevoerd en teruggedraaid: ontbrekende module, onbekende claim, aangescherpte strikte claim (30%→50%), afwijkend CTA-label, extra kleur (#D4AF37), verwijderde rootkeuze en "open" DESIGN-provenance lieten de betreffende validator elk aantoonbaar falen.
- `git diff --check` — geen whitespace-fouten; diff- en werkboomscan op API-keys, `.env`, MCP-config en PDF-bestanden — niets aangetroffen.
