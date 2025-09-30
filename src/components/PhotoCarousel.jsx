import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  '/ccp-vc.jpg',
  '/course_pic.jpg',
  '/mining.jpg',
  '/old_logo.jpg',
  '/scam.png',
  '/scamcheck2021.jpg',
];

export function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <div className="relative mt-10 h-96">
          <div
            style={{ backgroundImage: `url(${images[currentIndex]})` }}
            className="h-full w-full rounded-2xl bg-cover bg-center"
          ></div>
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
