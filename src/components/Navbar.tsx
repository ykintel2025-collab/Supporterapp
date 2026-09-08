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
    { href: "/sociaal-fonds", label: "Sociaal Fonds" },
    ...(profile?.role === "bestuur"
      ? [{ href: "/bestuur", label: "Bestuur" }]
      : []),
  ];

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-club-red/40 bg-club-black/95 backdrop-blur">
      {configError && (
        <div className="bg-club-red px-4 py-1.5 text-center text-xs font-medium text-white">
          {configError}
        </div>
      )}
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <span className="text-sm font-bold uppercase tracking-wide text-white">
          Amsterdams <span className="text-club-red">Supporters Fonds</span>
        </span>

        {!loading && (
          <div className="flex items-center gap-2">
            {user && profile ? (
              <>
                <Avatar name={profile.displayName} size={28} />
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-club-red"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Inloggen
                </Link>
                <Link
                  href="/registreren"
                  className="rounded-md bg-club-red px-2.5 py-1 text-xs font-semibold text-white hover:bg-club-red-dark"
                >
                  Registreren
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <nav className="mx-auto flex max-w-2xl gap-1 px-4 pb-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-club-red text-white"
                  : "text-gray-300 hover:bg-club-gray hover:text-white"
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
