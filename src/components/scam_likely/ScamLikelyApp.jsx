import { useMemo, useState } from 'react';

const sampleAnalysis = {
  query: '0x1234...DEADBEEF',
  updatedAt: '15 minutes ago',
  overallScore: 72,
  verdict: 'High Risk',
  confidence: 'Medium-High',
  narrative:
    'Institutional wallets began trimming positions this week while social sentiment spiked on promotion-heavy channels. Liquidity controls remain weak and ownership is concentrated.',
  nextSteps: [
    'Confirm liquidity lock or renounce status before any allocation.',
    'Track tagged market-maker wallets for 48 hours to confirm sustained support.',
    'Escalate to manual code review if the project claims recent contract upgrades.',
  ],
  pillars: [
    {
      name: 'On-Chain Integrity',
      score: 68,
      severity: 'High Risk',
      summary: 'Owner can mint and pause transfers; liquidity pool remains fully unlockable.',
      highlights: [
        'Owner retains mint and blacklist privileges.',
        'No evidence of liquidity lock on dominant DEX pair.',
        'Top 5 wallets control 78% of supply; last move occurred 6h ago.',
      ],
    },
    {
      name: 'Off-Chain Intelligence',
      score: 55,
      severity: 'Moderate Risk',
      summary: 'Project domain registered 12 days ago; no audits or KYC filings located.',
      highlights: [
        'domain.tld points to privacy-protected registrar in Seychelles.',
        'No verified audit reports or GitHub repository activity.',
        'Contract address not present on major allowlists.',
      ],
    },
    {
      name: 'Social & Community Signals',
      score: 63,
      severity: 'High Risk',
      summary: 'Follower growth dominated by newly created accounts; coordinated shilling detected.',
      highlights: [
        '72% of Telegram joins in past 48h have <3 prior messages.',
        'Twitter sentiment ratio flipped positive despite limited unique authors.',
        'Multiple duplicate Medium articles posted simultaneously.',
      ],
    },
    {
      name: 'Institutional Interest',
      score: 79,
      severity: 'Critical Risk',
      summary: 'Labeled funds exiting positions while derivatives open interest collapses.',
      highlights: [
        'Two venture wallets dumped 90% of holdings within 24h.',
        'No exchange treasury custody detected for token pairs.',
        'CME-style perp proxies show -38% funding rate divergence.',
      ],
    },
  ],
};

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

export function ScamLikelyApp() {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const overallDescriptor = useMemo(() => {
    const record = analysis ?? sampleAnalysis;
    return overallToDescriptor(record.overallScore);
  }, [analysis]);

  const handleRunAnalysis = () => {
    if (!query.trim()) {
      setAnalysis(sampleAnalysis);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({
        ...sampleAnalysis,
        query,
        narrative:
          'Mock analysis placeholder — replace with pipeline response once data services are wired.',
        updatedAt: 'Just now',
      });
      setIsLoading(false);
    }, 900);
  };

  const record = analysis ?? sampleAnalysis;

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
              Input a token name or contract address to generate a four-pillar scam
              assessment. The institutional interest module surfaces smart-money
              participation so you can validate momentum beyond retail hype.
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
              placeholder="e.g. PEPE, 0xabc..."
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
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

          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Overall Scam Score
                </p>
                <div className="flex items-baseline gap-x-3">
                  <span className="text-5xl font-semibold text-white">
                    {record.overallScore}
                  </span>
                  <span className={`text-lg font-medium ${overallDescriptor.color}`}>
                    {overallDescriptor.label}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>{record.query ?? 'Sample token'}</p>
                <p>Updated {record.updatedAt}</p>
                <p className="text-slate-500">Confidence {record.confidence}</p>
              </div>
            </div>

            <div className="mt-5 h-3 w-full rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${scoreToBar(record.overallScore)} transition-all duration-700`}
                style={{ width: `${Math.min(record.overallScore, 100)}%` }}
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
