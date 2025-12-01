import React from 'react';
import { ArrowRight } from 'lucide-react';

const plans = [
  { name: 'Monthly', price: '$19.99', daily: '≈ 66¢/day', link: 'https://buy.stripe.com/7sY00k7HN7xA4mU4ffcIE05' },
  { name: 'Lifetime', price: '$299', daily: 'One-time', link: 'https://buy.stripe.com/8x228sd276twcTqcLLcIE06' }
];

const ScamShooterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur border-b border-gray-800">
        <div className="font-retro text-xl text-arcade-cyan tracking-widest flex items-center gap-2">
          <img src="/assets/sprite_enemy1.png" alt="Scam Blob" className="w-6 h-6" />
          SCAM SHOOTER
        </div>
        <div className="flex gap-3">
          <a href="/signin" className="text-sm font-mono text-gray-300 hover:text-white">Log In</a>
          <a href="/" className="text-sm font-mono text-gray-300 hover:text-white">Back</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="text-arcade-pink font-retro text-xl uppercase">Play Scam Shooter!</div>
            <h1 className="text-4xl md:text-5xl font-retro text-white leading-tight">Train. Hunt Scams. Level Up.</h1>
            <p className="text-gray-300 font-mono text-sm leading-relaxed">
              Scam Shooter combines lesson videos, mandatory mission briefings, and arcade-style gameplay to teach you how to spot scams and manage risk. Complete levels, then test your nerve in the arcade.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/onboard"
                className="inline-flex items-center px-5 py-3 bg-arcade-cyan text-black font-retro rounded shadow hover:scale-105 transition-transform"
              >
                Enter Game <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center px-5 py-3 border border-arcade-cyan text-arcade-cyan font-retro rounded hover:bg-arcade-cyan/10"
              >
                View Pricing
              </a>
            </div>
          </div>
          <div className="w-full h-full">
            <img src="/scam_shooter1.png" alt="Scam Shooter" className="w-full rounded-lg border border-gray-800 shadow-xl" />
          </div>
        </section>

        <section id="pricing" className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-retro text-arcade-cyan">Pricing</h2>
          <p className="text-gray-400 font-mono text-sm">Pick a plan to unlock Scam Shooter and the full curriculum.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div key={plan.name} className="border border-gray-800 bg-black/60 p-4 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-retro text-white">{plan.name}</div>
                  <div className="text-sm text-gray-400 font-mono">{plan.daily}</div>
                </div>
                <div className="text-3xl font-retro text-arcade-pink">{plan.price}</div>
                <a
                  href={plan.link}
                  className="mt-auto inline-flex items-center justify-center px-4 py-2 bg-arcade-cyan text-black font-retro rounded shadow hover:scale-105 transition-transform"
                >
                  Buy via Stripe
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 space-y-3">
          <h3 className="text-xl font-retro text-arcade-pink">What you get</h3>
          <ul className="list-disc list-inside text-gray-300 font-mono text-sm space-y-1">
            <li>Mandatory lesson videos per level before missions</li>
            <li>Scam Shooter gameplay with in-mission quizzes and arcade bonus</li>
            <li>Practice mode + CEX/DEX simulators</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default ScamShooterPage;
