import { useEffect, useRef, useState } from "react";
import { Shield, Zap, Target, Database, Activity } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ title, description, children, delay }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(cardRef.current, {
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      delay,
      ease: "power3.out",
    });
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-6 rounded-premium border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-xl"
    >
      <div className="space-y-2">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-white">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

const Shuffler = () => {
  const [items, setItems] = useState([
    { id: 1, label: "On-Chain Audit", status: "CRITICAL" },
    { id: 2, label: "Social Sentiment", status: "ELEVATED" },
    { id: 3, label: "Institutional Signal", status: "STABLE" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        next.unshift(next.pop());
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-40 overflow-hidden">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute w-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            top: `${i * 3.5}rem`,
            opacity: i === 0 ? 1 : 0.4,
            scale: i === 0 ? 1 : 0.95,
            zIndex: 3 - i
          }}
        >
          <div className="flex items-center justify-between rounded-xl bg-white/10 p-4 border border-white/5">
            <span className="font-data text-xs text-white">{item.label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
              item.status === 'ELEVATED' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
              }`}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Telemetry = () => {
  const [messages, setMessages] = useState([]);
  const fullText = [
    "> SCANNING LIQUIDITY POOLS...",
    "> DETECTING HONEYPOT SIGNATURES...",
    "> ANALYZING SOCIAL VELOCITY...",
    "> AUDIT COMPLETE: 84% RISK VARIANCE.",
  ];

  useEffect(() => {
    let currentLine = 0;
    let currentChar = 0;
    const interval = setInterval(() => {
      setMessages(prev => {
        const next = [...prev];
        if (!next[currentLine]) next[currentLine] = "";

        if (currentChar < fullText[currentLine].length) {
          next[currentLine] += fullText[currentLine][currentChar];
          currentChar++;
        } else {
          currentLine++;
          currentChar = 0;
          if (currentLine >= fullText.length) {
            currentLine = 0;
            return [];
          }
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl bg-black/40 p-4 font-data text-xs text-brand-accent h-40 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-accent" />
        <span className="uppercase tracking-widest opacity-60 text-[10px]">Live Telemetry Feed</span>
      </div>
      {messages.map((m, i) => (
        <div key={i} className="mb-1">{m}</div>
      ))}
      <span className="animate-pulse">_</span>
    </div>
  );
};

const ProtocolCursor = () => {
  const cursorRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(cursorRef.current, { x: 40, y: 30, duration: 1, ease: "power2.inOut", delay: 1 })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to(cursorRef.current, { scale: 1, duration: 0.1 })
        .to(".grid-cell-active", { backgroundColor: "rgba(201, 168, 76, 0.3)", duration: 0.3 })
        .to(cursorRef.current, { x: 100, y: 80, duration: 1.2, ease: "power2.inOut" })
        .to(cursorRef.current, { opacity: 0, duration: 0.5, delay: 0.5 });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={gridRef} className="relative rounded-xl bg-white/5 p-4 border border-white/5 h-40">
      <div className="grid grid-cols-7 gap-1">
        {[...Array(21)].map((_, i) => (
          <div key={i} className={`h-8 rounded-sm bg-white/5 border border-white/5 ${i === 4 ? 'grid-cell-active' : ''}`} />
        ))}
      </div>
      <div
        ref={cursorRef}
        className="absolute pointer-events-none z-10"
        style={{ top: '20px', left: '20px' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 1L16 11L10 12L7 17L4 1Z" fill="white" stroke="black" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export function Benefits() {
  return (
    <section id="benefits" className="bg-brand-primary px-6 py-24 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl space-y-4">
          <h2 className="text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
            Protocol <span className="font-drama italic text-brand-accent">Excellence.</span>
          </h2>
          <p className="text-lg text-white/50">
            More than a scanner. A digital instrument for institutional-grade portfolio defense.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            title="Intelligence"
            description="Our shuffler audits multi-layer signals for maximum signal-to-noise ratio."
            delay={0}
          >
            <Shuffler />
          </FeatureCard>

          <FeatureCard
            title="Telemetry"
            description="Real-time execution logs from our distributed risk analysis network."
            delay={0.15}
          >
            <Telemetry />
          </FeatureCard>

          <FeatureCard
            title="Persistence"
            description="Scheduled audits ensure your strategy remains resilient against flash volatility."
            delay={0.3}
          >
            <ProtocolCursor />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
