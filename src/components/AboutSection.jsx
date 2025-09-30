export function AboutSection() {
  return (
    <section id="about" className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-brand-muted/30 bg-white/85 p-10 shadow-lg md:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-link/70">
            Founder story
          </p>
          <h2 className="text-3xl font-heading uppercase text-brand-text">
            Making risk visible since 2017
          </h2>
          <p className="text-base leading-relaxed text-brand-muted">
            I taught my first crypto course in 2017, warned students early about
            BitConnect, and ran an ETH/XMR mining setup with Houston partners.
            After building AI systems for nonprofits, I returned to crypto with
            one goal: make complex risk signals readable for everyone.
          </p>
          <p className="text-base leading-relaxed text-brand-muted">
            We do not sling smear campaigns. We surface evidence, explain the
            signal, and help you decide what is worth your time. That promise
            powers the course, the analyzers, and the Weekly Risk Brief.
          </p>
          <p className="text-base leading-relaxed text-brand-muted">
            <a
              href="https://www.youtube.com/@cryptoblock8561"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-link hover:text-brand-text"
            >
              Our founder's long-standing presence in the crypto community is
              demonstrated by our original YouTube channel, which you can view
              by clicking here.
            </a>
          </p>
          <p className="text-sm text-brand-muted/80">
            —{" "}
            <a
              href="mailto:jason@aicryptorisk.com"
              className="text-brand-link hover:text-brand-text"
            >
              Jason Breckenridge
            </a>
          </p>
        </div>
        <div className="rounded-3xl border border-dashed border-brand-muted/40 bg-brand-bg/70 p-6 text-sm leading-relaxed text-brand-muted">
          <p className="font-semibold uppercase tracking-[0.2em] text-brand-link">
            What you can expect
          </p>
          <ul className="mt-4 space-y-3">
            <li>• Neutral, evidence-based analysis without hype.</li>
            <li>• Fast pivots when institutional or social signals shift.</li>
            <li>
              • Clear disclaimers — this is educational, not financial advice.
            </li>
            <li>• Tooling designed for teams with compliance in mind.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
