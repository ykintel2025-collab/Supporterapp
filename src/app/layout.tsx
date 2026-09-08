import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/AuthContext";

// Deze app leunt op Firebase Auth/Firestore, die alleen in de browser
// werken. Door de hele app dynamisch te renderen voorkomen we dat
// `next build` probeert pagina's vooraf te genereren op de server met
// (mogelijk nog ontbrekende) Firebase-omgevingsvariabelen.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Amsterdams Supporters Fonds",
  description:
    "Community-app van het Amsterdams Supporters Fonds: deel updates, foto's en video's, steun het Sociaal Fonds.",
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
      <body className="min-h-screen bg-club-black font-sans text-white">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-2xl px-4 pb-16 pt-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
