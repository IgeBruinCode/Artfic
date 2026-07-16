# QA-log — variant Conventioneel (trust-center SaaS)

Datum: 2026-07-16 · Browser: Chromium via CDP-sidecar · Server: `node scripts/serve.mjs 4173` · Route: `/conventioneel/`

## Viewports en headerbreakpoints

- **320px:** logo en demo-CTA staan samen op rij één; alle vijf lokale links blijven zichtbaar in een 3+2-raster. Hero, console, bewijsitems, modules en assurance-items staan lineair. Er was geen zichtbare afsnijding of horizontale uitloop.
- **768px:** logo/CTA staan op de eerste rij en de vijf links op één tweede rij. Bewijsrail gebruikt drie kolommen, assurance twee; de modules blijven in de leesvolgorde AI Assistant → AI ToolBox → Conversation Module.
- **1440px:** de hero is een 7/5-split. De modulecards maten in de screenshot circa x=168–1085, x=262–1178 en x=355–1272; hun gezamenlijke grens x=168–1272 gebruikt de volledige 1104px contentbreedte.
- **Headergrenzen:** 419/420, 719/720, 899/900 en 1099/1100px zijn elk aan beide zijden geopend en vastgelegd. De headerhoogte schakelde beheerst van circa 156px (twee navigatierijen) naar 112px (één lokale navigatierij) en 66px (één desktopregel). Logo, links en CTA overlapten of vouwden nergens.
- Hoofdsectie- en assurance-ankers gebruiken per bereik 170/166/126/88px scroll-offset. Een klik op `EU-gehost` landde bij het volledig zichtbare `#assurance-eu`; de 3px `:target`-outline was zichtbaar zonder layoutverschuiving.

## Navigatie, focus en bestemmingen

De accessibilitysnapshot bevatte header/nav/main/aside/footer, exact één H1, vijf lokale headerlinks, vier consolelinks, vijf CTA's en de drie contactlinks. De eerste Tab maakte de skiplink zichtbaar met 3px focusring; de volgende Tab focuste het logo, waarna de DOM-volgorde door lokale navigatie, CTA's, consolelinks en footer loopt. Alle interactiedoelen zijn minimaal 44px en gebruiken dezelfde zichtbare Blue-focusring op licht of Yellow op navy.

De snapshots en validator bevestigden 3× `vraag-een-demo-aan` en 2× `maak-een-afspraak`, ieder exact naar `https://artific.nl/contact-opnemen/`. De lokale-only QA opende de externe bestemming niet. `mailto:info@artific.nl` en `tel:053 203 0123` bleven ongewijzigd.

## Motion en uitval

Tijdelijke, na afloop verwijderde lokale harnassen gebruikten steeds de ongewijzigde HTML/CSS/`main.js`:

- **Reduced motion vóór laden:** 8 secties en 19 links bleven zichtbaar; gemeten `transforms=0`, `ScrollTrigger.getAll().length=0`.
- **Dynamisch reduced motion:** na een normale initialisatie werd de mediaquery-change aangeroepen; daarna waren `transforms=0` en `triggers=0`. De cleanup stopte tevens CTA-tweens en ruimde `aria-current` op.
- **CDN-uitval:** beide jsDelivr-hosts zijn in een lokale kopie naar een onbereikbare host omgeleid. Resultaat: 8 secties, 19 links, nul transforms, geen CDN-globals; alle inhoud en ankers bleven statisch bruikbaar.
- **JavaScript uit:** alle scripttags zijn in een tijdelijke lokale kopie verwijderd. De volledige inhoud, vijf headerlinks, vier consolelinks, vijf CTA's en contactlinks bleven aanwezig en bruikbaar.

De normale route gebruikte uitsluitend de korte transform-entrees voor bewijs, modules, assurance en consoleverbindingen. CSS bevat geen initiële verborgen of verplaatste toestand. Geen runtimebestand verwijst naar PDF's of 21st.dev.

## Automatische controles

- `node scripts/validate-conventioneel.mjs` — geslaagd.
- `node scripts/validate-site.mjs` — geslaagd.
- `git diff --check` — geslaagd.
- De validator borgt exacte nav-/console-/assurance-doelen, canonieke modulevolgorde, de 1024px twaalfkolomstrap, de volledige 1023px-reset, merk-/contrastregels, verboden zustervariantsignaturen en dynamische motioncleanup.
- Tien teruggedraaide mutaties faalden gericht: verborgen nav, kapotte assurance-link, modulevolgorde, derde desktopoffset, mobiele reset, zustervariantklasse, schaduw, motioncleanup, claimdrift en CTA-drift.
