"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "./Avatar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, logout, configError } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/voor-elkaar", label: "Voor Elkaar" },
    ...(user
      ? [
          { href: "/leden", label: "Leden" },
          { href: "/berichten", label: "Berichten" },
        ]
      : []),
    ...(profile?.role === "bestuur"
      ? [{ href: "/bestuur", label: "Bestuur" }]
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
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-club-red text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
