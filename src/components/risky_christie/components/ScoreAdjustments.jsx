export default function ScoreAdjustments({
  originalScore,
  adjustedScore,
  adjustments = [],
}) {
  if (!Array.isArray(adjustments) || adjustments.length === 0) {
    return null;
  }

  const hasDelta = Number.isFinite(originalScore) && Number.isFinite(adjustedScore) && originalScore !== adjustedScore;

  return (
    <div className="rounded-2xl border border-brand-muted/30 bg-white/85 p-4 shadow-sm">
      <div className="flex flex-col gap-2 text-sm text-brand-muted">
        <div className="flex items-center justify-between text-brand-text">
          <span className="text-base font-semibold">Score modifiers</span>
          {hasDelta ? (
            <span className="text-xs font-medium text-brand-muted">
              {Math.round(originalScore)} → {Math.round(adjustedScore)}
            </span>
          ) : null}
        </div>
        <ul className="space-y-2">
          {adjustments.map((adjustment) => (
            <li
              key={adjustment.id}
              className="rounded-xl border border-brand-muted/25 bg-brand-bg/60 px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-brand-text">
                  {adjustment.label}
                </span>
                {adjustment.impact ? (
                  <span className="text-xs font-semibold text-brand-link">
                    {adjustment.impact}
                  </span>
                ) : null}
              </div>
              {adjustment.description ? (
                <p className="mt-1 text-xs leading-relaxed">
                  {adjustment.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
