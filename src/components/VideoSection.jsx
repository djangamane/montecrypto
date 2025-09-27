import { forwardRef } from 'react';

const VideoSectionComponent = forwardRef((props, ref) => {
  return (
    <section id="course" ref={ref} className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-brand-muted/30 bg-white/80 p-8 shadow-lg lg:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-link/70">Best Free Crypto Course</p>
          <h2 className="text-3xl font-heading uppercase text-brand-text">Decode risk before you trade</h2>
          <p className="text-base leading-relaxed text-brand-muted">
            Watch the three-part course trusted by thousands of students since 2017. You will learn how to
            read token mechanics, spot suspicious flows, and combine on-chain and off-chain clues without
            falling for hype cycles.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-brand-muted/90">
            <li>Bitcoin fundamentals, philosophy, and practical safeguards.</li>
            <li>How to layer on-chain, social, off-chain, and institutional signals.</li>
            <li>Simple practices that keep your wallets and reputation safer.</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-brand-muted/40 shadow">
          <div className="aspect-w-16 aspect-h-9 bg-brand-bg">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/YedarEr3xq4"
              title="AI Crypto Risk Assessment course overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
});

export { VideoSectionComponent as VideoSection };
