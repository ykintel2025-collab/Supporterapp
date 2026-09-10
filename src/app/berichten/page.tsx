"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { Conversation } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import Avatar from "@/components/Avatar";

export default function BerichtenPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);

  useEffect(() => {
    if (!user || !db) return;
    // Eén filter (array-contains), zonder orderBy in de query zelf — zo is
    // er geen samengestelde Firestore-index nodig. We sorteren op datum
    // client-side.
    const q = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          participantIds: data.participantIds ?? [],
          participantNames: data.participantNames ?? {},
          participantPhotoURLs: data.participantPhotoURLs ?? {},
          lastMessage: data.lastMessage ?? "",
          lastMessageAt: data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : null,
        } as Conversation;
      });
      list.sort((a, b) => {
        const timeA = a.lastMessageAt?.getTime() ?? 0;
        const timeB = b.lastMessageAt?.getTime() ?? 0;
        return timeB - timeA;
      });
      setConversations(list);
    });
    return unsubscribe;
  }, [user]);

  if (loading) {
    return <p className="text-sm text-gray-500">Laden...</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="font-semibold text-club-red hover:underline">
          Log in
        </a>{" "}
        om je berichten te bekijken.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-gray-900">
        Berichten
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        Privégesprekken met andere leden.{" "}
        <Link href="/leden" className="font-medium text-club-red hover:underline">
          Zoek een lid
        </Link>{" "}
        om een nieuw gesprek te starten.
      </p>

      {conversations === null && (
        <p className="py-8 text-center text-sm text-gray-500">Laden...</p>
      )}
      {conversations?.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          Nog geen gesprekken. Ga naar Leden en stuur iemand een bericht.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {conversations?.map((conv) => {
          const otherId = conv.participantIds.find((id) => id !== user.uid) ?? "";
          const otherName = conv.participantNames[otherId] ?? "Onbekend lid";
          const otherPhoto = conv.participantPhotoURLs?.[otherId] ?? null;
          return (
            <Link
              key={conv.id}
              href={`/berichten/${otherId}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm transition hover:border-club-red/30 hover:shadow"
            >
              <Avatar name={otherName} photoURL={otherPhoto} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{otherName}</p>
                <p className="truncate text-xs text-gray-500">
                  {conv.lastMessage || "Nog geen berichten"}
                </p>
              </div>
              {conv.lastMessageAt && (
                <span className="shrink-0 text-[11px] text-gray-400">
                  {formatRelativeTime(conv.lastMessageAt)}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
