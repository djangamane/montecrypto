import AnalysisCategory from './AnalysisCategory.jsx';
import AnalysisSources from './AnalysisSources.jsx';
import RiskMeter from './RiskMeter.jsx';
import ScoreAdjustments from './ScoreAdjustments.jsx';

export default function ResultsDisplay({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-heading uppercase text-brand-text">Risk assessment</h3>
        <p className="mt-1 text-lg font-semibold text-brand-link">{result.tokenName}</p>
        {result.top50Coin ? (
          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-brand-link/40 bg-brand-link/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-brand-link">
              Top 50 Coin
            </span>
          </div>
        ) : null}
        <RiskMeter score={result.overallScore} />
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-brand-muted">{result.summary}</p>
        <div className="mx-auto mt-6 max-w-xl">
          <ScoreAdjustments
            originalScore={result.originalScore}
            adjustedScore={result.overallScore}
            adjustments={result.scoreAdjustments}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-center text-xl font-semibold text-brand-text">Analyzer breakdown</h4>
        <AnalysisCategory title="On-Chain Analysis" findings={result.onChainAnalysis} />
        <AnalysisCategory title="Off-Chain Intelligence" findings={result.offChainIntelligence} />
        <AnalysisCategory title="Social Sentiment" findings={result.socialSentiment} />
        <AnalysisCategory title="Institutional Interest" findings={result.institutionalInterest} />
      </div>

      <AnalysisSources sources={result.sources} />
    </div>
  );
}
