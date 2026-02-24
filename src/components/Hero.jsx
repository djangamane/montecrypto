import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";

export function Hero({ onRunRiskCheck, onStartCourse }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });

      tl.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        stagger: 0.15,
      })
        .from(".hero-bg", {
          scale: 1.1,
          opacity: 0,
          duration: 2,
          ease: "power2.out"
        }, 0);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative h-screen min-h-[700px] w-full overflow-hidden bg-brand-primary"
    >
      {/* Background with Dark Overlay */}
      <div className="hero-bg absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
          alt="Technical Grid Background"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/40 to-transparent" />
      </div>

      {/* Content Layout: Bottom-Left Third */}
      <div className="relative z-10 flex h-full w-full items-end pb-24 px-6 md:px-20">
        <div className="hero-content max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-brand-accent/30 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            <span>Precision Intelligence Meets</span>
          </div>

          <h1 className="flex flex-col leading-none">
            <span className="text-5xl font-extrabold uppercase tracking-tight text-white md:text-7xl lg:text-8xl">
              AI Powered
            </span>
            <span className="font-drama -mt-2 text-6xl italic text-brand-accent md:-mt-4 md:text-8xl lg:text-[11rem]">
              Security.
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-ivory/80 md:text-xl">
            Eradicate hype. Embrace evidence. Our four-analyzer engine audits on-chain,
            social, and institutional signals to protect your digital portfolio.
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <button
              onClick={onRunRiskCheck}
              className="btn-magnetic group flex items-center justify-center gap-3 rounded-full bg-brand-accent px-8 py-5 text-sm font-bold uppercase tracking-widest text-brand-text shadow-2xl transition-all hover:bg-brand-accent/90"
            >
              <span>Initiate Audit</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onStartCourse}
              className="btn-magnetic rounded-full border border-white/20 bg-white/5 px-8 py-5 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              Explore Alpha
            </button>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <span className="flex items-center gap-1.5 line-before">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              System Operational
            </span>
            <span>Est. 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
}
