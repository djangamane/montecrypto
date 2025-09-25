import { ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  "Advanced trading strategies & risk management",
  "Personalized portfolio review",
  "Priority email support for 45 days"
];

export function PremiumCourse({ onBookNowClick }) {
  return (
    <section id="course" className="px-6 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Go Premium?</h2>
          <p className="text-gray-300 mb-6 text-lg">
            Our premium course gives you everything you need to succeed, including personalized coaching and advanced strategies.
          </p>
          <ul className="space-y-4 mb-8">
            {features.map((item) => (
              <li key={item} className="flex items-center space-x-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button onClick={onBookNowClick} className="flex items-center space-x-2 bg-cyan-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30">
            <span>Book Your Premium Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
          <h3 className="text-3xl font-bold text-white mb-2">Premium Coaching Session</h3>
          <p className="text-gray-400 mb-6">with 45 day call/email support</p>
          <div className="flex items-baseline space-x-2 mb-6">
            <span className="text-5xl font-extrabold text-white">$200</span>
            <span className="text-gray-400">USD</span>
          </div>
          <button onClick={onBookNowClick} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity text-lg">
            Get Instant Access
          </button>
        </div>
      </div>
    </section>
  );
}