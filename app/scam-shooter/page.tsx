"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gamepad2, Shield, Sparkles, Target, Zap } from "lucide-react";

const plans = [
  { name: "Monthly", price: "$19.99", daily: "≈ 66¢/day", link: "https://buy.stripe.com/7sY00k7HN7xA4mU4ffcIE05" },
  { name: "Lifetime", price: "$299", daily: "One-time", link: "https://buy.stripe.com/8x228sd276twcTqcLLcIE06" },
];

const highlights = [
  { title: "Mandatory Briefing", body: "Onboarding drops you into the lesson-first briefing before any mission starts.", icon: Shield },
  { title: "Arcade Bonus", body: "Finish the mission, then smash the neon bonus round for extra XP and streaks.", icon: Gamepad2 },
  { title: "Live Scam Radar", body: "Gameplay pulls real red-flag patterns so every wave feels ripped from the headlines.", icon: Sparkles },
  { title: "Risk Power-Ups", body: "CEX and DEX drills baked into the loop to harden your instincts under pressure.", icon: Target },
];

const rewards = [
  "Mandatory lesson videos per level before missions",
  "Scam Shooter gameplay with in-mission quizzes and arcade bonus",
  "Practice mode + CEX/DEX simulators",
  "Retro achievements and XP to track your streak",
];

const onboardingTarget = process.env.NEXT_PUBLIC_SCAM_SHOOTER_ONBOARDING_URL || "/game?start=onboarding";
const onboardingHref: { pathname: "/thank-you"; query: { next: string } } = {
  pathname: "/thank-you",
  query: { next: onboardingTarget },
};

export default function ScamShooterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-arcade-midnight via-[#0c152f] to-[#07121f] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(88,231,255,0.18), transparent 30%), radial-gradient(circle at 80% 10%, rgba(255,77,163,0.16), transparent 28%), radial-gradient(circle at 70% 70%, rgba(106,90,205,0.12), transparent 28%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,77,163,0.12),transparent),linear-gradient(90deg,rgba(24,224,255,0.12),transparent)] opacity-50" />

      <header className="relative w-full flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur border-b border-arcade-cyan/20">
        <div className="font-heading text-xl tracking-widest flex items-center gap-3 text-arcade-cyan">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-arcade-cyan/40 bg-arcade-cyan/10 shadow-[0_0_25px_rgba(24,224,255,0.3)]">
            ⚠
          </span>
          SCAM SHOOTER
        </div>
        <div className="flex gap-3 text-sm font-mono">
          <Link href="/" className="text-gray-300 hover:text-white">Log In</Link>
          <Link href="/" className="text-gray-300 hover:text-white">Back</Link>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-12 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-arcade-pink/60 bg-arcade-pink/10 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-arcade-pink shadow-[0_0_20px_rgba(255,77,163,0.2)]">
              Play Scam Shooter!
              <span className="h-1 w-1 rounded-full bg-arcade-pink animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading leading-tight text-white drop-shadow-[0_4px_25px_rgba(24,224,255,0.2)]">
              Train. Hunt Scams.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-arcade-pink via-arcade-yellow to-arcade-cyan">
                Level Up.
              </span>
            </h1>
            <p className="text-gray-200 font-mono text-sm leading-relaxed">
              Scam Shooter blends mandatory lesson videos with arcade-style gameplay. Watch the briefing, clear the mission with in-game quizzes, then hit the neon bonus round to stress-test your instincts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={onboardingHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-arcade-pink via-arcade-yellow to-arcade-cyan text-black font-heading tracking-wider shadow-[0_12px_45px_rgba(24,224,255,0.35)] hover:scale-105 transition-transform"
              >
                Play Scam Shooter Now!
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#experience"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-arcade-cyan/50 bg-white/5 text-arcade-cyan font-heading tracking-wide hover:bg-arcade-cyan/10 transition-colors"
              >
                Mission Brief
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-mono">
              {[
                { label: "Lesson-first onboarding", value: "90 sec" },
                { label: "Arcade bonus round", value: "Every level" },
                { label: "Skill checks", value: "Quizzes + sims" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 shadow-[0_6px_30px_rgba(0,0,0,0.35)]">
                  <div className="text-xs uppercase tracking-wide text-gray-400">{item.label}</div>
                  <div className="text-lg text-arcade-cyan">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-full h-full">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-arcade-cyan/20 via-transparent to-arcade-pink/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-arcade-cyan/30 bg-gradient-to-br from-[#0d1a37] via-[#0b1126] to-[#070d18] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent)] opacity-60" />
              <Image
                src="/scam_shooter1.png"
                alt="Scam Shooter"
                width={900}
                height={650}
                className="w-full h-full object-cover relative"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-between">
                <div className="text-sm font-mono text-arcade-cyan">Retro Arcade Build</div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-gray-200">
                  <Zap className="w-4 h-4 text-arcade-pink" />
                  Neon difficulty
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 shadow-[0_12px_45px_rgba(0,0,0,0.45)] hover:border-arcade-cyan/60 transition-colors"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,224,255,0.12),transparent_35%)] opacity-60" />
              <div className="relative flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-arcade-cyan/15 p-2 text-arcade-cyan shadow-[0_0_20px_rgba(24,224,255,0.35)]">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-heading tracking-wide text-white">{item.title}</div>
                  <p className="text-sm text-gray-300 font-mono leading-relaxed">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section id="pricing" className="relative overflow-hidden rounded-2xl border border-arcade-cyan/30 bg-gradient-to-br from-[#0d1b3a] via-[#0a1228] to-[#050b15] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,77,163,0.08),transparent),linear-gradient(-135deg,rgba(24,224,255,0.08),transparent)] opacity-60" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading text-arcade-cyan">Choose your cartridge</h2>
                <p className="text-gray-300 font-mono text-sm">Pick a plan to unlock Scam Shooter and the full curriculum.</p>
              </div>
              <Link
                href={onboardingHref}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-arcade-pink/60 bg-arcade-pink/15 text-arcade-pink font-heading tracking-wide hover:bg-arcade-pink/25 transition-colors"
              >
                Jump to Onboarding
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-5 flex flex-col gap-3 shadow-[0_12px_45px_rgba(0,0,0,0.5)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(255,77,163,0.12),transparent_35%)] opacity-70" />
                  <div className="relative flex items-center justify-between">
                    <div className="text-lg font-heading tracking-wider">{plan.name}</div>
                    <div className="text-xs font-mono text-arcade-cyan">{plan.daily}</div>
                  </div>
                  <div className="relative text-4xl font-heading text-arcade-pink drop-shadow-[0_0_20px_rgba(255,77,163,0.35)]">
                    {plan.price}
                  </div>
                  <p className="relative text-sm text-gray-300 font-mono">Full Scam Shooter access + arcade bonus rounds.</p>
                  <a
                    href={plan.link}
                    className="relative mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-arcade-cyan to-arcade-pink text-black font-heading tracking-wide shadow-[0_10px_40px_rgba(24,224,255,0.35)] hover:scale-105 transition-transform"
                  >
                    Buy via Stripe
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <h3 className="text-xl font-heading text-arcade-pink mb-3">What you get</h3>
            <ul className="space-y-3">
              {rewards.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-200 font-mono">
                  <span className="mt-1 h-2 w-2 rounded-full bg-arcade-cyan shadow-[0_0_12px_rgba(24,224,255,0.6)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-arcade-cyan/40 bg-gradient-to-b from-[#0f1a35] via-[#0a1125] to-[#050b16] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex flex-col gap-3">
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-arcade-cyan">Retro HUD</div>
            <div className="text-3xl font-heading text-white">Arcade Ready</div>
            <p className="text-sm text-gray-300 font-mono">
              Neon UI, CRT overlays, and a soundtrack-ready vibe that feels like a 90s cabinet—just swap your quarters for XP.
            </p>
            <div className="flex items-center gap-2 text-arcade-pink font-heading">
              <Zap className="w-5 h-5" />
              Pixel-perfect & vibrant
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
