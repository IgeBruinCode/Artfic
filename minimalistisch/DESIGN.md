# Ontwerpdocument — variant Minimalistisch

Stijlgids voor de landingspagina op `/minimalistisch/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de opgeleverde variant.

> **Provenance:** dit document is handmatig opgesteld op basis van de geïmplementeerde CSS/JS en de `minimalist-ui`-stijlprincipes. De Google Stitch-MCP was in de buildomgeving van dit ticket **niet beschikbaar** (geen geconfigureerde MCP-tools aanwezig); dit document wordt daarom nadrukkelijk *niet* als Stitch-output gepresenteerd. Er is geen credential gebruikt of opgeslagen.

## Ontwerpprincipes

Rustig en doelbewust: de inhoud draagt de aandacht. Eén kolom leestekst met ruime ademruimte, editorial lijnen in plaats van cards of iconengrids, geen foto's of illustraties. Het enige beeldmateriaal is het officiële Artific-logo (blauw op licht, wit op donker) en één abstracte flow-compositie ("AI-modellen → Artific → jouw processen") die volledig uit typografie, lijnen en merkkleuren is opgebouwd.

## Kleurgebruik

Uitsluitend de waarden uit `assets/brand/brand.json` (herkomststatus: kandidaatwaarden uit officiële Artific-assets, PDF-kruisverificatie nog open — zie `assets/brand/README.md`). Geen afgeleide tinten, geen transparante merkkleuren.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Wit | `#FFFFFF` | hoofdcanvas, tekst op donkere vlakken |
| Artific-donkerblauw | `#042244` | alle lopende tekst en koppen, primaire CTA-vulling, donkere contactsectie en footer |
| Artific-blauw | `#287CEB` | herkenbaar maar beperkt accent: eyebrow-streep, onderstrepingen, stapnummers, flow-pijlen, focusring op licht |
| Artific-lichtblauw | `#C9DAF2` | rustige scheidingslijnen, badge-randen, decoratieve modulenummers, selectie-achtergrond |
| Artific-oranjegeel | `#ECA414` | spaarzaam: accentregels, primaire CTA en focusring op de donkere sectie (daar AA-contrastveilig) |
| Gedempt blauwgrijs | `#7790AE` | decoratieve fasenummers en de rand van flow-blokken |

Contrastregels: kleine lopende tekst is altijd `#042244` op wit/lichtblauw of `#FFFFFF` op donkerblauw (ruim boven WCAG AA). `#287CEB` en `#7790AE` halen op wit géén 4,5:1 en worden daarom alleen decoratief of op grote cijfers gebruikt, nooit voor kleine informatieve tekst. `#ECA414` wordt nooit als tekstkleur op wit gebruikt; op `#042244` haalt het ± 7,5:1.

## Spacing

8px-gebaseerde schaal als custom properties: `--ruimte-1` 8px, `--ruimte-2` 16px, `--ruimte-3` 24px, `--ruimte-4` 40px, `--ruimte-5` 64px. Verticale sectieruimte is vloeiend: `clamp(64px, 12vw, 144px)`; horizontale gutters `clamp(16px, 5vw, 48px)`. Paginabreedte maximaal 1120px, leesbreedte maximaal `62ch` (± 65–70 tekens). Rijen en genummerde items krijgen 24–40px verticale padding met 1px lichtblauwe scheidingslijnen als enige decoratie.

## Visuele hiërarchie

- Systeemfont-stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`; geen webfonts.
- Typografische schaal via `clamp()`: H1 `2.25–4rem`, H2 `1.75–2.75rem`, H3 `1.25–1.5rem`, H4 `1.05–1.2rem`, body `1–1.125rem` (regelafstand 1.6), alle koppen gewicht 600 met licht negatieve letterspatiëring.
- Exact één H1 (de merkbelofte); H2 per hoofdsectie, H3 voor vragen/fasen/modules/sublagen, H4 binnen rijen. Eyebrow-labels (kapitaal, gespatieerd, blauwe streep links) markeren secties zonder de koppenhiërarchie te belasten.
- Asymmetrie op desktop: hero in 7/4-grid, modules met breed nummer-kanaal links; op mobiel valt alles terug naar één kolom.
- Grote decoratieve nummers (`01 02 03` in lichtblauw/blauwgrijs, `aria-hidden`) geven ritme zonder iconografie.

## Componentstijlen

- **Header:** sticky, wit met 1px lichtblauwe onderrand; blauw logo, sectieankers (verborgen ≤ 640px), compacte donkere CTA. Alle interactieve doelen ≥ 44px hoog.
- **CTA's:** rechthoekig (geen afronding), 2px rand, gewicht 600, ≥ 48px hoog. Primair: donkerblauw vlak met witte tekst; secundair: wit met donkerblauwe rand; op de donkere slotsectie: oranjegeel vlak respectievelijk witte omlijning. Hover: onderstreping (CSS) plus 2px GSAP-lift; focus: 3px ring in blauw (licht) of oranjegeel (donker).
- **Editorial rijen:** kop + korte alinea tussen 1px lijnen; op ≥ 700px twee kolommen. Geen cards, schaduwen of iconen.
- **Genummerde fasen/lagen/stappen:** CSS-counters met decimal-leading-zero, nummer in gedempte kleur naast de inhoud.
- **Flow-compositie:** drie omlijnde tekstblokken met pijlen (verticaal op mobiel, horizontaal ≥ 700px); het middelste Artific-blok is donkerblauw gevuld. Pijlen zijn `aria-hidden`, het geheel heeft een beschrijvend `aria-label`.
- **Quote:** blauwe linkerlijn, grotere serif-loze tekst, bronvermelding eronder.
- **Badges/toepassingen:** tekstchips met 1px lichtblauwe rand, geen achtergrondvulling.
- **Footer:** donkerblauw, wit logo, officiële contactlinks (contactpagina, e-mail, telefoon).

## Bewegingsprincipes

Beweging is een detail, nooit een voorwaarde: de volledige pagina is leesbaar en bedienbaar zonder JavaScript, bij geblokkeerd CDN en met reduced motion.

- GSAP 3.12.5 + ScrollTrigger, gepind via jsDelivr-CDN met `defer`; `main.js` stopt direct bij `prefers-reduced-motion: reduce` of ontbrekende `window.gsap`/`window.ScrollTrigger`.
- Reveals: `data-reveal`-elementen komen éénmalig binnen met `opacity 0 → 1` en `y 20px → 0` (0,55s, `power2.out`, start op 88% viewport); properties worden na afloop gewist (`clearProps`). Niets staat standaard op opacity 0 in CSS/HTML.
- Flow-voortgang: de pijlen van de controlelaag-compositie faden gestaffeld in (0,2s stagger) zodra de compositie in beeld komt.
- Hover: CTA's krijgen een subtiele lift van 2px bij mouseenter/-leave; klik- en focusgedrag hangt nergens van GSAP af.
- CSS: `scroll-behavior: smooth` en de hover-onderstreping worden in het `prefers-reduced-motion`-blok volledig uitgeschakeld (`scroll-behavior: auto`, `transition/animation: none`).

## Responsief gedrag

Breakpoints op 640px (headernav verbergen), 700px (tweeluik, rijen in twee kolommen, horizontale flow) en 980px (asymmetrische hero en module-layout). Op 320px: één kolom, hero- en slot-CTA's volledig zichtbaar, geen horizontale overflow. Sectieankers krijgen `scroll-margin-top: 96px` vanwege de sticky header.
