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
      setError('Sign in to run the Gemini-assisted scan.');
      return;
    }

    if (!tokenAddress) {
      setError('Please enter a token name or address.');
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
      setError(err.message || 'Failed to analyze the token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-brand-secondary/40 bg-brand-secondary/40 text-brand-text shadow-2xl">
      <div className="overflow-hidden rounded-3xl">
        <Header />
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-6">
          <div className="rounded-2xl border border-brand-secondary/50 bg-brand-secondary/70 p-6 md:p-8">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              Gemini-Assisted Market Intelligence
            </h2>
            <p className="mt-2 text-center text-brand-subtext">
              Provide a token name or contract address to pull AI-augmented intelligence from
              public sources.
            </p>

            <div className="mt-8">
              <TokenInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>

            {error ? (
              <div className="mt-6 rounded-lg border border-red-700/60 bg-red-900/40 px-4 py-3 text-center text-red-200">
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
          <p className="mt-6 text-center text-xs text-brand-subtext">
            Powered by Gemini AI. Educational use only.
          </p>
        </div>
      </div>
    </section>
  );
}

export default RiskyChristieApp;
