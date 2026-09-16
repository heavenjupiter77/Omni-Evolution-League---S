import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerProfile, METRIC_DEFINITIONS } from '../types';
import { RANK_NUMERICAL, RANK_PERCENTAGES, getRankBadgeStyle, getRankGradientClass, getArchetypeInfo } from '../utils/ranks';
import { generateTacticalMatchupAssessment, getDetailedMetricSkillBreakdown } from '../utils/matchAnalysis';
import {
  Swords,
  Trophy,
  CheckCircle,
  Activity,
  User,
  ChevronDown,
  ChevronUp,
  Target,
  ShieldAlert,
  Flame,
  Zap,
  Check,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface ProfileComparisonProps {
  players: PlayerProfile[];
  initialPlayer1Id?: string;
  initialPlayer2Id?: string;
  onNavigateToAdmin?: () => void;
}

export const ProfileComparison: React.FC<ProfileComparisonProps> = ({
  players,
  initialPlayer1Id,
  initialPlayer2Id,
  onNavigateToAdmin,
}) => {
  const [player1Id, setPlayer1Id] = useState<string>(
    initialPlayer1Id && players.some((p) => p.id === initialPlayer1Id)
      ? initialPlayer1Id
      : players[0]?.id || ''
  );
  const [player2Id, setPlayer2Id] = useState<string>(
    initialPlayer2Id && players.some((p) => p.id === initialPlayer2Id)
      ? initialPlayer2Id
      : players[1]?.id || players[0]?.id || ''
  );

  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState<boolean>(false);

  if (players.length < 2) {
    return (
      <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-full bg-cyan-950/70 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300">
          <Swords className="w-7 h-7" />
        </div>
        <h3 className="font-display font-bold text-xl text-white tracking-wide">
          PROFILE COMPARISON
        </h3>
        <p className="text-sm text-slate-400 font-mono leading-relaxed">
          At least two registered athlete profiles are needed to evaluate head-to-head metrics and tactical advantages.
        </p>
        {onNavigateToAdmin && (
          <div className="pt-2">
            <button
              onClick={onNavigateToAdmin}
              className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer"
            >
              ENLIST ATHLETES IN ADMIN
            </button>
          </div>
        )}
      </div>
    );
  }

  const p1 = players.find((p) => p.id === player1Id) || players[0];
  const p2 = players.find((p) => p.id === player2Id) || players[1] || players[0];

  // Calculate advantages
  let p1Wins = 0;
  let p2Wins = 0;
  let ties = 0;

  const metricResults = METRIC_DEFINITIONS.map((def) => {
    const r1 = p1.metrics[def.key];
    const r2 = p2.metrics[def.key];
    const v1 = RANK_NUMERICAL[r1];
    const v2 = RANK_NUMERICAL[r2];

    let winner: 'p1' | 'p2' | 'tie' = 'tie';
    if (v1 > v2) {
      winner = 'p1';
      p1Wins++;
    } else if (v2 > v1) {
      winner = 'p2';
      p2Wins++;
    } else {
      ties++;
    }

    return {
      def,
      r1,
      r2,
      v1,
      v2,
      winner,
      diff: Math.abs(v1 - v2),
    };
  });

  const p1Arch = getArchetypeInfo(p1.archetype);
  const p2Arch = getArchetypeInfo(p2.archetype);

  // In-Depth Tactical Matchup Assessment (checking both archetypes AND ranking stats)
  const assessment = generateTacticalMatchupAssessment(p1, p2);

  // SVG Hexagon Radar calculation
  const radarMetrics = METRIC_DEFINITIONS;
  const radius = 105;
  const centerX = 150;
  const centerY = 150;

  const getCoordinates = (value: number, index: number, total: number) => {
    const norm = value / 5;
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = centerX + radius * norm * Math.cos(angle);
    const y = centerY + radius * norm * Math.sin(angle);
    return { x, y };
  };

  const p1PolygonPoints = radarMetrics
    .map((m, idx) => {
      const val = RANK_NUMERICAL[p1.metrics[m.key]];
      const { x, y } = getCoordinates(val, idx, radarMetrics.length);
      return `${x},${y}`;
    })
    .join(' ');

  const p2PolygonPoints = radarMetrics
    .map((m, idx) => {
      const val = RANK_NUMERICAL[p2.metrics[m.key]];
      const { x, y } = getCoordinates(val, idx, radarMetrics.length);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8" id="profile-comparison-module">
      {/* Title & Selector Bar */}
      <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Player 1 Selector */}
          <div className="w-full md:w-5/12 flex items-center gap-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3.5">
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-cyan-400 flex-shrink-0 bg-slate-950 flex items-center justify-center">
              {p1.avatarUrl ? (
                <img
                  src={p1.avatarUrl}
                  alt={p1.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-cyan-400/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                Athlete Alpha
              </label>
              <select
                id="select-player-1"
                value={p1.id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-display text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {players.map((pl) => (
                  <option key={pl.id} value={pl.id} disabled={pl.id === p2.id}>
                    {pl.name} ({pl.archetype})
                  </option>
                ))}
              </select>
              {p1.nickname && (
                <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                  "{p1.nickname}"
                </p>
              )}
            </div>
          </div>

          {/* Versus Center Badge */}
          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Swords className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold mt-1">
              VS
            </span>
          </div>

          {/* Player 2 Selector */}
          <div className="w-full md:w-5/12 flex items-center gap-4 bg-slate-900/80 border border-fuchsia-500/30 rounded-xl p-3.5">
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-fuchsia-400 flex-shrink-0 bg-slate-950 flex items-center justify-center">
              {p2.avatarUrl ? (
                <img
                  src={p2.avatarUrl}
                  alt={p2.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-fuchsia-400/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-mono uppercase text-fuchsia-400 font-bold block mb-1">
                Athlete Beta
              </label>
              <select
                id="select-player-2"
                value={p2.id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-display text-white focus:outline-none focus:border-fuchsia-400 cursor-pointer"
              >
                {players.map((pl) => (
                  <option key={pl.id} value={pl.id} disabled={pl.id === p1.id}>
                    {pl.name} ({pl.archetype})
                  </option>
                ))}
              </select>
              {p2.nickname && (
                <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                  "{p2.nickname}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Head-to-Head Scoreboard Summary */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-sm">
              {p1.name}: {p1Wins} Categories
            </div>
            <span className="text-slate-600 font-mono">-</span>
            <div className="px-3 py-1 rounded bg-fuchsia-950/60 border border-fuchsia-500/50 text-fuchsia-300 font-mono font-bold text-sm">
              {p2.name}: {p2Wins} Categories
            </div>
            {ties > 0 && (
              <span className="text-xs text-slate-400 font-mono">({ties} Equal)</span>
            )}
          </div>

          <div className="text-xs font-mono">
            {p1Wins > p2Wins ? (
              <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> STATISTICAL EDGE: {p1.name.toUpperCase()} (+{p1Wins - p2Wins})
              </span>
            ) : p2Wins > p1Wins ? (
              <span className="text-fuchsia-400 font-bold tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> STATISTICAL EDGE: {p2.name.toUpperCase()} (+{p2Wins - p1Wins})
              </span>
            ) : (
              <span className="text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> DEAD HEAT: EQUAL PERFORMANCE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hexagonal Radar and Archetype Matchup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hexagonal Radar Chart */}
        <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-5 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h4 className="font-display text-sm uppercase text-slate-300 tracking-wider">
              Hexagonal Metric Radar
            </h4>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                {p1.name}
              </span>
              <span className="flex items-center gap-1 text-fuchsia-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 inline-block"></span>
                {p2.name}
              </span>
            </div>
          </div>

          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            <svg width="300" height="300" className="overflow-visible">
              {/* Concentric rings */}
              {[1, 2, 3, 4, 5].map((lvl) => {
                const ringPoints = radarMetrics
                  .map((_, idx) => {
                    const { x, y } = getCoordinates(lvl, idx, radarMetrics.length);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={ringPoints}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={lvl === 5 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Radial Spokes */}
              {radarMetrics.map((_, idx) => {
                const { x, y } = getCoordinates(5, idx, radarMetrics.length);
                return (
                  <line
                    key={idx}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Player 1 Radar Fill */}
              <polygon
                points={p1PolygonPoints}
                fill="rgba(6, 182, 212, 0.25)"
                stroke="#06b6d4"
                strokeWidth="2"
              />

              {/* Player 2 Radar Fill */}
              <polygon
                points={p2PolygonPoints}
                fill="rgba(217, 70, 239, 0.25)"
                stroke="#d946ef"
                strokeWidth="2"
              />

              {/* Metric Labels on Outer Perimeter */}
              {radarMetrics.map((m, idx) => {
                const { x, y } = getCoordinates(5.7, idx, radarMetrics.length);
                return (
                  <text
                    key={m.key}
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {m.code}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tactical Matchup Bento */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-bold text-base text-white tracking-wide mb-4">
              Archetype Compatibility & Matchup Dynamics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* P1 Archetype Card */}
              <div
                className={`p-4 rounded-xl border ${p1Arch.bg} ${p1Arch.border} transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">{p1.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${p1Arch.color} bg-black/40 border ${p1Arch.border}`}
                  >
                    {p1.archetype}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">{p1Arch.tacticalAdvantage}</p>
              </div>

              {/* P2 Archetype Card */}
              <div
                className={`p-4 rounded-xl border ${p2Arch.bg} ${p2Arch.border} transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-fuchsia-300">{p2.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${p2Arch.color} bg-black/40 border ${p2Arch.border}`}
                  >
                    {p2.archetype}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">{p2Arch.tacticalAdvantage}</p>
              </div>
            </div>

            {/* Tactical Matchup Assessment (Checks both Archetype AND Ranking Stats) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
              {/* Header with Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-mono text-cyan-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                      Tactical Matchup Assessment
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      Archetype Clash & Statistical Metric Tier Alignment
                    </span>
                  </div>
                </div>

                {/* Archetype Clash Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono self-start sm:self-auto">
                  <span className={`font-bold ${p1Arch.color}`}>{p1.archetype}</span>
                  <span className="text-slate-600 font-bold text-[10px]">VS</span>
                  <span className={`font-bold ${p2Arch.color}`}>{p2.archetype}</span>
                </div>
              </div>

              {/* Structured Tactical Synopsis Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Core Dynamic Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span className="uppercase text-amber-300/90 tracking-wide text-[11px]">Primary Clash Dynamic</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {assessment.coreClashDynamic}
                  </p>
                </div>

                {/* Deciding Axis Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="uppercase text-cyan-300/90 tracking-wide text-[11px]">Critical Deciding Factor</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {assessment.decidingFactor}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Strategic Category:</span>
                    <span className="text-cyan-400 font-bold">{assessment.coreClashTitle}</span>
                  </div>
                </div>
              </div>

              {/* Structured Stat Differential Matrix Grid (Replaces inline bullet text) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Stat Tier Differentials (6 Dimensions)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Tier Margin Analysis</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assessment.statDifferentials.map((item) => {
                    const isP1 = item.leader === 'p1';
                    const isP2 = item.leader === 'p2';
                    const isTie = item.leader === 'tie';

                    return (
                      <div
                        key={item.code}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                          isP1
                            ? 'bg-cyan-950/20 border-cyan-500/35 hover:border-cyan-500/50'
                            : isP2
                            ? 'bg-fuchsia-950/20 border-fuchsia-500/35 hover:border-fuchsia-500/50'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top row: Metric Code + Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                            <span className="text-cyan-400">{item.code}</span>
                            <span className="text-slate-300 text-xs font-medium truncate max-w-[150px]">
                              {item.name}
                            </span>
                          </span>

                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                              isP1
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : isP2
                                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isTie ? 'Parity' : item.badgeText}
                          </span>
                        </div>

                        {/* Middle row: Head-to-Head Ranks */}
                        <div className="flex items-center justify-between text-xs font-mono py-1.5 px-2.5 rounded-lg bg-black/50 border border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-300 font-bold truncate max-w-[95px] text-xs">{p1.name}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getRankBadgeStyle(item.p1Rank).text} ${getRankBadgeStyle(item.p1Rank).bg}`}>
                              {item.p1Rank}
                            </span>
                          </div>
                          <span className="text-slate-600 text-xs font-bold">vs</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getRankBadgeStyle(item.p2Rank).text} ${getRankBadgeStyle(item.p2Rank).bg}`}>
                              {item.p2Rank}
                            </span>
                            <span className="text-fuchsia-300 font-bold truncate max-w-[95px] text-xs">{p2.name}</span>
                          </div>
                        </div>

                        {/* Bottom row: Tactical Takeaway */}
                        <p className="text-xs text-slate-300 font-mono leading-relaxed">
                          {item.takeaway}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Click to expand full in-depth match analysis button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-toggle-in-depth-analysis"
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <span>
                    {isAnalysisExpanded
                      ? 'COLLAPSE FULL IN-DEPTH MATCH ANALYSIS'
                      : 'EXPAND FULL IN-DEPTH MATCH ANALYSIS (HEAD-TO-HEAD)'}
                  </span>
                  {isAnalysisExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Expandable In-Depth Match Analysis */}
              {isAnalysisExpanded && (
                <div
                  id="expanded-in-depth-match-analysis"
                  className="mt-4 pt-4 border-t border-cyan-500/30 space-y-4 animate-fadeIn"
                >
                  {/* 4-Phase Head-to-Head Simulation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-bold uppercase text-xs flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        4-Phase Head-to-Head Tactical Simulation
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Sequential Rally Flow</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {assessment.phases.map((phase) => (
                        <div
                          key={phase.phaseNumber}
                          className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs space-y-2 flex flex-col justify-between overflow-hidden"
                        >
                          {/* Phase Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold flex-shrink-0">
                                PHASE {phase.phaseNumber}
                              </span>
                              <div className="min-w-0">
                                <span className="font-mono font-bold text-white text-xs block truncate">
                                  {phase.title}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 block truncate">
                                  {phase.metricsClash}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`font-mono text-[10px] px-2.5 py-1 rounded-full font-bold uppercase self-start sm:self-center flex-shrink-0 max-w-full truncate ${
                                phase.edge === 'p1'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                                  : phase.edge === 'p2'
                                  ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50'
                                  : 'bg-slate-900 text-slate-400 border border-slate-700'
                              }`}
                              title={phase.verdict}
                            >
                              {phase.verdict}
                            </span>
                          </div>

                          {/* Key Factor & Table Outcome */}
                          <div className="space-y-1.5 text-[11px] font-mono">
                            <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80">
                              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">
                                Tactical Dynamic:
                              </span>
                              <p className="text-slate-300 leading-snug">{phase.keyTacticalFactor}</p>
                            </div>

                            <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80">
                              <span className="text-cyan-400 font-bold block text-[10px] uppercase mb-0.5">
                                Table Outcome:
                              </span>
                              <p className="text-slate-300 leading-snug">{phase.tableOutcome}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Win Conditions Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* P1 Win Blueprint */}
                    <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/40 text-xs space-y-2.5">
                      <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs pb-1.5 border-b border-cyan-500/20">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <span>{p1.name} Win Blueprint:</span>
                      </div>

                      <div className="space-y-2 font-mono">
                        {assessment.winKeysP1.map((key, kIdx) => (
                          <div key={kIdx} className="flex items-start gap-2 text-slate-300 text-[11px] leading-snug">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* P2 Win Blueprint */}
                    <div className="p-4 rounded-xl bg-fuchsia-950/25 border border-fuchsia-500/40 text-xs space-y-2.5">
                      <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold text-xs pb-1.5 border-b border-fuchsia-500/20">
                        <Target className="w-4 h-4 text-fuchsia-400" />
                        <span>{p2.name} Win Blueprint:</span>
                      </div>

                      <div className="space-y-2 font-mono">
                        {assessment.winKeysP2.map((key, kIdx) => (
                          <div key={kIdx} className="flex items-start gap-2 text-slate-300 text-[11px] leading-snug">
                            <Check className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                            <span>{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Projected Match Outcome Banner */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-xs sm:text-sm text-white font-bold tracking-wider uppercase">
                          PROJECTED OUTCOME: {assessment.predictedOutcome.winnerName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-snug">
                        {assessment.predictedOutcome.closingSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs">
                        Set Score: {assessment.predictedOutcome.score}
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono font-bold text-xs">
                        {assessment.predictedOutcome.edgeRating}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Category Breakdown Table */}
      <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-white tracking-wide">
              Detailed Metric Breakdown (6 Categories)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Comparing D to S rankings across each distinct dimension with specific skill tier evaluations
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {metricResults.map(({ def, r1, r2, winner }) => {
            const b1 = getRankBadgeStyle(r1);
            const b2 = getRankBadgeStyle(r2);
            const p1Width = RANK_PERCENTAGES[r1];
            const p2Width = RANK_PERCENTAGES[r2];

            // Specific combinatorial skill level breakdown for this metric and rank pair
            const skillBreakdown = getDetailedMetricSkillBreakdown(
              def.key,
              r1,
              r2,
              p1.name,
              p2.name
            );

            return (
              <div
                key={def.key}
                id={`compare-metric-${def.key}`}
                className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                {/* Metric Title and Verdict */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold mr-2 text-sm">
                      {def.code}
                    </span>
                    <span className="font-semibold text-white text-sm">{def.name}</span>
                    <span className="block text-[11px] text-slate-400 font-mono">
                      {def.shortDesc}
                    </span>
                  </div>

                  {/* Advantage pill */}
                  <div>
                    {winner === 'p1' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                        {p1.name} Advantage ({r1} vs {r2})
                      </span>
                    )}
                    {winner === 'p2' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-fuchsia-950/70 border border-fuchsia-500/60 text-fuchsia-300 font-mono font-bold text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-fuchsia-400" />
                        {p2.name} Advantage ({r2} vs {r1})
                      </span>
                    )}
                    {winner === 'tie' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-xs">
                        Equal Tier ({r1})
                      </span>
                    )}
                  </div>
                </div>

                {/* Bars side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* P1 bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-cyan-300">{p1.name}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${b1.text} ${b1.bg}`}>
                        {r1}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded border border-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p1Width}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full bg-gradient-to-r ${getRankGradientClass(r1)}`}
                      />
                    </div>
                  </div>

                  {/* P2 bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-fuchsia-300">{p2.name}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${b2.text} ${b2.bg}`}>
                        {r2}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded border border-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p2Width}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full bg-gradient-to-r ${getRankGradientClass(r2)}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Skill Tier Breakdown & Head-to-Head Clash Cards */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  {/* Side-by-Side Player Skill Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                    {/* P1 Skill Card */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/25 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-cyan-500/15">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${b1.text} ${b1.bg}`}>
                            {r1}
                          </span>
                          <span className="text-xs font-bold text-cyan-300">{p1.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold truncate max-w-[160px]">
                          {skillBreakdown.p1Tier.tierName}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {skillBreakdown.p1Tier.technicalDescription}
                      </p>
                    </div>

                    {/* P2 Skill Card */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-fuchsia-500/25 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-fuchsia-500/15">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${b2.text} ${b2.bg}`}>
                            {r2}
                          </span>
                          <span className="text-xs font-bold text-fuchsia-300">{p2.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-950/60 border border-fuchsia-500/30 text-fuchsia-300 font-semibold truncate max-w-[160px]">
                          {skillBreakdown.p2Tier.tierName}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {skillBreakdown.p2Tier.technicalDescription}
                      </p>
                    </div>
                  </div>

                  {/* Structured Clash Insight Panel */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    {/* Panel Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-mono font-bold text-amber-400 tracking-wide uppercase">
                          Clash Dynamics & Advantage
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 font-bold w-fit">
                        {skillBreakdown.advantageHeadline}
                      </span>
                    </div>

                    {/* Structured Insight Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                        <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">
                          Table Interaction
                        </span>
                        <p className="text-slate-300 text-[11px] leading-snug">
                          {skillBreakdown.tableDynamic}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                        <span className="text-cyan-400 text-[10px] font-bold uppercase block mb-1">
                          Tactical Leverage
                        </span>
                        <p className="text-slate-300 text-[11px] leading-snug">
                          {skillBreakdown.tacticalLeverage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
