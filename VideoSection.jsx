import { forwardRef } from 'react';

export const VideoSection = forwardRef((props, ref) => {
  return (
    <section id="video" ref={ref} className="px-6 py-16">
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
  );
});