"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens zijn.");
      return;
    }

    if (!auth || !db) {
      setError(
        "Firebase is niet geconfigureerd. Neem contact op met de beheerder."
      );
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credential.user, { displayName: name });
      await setDoc(doc(db, "users", credential.user.uid), {
        displayName: name,
        email,
        role: "lid",
        createdAt: serverTimestamp(),
      });
      router.push("/");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(translateFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-xl font-bold text-white">Account aanmaken</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          placeholder="Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-white/10 bg-club-gray px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-club-red focus:outline-none"
        />
        <input
          type="email"
          required
          placeholder="E-mailadres"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-white/10 bg-club-gray px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-club-red focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder="Wachtwoord (min. 6 tekens)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-white/10 bg-club-gray px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-club-red focus:outline-none"
        />
        {error && <p className="text-sm text-club-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-club-red px-3 py-2 text-sm font-semibold text-white hover:bg-club-red-dark disabled:opacity-50"
        >
          {loading ? "Bezig..." : "Account aanmaken"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-400">
        Al een account?{" "}
        <Link href="/login" className="text-club-red underline">
          Log hier in
        </Link>
      </p>
    </div>
  );
}

function translateFirebaseError(code?: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Dit e-mailadres is al in gebruik.";
    case "auth/invalid-email":
      return "Vul een geldig e-mailadres in.";
    case "auth/weak-password":
      return "Kies een sterker wachtwoord.";
    default:
      return "Er ging iets mis. Probeer het opnieuw.";
  }
}
