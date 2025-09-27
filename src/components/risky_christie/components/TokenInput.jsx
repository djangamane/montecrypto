import { useState } from 'react';

export default function TokenInput({ onAnalyze, isLoading }) {
  const [token, setToken] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAnalyze(token.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <input
        type="text"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="Paste a token, contract, or project URL"
        disabled={isLoading}
        className="w-full rounded-xl border border-brand-muted/40 bg-white px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-link focus:outline-none focus:ring-2 focus:ring-brand-link/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-link px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-text disabled:cursor-not-allowed disabled:bg-brand-muted/40 sm:w-auto"
      >
        {isLoading ? (
          <>
            <svg className="-ml-1 h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" />
            </svg>
            <span>Analyzing…</span>
          </>
        ) : (
          <span>Analyze risk</span>
        )}
      </button>
    </form>
  );
}
