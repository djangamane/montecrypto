export function AboutSection() {
  return (
    <section id="about" className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-brand-muted/30 bg-white/85 p-10 shadow-lg md:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-4">
          <h2 className="text-3xl font-heading uppercase text-brand-text">
            Making Crypto Risk Visible Since 2017
          </h2>
          <p className="text-base leading-relaxed text-brand-muted">
            I taught my first crypto course in 2017 and warned students early
            about BitConnect. After building AI systems for nonprofits, I
            returned to crypto with one goal: use cutting-edge AI to make
            complex risk signals readable, helping you avoid the pitfalls and
            scams that plague the market.
          </p>
          <p className="text-base leading-relaxed text-brand-muted">
            We don't tell you what to buy. Instead, we surface evidence and
            explain the signals to help you easily spot what <em>not</em> to
            buy. That promise powers our analyzers and the Weekly Risk Brief,
            saving you from costly mistakes.
          </p>
          <p className="text-base leading-relaxed text-brand-muted">
            <a
              href="https://www.youtube.com/@cryptoblock8561"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-link hover:text-brand-text"
            >
              My long-standing presence in the crypto community is demonstrated
              by my original YouTube channel, which you can view by clicking
              here.
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
