# Ontwerpdocument — Brutalistisch B: geel/navy-relatiedeck

Stijlgids voor `/brutalistisch-b/`. Deze versie vervangt de eerdere redactionele uitwerking volledig. De pagina is een direct, hard en gelaagd Artific-landschap: geel als canvas, Deep Navy als constructie en een klantrelatiedeck dat al in de intro laat zien met wie Artific werkt.

## Ontwerpprincipes

De compositie gebruikt een merkpodium, een horizontaal relatiedeck, scherpe vraagkaarten, een gestapelde controlelaag, asymmetrische moduleblokken, een governance-mozaïek, partnerrelay en massieve begeleidingsstappen. De vormen delen harde lijnen en forse typografie, maar hebben bewust verschillende silhouetten en ritmes. De inhoudsvolgorde is `intro → bewijs → visie → platform → organisatie → contact`.

Geel is niet alleen accent maar het dominante route-oppervlak. Navy bouwt de platform- en contactvelden en geeft alle kritieke contrasten. Shader-achtige velden zijn uitsluitend CSS-gradients met vastgelegde merktokens boven een expliciete effen ondergrond. Tekstcontrast is nooit afhankelijk van een decoratief effect.

## Kleurgebruik

Uitsluitend waarden uit `assets/brand/brand.json`:

| Token | Hex | Toepassing |
| --- | --- | --- |
| Artific Yellow | `#FFD602` | body, merkpodium, hero, bewijs, visie, organisatie, kaarten en primaire actie op navy |
| Deep Navy | `#042244` | hoofdtekst op geel, harde randen, platform, contact, footer en contrasterende kaarten |
| Wit | `#FFFFFF` | tekst op navy en enkele hoge-contrast kaarten |
| Light Blue | `#E5EDF8` | rustige bewijs-, security- en FC Twente-oppervlakken |
| Artific Blue | `#287CEB` | aanvullende diepte in uitsluitend goedgekeurde grote of decoratieve vlakken |

Het officiële lokale navy PNG-logo staat met minimaal 80px renderbreedte en ruime vrije ruimte op het effen gele `.brand-stage`-oppervlak. Het logo wordt niet gefilterd, getransformeerd of opnieuw getekend. Lopende tekst gebruikt navy op geel/lichtblauw en wit op navy. Focusringen zijn 3px navy op lichte vlakken en geel op navy.

## Spacing

De schaal is 8, 16, 24, 40, 64 en 96px. De routegutters lopen via `clamp(16px, 5vw, 72px)`. Tekst blijft meestal onder 68–72 tekens per regel; kaarten gebruiken minimaal 16px interne ruimte en groeien op grotere schermen naar 36–64px. Interactieve doelen zijn minimaal 44px hoog. Harde randen zijn meestal 3px; dominante kaders gebruiken 8–12px en canoniek gekleurde blokschaduwen.

## Visuele hiërarchie

- De H1 gebruikt een zware systeem-sans op `clamp(3rem, 10vw, 8.5rem)`, compacte regelafstand en maximaal 11ch.
- H2’s gebruiken `clamp(2.25rem, 6.5vw, 5.75rem)` en blijven onder 18ch.
- Kleine uppercase eyebrows benoemen steeds de functie van een veld zonder hoofdstuknummering.
- Het relatiedeck volgt direct op de hero en vormt de eerste grote informatiedrager.
- Bewijs staat bewust vóór de visie. Daarna verschuift de pagina naar de navy technische kern en keert terug naar geel voor governance, security, partners en begeleiding.
- Het navy contactslot sluit af met een groot decoratief `LET’S TALK`-veld en de twee officiële acties.

## Componentstijl

- **Merkpodium:** effen geel met navy logo, demoactie en een ongenummerde “Direct naar onderwerp”-strook.
- **Relatiedeck:** een begrensde horizontale snap-track met negen tekstkaarten. Varianten wisselen harde diagonale patronen, navy blokken en een lichtblauwe FC Twente-kaart af. De acht klantnamen en de volledige canonieke FC Twente-relatie staan ook als gewone HTML-tekst in de pagina.
- **Vraagkaarten:** grote witte en navy vlakken met hoekmarkering en blokschaduw; geen uniforme dashboardcards.
- **Controlelaag:** drie volle gestapelde banden tonen proces, Artific en modellen in één object. De kernband gebruikt witte tekst op Deep Navy; Artific Blue blijft beperkt tot rand en blokschaduw.
- **Moduleblokken:** drie verschillende vormen en verhoudingen; op breed scherm vullen ze één asymmetrisch twaalfkoloms veld, op klein scherm staan ze lineair. Ook de lopende tekst van Conversation Module staat wit op Deep Navy, met blauw uitsluitend als decoratieve rand en schaduw.
- **Portal/Headless:** een scherpe tweedeling met gedeelde gele rand.
- **Governance-mozaïek:** grote centrale-governancekaart, navy securitykaart en vier compacte safeguards.
- **Partnerrelay en begeleiding:** respectievelijk een driedelige overdracht en vijf massieve genummerde stappen.
- **CTA’s:** rechte 3px knoppen met sterk gewicht, minimaal 48px hoog en een korte blokschaduwrespons op hover.

## Motion

Alle inhoud is vóór initialisatie zichtbaar. CSS animeert alleen decoratieve achtergrondposities en kleine `translate`-accenten. JavaScript voegt korte Web Animations-transformentrees toe aan geselecteerde kaarten als `Element.animate()` beschikbaar is. Er wordt geen opacity, maat, positie in de layout of inhoudsweergave geanimeerd.

Het relatiedeck speelt nooit automatisch. JavaScript voegt alleen vorige/volgende-knoppen, actieve status, pijl/Home/End-bediening en een beleefde live-aankondiging toe. Aangevraagde en bevestigde index blijven tijdens programmatische navigatie gescheiden: tussenliggende scrollposities wijzigen status en `aria-current` niet, een snelle tweede actie bouwt voort op de laatst aangevraagde relatie en pas na `scrollend` of een rustige scrollframe wordt één status gecommit. Handmatig scrollen gebruikt dezelfde trackscroll als enige passieve bron. Normale bediening gebruikt smooth scroll; bij reduced motion wordt direct met `auto` gescrold en gecommit. Als de voorkeur tijdens een sessie wijzigt, worden eigen Web Animations geannuleerd. De CSS-mediaquery stopt animaties, transities en smooth scrolling.

## Responsief gedrag

Op 320px staan alle hoofdcomponenten in één kolom. De onderwerpstrook gebruikt twee links per rij, lange klantnamen breken veilig af en alleen de begrensde relatietrack scrolt horizontaal. Bij 700px ontstaan meervoudige bewijs-, vraag-, governance-, partner- en begeleidingsgrids. Vanaf 1080px worden de drie modules asymmetrisch over twaalf kolommen gezet en wordt het governance-mozaïek ruimer. Op 1440px blijft de inhoud begrensd rond 1120–1400px terwijl achtergronden de volle breedte gebruiken.

De track gebruikt `min-width: 0`, `overflow-x: auto`, scroll snapping en contained overscroll. Documenttekst gebruikt veilige woordafbreking. De route zelf hoort op 320, 768 en 1440px geen horizontale overflow te hebben.

## Toegankelijkheid en fallback

De serverresponse bevat één Nederlandse H1, alle secties, negen relatiedia’s, negen directe ankerlinks, beide CTA-types en mail-/telefoonlinks. Zonder JavaScript blijft de track focusbaar, horizontaal bedienbaar en volledig leesbaar. Ontbrekende `IntersectionObserver` of Web Animations verandert niets aan de inhoud.

De gegenereerde status gebruikt `aria-live="polite"` en `aria-atomic="true"`. De track reageert alleen wanneer hij focus heeft op Left, Right, Home en End. De onderwerpankers behouden bruikbare `scroll-margin-top`. Focus is overal zichtbaar en doelen zijn minimaal 44px. Reduced motion verbergt niets en verandert alleen beweging en scrollgedrag.

## Provenance

De actuele buildbronnen zijn `content/artific-content.nl.json` voor claims en CTA’s en `assets/brand/brand.json` voor kleuren, contrastparen, logo-uitvoeringen en logo-achtergronden. De lokale primaire merkdocumenten zijn uitsluitend via die vastgelegde merkbron als build- en auditbewijs gebruikt; de browser laadt ze niet. Klantnamen zijn tekst omdat de repository geen goedgekeurde klantlogo-assets bevat. De implementatie gebruikt geen externe componentruntime, netwerkcomponent of providerconfiguratie.
