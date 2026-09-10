# Amsterdams Supporters Fonds — PWA (v5)

Community-app voor het Amsterdams Supporters Fonds. Wit met rood-zwarte
huisstijl-accenten, mobile-first, installeerbaar als PWA. Gebouwd met
Next.js 14 (App Router), TypeScript, Tailwind CSS, Firebase (Auth +
Firestore) en Cloudinary (foto/video-opslag) — allemaal op gratis plannen,
geen creditcard nodig.

## Wat is er nieuw in deze versie

Dit is de grote uitbreiding: goedkeuring van leden en berichten,
e-mailverificatie, een volwaardig bestuur-dashboard, "Voor Elkaar" (het
voormalige Sociaal Fonds) vast bovenaan de homepage, ledenprofielen met een
ledenoverzicht, en onderlinge privéberichten.

- **Wachtwoord vergeten**: op `/login` staat nu een link "Wachtwoord
  vergeten?" die (via Firebase Auth) een reset-mail stuurt naar het
  ingevulde e-mailadres, met een link om een nieuw wachtwoord in te stellen.
- **E-mailverificatie**: bij registratie sturen we automatisch een
  bevestigingsmail (via Firebase Auth). Het bestuur ziet bij elke
  aanmelding of de e-mail al bevestigd is, als hulpmiddel — goedkeuren kan
  het bestuur altijd, ook als de e-mail nog niet bevestigd is (bijvoorbeeld
  omdat je iemand persoonlijk kent en zeker weet dat het goed zit).
- **Ledengoedkeuring**: nieuwe leden kunnen inloggen, maar kunnen pas iets
  posten nadat het bestuur ze heeft goedgekeurd. Zolang dat niet is gebeurd,
  ziet het lid een duidelijke statusmelding in plaats van het plaatsformulier.
- **Berichten-moderatiequeue**: elk nieuw bericht komt eerst binnen met
  status "in wachtrij" en is nog niet zichtbaar in de feed. Pas als het
  bestuur het goedkeurt, verschijnt het voor iedereen.
- **Compleet bestuur-dashboard** (`/bestuur`) met drie tabbladen:
  - **Aanmeldingen** — nieuwe leden goedkeuren of afwijzen (met zichtbare
    e-mailverificatiestatus, met goedkeuren/afwijzen — bevestiging is een
    hulpmiddel, geen harde eis).
  - **Berichten** — de wachtrij met nog te beoordelen posts, inclusief
    media-voorbeeld, met goedkeuren/afwijzen.
  - **Leden** — alle goedgekeurde leden, met de mogelijkheid iemand
    bestuurslid te maken (of terug te zetten naar gewoon lid).
- **"Bestuursaccount"-concept opgelost via rollen, niet via een gedeeld
  account**: in plaats van één gedeeld inlogaccount voor het bestuur, kan
  elk bestuurslid gewoon met zijn eigen account inloggen en posten. Wie de
  rol "bestuur" heeft (toegekend via het tabblad Leden), kan bij het
  plaatsen van een bericht het vinkje "Plaatsen als officieel
  bestuursbericht" aanzetten — dat bericht krijgt dan een duidelijke
  "Bestuur"-badge naast de eigen naam. Zo blijft altijd zichtbaar wíe er
  namens het bestuur spreekt, en kunnen meerdere mensen samen het bestuur
  vormen zonder wachtwoorden te hoeven delen.
- **"Voor Elkaar" (voorheen Sociaal Fonds), vastgeplakt bovenaan de
  homepage**: het onderdeel heeft een nieuwe naam gekregen die past bij het
  doel — elkaar helpen, er voor elkaar zijn — en staat niet meer op een
  aparte, makkelijk te missen pagina. In plaats daarvan blijft het als
  balk vastgeplakt (sticky) bovenaan de Home Feed, met het totaalbedrag en
  een voortgangsbalk. Een klik op de balk klapt een dropdown open met alle
  lopende acties en hun individuele voortgang, direct in de feed — geen
  aparte pagina meer nodig om te zien waar de donaties naartoe gaan. De
  volledige pagina blijft ook bestaan op `/voor-elkaar` voor wie liever
  even goed leest.
- **Ledenprofielen** (`/profiel` om je eigen profiel te bewerken: naam, "over
  mij" en een profielfoto) en een **ledenoverzicht** (`/leden`, met een
  profielpagina per lid op `/leden/[id]`) — zo vindt de community elkaar
  terug, vergelijkbaar met Facebook maar bewust eenvoudiger.
- **Onderlinge berichten (DM)**: via een ledenprofiel kun je op "Stuur
  bericht" klikken om een privégesprek te starten. Alle gesprekken staan
  overzichtelijk in de inbox op `/berichten`.
- **In-app meldingen (badges)**: bij "Berichten" in de menubalk zie je een
  rood bolletje met het aantal ongelezen gesprekken; ongelezen gesprekken
  staan ook vetgedrukt met een rode stip in de inbox zelf. Bij "Bestuur"
  zie je het totaal aantal openstaande aanmeldingen + berichten in de
  wachtrij, zodat je ook zonder het dashboard te openen ziet dat er iets op
  je wacht. Dit werkt zolang de app open is (realtime, geen actie nodig) —
  het zijn bewust géén push-meldingen die ook binnenkomen als de app dicht
  is; dat vereist een Firebase Blaze-plan (zie hieronder).
- **WhatsApp-notificaties**: bewust nog niet gebouwd. De officiële WhatsApp
  Business Groups API laat een app alleen eigen, nieuwe groepen aanmaken en
  beheren (max. 8 leden, met kosten per bericht) — niet automatisch posten
  in een bestaande WhatsApp-groep van de club. Mocht je dit later alsnog
  willen, dan is de meest haalbare route een WhatsApp-kanaal (Channel) of
  een korte handmatige melding; laat het weten als je dit wilt uitwerken.
- **Sponsorbanners**: nieuw tabblad **Bestuur → Sponsoren** om bedrijven toe
  te voegen (naam, logo, link). Actieve sponsoren verschijnen als klikbare
  banner onderaan de Home Feed. De betaling met de sponsor (bijv. een
  factuur) regelt het bestuur zelf buiten de app om — dit onderdeel gaat
  alleen over de zichtbaarheid in de app.
- **Lidmaatschapsbijdrage (handmatig, voorlopig)**: nieuwe leden zien bij
  registratie de bijdrage (nu €12/jaar, in te stellen in
  `src/lib/config.ts`) én betaalinstructies. **Pas die instructies aan** met
  je eigen IBAN of Tikkie-link, ze staan nu op een placeholder-tekst. Zodra
  iemand heeft betaald, zet het bestuur dat handmatig op "betaald" bij
  **Bestuur → Aanmeldingen** of **Leden** — er is nog geen automatische
  incasso/koppeling, dat komt zodra er een betaalprovider gekozen is (zie
  Fase 2 hieronder). Dit blokkeert bewust niet de mogelijkheid om te posten
  — dat blijft alleen gekoppeld aan bestuurlijke goedkeuring.
- **Bugfix — Firestore-rules gehard**: een tweede testaccount kreeg de
  melding "Kan berichten niet laden" bij het openen van de Home Feed. Oorzaak:
  de beveiligingsregels lazen een veld rechtstreeks uit dat op oudere
  testberichten kon ontbreken, wat de hele regel deed vastlopen in plaats
  van gewoon "nee" terug te geven. Alle regels gebruiken nu een veilige
  `.get(veld, standaardwaarde)`-toegang, en de foutmelding in de Feed toont
  voortaan ook de exacte Firestore-foutcode, zodat een volgend probleem
  sneller te vinden is. **Dit vereist opnieuw publiceren van de Firestore-
  rules** (zie Stap 1 hieronder).

**Nog niet inbegrepen (bewust, fase 2):** webshop en betalingen
(lidmaatschap/merchandise/donaties via bijvoorbeeld Stripe of Mollie), zie
onderaan dit document.

## Belangrijk: publiceer de nieuwe Firestore-rules opnieuw

De regels in `firebase-rules/firestore.rules` zijn aangepast voor
goedkeuring, berichtmoderatie en privéberichten. Als je al een eerdere
versie had gepubliceerd, **moet je dit opnieuw doen**, anders werken de
nieuwe functies niet (of geeft Firestore "Missing or insufficient
permissions"):

1. Firebase Console → **Firestore Database** → tab **Rules**.
2. Plak de volledige inhoud van `firebase-rules/firestore.rules` uit deze
   map (overschrijf alles wat er stond).
3. Klik **Publiceren**.

## Hoe het bestuur nu ontstaat (geen handmatige Firestore-stap meer)

Zodra de eerste persoon zich registreert, e-mail bevestigt én inlogt, wordt
diegene automatisch bestuurslid én goedgekeurd — je hoeft dus nooit meer
zelf in de Firebase Console een rol te wijzigen. Daarna kan dat
bestuurslid via **Bestuur → Leden** andere leden ook bestuurslid maken. Dit
kan maar één keer automatisch gebeuren: zodra er één bestuurslid bestaat,
kan niemand zichzelf meer promoveren — dat gaat vanaf dan altijd via een
bestaand bestuurslid.

## Hoe de goedkeuringsflow werkt, stap voor stap

1. Iemand registreert via `/registreren` → krijgt een bevestigingsmail.
2. Diegene klikt op de link in die mail (checkt zelf de inbox/spam).
3. Terug in de app klikt diegene op "Ik heb bevestigd, vernieuw" (te zien
   zodra je iets probeert te posten zonder bevestigde e-mail).
4. Het bestuur ziet de aanmelding in **Bestuur → Aanmeldingen**, mét de
   status van de e-mailverificatie, en klikt op **Goedkeuren** of
   **Afwijzen** — bevestiging is zichtbaar als hulpmiddel, maar hoeft niet
   afgewacht te worden.
5. Pas na goedkeuring kan het lid daadwerkelijk iets posten. Elk bericht
   komt vervolgens nog een keer in de wachtrij terecht op **Bestuur →
   Berichten**, voor die laatste controle voordat het zichtbaar wordt voor
   de hele community.

## Waarom Cloudinary in plaats van Firebase Storage

Firebase Storage vereist sinds eind 2024 een gekoppelde betaalmethode (het
Blaze-plan), ook als je binnen de gratis grenzen blijft. Om dat te
vermijden, gaan foto/video-uploads (posts én profielfoto's) via
**Cloudinary**: een gratis plan zonder creditcard, met 25 credits per maand
(1 credit ≈ 1GB opslag, 1GB bandbreedte, of 1000 bewerkingen) — ruim
voldoende om mee te beginnen. Firebase blijft op het gratis Spark-plan voor
Auth en Firestore.
([Bron: Cloudinary free-plan documentatie](https://cloudinary.com/documentation/developer_onboarding_faq_free_plan),
[Cloudinary pricing](https://cloudinary.com/pricing))

Beperking om te weten: als je een bericht verwijdert, verdwijnt het uit de
feed, maar het bestand zelf blijft (onschadelijk) in je Cloudinary-account
staan — dat écht verwijderen vereist een backend-stapje dat we in fase 2
kunnen toevoegen als het nodig blijkt.

## Stap 1 — Firebase inrichten (Auth + Firestore)

In de [Firebase Console](https://console.firebase.google.com) voor je
project `amsterdams-supporters-fonds`:

1. **Authentication** → **Get started** → tab **Sign-in method** → zet
   **E-mail/wachtwoord** aan.
2. **Firestore Database** → **Create database** (als dat nog niet is
   gedaan) → kies een regio dichtbij (bijv. `eur3 (europe-west)`) → start in
   **productiemodus**. Ga daarna naar tab **Rules**, plak de inhoud van
   `firebase-rules/firestore.rules` uit deze map, en klik **Publiceren**
   (zie ook de aparte sectie hierboven als je dit al eerder deed).
3. Ga naar **Project settings** (tandwiel) → **Algemeen** → **Je apps** →
   noteer de waarden onder "SDK setup and configuration" (`apiKey`,
   `authDomain`, `projectId`, `messagingSenderId`, `appId`). Je hebt ze
   nodig in Stap 4.

## Stap 2 — Cloudinary inrichten (foto/video-uploads)

1. Maak een gratis account op [cloudinary.com](https://cloudinary.com)
   (geen creditcard nodig).
2. Op je dashboard zie je direct je **Cloud name** rechtsboven — noteer die.
3. Ga naar **Settings** (tandwiel) → tab **Upload** → sectie **Upload
   presets** → **Add upload preset**.
4. Zet **Signing Mode** op **Unsigned**. Geef de preset een naam, bijv.
   `supporterapp_unsigned` (moet exact overeenkomen met de env-variabele in
   Stap 4). Optioneel maar aan te raden: beperk onder "Upload Manipulations"
   het bestandstype tot afbeeldingen/video en stel een maximale
   bestandsgrootte in. Klik **Save**.

## Stap 3 — Bestanden naar GitHub

1. Ga naar je repo op GitHub → **Add file** → **Upload files**.
2. Sleep de hele inhoud van deze map erin (de mappen `src`, `public` en
   `firebase-rules`, plus alle losse bestanden zoals `package.json` en dit
   `README.md`). Bestaande bestanden met dezelfde naam worden overschreven.
3. Commit direct op `main`.

## Stap 4 — Environment variables in Vercel

Ga naar je project op [vercel.com](https://vercel.com) → **Settings** →
**Environment Variables** en zorg dat deze staan:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (uit Stap 2.2)
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (uit Stap 2.4, bijv.
  `supporterapp_unsigned`)

Na het toevoegen/wijzigen van environment variables: ga naar tab
**Deployments** → meest recente deployment → **Redeploy** (nieuwe
variabelen worden pas actief na een nieuwe build; als die knop er niet is,
werkt een kleine extra commit — bijv. in dit README — ook als trigger).

## Stap 5 — Zelf beginnen

1. Ga naar je live site en registreer je eigen account via `/registreren`.
2. Bevestig je e-mail via de link die je ontvangt.
3. Log in — omdat jij de eerste bent, word je automatisch bestuurslid én
   goedgekeurd (zie hierboven). Je ziet nu "Bestuur" in het menu.
4. Vanaf hier regel je alles verder via de app zelf: nieuwe leden
   goedkeuren, hun berichten beoordelen, en zo nodig anderen ook
   bestuurslid maken via **Bestuur → Leden**.

## Lokaal testen (optioneel)

```bash
npm install
cp .env.local.example .env.local   # vul je eigen Firebase- en Cloudinary-waarden in
npm run dev
```

De app draait dan op http://localhost:3000.

## Fase 2 — Webshop & betalingen (later)

Je gaf aan uiteindelijk lidmaatschap, webshop-verkoop (merchandise/kleding)
én donaties online te willen kunnen afrekenen. Er is nog geen betaalprovider
gekozen en nog geen zakelijk account daarvoor geregeld — daarom is dit nog
niet gebouwd, maar wel al voorbereid: de lidmaatschapsbijdrage wordt nu al
per lid bijgehouden (zie hierboven, handmatig door het bestuur af te vinken)
zodat er straks alleen een echte betaalstap achter hoeft te komen, in plaats
van het hele stuk vanaf nul te bouwen.

Concreet, in losse stappen zodra je zover bent:

1. **Betaalprovider kiezen** (bijv. Stripe of Mollie — Mollie is populair
   in Nederland en ondersteunt iDEAL rechtstreeks) en een zakelijk account
   daar aanmaken (vaak is een KVK-inschrijving nodig).
2. **Producten/lidmaatschappen** vastleggen in Firestore (naam, prijs,
   voorraad indien van toepassing — voor de webshop is merchandise/kleding
   het startpunt), en de donatiedoelen van "Voor Elkaar" (nu nog
   voorbeelddata) vervangen door een echte Firestore-collectie die het
   bestuur zelf kan beheren.
3. **Checkout-flow** bouwen die via de provider een betaling start. De
   bevestiging (webhook) vangen we op met een **Vercel API-route** (gratis,
   geen Firebase Cloud Functions/Blaze-plan nodig) die vervolgens Firestore
   bijwerkt — bijv. `membershipPaid: true` zetten, een lidmaatschap
   activeren, of een donatie aan een "Voor Elkaar"-actie toevoegen.
4. **Media echt verwijderen bij het weghalen van een post** — vereist een
   kleine backend-functie (ook als Vercel API-route te bouwen) die met je
   Cloudinary API-secret een verwijderverzoek doet; dat secret mag nooit in
   de browser-code staan.

Laat het weten zodra je een betaalprovider en zakelijk account hebt, dan
pakken we dit gericht op.
