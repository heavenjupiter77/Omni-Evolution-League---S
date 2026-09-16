export type RankGrade = 'D' | 'C' | 'B' | 'A' | 'S';

export type MetricKey = 'fhf' | 'bhl' | 'ssc' | 'vnp' | 'fwa' | 'rcx';

export interface MetricDefinition {
  key: MetricKey;
  name: string;
  code: string;
  shortDesc: string;
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: 'fhf',
    name: 'Forehand Ferocity',
    code: 'FHF',
    shortDesc: 'Raw topspin power, forward velocity, and kill-shot efficiency',
  },
  {
    key: 'bhl',
    name: 'Backhand Lethality',
    code: 'BHL',
    shortDesc: 'Chiquita flick sharpness, punch drives, and reverse loops',
  },
  {
    key: 'ssc',
    name: 'Serve & Spin Complexity',
    code: 'SSC',
    shortDesc: 'Deceptive pendulum rotation, heavy underspin, and no-spin variations',
  },
  {
    key: 'vnp',
    name: 'Vision & Placement',
    code: 'VNP',
    shortDesc: 'Angles, line reading, deep corners, and deceptive elbow targeting',
  },
  {
    key: 'fwa',
    name: 'Footwork & Agility',
    code: 'FWA',
    shortDesc: 'Step-around speed, mid-distance recovery, and lateral explosion',
  },
  {
    key: 'rcx',
    name: 'Reflex & Counter',
    code: 'RCX',
    shortDesc: 'Smash block timing, close-to-table re-counter, and defensive touch',
  },
];

export type PlayerArchetype = 'Attacker' | 'Chopper' | 'Blocker' | 'Finisher' | 'Lobber';

export interface PerformanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. 'Sep 16'
  change: number; // e.g. +20, -10, 0
  percentage: number; // cumulative e.g. 110, 90, 100
  type: 'increase' | 'decrease' | 'neutral' | 'reset';
  note?: string;
  monthKey: string; // e.g. '2026-09'
}

export interface PlayerProfile {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  archetype: PlayerArchetype;
  metrics: Record<MetricKey, RankGrade>;
  strengths: string[];
  weaknesses: string[];
  careerHighlights?: string;
  worldRank?: number;
  bladeRubber?: string;
  // Performance improvement tracker
  currentPerformance?: number; // percentage, 100% normal at month start
  performanceHistory?: PerformanceRecord[];
  lastPerformanceMonth?: string;
}

export interface NewspaperArticle {
  id: string;
  heading: string;
  body: string;
  category?: string;
}

export interface NewspaperEdition {
  id: string;
  title: string;
  date: string;
  editionCode: string;
  volume: number;
  editionNumber?: number;
  articles: NewspaperArticle[];
  leadImage?: string;
  tags?: string[];
  editorNote?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'syncing' | 'alert';
  details: string;
}
