# QA-log — variant Brutalistisch B (tabloid register)

Datum: 2026-07-16 · Browser: Chromium (headless, CDP-sidecar; fallbackmodi rechtstreeks via het Chrome DevTools Protocol) via `node scripts/serve.mjs 4173` · Route: `http://127.0.0.1:4173/brutalistisch-b/`

## Uitgevoerde controles

| Controle | Resultaat |
| --- | --- |
| 1440 px, volledige pagina | **OK** — masthead, sticky register links (240px) met actieve-hoofdstukmarkering, zes folio's in tabloidkolommen 2:1, trapsgewijze modulespread, grootboek, slotfolio; geen overflow of overlap (full-page screenshot beoordeeld) |
| 768 px, volledige pagina | **OK** — register als wrappende linkstrook boven de inhoud, kolommen 2:1 behouden, spread in drie kolommen; geen overflow |
| 320 px, volledige pagina | **OK** — één lineaire kolom, register wrappend en volledig zichtbaar, H1 breekt binnen het scherm, alle CTA's zichtbaar; geen horizontale scroller |
| Skiplink (toetsenbord) | **OK** — eerste Tab toont "Direct naar de inhoud" linksboven met zichtbare focusstijl |
| Registerlink activeren | **OK** — klik op "Voor organisaties" navigeert naar `#organisatie`; het register markeert daarna uitsluitend dat hoofdstuk (`aria-current="location"` + donker vlak), bevestigd op 1440 px |
| CTA's en footerlinks | **OK** — alle `data-cta-id`'s, labels, bestemmingen (uitsluitend `https://artific.nl/contact-opnemen/`), `mailto:`/`tel:`-waarden en het ontbreken van `target` automatisch gecontroleerd door `scripts/validate-brutalistisch-b.mjs` (geslaagd); geen kale `#` |
| Baseline (1440 px, JS aan, CDN vrij) | **OK — daadwerkelijk uitgevoerd via CDP** — `window.gsap` geladen, 16 ScrollTriggers actief, na scrollen naar 60% markeert het register `#organisatie` via `aria-current`; decoratieve margewoorden driften (transform gemeten), nog niet bereikte folio-regels staan op `scaleX(0.35)` in afwachting van hun eenmalige entree; geen horizontale overflow |
| Reduced motion | **OK — daadwerkelijk uitgevoerd via CDP-emulatie** (`Emulation.setEmulatedMedia`, `prefers-reduced-motion: reduce` — `matchMedia` rapporteert `true`): `main.js` maakt **0** tweens/ScrollTriggers aan, alle `[data-regel]`- en `[data-marge]`-transforms zijn `none` (regels op volledige lengte), geen `aria-current`-mutaties, `scroll-behavior` valt terug naar `auto`; alle 6 folio's, H1 en 5 CTA's aanwezig, geen overflow |
| CDN geblokkeerd | **OK — daadwerkelijk uitgevoerd via CDP** (`Network.setBlockedURLs` op `*cdn.jsdelivr.net*`; 2 requests aantoonbaar geblokkeerd terwijl `main.js` wél laadt): `window.gsap` is `undefined`, de guard stopt het script **zonder één runtime exception**, alle transforms `none`, volledige inhoud en 5 CTA's bruikbaar |
| JavaScript uit | **OK — daadwerkelijk uitgevoerd via CDP** (`Emulation.setScriptExecutionDisabled`): H1, 6 folio's, 6 registerlinks en 5 CTA's aanwezig, **0** standaard verborgen elementen in `main` (visibility/display/opacity gemeten), regels op volledige lengte, geen `aria-current`, geen overflow; ook op 320 px geen overflow en register `position: static` |
| Regressie zustervarianten | **OK** — `/minimalistisch/` en `/brutalistisch-a/` blijven byte-ongewijzigd in deze taak (diff-controle) en hun validators slagen |
| Side-by-side stijlvergelijking | **OK** — B verschilt wezenlijk van A (geen sticky commandobar, sectiecodes, kapitale sans-koppen, offset-schaduwen, pipeline of moduleplaten; wél statische masthead, sticky hoofdstukregister, serif/sans-mix, asymmetrische krantencolommen, doorlopende modulespread, grootboek) en van de minimalistische leeskolom |

## Automatische checks (2026-07-16)

- `node scripts/validate-brutalistisch-b.mjs` — geslaagd (na bewuste mutatietest: ongeldige CTA-tekst, kleur en claim-ID werden alle gedetecteerd)
- `node scripts/validate-content.mjs`, `node scripts/validate-minimalistisch.mjs`, `node scripts/validate-brutalistisch-a.mjs` — geslaagd

## Openstaand

- Geen. De Stitch-gate is gesloten: `DESIGN.md` is via de Google Stitch-MCP doorgevoerd in een afzonderlijk Brutalistisch B-project met eigen design system (provenance met project-, screen- en asset-ID in het document zelf; credential uitsluitend runtime gebruikt, niet opgeslagen).
