import AnalysisCategory from './AnalysisCategory.jsx';
import AnalysisSources from './AnalysisSources.jsx';
import RiskMeter from './RiskMeter.jsx';

export default function ResultsDisplay({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-center">Risk Assessment</h3>
        <p className="mb-4 text-center text-lg font-semibold text-brand-accent">
          {result.tokenName}
        </p>
        <RiskMeter score={result.overallScore} />
        <p className="mx-auto mt-6 max-w-2xl text-center text-brand-subtext">{result.summary}</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-center text-xl font-bold">Detailed Breakdown</h4>
        <AnalysisCategory title="On-Chain Analysis" findings={result.onChainAnalysis} />
        <AnalysisCategory title="Off-Chain Intelligence" findings={result.offChainIntelligence} />
        <AnalysisCategory title="Social Sentiment" findings={result.socialSentiment} />
        <AnalysisCategory title="Institutional Interest" findings={result.institutionalInterest} />
      </div>

      <AnalysisSources sources={result.sources} />
    </div>
  );
}
