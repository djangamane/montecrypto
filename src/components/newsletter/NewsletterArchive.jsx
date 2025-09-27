import { useMemo, useState } from 'react';
import { Calendar, Info } from './Icons.jsx';
import { InsightCard } from './InsightCard.jsx';
import { SourcesList } from './SourcesList.jsx';

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
            <h2 className="text-3xl font-semibold text-white">Weekly Scam Briefings</h2>
            <p className="text-sm text-slate-400">
              Review the latest intelligence pulled from the Scam Likely research desk.
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
                className={`w-full rounded-2xl border bg-slate-900/50 p-5 text-left transition-colors ${
                  isActive
                    ? 'border-sky-500/60 bg-slate-900'
                    : 'border-white/10 hover:border-sky-400/40'
                }`}
              >
                <div className="flex items-center gap-3 text-sky-300">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {formatDate(briefing.publishedAt)}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {briefing.headline}
                </h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-3">
                  {briefing.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {selectedBriefing ? (
          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Issue
              </p>
              <h3 className="text-4xl font-bold text-white">{selectedBriefing.headline}</h3>
              <p className="text-sm text-slate-400">
                Published {formatDate(selectedBriefing.publishedAt)}
              </p>
              <p className="text-base text-slate-300 leading-relaxed">
                {selectedBriefing.summary}
              </p>
            </header>

            <section className="mt-8 space-y-6">
              <div className="flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-sky-100">
                <Info className="h-5 w-5 text-sky-300" />
                <p className="text-sm">
                  Each insight highlights an active threat we are monitoring this week.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {selectedBriefing.insights?.map((insight, index) => (
                  <InsightCard key={`${selectedBriefing.id}-insight-${index}`} insight={insight} />
                ))}
              </div>
            </section>

            <footer className="mt-8">
              <SourcesList sources={selectedBriefing.sources} />
            </footer>
          </article>
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70">
            <p className="text-sm text-slate-400">Select a briefing from the archive to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
