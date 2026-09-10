"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sponsor } from "@/lib/types";

// Simpele sponsorbanner onderaan de feed: het bestuur beheert dit handmatig
// via Bestuur → Sponsoren (naam, logo, link). Betaling met de sponsor
// regelt het bestuur zelf buiten de app om (bijv. factuur) — hier gaat het
// alleen om de zichtbaarheid in de app.
export default function SponsorStrip() {
  const [sponsors, setSponsors] = useState<Sponsor[] | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "sponsors"), where("active", "==", true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSponsors(
          snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name ?? "",
              logoUrl: data.logoUrl ?? null,
              linkUrl: data.linkUrl ?? "",
              active: data.active ?? true,
            } as Sponsor;
          })
        );
      },
      () => setSponsors([])
    );
    return unsubscribe;
  }, []);

  if (!sponsors || sponsors.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Onze sponsoren
      </p>
      <div className="flex flex-wrap gap-3">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 transition hover:border-club-red/30"
          >
            {sponsor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="h-6 w-6 rounded object-contain"
              />
            ) : null}
            <span className="text-xs font-medium text-gray-700">{sponsor.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
