import { Calendar, Tag } from './Icons.jsx';

function formatDateLabel(isoDate) {
  if (!isoDate) return 'Date unknown';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Date unknown';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatGeneratedAt(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRange(range) {
  if (!range) return 'Timeframe unknown';
  const { start, end } = range;
  const startLabel = formatDateLabel(start);
  const endLabel = formatDateLabel(end);
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} → ${endLabel}`;
}

export function CoinWatchSummary({ coinScan }) {
  if (!coinScan) return null;

  const { findings = [], sources = [], metadata = {}, summary } = coinScan;
  const generatedLabel = formatGeneratedAt(metadata.generatedAt);
  const timeframeLabel = formatRange(metadata.timeframe);

  return (
    <section className="space-y-5 rounded-3xl border border-brand-muted/40 bg-white/85 p-6 shadow">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-link/70">
          Coin Watch — Perplexity Deep Research
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-muted/40 px-3 py-1">
            <Calendar className="h-4 w-4" />
            {timeframeLabel}
          </span>
          {generatedLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-muted/40 px-3 py-1">
              Generated {generatedLabel}
            </span>
          ) : null}
          {metadata.model ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-muted/40 px-3 py-1">
              Model {metadata.model}
            </span>
          ) : null}
        </div>
        {summary ? (
          <div className="space-y-2 text-sm leading-relaxed text-brand-muted">
            {summary.split(/\n+/).map((line, index) => (
              <p key={`coin-summary-${index}`}>{line}</p>
            ))}
          </div>
        ) : null}
      </header>

      <div className="space-y-4">
        {findings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-muted/40 bg-brand-bg/70 p-4 text-sm text-brand-muted">
            No structured coin findings returned. Review the summary above for manual insights.
          </div>
        ) : null}

        {findings.map((finding, index) => (
          <article
            key={`coin-watch-${index}`}
            className="space-y-3 rounded-2xl border border-brand-muted/40 bg-white p-5"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-brand-muted">
              {finding.token ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-muted/40 px-2 py-1">
                  <Tag className="h-3.5 w-3.5" />
                  {finding.token}
                </span>
              ) : null}
              <span className="rounded-full border border-risk-high/30 bg-risk-high/10 px-2 py-1 text-[0.65rem] font-semibold text-risk-high">
                {finding.threatLevel || 'High'} risk
              </span>
            </div>

            <h4 className="text-lg font-semibold text-brand-text">
              {finding.title || finding.token || 'Scam finding'}
            </h4>
            <p className="text-sm leading-relaxed text-brand-muted">{finding.summary}</p>
            <p className="text-sm font-medium text-brand-link">
              Defensive move:{' '}
              <span className="font-normal text-brand-muted">{finding.howToAvoid}</span>
            </p>

            {Array.isArray(finding.sources) && finding.sources.length ? (
              <div className="border-t border-brand-muted/20 pt-3 text-xs text-brand-muted">
                <p className="font-semibold uppercase tracking-[0.2em] text-brand-link/70">Sources</p>
                <ul className="mt-2 space-y-1 break-words">
                  {finding.sources.slice(0, 4).map((source) => (
                    <li key={source.uri}>
                      <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-link hover:text-brand-text"
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {sources.length ? (
        <footer className="border-t border-brand-muted/20 pt-4 text-xs text-brand-muted">
          <p className="font-semibold uppercase tracking-[0.2em] text-brand-link/70">Additional URLs</p>
          <ul className="mt-2 space-y-1 break-words">
            {sources.slice(0, 8).map((source) => (
              <li key={source.uri}>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-link hover:text-brand-text"
                >
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
