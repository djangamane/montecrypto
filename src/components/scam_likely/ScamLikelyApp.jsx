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
  if (score >= 80) return { label: 'Critical', color: 'text-red-400' };
  if (score >= 65) return { label: 'High', color: 'text-orange-300' };
  if (score >= 45) return { label: 'Elevated', color: 'text-yellow-200' };
  return { label: 'Guarded', color: 'text-emerald-300' };
};

const fallbackAnalysis = enrichAnalysis(
  {
    token: {
      address: '0x1234…DEADBEEF',
      name: 'Sample Token',
      symbol: 'SLIKELY',
      decimals: 18,
      owner: '0xF00…BA5E',
      totalSupply: 1000000000,
      circulatingSupply: 850000000,
    },
    metrics: { supply: 1_000_000_000 },
    risk: {
      score: 72,
      verdict: 'High Risk',
      flags: [
        {
          severity: 'high',
          title: 'Owner retains mint privileges',
          detail: 'Ownership not renounced; contract can still mint or blacklist wallets.',
        },
        {
          severity: 'moderate',
          title: 'Liquidity not locked',
          detail: 'Dominant LP pair shows removable liquidity; verify lock status.',
        },
      ],
    },
    fetchedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  { query: '0x1234…DEADBEEF' }
);

export function ScamLikelyApp({ session }) {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(fallbackAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const overallDescriptor = useMemo(() => {
    const score = analysis?.risk?.score ?? 0;
    return overallToDescriptor(score);
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

  const record = analysis;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <header className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-sky-300/80">Scam Likely Lab</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Multi-Signal Risk Scanner
            </h2>
            <p className="text-base text-slate-300">
              Input a token contract address to generate an early risk snapshot. We combine
              contract metadata with heuristics and feed that into the four-pillar scoring model.
            </p>
          </header>

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

          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Overall Scam Score
                </p>
                <div className="flex items-baseline gap-x-3">
                  <span className="text-5xl font-semibold text-white">
                    {record.risk.score}
                  </span>
                  <span className={`text-lg font-medium ${overallDescriptor.color}`}>
                    {overallDescriptor.label}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>{record.query ?? 'Sample token'}</p>
                <p>Updated {formatRelativeTime(record.fetchedAt)}</p>
                <p className="text-slate-500">Verdict {record.risk.verdict}</p>
              </div>
            </div>

            <div className="mt-5 h-3 w-full rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${scoreToBar(record.risk.score)} transition-all duration-700`}
                style={{ width: `${Math.min(record.risk.score, 100)}%` }}
              />
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-300">
              {record.narrative}
            </p>
          </div>

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
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <h3 className="text-lg font-semibold text-white">
              Pillar Breakdown
            </h3>
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
              </article>
            ))}
          </div>
        </aside>
      </div>

      <div className="pointer-events-none absolute -top-48 right-10 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-6 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
    </section>
  );
}

export default ScamLikelyApp;

function enrichAnalysis(raw, { query }) {
  const score = raw?.risk?.score ?? 0;
  const verdict = raw?.risk?.verdict ?? (score >= 70 ? 'High Risk' : score >= 50 ? 'Elevated Risk' : 'Guarded');
  const flags = raw?.risk?.flags ?? [];

  const narrative =
    raw?.narrative ??
    (flags.length
      ? `Initial heuristics surfaced ${flags.length} risk indicator${flags.length > 1 ? 's' : ''}. Examine the highlights below and escalate to manual review if you plan to deploy capital.`
      : 'No critical heuristics fired, but this is a preliminary check. Continue with manual review and community vetting.');

  const nextSteps = raw?.nextSteps ?? [
    'Validate liquidity lock and ownership renounce status on-chain.',
    'Inspect top holder activity over the past 72 hours.',
    'Cross-reference the contract with reputable allowlists and audit repositories.',
  ];

  const pillarScore = (base) => Math.max(10, Math.min(95, base));
  const derivedPillars = raw?.pillars ?? [
    {
      name: 'On-Chain Integrity',
      score: pillarScore(score + (flags.some((flag) => flag.title.includes('Owner')) ? 10 : 0)),
      severity: score >= 70 ? 'High Risk' : score >= 50 ? 'Moderate Risk' : 'Low Risk',
      summary: raw?.token?.owner
        ? 'Ownership remains active; confirm multisig or renounce transaction.'
        : 'Ownership status unclear; investigate deployer wallet.',
      highlights: [
        raw?.token?.owner
          ? `Reported owner: ${shortAddress(raw.token.owner)}`
          : 'No owner surfaced from metadata.',
        raw?.metrics?.supply ? `Reported total supply: ${formatNumber(raw.metrics.supply)}` : 'Total supply unavailable from API.',
      ],
    },
    {
      name: 'Off-Chain Intelligence',
      score: pillarScore(score - 10),
      severity: score >= 80 ? 'Critical Risk' : score >= 55 ? 'High Risk' : 'Moderate Risk',
      summary: 'Add audited sources (RugDoc, CertiK, security repositories) to strengthen trust.',
      highlights: ['No external audit linked in metadata.', 'Check for mentions on Cryptoscamdb and WalletLabels.'],
    },
    {
      name: 'Social & Community Signals',
      score: pillarScore(score - 5),
      severity: score >= 70 ? 'High Risk' : 'Moderate Risk',
      summary: 'Sentiment coverage deferred until social connectors are wired.',
      highlights: ['Integrate Twitter/Telegram metrics to validate organic traction.', 'Watch for duplicate shilling campaigns.'],
    },
    {
      name: 'Institutional Interest',
      score: pillarScore(score + 5),
      severity: score >= 70 ? 'Critical Risk' : 'High Risk',
      summary: 'Institutional telemetry not yet collected; treat as unknown.',
      highlights: ['Whale wallet and exchange custody integrations coming soon.', 'Monitor derivatives open interest for divergence.'],
    },
  ];

  return {
    ...raw,
    query,
    narrative,
    nextSteps,
    pillars: derivedPillars,
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
