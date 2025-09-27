import { ShieldAlert } from './Icons.jsx';

const threatLevelStyles = {
  High: 'bg-risk-high border-risk-high/70 text-white',
  Medium: 'bg-risk-elevated border-risk-elevated/70 text-brand-text',
  Low: 'bg-risk-moderate border-risk-moderate/70 text-brand-text',
};

function ThreatBadge({ level }) {
  const style = threatLevelStyles[level] || 'bg-brand-muted/40 border-brand-muted/40 text-brand-text';
  return (
    <span className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${style}`}>
      {level?.toUpperCase?.() || 'UNKNOWN'}
    </span>
  );
}

export function InsightCard({ insight }) {
  if (!insight) return null;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-brand-muted/30 bg-white/85 p-5 shadow-sm transition hover:border-brand-link/60">
      <div className="flex-grow">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-brand-text">{insight.title}</h3>
          <ThreatBadge level={insight.threatLevel} />
        </div>

        <p className="text-sm leading-relaxed text-brand-muted">{insight.summary}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-brand-muted/30 bg-brand-bg/80 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 h-5 w-5 text-brand-link" />
          <div>
            <h4 className="font-semibold text-brand-text">How to avoid</h4>
            <p className="mt-1 text-sm leading-relaxed text-brand-muted">{insight.howToAvoid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
