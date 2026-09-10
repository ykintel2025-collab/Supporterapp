"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
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
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

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
        approved: false,
        emailVerified: false,
        bio: "",
        photoURL: null,
        createdAt: serverTimestamp(),
      });
      await sendEmailVerification(credential.user);
      setDone(true);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(translateFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!auth?.currentUser) return;
    setResending(true);
    setResendMessage(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setResendMessage("Mail opnieuw verstuurd — check je inbox (en spamfolder).");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setResendMessage(
        code === "auth/too-many-requests"
          ? "Net al een mail gestuurd — wacht een minuutje voordat je het opnieuw probeert."
          : "Versturen mislukt. Probeer het straks nog eens."
      );
    } finally {
      setResending(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="mb-2 text-xl font-extrabold tracking-tight text-gray-900">
          Bijna klaar!
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          We hebben een bevestigingsmail gestuurd naar <strong>{email}</strong>.
          Klik op de link daarin om je e-mailadres te bevestigen (check ook je
          spamfolder). Daarna beoordeelt het bestuur je aanmelding voordat je
          kunt posten.
        </p>
        {resendMessage && (
          <p className="mb-4 text-xs text-gray-500">{resendMessage}</p>
        )}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-club-red px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-club-red-dark"
          >
            Naar de Home Feed
          </button>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-medium text-gray-500 underline hover:text-club-red disabled:opacity-50"
          >
            {resending ? "Versturen..." : "Geen mail ontvangen? Opnieuw versturen"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-extrabold tracking-tight text-gray-900">
        Account aanmaken
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          placeholder="Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border-0 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-club-red/40"
        />
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
          placeholder="Wachtwoord (min. 6 tekens)"
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
          {loading ? "Bezig..." : "Account aanmaken"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Al een account?{" "}
        <Link href="/login" className="font-medium text-club-red hover:underline">
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
