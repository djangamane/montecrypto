import { Shield, ArrowRight } from 'lucide-react';

export function Header({ onBookNowClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-muted/20 bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#hero" className="flex items-center gap-3 text-brand-text">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-text text-brand-bg shadow-sm">
            <Shield className="h-5 w-5" />
          </span>
          <span className="text-2xl font-heading tracking-tight uppercase">AI Crypto Risk Assessment</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-muted md:flex">
          <a href="#risk-meter" className="transition hover:text-brand-text">Risk Meter</a>
          <a href="#course" className="transition hover:text-brand-text">Free Course</a>
          <a href="#newsletter" className="transition hover:text-brand-text">Weekly Risk Brief</a>
          <a href="#about" className="transition hover:text-brand-text">About</a>
        </nav>
        <button
          type="button"
          onClick={onBookNowClick}
          className="hidden items-center gap-2 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-text shadow md:flex"
        >
          <span>Book Premium Coaching</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
