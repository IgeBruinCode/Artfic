# Ontwerpdocument — variant Conventioneel (trust-center SaaS)

Stijlgids voor de landingspagina op `/conventioneel/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: het document is met `upload_design_md` geüpload naar Stitch-project `5627763905823275232` ("Artific — Conventioneel (trust-center SaaS)", screen `16895288171644647696`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/3d7545ac2c3843e389918d2d7421e7e1` ("Conventional Trust"). De door Stitch vastgelegde named colors bevatten exact de merktokens uit `assets/brand/brand.json` (`primary_container #0A213D`, `marine-blue #062244`, `surface-light #E5EDF8`, `surface_container_lowest #FFFFFF`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. De door Stitch teruggegeven stijlrichtlijnen (wit→lichtblauw→donkerblauw sectieritme, 12-koloms 1200px-grid op 8px-schaal, tonale gelaagdheid zonder schaduwen/gradients, 12–20px afronding, 1–2px effen randen, donkerblauwe primaire en oranjegele accent-CTA's, 2px hover-lift, 3px focusringen, gestapelde trust-console met statuschips) komen overeen met de implementatie; waar Stitch generieker formuleert (zoals de headernavigatie-afbouw, hier op 900px) blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

## Ontwerpprincipes

Een bewezen, gestructureerde B2B-SaaS-opbouw met rustige vertrouwensopbouw: lichte sticky header, split hero met een tekstuele governance-samenvatting (trust-console), direct daaronder een bewijsrail, daarna visie → positie → product → governance → aanpak → slot-CTA. Afgeronde hoeken, dunne blauwe randen en effen vlakken maken de pagina herkenbaar SaaS/corporate; er zijn geen iconensets, gradients, stockbeelden, dashboardscreenshots of fictieve quotes. De enige beelden zijn de twee officiële logo-uitvoeringen.

## Kleurgebruik

Uitsluitend de zes waarden uit `assets/brand/brand.json` (status: `verified`). Geen afgeleide tinten, geen transparante merkkleuren, geen gradients of blur.

| Kleur | Hex | Rol op deze pagina |
| --- | --- | --- |
| Wit | `#FFFFFF` | hoofdcanvas, panelen, tekst op donker |
| Artific-donkerblauw | `#0A213D` | alle lopende tekst en koppen op licht, primaire CTA-vulling, Artific-laag in de trust-console, footer |
| Artific-marineblauw | `#062244` | donkere slotsectie en hoverstand van de primaire CTA |
| Artific-blauw | `#287CEB` | grote accenten: randen van trust-console/bewijsrail/modulecards/assurance-items, eyebrow-strepen, stapnummer-prefixen, grote cijfers in de bewijsrail, focusring op licht |
| Artific-lichtblauw | `#E5EDF8` | tintsecties (vertrouwen, positie, governance), trust-console-achtergrond, scheidingslijnen, selectie |
| Artific-oranjegeel | `#ECA414` | spaarzaam: accent-CTA en focusring op de donkere slotsectie, conclusieregel-streep |

Contrastregels: kleine lopende tekst is altijd `#0A213D` op wit/lichtblauw of `#FFFFFF` op donker (ruim boven WCAG AA). `#287CEB` wordt op wit alleen decoratief of voor grote/vette cijfers en labels gebruikt, nooit voor kleine informatieve tekst. `#ECA414` staat nooit als tekst op wit; als CTA-vulling draagt hij donkerblauwe tekst (AA-veilig). Het blauwe logo staat alleen op de witte header; het witte logo alleen op de donkere footer.

## Spacing

8px-schaal als custom properties: `--ruimte-1` 8px t/m `--ruimte-5` 64px. Sectiepadding vloeiend `clamp(56px, 9vw, 112px)`; gutters `clamp(16px, 5vw, 48px)`. Container maximaal 1200px; leestekst maximaal `64ch`. Panelen en cards hebben 24px binnenpadding; grids 24px gap. Ankersecties krijgen `scroll-margin-top: 88px` vanwege de sticky header.

## Visuele hiërarchie

- Systeemfont-stack `"Helvetica Neue", Helvetica, Arial, sans-serif`; geen webfonts.
- `clamp()`-schaal: H1 `2–3.25rem`, H2 `1.6–2.375rem`, H3 `1.2–1.45rem`, H4 `1.05–1.2rem`, body `1.0625rem` (regelafstand 1.6).
- Exact één H1 (merkbelofte) in de hero; H2 per hoofdsectie, H3 voor vragen/panelen/lagen, H4 binnen modules/stappen. Eyebrow-labels (kapitaal, blauwe streep links) markeren secties.
- Ritme door afwisseling wit / lichtblauw / wit, met één donkere slotsectie; de bewijsrail direct na de hero bouwt vertrouwen op vóór de inhoudelijke verdieping.

## Componentstijlen

- **Header (`saas-header`):** sticky, wit, 1px lichtblauwe onderrand; blauw logo, lokale sectienavigatie (verborgen < 720px), compacte primaire CTA. Doelen ≥ 44px.
- **CTA's:** afgerond (12px), 2px rand, ≥ 48px hoog. Primair: donkerblauw vlak/witte tekst; secundair: wit met donkerblauwe rand; op donker: oranjegeel vlak met donkerblauwe tekst respectievelijk witte omlijning. Hover: kleuromslag plus 2px GSAP-lift; focus: 3px ring (blauw op licht, oranjegeel op donker).
- **Trust-console:** lichtblauw afgerond paneel (20px) met drie gestapelde lagen (AI-modellen → Artific-beheerslaag → jouw processen) als witte/donkerblauwe kaartjes met blauwe verbindingslijnen, plus statuschips die letterlijk de onderbouwde `pos-badges`-claim dragen. Volledig tekst/CSS, geen nagebootst dashboard of verzonnen metingen.
- **Bewijsrail:** drie witte afgeronde kaarten met groot blauw cijfer/label en de letterlijke bewijsclaims (100+ klanten, award 2025, drie USP's); klantnamen als lopende tekstregel eronder.
- **Module-cards:** drie witte kaarten (20px radius) met 6px blauwe bovenrand, donkerblauw modulenummer-label (kleine kapitaaltekst blijft in het AA-veilige donkerblauw), korte beschrijving en detailregel achter een dunne scheidingslijn.
- **Assurance-matrix:** `dl` met zes afgeronde items (EU-hosting, ISO 27001, pseudonimisering, modelkeuze, access control, audit logs), elk aan zijn claim-ID gekoppeld.
- **Stepper/lagen/stappen:** afgeronde panelen met 4px blauwe linkerrand; de vijf stappen dragen CSS-counternummers (`01 ·`).
- **Footer:** donkerblauw met wit logo en uitsluitend de officiële contactlinks (contactpagina, e-mail, telefoon).

## Motion

GSAP 3.12.5 + ScrollTrigger, gepind via jsDelivr met `defer`; `main.js` stopt vóór registratie bij `prefers-reduced-motion: reduce` of ontbrekende globals. Uitsluitend transforms, nooit opacity; niets staat standaard verborgen.

- `[data-reveal]`-blokken schuiven eenmalig 16px omhoog (0,5s, `power2.out`, start op 88% viewport, `clearProps`).
- De verbindingslijnen in de trust-console bouwen op via `scaleY` (0,45s, 0,2s stagger).
- De actuele sectielink in de header krijgt via ScrollTrigger `aria-current="location"`.
- CTA's krijgen een 2px hover-lift; klik- en focusgedrag hangt nergens van GSAP af.
- CSS reduced-motion-blok schakelt smooth scrolling en alle transitions/animations uit.

## Responsief gedrag

Mobile-first één kolom. Breakpoints: 420px (compactere header: logo 104px, kleinere CTA-padding zodat de header op 320px past), 720px (vragenrij en stepper 3 kolommen, tweeluiken en assurance-matrix 2 kolommen, bewijsrail 3 kolommen), 900px (headernavigatie zichtbaar in compacte vorm — kleinere gaps, 15px links en compacte CTA — zodat logo, vijf navigatielinks en demo-CTA gegarandeerd op één regel passen; daaronder blijft de navigatie ingeklapt en houdt de header alleen logo + primaire CTA), 1100px (volledige headermaten) en 1024px (hero 7/5-split, modules en assurance-matrix 3 kolommen, stappen 5 kolommen). Op 320px: geen horizontale overflow, logo en primaire CTA blijven in de sticky header bereikbaar, focusringen niet afgesneden.
