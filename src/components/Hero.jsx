import { ArrowRight, Sparkles } from "lucide-react";

export function Hero({ onRunRiskCheck, onStartCourse }) {
  return (
    <section
      id="hero"
      className="border-b border-brand-muted/20 bg-gradient-to-br from-brand-bg to-brand-surface px-6 py-16"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr,0.9fr] md:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-link/30 bg-brand-surface/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-link shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-accent" aria-hidden="true" />
            <span>As seen in</span>
            <a
              href="https://aijourn.com/from-hype-to-hedge-how-ai-risk-engines-are-redefining-trust-in-cryptos-wild-world/"
              target="_blank"
              rel="noopener noreferrer"
              className="normal-case tracking-normal text-sm font-semibold underline underline-offset-4 transition hover:text-brand-text hover:decoration-brand-accent"
            >
              AI Journal
            </a>
          </div>
          <p className="uppercase tracking-[0.35em] text-xs text-brand-link/70">
            Evidence over hype
          </p>
          <h1 className="text-5xl font-heading uppercase leading-none text-brand-text md:text-6xl">
            AI Crypto Risk Assessment
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted">
            We use cutting-edge AI to evaluate risk and identify scams, helping
            you spot what not to buy. Our four-analyzer model assesses on-chain,
            off-chain, social, and institutional signals to save you from costly
            mistakes.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onRunRiskCheck}
              className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-brand-text shadow transition hover:opacity-90"
            >
              <span>Get Your Risk Score</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onStartCourse}
              className="inline-flex items-center justify-center rounded-xl border border-brand-link/40 px-6 py-3 text-base font-semibold text-brand-link transition hover:border-brand-link hover:text-brand-text"
            >
              Start the free course
            </button>
          </div>
          <p className="text-sm text-brand-muted/80">
            No wallet connects. No downloads. Just transparent risk evidence.
          </p>
        </div>
        <div className="rounded-3xl border border-brand-muted/30 bg-white/70 p-6 shadow-lg">
          <img
            src="/aibtc.png"
            alt="AI-assisted crypto risk analysis visualization"
            className="h-full w-full rounded-2xl border border-brand-muted/40 object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
