import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://overcall.lol"),
  title: "overcall.lol - Claim a rank on the public leaderboard",
  description:
    "The public leaderboard where rank is what you pay. Claim your spot on the public board. Pay more to climb higher.",
  openGraph: {
    title: "overcall.lol — Claim a rank on the public leaderboard",
    description: "Claim your spot on the public board. Pay more to climb higher.",
    url: "https://overcall.lol",
    siteName: "overcall.lol",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "overcall.lol Leaderboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "overcall.lol — Pay-to-Rank Public Leaderboard",
    description: "Pay more to climb higher on public charts.",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
