
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary/50 shadow-lg backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text">
          <span className="text-brand-cyan">AI</span> Crypto Risk
        </h1>
        <p className="text-brand-light text-sm">SEO Blog Post Generator</p>
      </div>
    </header>
  );
};
