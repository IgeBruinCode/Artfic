# QA-log — variant Brutalistisch A

Reproduceerbaar vanuit de repositoryroot:

```bash
node scripts/serve.mjs 4173
node scripts/validate-brutalistisch-a.mjs
node scripts/validate-site.mjs
```

## Hercontrole compacte blauwdruk (2026-07-16)

Lokaal uitgevoerd met Chromium via de CDP-sidecar tegen `node scripts/serve.mjs 4173`.

| Controle | Feitelijk resultaat |
| --- | --- |
| 320 px | OK — logo en demo-CTA staan op de eerste commandobar-rij; Visie, Platform, Controle en Contact blijven zichtbaar op de tweede rij. De hero, CTA's en platen vallen binnen de 16px gutter; de moduletekst staat in de canonieke volgorde 01 AI Assistant → 02 AI ToolBox → 03 Conversation Module. In de viewport-screenshot was geen afsnijding of horizontale scrollbar zichtbaar. |
| 481 / 600 / 700 px | OK na reviewcorrectie — op alle drie tussenbreedtes staat logo/demo-CTA bewust op rij één en de vier lokale ankers op rij twee. `#platform` is op 481 en 600px aangeklikt en `#controle` op 700px; sectiecode en kop stonden steeds volledig onder de sticky bar. Op 481px stond ook de introcode van `#inhoud` direct onder de bar. Er was geen zichtbare afsnijding of horizontale scrollbar. |
| 768 px | OK — de compositie gebruikt circa 31px gutters, alle vier commandobar-ankers en de CTA passen op één rij en de platen staan lineair 01–03. In de viewport-screenshot was geen afsnijding of horizontale scrollbar zichtbaar. |
| 1440 px | OK — lichte en donkere buitenbanden lopen viewportbreed; de inhoud begint/eindigt visueel op 128/1312px. De moduleplaten vormen drie even brede treden van circa 128–1112px, 229–1212px en 329–1312px. |
| Inhoud en links | OK — browser-accessibilitysnapshot toont alle acht secties, de canonieke modulevolgorde, vijf CTA-voorkomens met `https://artific.nl/contact-opnemen/`, plus de ongewijzigde `mailto:`- en `tel:`-links. Externe CTA's zijn conform de lokale-only QA-regel niet geopend. |
| Sectieankers | OK — `#platform` is lokaal gecontroleerd op 320, 481 en 600px en `#controle` op 700px; de 116px offset onder 768px houdt rekening met de tweerijenbar. `#inhoud` is op 481px afzonderlijk gecontroleerd voor skiplink/logo. |
| Toetsenbord en focus | OK — de eerste Tab focust de skiplink volgens de accessibilitysnapshot. De snapshot toont daarna logo, vier lokale navlinks, bar-CTA, hero-CTA's en contact/footerlinks in documentvolgorde; CSS levert overal een 3px `:focus-visible`-ring. |
| JavaScript uit | OK — op 320px geladen uit een tijdelijke lokale kopie zonder alle drie scripttags; alle secties, modules, navigatie en links bleven direct zichtbaar en bereikbaar. |
| CDN uit | OK — op 1440px geladen uit een tijdelijke lokale kopie zonder de twee jsDelivr-tags maar met origineel `main.js`; de ontbrekende-global guard liet de volledige statische pagina zichtbaar en bereikbaar. |
| Reduced motion | OK voor de JavaScript-guard — op 1440px geladen met een tijdelijke `matchMedia(...).matches === true`-override vóór de originele scripts; alle inhoud en links bleven statisch zichtbaar. Een dependency-vrije VM-stub schakelde de mediaquery daarnaast tijdens een actieve sessie in en bevestigde dat alle zeven aangemaakte eigen animaties en ScrollTriggers stoppen, CTA-tweens worden gedood en transforms worden gewist. De sidecar bood geen OS-level media-emulatie; de CSS-tak is daarom bronmatig/automatisch gecontroleerd en niet als echte OS-emulatie geclaimd. |
| Runtimeverzoeken | Bronmatig OK — HTML/CSS/JS bevatten geen PDF- of 21st.dev-runtimeverwijzing; de validator borgt PDF-afwezigheid. De sidecar bood geen exporteerbare netwerklog. |

De tijdelijke fallbackkopieën zijn na de controle verwijderd. De variantvalidator is aanvullend met teruggedraaide mutaties beproefd voor sectiecodevolgorde, binnenwrapper, modulevolgorde en `data-plaat`-hook, gecentreerd werkvlak, desktoptrap, mobiele reset/commandobar, zustervariantsignatuur, transparantie, verborgen inhoud, blur-schaduw, opacity/pinning/layout-motion, gewijzigde CTA, ontbrekende reduced-motion-guard en een 21st.dev-runtimeverwijzing; iedere mutatie faalde op de bedoelde gate en de ongewijzigde variant slaagde daarna opnieuw. Na review faalden ook een teruggezet 480px-commandobarbreakpoint en een verwijderde `#inhoud`-offset gericht. Omgekeerd bleven equivalent herschikte HTML-attributen en CSS-declaraties terecht slagen.

Er zijn geen nieuwe dependencies, assets, MCP-configuraties of credentials toegevoegd. Magic MCP was in deze buildomgeving niet als tool beschikbaar en wordt daarom niet als uitgevoerde provenance geclaimd.

## Hercontrole kinetische control-roomlaag (2026-07-17)

De opgevoerde variant is lokaal opnieuw gerenderd met headless Chromium tegen
`node scripts/serve.mjs 4173`.

| Controle | Feitelijk resultaat |
| --- | --- |
| 390 px | OK — de commandobar blijft tweerijig; de kleur-H1 stapelt zonder horizontale afsnijding en houdt `AI` als gele stempel zichtbaar; tekst, CTA's en systeemobjecten blijven binnen de viewport. |
| 1440 px | OK — de hero toont de volledige gesplitste H1, live-status, pulsmeter en commandoticker; de moduletrap, FC Twente-caseplaat, reviewgrid en contactslogan behouden het 1280px-werkvlak. |
| FC Twente | OK — de zichtbare bewijsplaat bevat de canonieke claim over drie seizoenen en de bestaande klantlogo-rail bevat het lokale FC Twente-logo. De variantvalidator eist de claim nu expliciet. |
| JavaScript uit | OK — een Chromium-render met JavaScript uit toont alle tekst, navigatie, CTA's en componenten; alleen de progressieve choreografie ontbreekt. |
| Reduced motion | OK — Chromium met `--force-prefers-reduced-motion=reduce` toont de volledige statische hero en stopt tickers, meters en GSAP-entrees; alleen de decoratieve voortgangsbalk wordt verborgen. |
| Automatische gates | OK — `node --check brutalistisch-a/main.js`, `node scripts/validate-brutalistisch-a.mjs` en `git diff --check` slagen. De setbrede validator blijft los hiervan steken op de reeds bestaande bestandsnaammismatch van de twee lokale referentie-PDF's. |

De nieuwe componentlaag gebruikt geen nieuwe runtime dependency of extern
componentpakket. De inspiratie is lokaal vertaald naar semantische HTML, CSS en
de bestaande GSAP/ScrollTrigger-progressive enhancement.
