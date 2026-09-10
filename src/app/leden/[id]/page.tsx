"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { MemberProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";

export default function LidProfielPage() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [member, setMember] = useState<MemberProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!user || !db || !params?.id) return;
    const unsubscribe = onSnapshot(doc(db, "users", params.id), (snap) => {
      if (!snap.exists()) {
        setMember(null);
        return;
      }
      setMember({ id: snap.id, ...snap.data() } as MemberProfile);
    });
    return unsubscribe;
  }, [user, params?.id]);

  if (loading || member === undefined) {
    return <p className="text-sm text-gray-500">Laden...</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="font-semibold text-club-red hover:underline">
          Log in
        </a>{" "}
        om ledenprofielen te bekijken.
      </p>
    );
  }

  if (!member || !member.approved) {
    return <p className="text-sm text-gray-500">Dit lid bestaat niet (meer).</p>;
  }

  const isOwnProfile = user.uid === member.id;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={member.displayName} photoURL={member.photoURL} size={72} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                {member.displayName}
              </h1>
              {member.role === "bestuur" && (
                <span className="rounded-full bg-club-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-club-red">
                  Bestuur
                </span>
              )}
            </div>
            {member.bio && (
              <p className="mt-1 text-sm text-gray-600">{member.bio}</p>
            )}
          </div>
        </div>

        {!isOwnProfile && (
          <Link
            href={`/berichten/${member.id}`}
            className="mt-4 inline-block rounded-full bg-club-red px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-club-red-dark"
          >
            Stuur bericht
          </Link>
        )}
        {isOwnProfile && (
          <Link
            href="/profiel"
            className="mt-4 inline-block rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Profiel bewerken
          </Link>
        )}
      </div>
    </div>
  );
}
