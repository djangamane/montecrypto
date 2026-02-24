import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary px-6 pb-12 pt-24 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-premium border border-white/5 bg-white/5 p-12 backdrop-blur-md">
          <div className="grid gap-16 lg:grid-cols-[1.5fr,1fr,1fr,1fr]">
            <div className="space-y-8">
              <a href="/" className="flex items-center gap-3 text-white group" aria-label="AI Crypto Risk - Home">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-primary transition-transform group-hover:scale-110" aria-hidden="true">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight uppercase font-heading">
                  AI Crypto Risk
                </span>
              </a>
              <p className="max-w-sm text-sm leading-relaxed text-white/40">
                The institutional standard for digital asset risk intelligence. Eradicating hype through distributed evidence.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  System Operational
                </span>
                <span>Node: 0x42f</span>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">Protocol</h4>
              <nav className="flex flex-col gap-3">
                <a href="/#risk-meter" className="text-sm font-medium text-white/60 transition hover:text-white">AI Analyzer</a>
                <a href="/#course" className="text-sm font-medium text-white/60 transition hover:text-white">Academy</a>
                <a href="/blog" className="text-sm font-medium text-white/60 transition hover:text-white">Investigations</a>
                <a href="/enterprise" className="text-sm font-medium text-white/60 transition hover:text-white">Network Access</a>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">Terminal</h4>
              <nav className="flex flex-col gap-3">
                <a href="/api-keys" className="text-sm font-medium text-white/60 transition hover:text-white">Integrations</a>
                <a href="/scam-shooter" className="text-sm font-medium text-white/60 transition hover:text-white">Simulations</a>
                <a href="/docs" className="text-sm font-medium text-white/60 transition hover:text-white">Documentation</a>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">Legal</h4>
              <nav className="flex flex-col gap-3">
                <a href="/terms" className="text-sm font-medium text-white/60 transition hover:text-white">Compliance</a>
                <a href="/privacy" className="text-sm font-medium text-white/60 transition hover:text-white">Privacy Node</a>
                <button className="text-left text-sm font-medium text-white/60 transition hover:text-white">Audit Rights</button>
              </nav>
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              © {currentYear} Montecrypto Alpha. All signals reserved.
            </p>
            <div className="flex gap-8">
              <span className="font-data text-[10px] text-white/10">SHA-256: 8f2...9a1</span>
              <span className="font-data text-[10px] text-white/10">Lat: 40.7128N</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
