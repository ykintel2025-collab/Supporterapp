// Firebase-configuratie voor Amsterdams Supporters Fonds.
//
// Belangrijk: de waarden komen uit environment variables (NEXT_PUBLIC_...),
// niet hardcoded, zodat je dezelfde code kunt gebruiken op je laptop en op Vercel.
// Zet de waarden lokaal in ".env.local" (zie .env.local.example) en op Vercel
// onder Project Settings > Environment Variables.
//
// Deze app werkt nu met voorbeelddata (src/lib/mockData.ts) zodat je meteen
// iets werkends hebt. Zodra je Firestore hebt ingericht, kun je hier
// getFirestore(app) gebruiken om echte posts/donaties op te halen.

import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Voorkomt "Firebase App already exists" fouten bij hot-reload in development.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
