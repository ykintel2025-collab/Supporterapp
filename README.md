# Amsterdams Supporters Fonds — PWA (v2)

Community-app voor het Amsterdams Supporters Fonds. Rood-zwarte huisstijl,
mobile-first, installeerbaar als PWA. Gebouwd met Next.js 14 (App Router),
TypeScript, Tailwind CSS, Firebase (Auth + Firestore) en Cloudinary
(foto/video-opslag) — allemaal op gratis plannen, geen creditcard nodig.

## Wat is er nieuw in deze versie

De vorige versie draaide volledig op nepdata en had geen accounts. Dit is nu
een echte werkende app:

- **Ledenregistratie** (`/registreren`) en **inloggen** (`/login`) via
  Firebase Auth.
- **Facebook-achtige feed** op de homepage: ingelogde leden kunnen tekst,
  foto's én video's posten. Andere leden zien dit direct (realtime), kunnen
  "vind ik leuk" geven, en de auteur (of een bestuurslid) kan een post
  verwijderen.
- **Bestuur-dashboard** (`/bestuur`, alleen zichtbaar voor leden met rol
  "bestuur"): ledenlijst met de mogelijkheid iemand bestuurslid te maken.
  Posts modereren doe je met de "Verwijderen"-knop die bestuursleden bij elk
  bericht in de feed zien.
- Moderner, donkerder ontwerp: kaarten met avatars, relatieve tijdsaanduiding
  ("3 uur geleden"), duidelijkere hiërarchie.

**Nog niet inbegrepen (bewust, fase 2):** webshop en betalingen
(lidmaatschap/merchandise/donaties via bijvoorbeeld Stripe of Mollie). Dat
is een apart traject omdat het jouw keuzes vraagt (producten, prijzen, een
betaalprovider) — pak dit op zodra de basis hieronder live en stabiel draait.

## Waarom Cloudinary in plaats van Firebase Storage

Firebase Storage vereist sinds eind 2024 een gekoppelde betaalmethode (het
Blaze-plan), ook als je binnen de gratis grenzen blijft. Om dat te
vermijden, gaan foto/video-uploads nu via **Cloudinary**: een gratis plan
zonder creditcard, met 25 credits per maand (1 credit ≈ 1GB opslag, 1GB
bandbreedte, of 1000 bewerkingen) — ruim voldoende om mee te beginnen.
Firebase blijft op het gratis Spark-plan voor Auth en Firestore.
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
2. **Firestore Database** → **Create database** → kies een regio dichtbij
   (bijv. `eur3 (europe-west)`) → start in **productiemodus**.
   Ga daarna naar tab **Rules**, plak de inhoud van
   `firebase-rules/firestore.rules` uit deze map, en klik **Publiceren**.
3. Ga naar **Project settings** (tandwiel) → **Algemeen** → **Je apps** →
   noteer de waarden onder "SDK setup and configuration" (`apiKey`,
   `authDomain`, `messagingSenderId`, `appId`). Je hebt ze nodig in stap 3.

## Stap 2 — Cloudinary inrichten (foto/video-uploads)

1. Maak een gratis account op [cloudinary.com](https://cloudinary.com)
   (geen creditcard nodig).
2. Op je dashboard zie je direct je **Cloud name** rechtsboven — noteer die.
3. Ga naar **Settings** (tandwiel) → tab **Upload** → sectie **Upload
   presets** → **Add upload preset**.
4. Zet **Signing Mode** op **Unsigned**. Geef de preset een naam, bijv.
   `supporterapp_unsigned` (moet exact overeenkomen met de env-variabele in
   stap 3). Optioneel maar aan te raden: beperk onder "Upload Manipulations"
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
variabelen worden pas actief na een nieuwe build). Als dit je eerste
deployment is, importeer het project zoals eerder (Vercel herkent Next.js
automatisch) en vul de variabelen in vóór je op **Deploy** klikt.

## Stap 5 — Jezelf bestuurslid maken

Nieuwe accounts krijgen automatisch de rol "lid". Om zelf bij `/bestuur` te
kunnen (en andere leden te kunnen promoveren), moet je jezelf één keer
handmatig promoveren:

1. Registreer je eigen account via `/registreren` op je live site.
2. Ga in de Firebase Console naar **Firestore Database** → collectie
   `users` → open het document met jouw naam/e-mail.
3. Wijzig het veld `role` van `"lid"` naar `"bestuur"` → **Bijwerken**.
4. Herlaad de app — je ziet nu "Bestuur" in het menu, en kunt daar andere
   leden promoveren (dus dit hoeft nooit meer handmatig via Firestore).

## Lokaal testen (optioneel)

```bash
npm install
cp .env.local.example .env.local   # vul je eigen Firebase- en Cloudinary-waarden in
npm run dev
```

De app draait dan op http://localhost:3000.

## Fase 2 — Webshop & monetization (later)

Je gaf aan uiteindelijk lidmaatschap, webshop-verkoop én donaties te willen.
Concreet volgt dit later, in losse stappen zodra de basis hierboven stabiel
draait:

1. **Betaalprovider kiezen** (bijv. Stripe of Mollie — Mollie is populair
   in Nederland en ondersteunt iDEAL rechtstreeks).
2. **Producten/lidmaatschappen** vastleggen in Firestore (naam, prijs,
   voorraad indien van toepassing).
3. **Checkout-flow** bouwen die via de provider een betaling start en het
   resultaat terugkoppelt (webhook) naar Firestore, bijvoorbeeld om een
   lidmaatschap te activeren of een donatie aan een Sociaal Fonds-doel toe
   te voegen.
4. **Media echt verwijderen bij het weghalen van een post** — vereist een
   kleine backend-functie (bijv. een Vercel API route) die met je
   Cloudinary API-secret een verwijderverzoek doet; dat secret mag nooit in
   de browser-code staan.

Dit vraagt eerst een besluit van jouw kant (welke provider, welke
producten/prijzen) — laat het weten zodra je zover bent, dan bouwen we dat
gericht.
