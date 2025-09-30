import { ArrowRight } from 'lucide-react';

export function CallToAction({ onClick }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-heading uppercase text-brand-text">
          Ready to Assess Your Risk?
        </h2>
        <p className="mt-2 text-base leading-relaxed text-brand-muted">
          Run your first scan and see what our AI tool can uncover.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-brand-text shadow transition hover:opacity-90"
          >
            <span>Get Your Risk Score</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
