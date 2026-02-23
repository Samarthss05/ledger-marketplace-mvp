import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledger — The Operating System for Traditional Retail",
  description:
    "Ledger transforms traditional retail with AI-powered procurement, demand auctions, digital cooperatives, and embedded finance. The indispensable infrastructure powering ASEAN's retail revolution.",
  keywords: [
    "B2B",
    "retail OS",
    "traditional retail",
    "AI procurement",
    "ASEAN",
    "supply chain",
    "embedded finance",
  ],
  openGraph: {
    title: "Ledger — The Operating System for Traditional Retail",
    description:
      "The indispensable infrastructure powering ASEAN's retail revolution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased noise-bg`}>
        {children}
      </body>
    </html>
  );
}
