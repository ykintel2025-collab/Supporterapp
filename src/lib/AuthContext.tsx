"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, firebaseConfigError } from "./firebase";
import { UserProfile } from "./types";

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  configError: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  configError: null,
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

      // Bootstrap: zolang er nog geen enkel bestuurslid bestaat, wordt de
      // eerste ingelogde gebruiker automatisch bestuurslid. Zo hoeft niemand
      // ooit handmatig een rol in Firestore aan te passen om te beginnen.
      if (data.role !== "bestuur" && db) {
        try {
          const bestuurQuery = query(
            collection(db, "users"),
            where("role", "==", "bestuur"),
            limit(1)
          );
          const existing = await getDocs(bestuurQuery);
          if (existing.empty) {
            await updateDoc(doc(db, "users", user.uid), { role: "bestuur" });
          }
        } catch {
          // Geen kritieke functionaliteit — als dit een keer faalt (bijv.
          // door rules), blijft de gebruiker gewoon "lid" en kan een
          // bestaand bestuurslid diegene alsnog promoveren via /bestuur.
        }
      }
    });
    return unsubscribeProfile;
  }, [user]);

  async function logout() {
    if (auth) await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logout, configError: firebaseConfigError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
