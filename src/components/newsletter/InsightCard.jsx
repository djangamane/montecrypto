import { ShieldAlert } from './Icons.jsx';

const threatLevelStyles = {
  High: 'bg-red-500 border-red-400',
  Medium: 'bg-yellow-500 border-yellow-400',
  Low: 'bg-green-500 border-green-400',
};

function ThreatBadge({ level }) {
  const style = threatLevelStyles[level] || 'bg-gray-500 border-gray-400';
  return (
    <span className={`px-3 py-1 text-xs font-bold text-white rounded-full border ${style} flex-shrink-0`}>
      {level?.toUpperCase?.() || 'UNKNOWN'} THREAT
    </span>
  );
}

export function InsightCard({ insight }) {
  if (!insight) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700/50 flex flex-col h-full transform transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:shadow-blue-500/10">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-100">{insight.title}</h3>
          <ThreatBadge level={insight.threatLevel} />
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-4">{insight.summary}</p>
      </div>

      <div className="bg-gray-900/40 p-5 border-t border-gray-700/50 rounded-b-lg mt-auto">
        <div className="flex items-start">
          <ShieldAlert className="w-5 h-5 mr-3 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-200 mb-1">How to Avoid</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{insight.howToAvoid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
