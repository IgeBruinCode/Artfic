# QA-log — variant Brutalistisch A

Reproduceerbaar reviewcommando (vanuit de repositoryroot, geen dependencies — alleen Node):

```bash
node scripts/serve.mjs 4173
# open vervolgens:
#   http://localhost:4173/brutalistisch-a/
#   http://localhost:4173/minimalistisch/   (regressie)
node scripts/validate-brutalistisch-a.mjs
```

(`python3 -m http.server 4173` werkt ook, maar Python is niet in elke reviewomgeving aanwezig; `scripts/serve.mjs` is dependency-vrij op Node-stdlib.)

## Uitgevoerde matrix (2026-07-15, Chromium via lokale http.server)

| Controle | Resultaat |
| --- | --- |
| 320 px (volledige scroll) | OK — één kolom, geen horizontale overflow, hero-kop breekt binnen het scherm, logo + skiplink + bar-CTA aanwezig, alle acht secties en CTA's bereikbaar |
| 768 px (volledige scroll) | OK — wel/niet-vakken en specsheet in twee kolommen, pipeline gecentreerd verticaal, geen overflow |
| 1440 px (volledige scroll) | OK — 7/4-hero, horizontale pipeline met →, verspringende moduleplaten, sectiecodes/zijstructuur zichtbaar |
| Toetsenbord | OK — eerste Tab toont de oranjegele skiplink linksboven; daarna logo → navigatie → bar-CTA → hero-CTA's → contactlinks in documentvolgorde; 3px focusring (blauw op licht, oranjegeel op donker) |
| Ankeroffsets | OK — `#platform` e.d. landen onder de sticky commandobar (`scroll-margin-top: 96px`) |
| CTA's | OK — alle `data-cta-id`-anchors dragen exact het canonieke label en `https://artific.nl/contact-opnemen/`, zelfde tabblad; footer alleen officiële mail/tel/contactlinks (door validator afgedwongen én visueel gecontroleerd) |
| JavaScript uit | OK — daadwerkelijk uitgevoerd in Chromium (1440 px en 320 px, volledige scroll) tegen een tijdelijke kopie van de pagina waaruit alle drie `<script>`-tags zijn verwijderd: rendering is pixel-identiek aan de baseline op de (decoratieve, `aria-hidden`) voortgangsbalk na, alle acht secties, koppen, platen, pipeline en CTA's volledig zichtbaar, geen layoutverschuiving of verborgen tekst |
| CDN geblokkeerd | OK — daadwerkelijk uitgevoerd in Chromium (1440 px, volledige scroll) tegen een kopie waaruit alleen de twee jsDelivr-tags zijn verwijderd terwijl `main.js` wél draait: de `window.gsap`/`window.ScrollTrigger`-guard stopt het script zonder console-afhankelijke bijwerkingen, rendering identiek aan JS-uit |
| Reduced motion | OK — daadwerkelijk uitgevoerd in Chromium (1440 px, volledige scroll) tegen een kopie die `window.matchMedia` vóór het laden van GSAP/`main.js` dwingt om `prefers-reduced-motion: reduce` te rapporteren: `main.js` keert direct terug, er draait geen enkele animatie en de rendering is identiek aan JS-uit. (De CSS-`@media`-tak zelf is niet via deze override te activeren omdat de QA-browser geen OS-emulatie biedt; die tak schakelt uitsluitend smooth scroll/transities uit en verbergt de voortgangsbalk.) |
| Contrast | OK — alle kleine tekst ≥ 7,49:1 (donkerblauw/wit 16,2; wit/marine 15,9; donkerblauw/oranjegeel 7,6; oranjegeel/marine 7,5); `#287CEB` alleen voor vlakken, grote vette cijfers (≥ 24px, 4,06:1 ≥ 3:1) en focusring |
| Regressie `/minimalistisch/` | OK — pagina laadt ongewijzigd, inhoud en CTA-bestemmingen intact, compositie duidelijk anders dan Brutalistisch A |

De drie fallbackmodi zijn getest via tijdelijke, niet-gecommitte kopieën van `index.html` (map `qa-temp/`, na afloop verwijderd) die alleen de scriptlading manipuleerden; styles.css/main.js zelf waren de originele bestanden.

Openstaand buiten deze QA: geen. De brand-gate is gesloten op basis van officieel gepubliceerde Artific-collateral (`brand.json` = `verified`; de interne PDF's blijven als deviation gedocumenteerd voor hertoetsing zodra ze worden aangeleverd). De Stitch-gate is gesloten: `DESIGN.md` is via de Google Stitch-MCP gefinaliseerd (provenance in het document).
