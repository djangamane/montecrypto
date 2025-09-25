import { ArrowRight } from 'lucide-react';

export function Hero({ onWatchCourseClick, onBookNowClick }) {
  return (
    <section className="px-6 py-24 text-center text-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
          Unlock the Secrets of Crypto Trading
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Master the markets with our exclusive, easy-to-follow video course. Go from beginner to pro in just a few hours.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onWatchCourseClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-xl shadow-purple-500/30"
          >
            <span>Watch Free Course</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={onBookNowClick} className="w-full sm:w-auto bg-white/10 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/20 transition-colors text-lg">
            Book a 1-on-1
          </button>
        </div>
      </div>
    </section>
  );
}