import { useEffect, useState } from 'react';

const steps = [
  'Initializing Gemini AI…',
  'Querying Google Search for on-chain data…',
  'Analyzing contract details from block explorers…',
  'Gathering off-chain intelligence…',
  'Aggregating social sentiment…',
  'Synthesizing risk profile…',
  'Finalizing risk score…',
];

export default function LoadingIndicator({ token }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 rounded-lg bg-brand-primary p-6 text-center">
      <div className="mb-4 flex justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-accent" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-brand-text">Analyzing {token}…</h3>
      <p className="text-brand-subtext transition-opacity duration-500">{steps[currentStep]}</p>
    </div>
  );
}
