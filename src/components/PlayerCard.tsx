import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, METRIC_DEFINITIONS } from '../types';
import { MetricBar } from './MetricBar';
import { ImprovementTrackerGraph } from './ImprovementTrackerGraph';
import { getArchetypeInfo } from '../utils/ranks';
import {
  Shield,
  Zap,
  Crosshair,
  Flame,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Swords,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ExternalLink,
  Award,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerCardProps {
  player: PlayerProfile;
  onCompareSelect?: (player: PlayerProfile) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onCompareSelect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const archetypeInfo = getArchetypeInfo(player.archetype);

  const currentPerformance = player.currentPerformance ?? 100;
  const performanceDiff = currentPerformance - 100;

  // Lock body scroll and listen for Escape key when pop-up is active
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const renderArchetypeIcon = () => {
    switch (player.archetype) {
      case 'Attacker':
        return <Zap className="w-3.5 h-3.5 text-red-400" />;
      case 'Chopper':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Blocker':
        return <Crosshair className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Finisher':
        return <Flame className="w-3.5 h-3.5 text-purple-400" />;
      case 'Lobber':
        return <Wind className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // Find top 2 highest rated metrics for the compact card preview
  const rankOrder: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
  const sortedMetrics = Object.entries(player.metrics).sort((a, b) => {
    const rankA = String(a[1]);
    const rankB = String(b[1]);
    return (rankOrder[rankB] || 0) - (rankOrder[rankA] || 0);
  });
  const topMetrics = sortedMetrics.slice(0, 2);

  return (
    <>
      {/* ─── COMPACT ATHLETE CARD (IN ROSTER GRID) ─── */}
      <div
        id={`player-card-${player.id}`}
        className="group relative bg-slate-950/90 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:shadow-[0_0_24px_rgba(6,182,212,0.22)] transition-all duration-200 flex flex-col justify-between overflow-hidden"
      >
        {/* Top subtle glow bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          {/* Header Row: Avatar + Name + Badges */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/50 flex-shrink-0 bg-slate-900 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-colors">
                  {player.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <User className="w-6 h-6 text-cyan-400/60" />
                  )}
                </div>

                {/* Name & Title */}
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-wide truncate group-hover:text-cyan-200 transition-colors">
                    {player.name}
                  </h3>
                  {player.nickname ? (
                    <p className="text-xs text-cyan-400/90 font-mono tracking-tight truncate">
                      "{player.nickname}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID: {player.id.substring(0, 8)}
                    </p>
                  )}
                </div>
              </div>

              {/* Archetype Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold tracking-wider flex-shrink-0 ${archetypeInfo.bg} ${archetypeInfo.border} ${archetypeInfo.color}`}
              >
                {renderArchetypeIcon()}
                <span className="text-[11px]">{player.archetype.toUpperCase()}</span>
              </div>
            </div>

            {/* Performance Pill + World Rank */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 mb-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">MONTHLY INDEX:</span>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-bold text-[11px] ${
                    currentPerformance > 100
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                      : currentPerformance < 100
                      ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                      : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                  }`}
                  title="Current monthly performance index (100% baseline)"
                >
                  {currentPerformance > 100 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : currentPerformance < 100 ? (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Minus className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{currentPerformance}%</span>
                  <span className="text-[10px] opacity-75">
                    ({performanceDiff >= 0 ? `+${performanceDiff}` : performanceDiff}%)
                  </span>
                </div>
              </div>

              {player.worldRank ? (
                <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />#{player.worldRank}
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">PRO CIRCUIT</span>
              )}
            </div>

            {/* Key Attributes Snippet */}
            <div className="grid grid-cols-2 gap-2 mb-2 font-mono">
              {topMetrics.map(([key, rank]) => {
                const def = METRIC_DEFINITIONS.find((d) => d.key === key);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-400 text-[11px] uppercase truncate">
                      {def?.name || key}
                    </span>
                    <span className="font-bold text-cyan-400 ml-1">RANK {rank}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Pop-up Trigger & Quick Clash Compare */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
            <button
              id={`btn-open-dossier-${player.id}`}
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>DOSSIER</span>
            </button>

            {onCompareSelect && (
              <button
                id={`btn-compare-${player.id}`}
                type="button"
                onClick={() => onCompareSelect(player)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs font-bold tracking-wider transition-all duration-150 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-cyan-400" />
                <span>CLASH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── FULL DOSSIER POP-UP MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            id={`player-modal-backdrop-${player.id}`}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-slate-950 rounded-2xl border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.28)] flex flex-col max-h-[92vh] overflow-hidden my-auto"
            >
              {/* Modal Top Header Bar */}
              <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-slate-900/80 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-cyan-400/80 flex-shrink-0 bg-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)]">
                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt={player.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <User className="w-8 h-8 text-cyan-400/60" />
                    )}
                  </div>

                  {/* Title and details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-extrabold text-lg sm:text-2xl text-white tracking-wide truncate">
                        {player.name}
                      </h2>
                      {player.nickname && (
                        <span className="text-xs sm:text-sm text-cyan-400 font-mono">
                          "{player.nickname}"
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap font-mono text-xs">
                      {/* Archetype */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${archetypeInfo.bg} ${archetypeInfo.border} ${archetypeInfo.color}`}
                      >
                        {renderArchetypeIcon()}
                        {player.archetype.toUpperCase()}
                      </span>

                      {/* World Rank */}
                      {player.worldRank && (
                        <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          WORLD RANK #{player.worldRank}
                        </span>
                      )}

                      {/* Performance rating pill */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md border font-bold text-[11px] ${
                          currentPerformance > 100
                            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                            : currentPerformance < 100
                            ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                            : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {currentPerformance > 100 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : currentPerformance < 100 ? (
                          <TrendingDown className="w-3 h-3 text-rose-400" />
                        ) : (
                          <Minus className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{currentPerformance}% CURRENT INDEX</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  id={`btn-close-modal-${player.id}`}
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer flex-shrink-0"
                  title="Close dossier (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable Dossier Content */}
              <div
                ref={modalBodyRef}
                className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain flex-1"
                style={{ overscrollBehavior: 'contain' }}
              >
                {/* 1. Improvement Tracker Graph (Stock Market Incline/Decline) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      WEEKLY PERFORMANCE INDEX & SHIFTS
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Normal Baseline: 100% (Cycle resets monthly)
                    </span>
                  </div>

                  <ImprovementTrackerGraph
                    history={player.performanceHistory}
                    currentPerformance={player.currentPerformance}
                    playerName={player.name}
                  />
                </div>

                {/* 2. Core Hexagonal Attributes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      TACTICAL ATTRIBUTE MATRIX [D - S]
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Standardized Tokyo Olympic Evaluation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {METRIC_DEFINITIONS.map((def) => (
                      <MetricBar
                        key={def.key}
                        metricKey={def.key}
                        rank={player.metrics[def.key]}
                        showDescription={true}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Strengths and Weaknesses */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  id={`modal-strengths-weaknesses-${player.id}`}
                >
                  {/* Strengths */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tactical Strengths</span>
                    </div>
                    <ul className="space-y-2 font-mono">
                      {player.strengths.map((str, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 leading-snug flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Tactical Vulnerabilities</span>
                    </div>
                    <ul className="space-y-2 font-mono">
                      {player.weaknesses.map((weak, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 leading-snug flex items-start gap-2"
                        >
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Equipment & Career Highlights */}
                {(player.bladeRubber || player.careerHighlights) && (
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-2.5">
                    {player.bladeRubber && (
                      <p className="text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider min-w-[90px]">
                          Equipment:
                        </span>
                        <span>{player.bladeRubber}</span>
                      </p>
                    )}
                    {player.careerHighlights && (
                      <p className="text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold uppercase tracking-wider min-w-[90px]">
                          Highlights:
                        </span>
                        <span>{player.careerHighlights}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors"
                >
                  CLOSE DOSSIER
                </button>

                {onCompareSelect && (
                  <button
                    id={`modal-btn-compare-${player.id}`}
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      onCompareSelect(player);
                    }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider transition-all cursor-pointer"
                  >
                    <Swords className="w-4 h-4 text-cyan-400" />
                    <span>LOAD IN HEAD-TO-HEAD CLASH</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
