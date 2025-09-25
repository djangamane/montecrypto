import ExternalLinkIcon from './icons/ExternalLinkIcon.jsx';

export default function AnalysisSources({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div>
      <h4 className="mb-4 text-center text-xl font-bold">Data Sources & Further Reading</h4>
      <div className="rounded-lg border border-brand-secondary bg-brand-primary p-4">
        <ul className="space-y-3">
          {sources.map(({ title, url }, index) => (
            <li key={index}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-brand-subtext transition-colors hover:text-brand-accent"
              >
                <ExternalLinkIcon className="h-5 w-5" />
                <span className="group-hover:underline">{title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
