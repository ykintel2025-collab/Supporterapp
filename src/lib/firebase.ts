// Firebase-configuratie voor Amsterdams Supporters Fonds.
//
// Belangrijk: de waarden komen uit environment variables (NEXT_PUBLIC_...),
// niet hardcoded, zodat je dezelfde code kunt gebruiken op je laptop en op Vercel.
// Zet de waarden lokaal in ".env.local" (zie .env.local.example) en op Vercel
// onder Project Settings > Environment Variables.
//
// We gebruiken hier alleen Auth en Firestore (beide gratis op het Spark-
// plan). Foto/video-uploads lopen via Cloudinary (zie src/lib/cloudinary.ts),
// zodat je geen betaald Firebase-plan nodig hebt.
//
// De initialisatie staat in een try/catch: als er een environment variable
// ontbreekt of fout is (bijv. vergeten in te vullen op Vercel), crasht de
// hele app niet met een onduidelijke serverfout — in plaats daarvan tonen
// de pagina's een begrijpelijke melding (zie AuthContext.tsx en Feed.tsx).

import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let firebaseConfigError: string | null = null;

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Ontbrekende Firebase environment variables.");
  }
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  firebaseConfigError =
    "Firebase-configuratie ontbreekt of is onjuist. Controleer de NEXT_PUBLIC_FIREBASE_... environment variables (zie .env.local.example en README).";
  // eslint-disable-next-line no-console
  console.error(firebaseConfigError, err);
}

export default app;
