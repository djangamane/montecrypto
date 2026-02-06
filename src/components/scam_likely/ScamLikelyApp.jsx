import { useState } from 'react';

const CHAINS = [
  { id: '1', name: 'Ethereum', symbol: 'ETH' },
  { id: '56', name: 'BNB Chain', symbol: 'BSC' },
  { id: '137', name: 'Polygon', symbol: 'MATIC' },
  { id: '42161', name: 'Arbitrum', symbol: 'ARB' },
  { id: '10', name: 'Optimism', symbol: 'OP' },
  { id: '43114', name: 'Avalanche', symbol: 'AVAX' },
  { id: '8453', name: 'Base', symbol: 'BASE' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
];

export function ScamLikelyApp({ session }) {
  const [contractAddress, setContractAddress] = useState('');
  const [coinName, setCoinName] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('');
  const [chain, setChain] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      setError('Please sign in to request a risk analysis.');
      return;
    }

    const address = contractAddress.trim();
    const name = coinName.trim();
    const symbol = coinSymbol.trim().toUpperCase();

    if (!address) {
      setError('Contract address is required.');
      return;
    }

    if (!name) {
      setError('Coin name is required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/scam-likely/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          contractAddress: address,
          coinName: name,
          coinSymbol: symbol || name.toUpperCase().slice(0, 5),
          chain,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to submit research request.');
      }

      setSuccess(true);
      setContractAddress('');
      setCoinName('');
      setCoinSymbol('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedChain = CHAINS.find((c) => c.id === chain);

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Deep Risk Research</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter token details and we will perform comprehensive research across contract security,
            trading mechanics, ownership structure, and community signals. Results will be emailed to you.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-emerald-300">Research Request Submitted!</h3>
            <p className="mt-2 text-sm text-slate-300">
              Our AI is analyzing this token across multiple data sources. You will receive a detailed
              risk report at <span className="font-medium text-white">{session?.user?.email}</span> within 5-10 minutes.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-6 rounded-xl bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Research Another Token
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="contract-address" className="block text-sm font-medium text-slate-300">
                  Contract Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="contract-address"
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="coin-name" className="block text-sm font-medium text-slate-300">
                  Coin Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="coin-name"
                  type="text"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  placeholder="e.g., Pepe"
                  className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="coin-symbol" className="block text-sm font-medium text-slate-300">
                  Symbol <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="coin-symbol"
                  type="text"
                  value={coinSymbol}
                  onChange={(e) => setCoinSymbol(e.target.value)}
                  placeholder="e.g., PEPE"
                  className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-sm uppercase text-slate-100 placeholder:text-slate-500 placeholder:normal-case focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  disabled={isLoading}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="chain" className="block text-sm font-medium text-slate-300">
                  Blockchain
                </label>
                <select
                  id="chain"
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  disabled={isLoading}
                >
                  {CHAINS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <h4 className="text-sm font-medium text-sky-300">What We Analyze:</h4>
              <ul className="mt-2 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Contract Security & Audit Status
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Trading Mechanics & Taxes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Ownership & Token Distribution
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Community & Social Signals
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || !session}
              className="w-full rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Start Deep Research'
              )}
            </button>

            {!session && (
              <p className="text-center text-sm text-slate-400">
                Please sign in above to submit a research request.
              </p>
            )}
          </form>
        )}
      </div>

      <div className="pointer-events-none absolute -top-48 right-10 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-6 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
    </section>
  );
}

export default ScamLikelyApp;
