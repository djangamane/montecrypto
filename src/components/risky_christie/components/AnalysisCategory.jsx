import { useState } from 'react';
import { Severity } from '../types.js';
import CheckIcon from './icons/CheckIcon.jsx';
import WarningIcon from './icons/WarningIcon.jsx';
import CriticalIcon from './icons/CriticalIcon.jsx';
import InfoIcon from './icons/InfoIcon.jsx';

export default function AnalysisCategory({ title, findings = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  const overallSeverity = getOverallSeverity(findings);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-muted/40 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-brand-bg"
      >
        <div className="flex items-center gap-3">
          <SeverityIcon severity={overallSeverity} className="h-6 w-6" />
          <span className="text-lg font-semibold text-brand-text">{title}</span>
        </div>
        <svg
          className={`h-5 w-5 text-brand-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen ? (
        <div className="border-t border-brand-muted/30 px-4 py-4">
          {findings.length ? (
            <ul className="space-y-3">
              {findings.map(({ finding, severity }, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="pt-1">
                    <SeverityIcon severity={severity} />
                  </div>
                  <p className="text-sm leading-relaxed text-brand-muted">{finding}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-sm text-brand-muted">No significant findings in this category.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function getOverallSeverity(findings) {
  if (findings.some((item) => item.severity === Severity.Critical)) return Severity.Critical;
  if (findings.some((item) => item.severity === Severity.High)) return Severity.High;
  if (findings.some((item) => item.severity === Severity.Medium)) return Severity.Medium;
  return Severity.Low;
}

function SeverityIcon({ severity, className = 'h-5 w-5' }) {
  switch (severity) {
    case Severity.Critical:
    case Severity.High:
      return <CriticalIcon className={`${className} text-risk-severe`} />;
    case Severity.Medium:
      return <WarningIcon className={`${className} text-risk-elevated`} />;
    case Severity.Low:
      return <CheckIcon className={`${className} text-risk-low`} />;
    default:
      return <InfoIcon className={`${className} text-brand-muted`} />;
  }
}
