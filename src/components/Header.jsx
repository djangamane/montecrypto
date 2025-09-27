import { Bitcoin, ArrowRight } from 'lucide-react';

export function Header({ onBookNowClick }) {
  return (
    <header className="relative z-10 px-6 py-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Bitcoin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MonteCrypto</h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#video" className="text-gray-300 hover:text-white transition-colors">Watch Video</a>
          <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
          <a href="#scam-likely" className="text-gray-300 hover:text-white transition-colors">Scam Watch</a>
          <a href="#course" className="text-gray-300 hover:text-white transition-colors">Course Details</a>
        </nav>
        <button onClick={onBookNowClick} className="hidden md:flex items-center space-x-2 bg-cyan-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30">
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
