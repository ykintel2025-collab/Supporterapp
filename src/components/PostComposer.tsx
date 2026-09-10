"use client";

import { useRef, useState, ChangeEvent, FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "./Avatar";

export default function PostComposer() {
  const { user, profile, refreshEmailVerified, resendVerificationEmail } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [postAsBestuur, setPostAsBestuur] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingVerified, setCheckingVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !profile) {
    return (
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600 shadow-sm">
        <a href="/login" className="font-semibold text-club-red hover:underline">
          Log in
        </a>{" "}
        om iets te delen met de supporters.
      </div>
    );
  }

  if (!profile.emailVerified) {
    async function handleCheckVerified() {
      setCheckingVerified(true);
      const verified = await refreshEmailVerified();
      setCheckingVerified(false);
      if (!verified) {
        setError("Nog niet bevestigd — check je inbox (en spamfolder).");
      }
    }
    async function handleResend() {
      setResending(true);
      setResendMessage(null);
      const result = await resendVerificationEmail();
      setResending(false);
      setResendMessage(
        result.ok
          ? "Mail opnieuw verstuurd — check je inbox (en spamfolder)."
          : result.error ?? "Versturen mislukt."
      );
    }
    return (
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
        <p className="mb-2">
          Bevestig eerst je e-mailadres — we hebben een link gestuurd naar{" "}
          <strong>{profile.email}</strong>.
        </p>
        {error && <p className="mb-2 text-xs text-club-red">{error}</p>}
        {resendMessage && <p className="mb-2 text-xs text-gray-500">{resendMessage}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCheckVerified}
            disabled={checkingVerified}
            className="rounded-full bg-club-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-club-red-dark disabled:opacity-50"
          >
            {checkingVerified ? "Controleren..." : "Ik heb bevestigd, vernieuw"}
          </button>
          <button
            onClick={handleResend}
            disabled={resending}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            {resending ? "Versturen..." : "Mail opnieuw versturen"}
          </button>
        </div>
      </div>
    );
  }

  if (!profile.approved) {
    return (
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600 shadow-sm">
        Je e-mail is bevestigd — je account wacht nu op goedkeuring door het
        bestuur voordat je kunt posten.
      </div>
    );
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && !selected.type.match(/^(image|video)\//)) {
      setError("Alleen foto's of video's zijn toegestaan.");
      return;
    }
    if (selected && selected.size > 25 * 1024 * 1024) {
      setError("Bestand mag maximaal 25MB zijn.");
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    if (!user || !profile) return;
    if (!db) {
      setError("Firebase is niet geconfigureerd. Neem contact op met de beheerder.");
      return;
    }

    setPosting(true);
    setError(null);
    try {
      let mediaUrl: string | null = null;
      let mediaType: "image" | "video" | null = null;

      if (file) {
        const uploaded = await uploadToCloudinary(file);
        mediaUrl = uploaded.url;
        mediaType = uploaded.type;
      }

      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhotoURL: profile.photoURL ?? null,
        text: text.trim(),
        mediaUrl,
        mediaType,
        likes: [],
        status: "pending",
        postedAsBestuur: profile.role === "bestuur" && postAsBestuur,
        createdAt: serverTimestamp(),
      });

      setText("");
      setFile(null);
      setPostAsBestuur(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Plaatsen mislukt. Probeer het opnieuw."
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex gap-3">
        <Avatar name={profile.displayName} photoURL={profile.photoURL} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wat wil je delen met de supporters?"
          rows={2}
          className="flex-1 resize-none rounded-xl border-0 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-club-red/40"
        />
      </div>

      {file && (
        <p className="ml-[52px] mt-2 text-xs text-gray-500">
          Geselecteerd: {file.name}
        </p>
      )}
      {error && <p className="ml-[52px] mt-2 text-xs text-club-red">{error}</p>}

      <p className="ml-[52px] mt-2 text-xs text-gray-400">
        Je bericht komt eerst in de wachtrij voor bestuurlijke goedkeuring
        voordat het zichtbaar is voor anderen.
      </p>

      {profile.role === "bestuur" && (
        <label className="ml-[52px] mt-2 flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={postAsBestuur}
            onChange={(e) => setPostAsBestuur(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-club-red"
          />
          Plaatsen als officieel bestuursbericht (badge zichtbaar)
        </label>
      )}

      <div className="ml-[52px] mt-3 flex items-center justify-between">
        <label className="cursor-pointer text-sm font-medium text-gray-600 hover:text-club-red">
          📷 Foto/video toevoegen
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={posting || (!text.trim() && !file)}
          className="rounded-full bg-club-red px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-club-red-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {posting ? "Plaatsen..." : "Plaatsen"}
        </button>
      </div>
    </form>
  );
}
