import { useEffect, useState } from 'react';

const steps = [
  'Initializing Gemini AI…',
  'Fetching on-chain telemetry…',
  'Checking contract controls and holders…',
  'Collecting off-chain disclosures…',
  'Scanning social velocity…',
  'Reviewing institutional footprints…',
  'Synthesizing the risk score…',
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
    <div className="mt-8 rounded-2xl border border-brand-muted/40 bg-white/80 p-6 text-center">
      <div className="mb-4 flex justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-link" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-brand-text">Analyzing {token}…</h3>
      <p className="text-sm text-brand-muted transition-opacity duration-500">{steps[currentStep]}</p>
    </div>
  );
}
