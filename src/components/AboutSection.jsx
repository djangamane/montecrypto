import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", {
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden bg-brand-primary px-6 py-32 md:px-20"
    >
      {/* Parallax Texture */}
      <div className="absolute inset-0 z-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2064"
          alt="Abstract Texture"
          className="h-full w-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-brand-primary/80" />
      </div>

      <div ref={textRef} className="relative z-10 mx-auto max-w-5xl text-center space-y-12">
        <div className="reveal-text text-sm font-bold uppercase tracking-[0.4em] text-white/40">
          The Manifesto
        </div>

        <div className="reveal-text space-y-8">
          <p className="text-2xl font-medium text-white/60 md:text-3xl">
            Most crypto analysts focus on: <span className="text-white">Price action and artificial hype.</span>
          </p>
          <p className="font-drama text-5xl italic leading-tight text-white md:text-7xl lg:text-8xl">
            We focus on: <span className="text-brand-accent underline decoration-brand-accent/30 underline-offset-8">Differentiated Evidence.</span>
          </p>
        </div>

        <div className="reveal-text mx-auto max-w-2xl text-lg leading-relaxed text-white/40 md:text-xl">
          We built Montecrypto because the loudest voices in the room are often the ones trying to sell you a scam.
          Our protocol strips away the marketing and exposes the underlying risk mechanics.
        </div>
      </div>
    </section>
  );
}
