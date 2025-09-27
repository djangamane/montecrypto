import { ShieldHalf, Network, Database, BarChart2 } from 'lucide-react';

const benefitItems = [
  {
    icon: <ShieldHalf className="h-9 w-9 text-brand-link" />,
    title: 'Four analyzer model',
    description: 'On-chain, off-chain, social, and institutional intelligence blended into one score.'
  },
  {
    icon: <Database className="h-9 w-9 text-brand-link" />,
    title: 'Explainable evidence',
    description: 'Expand the JSON payload to inspect every factor before you make a decision.'
  },
  {
    icon: <Network className="h-9 w-9 text-brand-link" />,
    title: 'Weekly risk brief',
    description: 'Receive a curated digest each Friday with the top risk moves and five tokens to watch.'
  },
  {
    icon: <BarChart2 className="h-9 w-9 text-brand-link" />,
    title: 'Built for teams',
    description: 'Share read-only dashboards, export scores, and sync with your research workflow.'
  }
];

export function Benefits() {
  return (
    <section className="border-y border-brand-muted/20 bg-white/80 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-link/70">Why analysts plug us in</p>
          <h2 className="mt-3 text-3xl font-heading uppercase text-brand-text">Evidence that keeps up with the market</h2>
          <p className="mt-2 text-base text-brand-muted">
            From self-custody investors to compliance teams, the platform surfaces risk faster than manual tab hunting.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {benefitItems.map((benefit) => (
            <div
              key={benefit.title}
              className="flex h-full flex-col gap-4 rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-6 transition hover:border-brand-link/60"
            >
              <div>{benefit.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-brand-text">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
