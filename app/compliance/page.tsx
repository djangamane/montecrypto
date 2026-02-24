"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Lock, Eye, CheckCircle, AlertTriangle, ArrowLeft, Terminal, FileText } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function CompliancePage() {
    const pageRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance Animations
            gsap.from(".reveal-item", {
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: "power3.out",
            });

            // Stacking Cards Effect (Simplified for Montecrypto)
            gsap.utils.toArray<HTMLElement>(".compliance-card").forEach((card, i) => {
                ScrollTrigger.create({
                    trigger: card,
                    start: "top 80%",
                    onEnter: () => card.classList.add("active"),
                });
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <main ref={pageRef} className="min-h-screen bg-brand-primary pb-32 pt-32 px-6 md:px-20 text-white selection:bg-brand-accent/30">
            {/* Background Noise & Gradients */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(201,168,76,0.05),_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(42,42,53,0.1),_transparent_50%)]" />
            </div>

            {/* Navigation */}
            <nav className="reveal-item mb-16 flex items-center justify-between relative z-10">
                <Link
                    href="/"
                    className="btn-magnetic flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-accent transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Terminal
                </Link>
                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(201,168,76,0.6)] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Protocol Governance v1.0</span>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="reveal-item mb-24 max-w-4xl relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-accent/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-accent">
                    <Lock className="h-3 w-3" />
                    Transparency Disclosure
                </div>
                <h1 className="text-5xl font-extrabold uppercase tracking-tight text-white md:text-7xl lg:text-8xl flex flex-col mb-8">
                    <span>Trust</span>
                    <span className="font-drama italic text-brand-accent -mt-2 md:-mt-4">By Verification.</span>
                </h1>
                <p className="max-w-xl text-xl leading-relaxed text-white/40">
                    At Montecrypto, our intelligence is built on open standards and verifiable risk frameworks.
                    We adhere to the EU AI Act and maintain rigorous data sovereignty protocols.
                </p>
            </header>

            {/* Trust Indicators Table */}
            <section className="reveal-item mb-32 grid gap-4 grid-cols-2 md:grid-cols-4 relative z-10">
                {[
                    { icon: <Lock className="h-5 w-5" />, label: "EU AI Act Ready", detail: "Article 53 Compliant" },
                    { icon: <Shield className="h-5 w-5" />, label: "AES-256 Validated", detail: "Encrypted at Rest" },
                    { icon: <Eye className="h-5 w-5" />, label: "Human Oversight", detail: "Required on All Intel" },
                    { icon: <CheckCircle className="h-5 w-5" />, label: "SOC 2 Type II", detail: "Alignment Pending" },
                ].map((item, i) => (
                    <div key={i} className="group p-6 rounded-premium border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-brand-accent/20">
                        <div className="mb-4 text-brand-accent">{item.icon}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{item.label}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/30">{item.detail}</div>
                    </div>
                ))}
            </section>

            {/* Main Content: The Disclosure Terminal */}
            <div className="grid gap-12 lg:grid-cols-3 relative z-10">

                {/* Left: Frameworks Sidebar */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="reveal-item sticky top-32 space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Active Frameworks</h3>
                            <div className="space-y-2">
                                {['NIST AI RMF', 'EU AI Act 2024', 'ISO 42001', 'GDPR Node 4'].map((f) => (
                                    <div key={f} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-data">
                                        <span className="text-white/60">{f}</span>
                                        <span className="text-green-500">ACTIVE</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-premium border border-brand-accent/20 bg-brand-accent/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-brand-accent mb-2">Alpha Warning</h4>
                            <p className="text-xs leading-relaxed text-brand-accent/70">
                                All AI analysis is probabilistic. Risk scores represent statistical anomalies and should not be taken as financial advice. Human verification is mandatory.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Right: The Manifesto / Sections */}
                <section className="lg:col-span-2 space-y-24">
                    {/* Section 1: EU AI Act */}
                    <article id="eu-ai-act" className="compliance-card space-y-8 opacity-0 translate-y-8 transition-all duration-700">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent">Protocol 01</div>
                        <h2 className="text-3xl font-bold md:text-5xl uppercase tracking-tighter">EU AI Act Conformance</h2>
                        <div className="prose prose-invert prose-brand max-w-none text-white/60 font-data text-sm leading-relaxed">
                            <p>
                                Montecrypto operates as a <strong>High-Transparency Information Service</strong> under Article 53 of the EU AI Act (2024).
                                We provide systemic risk analysis without automated decision-making.
                            </p>
                            <ul className="grid gap-4 md:grid-cols-2 mt-8">
                                {[
                                    { title: "Transparency", text: "We disclose upstream model usage (OpenAI/Gemini) and training metadata." },
                                    { title: "Governance", text: "Detailed technical documentation available for institutional audit." },
                                    { title: "Copyright", text: "Verified ingestion pipelines ensuring training data compliance." },
                                    { title: "Summaries", text: "Public disclosure of model parameters for risk classification." }
                                ].map((item) => (
                                    <li key={item.title} className="list-none p-4 rounded-xl bg-white/5 border border-white/5">
                                        <strong className="text-white block mb-1 uppercase tracking-widest text-[10px]">{item.title}</strong>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>

                    {/* Section 2: Data Sovereignty */}
                    <article className="compliance-card space-y-8 opacity-0 translate-y-8 transition-all duration-700">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent">Protocol 02</div>
                        <h2 className="text-3xl font-bold md:text-5xl uppercase tracking-tighter">Data Residency & Sovereignty</h2>
                        <div className="grid gap-8 p-8 rounded-premium bg-white/5 border border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 text-white">
                                    <Terminal className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Vault Storage</h4>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        All user metadata is encrypted using AES-256 standard and stored within EU-West regions (Ireland/Frankfurt) to ensure GDPR compliance.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 text-white">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Zero-Log Ingestion</h4>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        Risk scans are processed in-memory. We do not store contract source code or private API responses beyond the immediate analysis window.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Section 3: Human Oversight */}
                    <article className="compliance-card space-y-8 opacity-0 translate-y-8 transition-all duration-700">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent">Protocol 03</div>
                        <h2 className="text-3xl font-bold md:text-5xl uppercase tracking-tighter">Human-in-the-loop (HITL)</h2>
                        <div className="p-8 rounded-premium bg-gradient-to-r from-brand-accent/10 to-transparent border border-brand-accent/20">
                            <p className="text-sm italic font-data text-white/80 leading-relaxed">
                                &ldquo;A computer is a bicycle for the mind, but the human remains the pilot.&rdquo;
                            </p>
                            <div className="mt-6 flex flex-col gap-4">
                                <p className="text-xs text-white/40">
                                    Our &ldquo;Risk Score&rdquo; is a recommendation engine. Final capital allocation decisions must be approved by a human operator.
                                    The Montecrypto Alpha engine reports hallucinations in 0.04% of high-volatility contexts.
                                </p>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-accent">
                                    <CheckCircle className="h-4 w-4" />
                                    Verified AI-Human Handover
                                </div>
                            </div>
                        </div>
                    </article>
                </section>
            </div>

            {/* Footer / Contact */}
            <footer className="reveal-item mt-32 pt-16 border-t border-white/10 text-center space-y-8">
                <h3 className="text-2xl font-bold uppercase tracking-widest">Compliance Registry</h3>
                <p className="max-w-md mx-auto text-sm text-white/40">
                    Need a SOC 2 bridge letter or a detailed technical audit of our risk weighting algorithms?
                    Contact our compliance node.
                </p>
                <button className="btn-magnetic rounded-full bg-white px-10 py-4 text-xs font-black uppercase tracking-[0.2em] text-brand-primary">
                    Open Governance Channel
                </button>
            </footer>

            <style jsx>{`
        .compliance-card.active {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
        </main>
    );
}
