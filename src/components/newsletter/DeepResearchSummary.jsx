import { Calendar, Info, Tag } from './Icons.jsx';

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

function formatRange(range) {
  if (!range) return 'Timeframe unknown';
  const { start, end } = range;
  const startLabel = formatDateLabel(start);
  const endLabel = formatDateLabel(end);
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} → ${endLabel}`;
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

function uniqueSources(findings = []) {
  const seen = new Set();
  const sources = [];
  for (const finding of findings) {
    const uris = Array.isArray(finding.sourceUris) ? finding.sourceUris : [];
    for (const uri of uris) {
      if (!uri || seen.has(uri)) continue;
      seen.add(uri);
      sources.push({ uri });
    }
  }
  return sources;
}

export function DeepResearchSummary({ research }) {
  if (!research) return null;

  const { timeframe, summary, findings = [], generatedAt } = research;
  const coverageDisplay = formatRange(timeframe);
  const generatedLabel = formatGeneratedAt(generatedAt);
  const sources = uniqueSources(findings).slice(0, 6);

  return (
    <section className="space-y-5 rounded-3xl border border-brand-link/30 bg-brand-link/5 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-link/70">
          Deep research findings
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-link/40 px-3 py-1 text-brand-link">
            <Calendar className="h-4 w-4" />
            {coverageDisplay}
          </span>
          {generatedLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-muted/40 px-3 py-1 text-brand-muted">
              <Info className="h-4 w-4" />
              Generated {generatedLabel}
            </span>
          ) : null}
        </div>
        {summary ? (
          <p className="text-sm leading-relaxed text-brand-muted">{summary}</p>
        ) : null}
      </header>

      <div className="space-y-4">
        {findings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-muted/40 bg-white/70 p-4 text-sm text-brand-muted">
            No confirmed loss events surfaced during this research window.
          </div>
        ) : null}

        {findings.map((finding, index) => (
          <div
            key={`deep-research-${index}`}
            className="space-y-3 rounded-2xl border border-brand-link/40 bg-white/80 p-5"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-brand-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-link/40 px-2 py-1 text-brand-link">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateLabel(finding.eventDate)}
              </span>
              {finding.token ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-muted/40 px-2 py-1 text-brand-muted">
                  <Tag className="h-3.5 w-3.5" />
                  {finding.token}
                </span>
              ) : null}
              <span className="rounded-full border border-risk-high/30 bg-risk-high/10 px-2 py-1 text-[0.65rem] font-semibold text-risk-high">
                {finding.threatLevel || 'High'} risk
              </span>
            </div>

            <h4 className="text-lg font-semibold text-brand-text">{finding.title}</h4>
            <p className="text-sm leading-relaxed text-brand-muted">{finding.summary}</p>
            <p className="text-sm font-medium text-brand-link">
              Defensive move: <span className="font-normal text-brand-muted">{finding.howToAvoid}</span>
            </p>

            {Array.isArray(finding.sourceUris) && finding.sourceUris.length ? (
              <div className="border-t border-brand-muted/20 pt-3 text-xs text-brand-muted">
                <p className="font-semibold uppercase tracking-[0.2em] text-brand-link/70">Sources</p>
                <ul className="mt-2 space-y-1 break-words">
                  {finding.sourceUris.slice(0, 4).map((uri) => (
                    <li key={uri}>
                      <a
                        href={uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-link hover:text-brand-text"
                      >
                        {uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {sources.length ? (
        <footer className="border-t border-brand-muted/20 pt-4 text-xs text-brand-muted">
          <p className="font-semibold uppercase tracking-[0.2em] text-brand-link/70">All research URLs</p>
          <ul className="mt-2 space-y-1 break-words">
            {sources.map((source) => (
              <li key={source.uri}>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-link hover:text-brand-text"
                >
                  {source.uri}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
