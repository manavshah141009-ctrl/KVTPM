import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/contexts/audio-context";
import { LanguageProvider } from "@/contexts/language-context";
import { ShellLayout } from "@/components/shell-layout";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "KarVicharTohPamm — Spiritual wisdom & satsang",
    template: "%s · KarVicharTohPamm",
  },
  description:
    "KarVicharTohPamm (KVTP) — continuous bhajan stream, spiritual books, and live satsang. A calm, modern sanctuary for seekers.",
  keywords: [
    "KarVicharTohPamm",
    "KVTP",
    "bhajan",
    "satsang",
    "spiritual books",
    "live stream",
    "wisdom",
  ],
  openGraph: {
    title: "KarVicharTohPamm",
    description: "Sacred sound, timeless books, shared satsang.",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FF9933",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-sans min-h-dvh">
        <LanguageProvider>
          <AudioProvider>
            <ShellLayout>{children}</ShellLayout>
          </AudioProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
