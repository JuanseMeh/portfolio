import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://portfolio.juansebastianuribe49.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sebastián Uribe — Backend & Systems Engineer",
  description:
    "Backend and systems engineer. Identity, contracts and data boundaries — the infrastructure behind digital institutions. Currently building Ágora.",
  authors: [{ name: "Sebastián Uribe", url: "https://github.com/JuanseMeh" }],
  keywords: [
    "Sebastián Uribe",
    "backend engineer",
    "systems engineer",
    "distributed systems",
    "Rust",
    "Go",
    "Ágora",
  ],
  openGraph: {
    title: "Sebastián Uribe — Backend & Systems Engineer",
    description:
      "Identity, contracts and data boundaries — the infrastructure behind digital institutions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sebastián Uribe — Backend & Systems Engineer",
    description:
      "Identity, contracts and data boundaries — the infrastructure behind digital institutions.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
