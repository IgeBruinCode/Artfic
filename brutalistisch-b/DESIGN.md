# Ontwerpdocument — Brutalistisch B: geel/navy-relatiedeck

Stijlgids voor `/brutalistisch-b/`. De pagina is een direct, hard en gelaagd Artific-landschap: geel als canvas, Deep Navy als constructie en een bewegend klantrelatiedeck dat direct in de intro laat zien met wie Artific werkt.

## Ontwerpprincipes

De compositie gebruikt een sticky merkpodium, een horizontaal relatiedeck, scherpe vraagkaarten, een gestapelde controlelaag, asymmetrische moduleblokken, een governance-mozaïek, partnerrelay en massieve begeleidingsstappen. De inhoudsvolgorde is `intro → bewijs → visie → platform → organisatie → contact`.

Geel is het dominante route-oppervlak. Navy bouwt het contactveld en geeft alle kritieke contrasten. Een lokale WebGL-mesh beweegt achter de hero; bij ontbreken daarvan blijft een rustig effen geel vlak staan. Tekstcontrast is nooit afhankelijk van een decoratief effect.

## Kleurgebruik

Uitsluitend waarden uit `assets/brand/brand.json`:

| Token | Hex | Toepassing |
| --- | --- | --- |
| Artific Yellow | `#FFD602` | body, merkpodium, hero, bewijs, visie, organisatie, kaarten en primaire actie op navy |
| Deep Navy | `#042244` | hoofdtekst op geel, harde randen, platform, contact, footer en contrasterende kaarten |
| Wit | `#FFFFFF` | tekst op navy, logo-platen en enkele hoge-contrast kaarten |
| Light Blue | `#E5EDF8` | rustige bewijs-, security- en FC Twente-oppervlakken |
| Artific Blue | `#287CEB` | voortgang, shaderdiepte, randen, schaduwen en decoratieve vlakken |

Het officiële lokale navy Artific-logo staat met minimaal 80px renderbreedte en ruime vrije ruimte op het effen gele merkpodium. Logo’s worden niet gefilterd of opnieuw getekend. Lopende tekst gebruikt navy op geel/lichtblauw en wit op navy. Focusringen zijn 3px navy op lichte vlakken en geel op navy.

## Spacing

De schaal is 8, 16, 24, 40, 64 en 96px. De routegutters lopen via `clamp(16px, 5vw, 72px)`. Tekst blijft meestal onder 68–72 tekens per regel; kaarten gebruiken minimaal 16px interne ruimte. Interactieve doelen zijn minimaal 44px hoog. Harde randen zijn meestal 3px; dominante kaders gebruiken 8–12px en blokschaduwen.

## Visuele hiërarchie

- De H1 gebruikt een zware systeem-sans, compacte regelafstand en maximaal 11ch.
- Kleine uppercase eyebrows benoemen de functie van elk veld zonder hoofdstuknummering.
- Het relatiedeck volgt direct op de hero; FC Twente staat als eerste relatie en de acht overige organisaties volgen daarna.
- Bewijs staat vóór de visie. Twee tegengestelde driehoeken verbinden het gele visieveld met het wit/lichtblauwe platformveld; navy tekent de gezamenlijke punt en lichtblauw loopt achter beide vormen door. Geel blijft als gericht accent in de controlelaag en kaarten aanwezig.
- Het navy contactslot sluit af met een groot decoratief verticaal `LET’S TALK`-veld. De apostrof is in die stand 90 graden gedraaid.

## Componentstijl

- **Merkpodium:** sticky bovenrand met Artific-logo, demoactie, compact gecentreerde onderwerpstrook, actieve sectiestatus en blauwe leesvoortgang. Op mobiel blijft de strook horizontaal scrollbaar.
- **Hero:** het lokale WebGL-kleurveld en de CSS-fallback vormen zonder extra cirkelobject de zichtbare geanimeerde achtergrond. De lokale AI Company of the Year-badge staat groot in de vrijgekomen rechterkolom boven de platformkenmerken.
- **Relatiedeck:** begrensde horizontale snap-track met negen rustige lichtblauwe kaarten, lokale logo’s op witte vlakken en directe klantnamen. FC Twente opent het deck. Pauzeerbare autoplay, handmatige knoppen, paginatie en toetsenbordbediening vullen native horizontaal scrollen aan.
- **Klantbeoordelingen:** zes volledige, canonieke beoordelingen staan met hun lokale portretten in het bewijsdeel.
- **Platformveld:** een rustig lichtblauw circuitveld met blauwe lijnen en knooppunten sluit via twee in elkaar grijpende driehoeken, een witte wig en een navy diagonale scheidslijn aan op het visieveld.
- **Vraagkaarten:** grote witte en navy vlakken met hoekmarkering en blokschaduw.
- **Controlelaag:** drie volle gestapelde banden tonen proces, Artific en modellen in één object.
- **Moduleblokken:** drie even brede vierkolomsblokken op desktop. Daardoor heeft Conversation Module voldoende tekstbreedte; verticale offsets bewaren het asymmetrische ritme.
- **Portal/Headless, governance en begeleiding:** scherpe tweedelingen, uiteenlopende kaartformaten en massieve genummerde stappen voorkomen een uniform dashboardbeeld.
- **CTA’s:** rechte 3px knoppen met sterk gewicht, minimaal 48px hoog en een korte blokschaduwrespons bij indrukken.

## Motion

Alle inhoud staat in de serverresponse en blijft zonder JavaScript zichtbaar. De lokale GSAP Core-runtime wordt met `defer` parallel aan `main.js` geladen. Een korte GSAP-timeline choreografeert bij laden eerst merk, H1 en hero-details. Daarna activeert één gedeelde `IntersectionObserver` de gemaskeerde kopwoorden en kaartposes uitsluitend wanneer ze in beeld komen. De tweens gebruiken alleen GSAP-transformaliases en opacity; `will-change` wordt bij aanvang gezet en na voltooiing gewist. De layout zelf verspringt niet.

Achtergrondvelden en kleine stempels hebben rustige lussen, maar een tweede observer pauzeert ze buiten beeld. De WebGL-mesh reageert subtiel op de aanwijzer, tekent maximaal 40 frames per seconde, gebruikt op mobiel een lagere pixelratio en pauzeert buiten beeld of in een verborgen tab. Het platformcircuit beweegt via een compositorvriendelijke transform; de diagonale kleurvlakken blijven stabiel.

Het relatiedeck wisselt in beeld rustig om de 4,2 seconden en biedt een expliciete pauze-/afspeelknop naast vorige/volgende, actieve status, pijl/Home/End-bediening en een beleefde live-aankondiging. De beweging gebruikt uitsluitend de horizontale scrollpositie van de track en kan daardoor nooit de documentpositie veranderen. Buiten beeld en bij reduced motion stopt autoplay. `gsap.matchMedia()` ruimt de normale timelines op en zet alle elementen direct in hun zichtbare eindstaat. De CSS-mediaquery stopt daarnaast decoratieve animaties en transities; de shaderloop schakelt zichzelf uit.

## Responsief gedrag

Op 320px staan hoofdcomponenten in één kolom en scrolt de onderwerpstrook binnen zijn eigen begrenzing. De relatietrack blijft het tweede bewuste horizontale scrolloppervlak. Bij 700px ontstaan meervoudige bewijs-, vraag-, governance-, partner- en begeleidingsgrids. Vanaf 1080px vullen de drie modules elk vier kolommen van het twaalfkoloms veld. Op 1440px blijft de inhoud begrensd terwijl achtergronden de volle breedte gebruiken.

Decoratieve transforms worden aan de paginarand geclipt; de route heeft op 320, 405, 768 en 1440px geen horizontale documentoverflow. Lange namen breken veilig af en de logo’s schalen binnen hun vaste platen.

## Toegankelijkheid en fallback

De serverresponse bevat één Nederlandse H1, alle secties, negen relaties, negen directe decklinks, beide CTA-types en mail-/telefoonlinks. Zonder JavaScript blijft de track focusbaar, horizontaal bedienbaar en volledig leesbaar. Zonder WebGL blijft de CSS-achtergrond zichtbaar. Ontbrekende `IntersectionObserver` houdt alle inhoud in de zichtbare eindstaat.

De gegenereerde status gebruikt `aria-live="polite"` en `aria-atomic="true"`. De track reageert alleen op navigatietoetsen wanneer hij focus heeft. De onderwerpankers hebben sticky-headercompensatie. Focus is overal zichtbaar en doelen zijn minimaal 44px.

## Provenance

De buildbronnen zijn `content/artific-content.nl.json` voor claims en CTA’s en `assets/brand/brand.json` voor kleuren, contrastparen en Artific-logo-uitvoeringen. De negen klantlogo’s staan lokaal in `assets/clients/`; `assets/clients/README.md` noteert per bestand de officiële publieke bron. De lokale GSAP-distributie en licentieverwijzing staan in `assets/vendor/`. De browser laadt geen externe componentruntime, lettertype, afbeelding of providerconfiguratie.
