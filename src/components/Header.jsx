import { Shield, ArrowRight } from "lucide-react";

import { HeaderAuthBar } from "./auth/HeaderAuthBar.jsx";

export function Header({ onBookNowClick, session, isSessionLoading }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-muted/20 bg-brand-bg/95 backdrop-blur" role="banner">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-link focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3 text-brand-text" aria-label="AI Crypto Risk - Go to home page">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-text text-brand-bg shadow-sm" aria-hidden="true">
            <Shield className="h-5 w-5" />
          </span>
          <span className="text-2xl font-heading tracking-tight uppercase">
            AI Crypto Risk
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-muted md:flex" aria-label="Main navigation">
          <a href="/#risk-meter" className="transition hover:text-brand-text">
            AI Tool
          </a>
          <a href="/#course" className="transition hover:text-brand-text">
            Free Course
          </a>
          <a href="/#newsletter" className="transition hover:text-brand-text">
            Newsletter
          </a>
          <a href="/#pricing" className="transition hover:text-brand-text">
            Pricing
          </a>
          <a href="/blog" className="transition hover:text-brand-text">
            Blog
          </a>
          <a href="/#about" className="transition hover:text-brand-text">
            About
          </a>
          <a href="/api-keys" className="transition hover:text-brand-text">
            API Keys
          </a>
          <a href="/enterprise" className="transition hover:text-brand-text">
            Enterprise
          </a>
        </nav>
        <a
          href="/scam-shooter"
          className="hidden items-center gap-2 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-text shadow md:flex"
          aria-label="Play Scam Shooter game"
        >
          <img src="/sprite_enemy1.png" alt="" className="h-5 w-5" aria-hidden="true" />
          <span>Play Scam Shooter!</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <HeaderAuthBar session={session} isLoading={isSessionLoading} />
    </header>
  );
}
