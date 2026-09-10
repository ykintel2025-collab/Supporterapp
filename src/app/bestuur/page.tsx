"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { FirestorePost } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import Avatar from "@/components/Avatar";

interface MemberRow {
  id: string;
  displayName: string;
  email: string;
  role: "lid" | "bestuur";
  approved: boolean;
  emailVerified: boolean;
  photoURL?: string | null;
}

type Tab = "aanmeldingen" | "berichten" | "leden";

export default function BestuurPage() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("aanmeldingen");
  const [members, setMembers] = useState<MemberRow[] | null>(null);
  const [posts, setPosts] = useState<FirestorePost[] | null>(null);

  useEffect(() => {
    if (profile?.role !== "bestuur" || !db) return;
    const unsubscribeMembers = onSnapshot(collection(db, "users"), (snapshot) => {
      setMembers(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<MemberRow, "id">;
          return { id: docSnap.id, ...data };
        })
      );
    });
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorId: data.authorId,
            authorName: data.authorName,
            authorPhotoURL: data.authorPhotoURL ?? null,
            text: data.text ?? "",
            mediaUrl: data.mediaUrl ?? null,
            mediaType: data.mediaType ?? null,
            likes: data.likes ?? [],
            status: data.status ?? "published",
            postedAsBestuur: data.postedAsBestuur ?? false,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          } as FirestorePost;
        })
      );
    });
    return () => {
      unsubscribeMembers();
      unsubscribePosts();
    };
  }, [profile]);

  async function toggleRole(memberId: string, currentRole: "lid" | "bestuur") {
    if (!db) return;
    await updateDoc(doc(db, "users", memberId), {
      role: currentRole === "bestuur" ? "lid" : "bestuur",
    });
  }

  async function approveMember(memberId: string) {
    if (!db) return;
    await updateDoc(doc(db, "users", memberId), { approved: true });
  }

  async function rejectMember(memberId: string) {
    if (!db) return;
    if (
      !confirm(
        "Weet je zeker dat je deze aanmelding wilt afwijzen? Het profiel wordt verwijderd (het inlogaccount blijft bestaan, maar zonder profiel kan diegene niets in de app doen)."
      )
    )
      return;
    await deleteDoc(doc(db, "users", memberId));
  }

  async function approvePost(postId: string) {
    if (!db) return;
    await updateDoc(doc(db, "posts", postId), { status: "published" });
  }

  async function rejectPost(postId: string) {
    if (!db) return;
    if (!confirm("Dit bericht afwijzen en verwijderen?")) return;
    await deleteDoc(doc(db, "posts", postId));
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Laden...</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        Log in om het bestuur-dashboard te bekijken.
      </p>
    );
  }

  if (profile?.role !== "bestuur") {
    return (
      <p className="text-sm text-gray-500">
        Dit dashboard is alleen zichtbaar voor bestuursleden.
      </p>
    );
  }

  const pendingMembers = (members ?? []).filter((m) => !m.approved);
  const approvedMembers = (members ?? []).filter((m) => m.approved);
  const pendingPosts = (posts ?? []).filter((p) => p.status === "pending");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "aanmeldingen", label: "Aanmeldingen", count: pendingMembers.length },
    { key: "berichten", label: "Berichten", count: pendingPosts.length },
    { key: "leden", label: "Leden", count: approvedMembers.length },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-gray-900">
        Bestuur Dashboard
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        Beheer aanmeldingen, beoordeel berichten en beheer leden — alles op één
        plek.
      </p>

      <div className="mb-4 flex gap-1.5 overflow-x-auto rounded-full bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  tab === t.key
                    ? "bg-club-red text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "aanmeldingen" && (
        <div className="flex flex-col gap-2">
          {pendingMembers.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              Geen openstaande aanmeldingen.
            </p>
          )}
          {pendingMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={member.displayName} photoURL={member.photoURL} size={36} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      member.emailVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {member.emailVerified ? "E-mail bevestigd" : "E-mail nog niet bevestigd"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => rejectMember(member.id)}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Afwijzen
                </button>
                <button
                  onClick={() => approveMember(member.id)}
                  title={
                    member.emailVerified
                      ? undefined
                      : "E-mail is nog niet bevestigd — je kunt alsnog goedkeuren als je de aanmelding vertrouwt"
                  }
                  className="rounded-full bg-club-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-club-red-dark"
                >
                  Goedkeuren
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "berichten" && (
        <div className="flex flex-col gap-2">
          {pendingPosts.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              Geen berichten in de wachtrij.
            </p>
          )}
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Avatar name={post.authorName} photoURL={post.authorPhotoURL} size={32} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {post.authorName}
                    {post.postedAsBestuur && (
                      <span className="ml-1.5 rounded-full bg-club-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-club-red">
                        Bestuur
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.createdAt ? formatRelativeTime(post.createdAt) : "zojuist"}
                  </p>
                </div>
              </div>
              {post.text && (
                <p className="mb-2.5 whitespace-pre-wrap text-sm text-gray-800">
                  {post.text}
                </p>
              )}
              {post.mediaUrl && post.mediaType === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.mediaUrl}
                  alt=""
                  className="mb-2.5 max-h-72 w-full rounded-xl border border-gray-100 object-cover"
                />
              )}
              {post.mediaUrl && post.mediaType === "video" && (
                <video
                  src={post.mediaUrl}
                  controls
                  className="mb-2.5 max-h-72 w-full rounded-xl border border-gray-100 bg-black"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => rejectPost(post.id)}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Afwijzen
                </button>
                <button
                  onClick={() => approvePost(post.id)}
                  className="rounded-full bg-club-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-club-red-dark"
                >
                  Goedkeuren
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "leden" && (
        <div className="flex flex-col gap-2">
          {approvedMembers.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              Nog geen goedgekeurde leden.
            </p>
          )}
          {approvedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={member.displayName} photoURL={member.photoURL} size={32} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
              <button
                onClick={() => toggleRole(member.id, member.role)}
                disabled={member.id === user.uid}
                title={
                  member.id === user.uid
                    ? "Je kunt jezelf niet degraderen"
                    : undefined
                }
                className={`rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                  member.role === "bestuur"
                    ? "bg-club-red text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {member.role === "bestuur" ? "Bestuur" : "Maak bestuur"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
