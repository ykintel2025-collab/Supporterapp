# Amsterdams Supporters Fonds — PWA

Community-app voor het Amsterdams Supporters Fonds. Rood-zwarte huisstijl,
mobile-first, installeerbaar als PWA.

Gebouwd met Next.js 14 (App Router), TypeScript, Tailwind CSS en Firebase.
De app draait nu op voorbeelddata (`src/lib/mockData.ts`) zodat hij meteen
werkt — je kunt hem later koppelen aan Firestore via `src/lib/firebase.ts`.

## Wat zit erin

- **Home Feed** (`/`) — mededelingen, sociaal fonds-nieuws en sponsorposts
- **Sociaal Fonds** (`/sociaal-fonds`) — donatiedoelen met voortgangsbalken
- **Bestuur** (`/bestuur`) — moderatiedashboard om posts goed/af te keuren
- PWA-manifest + iconen, zodat de app op een telefoon "toegevoegd aan
  beginscherm" kan worden

## Stap 1 — Bestanden naar GitHub

Je repo (`Supporterapp`) is nu leeg op één `index.html` na. Zo upload je deze
map zonder terminal:

1. Ga naar je repo op GitHub → **Add file** → **Upload files**.
2. Sleep de hele inhoud van deze map (dus de mappen `src` en `public`, en de
   bestanden `package.json`, `next.config.js`, `tailwind.config.js`,
   `postcss.config.js`, `tsconfig.json`, `.gitignore`, `.env.local.example`
   en `README.md`) in het upload-vak. Chrome en Edge ondersteunen het
   uploaden van hele mappen via slepen.
3. Verwijder het losse oude `index.html` uit de repo als dat er nog staat
   (dat is niet meer nodig — Next.js genereert de pagina's).
4. Commit de wijzigingen direct op `main`.

## Stap 2 — Deployen op Vercel

1. Ga naar [vercel.com](https://vercel.com) → **Add New Project** → kies je
   `Supporterapp`-repo.
2. Vercel herkent automatisch dat het een Next.js-project is. Je hoeft niets
   aan te passen in de build-instellingen.
3. Voordat je op **Deploy** klikt: klap **Environment Variables** open en
   voeg de zes variabelen uit `.env.local.example` toe (namen exact
   overnemen, waarden uit je Firebase Console → Project settings → Algemeen
   → Je apps → SDK setup and configuration):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Klik **Deploy**. Na ongeveer een minuut krijg je een live URL
   (bijv. `supporterapp.vercel.app`).

Je hoeft nooit `npm install` of een terminal-commando zelf uit te voeren —
Vercel doet dat automatisch bij elke commit naar `main`.

## Stap 3 — Echte data via Firestore (optioneel, later)

De app werkt nu met voorbeelddata zodat je meteen iets werkends hebt. Zodra
je wilt overstappen op echte posts/donaties:

1. Maak in de Firebase Console een Firestore-database aan (starten in
   testmodus is prima om te beginnen).
2. Maak een collectie `posts` (velden: `type`, `title`, `content`, `author`,
   `date`, `approved`) en/of `donationGoals` (velden: `title`,
   `description`, `targetAmount`, `raisedAmount`).
3. Vervang in `src/app/page.tsx`, `src/app/sociaal-fonds/page.tsx` en
   `src/app/bestuur/page.tsx` de import van `mockData` door een
   `getDocs`-call op `db` (uit `src/lib/firebase.ts`).
4. Zet in de Bestuur-pagina de goedkeur/afwijs-knoppen om naar een
   `updateDoc`/`deleteDoc` op het bijbehorende Firestore-document.

## Lokaal testen (optioneel)

Alleen nodig als je zelf met een terminal wilt werken:

```bash
npm install
cp .env.local.example .env.local   # vul je eigen Firebase-waarden in
npm run dev
```

De app draait dan op http://localhost:3000.
