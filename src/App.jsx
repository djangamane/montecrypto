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
import { NewsletterGate } from './components/newsletter/NewsletterGate.jsx';
import { AdminAccessModal } from './components/AdminAccessModal.jsx';
import { AboutSection } from './components/AboutSection.jsx';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const riskSectionRef = useRef(null);
  const courseSectionRef = useRef(null);
  const newsletterSectionRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setHasPaid(false);
  };

  const scrollToRisk = () => {
    riskSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCourse = () => {
    courseSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToNewsletter = () => {
    newsletterSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Header onBookNowClick={openModal} />

      <main>
        <Hero onRunRiskCheck={scrollToRisk} onStartCourse={scrollToCourse} />

        <VideoSection ref={courseSectionRef} />

        <AdPlaceholder label="Responsive in-content ad" />

        <section id="risk-meter" ref={riskSectionRef} className="px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-3xl border border-brand-muted/30 bg-white/85 p-8 shadow-xl">
              <ScamLikelyGate onScrollToNewsletter={scrollToNewsletter} />
            </div>
            <aside className="space-y-6">
              <AdPlaceholder label="Sponsored research placement" />
              <div className="rounded-3xl border border-dashed border-brand-muted/40 bg-brand-bg/60 p-6 text-sm text-brand-muted">
                <p className="font-semibold text-brand-text">AdSense placement (desktop)</p>
                <p className="mt-2">Swap this block with a responsive unit once live.</p>
              </div>
            </aside>
          </div>
        </section>

        <PremiumCourse onBookNowClick={openModal} />

        <section id="newsletter" ref={newsletterSectionRef} className="px-6 pb-16">
          <div className="mx-auto max-w-6xl rounded-3xl border border-brand-muted/30 bg-white/85 p-10 shadow-xl">
            <NewsletterGate />
          </div>
        </section>

        <Benefits />

        <AboutSection />
      </main>

      <Footer />

      <BookingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        hasPaid={hasPaid}
        onSetHasPaid={setHasPaid}
      />
      <AdminAccessModal isOpen={isAdminModalOpen} onClose={closeAdminModal} />

      <button
        type="button"
        onClick={openAdminModal}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-brand-muted/40 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-muted shadow backdrop-blur transition hover:border-brand-link hover:text-brand-text"
      >
        Admin
      </button>
      <Analytics />
    </div>
  );
}

export default App;
