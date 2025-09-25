import { useState, useRef } from 'react';
import { Bitcoin, ArrowRight, CheckCircle, BookOpen, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

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

      {/* Header */}
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
            <a href="#course" className="text-gray-300 hover:text-white transition-colors">Course Details</a>
          </nav>
          <button
            onClick={openModal}
            className="hidden md:flex items-center space-x-2 bg-cyan-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
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
                onClick={scrollToVideo}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-xl shadow-purple-500/30"
              >
                <span>Watch Free Course</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={openModal}
                className="w-full sm:w-auto bg-white/10 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/20 transition-colors text-lg"
              >
                Book a 1-on-1
              </button>
            </div>
          </div>
        </section>

        {/* AdSense Placement 1 */}
        <div className="my-12 max-w-4xl mx-auto px-6">
          <div className="bg-gray-800/50 border border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center text-gray-500">
            Ad Placeholder (e.g., Display Ad)
          </div>
        </div>

        {/* Video Section */}
        <section id="video" ref={videoSectionRef} className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-2xl shadow-2xl shadow-black/50 overflow-hidden border-2 border-cyan-500/50">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/YedarEr3xq4"
                title="YouTube video player for MonteCrypto Course"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* Premium Course Section */}
        <section id="course" className="px-6 py-16">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">Ready to Go Premium?</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Our premium course gives you everything you need to succeed, including personalized coaching and advanced strategies.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Advanced trading strategies & risk management",
                  "Personalized portfolio review",
                  "Priority email support for 45 days"
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={openModal}
                className="flex items-center space-x-2 bg-cyan-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
              >
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
              <button
                onClick={openModal}
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity text-lg"
              >
                Get Instant Access
              </button>
            </div>
          </div>
        </section>

        {/* AdSense Placement 2 */}
        <div className="my-12 max-w-7xl mx-auto px-6">
          <div className="bg-gray-800/50 border border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center text-gray-500">
            Ad Placeholder (e.g., In-article Ad)
          </div>
        </div>

        {/* Benefits Section */}
        <section id="benefits" className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white">Why Choose MonteCrypto?</h2>
              <p className="text-lg text-gray-300 mt-2">Simple, effective, and designed for results.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
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
              ].map((benefit) => (
                <div key={benefit.title} className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            © 2024 MonteCrypto. All rights reserved. | Learn. Trade. Prosper.
          </p>
          <div className="flex justify-center space-x-6">
            <span className="text-gray-500 text-sm">Free Course Available</span>
            <span className="text-gray-500 text-sm">Premium Coaching</span>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">Book Your Session</h3>
              <button 
                onClick={closeModal}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {!hasPaid ? (
              // Step 1: Payment View
              <div>
                <p className="text-gray-300 mb-6">
                  To book your premium session, please complete your payment using one of the options below.
                </p>
                <div className="space-y-4">
                  <a
                    href="https://commerce.coinbase.com/checkout/e9ab3e94-246d-4269-959b-f22594bb07aa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Pay with Crypto ($200)
                  </a>
                  {/* PayPal Button Form */}
                  <form action="https://www.paypal.com/ncp/payment/UU7PJQU44NA2U" method="post" target="_blank" className="contents">
                    <button type="submit" className="w-full text-center bg-[#FFD140] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                      Pay with PayPal / Card ($300)
                    </button>
                  </form>
                </div>
                <button
                  onClick={() => setHasPaid(true)}
                  className="mt-8 w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  I Have Paid, Continue to Booking
                </button>
              </div>
            ) : (
              // Step 2: Booking View
              <div>
                <p className="text-gray-300 mb-6">
                  Thank you for your payment! Please select a time below to schedule your session.
                </p>
                {/* Calendly Inline Widget Placeholder */}
                <div className="calendly-inline-widget bg-white rounded-lg"
                     data-url="https://calendly.com/abitofadviceconsulting/crypto-coaching-session"
                     style={{ minWidth: '320px', height: '700px' }}>
                </div>
              </div>
            )}

            <button
              onClick={closeModal}
              className="mt-6 w-full bg-white/10 text-white font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
