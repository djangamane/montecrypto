import ExternalLinkIcon from './icons/ExternalLinkIcon.jsx';

export default function AnalysisSources({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div>
      <h4 className="mb-4 text-center text-xl font-semibold text-brand-text">Data sources & further reading</h4>
      <div className="rounded-2xl border border-brand-muted/40 bg-white/80 p-4">
        <ul className="space-y-3">
          {sources.map(({ title, url }, index) => (
            <li key={index}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm text-brand-link transition hover:text-brand-text"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span className="group-hover:underline">{title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
