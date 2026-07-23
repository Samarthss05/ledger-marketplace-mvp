import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReStock by Ledger — Smarter retail procurement",
  description:
    "ReStock by Ledger connects independent retailers and trusted suppliers in one procurement workspace for demand planning, competitive bidding, ordering, and fulfillment.",
  keywords: [
    "B2B",
    "retail procurement",
    "supplier marketplace",
    "demand aggregation",
    "Southeast Asia",
    "ReStock",
    "Ledger",
  ],
  openGraph: {
    title: "ReStock by Ledger — Smarter retail procurement",
    description:
      "One procurement workspace for retailers and suppliers across Southeast Asia.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased noise-bg`}>
        {children}
      </body>
    </html>
  );
}
