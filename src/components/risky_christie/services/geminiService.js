import { Severity, createDefaultResult } from '../types.js';

const fallbackResult = createDefaultResult();

const severityValues = new Set(Object.values(Severity));

export async function analyzeToken(query, accessToken) {
  const response = await fetch('/api/gemini/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Unable to complete AI analysis.');
  }

  const result = await response.json();
  return normalizeResult(result);
}

function normalizeResult(raw) {
  if (!raw || typeof raw !== 'object') {
    return fallbackResult;
  }

  const sanitizeFindings = (items) =>
    Array.isArray(items)
      ? items
          .map(({ finding, severity }) => ({
            finding: typeof finding === 'string' ? finding : '',
            severity: severityValues.has(severity) ? severity : Severity.Medium,
          }))
          .filter((item) => item.finding)
      : [];

  return {
    tokenName: typeof raw.tokenName === 'string' ? raw.tokenName : 'Unknown Token',
    overallScore: Number(raw.overallScore) || 0,
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    onChainAnalysis: sanitizeFindings(raw.onChainAnalysis),
    offChainIntelligence: sanitizeFindings(raw.offChainIntelligence),
    socialSentiment: sanitizeFindings(raw.socialSentiment),
    institutionalInterest: sanitizeFindings(raw.institutionalInterest),
    sources: Array.isArray(raw.sources)
      ? raw.sources
          .map(({ title, url }) => ({
            title: typeof title === 'string' ? title : 'Source',
            url: typeof url === 'string' ? url : '#',
          }))
          .filter((source) => source.url && source.url !== '#')
      : [],
  };
}
