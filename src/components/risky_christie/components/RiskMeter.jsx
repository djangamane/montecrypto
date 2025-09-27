const BAND_COLORS = {
  Low: '#2E7D32',
  Moderate: '#8BC34A',
  Elevated: '#F9A825',
  High: '#EF6C00',
  Severe: '#C62828',
};

export default function RiskMeter({ score }) {
  const normalizedScore = normalizeScore(score);
  const band = getBand(normalizedScore);
  const strokeColor = BAND_COLORS[band];

  return (
    <div className="relative mx-auto flex h-40 w-72 flex-col items-center justify-center">
      <svg width="288" height="160" viewBox="0 0 288 160" className="h-full w-full">
        <path
          d="M 32 144 A 120 120 0 0 1 256 144"
          stroke="#E0D9C6"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 32 144 A 120 120 0 0 1 256 144"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
          style={{
            stroke: strokeColor,
            strokeDasharray: Math.PI * 120,
            strokeDashoffset: Math.PI * 120 * (1 - normalizedScore / 100),
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute bottom-4 flex flex-col items-center">
        <span className="text-5xl font-heading uppercase text-brand-text">{normalizedScore}</span>
        <span className="text-sm font-semibold tracking-[0.3em] text-brand-muted">{band}</span>
      </div>
    </div>
  );
}

function normalizeScore(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function getBand(score) {
  if (score >= 85) return 'Low';
  if (score >= 70) return 'Moderate';
  if (score >= 50) return 'Elevated';
  if (score >= 30) return 'High';
  return 'Severe';
}
