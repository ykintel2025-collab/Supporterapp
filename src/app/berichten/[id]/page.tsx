"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { getConversationId } from "@/lib/chat";
import { ChatMessage, MemberProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";

export default function GesprekPage() {
  const params = useParams<{ id: string }>();
  const otherId = params?.id;
  const { user, profile, loading } = useAuth();
  const [otherMember, setOtherMember] = useState<MemberProfile | null | undefined>(
    undefined
  );
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationId =
    user && otherId ? getConversationId(user.uid, otherId) : null;

  useEffect(() => {
    if (!db || !otherId) return;
    const unsubscribe = onSnapshot(doc(db, "users", otherId), (snap) => {
      setOtherMember(snap.exists() ? ({ id: snap.id, ...snap.data() } as MemberProfile) : null);
    });
    return unsubscribe;
  }, [otherId]);

  useEffect(() => {
    if (!db || !conversationId) return;
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            senderId: data.senderId,
            text: data.text ?? "",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          } as ChatMessage;
        })
      );
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user || !profile || !db || !conversationId || !otherId || !otherMember)
      return;

    setSending(true);
    setError(null);
    try {
      await setDoc(
        doc(db, "conversations", conversationId),
        {
          participantIds: [user.uid, otherId],
          participantNames: {
            [user.uid]: profile.displayName,
            [otherId]: otherMember.displayName,
          },
          participantPhotoURLs: {
            [user.uid]: profile.photoURL ?? null,
            [otherId]: otherMember.photoURL ?? null,
          },
          lastMessage: text.trim(),
          lastMessageAt: serverTimestamp(),
        },
        { merge: true }
      );
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        senderId: user.uid,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Versturen mislukt.");
    } finally {
      setSending(false);
    }
  }

  if (loading || otherMember === undefined) {
    return <p className="text-sm text-gray-500">Laden...</p>;
  }

  if (!user || !profile) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="font-semibold text-club-red hover:underline">
          Log in
        </a>{" "}
        om berichten te versturen.
      </p>
    );
  }

  if (!otherMember || !otherMember.approved) {
    return <p className="text-sm text-gray-500">Dit lid bestaat niet (meer).</p>;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col">
      <Link
        href={`/leden/${otherId}`}
        className="mb-3 flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm"
      >
        <Avatar name={otherMember.displayName} photoURL={otherMember.photoURL} size={36} />
        <p className="text-sm font-semibold text-gray-900">{otherMember.displayName}</p>
      </Link>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
        {messages === null && (
          <p className="py-6 text-center text-sm text-gray-500">Laden...</p>
        )}
        {messages?.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            Nog geen berichten. Zeg hallo!
          </p>
        )}
        {messages?.map((msg) => {
          const isMine = msg.senderId === user.uid;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  isMine
                    ? "bg-club-red text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-club-red">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Typ een bericht..."
          className="flex-1 rounded-full border-0 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-club-red/40"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-club-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-club-red-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Versturen
        </button>
      </form>
    </div>
  );
}
