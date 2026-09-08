"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!auth) {
      setError(
        "Firebase is niet geconfigureerd. Neem contact op met de beheerder."
      );
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(translateFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-extrabold tracking-tight text-gray-900">
        Inloggen
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="E-mailadres"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border-0 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-club-red/40"
        />
        <input
          type="password"
          required
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border-0 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-club-red/40"
        />
        {error && <p className="text-sm text-club-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-club-red px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-club-red-dark disabled:opacity-50"
        >
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Nog geen account?{" "}
        <Link href="/registreren" className="font-medium text-club-red hover:underline">
          Registreer je hier
        </Link>
      </p>
    </div>
  );
}

function translateFirebaseError(code?: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mailadres of wachtwoord onjuist.";
    case "auth/invalid-email":
      return "Vul een geldig e-mailadres in.";
    case "auth/too-many-requests":
      return "Te veel pogingen. Probeer het later opnieuw.";
    default:
      return "Er ging iets mis. Probeer het opnieuw.";
  }
}
