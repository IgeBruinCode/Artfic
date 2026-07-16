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
| 768 px | OK — de compositie gebruikt circa 31px gutters, alle vier commandobar-ankers en de CTA passen op één rij en de platen staan lineair 01–03. In de viewport-screenshot was geen afsnijding of horizontale scrollbar zichtbaar. |
| 1440 px | OK — lichte en donkere buitenbanden lopen viewportbreed; de inhoud begint/eindigt visueel op 128/1312px. De moduleplaten vormen drie even brede treden van circa 128–1112px, 229–1212px en 329–1312px. |
| Inhoud en links | OK — browser-accessibilitysnapshot toont alle acht secties, de canonieke modulevolgorde, vijf CTA-voorkomens met `https://artific.nl/contact-opnemen/`, plus de ongewijzigde `mailto:`- en `tel:`-links. Externe CTA's zijn conform de lokale-only QA-regel niet geopend. |
| Sectieankers | OK — `#platform` is lokaal aangeklikt op 320px en wijzigde de route naar `/brutalistisch-a/#platform`; de 116px mobiele ankeroffset houdt rekening met de tweerijenbar. |
| Toetsenbord en focus | OK — de eerste Tab focust de skiplink volgens de accessibilitysnapshot. De snapshot toont daarna logo, vier lokale navlinks, bar-CTA, hero-CTA's en contact/footerlinks in documentvolgorde; CSS levert overal een 3px `:focus-visible`-ring. |
| JavaScript uit | OK — op 320px geladen uit een tijdelijke lokale kopie zonder alle drie scripttags; alle secties, modules, navigatie en links bleven direct zichtbaar en bereikbaar. |
| CDN uit | OK — op 1440px geladen uit een tijdelijke lokale kopie zonder de twee jsDelivr-tags maar met origineel `main.js`; de ontbrekende-global guard liet de volledige statische pagina zichtbaar en bereikbaar. |
| Reduced motion | OK voor de JavaScript-guard — op 1440px geladen met een tijdelijke `matchMedia(...).matches === true`-override vóór de originele scripts; alle inhoud en links bleven statisch zichtbaar. De sidecar bood geen OS-level media-emulatie; de CSS-tak is daarom bronmatig/automatisch gecontroleerd en niet als echte OS-emulatie geclaimd. |
| Runtimeverzoeken | Bronmatig OK — HTML/CSS/JS bevatten geen PDF- of 21st.dev-runtimeverwijzing; de validator borgt PDF-afwezigheid. De sidecar bood geen exporteerbare netwerklog. |

De tijdelijke fallbackkopieën zijn na de controle verwijderd. Er zijn geen nieuwe dependencies, assets, MCP-configuraties of credentials toegevoegd. Magic MCP was in deze buildomgeving niet als tool beschikbaar en wordt daarom niet als uitgevoerde provenance geclaimd.
