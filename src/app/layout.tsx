import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReStock by Ledger — Ordering made simpler",
  description:
    "Create stock orders, compare supplier quotes, and track Ninja Van deliveries in one place.",
  keywords: [
    "B2B",
    "retail procurement",
    "supplier sourcing",
    "delivery tracking",
    "Southeast Asia",
    "ReStock",
    "Ledger",
  ],
  openGraph: {
    title: "ReStock by Ledger — Ordering made simpler",
    description:
      "Create stock orders, compare supplier quotes, and track every delivery in one place.",
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
