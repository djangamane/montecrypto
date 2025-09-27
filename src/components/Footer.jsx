export function Footer() {
  return (
    <footer className="border-t border-brand-muted/20 bg-brand-bg px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-brand-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-brand-text">AI Crypto Risk Assessment</p>
          <p className="mt-2 max-w-md leading-relaxed">
            Educational risk analysis sourced from public data. Nothing here is financial advice.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="/legal/terms" className="hover:text-brand-text">Terms</a>
          <a href="/legal/privacy" className="hover:text-brand-text">Privacy</a>
          <a href="/disclaimer" className="hover:text-brand-text">Disclaimer</a>
          <a href="/legal/ad-disclosure" className="hover:text-brand-text">Ad Disclosure</a>
          <a href="mailto:hello@montecrypto.ai" className="hover:text-brand-text">Contact</a>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-6xl text-xs text-brand-muted/70">
        © {new Date().getFullYear()} MonteCrypto. All rights reserved.
      </div>
    </footer>
  );
}
