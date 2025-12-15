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
        <a
          href="mailto:jason@aicryptorisk.com"
          className="fixed bottom-4 left-4 z-50 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-brand-muted backdrop-blur-sm transition hover:bg-white/20 hover:text-brand-text"
        >
          Found a bug?
        </a>
      </body>
    </html>
  );
}
