# Ontwerpdocument — variant Premium (executive evidence dossier)

Stijlgids voor de landingspagina op `/premium/`. Dit document beschrijft de daadwerkelijk geïmplementeerde waarden uit `styles.css` en `main.js`; het is geen voorstel maar de vastlegging van de gebouwde variant.

> **Provenance — gefinaliseerd via Google Stitch-MCP (2026-07-16):** de hieronder vastgelegde, werkelijk geïmplementeerde waarden uit `styles.css`/`main.js` zijn via de Google Stitch-MCP (`stitch.googleapis.com/mcp`, MCP-protocol 2025-03-26) doorgevoerd en gefinaliseerd in een **afzonderlijk** Stitch-project voor deze variant: eerst is met `create_project` en `generate_screen_from_text` (DESKTOP) een eigen conceptproject "Artific — Premium (executive evidence dossier)" opgezet met uitsluitend de centrale merktokens en logo-regels (concept-design-system `assets/28218d7c736747be98cad0364c23a049`, "Executive Evidence Dossier": hairline-dossierpanelen, tonale gelaagdheid zonder schaduwen, rechthoekige knoppen, evidence-definitielijsten en genummerde indexrail); daarna is dit document met `upload_design_md` geüpload naar Stitch-project `2405762213270064179` (screen `13176217260320799308`) en met `create_design_system_from_design_md` (DESKTOP) omgezet in design system `assets/e0d0eb0396fc4e77b869197f47796338`. De door Stitch vastgelegde named colors bevatten exact de merktokens uit `assets/brand/brand.json` (`accent-focus #ECA414`, `background-tint #E5EDF8`, `primary_container #062244`, `surface_container_lowest #FFFFFF`); de overige door Stitch intern gegenereerde Material-paletwaarden worden **niet** op de pagina gebruikt. Waar de Stitch-richtlijnen generieker formuleren (zoals een sticky indexrail op mobiel; deze pagina houdt de dossierregel bewust in de contentflow) blijft de implementatie zoals hieronder beschreven leidend. De gebruikte credential is uitsluitend runtime aangeboden en is niet in broncode, Markdown, configuratie of scripts opgeslagen.

> **Huisstijlherijking:** de Stitch-provenance hierboven blijft als historische runregistratie letterlijk behouden. De daarin genoemde toenmalige token-snapshot is niet langer de merkbasis; de actuele implementatie en onderstaande kleurregels volgen de twee lokale primaire PDF’s en `assets/brand/brand.json`.

## Ontwerpprincipes

Een high-end "executive evidence dossier": de pagina leest als een zorgvuldig gebonden bestuursdocument. Donkere marineblauwe boekdelen openen en sluiten de route (hero, governance, slot), lichte en getinte boekdelen dragen de bewijsvoering. Elke sectie begint met een dossierregel — decoratief indexnummer, hairline en sectielabel — die de doorlopende scroll als hoofdstukken markeert. Autoriteit komt uit ritme, typografische precisie en bewijsgerichte inhoud; er zijn geen goud-/luxemotieven, gradients, schaduwen, afgeronde cards, glas-effecten, stockbeelden of AI-illustraties. Het enige beeldmateriaal is het witte Artific-logo op de donkere header en footer.

## Kleurgebruik

Uitsluitend de bevestigde waarden uit `assets/brand/brand.json` (status: `verified`). Geen afgeleide tinten, geen transparante merkkleuren, geen gradients of blur.

- `#042244` (Artific Navy) — donkere boekdelen: header, hero (`#intro`), governance (`#governance`), slot (`#contact`) en footer; daarnaast lopende tekst/hairlines op licht en de Artific-laag (één CSS-token `--navy`).
- `#FFFFFF` (wit) — lichte boekdelen (`#bewijs`, `#controlelaag`, `#aanpak`) en tekst op donker.
- `#E5EDF8` (lichtblauw) — getinte boekdelen (`#visie`, `#platform`) en subtiele scheidingslijnen in de evidence-index.
- `#287CEB` (blauw) — uitsluitend lijnen en decoratieve, `aria-hidden` indexnummers op licht, hairlines, dunne CTA- en hero-margeranden; nooit als kleine betekenisvolle tekst op licht (contrast onder AA).
- `#FFD602` (Artific-geel) — schaars accent: primaire CTA (`.cta--accent`), indexnummers en ledger-termen op donker, conclusiestreep en de focusring op donkere oppervlakken. Nadrukkelijk een Artific-accent, geen luxe-goudmotief.

Contrast (oppervlakte-afhankelijke regel): kleine betekenisvolle tekst is altijd donkerblauw op wit/lichtblauw (≥ 12:1) of wit/oranjegeel op marineblauw; helder blauw `#287CEB` is op lichte vlakken gereserveerd voor lijnen en decoratieve indexcijfers omdat het bij kleine tekst onder WCAG AA blijft (≈ 4,06:1 op wit, ≈ 3,44:1 op lichtblauw). De evidence-termen en maturity-koppen zijn daarom donkerblauw. De oranjegele CTA draagt marineblauwe tekst (contrast ≈ 11,3:1).

## Spacing

8px-schaal via CSS-variabelen (`--r-1` 8px t/m `--r-12` 96px). Boekdelen krijgen royale verticale ruimte `clamp(64px, 12vh, 144px)`; de dossierregel houdt `clamp(32px, 6vh, 64px)` afstand tot de sectiekop; tussenkoppen `--r-12` (96px, tablet 64px). Het kader is maximaal 1280px breed met zijruimte `clamp(20px, 5vw, 64px)`; composities gebruiken grid-gaps van 24–96px op dezelfde schaal.

## Visuele hiërarchie

Eén H1 in de hero; per hoofdsectie één H2, met logisch geneste H3/H4 (vragen, fasen, modules, lagen, stappen). Koppen zijn licht tot middelzwaar (gewicht 450–500) in een lokale humanist-/neo-groteskstack (`"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif`) met negatieve letterspatiëring (−0.015em) en `text-wrap: balance`. Dossierregels en ledger-termen contrasteren met kleine kapitalen op ruime letterspatiëring (0.06–0.22em). Bodyregels blijven binnen 62ch (`--leesbreedte`); ondersteunende tekst is 0.9375rem. De hero is asymmetrisch: 7/4-grid met een grote stelling links en een dunne, blauw omlijnde bewijsmarge rechts.

## Componentstijlen

- **Dossierregel** — index (tabulaire cijfers, blauw op licht, oranjegeel op donker) + 1px hairline + uppercase sectielabel; markeert elk hoofdstuk.
- **Evidence-index** (`#bewijs`) — definitielijst met hairline-regels: uppercase donkerblauwe term links, traceerbare claim rechts; boven- en onderrand donkerblauw, tussenlijnen lichtblauw.
- **Vraag-ledger & maturity-track** (`#visie`) — driekoloms rijen met 1–2px topregels; geen cards of iconen.
- **Controle-architectuur** (`#controlelaag`) — drie aaneengesloten omlijnde lagen (modellen → Artific → processen); de Artific-laag is gevuld donkerblauw met oranjegele kop.
- **Module-sequence** (`#platform`) — drie grote modulehoofdstukken als 3/4/5-grid-rijen, verbonden door hairlines; module-nummer, grote H3 en toepassing per rij.
- **Assurance-ledger** (`#governance`) — tweekoloms grootboek op donker: oranjegele uppercase termen, witte toelichting, blauwe onderlijnen.
- **Begeleiding** (`#aanpak`) — vijf kolommen met geautonummerde stappen (`01`–`05`) boven dunne topregels.
- **CTA's** — rechthoekig (geen afronding): oranjegeel gevuld (`.cta--accent`), wit omlijnd op donker (`.cta--omlijnd`), wit gevuld in de header (`.cta--licht`); minimaal 44–48px hoog. Focus: 3px outline met 3px offset, oppervlakte-afhankelijk — donkerblauw op lichte vlakken (≥ 3:1), oranjegeel op de donkere header/footer/boekdelen en de skiplink.

## Motion

GSAP 3.12.5 + ScrollTrigger via gepinde jsDelivr-CDN met `defer`, uitsluitend progressive enhancement. Guards stoppen vóór pluginregistratie bij `prefers-reduced-motion: reduce` of ontbrekende `window.gsap`/`window.ScrollTrigger`. Effecten: sectiekoppen en modulehoofdstukken (`[data-hoofdstuk]`) schuiven eenmalig 14px in (0.6s, power2.out, `once`), hairlines (`[data-hairline]`) bouwen van `scaleX(0.35)` naar volledig op, indexnummers (`[data-index]`) krijgen een ±6px scrub-verschuiving, CTA's een 2px hover-lift. Alles is transform-only (geen opacity), tijdelijke transforms worden met `clearProps` gewist en CSS kent een reduced-motion-blok dat resterende transities uitschakelt. Zonder scripts of CDN blijft de volledige pagina zichtbaar en bedienbaar.

## Responsief gedrag

- **1440px / desktop** — 12-koloms ritme binnen 1280px: asymmetrische hero (7/4), driekoloms ledgers en tracks, 3/4/5-modulerijen, vijfkoloms stappen, tweekoloms assurance-ledger.
- **768px / tablet (≤960px)** — hero wordt één kolom; module-rijen vereenvoudigen naar nummer + inhoud (1/2); vraag-ledger, maturity-track, lagenraster en stappen naar twee kolommen.
- **320px / mobiel (≤640px)** — alles lineair in één kolom zonder horizontale scroll; de headernavigatie verdwijnt (de secties volgen direct in de doorlopende scroll), de controle-architectuur stapelt verticaal met doorlopende randen, de hero-marge krijgt een topregel in plaats van een zijlijn en dossierregels verkleinen hun letterspatiëring. `scroll-margin-top: 88px` houdt ankers vrij van de vaste leesrand; alle doelen blijven minimaal 44px.
