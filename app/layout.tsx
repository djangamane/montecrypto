import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Crypto Risk",
  description: "Daily red flags, risk signals, and how to avoid getting burned.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg font-sans text-brand-text">
        {children}
      </body>
    </html>
  );
}
