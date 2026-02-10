export function Footer() {
  return (
    <footer className="border-t border-brand-muted/20 bg-white/60 py-8 backdrop-blur" role="contentinfo">
      <div className="mx-auto max-w-6xl px-6">
        {/* Disclaimer */}
        <p className="mb-6 text-xs text-brand-muted text-center max-w-3xl mx-auto">
          <strong>Disclaimer:</strong> AI Crypto Risk provides risk analysis tools for educational purposes only.
          This is not financial, investment, or trading advice. Cryptocurrency investments are highly volatile.
          Always do your own research (DYOR) before making investment decisions.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-brand-muted">
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            <a href="/legal/terms.html" className="hover:text-brand-text">
              Terms
            </a>
            <a href="/legal/privacy.html" className="hover:text-brand-text">
              Privacy
            </a>
            <a href="/disclaimer.html" className="hover:text-brand-text">
              Disclaimer
            </a>
            <a href="/legal/ad-disclosure.html" className="hover:text-brand-text">
              Ad Disclosure
            </a>
            <a
              href="mailto:jason@aicryptorisk.com"
              className="hover:text-brand-text"
            >
              Contact
            </a>
          </nav>
          <p>
            &copy; {new Date().getFullYear()} AI Crypto Risk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
