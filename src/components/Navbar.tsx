"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "./Avatar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, logout, configError } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingMembersCount, setPendingMembersCount] = useState(0);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);

  // Ongelezen-indicator voor Berichten: telt gesprekken waarvan het laatste
  // bericht niet van jezelf is én nog niet is gelezen (zie lastReadAt in
  // src/app/berichten/[id]/page.tsx).
  useEffect(() => {
    if (!user || !db) {
      setUnreadCount(0);
      return;
    }
    const q = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.lastMessageAt?.toDate || data.lastMessageSenderId === user.uid) return;
        const lastMessageAt = data.lastMessageAt.toDate();
        const lastReadAt = data.lastReadAt?.[user.uid]?.toDate
          ? data.lastReadAt[user.uid].toDate()
          : null;
        if (!lastReadAt || lastMessageAt > lastReadAt) count += 1;
      });
      setUnreadCount(count);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Indicator voor het bestuur: totaal aantal openstaande aanmeldingen +
  // berichten in de wachtrij, zodat je ook zonder het dashboard te openen
  // ziet dat er iets op je wacht.
  useEffect(() => {
    if (profile?.role !== "bestuur" || !db) {
      setPendingMembersCount(0);
      setPendingPostsCount(0);
      return;
    }
    const unsubscribeMembers = onSnapshot(collection(db, "users"), (snapshot) => {
      setPendingMembersCount(
        snapshot.docs.filter((docSnap) => docSnap.data().approved === false).length
      );
    });
    const unsubscribePosts = onSnapshot(
      query(collection(db, "posts"), where("status", "==", "pending")),
      (snapshot) => setPendingPostsCount(snapshot.size)
    );
    return () => {
      unsubscribeMembers();
      unsubscribePosts();
    };
  }, [profile?.role]);

  const pendingBestuurCount = pendingMembersCount + pendingPostsCount;

  const links = [
    { href: "/", label: "Home", badge: 0 },
    { href: "/voor-elkaar", label: "Voor Elkaar", badge: 0 },
    ...(user
      ? [
          { href: "/leden", label: "Leden", badge: 0 },
          { href: "/berichten", label: "Berichten", badge: unreadCount },
        ]
      : []),
    ...(profile?.role === "bestuur"
      ? [{ href: "/bestuur", label: "Bestuur", badge: pendingBestuurCount }]
      : []),
  ];

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      {configError && (
        <div className="bg-club-red px-4 py-1.5 text-center text-xs font-medium text-white">
          {configError}
        </div>
      )}
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <span className="text-sm font-extrabold tracking-tight text-gray-900">
          Amsterdams <span className="text-club-red">Supporters Fonds</span>
        </span>

        {!loading && (
          <div className="flex items-center gap-3">
            {user && profile ? (
              <>
                <Link href="/profiel" title="Mijn profiel">
                  <Avatar name={profile.displayName} photoURL={profile.photoURL} size={28} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-club-red"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Inloggen
                </Link>
                <Link
                  href="/registreren"
                  className="rounded-full bg-club-red px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-club-red-dark"
                >
                  Registreren
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <nav className="mx-auto flex max-w-2xl gap-1 px-4 pb-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-club-red text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.label}
              {link.badge > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    active ? "bg-white text-club-red" : "bg-club-red text-white"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
