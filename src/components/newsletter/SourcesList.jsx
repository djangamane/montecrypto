import { LinkIcon } from './Icons.jsx';

export function SourcesList({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700/50 p-6">
      <h4 className="text-xl font-semibold text-gray-200 mb-4">Referenced Sources</h4>
      <p className="text-sm text-gray-500 mb-4">
        The AI generated this briefing based on information from the following web sources.
      </p>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li key={`${source.uri}-${index}`} className="flex items-start group">
            <LinkIcon className="w-4 h-4 mr-3 mt-1 text-blue-400 flex-shrink-0" />
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 group-hover:underline break-all"
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
