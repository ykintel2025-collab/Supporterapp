"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/sociaal-fonds", label: "Sociaal Fonds" },
  { href: "/bestuur", label: "Bestuur" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-club-red/40 bg-club-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <span className="text-sm font-bold uppercase tracking-wide text-white">
          Amsterdams <span className="text-club-red">Supporters Fonds</span>
        </span>
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
