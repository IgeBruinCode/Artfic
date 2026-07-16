# QA-log — variant Conventioneel (trust-center SaaS)

Datum: 2026-07-16 · Browser: Chromium (headless CDP-sidecar) via `node scripts/serve.mjs 4173` · Route: `/conventioneel/`

## Viewportcontroles

- **1440 px:** volledige pagina gecontroleerd (screenshot). Split hero (7/5) met trust-console rechts, bewijsrail in drie kaarten, drie module-cards naast elkaar, assurance-matrix in drie kolommen, vijf stappen op één rij, donkere slotsectie. Geen overflow, overlap of te lange leesregels (max 64ch).
- **768 px:** eerste run toonde een omgevouwen header-CTA; opgelost met `white-space: nowrap` en compactere header-gaps op 720–959 px. Herhaalde controle: header op één regel, tweeluiken/2-koloms grids, bewijsrail en vragenrij gestapeld naar verwachting, geen overflow.
- **320 px:** volledig één kolom, compacte header (logo 104 px + primaire CTA zichtbaar en bereikbaar), geen horizontale scroller, alle CTA's volledig zichtbaar.

## Toetsenbord & toegankelijkheid

- Eerste Tab toont de skiplink ("Direct naar de inhoud") zichtbaar linksboven; deze springt naar `main#inhoud` (tabindex="-1").
- Focusvolgorde volgt de documentvolgorde: logo → sectienav → header-CTA → hero-CTA's → slot-CTA's → footerlinks. `:focus-visible` toont een 3 px blauwe ring op licht en oranjegele ring op de donkere sectie/footer.
- Landmarks: header, nav (aria-label), main, aside (trust-console met aria-label), footer. Kopoutline: exact één H1, H2 per hoofdsectie, geneste H3/H4 zonder niveausprongen (structuur bewaakt door `scripts/validate-conventioneel.mjs`).

## CTA's

Alle `data-cta-id`-ankers gecontroleerd tegen de canonieke CTA-kaart (ook automatisch door de validator): 3× `vraag-een-demo-aan` (header, hero, slot) en 2× `maak-een-afspraak` (hero, slot), alle met exact label, `https://artific.nl/contact-opnemen/` en zonder `target`. Footer bevat uitsluitend de officiële contactpagina-, `mailto:`- en `tel:`-waarden. Geen kale `#`, formulier of onbekende bestemming.

## Reduced motion, JS uit & CDN geblokkeerd

- `main.js` stopt vóór GSAP-registratie bij `prefers-reduced-motion: reduce` en bij ontbrekende `window.gsap`/`window.ScrollTrigger`; er ontstaan dan nul tweens/ScrollTriggers (codepad geverifieerd; het script bevat geen enkel opacity-gebruik en CSS verbergt niets standaard, dus de statische weergave is per constructie volledig).
- Zonder JavaScript/CDN blijft de volledige inhoud, sectievolgorde, lokale navigatie en elke CTA werkend: de pagina is puur statische HTML/CSS. Het CSS-reduced-motion-blok schakelt smooth scrolling en transitions uit.
- Beperking: mediafeature-emulatie (reduced motion) en netwerk-blokkade waren in de sidecar-browser niet instelbaar; deze twee scenario's zijn via het codepad en de validatorchecks (`checkMotionGuards`) geverifieerd in plaats van interactief.

## Vergelijking met de zustervarianten

`/minimalistisch/`, `/brutalistisch-a/` en `/brutalistisch-b/` zijn naast `/conventioneel/` geopend en renderen ongewijzigd met werkende CTA's (er is in deze taak geen bestand van die varianten aangeraakt). Conventioneel onderscheidt zich duidelijk: lichte sticky SaaS-header, split hero met afgeronde trust-console, bewijsrail, afgeronde module-cards met blauwe toprand en een assurance-matrix — tegenover de editorial rijen van Minimalistisch, de donkere blauwdruk/commandobar van Brutalistisch A en het tabloidregister van Brutalistisch B. Geen recolour van een bestaande variant.

## Validators

`node scripts/validate-content.mjs`, `validate-minimalistisch.mjs`, `validate-brutalistisch-a.mjs`, `validate-brutalistisch-b.mjs` en `validate-conventioneel.mjs` slagen alle vijf. Mutatietests op de nieuwe validator (ongeldige CTA, onbekend claim-ID, kleur buiten brand.json, ontbrekende module-card, aangescherpte 30%-claim) lieten hem telkens falen en zijn daarna hersteld.
