import React from 'react';
import { motion } from 'motion/react';
import { RankGrade, MetricKey, METRIC_DEFINITIONS } from '../types';
import { RANK_PERCENTAGES, getRankGradientClass, getRankBadgeStyle } from '../utils/ranks';

interface MetricBarProps {
  metricKey: MetricKey;
  rank: RankGrade;
  showDescription?: boolean;
}

export const MetricBar: React.FC<MetricBarProps> = ({
  metricKey,
  rank,
  showDescription = false,
}) => {
  const metricDef = METRIC_DEFINITIONS.find((m) => m.key === metricKey);
  const percentage = RANK_PERCENTAGES[rank];
  const gradientClass = getRankGradientClass(rank);
  const badgeStyle = getRankBadgeStyle(rank);

  return (
    <div className="space-y-1.5" id={`metric-bar-${metricKey}`}>
      <div className="flex items-center justify-between text-xs tracking-wider">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">{metricDef?.code}</span>
          <span className="text-slate-300 font-medium">{metricDef?.name}</span>
        </div>
        <div
          className={`flex items-center justify-center w-7 h-5 text-xs font-mono font-bold rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${badgeStyle.glow}`}
        >
          {rank}
        </div>
      </div>

      {/* Cyber bar container */}
      <div className="relative h-3 w-full bg-slate-950/80 rounded border border-cyan-950/80 p-0.5 overflow-hidden">
        {/* Subtle grid divisions */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
          <div className="w-px h-full bg-slate-700"></div>
          <div className="w-px h-full bg-slate-700"></div>
          <div className="w-px h-full bg-slate-700"></div>
          <div className="w-px h-full bg-slate-700"></div>
        </div>

        {/* Animated filling bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-sm bg-gradient-to-r ${gradientClass} transition-all duration-300`}
        />
      </div>

      {showDescription && metricDef && (
        <p className="text-[11px] text-slate-500 font-mono tracking-tight leading-tight">
          {metricDef.shortDesc}
        </p>
      )}
    </div>
  );
};
