"use client";

import { useRef, useState, ChangeEvent, FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "./Avatar";

export default function PostComposer() {
  const { user, profile } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        text: text.trim(),
        mediaUrl,
        mediaType,
        likes: [],
        createdAt: serverTimestamp(),
      });

      setText("");
      setFile(null);
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
        <Avatar name={profile.displayName} />
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
