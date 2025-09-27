import { useState } from 'react';
import Header from './components/Header.jsx';
import TokenInput from './components/TokenInput.jsx';
import LoadingIndicator from './components/LoadingIndicator.jsx';
import ResultsDisplay from './components/ResultsDisplay.jsx';
import { analyzeToken } from './services/geminiService.js';

export function RiskyChristieApp({ session }) {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');

  const handleAnalyze = async (tokenAddress) => {
    if (!session?.access_token) {
      setError('Sign in to run the AI-assisted scan.');
      return;
    }

    if (!tokenAddress) {
      setError('Please enter a token, contract, or URL.');
      return;
    }

    setToken(tokenAddress);
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeToken(tokenAddress, session.access_token);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze the input. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-brand-muted/30 bg-white/90 shadow-xl">
      <div className="overflow-hidden rounded-3xl">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pb-12 pt-6">
          <div className="rounded-2xl border border-brand-muted/30 bg-brand-bg/70 p-6 md:p-8">
            <h2 className="text-center text-2xl font-heading uppercase text-brand-text md:text-3xl">
              Run a four-analyzer risk scan
            </h2>
            <p className="mt-2 text-center text-sm text-brand-muted">
              We blend on-chain, social, off-chain, and institutional signals into a single score with linked evidence.
            </p>

            <div className="mt-8">
              <TokenInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>

            {error ? (
              <div className="mt-6 rounded-xl border border-risk-high/40 bg-risk-high/10 px-4 py-3 text-center text-risk-high">
                <p>{error}</p>
              </div>
            ) : null}

            {isLoading ? <LoadingIndicator token={token} /> : null}

            {analysisResult && !isLoading ? (
              <div className="mt-8">
                <ResultsDisplay result={analysisResult} />
              </div>
            ) : null}
          </div>
          <p className="mt-6 text-center text-xs text-brand-muted">
            Powered by Gemini. Educational risk analysis only — not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}

export default RiskyChristieApp;
