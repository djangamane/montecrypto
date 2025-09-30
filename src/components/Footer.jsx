export function Footer() {
  return (
    <footer className="border-t border-brand-muted/20 bg-white/60 py-8 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-brand-muted">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
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
        </div>
        <p>
          &copy; {new Date().getFullYear()} AI Crypto Risk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
