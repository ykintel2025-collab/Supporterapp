"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Avatar from "@/components/Avatar";

export default function ProfielPage() {
  const { user, profile, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setPhotoURL(profile.photoURL ?? null);
    }
  }, [profile]);

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Kies een afbeelding voor je profielfoto.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, "profiles");
      setPhotoURL(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uploaden mislukt.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !db) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim() || profile?.displayName,
        bio: bio.trim(),
        photoURL,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Laden...</p>;
  }

  if (!user || !profile) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="font-semibold text-club-red hover:underline">
          Log in
        </a>{" "}
        om je profiel te bewerken.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-gray-900">
        Mijn profiel
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        Vul je gegevens aan zodat andere leden je kunnen herkennen en vinden.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <Avatar name={displayName || profile.displayName} photoURL={photoURL} size={64} />
          <label className="cursor-pointer rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100">
            {uploading ? "Bezig met uploaden..." : "Profielfoto wijzigen"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500">Naam</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-xl border-0 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-club-red/40"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500">
            Over mij (optioneel)
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Bijv. sinds wanneer je supporter bent, waar je meestal staat op de tribune..."
            className="resize-none rounded-xl border-0 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-club-red/40"
          />
        </label>

        {error && <p className="text-sm text-club-red">{error}</p>}
        {saved && (
          <p className="text-sm font-medium text-green-600">Profiel opgeslagen.</p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="self-start rounded-full bg-club-red px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-club-red-dark disabled:opacity-50"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
      </form>
    </div>
  );
}
