import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from './Icons.jsx';
import { InsightCard } from './InsightCard.jsx';
import { SourcesList } from './SourcesList.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';

function formatHeadlineDate(date) {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function NewsletterAdmin({ session, onBriefingCreated, latestBriefing, isMockData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [draftBriefing, setDraftBriefing] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [lastPublished, setLastPublished] = useState(null);

  const accessToken = session?.access_token;

  useEffect(() => {
    if (isMockData) {
      setLastPublished(null);
      return;
    }

    if (latestBriefing && (!lastPublished || lastPublished.id !== latestBriefing.id)) {
      setLastPublished(latestBriefing);
    }
  }, [isMockData, latestBriefing, lastPublished]);

  const handleGenerate = async () => {
    if (!accessToken) {
      setError('Missing session. Please sign out and back in.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSendError(null);
    setSendSuccess(null);
    try {
      const response = await fetch('/api/newsletters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = await safeJson(response);
        throw new Error(payload?.error || 'Failed to generate briefing.');
      }

      const result = await response.json();
      setDraftBriefing(normalizeBriefing(result));
    } catch (err) {
      console.error('Failed to generate newsletter briefing', err);
      setError(err instanceof Error ? err.message : 'Unknown error generating briefing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (!draftBriefing) return;
    if (!accessToken) {
      setError('Missing session. Please sign out and back in.');
      return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccessMessage(null);
    setSendError(null);
    setSendSuccess(null);

    const { id: _draftId, ...payload } = draftBriefing;

    fetch('/api/newsletters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...payload,
        status: 'published',
        publishedAt: new Date().toISOString(),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await safeJson(response);
          throw new Error(payload?.error || 'Failed to publish newsletter.');
        }
        const saved = await response.json();
        setSuccessMessage('Briefing published and added to the archive.');
        setDraftBriefing(null);
        setLastPublished(saved);
        onBriefingCreated?.(normalizeBriefing(saved));
      })
      .catch((err) => {
        console.error('Failed to publish newsletter', err);
        setError(err instanceof Error ? err.message : 'Failed to publish newsletter.');
      })
      .finally(() => {
        setIsPublishing(false);
      });
  };

  const handleSendEmail = async () => {
    if (!lastPublished?.id) {
      setSendError('Publish a briefing before sending email.');
      return;
    }

    if (!accessToken) {
      setSendError('Missing session. Please sign out and back in.');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const response = await fetch('/api/newsletters/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newsletterId: lastPublished.id }),
      });

      if (!response.ok) {
        const payload = await safeJson(response);
        throw new Error(payload?.error || 'Failed to send email.');
      }

      const payload = await response.json();
      setSendSuccess(`Newsletter emailed to ${payload.recipients ?? 0} subscribers.`);
    } catch (err) {
      console.error('Failed to send newsletter email', err);
      setSendError(err instanceof Error ? err.message : 'Failed to send newsletter email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
            Admin
          </p>
          <h2 className="text-3xl font-semibold text-white">Generate Threat Briefing</h2>
          <p className="text-sm text-slate-400">
            Run the Gemini-assisted scan to create this week’s Scam Watch newsletter.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {isLoading ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          <span>{isLoading ? 'Running Scan…' : 'Generate Briefing'}</span>
        </button>
      </header>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-900/40 p-4 text-red-100">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold">Action failed</h3>
            <p className="text-sm text-red-200/80">{error}</p>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-emerald-200 text-sm">
          {successMessage}
        </div>
      ) : null}

      {sendError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-900/30 p-4 text-red-100">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold">Email delivery failed</h3>
            <p className="text-sm text-red-200/80">{sendError}</p>
          </div>
        </div>
      ) : null}

      {sendSuccess ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-emerald-200 text-sm">
          {sendSuccess}
        </div>
      ) : null}

      {!error && !isLoading && !draftBriefing ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">
          <p className="text-sm">
            No draft briefing yet. Generate one to preview insights before publishing to the subscriber archive.
          </p>
        </div>
      ) : null}

      {draftBriefing ? (
        <article className="space-y-6 rounded-3xl border border-white/15 bg-slate-900/80 p-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              Draft Preview
            </p>
            <h3 className="text-4xl font-bold text-white">{draftBriefing.headline}</h3>
            <p className="text-sm text-slate-400">
              Scheduled for {formatHeadlineDate(new Date(draftBriefing.publishedAt || Date.now()))}
            </p>
            <p className="text-base text-slate-200 leading-relaxed">
              {draftBriefing.summary}
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            {draftBriefing.insights?.map((insight, index) => (
              <InsightCard
                key={`${draftBriefing.id}-preview-${index}`}
                insight={insight}
              />
            ))}
          </div>

          <SourcesList sources={draftBriefing.sources} />

          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>
              Publish to move this draft into the archive for subscribers and queue the email send.
            </p>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
            >
              {isPublishing ? 'Publishing…' : 'Publish Draft'}
            </button>
          </div>
        </article>
      ) : null}

      {lastPublished ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Ready to Send
              </p>
              <h3 className="text-xl font-semibold text-white">{lastPublished.headline}</h3>
              <p className="text-sm text-slate-400">
                Published {formatHeadlineDate(new Date(lastPublished.publishedAt || Date.now()))}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSending ? 'Sending…' : 'Send Newsletter Email'}
            </button>
          </div>
        </div>
      ) : null}
  </div>
  );
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function normalizeBriefing(raw) {
  const fallbackHeadline = 'Weekly Scam Watch Briefing';
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

  return {
    id: raw?.id || `draft-${Date.now()}`,
    headline: textValue(raw?.headline) || fallbackHeadline,
    summary: textValue(raw?.summary) || fallbackSummary,
    publishedAt: raw?.publishedAt || new Date().toISOString(),
    insights: normalizedInsights,
    sources: normalizedSources,
    status: raw?.status || 'draft',
  };
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
