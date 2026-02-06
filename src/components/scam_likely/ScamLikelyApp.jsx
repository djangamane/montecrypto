import { useMemo, useState } from 'react';

const severityToBadge = {
  'Critical Risk': 'bg-red-500/20 text-red-300 border border-red-500/40',
  'High Risk': 'bg-orange-500/20 text-orange-200 border border-orange-500/40',
  'Moderate Risk': 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
  'Low Risk': 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
};

const scoreToBar = (score) => {
  if (score >= 75) return 'bg-red-500';
  if (score >= 60) return 'bg-orange-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

const overallToDescriptor = (score) => {
  if (score >= 75) return { label: 'Critical Risk', color: 'text-red-400', bg: 'bg-red-500' };
  if (score >= 50) return { label: 'High Risk', color: 'text-orange-300', bg: 'bg-orange-500' };
  if (score >= 25) return { label: 'Elevated', color: 'text-yellow-200', bg: 'bg-yellow-500' };
  return { label: 'Low Risk', color: 'text-emerald-300', bg: 'bg-emerald-500' };
};

export function ScamLikelyApp({ session }) {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const overallDescriptor = useMemo(() => {
    if (!analysis) return null;
    return overallToDescriptor(analysis.risk.score);
  }, [analysis]);

  const handleRunAnalysis = async () => {
    if (!session) {
      setError('Sign in to run the scan.');
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter a token contract address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scam-likely/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Scan failed. Try again.');
      }

      const payload = await response.json();
      setAnalysis(enrichAnalysis(payload, { query: trimmed }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    const record = analysis;
    if (!record) return null;
    const descriptor = overallDescriptor ?? { label: '', color: 'text-slate-300', bg: 'bg-slate-500' };
    const tokenDisplay = record.token?.symbol ? `${record.token.name} (${record.token.symbol})` : record.query;

    return (
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Risk Score for {record.token?.symbol || 'Token'}
                </p>
                <div className="flex items-baseline gap-x-3">
                  <span className="text-5xl font-semibold text-white">
                    {record.risk.score}
                  </span>
                  <span className={`text-lg font-medium ${descriptor.color}`}>
                    {descriptor.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{tokenDisplay}</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p className="font-mono text-xs">{shortAddress(record.query)}</p>
                <p>Updated {formatRelativeTime(record.fetchedAt)}</p>
              </div>
            </div>

            <div className="mt-5 h-3 w-full rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${scoreToBar(record.risk.score)} transition-all duration-700`}
                style={{ width: `${Math.max(Math.min(record.risk.score, 100), 5)}%` }}
              />
            </div>

            {record.narrative ? (
              <p className="mt-6 text-sm leading-relaxed text-slate-300">{record.narrative}</p>
            ) : null}

            {record.positives?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {record.positives.slice(0, 5).map((positive, idx) => (
                  <span key={idx} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 border border-emerald-500/20">
                    {positive}
                  </span>
                ))}
              </div>
            )}
          </div>

          {record.nextSteps?.length ? (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Recommended Checks</h3>
              <ul className="grid gap-3 text-sm text-slate-300">
                {record.nextSteps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-950/50 p-4"
                  >
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-300">
                      •
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <h3 className="text-lg font-semibold text-white">Pillar Breakdown</h3>
            <p className="mt-2 text-sm text-slate-400">
              Scores roll up into the scam meter. Lower numbers are safer; anything over 60
              deserves deeper manual review.
            </p>
          </div>

          <div className="space-y-5">
            {record.pillars.map((pillar) => (
              <article
                key={pillar.name}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base font-semibold text-white">{pillar.name}</h4>
                    <p className="mt-1 text-sm text-slate-400">{pillar.summary}</p>
                  </div>
                  <span
                    className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severityToBadge[pillar.severity]}`}
                  >
                    {pillar.severity}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                    <span>Score</span>
                    <span>{pillar.score}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${scoreToBar(pillar.score)} transition-all duration-700`}
                      style={{ width: `${Math.min(pillar.score, 100)}%` }}
                    />
                  </div>
                </div>

                {pillar.highlights?.length ? (
                  <ul className="mt-5 grid gap-2 text-sm text-slate-300">
                    {pillar.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-lg border border-white/5 bg-slate-900/60 px-3 py-2"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </aside>
      </div>
    );
  };

  const results = renderResults();

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <label className="sr-only" htmlFor="scam-likely-query">
            Token query
          </label>
          <input
            id="scam-likely-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="0xabc…"
            className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleRunAnalysis}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60 disabled:cursor-not-allowed disabled:bg-slate-600"
            disabled={isLoading}
          >
            {isLoading ? 'Scanning…' : 'Run Analysis'}
          </button>
        </div>

        {error ? (
          <p className="text-sm text-orange-300">{error}</p>
        ) : null}

        {results ?? (!isLoading && !error ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
            Enter a contract address above to generate a fresh on-chain risk snapshot.
          </div>
        ) : null)}
      </div>

      <div className="pointer-events-none absolute -top-48 right-10 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-6 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
    </section>
  );
}

export default ScamLikelyApp;

function enrichAnalysis(raw, { query }) {
  // Use actual API data, only provide fallbacks if missing
  const score = raw?.risk?.score ?? 0;
  const verdict = raw?.risk?.verdict ?? (score >= 75 ? 'Critical Risk' : score >= 50 ? 'High Risk' : score >= 25 ? 'Elevated' : 'Low Risk');
  const flags = raw?.risk?.flags ?? [];
  const positives = raw?.positives ?? [];
  const pillars = raw?.pillars ?? [];
  const nextSteps = raw?.nextSteps ?? ['Verify the contract on the block explorer.'];
  const narrative = raw?.narrative ?? (
    flags.length > 0
      ? `Found ${flags.length} risk indicator${flags.length !== 1 ? 's' : ''}. Review the details below.`
      : 'No major red flags detected. Continue with standard due diligence.'
  );

  return {
    ...raw,
    query,
    narrative,
    nextSteps,
    pillars,
    positives,
    risk: { score, verdict, flags },
  };
}

function formatRelativeTime(iso) {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return 'recently';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function shortAddress(addr) {
  if (!addr) return 'unknown';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatNumber(value) {
  if (value == null) return 'n/a';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toString();
}
