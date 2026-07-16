# QA-log — setstatus en herbouw Brutalistisch B

Actuele hercontrole: **2026-07-17**. De vijf vaste routes en rootkeuze zijn automatisch gevalideerd. `/brutalistisch-b/` is daarnaast lokaal gerenderd en interactief getest met headless Chromium/CDP en de browser-sidecar tegen `node scripts/serve.mjs 4277`. De vier zustervarianten zijn niet gewijzigd; hun eerdere detailmetingen blijven in hun eigen ontwerp- en QA-documentatie staan.

## Route- en setcontract

- De root bevat exact vijf gelijkwaardige keuzes met de vaste hrefs.
- De Brutalistisch B-keuze noemt nu het dominante geel/navy-relatiedeck en geen vervallen redactioneel concept.
- Alle vijf routes bevatten één H1, de gedeelde kernclaims en beide officiële CTA-types.
- `validate-site.mjs` draaide de contentvalidator en alle vijf variantvalidators succesvol.
- De unieke class `relationship-deck` komt alleen voor op Brutalistisch B.

## Responsieve matrix

| Route | 320px | 768px | 1440px | Actuele status |
| --- | --- | --- | --- | --- |
| `/` | — | — | — | Automatische root-, route-, kleur- en assetcontracten geslaagd; implementatie ongewijzigd |
| `/minimalistisch/` | — | — | visueel vergeleken | Rustige witte editorial blijft ongewijzigd en duidelijk anders dan B |
| `/brutalistisch-a/` | — | — | visueel vergeleken | Donkere operationele blauwdruk blijft ongewijzigd en duidelijk anders dan B |
| `/brutalistisch-b/` | ✓ | ✓ | ✓ | 320px: document 320/320; 768px: 753/768; 1440px: 1425/1440 (document/innerWidth, laatste twee inclusief 15px scrollbar), dus geen horizontale uitloop |
| `/conventioneel/` | — | — | visueel vergeleken | Lichte afgeronde SaaS-opbouw blijft ongewijzigd en duidelijk anders dan B |
| `/premium/` | — | — | visueel vergeleken | Navy dossiercompositie blijft ongewijzigd en duidelijk anders dan B |

Op B mat de eigen relatietrack respectievelijk 246/2360, 624/5796 en 1203/6608px (client/scrollWidth). Horizontale scroll blijft daarmee bewust binnen de track; de pagina zelf loopt niet uit. Screenshots bevestigden het navy logo op geel, het dominante gele canvas, harde navy kaders, gelaagde shadercirkels en een asymmetrische hero op alle drie breedtes.

## Brutalistisch B: inhoud en bediening

De gerenderde route bevatte exact de secties `intro → bewijs → visie → platform → organisatie → contact`, negen zelfstandige relaties en de volledige canonieke FC Twente-zin. De browser las alle lange namen zonder klantbeelden. Vijf CTA’s hadden exact de officiële labels en bestemming `https://artific.nl/contact-opnemen/`; de mailto- en tel-links bleven bruikbaar. Computed styles op 320px bevestigden normale tekst in de control-stack en Conversation Module als wit op Deep Navy; Artific Blue blijft daar decoratieve rand/schaduw.

In Chromium werkte de progressieve bediening als volgt:

- live-status startte met `Relatie 1 van 9: Basic-Fit`;
- een sprong naar relatie 7 plus een onmiddellijke “Volgende” hield status en `aria-current` tijdens smooth scroll stabiel op Basic-Fit;
- dertig samples om de 30ms bevatten alleen Basic-Fit en de eenmaal bevestigde eindstatus `Relatie 8 van 9: Vechtsteden Notarissen`, zonder tussenliggende aankondigingen;
- de track behield browserfocus; `End` committe na de lange beweging alleen FC Twente en `Home` keerde na settle terug naar Basic-Fit;
- de VM-test bevestigde daarnaast veilige wrap en handmatige scrollsettling vanuit één passieve scrollbron;
- een gefocuste onderwerplink rapporteerde een 3px solid outline;
- directe lokale opens van `#platform` en `#contact` behielden het juiste doel.

## Fallback, motion en netwerk

| Scenario op B | Resultaat |
| --- | --- |
| Normaal | Twee knoppen en een beleefde live-status toegevoegd; inhoud was vooraf zichtbaar |
| Reduced motion vóór laden | Mediaquery actief, nul actieve animaties; H1, negen dia’s, zes secties en vijf CTA’s aanwezig |
| JavaScript uit vóór laden | H1, negen dia’s, negen directe ankerlinks, zes secties en vijf CTA’s aanwezig; alleen de gegenereerde knoppen ontbraken |
| Optionele browser-API ontbreekt | Dependency-vrije VM-test initialiseert zonder `IntersectionObserver`; bediening blijft werken |
| Reduced motion tijdens sessie | Echte CDP-omschakeling zette de mediaquery op `true`; de volgende deckactie gebruikte `auto` en kondigde Eneco correct aan. De VM-test bevestigt aanvullend annulering van eigen Web Animations |

De gemeten resource-lijst van B bevatte uitsluitend lokale `styles.css`, `main.js` en `artific-logo-navy.png`. Er waren geen CDN-, PDF-, klantasset- of runtimecomponentrequests.

## Visuele vergelijking

Nieuwe 1440px-screenshots van alle vijf varianten zijn naast elkaar beoordeeld. Minimalistisch blijft wit en rustig; Brutalistisch A gebruikt een zwarte operationele plaat; Conventioneel toont een lichte afgeronde trustconsole; Premium is een donker navy dossier. Brutalistisch B is als enige geel-dominant, opent met een groot navy woordmerk, gebruikt harde onderwerpknoppen, shadercirkels en het horizontale relatiedeck. Het oude redactionele uiterlijk is niet teruggekeerd.

## Automatische controles

Geslaagd:

- `node --check brutalistisch-b/main.js`
- `node --check scripts/validate-brutalistisch-b.mjs`
- `node --check scripts/validate-site.mjs`
- `node scripts/validate-content.mjs`
- `node scripts/validate-minimalistisch.mjs`
- `node scripts/validate-brutalistisch-a.mjs`
- `node scripts/validate-brutalistisch-b.mjs`
- `node scripts/validate-conventioneel.mjs`
- `node scripts/validate-premium.mjs`
- `node scripts/validate-site.mjs`
- `git diff --check`

Teruggedraaide mutaties voor een door specificity terugvallende gele control-stack en wit-op-Artific-Blue in Conversation Module faalden gericht op de cascade-/contrastgates. De VM-regressietest dekt een oude/intermediaire scrollupdate tijdens een niet-aangrenzende programmatische actie en een snelle vervolgaanvraag.

De browser-sidecar zelf draaide Lightpanda en kon geen screenshot exporteren; screenshots en layoutmetingen zijn daarom met de lokaal aanwezige headless Chromium uitgevoerd.
