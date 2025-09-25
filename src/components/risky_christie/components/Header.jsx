export default function Header() {
  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm border-b border-brand-secondary/40">
      <div className="container mx-auto px-4 py-4 max-w-4xl flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-text">
            MonteCrypto Intelligence Lab
          </h1>
          <p className="text-brand-subtext text-sm">
            Aggregating open intelligence, social sentiment, and institutional breadcrumbs via
            Gemini.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-subtext">
          <span className="px-3 py-1 rounded-full border border-brand-subtext/30 bg-brand-primary/40">
            Gemini 2.5 Flash
          </span>
          <span className="px-3 py-1 rounded-full border border-brand-subtext/30 bg-brand-primary/40">
            Google Search Tooling
          </span>
          <span className="px-3 py-1 rounded-full border border-brand-subtext/30 bg-brand-primary/40">
            Live Web Footprint
          </span>
        </div>
      </div>
    </header>
  );
}
