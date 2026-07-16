# QA-log — variant Conventioneel (trust-center SaaS)

Datum: 2026-07-16 · Browser: Chromium (headless CDP-sidecar) via `node scripts/serve.mjs 4173` · Route: `/conventioneel/`

## Viewportcontroles

- **1440 px:** volledige pagina gecontroleerd (full-page screenshot). Split hero (7/5) met trust-console rechts, bewijsrail in drie kaarten, drie module-cards naast elkaar, assurance-matrix in drie kolommen, vijf stappen op één rij, donkere slotsectie. Geen overflow, overlap of te lange leesregels (max 64ch).
- **900 px / 899 px (beide zijden van de header-breakpoint):** op 900 px verschijnt de sectienavigatie in compacte vorm (kleinere gaps, 15px links, compacte CTA) en past de header aantoonbaar op één regel zonder omvouwen; op 899 px is de navigatie ingeklapt en toont de header alleen logo + primaire demo-CTA. In een eerdere ronde vouwde de header-CTA om in de band 720–767 px; dat is opgelost door de navigatie tot 900 px ingeklapt te houden en op 900–1099 px een compacte headerstand te gebruiken — beide zijden zijn opnieuw met screenshots geverifieerd.
- **768 px:** headernavigatie ingeklapt (logo + demo-CTA), inhoudsgrids op tabletbreedte: vragenrij en stepper drie kolommen, tweeluiken en assurance-matrix twee kolommen, bewijsrail drie kaarten. Geen overflow of omgevouwen CTA.
- **320 px:** volledig één kolom, compacte header (logo 104 px + primaire CTA zichtbaar en bereikbaar), geen horizontale scroller, alle CTA's volledig zichtbaar.

## Toetsenbord & toegankelijkheid

- Eerste Tab toont de skiplink ("Direct naar de inhoud") zichtbaar linksboven; deze springt naar `main#inhoud` (tabindex="-1").
- Focusvolgorde volgt de documentvolgorde: logo → sectienav → header-CTA → hero-CTA's → slot-CTA's → footerlinks. `:focus-visible` toont een 3 px blauwe ring op licht en oranjegele ring op de donkere sectie/footer.
- Landmarks: header, nav (aria-label), main, aside (trust-console met aria-label), footer. Kopoutline: exact één H1, H2 per hoofdsectie, geneste H3/H4 zonder niveausprongen (structuur bewaakt door `scripts/validate-conventioneel.mjs`).
- Module-nummerlabels staan in donkerblauw (`#0A213D`) zodat ook deze kleine kapitaaltekst ruim WCAG AA haalt; blauw blijft beperkt tot grote cijfers, randen en decoratie.

## CTA's

Alle `data-cta-id`-ankers gecontroleerd tegen de canonieke CTA-kaart (ook automatisch door de validator): 3× `vraag-een-demo-aan` (header, hero, slot) en 2× `maak-een-afspraak` (hero, slot), alle met exact label, `https://artific.nl/contact-opnemen/` en zonder `target`. Footer bevat uitsluitend de officiële contactpagina-, `mailto:`- en `tel:`-waarden. Geen kale `#`, formulier of onbekende bestemming.

## Reduced motion & geblokkeerd CDN — interactief getest

- **Reduced motion (hands-on):** een tijdelijke, niet-gecommitte harnas-kopie van de route is in de sidecar-browser geopend waarin de echte `prefers-reduced-motion`-media query vóór het laden van het ongewijzigde `main.js` op `reduce` is geforceerd (de sidecar zelf biedt geen mediafeature-emulatie). Resultaat: de volledige pagina rendert identiek statisch, de lokale navigatie springt direct naar `#governance`, alle inhoud en CTA's blijven bruikbaar en de guard in `main.js` stopt vóór GSAP-registratie, dus er ontstaan nul tweens/ScrollTriggers en geen `aria-current`-mutaties.
- **Geblokkeerd CDN (hands-on):** een tweede harnas-kopie met een onbereikbare CDN-host (`cdn.jsdelivr.invalid`) is geopend, waardoor GSAP/ScrollTrigger en daarmee de hele enhancement daadwerkelijk niet laden. Resultaat: volledige inhoud, sectievolgorde, ankernavigatie (klik naar `#platform` gecontroleerd) en alle CTA's werken; niets is verborgen of verschoven. Dit dekt tegelijk het scenario JavaScript-uit, omdat `main.js` zonder de CDN-globals direct stopt en de pagina puur statische HTML/CSS is.
- Beide harnas-kopieën zijn na de test verwijderd; de gecommitte bestanden zijn ongewijzigd getest op de normale route, waar GSAP wél laadt (reveals, trust-console-opbouw, navigatiestatus op `#governance` zichtbaar).

## Vergelijking met de zustervarianten

`/minimalistisch/`, `/brutalistisch-a/` en `/brutalistisch-b/` zijn naast `/conventioneel/` geopend en renderen ongewijzigd met werkende CTA's (er is in deze taak geen bestand van die varianten aangeraakt). Conventioneel onderscheidt zich duidelijk: lichte sticky SaaS-header, split hero met afgeronde trust-console, bewijsrail, afgeronde module-cards met blauwe toprand en een assurance-matrix — tegenover de editorial rijen van Minimalistisch, de donkere blauwdruk/commandobar van Brutalistisch A en het tabloidregister van Brutalistisch B. Geen recolour van een bestaande variant.

## Validators

`node scripts/validate-content.mjs`, `validate-minimalistisch.mjs`, `validate-brutalistisch-a.mjs`, `validate-brutalistisch-b.mjs` en `validate-conventioneel.mjs` slagen alle vijf. Mutatietests op de eigen validator lieten hem falen bij: ongeldige CTA, onbekend claim-ID, kleur buiten `brand.json`, ontbrekende module-card, aangescherpte 30%-claim, een tweede `display:none` in de CSS, een provenance zonder Stitch-project-ID en een provenance die een open Stitch-status meldt; een module-card met extra modifier-klasse en herschikte attributen bleef terecht slagen. Alle mutaties zijn daarna hersteld.
