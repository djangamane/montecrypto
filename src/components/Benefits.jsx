import { ShieldHalf, ScrollText, Award, Users } from 'lucide-react';

const benefitItems = [
  {
    icon: <ShieldHalf className="h-9 w-9 text-brand-link" />,
    title: 'Seasoned risk scouts',
    description: 'We have tracked scams, rug pulls, and risk anomalies since 2017 across tokens, DAOs, and exchanges.'
  },
  {
    icon: <ScrollText className="h-9 w-9 text-brand-link" />,
    title: 'Evidence-backed briefings',
    description: 'Each run distills on-chain, social, and institutional patterns into guidance you can defend to clients or stakeholders.'
  },
  {
    icon: <Award className="h-9 w-9 text-brand-link" />,
    title: 'Weekly Scam Watch',
    description: 'Friday dispatch covering the top fraud trends, five tokens under review, and what our analysts are watching next.'
  },
  {
    icon: <Users className="h-9 w-9 text-brand-link" />,
    title: 'Trusted by teams',
    description: 'Used by educators, compliance desks, and family offices who rely on us for reliable alerts and training.'
  }
];

export function Benefits() {
  return (
    <section className="border-y border-brand-muted/20 bg-white/80 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-link/70">Why teams stay with us</p>
          <h2 className="mt-3 text-3xl font-heading uppercase text-brand-text">Experience first. Hype never.</h2>
          <p className="mt-2 text-base text-brand-muted">
            We have spent years dissecting scams, coaching investors, and helping teams flag risk before headlines break.
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
