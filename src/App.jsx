import { useState, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { AdPlaceholder } from './components/AdPlaceholder.jsx';
import { VideoSection } from './components/VideoSection.jsx';
import { PremiumCourse } from './components/PremiumCourse.jsx';
import { Benefits } from './components/Benefits.jsx';
import { Footer } from './components/Footer.jsx';
import { BookingModal } from './components/BookingModal.jsx';
import { ScamLikelyGate } from './components/scam_likely/ScamLikelyGate.jsx';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const videoSectionRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset payment status when modal is closed
    setHasPaid(false);
  };

  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden scroll-smooth">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-indigo-400 rounded-full blur-lg animate-pulse delay-1000"></div>
      </div>

      <Header onBookNowClick={openModal} />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero onWatchCourseClick={scrollToVideo} onBookNowClick={openModal} />

        <AdPlaceholder label="Ad Placeholder (e.g., Display Ad)" />

        <VideoSection ref={videoSectionRef} />

        <PremiumCourse onBookNowClick={openModal} />

        <AdPlaceholder label="Ad Placeholder (e.g., In-article Ad)" />

        <Benefits />

        <section id="scam-likely" className="px-6 pb-24">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
                Product Preview
              </p>
              <h2 className="mt-3 text-4xl font-bold text-white">
                Scam Likely Detector (Alpha)
              </h2>
              <p className="mt-4 text-base text-slate-300">
                Prototype of the self-hosted investigation console that combines
                on-chain analytics, open-source intelligence, social sentiment, and
                institutional interest into one clear scam meter.
              </p>
            </div>
            <ScamLikelyGate />
          </div>
        </section>
      </main>

      <Footer />

      <BookingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        hasPaid={hasPaid}
        onSetHasPaid={setHasPaid}
      />
      <Analytics />
    </div>
  );
}

export default App;
