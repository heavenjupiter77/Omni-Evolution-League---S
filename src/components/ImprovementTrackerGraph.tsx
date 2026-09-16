import React, { useState } from 'react';
import { PerformanceRecord } from '../types';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Zap } from 'lucide-react';

interface ImprovementTrackerGraphProps {
  history?: PerformanceRecord[];
  currentPerformance?: number;
  playerName: string;
}

export const ImprovementTrackerGraph: React.FC<ImprovementTrackerGraphProps> = ({
  history = [],
  currentPerformance = 100,
  playerName,
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Fallback if history is empty
  const dataPoints: PerformanceRecord[] =
    history.length > 0
      ? history
      : [
          {
            id: 'init-baseline',
            date: new Date().toISOString().split('T')[0],
            displayDate: 'Month Start',
            change: 0,
            percentage: 100,
            type: 'reset',
            monthKey: 'current',
            note: 'Normal 100% Baseline',
          },
        ];

  const currentVal = currentPerformance ?? dataPoints[dataPoints.length - 1]?.percentage ?? 100;
  const isNetPositive = currentVal >= 100;
  const netDelta = currentVal - 100;

  // Chart dimensions & scaling
  const width = 480;
  const height = 160;
  const paddingX = 36;
  const paddingTop = 24;
  const paddingBottom = 32;

  const values = dataPoints.map((p) => p.percentage);
  // Ensure baseline 100 is nicely centered or visible
  const minVal = Math.min(70, Math.min(...values) - 15);
  const maxVal = Math.max(130, Math.max(...values) + 15);
  const valRange = maxVal - minVal || 1;

  const getX = (index: number) => {
    if (dataPoints.length <= 1) return width / 2;
    return paddingX + (index / (dataPoints.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / valRange;
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  const baselineY = getY(100);

  // Generate path string
  const points = dataPoints.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.percentage),
    data: p,
  }));

  // Build SVG path
  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}`;
  } else {
    pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }

  // Area path for gradient fill
  const areaD =
    points.length === 1
      ? `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y} L ${width - paddingX} ${height - paddingBottom} L ${paddingX} ${height - paddingBottom} Z`
      : `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const activePoint = activePointIndex !== null ? dataPoints[activePointIndex] : null;

  return (
    <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-3 font-mono">
      {/* Top Header: Incline / Decline Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border flex items-center justify-center ${
              isNetPositive
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/70 border-rose-500/40 text-rose-400'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Performance Tracker
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400">
                100% Monthly Cycle
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Stock market weekly trajectory for {playerName}
            </span>
          </div>
        </div>

        {/* Current rating readout */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
              currentVal > 100
                ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : currentVal < 100
                ? 'bg-rose-950/80 border-rose-400/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300'
            }`}
          >
            {currentVal > 100 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : currentVal < 100 ? (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="font-bold text-sm tracking-tight">{currentVal}%</span>
            <span className="text-[10px] font-semibold opacity-90">
              {netDelta > 0 ? `(+${netDelta}%)` : netDelta < 0 ? `(${netDelta}%)` : '(Normal)'}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible"
        >
          <defs>
            {/* Bullish / Incline Gradient */}
            <linearGradient id="grad-incline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Bearish / Decline Gradient */}
            <linearGradient id="grad-decline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>

            {/* Line stroke gradient */}
            <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="0%"
                stopColor={isNetPositive ? '#06b6d4' : '#fb923c'}
              />
              <stop
                offset="100%"
                stopColor={isNetPositive ? '#10b981' : '#f43f5e'}
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#1e293b"
            strokeDasharray="2 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#1e293b"
          />

          {/* 100% Normal Baseline */}
          <line
            x1={paddingX}
            y1={baselineY}
            x2={width - paddingX}
            y2={baselineY}
            stroke="#475569"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />
          <text
            x={width - paddingX + 4}
            y={baselineY + 3}
            fill="#94a3b8"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="start"
          >
            100% Normal
          </text>

          {/* Area fill */}
          <path
            d={areaD}
            fill={isNetPositive ? 'url(#grad-incline)' : 'url(#grad-decline)'}
          />

          {/* Chart line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#line-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isSelected = activePointIndex === idx;
            const ptColor =
              pt.data.percentage >= 100 ? '#10b981' : '#f43f5e';

            return (
              <g
                key={pt.data.id || idx}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setActivePointIndex(idx)}
                onMouseLeave={() => setActivePointIndex(null)}
                onClick={() => setActivePointIndex(idx)}
              >
                {/* Glow ring */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill={ptColor}
                    fillOpacity="0.25"
                  />
                )}
                {/* Outer ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? '5' : '3.5'}
                  fill="#030712"
                  stroke={ptColor}
                  strokeWidth="2"
                />
                {/* Date Label on X-axis */}
                <text
                  x={pt.x}
                  y={height - 10}
                  fill={isSelected ? '#38bdf8' : '#64748b'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {pt.data.displayDate}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Tooltip */}
        {activePoint && (
          <div className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white">{activePoint.date}</span>
              <span className="text-[10px] text-slate-400">({activePoint.displayDate})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">Weekly Shift:</span>
              <span
                className={`font-bold ${
                  activePoint.change > 0
                    ? 'text-emerald-400'
                    : activePoint.change < 0
                    ? 'text-rose-400'
                    : 'text-cyan-400'
                }`}
              >
                {activePoint.change > 0
                  ? `+${activePoint.change}%`
                  : activePoint.change < 0
                  ? `${activePoint.change}%`
                  : '0% (Reset)'}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 text-[10px]">Rating:</span>
              <span className="font-bold text-white">{activePoint.percentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly History Timeline Ticker */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-1.5 text-[10px] text-slate-500 uppercase">
          <span>Weekly Performance Records</span>
          <span>Resets to 100% Monthly</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {dataPoints.map((rec, idx) => (
            <div
              key={rec.id || idx}
              onClick={() => setActivePointIndex(idx)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
                activePointIndex === idx
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{rec.displayDate}:</span>
                <span
                  className={`font-bold ${
                    rec.percentage > 100
                      ? 'text-emerald-400'
                      : rec.percentage < 100
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {rec.percentage}%
                </span>
                {rec.change !== 0 && (
                  <span
                    className={`text-[9px] ${
                      rec.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({rec.change > 0 ? `+${rec.change}%` : `${rec.change}%`})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
