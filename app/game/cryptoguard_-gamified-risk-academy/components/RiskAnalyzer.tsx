// @ts-nocheck

import React, { useState } from 'react';
import { analyzeCryptoRisk } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import Button from './ui/Button';
import { ShieldAlert, ShieldCheck, BrainCircuit, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RiskAnalyzerProps {
  onComplete: () => void;
  scansRemaining: number;
}

const RiskAnalyzer: React.FC<RiskAnalyzerProps> = ({ onComplete, scansRemaining }) => {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    const data = await analyzeCryptoRisk(scenario);
    setResult(data);
    setLoading(false);

    // Simulate completing the "lesson" after one successful scan
    if (data) {
      setTimeout(onComplete, 5000); // Complete after viewing results for 5s
    }
  };

  const scoreColor = (score: number) => {
    if (score < 30) return '#10b981'; // Green
    if (score < 70) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const renderResult = () => {
    if (!result) return null;

    const data = [
      { name: 'Risk', value: result.score },
      { name: 'Safe', value: 100 - result.score },
    ];

    return (
      <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={scoreColor(result.score)} />
                  <Cell fill="#374151" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold text-white">{result.score}/100</span>
              <span className="text-[10px] uppercase text-gray-400">Risk</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              {result.score > 70 ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-emerald-500" />}
              {result.score > 70 ? "High Risk Detected" : "Moderate/Low Risk"}
            </h3>
            <p className="text-gray-300 text-sm mb-4 bg-gray-900/50 p-3 rounded-lg border-l-4 border-brand-500">
              {result.reasoning}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.signals.map((signal, idx) => (
                <span key={idx} className="px-2 py-1 text-xs font-semibold bg-gray-700 text-gray-200 rounded-md border border-gray-600">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-brand-500" />
            AI Risk Decoder
          </h2>
          <span className="bg-brand-900 text-brand-200 text-xs font-bold px-3 py-1 rounded-full border border-brand-700">
            {scansRemaining} Scans Remaining
          </span>
        </div>

        <p className="text-gray-400 mb-4 text-sm">
          Paste a token contract, a tweet describing a project, or a description of tokenomics.
          The AI will cross-reference signals to detect potential scams.
        </p>

        <textarea
          className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-xl p-4 focus:border-brand-500 focus:outline-none transition-colors h-32 resize-none"
          placeholder="e.g. New token $MOON launched by anonymous dev, liquidity locked for 1 month only..."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          disabled={loading || scansRemaining <= 0}
        />

        <div className="mt-4">
          <Button
            fullWidth
            onClick={handleAnalyze}
            disabled={loading || !scenario.trim() || scansRemaining <= 0}
            variant={scansRemaining <= 0 ? "secondary" : "primary"}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Activity className="animate-spin" /> Decoding Signals...
              </span>
            ) : "Run Risk Scan"}
          </Button>
        </div>

        {renderResult()}
      </div>
    </div>
  );
};

export default RiskAnalyzer;
