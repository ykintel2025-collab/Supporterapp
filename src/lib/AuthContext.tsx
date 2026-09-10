"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db, firebaseConfigError } from "./firebase";
import { UserProfile } from "./types";

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  configError: string | null;
  refreshEmailVerified: () => Promise<boolean>;
  resendVerificationEmail: () => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  configError: null,
  refreshEmailVerified: async () => false,
  resendVerificationEmail: async () => ({ ok: false, error: "Niet beschikbaar." }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      return;
    }
    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), async (snap) => {
      if (!snap.exists()) {
        setProfile(null);
        return;
      }
      const data = snap.data() as UserProfile;
      setProfile(data);

      // Mirror de e-mailverificatie-status van Firebase Auth naar Firestore,
      // zodat het bestuur die kan zien bij het beoordelen van aanmeldingen
      // (Firebase Auth geeft de verificatiestatus van andere gebruikers niet
      // vrij aan client-code, dus we slaan een kopie op in het profiel).
      if (user.emailVerified && !data.emailVerified && db) {
        try {
          await updateDoc(doc(db, "users", user.uid), { emailVerified: true });
        } catch {
          // niet kritiek, probeert het opnieuw bij de volgende snapshot
        }
      }

      // Bootstrap: zolang er nog geen enkel bestuurslid bestaat, wordt de
      // eerste ingelogde gebruiker automatisch bestuurslid én goedgekeurd.
      // Zo hoeft niemand ooit handmatig in Firestore te klikken om te
      // beginnen, en zit de oprichter niet zelf vast in de wachtrij. Het
      // vlaggetje "meta/bootstrap" zorgt ervoor dat dit maar één keer kan
      // gebeuren (zie firestore.rules) — daarna kan alleen het bestuur nog
      // nieuwe bestuursleden aanwijzen.
      if (db) {
        try {
          const bootstrapSnap = await getDoc(doc(db, "meta", "bootstrap"));
          const flagOntbreekt =
            !bootstrapSnap.exists() || bootstrapSnap.data()?.bestuurExists !== true;
          if (flagOntbreekt) {
            if (data.role === "bestuur") {
              // Bestond al vóór dit vlaggetje bestond (bijv. een eerdere
              // versie van de app): zet het alsnog, zodat vanaf nu niemand
              // anders zichzelf nog stiekem bestuurslid kan maken.
              await setDoc(doc(db, "meta", "bootstrap"), { bestuurExists: true });
            } else {
              const batch = writeBatch(db);
              batch.update(doc(db, "users", user.uid), {
                role: "bestuur",
                approved: true,
              });
              batch.set(doc(db, "meta", "bootstrap"), { bestuurExists: true });
              await batch.commit();
            }
          }
        } catch {
          // Geen kritieke functionaliteit — bij falen blijft de gebruiker
          // gewoon "lid" en kan een bestaand bestuurslid diegene alsnog
          // promoveren via /bestuur.
        }
      }
    });
    return unsubscribeProfile;
  }, [user]);

  async function logout() {
    if (auth) await signOut(auth);
  }

  async function refreshEmailVerified(): Promise<boolean> {
    if (!auth?.currentUser || !db) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          emailVerified: true,
        });
      } catch {
        // negeer, onSnapshot pakt het bij volgende gelegenheid alsnog op
      }
    }
    return verified;
  }

  async function resendVerificationEmail(): Promise<{ ok: boolean; error?: string }> {
    if (!auth?.currentUser) {
      return { ok: false, error: "Niet ingelogd." };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return { ok: true };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/too-many-requests") {
        return {
          ok: false,
          error:
            "Net al een mail gestuurd — wacht een minuutje voordat je het opnieuw probeert.",
        };
      }
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Versturen mislukt.",
      };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        configError: firebaseConfigError,
        refreshEmailVerified,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
