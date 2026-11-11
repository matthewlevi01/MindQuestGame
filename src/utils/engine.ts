import {
  CognitiveDomain,
  DevelopmentalBand,
  DomainInfo,
  BandInfo,
  GameDefinition,
  GameSession,
} from '../types';

export const COGNITIVE_DOMAINS: Record<CognitiveDomain, DomainInfo> = {
  memory: {
    id: 'memory',
    title: 'Memory Lab',
    shortDesc: 'Encoding, storing and retrieving information',
    fullDesc: 'Practise retaining visual pairs, auditory patterns, spatial locations, and retrieving sequences accurately.',
    metrics: ['Recall accuracy', 'Sequence retention', 'Delayed retrieval'],
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    icon: 'Brain',
  },
  attention: {
    id: 'attention',
    title: 'Focus Academy',
    shortDesc: 'Sustaining and selectively directing attention',
    fullDesc: 'Practise zeroing in on key targets amidst distracting visual noise and sustaining focus over time.',
    metrics: ['Target accuracy', 'Missed targets', 'Distractor resistance'],
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    icon: 'Target',
  },
  reasoning: {
    id: 'reasoning',
    title: 'Logic Kingdom',
    shortDesc: 'Identifying relationships, patterns and deduction',
    fullDesc: 'Practise spotting geometric matrices, numerical series, deductive clues, and cause-and-effect reasoning.',
    metrics: ['Pattern recognition', 'Deductive accuracy', 'Complexity level'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: 'Puzzle',
  },
  processing_speed: {
    id: 'processing_speed',
    title: 'Brain Speed',
    shortDesc: 'Efficiently interpreting and responding to info',
    fullDesc: 'Practise rapid visual classification and quick recognition without sacrificing accuracy for raw speed.',
    metrics: ['Response efficiency', 'Accuracy under pace', 'Symbol search rate'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: 'Zap',
  },
  cognitive_flexibility: {
    id: 'cognitive_flexibility',
    title: 'Rule Switch',
    shortDesc: 'Switching between rules, perspectives or approaches',
    fullDesc: 'Practise dynamically adapting when rules shift abruptly from one dimension to another.',
    metrics: ['Switch-cost adaptation', 'Rule transition speed', 'Inhibition control'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: 'Shuffle',
  },
  executive_function: {
    id: 'executive_function',
    title: 'Strategy Island',
    shortDesc: 'Planning, working memory and self-regulation',
    fullDesc: 'Practise looking ahead several steps, managing constraints, and formulating multi-step navigation plans.',
    metrics: ['Step efficiency', 'Forward planning', 'Goal completion rate'],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'Compass',
  },
};

export const DEVELOPMENTAL_BANDS: Record<DevelopmentalBand, BandInfo> = {
  young_explorers: {
    id: 'young_explorers',
    worldName: 'Explorers Grove',
    subName: 'Young Explorers',
    ageRange: 'Ages 5–7',
    minAge: 5,
    maxAge: 7,
    themeDescription: 'Playful nature adventures with friendly guides, large buttons, audio guidance, and zero reading pressure.',
    color: 'emerald',
    bgGradient: 'from-emerald-500 via-teal-500 to-sky-500',
    avatarOptions: [
      { id: 'fox', name: 'Pip the Fox', emoji: '🦊' },
      { id: 'bear', name: 'Barnaby Bear', emoji: '🐻' },
      { id: 'bunny', name: 'Luna Bunny', emoji: '🐰' },
      { id: 'owl', name: 'Oliver Owl', emoji: '🦉' },
    ],
  },
  senior_explorers: {
    id: 'senior_explorers',
    worldName: 'Explorers Trail',
    subName: 'Senior Explorers',
    ageRange: 'Ages 8–10',
    minAge: 8,
    maxAge: 10,
    themeDescription: 'Curious island expeditions with deeper pattern challenges, multi-item memory, and mission badges.',
    color: 'amber',
    bgGradient: 'from-amber-500 via-orange-500 to-emerald-500',
    avatarOptions: [
      { id: 'tiger', name: 'Dash the Tiger', emoji: '🐯' },
      { id: 'hawk', name: 'Sky the Hawk', emoji: '🦅' },
      { id: 'dolphin', name: 'Echo the Dolphin', emoji: '🐬' },
      { id: 'panda', name: 'Bamboo Panda', emoji: '🐼' },
    ],
  },
  discoverers: {
    id: 'discoverers',
    worldName: 'Discoverers Academy',
    subName: 'Discoverers',
    ageRange: 'Ages 11–13',
    minAge: 11,
    maxAge: 13,
    themeDescription: 'Mystery, investigative deduction, multi-step puzzles, clues, and dynamic rule-switching tests.',
    color: 'violet',
    bgGradient: 'from-indigo-600 via-violet-600 to-purple-700',
    avatarOptions: [
      { id: 'detective', name: 'Inspector Lynx', emoji: '🕵️' },
      { id: 'cipher', name: 'Nova Navigator', emoji: '🧭' },
      { id: 'falcon', name: 'Aero Falcon', emoji: '⚡' },
      { id: 'alchemist', name: 'Kite Alchemist', emoji: '🔮' },
    ],
  },
  masters: {
    id: 'masters',
    worldName: 'Masters Neural Lab',
    subName: 'Masters',
    ageRange: 'Ages 14–16',
    minAge: 14,
    maxAge: 16,
    themeDescription: 'High-level strategic analysis, abstract logic grids, working memory load, and complex decision-making.',
    color: 'blue',
    bgGradient: 'from-slate-900 via-blue-950 to-indigo-950',
    avatarOptions: [
      { id: 'strategist', name: 'Apex Strategist', emoji: '♟️' },
      { id: 'quantum', name: 'Quantum Core', emoji: '⚛️' },
      { id: 'architect', name: 'Nexus Architect', emoji: '🏛️' },
      { id: 'cyber', name: 'Cyber Voyager', emoji: '🛸' },
    ],
  },
};

export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'memory_pairs',
    moduleId: 'memory_lab',
    moduleName: 'Memory Lab',
    title: 'Picture Pairs & Sequence',
    tagline: 'Visual memory and location retention',
    domain: 'memory',
    description: 'Find matching cards and track spatial locations. Adapts card count and distractors to child age.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Brain',
    badgeColor: 'violet',
  },
  {
    id: 'focus_hunter',
    moduleId: 'focus_academy',
    moduleName: 'Focus Academy',
    title: 'Target Hunter & Rule Switch',
    tagline: 'Selective attention & cognitive flexibility',
    domain: 'attention',
    description: 'Tap target shapes quickly while ignoring distractors. Watch out when the bell chimes for a surprise rule switch!',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Target',
    badgeColor: 'teal',
  },
  {
    id: 'logic_patterns',
    moduleId: 'logic_kingdom',
    moduleName: 'Logic Kingdom',
    title: 'Pattern Detective',
    tagline: 'Deductive reasoning and sequence completion',
    domain: 'reasoning',
    description: 'Analyze sequences of shapes, numbers, and colors to deduce the missing piece in the puzzle.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'Puzzle',
    badgeColor: 'amber',
  },
  {
    id: 'speed_classifier',
    moduleId: 'brain_speed',
    moduleName: 'Brain Speed',
    title: 'Rapid Classifier',
    tagline: 'Visual processing speed & categorization',
    domain: 'processing_speed',
    description: 'Sort stimulus cards into target bins at a brisk pace. Accuracy counts just as much as speed!',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 2,
    iconName: 'Zap',
    badgeColor: 'cyan',
  },
  {
    id: 'strategy_route',
    moduleId: 'strategy_island',
    moduleName: 'Strategy Island',
    title: 'Route Planner',
    tagline: 'Executive function & multi-step planning',
    domain: 'executive_function',
    description: 'Plot moves in advance on a grid to gather resources, bypass obstacles, and reach the destination.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'Compass',
    badgeColor: 'emerald',
  },
];

/**
 * Calculates current age from a birth date (YYYY-MM-DD).
 * Recalculates dynamically over time per PRD Section 7.
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 8;
  const today = new Date();
  const birth = new Date(birthDateString);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(5, Math.min(16, age));
}

/**
 * Assigns developmental band based on calculated age.
 * 5-7: young_explorers
 * 8-10: senior_explorers
 * 11-13: discoverers
 * 14-16: masters
 */
export function getDevelopmentalBand(age: number): DevelopmentalBand {
  if (age <= 7) return 'young_explorers';
  if (age <= 10) return 'senior_explorers';
  if (age <= 13) return 'discoverers';
  return 'masters';
}

/**
 * Deterministic rules-based adaptive difficulty calculation (PRD Section 12).
 * Level 1 to 5 based on consecutive session accuracy.
 */
export function calculateAdaptiveDifficulty(sessions: GameSession[], gameId?: string): number {
  const filtered = gameId ? sessions.filter((s) => s.gameId === gameId) : sessions;
  if (filtered.length === 0) return 1;

  // Look at last 3 sessions
  const recent = filtered.slice(-3);
  const avgAccuracy = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;

  if (recent.length >= 3 && avgAccuracy >= 90) return 4;
  if (recent.length >= 2 && avgAccuracy >= 80) return 3;
  if (avgAccuracy >= 65) return 2;
  return 1;
}

/**
 * Reward XP calculator per PRD Section 13:
 * Completion: 10 XP
 * High accuracy (>=85%): +5 XP
 * Difficult level: +10 XP
 * Personal best or flawless: +10 XP
 */
export function calculateRewardXp(accuracy: number, difficulty: number, isFlawless: boolean): number {
  let xp = 10;
  if (accuracy >= 85) xp += 5;
  if (difficulty >= 3) xp += 10;
  if (isFlawless) xp += 10;
  return xp;
}
