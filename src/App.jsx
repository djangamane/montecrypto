'use client';
import { useState, useRef, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { VideoSection } from "./components/VideoSection.jsx";
import { PremiumCourse } from "./components/PremiumCourse.jsx";
import { ScamShooterVideo } from "./components/ScamShooterVideo.jsx";
import { Benefits } from "./components/Benefits.jsx";
import { Footer } from "./components/Footer.jsx";
import { BookingModal } from "./components/BookingModal.jsx";
import { ScamLikelyGate } from "./components/scam_likely/ScamLikelyGate.jsx";
import { NewsletterGate } from "./components/newsletter/NewsletterGate.jsx";
import { useSupabaseSession } from "./hooks/useSupabaseSession.js";
import { AboutSection } from "./components/AboutSection.jsx";
import { Pricing } from "./components/Pricing.jsx";
import { PhotoCarousel } from "./components/PhotoCarousel.jsx";
import { Certificate } from "./components/Certificate.jsx";
import { CallToAction } from "./components/CallToAction.jsx";

import { ThankYou } from "./components/ThankYou.jsx";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const riskSectionRef = useRef(null);
  const courseSectionRef = useRef(null);
  const newsletterSectionRef = useRef(null);
  const { session, isLoading: isSessionLoading } = useSupabaseSession();

  useEffect(() => {
    if (window.location.pathname === '/thankyou') {
      setShowThankYou(true);
    }
  }, []);

  if (showThankYou) {
    return <ThankYou />;
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setHasPaid(false);
  };

  const scrollToRisk = () => {
    riskSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCourse = () => {
    courseSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNewsletter = () => {
    newsletterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Header onBookNowClick={openModal} session={session} isSessionLoading={isSessionLoading} />

      <main>
        <Hero onRunRiskCheck={scrollToRisk} onStartCourse={scrollToCourse} />

        <ScamShooterVideo />

        <VideoSection ref={courseSectionRef} />

        <PremiumCourse onBookNowClick={openModal} />

        <section id="risk-meter" ref={riskSectionRef} className="px-6 py-16">
          <div className="mx-auto max-w-6xl rounded-3xl border border-brand-muted/30 bg-white/85 p-8 shadow-xl">
            <ScamLikelyGate onScrollToNewsletter={scrollToNewsletter} />
          </div>
        </section>

        <Pricing session={session} />

        <CallToAction onClick={scrollToRisk} />

        <section
          id="newsletter"
          ref={newsletterSectionRef}
          className="px-6 pb-16"
        >
          <div className="mx-auto max-w-6xl rounded-3xl border border-brand-muted/30 bg-white/85 p-10 shadow-xl">
            <NewsletterGate />
          </div>
        </section>

        <Benefits />

        <AboutSection />
        <PhotoCarousel />
        <Certificate />
        <CallToAction onClick={scrollToRisk} />
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
