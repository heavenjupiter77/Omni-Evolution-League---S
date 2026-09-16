import { RankGrade, PlayerArchetype, MetricKey } from '../types';

export const RANK_PERCENTAGES: Record<RankGrade, number> = {
  D: 22,
  C: 44,
  B: 65,
  A: 84,
  S: 100,
};

export const RANK_NUMERICAL: Record<RankGrade, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

/**
 * Returns the exact gradient classes required:
 * D = grey-red gradient
 * C = yellow gradient
 * B = blue gradient
 * A = green gradient
 * S = purple gradient
 */
export function getRankGradientClass(rank: RankGrade): string {
  switch (rank) {
    case 'D':
      return 'from-neutral-700 via-zinc-600 to-red-600 shadow-[0_0_12px_rgba(220,38,38,0.5)]';
    case 'C':
      return 'from-amber-600 via-yellow-500 to-amber-300 shadow-[0_0_12px_rgba(234,179,8,0.5)]';
    case 'B':
      return 'from-cyan-600 via-blue-500 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]';
    case 'A':
      return 'from-emerald-600 via-green-500 to-teal-300 shadow-[0_0_12px_rgba(34,197,94,0.5)]';
    case 'S':
      return 'from-violet-700 via-fuchsia-500 to-purple-400 shadow-[0_0_16px_rgba(192,132,252,0.7)]';
    default:
      return 'from-zinc-600 to-zinc-400';
  }
}

export function getRankBadgeStyle(rank: RankGrade): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (rank) {
    case 'D':
      return {
        bg: 'bg-red-950/40',
        text: 'text-red-400',
        border: 'border-red-700/60',
        glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
      };
    case 'C':
      return {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-600/60',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
      };
    case 'B':
      return {
        bg: 'bg-blue-950/40',
        text: 'text-cyan-400',
        border: 'border-cyan-600/60',
        glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
      };
    case 'A':
      return {
        bg: 'bg-emerald-950/40',
        text: 'text-emerald-400',
        border: 'border-emerald-600/60',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      };
    case 'S':
      return {
        bg: 'bg-purple-950/40',
        text: 'text-fuchsia-300',
        border: 'border-fuchsia-500/70',
        glow: 'shadow-[0_0_15px_rgba(217,70,239,0.4)]',
      };
  }
}

export function getArchetypeInfo(archetype: PlayerArchetype): {
  color: string;
  border: string;
  bg: string;
  iconName: string;
  tacticalAdvantage: string;
} {
  switch (archetype) {
    case 'Attacker':
      return {
        color: 'text-red-400',
        border: 'border-red-500/60',
        bg: 'bg-red-950/30',
        iconName: 'Zap',
        tacticalAdvantage: 'High offensive cadence; overwhelms Blockers with pure topspin velocity.',
      };
    case 'Chopper':
      return {
        color: 'text-emerald-400',
        border: 'border-emerald-500/60',
        bg: 'bg-emerald-950/30',
        iconName: 'Shield',
        tacticalAdvantage: 'Exhausts Attackers through heavy backspin variation and sudden counter-loops.',
      };
    case 'Blocker':
      return {
        color: 'text-cyan-400',
        border: 'border-cyan-500/60',
        bg: 'bg-cyan-950/30',
        iconName: 'Crosshair',
        tacticalAdvantage: 'Absorbs Finisher smashes off the bounce; targets unreachable awkward angles.',
      };
    case 'Finisher':
      return {
        color: 'text-purple-400',
        border: 'border-purple-500/60',
        bg: 'bg-purple-950/30',
        iconName: 'Flame',
        tacticalAdvantage: 'Unleashes point-ending third-ball kills; punctures deep Chopper defense.',
      };
    case 'Lobber':
      return {
        color: 'text-amber-400',
        border: 'border-amber-500/60',
        bg: 'bg-amber-950/30',
        iconName: 'Wind',
        tacticalAdvantage: 'Executes sky-high defensive lobs with extreme sidespin hooks; tests stamina and forces mistimed smashes.',
      };
  }
}

export function compareMetricGrades(
  g1: RankGrade,
  g2: RankGrade
): 'player1' | 'player2' | 'tie' {
  const v1 = RANK_NUMERICAL[g1];
  const v2 = RANK_NUMERICAL[g2];
  if (v1 > v2) return 'player1';
  if (v2 > v1) return 'player2';
  return 'tie';
}
