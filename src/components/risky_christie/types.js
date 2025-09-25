export const Severity = Object.freeze({
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
});

export function createDefaultResult() {
  return {
    tokenName: '',
    overallScore: 0,
    summary: '',
    onChainAnalysis: [],
    offChainIntelligence: [],
    socialSentiment: [],
    institutionalInterest: [],
    sources: [],
  };
}
