import { LinkIcon } from './Icons.jsx';

export function SourcesList({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div className="rounded-2xl border border-brand-muted/30 bg-brand-bg/80 p-6">
      <h4 className="text-xl font-semibold text-brand-text">Referenced sources</h4>
      <p className="mt-2 text-sm text-brand-muted">
        The AI generated this briefing using the public data points below.
      </p>
      <ul className="mt-4 space-y-3">
        {sources.map((source, index) => (
          <li key={`${source.uri}-${index}`} className="flex items-start gap-3">
            <LinkIcon className="mt-1 h-4 w-4 text-brand-link" />
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-brand-link transition hover:text-brand-text hover:underline"
              aria-label={`Read more about ${source.title || 'this source'}`}
            >
              {source.title || source.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
