import { BookOpen, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const benefitItems = [
  {
    icon: <BookOpen className="w-10 h-10 text-cyan-400" />,
    title: "Structured Learning",
    description: "A clear, step-by-step curriculum that's easy to follow."
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-cyan-400" />,
    title: "Market Insights",
    description: "Learn to analyze market trends and make informed decisions."
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-cyan-400" />,
    title: "Risk Management",
    description: "Protect your capital with proven risk management techniques."
  },
  {
    icon: <Zap className="w-10 h-10 text-cyan-400" />,
    title: "Actionable Skills",
    description: "Walk away with practical skills and confidence to navigate crypto markets."
  }
];

export function Benefits() {
  return (
    <section id="benefits" className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Why Choose MonteCrypto?</h2>
          <p className="text-lg text-gray-300 mt-2">Simple, effective, and designed for results.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefitItems.map((benefit) => (
            <div key={benefit.title} className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all">
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-300">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}