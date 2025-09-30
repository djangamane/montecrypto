import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { src: '/ccp-vc.jpg', alt: 'Crypto education speaking engagement collage', fit: 'cover' },
  { src: '/office.jpg', alt: 'Office workspace for AI crypto risk research', fit: 'contain' },
  { src: '/mining.jpg', alt: 'Early crypto mining hardware setup', fit: 'contain' },
  { src: '/old_logo.jpg', alt: 'Legacy MonteCrypto branding mark', fit: 'cover' },
  { src: '/scam.png', alt: 'Scam Likely risk analysis screenshot', fit: 'cover' },
  { src: '/scamcheck2021.jpg', alt: 'Scam Check 2021 conference appearance', fit: 'contain' },
];

export function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = images[currentIndex];
  const imageClass =
    currentImage.fit === 'contain'
      ? 'max-h-full max-w-full object-contain'
      : 'h-full w-full object-cover';

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <section id="experience" className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-heading uppercase text-brand-text">
          Experience in the Field
        </h2>
        <div className="relative mt-10 h-96 overflow-hidden rounded-2xl border border-brand-muted/30 bg-white/70 p-4">
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className={`mx-auto ${imageClass} rounded-xl shadow-lg`}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={goToPrevious}
              className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
