import { PlayerProfile, PerformanceRecord } from '../types';

/**
 * Returns the current month key in format YYYY-MM (e.g. "2026-09")
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a Date or ISO string into a short readable date (e.g., "Sep 16")
 */
export function formatDisplayDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Ensures an athlete profile has a valid performance state and enforces
 * the monthly 100% baseline reset rule.
 */
export function ensurePlayerPerformance(player: PlayerProfile): PlayerProfile {
  const currentMonth = getCurrentMonthKey();
  const lastMonth = player.lastPerformanceMonth || currentMonth;

  let currentPerf = typeof player.currentPerformance === 'number' ? player.currentPerformance : 100;
  let history = Array.isArray(player.performanceHistory) ? [...player.performanceHistory] : [];

  // Monthly cycle rollover: Every month everyone's performance resets to 100%
  if (player.lastPerformanceMonth && player.lastPerformanceMonth !== currentMonth) {
    const todayISO = new Date().toISOString().split('T')[0];
    const resetRecord: PerformanceRecord = {
      id: `perf-reset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: todayISO,
      displayDate: `${formatDisplayDate(todayISO)} (Reset)`,
      change: 0,
      percentage: 100,
      type: 'reset',
      note: 'Monthly Cycle Reset (100% Baseline)',
      monthKey: currentMonth,
    };
    return {
      ...player,
      currentPerformance: 100,
      performanceHistory: [resetRecord],
      lastPerformanceMonth: currentMonth,
    };
  }

  // If no history exists, seed initial baseline
  if (history.length === 0) {
    const todayISO = new Date().toISOString().split('T')[0];
    history = [
      {
        id: `perf-init-${player.id}`,
        date: todayISO,
        displayDate: formatDisplayDate(todayISO),
        change: 0,
        percentage: currentPerf,
        type: 'reset',
        note: 'Initial Baseline (100%)',
        monthKey: currentMonth,
      },
    ];
  }

  return {
    ...player,
    currentPerformance: currentPerf,
    performanceHistory: history,
    lastPerformanceMonth: currentMonth,
  };
}

/**
 * Records a weekly performance adjustment for a player
 * @param player Target player
 * @param changePercentage Delta (e.g. +20, -10, or 0)
 * @param date YYYY-MM-DD string
 * @param note Optional coaching note
 */
export function applyPerformanceRating(
  player: PlayerProfile,
  changePercentage: number,
  date?: string,
  note?: string
): PlayerProfile {
  const sanitizedPlayer = ensurePlayerPerformance(player);
  const currentMonth = getCurrentMonthKey();
  const dateISO = date || new Date().toISOString().split('T')[0];

  const currentVal = sanitizedPlayer.currentPerformance ?? 100;
  // Calculate new cumulative value, preventing values below 0
  const newVal = Math.max(0, currentVal + changePercentage);

  const newRecord: PerformanceRecord = {
    id: `perf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: dateISO,
    displayDate: formatDisplayDate(dateISO),
    change: changePercentage,
    percentage: newVal,
    type: changePercentage > 0 ? 'increase' : changePercentage < 0 ? 'decrease' : 'neutral',
    note: note || (changePercentage > 0 ? `Improved by +${changePercentage}%` : changePercentage < 0 ? `Decreased by ${changePercentage}%` : 'Performance Maintained (0%)'),
    monthKey: currentMonth,
  };

  const updatedHistory = [...(sanitizedPlayer.performanceHistory || []), newRecord];

  return {
    ...sanitizedPlayer,
    currentPerformance: newVal,
    performanceHistory: updatedHistory,
    lastPerformanceMonth: currentMonth,
  };
}

/**
 * Resets all players back to 100% normal baseline at month start
 */
export function resetAllPlayersMonthlyCycle(players: PlayerProfile[]): PlayerProfile[] {
  const currentMonth = getCurrentMonthKey();
  const todayISO = new Date().toISOString().split('T')[0];

  return players.map((player) => {
    const resetRecord: PerformanceRecord = {
      id: `perf-reset-all-${player.id}-${Date.now()}`,
      date: todayISO,
      displayDate: formatDisplayDate(todayISO),
      change: 0,
      percentage: 100,
      type: 'reset',
      note: 'Monthly Cycle Reset (100% Normal Baseline)',
      monthKey: currentMonth,
    };

    return {
      ...player,
      currentPerformance: 100,
      performanceHistory: [resetRecord],
      lastPerformanceMonth: currentMonth,
    };
  });
}
