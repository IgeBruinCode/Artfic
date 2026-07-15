# Observatie — clientgedrag "Vraag een demo aan" (hash-trigger)

- **Datum:** 2026-07-15
- **Pagina:** https://artific.nl/ (live homepage)
- **Browser:** Chromium (headless, CDP-gestuurd), JavaScript ingeschakeld
- **Element:** `<a href="#" class="button info-slideout" data-slideout="slideout-info-3644">Vraag een demo aan</a>` (hero, zie `artific.nl#h-hero-cta`)

## Stappen

1. Open `https://artific.nl/` met JavaScript ingeschakeld en wacht tot de pagina volledig gerenderd is.
2. Klik op de hero-knop via selector `a.info-slideout[data-slideout="slideout-info-3644"]`.
3. Wacht ±1 seconde en maak een screenshot; inspecteer de DOM en de servergerenderde HTML van de slideout-container.

## Geobserveerde uitkomst

- De klik navigeert **niet** naar een andere pagina en verandert de URL niet blijvend; de `href="#"` fungeert alleen als JS-trigger.
- Er schuift een **slideout-paneel** over de pagina met de titel **"Vraag een demo aan"** en een sluitknop (aria-label "Terug").
- Het paneel bevat een **Gravity Forms-formulier** (WordPress; formulier-id 34) dat via AJAX naar `/` post (`target='gform_ajax_frame_34'`, `action='/'`, `data-formid='34'`). Verborgen veld `input_8` heeft de waarde `Artific Home`; er is een honeypotveld gelabeld "X/Twitter".
- Zichtbare velden: sectiekop "Jouw contactgegevens" — Naam\*, Bedrijfsnaam\*, E-mailadres\*, Telefoonnummer\*, Demo omtrent\* (keuzelijst, standaard "AI-Assistent"), Opmerkingen.
- Een tweede run (verse pagina-load, zelfde stappen) reproduceert dezelfde uitkomst. Screenshotbewijs is tijdens de bouw vastgelegd; de servergerenderde slideout-HTML is integraal in de snapshot gedocumenteerd (`artific.nl#h-demo-slideout`).

## Besluit voor de nieuwe statische varianten

Het geobserveerde gedrag is **functioneel maar niet overdraagbaar**: het formulier is een Gravity Forms/WordPress-voorziening die server-side afhandeling op artific.nl vereist. Een statische landingspagina kan dit formulier niet zelfstandig en betrouwbaar overnemen zonder een niet-bestaand endpoint te verzinnen.

**Daarom geldt voor alle vijf varianten de voorgeschreven fallback:** de CTA "Vraag een demo aan" verwijst naar de officiële contactpagina `https://artific.nl/contact-opnemen/` (HTTP 200 geverifieerd op 2026-07-15). Dit is een gedocumenteerde afwijking van het bronsysteem (slideout-formulier → contactpagina); er wordt nooit een willekeurige of niet-bestaande bestemming gebruikt. Vastgelegd in de CTA-kaart in `content/artific-content.nl.json` (`ctas.vraag-een-demo-aan`).
