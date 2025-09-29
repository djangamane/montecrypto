function textValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function normalizeThreatLevel(level) {
  const normalized = textValue(level).toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeInsight(insight, index) {
  const fallbackTitle = `Insight ${index + 1}`;
  const fallbackSummary =
    'Gemini did not include a summary for this threat. Add context before publishing.';
  const fallbackAvoid =
    'Gemini did not provide mitigation guidance. Insert manual recommendations.';

  return {
    title: textValue(insight?.title) || fallbackTitle,
    summary: textValue(insight?.summary) || fallbackSummary,
    howToAvoid: textValue(insight?.howToAvoid) || fallbackAvoid,
    threatLevel: normalizeThreatLevel(insight?.threatLevel),
  };
}

function normalizeSource(source, index) {
  const uri = textValue(source?.uri);
  if (!uri) return null;

  return {
    uri,
    title: textValue(source?.title) || `Source ${index + 1}`,
  };
}

function normalizeTimeframe(raw) {
  if (!isPlainObject(raw)) return null;
  const start = textValue(raw.start);
  const end = textValue(raw.end);
  if (!start && !end) return null;
  return {
    start: start || null,
    end: end || null,
  };
}

function normalizeResearchFinding(raw) {
  if (!isPlainObject(raw)) return null;

  const sourceUris = Array.isArray(raw.sourceUris)
    ? raw.sourceUris.map((item) => textValue(item)).filter(Boolean)
    : [];

  return {
    token: textValue(raw.token),
    title: textValue(raw.title),
    summary: textValue(raw.summary),
    howToAvoid: textValue(raw.howToAvoid),
    threatLevel: normalizeThreatLevel(raw.threatLevel),
    eventDate: textValue(raw.eventDate) || null,
    sourceUris,
  };
}

function normalizeDeepResearch(raw) {
  if (!isPlainObject(raw)) return null;

  const findings = Array.isArray(raw.findings)
    ? raw.findings
        .map((finding) => normalizeResearchFinding(finding))
        .filter((finding) => finding && finding.summary && finding.howToAvoid)
    : [];

  return {
    generatedAt: textValue(raw.generatedAt) || null,
    summary: textValue(raw.summary),
    timeframe: normalizeTimeframe(raw.timeframe),
    findings,
    learnings: Array.isArray(raw.learnings)
      ? raw.learnings.map((item) => textValue(item)).filter(Boolean)
      : [],
    visitedUrls: Array.isArray(raw.visitedUrls)
      ? raw.visitedUrls.map((item) => textValue(item)).filter(Boolean)
      : [],
  };
}

export function normalizeBriefing(raw) {
  if (!raw) {
    return null;
  }

  const fallbackHeadline = 'Weekly Risk Brief';
  const fallbackSummary =
    'Summary not provided by Gemini. Review and update before publishing.';

  const normalizedInsights = Array.isArray(raw?.insights)
    ? raw.insights.map((insight, index) => normalizeInsight(insight, index))
    : [];

  const normalizedSources = Array.isArray(raw?.sources)
    ? raw.sources
        .map((source, index) => normalizeSource(source, index))
        .filter(Boolean)
    : [];

  const metadata = isPlainObject(raw?.metadata) ? { ...raw.metadata } : {};
  const deepResearch = normalizeDeepResearch(raw?.deepResearch ?? metadata?.deepResearch);
  const mergedMetadata = deepResearch ? { ...metadata, deepResearch } : metadata;

  return {
    id: raw?.id || `draft-${Date.now()}`,
    headline: textValue(raw?.headline) || fallbackHeadline,
    summary: textValue(raw?.summary) || fallbackSummary,
    publishedAt: raw?.publishedAt || raw?.published_at || new Date().toISOString(),
    insights: normalizedInsights,
    sources: normalizedSources,
    status: raw?.status || 'draft',
    metadata: mergedMetadata,
    deepResearch,
  };
}
