"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "@/components/Avatar";

interface MemberRow {
  id: string;
  displayName: string;
  email: string;
  role: "lid" | "bestuur";
}

export default function BestuurPage() {
  const { user, profile, loading } = useAuth();
  const [members, setMembers] = useState<MemberRow[] | null>(null);

  useEffect(() => {
    if (profile?.role !== "bestuur" || !db) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setMembers(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<MemberRow, "id">;
          return { id: docSnap.id, ...data };
        })
      );
    });
    return unsubscribe;
  }, [profile]);

  async function toggleRole(memberId: string, currentRole: "lid" | "bestuur") {
    if (!db) return;
    await updateDoc(doc(db, "users", memberId), {
      role: currentRole === "bestuur" ? "lid" : "bestuur",
    });
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Laden...</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-400">
        Log in om het bestuur-dashboard te bekijken.
      </p>
    );
  }

  if (profile?.role !== "bestuur") {
    return (
      <p className="text-sm text-gray-400">
        Dit dashboard is alleen zichtbaar voor bestuursleden.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-white">Bestuur Dashboard</h1>
      <p className="mb-4 text-sm text-gray-400">
        Berichten van leden verwijder je direct in de Home Feed — als
        bestuurslid zie je daar bij elk bericht een &quot;Verwijderen&quot;-knop.
        Hieronder beheer je de leden.
      </p>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-club-red">
        Leden ({members?.length ?? 0})
      </h2>
      <div className="flex flex-col gap-2">
        {members?.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-md border border-white/10 bg-club-gray px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Avatar name={member.displayName} size={32} />
              <div>
                <p className="text-sm font-medium text-white">
                  {member.displayName}
                </p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <button
              onClick={() => toggleRole(member.id, member.role)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                member.role === "bestuur"
                  ? "bg-club-red text-white"
                  : "border border-white/20 text-gray-300 hover:bg-white/10"
              }`}
            >
              {member.role === "bestuur" ? "Bestuur" : "Maak bestuur"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
