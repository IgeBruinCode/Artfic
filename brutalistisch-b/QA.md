# QA-log — variant Brutalistisch B (tabloid register)

Datum: 2026-07-16 · Browser: Chromium (headless, CDP-sidecar) via `node scripts/serve.mjs 4173` · Route: `http://127.0.0.1:4173/brutalistisch-b/`

## Uitgevoerde controles

| Controle | Resultaat |
| --- | --- |
| 1440 px, volledige pagina | **OK** — masthead, sticky register links (240px) met actieve-hoofdstukmarkering, zes folio's in tabloidkolommen 2:1, trapsgewijze modulespread, grootboek, slotfolio; geen overflow of overlap (full-page screenshot beoordeeld) |
| 768 px, volledige pagina | **OK** — register als wrappende linkstrook boven de inhoud, kolommen 2:1 behouden, spread in drie kolommen; geen overflow |
| 320 px, volledige pagina | **OK** — één lineaire kolom, register wrappend en volledig zichtbaar, H1 breekt binnen het scherm, alle CTA's zichtbaar; geen horizontale scroller |
| Skiplink (toetsenbord) | **OK** — eerste Tab toont "Direct naar de inhoud" linksboven met zichtbare focusstijl |
| Registerlink activeren | **OK** — klik op "Voor organisaties" navigeert naar `#organisatie`; het register markeert daarna uitsluitend dat hoofdstuk (`aria-current="location"` + donker vlak), bevestigd op 1440 px |
| CTA's en footerlinks | **OK** — alle `data-cta-id`'s, labels, bestemmingen (uitsluitend `https://artific.nl/contact-opnemen/`), `mailto:`/`tel:`-waarden en het ontbreken van `target` automatisch gecontroleerd door `scripts/validate-brutalistisch-b.mjs` (geslaagd); geen kale `#` |
| Reduced motion | **OK (bron + statische terugval)** — `main.js` stopt vóór elke tween bij `prefers-reduced-motion: reduce`; CSS schakelt smooth scrolling en transities uit; regels staan in CSS standaard op volledige lengte en niets is standaard verborgen, dus de statische weergave is de terugval. Emulatie van de mediaquery was in de headless sidecar niet beschikbaar; guardpad broncode-geverifieerd en door de validator afgedwongen |
| JavaScript uit / CDN geblokkeerd | **OK (per constructie + bron)** — alle inhoud, ankers en CTA's zijn statische HTML zonder reveal-CSS; `main.js` keert direct terug zonder `window.gsap`/`window.ScrollTrigger`. Door de validator afgedwongen (guards, geen `opacity`-animatie, geen standaard-verborgen content) |
| Regressie zustervarianten | **OK** — `/minimalistisch/` en `/brutalistisch-a/` blijven byte-ongewijzigd in deze taak (diff-controle) en hun validators slagen |
| Side-by-side stijlvergelijking | **OK** — B verschilt wezenlijk van A (geen sticky commandobar, sectiecodes, kapitale sans-koppen, offset-schaduwen, pipeline of moduleplaten; wél statische masthead, sticky hoofdstukregister, serif/sans-mix, asymmetrische krantencolommen, doorlopende modulespread, grootboek) en van de minimalistische leeskolom |

## Automatische checks (2026-07-16)

- `node scripts/validate-brutalistisch-b.mjs` — geslaagd (na bewuste mutatietest: ongeldige CTA-tekst, kleur en claim-ID werden alle gedetecteerd)
- `node scripts/validate-content.mjs`, `node scripts/validate-minimalistisch.mjs`, `node scripts/validate-brutalistisch-a.mjs` — geslaagd

## Openstaand

- Het ontwerpdocument `DESIGN.md` kon niet via de Google Stitch-MCP worden aangemaakt: de MCP was in deze bouwronde niet beschikbaar in de omgeving. De provenance in `DESIGN.md` legt dit expliciet vast; er is geen handgeschreven document als Stitch-output gepresenteerd.
