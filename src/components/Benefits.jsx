import { BookOpen, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const benefitItems = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-cyan-400" />,
    title: 'Gemini-Powered Scam Scanner',
    description: 'Run institutional-grade risk assessments on any token with the Scam Likely engine.'
  },
  {
    icon: <Zap className="w-10 h-10 text-cyan-400" />,
    title: 'Weekly Scam Watch Alerts',
    description: 'Receive curated intelligence every Friday so you can act before the grifters do.'
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-cyan-400" />,
    title: 'Proven Growth Playbook',
    description: 'Follow the premium course and frameworks we use with private coaching clients.'
  },
  {
    icon: <BookOpen className="w-10 h-10 text-cyan-400" />,
    title: 'Flexible Membership',
    description: 'Choose $10/month or $100/year — cancel anytime or lock in annual savings.'
  }
];

export function Benefits() {
  return (
    <section id="benefits" className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Why Choose the MonteCrypto Membership?</h2>
          <p className="text-lg text-gray-300 mt-2">Security research, coaching, and automation in one subscription.</p>
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
