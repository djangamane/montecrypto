import { useState, useEffect, useRef } from "react";
import { Shield, ArrowRight, Menu, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeaderAuthBar } from "./auth/HeaderAuthBar.jsx";

gsap.registerPlugin(ScrollTrigger);

export function Header({ onBookNowClick, session, isSessionLoading }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top top",
        end: 100,
        onUpdate: (self) => {
          setIsScrolled(self.progress > 0);
        },
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const navLinks = [
    { name: "AI Tool", href: "/#risk-meter" },
    { name: "Free Course", href: "/#course" },
    { name: "Blog", href: "/blog" },
    { name: "API Keys", href: "/api-keys" },
    { name: "Enterprise", href: "/enterprise" },
  ];

  return (
    <div className="fixed left-0 right-0 top-0 z-[60]">
      {/* Top Auth Bar for Dealify / Login */}
      <HeaderAuthBar session={session} isLoading={isSessionLoading} />

      <header
        ref={headerRef}
        className={`fixed left-1/2 top-20 z-50 w-[95%] max-w-6xl -translate-x-1/2 transition-all duration-500 ease-out ${isScrolled
          ? "rounded-full border border-white/10 bg-brand-bg/60 py-3 backdrop-blur-xl shadow-2xl"
          : "bg-transparent py-5"
          }`}
        role="banner"
      >
        <div className="flex items-center justify-between px-6 md:px-10">
          <a href="/" className="flex items-center gap-3 text-brand-text group" aria-label="AI Crypto Risk - Home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-text text-brand-bg shadow-sm transition-transform group-hover:scale-110" aria-hidden="true">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase font-heading">
              AI Crypto Risk
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-brand-muted md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover-lift transition-colors hover:text-brand-accent active:text-brand-accent/80"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={onBookNowClick}
              className="btn-magnetic rounded-full bg-brand-accent px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-text shadow-lg"
            >
              Book Now
            </button>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-brand-text"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute left-0 top-full mt-4 w-full rounded-3xl border border-white/10 bg-brand-bg/95 p-6 backdrop-blur-2xl shadow-2xl md:hidden">
            <nav className="flex flex-col gap-4 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium text-brand-text"
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => {
                  onBookNowClick();
                  setIsMenuOpen(false);
                }}
                className="mt-4 rounded-full bg-brand-accent py-4 font-bold uppercase tracking-widest text-brand-text"
              >
                Book Now
              </button>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
