import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import {
  applyPerformanceRating,
  resetAllPlayersMonthlyCycle,
  ensurePlayerPerformance,
  getCurrentMonthKey,
} from '../utils/performance';
import { ImprovementTrackerGraph } from './ImprovementTrackerGraph';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Play,
  RotateCcw,
  Calendar,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  Sliders,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface PerformanceRatingAdminProps {
  players: PlayerProfile[];
  onSavePlayers: (updated: PlayerProfile[]) => void;
}

export const PerformanceRatingAdmin: React.FC<PerformanceRatingAdminProps> = ({
  players,
  onSavePlayers,
}) => {
  // Ensure all players are initialized with performance records & monthly reset checks
  const sanitizedPlayers = players.map(ensurePlayerPerformance);

  // Walkthrough mode state
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [walkthroughIndex, setWalkthroughIndex] = useState(0);

  // Single player quick-adjust modal
  const [selectedPlayerForAdjust, setSelectedPlayerForAdjust] = useState<PlayerProfile | null>(null);

  // Form state for current rating
  const [direction, setDirection] = useState<'improved' | 'worse' | 'maintained'>('improved');
  const [selectedPercentage, setSelectedPercentage] = useState<number>(10);
  const [customPercentageInput, setCustomPercentageInput] = useState<string>('');
  const [useCustomPercentage, setUseCustomPercentage] = useState<boolean>(false);
  const [ratingDate, setRatingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [ratingNote, setRatingNote] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Confirm monthly reset dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Current active player in walkthrough or modal
  const activePlayer = isWalkthroughActive
    ? sanitizedPlayers[walkthroughIndex]
    : selectedPlayerForAdjust
    ? sanitizedPlayers.find((p) => p.id === selectedPlayerForAdjust.id) || null
    : null;

  const currentMonth = getCurrentMonthKey();

  const resetFormState = () => {
    setDirection('improved');
    setSelectedPercentage(10);
    setCustomPercentageInput('');
    setUseCustomPercentage(false);
    setRatingDate(new Date().toISOString().split('T')[0]);
    setRatingNote('');
  };

  const startWalkthrough = () => {
    if (sanitizedPlayers.length === 0) return;
    setWalkthroughIndex(0);
    resetFormState();
    setIsWalkthroughActive(true);
  };

  const openSingleAdjust = (player: PlayerProfile) => {
    setSelectedPlayerForAdjust(player);
    resetFormState();
  };

  // Determine active delta
  const rawPercentage = useCustomPercentage
    ? Math.max(0, parseInt(customPercentageInput || '0', 10))
    : selectedPercentage;

  const effectiveDelta =
    direction === 'improved'
      ? rawPercentage
      : direction === 'worse'
      ? -rawPercentage
      : 0;

  const currentPerf = activePlayer?.currentPerformance ?? 100;
  const projectedPerf = Math.max(0, currentPerf + effectiveDelta);

  const handleApplyRating = () => {
    if (!activePlayer) return;

    const updatedPlayers = sanitizedPlayers.map((p) => {
      if (p.id === activePlayer.id) {
        return applyPerformanceRating(p, effectiveDelta, ratingDate, ratingNote);
      }
      return p;
    });

    onSavePlayers(updatedPlayers);

    setSuccessToast(
      `Recorded ${effectiveDelta >= 0 ? `+${effectiveDelta}%` : `${effectiveDelta}%`} for ${activePlayer.name} (New: ${projectedPerf}%)`
    );
    setTimeout(() => setSuccessToast(null), 3000);

    if (isWalkthroughActive) {
      if (walkthroughIndex + 1 < sanitizedPlayers.length) {
        setWalkthroughIndex((prev) => prev + 1);
        resetFormState();
      } else {
        // Completed walkthrough
        setIsWalkthroughActive(false);
        setSuccessToast(`Weekly performance rating completed for all ${sanitizedPlayers.length} athletes!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } else {
      setSelectedPlayerForAdjust(null);
    }
  };

  const handleSkipInWalkthrough = () => {
    if (walkthroughIndex + 1 < sanitizedPlayers.length) {
      setWalkthroughIndex((prev) => prev + 1);
      resetFormState();
    } else {
      setIsWalkthroughActive(false);
    }
  };

  const handleExecuteMonthlyReset = () => {
    const resetted = resetAllPlayersMonthlyCycle(sanitizedPlayers);
    onSavePlayers(resetted);
    setShowResetConfirm(false);
    setSuccessToast('All athlete performances have been reset to 100% normal baseline.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const presetPercentages = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <div className="space-y-6" id="admin-performance-ratings">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-xl bg-slate-950/95 border border-cyan-400 text-cyan-300 font-mono text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-3 max-w-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <p className="leading-snug">{successToast}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>WEEKLY RANKING PROTOCOL</span>
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide">
            ATHLETE PERFORMANCE RATINGS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Weekly stock-market tracking. Rate improvement (+10% to +100%) or decline. Resets to 100% every month.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={startWalkthrough}
            disabled={sanitizedPlayers.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-cyan-400" />
            <span>START WEEKLY REVIEW</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-slate-300 hover:text-amber-300 text-xs font-mono transition-colors cursor-pointer"
            title="Reset all athlete performance ratings to 100% normal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>RESET MONTHLY CYCLE (100%)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Monthly Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-950 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] font-mono space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-base text-white uppercase">
                Confirm Monthly Cycle Reset
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset every athlete's performance rating back to the <strong className="text-white">100% normal baseline</strong> for the new monthly cycle ({currentMonth}). A baseline entry will be created on their graphs.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMonthlyReset}
                className="px-4 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-400 text-amber-300 text-xs font-bold tracking-wider cursor-pointer"
              >
                Confirm 100% Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE WALKTHROUGH OR SINGLE ADJUSTER CARD */}
      {activePlayer && (
        <div
          id="rating-walkthrough-panel"
          className="p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-5 animate-fadeIn font-mono"
        >
          {/* Header of Walkthrough / Adjuster */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {isWalkthroughActive && (
                <span className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
                  ATHLETE {walkthroughIndex + 1} OF {sanitizedPlayers.length}
                </span>
              )}
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                {isWalkthroughActive ? 'Weekly Performance Assessment' : 'Quick Performance Adjuster'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isWalkthroughActive ? (
                <button
                  type="button"
                  onClick={() => setIsWalkthroughActive(false)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  Exit Walkthrough
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedPlayerForAdjust(null)}
                  className="text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar in Walkthrough */}
          {isWalkthroughActive && (
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${((walkthroughIndex + 1) / sanitizedPlayers.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Player Bio Summary in Rater */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/50 bg-slate-950 flex items-center justify-center flex-shrink-0">
                {activePlayer.avatarUrl ? (
                  <img
                    src={activePlayer.avatarUrl}
                    alt={activePlayer.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-cyan-400/60" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-white text-base">
                  {activePlayer.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span className="text-cyan-400">{activePlayer.archetype}</span>
                  {activePlayer.nickname && <span>• "{activePlayer.nickname}"</span>}
                </div>
              </div>
            </div>

            {/* Current Performance Rating */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Current Rating</span>
                <span
                  className={`font-bold text-lg ${
                    currentPerf > 100
                      ? 'text-emerald-400'
                      : currentPerf < 100
                      ? 'text-rose-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {currentPerf}%
                </span>
              </div>
              <div className="text-left pl-3 border-l border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Monthly Delta</span>
                <span className="text-xs font-bold text-slate-300">
                  {currentPerf - 100 >= 0 ? `+${currentPerf - 100}%` : `${currentPerf - 100}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Direction Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              1. Did {activePlayer.name} improve or get worse this week?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDirection('improved')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  direction === 'improved'
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>IMPROVED (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('worse')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  direction === 'worse'
                    ? 'bg-rose-950 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>GOT WORSE (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('maintained')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  direction === 'maintained'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Minus className="w-4 h-4 text-cyan-400" />
                <span>MAINTAINED (0%)</span>
              </button>
            </div>
          </div>

          {/* Step 2: Percentage Magnitude Selection (Confined 5x2 grid so options never scale past the box) */}
          {direction !== 'maintained' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase block">
                  2. Magnitude of shift (10% to 100% or Custom)
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomPercentage(!useCustomPercentage)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  {useCustomPercentage ? 'Use Preset Buttons' : 'Enter Custom Percentage'}
                </button>
              </div>

              {!useCustomPercentage ? (
                /* Preset Buttons: clean 5-column grid confined strictly to the box */
                <div className="grid grid-cols-5 gap-2 max-w-full">
                  {presetPercentages.map((pct) => {
                    const isSelected = selectedPercentage === pct && !useCustomPercentage;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setSelectedPercentage(pct);
                          setUseCustomPercentage(false);
                        }}
                        className={`py-2 px-1 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer truncate ${
                          isSelected
                            ? direction === 'improved'
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                              : 'bg-rose-950 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.35)]'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {direction === 'improved' ? `+${pct}%` : `-${pct}%`}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Custom percentage field */
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customPercentageInput}
                      onChange={(e) => setCustomPercentageInput(e.target.value)}
                      placeholder="Enter custom percentage (e.g. 15, 25)..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-cyan-500/40 focus:border-cyan-400 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      %
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Will apply: {direction === 'improved' ? `+${customPercentageInput || 0}%` : `-${customPercentageInput || 0}%`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Optional Coach Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Assessment Date:</label>
              <div className="relative">
                <input
                  type="date"
                  value={ratingDate}
                  onChange={(e) => setRatingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Weekly Note (Optional):</label>
              <input
                type="text"
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
                placeholder="e.g. Improved backhand loop arc..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Live Math Calculation Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Formula Preview:</span>
              <span className="font-bold text-white">{currentPerf}%</span>
              <span className="text-slate-500 font-bold">
                {effectiveDelta >= 0 ? '+' : '-'}
              </span>
              <span
                className={`font-bold ${
                  effectiveDelta > 0
                    ? 'text-emerald-400'
                    : effectiveDelta < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {Math.abs(effectiveDelta)}%
              </span>
              <span className="text-slate-500 font-bold">=</span>
              <span
                className={`font-bold text-sm px-2 py-0.5 rounded border ${
                  projectedPerf > 100
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                    : projectedPerf < 100
                    ? 'bg-rose-950 border-rose-400 text-rose-300'
                    : 'bg-cyan-950 border-cyan-400 text-cyan-300'
                }`}
              >
                {projectedPerf}%
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              Graph will update automatically
            </span>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {isWalkthroughActive ? (
              <button
                type="button"
                onClick={handleSkipInWalkthrough}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Skip Athlete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedPlayerForAdjust(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyRating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition-colors"
            >
              <span>{isWalkthroughActive ? 'SAVE & NEXT ATHLETE' : 'APPLY RATING'}</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* ALL ATHLETES PERFORMANCE ROSTER TABLE */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden font-mono">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-white text-base tracking-wide">
              ATHLETE PERFORMANCE ROSTER
            </h3>
            <p className="text-xs text-slate-400">
              Current Cycle: {currentMonth} • 100% normal baseline at month start
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {sanitizedPlayers.length} athletes enrolled
          </span>
        </div>

        {sanitizedPlayers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No athletes found in the database. Enlist athletes in the Profiles tab first.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {sanitizedPlayers.map((p) => {
              const perf = p.currentPerformance ?? 100;
              const net = perf - 100;
              const lastRecord = p.performanceHistory?.[p.performanceHistory.length - 1];

              return (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-900 flex items-center justify-center flex-shrink-0">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-cyan-400/60" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                          {p.archetype}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {lastRecord ? (
                          <>
                            Last rated: {lastRecord.displayDate}{' '}
                            <span
                              className={
                                lastRecord.change > 0
                                  ? 'text-emerald-400'
                                  : lastRecord.change < 0
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }
                            >
                              ({lastRecord.change > 0 ? `+${lastRecord.change}%` : `${lastRecord.change}%`})
                            </span>
                          </>
                        ) : (
                          'Baseline 100%'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Rating readout & quick action */}
                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div
                      className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                        perf > 100
                          ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                          : perf < 100
                          ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                          : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                      }`}
                    >
                      {perf > 100 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : perf < 100 ? (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{perf}%</span>
                      <span className="text-[10px] opacity-80">
                        {net > 0 ? `(+${net}%)` : net < 0 ? `(${net}%)` : '(Normal)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openSingleAdjust(p)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Adjust Rating
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
