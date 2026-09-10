"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { MemberProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";

export default function LedenPage() {
  const { user, profile, loading } = useAuth();
  const [members, setMembers] = useState<MemberProfile[] | null>(null);

  useEffect(() => {
    if (!user || !db) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setMembers(
        snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MemberProfile))
          .filter((m) => m.approved)
      );
    });
    return unsubscribe;
  }, [user]);

  if (loading) {
    return <p className="text-sm text-gray-500">Laden...</p>;
  }

  if (!user || !profile) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="font-semibold text-club-red hover:underline">
          Log in
        </a>{" "}
        om het ledenoverzicht te bekijken.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-gray-900">
        Leden
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        Vind andere supporters terug en bekijk hun profiel.
      </p>

      {members === null && (
        <p className="py-8 text-center text-sm text-gray-500">Laden...</p>
      )}
      {members?.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          Nog geen andere leden gevonden.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {members?.map((member) => (
          <Link
            key={member.id}
            href={`/leden/${member.id}`}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3.5 text-center shadow-sm transition hover:border-club-red/30 hover:shadow"
          >
            <Avatar name={member.displayName} photoURL={member.photoURL} size={56} />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {member.displayName}
              </p>
              {member.role === "bestuur" && (
                <span className="mt-1 inline-block rounded-full bg-club-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-club-red">
                  Bestuur
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
