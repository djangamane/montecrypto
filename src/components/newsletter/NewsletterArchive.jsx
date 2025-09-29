import { useMemo, useState } from 'react';
import { Calendar, Info } from './Icons.jsx';
import { InsightCard } from './InsightCard.jsx';
import { SourcesList } from './SourcesList.jsx';
import { DeepResearchSummary } from './DeepResearchSummary.jsx';

function formatDate(isoDate) {
  if (!isoDate) return 'Unknown date';
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function NewsletterArchive({ briefings = [] }) {
  const sortedBriefings = useMemo(() => {
    return [...briefings].sort((a, b) => {
      const aTime = new Date(a.publishedAt || 0).getTime();
      const bTime = new Date(b.publishedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [briefings]);

  const [selectedBriefingId, setSelectedBriefingId] = useState(
    sortedBriefings[0]?.id ?? null
  );

  const selectedBriefing = useMemo(
    () => sortedBriefings.find((item) => item.id === selectedBriefingId) ?? null,
    [sortedBriefings, selectedBriefingId]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,1.3fr]">
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading uppercase text-brand-text">Weekly risk briefings</h2>
            <p className="text-sm text-brand-muted">
              Review the latest signals curated by the MonteCrypto research desk.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {sortedBriefings.map((briefing) => {
            const isActive = briefing.id === selectedBriefingId;
            return (
              <button
                key={briefing.id}
                type="button"
                onClick={() => setSelectedBriefingId(briefing.id)}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  isActive
                    ? 'border-brand-link bg-brand-bg'
                    : 'border-brand-muted/30 bg-white/80 hover:border-brand-link/60'
                }`}
              >
                <div className="flex items-center gap-3 text-brand-link">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {formatDate(briefing.publishedAt)}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-brand-text">
                  {briefing.headline}
                </h3>
                <p className="mt-2 text-sm text-brand-muted line-clamp-3">
                  {briefing.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {selectedBriefing ? (
          <article className="rounded-3xl border border-brand-muted/30 bg-white/85 p-8 shadow">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-link/70">
                Issue
              </p>
              <h3 className="text-4xl font-heading uppercase text-brand-text">{selectedBriefing.headline}</h3>
              <p className="text-sm text-brand-muted">
                Published {formatDate(selectedBriefing.publishedAt)}
              </p>
              <p className="text-base leading-relaxed text-brand-muted">
                {selectedBriefing.summary}
              </p>
            </header>

            <section className="mt-8 space-y-6">
              <div className="flex items-center gap-3 rounded-2xl border border-brand-link/40 bg-brand-link/10 p-4 text-brand-link">
                <Info className="h-5 w-5 text-brand-link" />
                <p className="text-sm text-brand-text/80">
                  Each insight highlights an active threat we are monitoring this week.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {selectedBriefing.insights?.map((insight, index) => (
                  <InsightCard key={`${selectedBriefing.id}-insight-${index}`} insight={insight} />
                ))}
              </div>

              {selectedBriefing.deepResearch ? (
                <DeepResearchSummary research={selectedBriefing.deepResearch} />
              ) : null}
            </section>

            <footer className="mt-8">
              <SourcesList sources={selectedBriefing.sources} />
            </footer>
          </article>
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-brand-muted/30 bg-brand-bg/70">
            <p className="text-sm text-brand-muted">Select a briefing from the archive to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
