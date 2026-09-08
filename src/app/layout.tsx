import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Amsterdams Supporters Fonds",
  description:
    "Community-app van het Amsterdams Supporters Fonds: mededelingen, sociaal fonds en meer.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D2122E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-club-black text-white">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}
