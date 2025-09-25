export default function RiskMeter({ score }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const colorClass = getScoreColor(normalizedScore);
  const textClass = getTextColor(normalizedScore);
  const riskLabel = getRiskLabel(normalizedScore);

  return (
    <div className="relative mx-auto flex h-32 w-64 flex-col items-center justify-center">
      <svg width="256" height="128" viewBox="0 0 256 128" className="h-full w-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path
          d="M 28 110 A 100 100 0 0 1 228 110"
          stroke="url(#gaugeGradient)"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M 28 110 A 100 100 0 0 1 228 110"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
          style={{
            strokeDasharray: Math.PI * 100,
            strokeDashoffset: Math.PI * 100 * (1 - normalizedScore / 100),
          }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className={`text-4xl font-bold ${textClass}`}>{normalizedScore}</span>
        <span className="text-sm font-semibold text-brand-subtext">{riskLabel}</span>
      </div>
    </div>
  );
}

function getScoreColor(score) {
  if (score <= 33) return 'stroke-risk-low';
  if (score <= 66) return 'stroke-risk-medium';
  return 'stroke-risk-critical';
}

function getTextColor(score) {
  if (score <= 33) return 'text-risk-low';
  if (score <= 66) return 'text-risk-medium';
  return 'text-risk-critical';
}

function getRiskLabel(score) {
  if (score <= 10) return 'Very Low Risk';
  if (score <= 33) return 'Low Risk';
  if (score <= 66) return 'Medium Risk';
  if (score <= 90) return 'High Risk';
  return 'Critical Risk';
}
