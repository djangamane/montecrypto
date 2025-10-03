
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-secondary/30 mt-8">
      <div className="container mx-auto px-8 py-4 text-center text-brand-light text-sm">
        <p>&copy; {new Date().getFullYear()} AI Crypto Risk. Internal Tool.</p>
      </div>
    </footer>
  );
};
