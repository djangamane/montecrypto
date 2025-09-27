export default function Header() {
  return (
    <header className="border-b border-brand-muted/30 bg-brand-bg/70">
      <div className="container mx-auto max-w-4xl px-6 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-heading uppercase text-brand-text md:text-3xl">
              AI Crypto Risk Assessment Workspace
            </h1>
            <p className="text-sm text-brand-muted">
              Aggregating on-chain, off-chain, social, and institutional signals with Gemini assistance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
            <span className="rounded-full border border-brand-muted/40 bg-white/70 px-3 py-1">Gemini 2.5 Flash</span>
            <span className="rounded-full border border-brand-muted/40 bg-white/70 px-3 py-1">Live web sources</span>
            <span className="rounded-full border border-brand-muted/40 bg-white/70 px-3 py-1">Four-analyzer model</span>
          </div>
        </div>
      </div>
    </header>
  );
}
