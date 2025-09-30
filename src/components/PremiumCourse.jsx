import { ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  'Deep-dive token dissection with your own portfolio examples',
  'Automatic access to the AI Crypto Risk tool plus weekly Scam Watch briefings',
  '45 days of follow-up office hours for implementation questions',
];

export function PremiumCourse({ onBookNowClick }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-brand-muted/30 bg-white/85 p-10 shadow-xl lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-link/70">Premium coaching</p>
          <h2 className="text-3xl font-heading uppercase text-brand-text">One-on-one risk operations build-out</h2>
          <p className="text-base leading-relaxed text-brand-muted">
            Upgrade from the free playbook to a private working session. We audit your current process, design a
            resilient risk operations workflow, and equip your team with reusable checklists.
          </p>
          <ul className="space-y-3 text-sm text-brand-muted/90">
            {features.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-link" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onBookNowClick}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-link px-5 py-3 text-sm font-semibold text-brand-link transition hover:bg-brand-link hover:text-brand-bg"
          >
            <span>Book your private session</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col justify-between rounded-3xl border border-brand-muted/40 bg-brand-bg/60 p-8">
          <div>
            <h3 className="text-2xl font-heading uppercase text-brand-text">Premium coaching session</h3>
            <p className="mt-2 text-sm text-brand-muted">Includes 45 days of follow-up support</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-heading uppercase text-brand-text">$500</span>
              <span className="text-base font-medium text-brand-muted">USD</span>
            </div>
            <p className="mt-3 text-sm text-brand-muted">
              Prefer to pay in Bitcoin? Secure your spot for <strong className="font-semibold text-brand-text">$350</strong>
              when paying on-chain. Dollar and Bitcoin options open in new tabs.
            </p>
          </div>
          <button
            type="button"
            onClick={onBookNowClick}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-brand-text shadow transition hover:opacity-90"
          >
            Reserve your session
          </button>
        </div>
      </div>
    </section>
  );
}
