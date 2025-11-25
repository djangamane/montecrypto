import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Level } from '../types';
import { LevelStatus } from '../types';
import { Lock, Check, Play } from 'lucide-react';

interface LevelMapProps {
  levels: Level[];
  currentLevelId: number;
  onSelectLevel: (level: Level) => void;
}

const LevelMap: React.FC<LevelMapProps> = ({ levels, currentLevelId, onSelectLevel }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const nodeHeight = 160; // Distance between nodes
    const height = levels.length * nodeHeight + 100;

    svg.attr("width", width).attr("height", height);

    // Draw Path
    const pathData = levels.map((level, i) => {
      const x = i % 2 === 0 ? width * 0.3 : width * 0.7; // Zigzag
      const y = i * nodeHeight + 80;
      return { x, y };
    });

    const lineGenerator = d3.line<{ x: number, y: number }>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCatmullRom.alpha(0.5));

    svg.append("path")
      .datum(pathData)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#4b5563") // Gray-600
      .attr("stroke-width", 8)
      .attr("stroke-dasharray", "16 8")
      .attr("stroke-linecap", "round");

  }, [levels]);

  return (
    <div className="relative w-full overflow-hidden pb-20" ref={containerRef}>
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />

      <div className="flex flex-col items-center w-full pt-10 relative z-10 space-y-16">
        {levels.map((level, index) => {
          const isEven = index % 2 === 0;
          const isLocked = level.status === LevelStatus.LOCKED;
          const isCompleted = level.status === LevelStatus.COMPLETED;
          const isActive = level.id === currentLevelId;

          return (
            <div
              key={level.id}
              className={`flex w-full ${isEven ? 'justify-start pl-[20%]' : 'justify-end pr-[20%]'} transition-transform duration-500`}
            >
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-200 cursor-pointer"
                onClick={() => !isLocked && onSelectLevel(level)}>

                {/* Node Circle */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl mb-2
                  ${isLocked ? 'bg-gray-800 border-gray-600' : isActive ? 'bg-white border-brand-500 ring-4 ring-brand-500/30' : 'bg-gray-800 border-success'}
                  ${level.color.replace('bg-', 'border-')} 
                `}>
                  {isLocked ? (
                    <Lock className="w-8 h-8 text-gray-500" />
                  ) : isCompleted ? (
                    <Check className="w-10 h-10 text-success font-bold" strokeWidth={4} />
                  ) : (
                    <Play className="w-10 h-10 text-brand-600 fill-brand-600 ml-1" />
                  )}
                </div>

                {/* Level Tag */}
                <div className={`px-4 py-2 rounded-xl text-center min-w-[140px]
                  ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-300'}
                  shadow-lg border-b-4 ${isActive ? 'border-brand-800' : 'border-gray-900'}
                `}>
                  <h3 className="font-bold text-sm uppercase tracking-wider">Level {level.id}</h3>
                  <p className="text-xs opacity-90">{level.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;