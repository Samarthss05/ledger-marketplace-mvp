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
    "ReStock by Ledger gives retailers and suppliers a protected procurement, Ninja Van fulfillment, and delivery verification workflow.",
  keywords: [
    "B2B",
    "retail procurement",
    "supplier sourcing",
    "delivery verification",
    "Southeast Asia",
    "ReStock",
    "Ledger",
  ],
  openGraph: {
    title: "ReStock by Ledger — Smarter retail procurement",
    description:
      "Protected procurement, courier fulfillment, and evidence-backed delivery verification.",
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
