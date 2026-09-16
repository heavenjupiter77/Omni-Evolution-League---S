import { PlayerProfile, RankGrade, MetricKey, METRIC_DEFINITIONS, PlayerArchetype } from '../types';
import { RANK_NUMERICAL } from './ranks';

export interface PhaseAnalysis {
  phaseNumber: string;
  title: string;
  metricsClash: string;
  verdict: string;
  edge: 'p1' | 'p2' | 'even';
  detail: string;
  keyTacticalFactor: string;
  tableOutcome: string;
}

export interface StatDifferentialItem {
  metricKey: MetricKey;
  code: string;
  name: string;
  p1Rank: RankGrade;
  p2Rank: RankGrade;
  tierDiff: number;
  leader: 'p1' | 'p2' | 'tie';
  leaderName: string;
  badgeText: string;
  takeaway: string;
}

export interface InDepthMatchAnalysis {
  briefSummary: string;
  coreClashTitle: string;
  coreClashDynamic: string;
  decidingFactor: string;
  archetypeMatchupName: string;
  archetypeTactics: string;
  statDifferentials: StatDifferentialItem[];
  statDifferentialSummary: string[];
  phases: PhaseAnalysis[];
  winConditionP1: string;
  winConditionP2: string;
  winKeysP1: string[];
  winKeysP2: string[];
  predictedOutcome: {
    winnerName: string;
    score: string;
    edgeRating: string;
    closingSummary: string;
  };
}

export interface MetricTierInfo {
  tierName: string;
  technicalDescription: string;
  rank: RankGrade;
}

export interface MetricSkillBreakdown {
  tierGap: number;
  gapLabel: string;
  p1Tier: MetricTierInfo;
  p2Tier: MetricTierInfo;
  p1SkillSummary: string;
  p2SkillSummary: string;
  headToHeadDynamic: string;
  advantageHeadline: string;
  tableDynamic: string;
  tacticalLeverage: string;
  verdict: 'p1' | 'p2' | 'tie';
}

// ==========================================
// DETAILED METRIC COMBINATIONS (NO AI)
// ==========================================

const METRIC_RANK_DESCRIPTIONS: Record<
  MetricKey,
  Record<RankGrade, { tierName: string; technicalDescription: string }>
> = {
  fhf: {
    S: {
      tierName: 'Apex Lethality (125+ km/h)',
      technicalDescription: 'Possesses terminal loop-drive kill power with forward dip, capable of puncturing through any defensive screen from anywhere on or off the table.',
    },
    A: {
      tierName: 'Master Topspin Drive',
      technicalDescription: 'Consistent high-velocity offensive loop with heavy rotational bite; reliably claims point initiatives on third-ball openings.',
    },
    B: {
      tierName: 'Solid Rally Offensive',
      technicalDescription: 'Dependable mid-distance topspin drive with steady arc; forces baseline resets but requires multiple loops to pierce disciplined blocks.',
    },
    C: {
      tierName: 'Developing Loop Stroke',
      technicalDescription: 'Moderate forward speed and basic topspin; vulnerable when pushed back from the table and struggles against heavy incoming underspin.',
    },
    D: {
      tierName: 'Rudimentary Push & Roll',
      technicalDescription: 'Lacks explosive forward wrist snap; relies on conservative rolls and pushes with minimal offensive penetration.',
    },
  },
  bhl: {
    S: {
      tierName: 'Lightning Banana & Punch Kill',
      technicalDescription: 'Mastery over the chiquita flick, lightning punch blocks, and reverse penhold/shakehand counter-loops off the bounce with pinpoint edge placement.',
    },
    A: {
      tierName: 'Aggressive Close-Table Flick',
      technicalDescription: 'Sharp over-the-table flick returns that neutralize opponent short serves; rapid backhand-to-backhand counter-drive transition.',
    },
    B: {
      tierName: 'Controlled Drive & Block',
      technicalDescription: 'Clean directional backhand drive; provides safe rally maintenance but seldom converts defensive backhand balls into immediate winners.',
    },
    C: {
      tierName: 'Passive Wing Protection',
      technicalDescription: 'Relies mostly on flat defensive push or push-block; susceptible to wide angle step-arounds and high-spin topspin drives.',
    },
    D: {
      tierName: 'Vulnerable Wing Flaw',
      technicalDescription: 'Struggles with short backhand ball reading and wrist acceleration; high unforced error rate when targeted directly on the backhand corner.',
    },
  },
  ssc: {
    S: {
      tierName: 'Deceptive Ghost & Reverse Pendulum',
      technicalDescription: 'World-class rotational complexity with identical tossing motions producing heavy underspin, knuckle no-spin, or high-kick sidespin.',
    },
    A: {
      tierName: 'Tournament Spin Variation',
      technicalDescription: 'Tight half-long and short pendulum/hook serves with varied contact points; regularly forces high pop-ups or misread net dumps.',
    },
    B: {
      tierName: 'Standard Spin Repertoire',
      technicalDescription: 'Reliable spin generations with predictable trajectory cues; competent players can anticipate depth and execute offensive flick returns.',
    },
    C: {
      tierName: 'Readable Service Delivery',
      technicalDescription: 'Limited spin deception and variable length control; occasionally floats half-long balls that grant opponents immediate attacking rights.',
    },
    D: {
      tierName: 'Basic Delivery Routine',
      technicalDescription: 'Basic plain spin or gentle top/back delivery; opponent gains instantaneous third-ball attack command on almost every service return.',
    },
  },
  vnp: {
    S: {
      tierName: 'Clairvoyant Geometry & Elbow Sniping',
      technicalDescription: 'Surgically targets the opponent’s playing elbow crossover point and deep baseline white lines, forcing constant off-balance recovery.',
    },
    A: {
      tierName: 'Tactical Wide Angles',
      technicalDescription: 'Exploits wide forehand and backhand table corners with early contact; moves opponents off balance to open up down-the-line winners.',
    },
    B: {
      tierName: 'Standard Court Vision',
      technicalDescription: 'Plays solid directional table tennis down the corridors; rarely targets the crossover elbow with enough precision to end points directly.',
    },
    C: {
      tierName: 'Narrow Rally Corridor',
      technicalDescription: 'Tends to hit predictably back toward the opponent’s comfort hitting zone, allowing opponents to settle into their primary cadence.',
    },
    D: {
      tierName: 'Tunnel-Vision Returns',
      technicalDescription: 'Minimal court awareness under pressure; repeatedly feeds the opponent’s dominant wing without varying angle or depth.',
    },
  },
  fwa: {
    S: {
      tierName: 'Zero-Latency Court Domination',
      technicalDescription: 'Explosive step-around speed and instant lateral transition; effortlessly covers the entire court width and recovers balance for full follow-throughs.',
    },
    A: {
      tierName: 'Rapid Pivot & Recovery',
      technicalDescription: 'Fast split-step recovery and swift crossover footwork; can pivot from backhand corner to execute dominant forehand step-arounds consistently.',
    },
    B: {
      tierName: 'Adequate Positional Agility',
      technicalDescription: 'Covers standard table width comfortably, but exhibits a half-step delay when stretched out to wide corners after mid-distance counter-rallies.',
    },
    C: {
      tierName: 'Sluggish Mid-Distance Recovery',
      technicalDescription: 'Heavy on the heels during prolonged exchanges; prone to getting caught wrong-footed when sudden angle redirections occur.',
    },
    D: {
      tierName: 'Static Footwork Deficiency',
      technicalDescription: 'Stays glued in one position; cannot execute step-around loops and is easily stranded by sharp angled blocks or deep pushes.',
    },
  },
  rcx: {
    S: {
      tierName: 'Matrix Counter-Hit Reflexes',
      technicalDescription: 'Sensational off-the-bounce counter-looping and dead-stop smash blocks; absorbs 120 km/h attacks and returns them with doubled forward speed.',
    },
    A: {
      tierName: 'High-Cadence Re-Counter',
      technicalDescription: 'Excellent hand-eye coordination and punch timing; consistently turns defensive defensive scrambles into offensive re-counters on the table rise.',
    },
    B: {
      tierName: 'Reliable Blocking Touch',
      technicalDescription: 'Can absorb first-wave offensive loops, but timing degrades when subjected to rapid multi-shot offensive bombardment.',
    },
    C: {
      tierName: 'Delayed Reaction Window',
      technicalDescription: 'Racket angle control wavers under heavy ball speed, resulting in loose blocks that either fly long or pop up as easy kill opportunities.',
    },
    D: {
      tierName: 'Fragile Defensive Barrier',
      technicalDescription: 'Easily overwhelmed by pace and spin change; struggle to get the blade behind fast offensive loop-drives in time.',
    },
  },
};

/**
 * Deterministic generator for the detailed metric breakdown comparing rank1 vs rank2
 */
export function getDetailedMetricSkillBreakdown(
  metricKey: MetricKey,
  rank1: RankGrade,
  rank2: RankGrade,
  name1: string,
  name2: string
): MetricSkillBreakdown {
  const v1 = RANK_NUMERICAL[rank1];
  const v2 = RANK_NUMERICAL[rank2];
  const diff = v1 - v2;

  const desc1 = METRIC_RANK_DESCRIPTIONS[metricKey][rank1];
  const desc2 = METRIC_RANK_DESCRIPTIONS[metricKey][rank2];

  let verdict: 'p1' | 'p2' | 'tie' = 'tie';
  let gapLabel = 'Even Skill Tier';

  if (diff > 0) {
    verdict = 'p1';
    gapLabel = `+${diff} Tier Lead for ${name1}`;
  } else if (diff < 0) {
    verdict = 'p2';
    gapLabel = `+${Math.abs(diff)} Tier Lead for ${name2}`;
  }

  // Generate technical head-to-head interaction narrative based on metric & ranks
  let headToHeadDynamic = '';

  if (metricKey === 'fhf') {
    if (diff === 0) {
      headToHeadDynamic =
        v1 >= 4
          ? `Both athletes wield high-octane forehands. Topspin loop duels will not be decided by raw power, but by who catches the ball earlier off the bounce and who maintains tighter footwork recovery.`
          : `Equal forehand capabilities. With both at Tier ${rank1}, neither athlete can blast the other off the table purely through forehand velocity, resulting in longer tactical placement rallies.`;
    } else if (Math.abs(diff) === 1) {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `${winner} holds a noticeable forehand edge (+1 tier). In open topspin-to-topspin exchanges, ${winner} will generate greater forward rotation, forcing ${loser} to retreat a half-step back.`;
    } else if (Math.abs(diff) === 2) {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `Decisive forehand power disparity (+2 tiers). ${winner} possesses the terminal loop-drive capability to finish points cleanly on loose balls, whereas ${loser}'s forehand will primarily serve as a rally-prolonging shot rather than a kill strike.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `Severe offensive mismatch (+${Math.abs(diff)} tiers). ${winner} will overpower ${loser}'s defenses with ease. Any half-long or high-bouncing return from ${loser} will be punished by an immediate forehand winner.`;
    }
  } else if (metricKey === 'bhl') {
    if (diff === 0) {
      headToHeadDynamic = `Balanced backhand parity (${rank1} vs ${rank2}). Neither competitor can exploit the other's backhand wing as an obvious liability; cross-court backhand exchanges will be steady.`;
    } else if (Math.abs(diff) === 1) {
      const winner = diff > 0 ? name1 : name2;
      headToHeadDynamic = `${winner} enjoys a slight backhand sharpness advantage, allowing for crisper over-the-table flick returns that disrupt the opponent's rhythm.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `Clear backhand asymmetry (+${Math.abs(diff)} tiers). ${winner} can initiate attacks off the backhand corner with banana flicks and punches, while ${loser} will be forced into passive defensive blocks.`;
    }
  } else if (metricKey === 'ssc') {
    if (diff === 0) {
      headToHeadDynamic = `Identical service spin caliber (${rank1}). Both competitors understand each other's spin variations well; direct aces or outright missed returns will be exceedingly rare.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `${winner} holds the spin complexity command (+${Math.abs(diff)} tier lead). ${winner}'s deceptive variations and disguise will consistently draw weak, floating returns, granting effortless third-ball attack setups against ${loser}.`;
    }
  } else if (metricKey === 'vnp') {
    if (diff === 0) {
      headToHeadDynamic = `Equal court vision. Both athletes distribute balls across standard angles; neither has a clear geometric edge to disorient the other.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `${winner} commands superior tactical placement (+${Math.abs(diff)} tiers). ${winner} will deliberately probe ${loser}'s playing elbow crossover and deep corners, forcing awkward off-balance recoveries.`;
    }
  } else if (metricKey === 'fwa') {
    if (diff === 0) {
      headToHeadDynamic = `Matching footwork agility (${rank1}). Both move at the same cadence across the court; late-match physical stamina will be the differentiating factor.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `${winner} holds significant mobility supremacy (+${Math.abs(diff)} tiers). ${winner} can step around to unleash powerful forehands while recovering to the opposite corner, while ${loser} risks getting caught flat-footed.`;
    }
  } else if (metricKey === 'rcx') {
    if (diff === 0) {
      headToHeadDynamic = `Mirror counter-hit timing (${rank1}). Both players possess equivalent close-table reaction windows and block accuracy against incoming speed.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      headToHeadDynamic = `${winner} demonstrates superior reflex and block sensitivity (+${Math.abs(diff)} tiers). ${winner} can absorb ${loser}'s hardest loops and counter-drive off the bounce, turning defense into attack instantly.`;
    }
  }

  let advantageHeadline = 'Even Tier Calibration';
  let tableDynamic = '';
  let tacticalLeverage = '';

  if (metricKey === 'fhf') {
    if (diff === 0) {
      advantageHeadline = 'Loop Power Equilibrium';
      tableDynamic = `Both athletes generate equivalent topspin rotational bite (${rank1}). Neither can overpower the other on raw ball speed alone.`;
      tacticalLeverage = `Points will hinge on who contacts the ball earliest off the bounce and maintains tighter recovery footwork.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      advantageHeadline = `${winner} Forehand Kill Penetration (+${Math.abs(diff)} Tier)`;
      tableDynamic = `${winner} generates sharper forward topspin dip and heavier pace, forcing ${loser} to contact the ball on the drop.`;
      tacticalLeverage = `${winner} can finish points directly from half-long balls, whereas ${loser} is limited to rally maintenance.`;
    }
  } else if (metricKey === 'bhl') {
    if (diff === 0) {
      advantageHeadline = 'Backhand Corridor Balance';
      tableDynamic = `Both athletes demonstrate equivalent backhand redirection and blocking stability (${rank1}).`;
      tacticalLeverage = `Neither wing presents an exploitable vulnerability; cross-court backhand rallies remain neutral.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      advantageHeadline = `${winner} Backhand Initiative Edge (+${Math.abs(diff)} Tier)`;
      tableDynamic = `${winner} executes crisp over-the-table banana flicks and punch blocks, denying ${loser} passive short returns.`;
      tacticalLeverage = `${winner} consistently transitions from defensive backhand exchanges into sudden offensive down-the-line punches.`;
    }
  } else if (metricKey === 'ssc') {
    if (diff === 0) {
      advantageHeadline = 'Service Spin Disguise Parity';
      tableDynamic = `Both competitors deliver equivalent spin disguise and depth control (${rank1}).`;
      tacticalLeverage = `Direct service aces will be rare; receive consistency will dictate who takes early offensive command.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      advantageHeadline = `${winner} Spin Deception Command (+${Math.abs(diff)} Tier)`;
      tableDynamic = `${winner}'s wrist disguise and varied contact points obscure underspin vs knuckle-ball deliveries.`;
      tacticalLeverage = `${loser} will struggle with misread depths, yielding popped returns that set up routine third-ball kills.`;
    }
  } else if (metricKey === 'vnp') {
    if (diff === 0) {
      advantageHeadline = 'Symmetric Table Coverage';
      tableDynamic = `Both players target standard rally lanes with consistent angle discipline (${rank1}).`;
      tacticalLeverage = `Neither player creates severe off-balance recovery pressure through angled ball placement alone.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      advantageHeadline = `${winner} Geometric Angle Sniping (+${Math.abs(diff)} Tier)`;
      tableDynamic = `${winner} consistently locates the playing elbow crossover and deep baseline edges.`;
      tacticalLeverage = `${loser} is pulled repeatedly out of position, opening wide court corridors for uncontested winners.`;
    }
  } else if (metricKey === 'fwa') {
    if (diff === 0) {
      advantageHeadline = 'Mobility Cadence Match';
      tableDynamic = `Both competitors exhibit matching split-step recovery and lateral transition speed (${rank1}).`;
      tacticalLeverage = `Physical fatigue in later games will be the differentiating factor rather than baseline movement speed.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      advantageHeadline = `${winner} Lateral Transition Dominance (+${Math.abs(diff)} Tier)`;
      tableDynamic = `${winner} effortlessly recovers balance from wide corners and pivots for dominant forehand step-arounds.`;
      tacticalLeverage = `${loser} will be caught flat-footed when sudden changes in pace or direction occur.`;
    }
  } else if (metricKey === 'rcx') {
    if (diff === 0) {
      advantageHeadline = 'Counter-Timing Equilibrium';
      tableDynamic = `Both athletes possess identical blade stabilization and off-the-bounce reflex windows (${rank1}).`;
      tacticalLeverage = `Close-table counter-hitting duels are even; point conversion depends on depth rather than reaction speed.`;
    } else {
      const winner = diff > 0 ? name1 : name2;
      const loser = diff > 0 ? name2 : name1;
      advantageHeadline = `${winner} Reflex Counter-Hit Precision (+${Math.abs(diff)} Tier)`;
      tableDynamic = `${winner} absorbs heavy loop pace on the rise and redirects it with doubled forward momentum.`;
      tacticalLeverage = `${winner} can withstand full-power offensive bombardment and convert defense into counter-offense.`;
    }
  }

  return {
    tierGap: diff,
    gapLabel,
    p1Tier: {
      tierName: desc1.tierName,
      technicalDescription: desc1.technicalDescription,
      rank: rank1,
    },
    p2Tier: {
      tierName: desc2.tierName,
      technicalDescription: desc2.technicalDescription,
      rank: rank2,
    },
    p1SkillSummary: `${desc1.tierName}: ${desc1.technicalDescription}`,
    p2SkillSummary: `${desc2.tierName}: ${desc2.technicalDescription}`,
    headToHeadDynamic,
    advantageHeadline,
    tableDynamic,
    tacticalLeverage,
    verdict,
  };
}

// ==========================================
// IN-DEPTH TACTICAL MATCHUP SIMULATION ENGINE
// ==========================================

export function generateTacticalMatchupAssessment(
  p1: PlayerProfile,
  p2: PlayerProfile
): InDepthMatchAnalysis {
  const m1 = p1.metrics;
  const m2 = p2.metrics;

  const fhfDiff = RANK_NUMERICAL[m1.fhf] - RANK_NUMERICAL[m2.fhf];
  const bhlDiff = RANK_NUMERICAL[m1.bhl] - RANK_NUMERICAL[m2.bhl];
  const sscDiff = RANK_NUMERICAL[m1.ssc] - RANK_NUMERICAL[m2.ssc];
  const vnpDiff = RANK_NUMERICAL[m1.vnp] - RANK_NUMERICAL[m2.vnp];
  const fwaDiff = RANK_NUMERICAL[m1.fwa] - RANK_NUMERICAL[m2.fwa];
  const rcxDiff = RANK_NUMERICAL[m1.rcx] - RANK_NUMERICAL[m2.rcx];

  const totalScoreP1 =
    RANK_NUMERICAL[m1.fhf] +
    RANK_NUMERICAL[m1.bhl] +
    RANK_NUMERICAL[m1.ssc] +
    RANK_NUMERICAL[m1.vnp] +
    RANK_NUMERICAL[m1.fwa] +
    RANK_NUMERICAL[m1.rcx];

  const totalScoreP2 =
    RANK_NUMERICAL[m2.fhf] +
    RANK_NUMERICAL[m2.bhl] +
    RANK_NUMERICAL[m2.ssc] +
    RANK_NUMERICAL[m2.vnp] +
    RANK_NUMERICAL[m2.fwa] +
    RANK_NUMERICAL[m2.rcx];

  // Archetype dynamic matchup matrix
  const arch1 = p1.archetype;
  const arch2 = p2.archetype;

  let matchupName = `${arch1} vs. ${arch2}`;
  let archetypeTactics = '';
  let archetypeBonusP1 = 0;

  // Archetype rock-paper-scissors synergies with table tennis realism:
  // Attacker > Blocker (overwhelms with pure spin/speed)
  // Chopper > Attacker (exhausts loops with backspin)
  // Blocker > Finisher (absorbs explosive 3rd ball kills off the bounce)
  // Finisher > Chopper (cracks underspin with pure kill loops)
  // Lobber > Attacker (induces exhaustion and smash errors from deep court)
  // Blocker > Lobber (short drop blocks pull lobber forward)
  // Attacker > Chopper if Attacker has higher FHF/VNP
  // Chopper > Lobber (chop battle won by heavy chop variety)
  // Finisher > Lobber (heavy overhead smash kills)

  if (arch1 === arch2) {
    matchupName = `Mirror Match: ${arch1} vs. ${arch1}`;
    archetypeTactics = `Both athletes operate within the identical ${arch1} tactical framework. With tactical styles mirrored, this duel eliminates stylistic rock-paper-scissors advantages; outcome hinges purely on execution quality, serve-and-attack margins, and individual stat tier gaps.`;
  } else if (arch1 === 'Attacker' && arch2 === 'Chopper') {
    archetypeBonusP1 = fhfDiff >= 1 ? 1 : -1;
    archetypeTactics = `Classic Offense vs. Defense clash. ${p1.name} must sustain continuous topspin cadence without tiring. ${p2.name} relies on heavy backspin variation to force net errors. If ${p1.name}'s Forehand Ferocity exceeds ${p2.name}'s Reflex/Footwork, the attack punctures the chop; otherwise, attrition favors ${p2.name}.`;
  } else if (arch1 === 'Chopper' && arch2 === 'Attacker') {
    archetypeBonusP1 = rcxDiff >= 0 ? 1 : -1;
    archetypeTactics = `Defensive attrition duel. ${p1.name} will absorb incoming loops 3 meters behind the table with heavy underspin and floaters, probing for impatient over-hits from ${p2.name}. ${p2.name} must maintain patience and avoid rushed kill-shots.`;
  } else if (arch1 === 'Attacker' && arch2 === 'Blocker') {
    archetypeBonusP1 = 1;
    archetypeTactics = `Offensive onslaught against close-table redirection. ${p1.name} possesses the velocity to push ${p2.name} off the table, but must avoid predictable patterns that allow ${p2.name} to punch-block into empty corners.`;
  } else if (arch1 === 'Blocker' && arch2 === 'Attacker') {
    archetypeBonusP1 = -1;
    archetypeTactics = `${p1.name} aims to smother ${p2.name}'s topspin loops on the rise, borrowing opponent pace to direct acute cross-court blocks. If ${p2.name}'s Forehand Ferocity is too high, the block barrier risks breaking.`;
  } else if (arch1 === 'Finisher' && arch2 === 'Chopper') {
    archetypeBonusP1 = 1;
    archetypeTactics = `High-impact puncture strategy. ${p1.name}'s explosive 3rd-ball and 5th-ball kill loops are engineered to pierce ${p2.name}'s backspin chops before long rallies exhaust stamina.`;
  } else if (arch1 === 'Chopper' && arch2 === 'Finisher') {
    archetypeBonusP1 = -1;
    archetypeTactics = `${p1.name} must survive the first two attacking waves. If ${p1.name} can return the initial kill-shot with maximum backspin depth, ${p2.name}'s aggression becomes a double-edged sword prone to unforced errors.`;
  } else if (arch1 === 'Blocker' && arch2 === 'Finisher') {
    archetypeBonusP1 = 1;
    archetypeTactics = `Counter-timing advantage for ${p1.name}. Finishers commit body weight forward on kill-shots; ${p1.name}'s quick-touch block redirects that tremendous energy into wide corners before the Finisher can recover.`;
  } else if (arch1 === 'Finisher' && arch2 === 'Blocker') {
    archetypeBonusP1 = -1;
    archetypeTactics = `${p1.name} must respect ${p2.name}'s block timing. Firing full-power shots directly into the Blocker's racket will result in lightning-fast counter-punches. ${p1.name} needs spin variation over raw power.`;
  } else if (arch1 === 'Lobber' && arch2 === 'Attacker') {
    archetypeBonusP1 = 1;
    archetypeTactics = `Deep-court aerial war. ${p1.name} retreats 4 to 5 meters back, sending sky-high topspin and sidespin lobs that dip erratically onto the end-line. ${p2.name} is forced into repeated overhead smashes, testing shoulder endurance and smash timing.`;
  } else if (arch1 === 'Attacker' && arch2 === 'Lobber') {
    archetypeBonusP1 = -1;
    archetypeTactics = `${p1.name} must stay patient against ${p2.name}'s high floating lobs. Overhitting leads to mistimed smashes into the net or off the endline. Short drop-shots mixed with baseline drive smashes are crucial for ${p1.name}.`;
  } else if (arch1 === 'Lobber' && arch2 === 'Finisher') {
    archetypeBonusP1 = -1;
    archetypeTactics = `Explosive smash test. ${p2.name}'s immense smash power can crack defensive lobs, but ${p1.name}'s sidespin curveballs force awkward overhead adjustments. ${p1.name} hopes for smash exhaustion.`;
  } else if (arch1 === 'Finisher' && arch2 === 'Lobber') {
    archetypeBonusP1 = 1;
    archetypeTactics = `${p1.name} thrives against high floating balls, possessing the raw kill power to hammer overhead winners past ${p2.name} before the deep spin settles.`;
  } else if (arch1 === 'Blocker' && arch2 === 'Lobber') {
    archetypeBonusP1 = 1;
    archetypeTactics = `Pace-control duel. ${p1.name} uses close-table stop-blocks to drop the ball short over the net, forcing ${p2.name} to sprint 5 meters forward from the court barrier into an uncomfortable short-push exchange.`;
  } else if (arch1 === 'Lobber' && arch2 === 'Blocker') {
    archetypeBonusP1 = -1;
    archetypeTactics = `${p1.name} must avoid giving ${p2.name} easy soft balls to drop short. Heavy sidespin and deep baseline landing are essential to prevent ${p2.name} from killing the rally with stop-blocks.`;
  } else if (arch1 === 'Chopper' && arch2 === 'Lobber') {
    archetypeBonusP1 = 0;
    archetypeTactics = `The Ultimate War of Attrition. Both players operate far from the table, trading backspin chops and high sidespin lobs. The match will be decided by who has the boldness to step up and execute the first attack.`;
  } else if (arch1 === 'Lobber' && arch2 === 'Chopper') {
    archetypeBonusP1 = 0;
    archetypeTactics = `Tactical patience standoff. Neither athlete prefers to initiate close-table offense. Rallies will extend past 20+ shots as ${p1.name}'s high lobs test ${p2.name}'s underspin consistency.`;
  } else {
    archetypeTactics = `Dynamic clash of contrasting philosophies. Control over rally tempo and depth will decide the victor.`;
  }

  // Stat Differential Highlights (Addressing the exact user example: e.g. "attacker vs attacker where player A has weaker attack and everything else same")
  const statDifferentialSummary: string[] = [];

  const statDifferentials: StatDifferentialItem[] = [
    {
      metricKey: 'fhf',
      code: 'FHF',
      name: 'Forehand Ferocity',
      p1Rank: m1.fhf,
      p2Rank: m2.fhf,
      tierDiff: fhfDiff,
      leader: fhfDiff > 0 ? 'p1' : fhfDiff < 0 ? 'p2' : 'tie',
      leaderName: fhfDiff > 0 ? p1.name : fhfDiff < 0 ? p2.name : 'Tied',
      badgeText: fhfDiff !== 0 ? `+${Math.abs(fhfDiff)} Tier Lead` : 'Parity',
      takeaway:
        fhfDiff > 0
          ? `${p1.name} holds terminal loop-drive kill penetration`
          : fhfDiff < 0
          ? `${p2.name} commands superior loop-drive speed`
          : 'Symmetric topspin drive firepower and dip',
    },
    {
      metricKey: 'bhl',
      code: 'BHL',
      name: 'Backhand Lethality',
      p1Rank: m1.bhl,
      p2Rank: m2.bhl,
      tierDiff: bhlDiff,
      leader: bhlDiff > 0 ? 'p1' : bhlDiff < 0 ? 'p2' : 'tie',
      leaderName: bhlDiff > 0 ? p1.name : bhlDiff < 0 ? p2.name : 'Tied',
      badgeText: bhlDiff !== 0 ? `+${Math.abs(bhlDiff)} Tier Lead` : 'Parity',
      takeaway:
        bhlDiff > 0
          ? `${p1.name} commands close-table banana flick and punch speed`
          : bhlDiff < 0
          ? `${p2.name} holds superior backhand redirection speed`
          : 'Balanced backhand-to-backhand rally consistency',
    },
    {
      metricKey: 'ssc',
      code: 'SSC',
      name: 'Serve & Spin Complexity',
      p1Rank: m1.ssc,
      p2Rank: m2.ssc,
      tierDiff: sscDiff,
      leader: sscDiff > 0 ? 'p1' : sscDiff < 0 ? 'p2' : 'tie',
      leaderName: sscDiff > 0 ? p1.name : sscDiff < 0 ? p2.name : 'Tied',
      badgeText: sscDiff !== 0 ? `+${Math.abs(sscDiff)} Tier Lead` : 'Parity',
      takeaway:
        sscDiff > 0
          ? `${p1.name} dictates 3rd-ball attack initiative via spin disguise`
          : sscDiff < 0
          ? `${p2.name} controls service variation to disrupt opponent returns`
          : 'Equivalent spin generation and receive anticipation',
    },
    {
      metricKey: 'vnp',
      code: 'VNP',
      name: 'Vision & Placement',
      p1Rank: m1.vnp,
      p2Rank: m2.vnp,
      tierDiff: vnpDiff,
      leader: vnpDiff > 0 ? 'p1' : vnpDiff < 0 ? 'p2' : 'tie',
      leaderName: vnpDiff > 0 ? p1.name : vnpDiff < 0 ? p2.name : 'Tied',
      badgeText: vnpDiff !== 0 ? `+${Math.abs(vnpDiff)} Tier Lead` : 'Parity',
      takeaway:
        vnpDiff > 0
          ? `${p1.name} snipes playing elbow crossover and deep corners`
          : vnpDiff < 0
          ? `${p2.name} stretches opponent with wide-angle ball placement`
          : 'Standard corridor angles and symmetric table coverage',
    },
    {
      metricKey: 'fwa',
      code: 'FWA',
      name: 'Footwork & Agility',
      p1Rank: m1.fwa,
      p2Rank: m2.fwa,
      tierDiff: fwaDiff,
      leader: fwaDiff > 0 ? 'p1' : fwaDiff < 0 ? 'p2' : 'tie',
      leaderName: fwaDiff > 0 ? p1.name : fwaDiff < 0 ? p2.name : 'Tied',
      badgeText: fwaDiff !== 0 ? `+${Math.abs(fwaDiff)} Tier Lead` : 'Parity',
      takeaway:
        fwaDiff > 0
          ? `${p1.name} executes dominant step-around loops and rapid recovery`
          : fwaDiff < 0
          ? `${p2.name} holds lateral speed to reach wide corner shots`
          : 'Matching court coverage speed and split-step recovery',
    },
    {
      metricKey: 'rcx',
      code: 'RCX',
      name: 'Reflex & Counter',
      p1Rank: m1.rcx,
      p2Rank: m2.rcx,
      tierDiff: rcxDiff,
      leader: rcxDiff > 0 ? 'p1' : rcxDiff < 0 ? 'p2' : 'tie',
      leaderName: rcxDiff > 0 ? p1.name : rcxDiff < 0 ? p2.name : 'Tied',
      badgeText: rcxDiff !== 0 ? `+${Math.abs(rcxDiff)} Tier Lead` : 'Parity',
      takeaway:
        rcxDiff > 0
          ? `${p1.name} absorbs smash speed and counter-drives off the rise`
          : rcxDiff < 0
          ? `${p2.name} possesses tighter block stabilization against loop speed`
          : 'Equivalent close-table hand-speed and deuce composure',
    },
  ];

  if (fhfDiff > 0) {
    statDifferentialSummary.push(
      `${p1.name} holds +${fhfDiff} Tier in Forehand Ferocity (FHF): superior offensive loop penetration.`
    );
  } else if (fhfDiff < 0) {
    statDifferentialSummary.push(
      `${p2.name} holds +${Math.abs(fhfDiff)} Tier in Forehand Ferocity (FHF): superior offensive loop penetration.`
    );
  } else {
    statDifferentialSummary.push(`Equal Forehand Ferocity (${m1.fhf}): loop firepower is deadlocked.`);
  }

  if (bhlDiff > 0) {
    statDifferentialSummary.push(`${p1.name} leads Backhand Lethality (+${bhlDiff} BHL).`);
  } else if (bhlDiff < 0) {
    statDifferentialSummary.push(`${p2.name} leads Backhand Lethality (+${Math.abs(bhlDiff)} BHL).`);
  }

  if (sscDiff !== 0) {
    const sWinner = sscDiff > 0 ? p1.name : p2.name;
    statDifferentialSummary.push(
      `${sWinner} controls Serve & Spin Complexity (+${Math.abs(sscDiff)} SSC), dictating 3rd-ball initiative.`
    );
  }

  if (vnpDiff !== 0) {
    const vWinner = vnpDiff > 0 ? p1.name : p2.name;
    statDifferentialSummary.push(
      `${vWinner} possesses sharper Vision & Placement (+${Math.abs(vnpDiff)} VNP) to exploit wide angles.`
    );
  }

  if (fwaDiff !== 0) {
    const fWinner = fwaDiff > 0 ? p1.name : p2.name;
    statDifferentialSummary.push(
      `${fWinner} has higher Footwork & Agility (+${Math.abs(fwaDiff)} FWA) for faster court recovery.`
    );
  }

  if (rcxDiff !== 0) {
    const rWinner = rcxDiff > 0 ? p1.name : p2.name;
    statDifferentialSummary.push(
      `${rWinner} maintains quicker Reflex & Counter (+${Math.abs(rcxDiff)} RCX) off the bounce.`
    );
  }

  // Construct Structured Core Clash Highlights
  let coreClashTitle = '';
  let coreClashDynamic = '';
  let decidingFactor = '';

  if (arch1 === arch2) {
    coreClashTitle = `Mirror ${arch1} Tactical Duel`;
    if (fhfDiff !== 0) {
      const moreAggressive = fhfDiff > 0 ? p1.name : p2.name;
      const lessAggressive = fhfDiff > 0 ? p2.name : p1.name;
      coreClashDynamic = `Both athletes adopt the ${arch1} doctrine, but ${moreAggressive} holds higher Forehand firepower. ${lessAggressive} cannot win a brute-force duel and must rely on sharp placement and counter-loops.`;
      decidingFactor = `Forehand Ferocity disparity (${Math.abs(fhfDiff)} Tier Lead for ${moreAggressive})`;
    } else if (sscDiff !== 0) {
      const sWinner = sscDiff > 0 ? p1.name : p2.name;
      coreClashDynamic = `Symmetric offensive firepower. Service spin disguise from ${sWinner} will be the primary lever to generate short-ball openings.`;
      decidingFactor = `Service spin complexity (+${Math.abs(sscDiff)} SSC for ${sWinner})`;
    } else {
      coreClashDynamic = `Equally matched ${arch1} athletes with identical tactical approaches. Micro-margins in unforced errors and deuce composure will decide the winner.`;
      decidingFactor = `Table depth consistency and third-ball execution`;
    }
  } else {
    coreClashTitle = `${arch1} vs. ${arch2} Style Clash`;
    coreClashDynamic = archetypeTactics;
    if (Math.abs(fhfDiff) >= 2) {
      decidingFactor = `Significant Forehand firepower mismatch (${Math.abs(fhfDiff)} tier gap)`;
    } else if (Math.abs(rcxDiff) >= 2) {
      decidingFactor = `Reflex counter-blocking speed under high ball velocity`;
    } else {
      decidingFactor = `Tempo control: offensive loop cadence vs defensive absorption`;
    }
  }

  // Construct Brief Summary (Factoring both Archetype AND Exact Stat Ranks)
  let briefSummary = '';
  if (arch1 === arch2) {
    if (fhfDiff !== 0 || bhlDiff !== 0) {
      const moreAggressive = fhfDiff + bhlDiff > 0 ? p1.name : p2.name;
      const lessAggressive = fhfDiff + bhlDiff > 0 ? p2.name : p1.name;
      const keyDiff = Math.abs(fhfDiff) > 0 ? 'Forehand Ferocity' : 'Backhand Lethality';
      briefSummary = `Mirror ${arch1} showdown. While both share the ${arch1} doctrine, ${moreAggressive} holds the heavier attack tier in ${keyDiff}. Consequently, ${lessAggressive} cannot win a pure firepower duel and must shift toward precise placement and counterloop timing to stay competitive.`;
    } else if (totalScoreP1 === totalScoreP2) {
      briefSummary = `Mirror ${arch1} deadlock. Both athletes share the identical archetype and identical overall statistical tier. The contest will be decided by micro-margins: service spin variation, return depth, and mental composure in deuce games.`;
    } else {
      const overallLeader = totalScoreP1 > totalScoreP2 ? p1.name : p2.name;
      briefSummary = `Mirror ${arch1} matchup. With identical offensive blueprints, ${overallLeader}'s superior supporting agility and placement metrics grant them the decisive upper hand in sustained rallies.`;
    }
  } else {
    // Differing archetypes
    if (totalScoreP1 > totalScoreP2 + 2) {
      briefSummary = `${arch1} vs. ${arch2} stylistic clash heavily weighted toward ${p1.name}. Beyond the tactical matchup, ${p1.name} holds clear statistical rank dominance across core metrics, making an upset difficult for ${p2.name}.`;
    } else if (totalScoreP2 > totalScoreP1 + 2) {
      briefSummary = `${arch1} vs. ${arch2} encounter in which ${p2.name} possesses the higher overall statistical baseline, requiring ${p1.name} to execute flawless archetype tactics to bridge the skill tier gap.`;
    } else {
      briefSummary = `Tightly contested ${arch1} vs. ${arch2} duel. Overall stat totals are closely balanced, making tactical matchup dynamics—specifically service initiative and table positioning—the decisive factor.`;
    }
  }

  // Phase Analysis Breakdown
  const p1Short = p1.name.trim().split(' ')[0] || p1.name;
  const p2Short = p2.name.trim().split(' ')[0] || p2.name;

  const phases: PhaseAnalysis[] = [
    {
      phaseNumber: '01',
      title: 'Serve & Receive Initiative',
      metricsClash: 'SSC vs RCX',
      edge: sscDiff > 0 ? 'p1' : sscDiff < 0 ? 'p2' : 'even',
      verdict:
        sscDiff > 0
          ? `${p1Short} • Service Edge`
          : sscDiff < 0
          ? `${p2Short} • Service Edge`
          : 'Neutral Service',
      keyTacticalFactor:
        sscDiff > 0
          ? `${p1.name}'s rotational spin disguise (${m1.ssc}) tests ${p2.name}'s receive reading (${m2.rcx})`
          : sscDiff < 0
          ? `${p2.name}'s deceptive service repertoire (${m2.ssc}) pressures ${p1.name}'s return touch (${m1.rcx})`
          : `Equivalent service spin generations (${m1.ssc}) ensure clean receive reads`,
      tableOutcome:
        sscDiff > 0
          ? `${p1.name} regularly generates high floating returns for immediate 3rd-ball kills`
          : sscDiff < 0
          ? `${p2.name} seizes initial attacking rights right off the serve`
          : 'Rallies routinely progress into open table play without immediate service aces',
      detail:
        sscDiff > 0
          ? `${p1.name}'s superior spin complexity (${m1.ssc} vs ${m2.ssc}) will disguise depth and rotational spin, forcing passive returns from ${p2.name} and setting up favorable 3rd-ball attacks.`
          : sscDiff < 0
          ? `${p2.name}'s higher service rating (${m2.ssc} vs ${m1.ssc}) will create problems for ${p1.name}'s receive game, forcing high floating returns.`
          : `Both players generate equivalent spin variety (${m1.ssc}). Service returns will be crisp with minimal unforced receive errors.`,
    },
    {
      phaseNumber: '02',
      title: 'Open Rally & Loop Firepower',
      metricsClash: 'FHF & BHL Wing Power',
      edge: fhfDiff + bhlDiff > 0 ? 'p1' : fhfDiff + bhlDiff < 0 ? 'p2' : 'even',
      verdict:
        fhfDiff + bhlDiff > 0
          ? `${p1Short} • Firepower Edge`
          : fhfDiff + bhlDiff < 0
          ? `${p2Short} • Firepower Edge`
          : 'Balanced Loops',
      keyTacticalFactor:
        fhfDiff > 0
          ? `${p1.name} forehand velocity (${m1.fhf}) vs ${p2.name} baseline blocking (${m2.rcx})`
          : fhfDiff < 0
          ? `${p2.name} forehand velocity (${m2.fhf}) vs ${p1.name} baseline blocking (${m1.rcx})`
          : `Symmetric loop drive rotational arcs and ball speeds`,
      tableOutcome:
        fhfDiff > 0
          ? `${p1.name} forces ${p2.name} back from the table into defensive recovery`
          : fhfDiff < 0
          ? `${p2.name} pushes ${p1.name} into defensive scrambling loops`
          : 'High-cadence multi-ball loop duels decided by stamina and recovery',
      detail:
        fhfDiff > 0
          ? `${p1.name}'s forehand (${m1.fhf}) generates higher ball speed and topspin dip than ${p2.name}'s (${m2.fhf}), allowing ${p1.name} to step back and execute kill-shots even under pressure.`
          : fhfDiff < 0
          ? `${p2.name}'s forehand (${m2.fhf}) overpowers ${p1.name}'s forehand (${m1.fhf}), forcing ${p1.name} onto the defensive.`
          : `Forehand ratings are identical (${m1.fhf}). Topspin loop-to-loop exchanges will be prolonged until one athlete misjudges table depth.`,
    },
    {
      phaseNumber: '03',
      title: 'Corner Placement & Transition Pressure',
      metricsClash: 'VNP vs FWA',
      edge: vnpDiff > 0 ? 'p1' : vnpDiff < 0 ? 'p2' : 'even',
      verdict:
        vnpDiff > 0
          ? `${p1Short} • Placement Edge`
          : vnpDiff < 0
          ? `${p2Short} • Placement Edge`
          : 'Even Corridors',
      keyTacticalFactor:
        vnpDiff > 0
          ? `${p1.name}'s angle distribution (${m1.vnp}) targeting ${p2.name}'s lateral recovery (${m2.fwa})`
          : vnpDiff < 0
          ? `${p2.name}'s angle distribution (${m2.vnp}) targeting ${p1.name}'s lateral recovery (${m1.fwa})`
          : `Matching placement discipline down standard table lanes`,
      tableOutcome:
        vnpDiff > 0
          ? `${p2.name} is pulled wide, creating down-the-line winning openings for ${p1.name}`
          : vnpDiff < 0
          ? `${p1.name} is forced into hurried off-balance reaches`
          : 'Sustained rallies focused on depth and consistency down the center lines',
      detail:
        vnpDiff > 0
          ? `${p1.name}'s sharp court vision (${m1.vnp}) allows them to locate ${p2.name}'s playing elbow and wide corners, testing ${p2.name}'s footwork agility (${m2.fwa}).`
          : vnpDiff < 0
          ? `${p2.name}'s placement (${m2.vnp}) will continually stretch ${p1.name} wide, searching for openings down the lines.`
          : `Both competitors hit with equivalent angular accuracy (${m1.vnp}). Rallies will be contested within disciplined corridors.`,
    },
    {
      phaseNumber: '04',
      title: 'Clutch Counter-Timing & Deuce Poise',
      metricsClash: 'RCX & Composure',
      edge: rcxDiff > 0 ? 'p1' : rcxDiff < 0 ? 'p2' : 'even',
      verdict:
        rcxDiff > 0
          ? `${p1Short} • Reflex Edge`
          : rcxDiff < 0
          ? `${p2Short} • Reflex Edge`
          : 'Even Reflexes',
      keyTacticalFactor:
        rcxDiff > 0
          ? `${p1.name}'s close-table reaction window (${m1.rcx}) on rapid counter-drives`
          : rcxDiff < 0
          ? `${p2.name}'s close-table reaction window (${m2.rcx}) on rapid counter-drives`
          : `Equivalent blade stabilization and hand-speed in deuce rallies`,
      tableOutcome:
        rcxDiff > 0
          ? `${p1.name} redirects hard loops for clean counter-winners on the rise`
          : rcxDiff < 0
          ? `${p2.name} absorbs pace and converts defense into sudden counter-attack`
          : 'Points decided by stamina and risk tolerance rather than reflex delay',
      detail:
        rcxDiff > 0
          ? `In rapid off-the-bounce counter-hitting and deuce points, ${p1.name}'s reflex grade (${m1.rcx}) provides tighter racket stabilization against heavy incoming pace.`
          : rcxDiff < 0
          ? `${p2.name}'s reflex rating (${m2.rcx}) gives them the upper hand in rapid close-table counter-blocks.`
          : `Equal reflex composure (${m1.rcx}). High-pressure deuce moments will be determined by stamina and mental focus.`,
    },
  ];

  // Win condition keys (Structured 3-bullet blueprints)
  const winKeysP1: string[] =
    arch1 === 'Attacker'
      ? [
          'Seize 3rd-ball initiative with explosive forehand loop-drives',
          'Target the opponent crossover elbow to deny comfortable counter-blocks',
          'Maintain high-cadence offensive pressure to avoid defensive attrition',
        ]
      : arch1 === 'Chopper'
      ? [
          'Anchor 3 meters back with heavy underspin and depth variation',
          'Induce impatient over-hitting on deep floaters and knuckle returns',
          'Execute surprise counter-loop kills when opponent drops short',
        ]
      : arch1 === 'Blocker'
      ? [
          'Smother incoming topspin on the immediate rise at table baseline',
          'Borrow opponent forward pace to redirect acute cross-court angles',
          'Disrupt backswing timing with quick stop-blocks and punch returns',
        ]
      : arch1 === 'Finisher'
      ? [
          'Attack immediately on short balls via aggressive banana flicks',
          'Terminate points within 3 to 5 shots using high-speed loop drives',
          'Target wide sidelines on 5th-ball conversions',
        ]
      : [
          'Retreat to mid-court early and execute sky-high defensive lobs',
          'Apply extreme sidespin hook to force mistimed overhead smashes',
          'Test opponent cardiovascular stamina across 15+ shot rally sequences',
        ];

  const winKeysP2: string[] =
    arch2 === 'Attacker'
      ? [
          'Dictate the forehand diagonal with heavy forward topspin loops',
          'Push the opponent off the table baseline and target wide corners',
          'Keep receive returns low and half-long to prevent flick attacks',
        ]
      : arch2 === 'Chopper'
      ? [
          'Vary underspin cut depth between the baseline and mid-table',
          'Force weak push returns and punish them with sudden step-around loops',
          'Neutralize hard smashes through soft-touch absorption chopping',
        ]
      : arch2 === 'Blocker'
      ? [
          'Absorb primary attacking waves on the rise at the table edge',
          'Snipe the opponent elbow crossover point to paralyze loop swings',
          'Use quick push-blocks to change table depth and cadence',
        ]
      : arch2 === 'Finisher'
      ? [
          'Pounce on the first loose ball with full-power loop-drive kills',
          'Prevent extended rallies by dictating aggressive 3rd-ball shots',
          'Punish high returns with decisive overhead put-aways',
        ]
      : [
          'Maintain deep baseline placement on defensive lobs from 4m back',
          'Lure the opponent into exhaustive overhead smashing sequences',
          'Mix knuckle-ball floating returns with heavy sidespin curves',
        ];

  // Win conditions
  const winConditionP1 =
    arch1 === 'Attacker'
      ? `Seize early third-ball offensive initiative with forehand loop-drives. Avoid passive pushing and maintain high cadence down the lines.`
      : arch1 === 'Chopper'
      ? `Keep chops deep onto the opponent's baseline with alternating heavy underspin and floaters. Capitalize on loose drops with sudden counter-loops.`
      : arch1 === 'Blocker'
      ? `Stay right on the table baseline, redirecting incoming speed into acute angles before the opponent recovers backswing posture.`
      : arch1 === 'Finisher'
      ? `Accelerate through short balls with decisive banana flicks and explosive third-ball winners to prevent extended rallies.`
      : `Retreat to mid-court early and loft heavy sidespin lobs with variable kick. Frustrate opponent into rushed, mistimed smashes.`;

  const winConditionP2 =
    arch2 === 'Attacker'
      ? `Dominate the forehand diagonal with heavy topspin loops. Push the opponent off the table and exploit the backhand corner.`
      : arch2 === 'Chopper'
      ? `Vary chop depth to disrupt timing. Force weak push returns and punish them with aggressive step-around loops.`
      : arch2 === 'Blocker'
      ? `Absorb primary attacks on the rise. Target the opponent's playing elbow crossover to neutralize big swings.`
      : arch2 === 'Finisher'
      ? `Attack on the first available opening. Use blistering loop-drives to terminate points within 3 to 5 shots.`
      : `Maintain depth on defensive lobs from 4 meters back. Lure the opponent into exhaustive overhead smashing sequences.`;

  // Projected Outcome Calculation
  const netAdvantage = totalScoreP1 - totalScoreP2 + archetypeBonusP1;
  let winnerName = p1.name;
  let score = '3-1';
  let edgeRating = '65% Probability';
  let closingSummary = '';

  if (netAdvantage >= 5) {
    winnerName = p1.name;
    score = '3-0';
    edgeRating = '88% High Probability';
    closingSummary = `${p1.name} holds commanding statistical and stylistic advantages. Barring an extraordinary run of unforced errors, ${p1.name} should secure a clean sweep.`;
  } else if (netAdvantage >= 2) {
    winnerName = p1.name;
    score = '3-1';
    edgeRating = '72% Solid Advantage';
    closingSummary = `${p1.name} holds key edges in high-leverage categories. While ${p2.name} is capable of taking a set through strategic adjustments, ${p1.name}'s consistency will prevail over 4 games.`;
  } else if (netAdvantage >= 1) {
    winnerName = p1.name;
    score = '3-2';
    edgeRating = '56% Slight Edge';
    closingSummary = `Extremely close encounter expected to go the full 5-game distance. ${p1.name}'s slight tier margins give them a narrow edge in the decider.`;
  } else if (netAdvantage === 0) {
    winnerName = 'TIE / EVEN CONTEST';
    score = '3-2 (Even 50-50)';
    edgeRating = '50% Toss-Up';
    closingSummary = `Dead heat. With matching overall metrics and neutralized archetype interactions, this match is a genuine 50-50 battle decided on final-game deuce margins.`;
  } else if (netAdvantage >= -2) {
    winnerName = p2.name;
    score = '3-2';
    edgeRating = '57% Slight Edge';
    closingSummary = `A grueling 5-game war. ${p2.name}'s narrow statistical edge should see them across the finish line in a tight final frame.`;
  } else if (netAdvantage >= -4) {
    winnerName = p2.name;
    score = '3-1';
    edgeRating = '74% Solid Advantage';
    closingSummary = `${p2.name} commands key categorical advantages that will wear down ${p1.name}'s tactical plan over a 4-game series.`;
  } else {
    winnerName = p2.name;
    score = '3-0';
    edgeRating = '89% High Probability';
    closingSummary = `${p2.name} outclasses ${p1.name} across multiple core metrics, projecting a dominant sweep.`;
  }

  return {
    briefSummary,
    coreClashTitle,
    coreClashDynamic,
    decidingFactor,
    archetypeMatchupName: matchupName,
    archetypeTactics,
    statDifferentials,
    statDifferentialSummary,
    phases,
    winConditionP1,
    winConditionP2,
    winKeysP1,
    winKeysP2,
    predictedOutcome: {
      winnerName,
      score,
      edgeRating,
      closingSummary,
    },
  };
}
