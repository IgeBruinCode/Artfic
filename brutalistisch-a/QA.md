# QA-log — variant Brutalistisch A

Reproduceerbaar reviewcommando (vanuit de repositoryroot, geen dependencies):

```bash
python3 -m http.server 4173
# open vervolgens:
#   http://localhost:4173/brutalistisch-a/
#   http://localhost:4173/minimalistisch/   (regressie)
node scripts/validate-brutalistisch-a.mjs
```

## Uitgevoerde matrix (2026-07-15, Chromium via lokale http.server)

| Controle | Resultaat |
| --- | --- |
| 320 px (volledige scroll) | OK — één kolom, geen horizontale overflow, hero-kop breekt binnen het scherm, logo + skiplink + bar-CTA aanwezig, alle acht secties en CTA's bereikbaar |
| 768 px (volledige scroll) | OK — wel/niet-vakken en specsheet in twee kolommen, pipeline gecentreerd verticaal, geen overflow |
| 1440 px (volledige scroll) | OK — 7/4-hero, horizontale pipeline met →, verspringende moduleplaten, sectiecodes/zijstructuur zichtbaar |
| Toetsenbord | OK — eerste Tab toont de oranjegele skiplink linksboven; daarna logo → navigatie → bar-CTA → hero-CTA's → contactlinks in documentvolgorde; 3px focusring (blauw op licht, oranjegeel op donker) |
| Ankeroffsets | OK — `#platform` e.d. landen onder de sticky commandobar (`scroll-margin-top: 96px`) |
| CTA's | OK — alle `data-cta-id`-anchors dragen exact het canonieke label en `https://artific.nl/contact-opnemen/`, zelfde tabblad; footer alleen officiële mail/tel/contactlinks (door validator afgedwongen én visueel gecontroleerd) |
| JavaScript uit / CDN geblokkeerd | OK per bron-analyse — CSS zet geen inhoud op `opacity: 0` en `main.js` animeert uitsluitend transforms op zichtbare elementen; zonder scripts is de pagina identiek qua inhoud, volgorde en bediening (validator bewaakt dit: gepinde CDN, guards, geen opacity-animaties) |
| Reduced motion | OK per bron-analyse — `main.js` stopt direct op `prefers-reduced-motion: reduce`; CSS-blok schakelt smooth scroll/transities uit en verbergt de decoratieve voortgangsbalk. (OS-emulatie was in de QA-omgeving niet beschikbaar; gedrag is via de expliciete guards geverifieerd.) |
| Contrast | OK — alle kleine tekst ≥ 7,49:1 (donkerblauw/wit 16,2; wit/marine 15,9; donkerblauw/oranjegeel 7,6; oranjegeel/marine 7,5); `#287CEB` alleen voor vlakken, grote vette cijfers (≥ 24px, 4,06:1 ≥ 3:1) en focusring |
| Regressie `/minimalistisch/` | OK — pagina laadt ongewijzigd, inhoud en CTA-bestemmingen intact, compositie duidelijk anders dan Brutalistisch A |

Openstaand buiten deze QA: de harde brand-gate (`brand.json` = `unverified`, interne PDF's niet aangeleverd) en de Stitch-MCP-gate (zie `DESIGN.md`).
