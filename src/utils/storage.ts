import {
  ChildProfile,
  GameSession,
  DevelopmentalBand,
  LeaderboardEntry,
  StreakMilestone,
  AchievementDefinition,
} from '../types';
import { calculateAge, getDevelopmentalBand } from './engine';
import { processDailyActivity, getYesterdayDateString } from './streak';
import { evaluateAndAwardAchievements } from './achievements';

const STORAGE_KEYS = {
  CHILDREN: 'mindquest_children_profiles_v1',
  SESSIONS: 'mindquest_game_sessions_v1',
  MISSIONS: 'mindquest_daily_missions_v1',
  ACTIVE_CHILD: 'mindquest_active_child_id_v1',
  PARENT_PIN: 'mindquest_parent_pin_v1',
  PARENT_DATA: 'mindquest_parent_account_v1',
};

export interface ParentAccount {
  id: string;
  name: string;
  email: string;
  pin: string;
  termsAccepted: boolean;
  consentGiven: boolean;
  createdAt: string;
}

const DEFAULT_PARENT: ParentAccount = {
  id: 'parent-main',
  name: 'Eleanor Vance',
  email: 'eleanor.vance@example.com',
  pin: '1234',
  termsAccepted: true,
  consentGiven: true,
  createdAt: '2026-10-01T09:00:00.000Z',
};

const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child-maya',
    parentId: 'parent-main',
    name: 'Maya',
    birthDate: '2020-05-14', // Age 6
    calculatedAge: 6,
    band: 'young_explorers',
    avatar: 'fox',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true,
      soundVolume: 0.8,
      largeText: true,
    },
    dailyLimitMinutes: 20,
    todayMinutesPlayed: 8,
    streakDays: 4,
    bestStreak: 4,
    lastActiveDate: getYesterdayDateString(),
    streakBadges: ['streak_1', 'streak_3'],
    allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
    totalXp: 180,
    level: 3,
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'child-leo',
    parentId: 'parent-main',
    name: 'Leo',
    birthDate: '2017-09-22', // Age 9
    calculatedAge: 9,
    band: 'senior_explorers',
    avatar: 'tiger',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true,
      soundVolume: 0.7,
      largeText: false,
    },
    dailyLimitMinutes: 25,
    todayMinutesPlayed: 14,
    streakDays: 7,
    bestStreak: 9,
    lastActiveDate: getYesterdayDateString(),
    streakBadges: ['streak_1', 'streak_3', 'streak_7'],
    allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
    totalXp: 410,
    level: 5,
    createdAt: '2026-10-15T10:05:00.000Z',
  },
  {
    id: 'child-sam',
    parentId: 'parent-main',
    name: 'Sam',
    birthDate: '2014-03-10', // Age 12
    calculatedAge: 12,
    band: 'discoverers',
    avatar: 'detective',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true,
      soundVolume: 0.6,
      largeText: false,
    },
    dailyLimitMinutes: 30,
    todayMinutesPlayed: 18,
    streakDays: 12,
    bestStreak: 12,
    lastActiveDate: getYesterdayDateString(),
    streakBadges: ['streak_1', 'streak_3', 'streak_7'],
    allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
    totalXp: 720,
    level: 8,
    createdAt: '2026-10-15T10:10:00.000Z',
  },
  {
    id: 'child-alex',
    parentId: 'parent-main',
    name: 'Alex',
    birthDate: '2011-11-04', // Age 15
    calculatedAge: 15,
    band: 'masters',
    avatar: 'strategist',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true,
      soundVolume: 0.5,
      largeText: false,
    },
    dailyLimitMinutes: 35,
    todayMinutesPlayed: 22,
    streakDays: 15,
    bestStreak: 15,
    lastActiveDate: getYesterdayDateString(),
    streakBadges: ['streak_1', 'streak_3', 'streak_7', 'streak_14'],
    allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
    totalXp: 1150,
    level: 12,
    createdAt: '2026-10-15T10:15:00.000Z',
  },
];

const DEFAULT_SESSIONS: GameSession[] = [
  {
    id: 's-1',
    childId: 'child-leo',
    gameId: 'memory_pairs',
    gameTitle: 'Picture Pairs & Sequence',
    domain: 'memory',
    focusArea: 'mental_abilities',
    band: 'senior_explorers',
    timestamp: '2026-11-08T15:30:00.000Z',
    durationSeconds: 150,
    difficultyLevel: 2,
    accuracy: 92,
    responseTimeMs: 1420,
    mistakes: 1,
    hintsUsed: 0,
    xpEarned: 25,
    completed: true,
  },
  {
    id: 's-2',
    childId: 'child-leo',
    gameId: 'focus_hunter',
    gameTitle: 'Target Hunter & Rule Switch',
    domain: 'attention',
    focusArea: 'concentration',
    band: 'senior_explorers',
    timestamp: '2026-11-09T16:10:00.000Z',
    durationSeconds: 180,
    difficultyLevel: 2,
    accuracy: 88,
    responseTimeMs: 640,
    mistakes: 2,
    hintsUsed: 0,
    xpEarned: 20,
    completed: true,
  },
  {
    id: 's-3',
    childId: 'child-leo',
    gameId: 'logic_patterns',
    gameTitle: 'Pattern Detective',
    domain: 'reasoning',
    focusArea: 'mental_abilities',
    band: 'senior_explorers',
    timestamp: '2026-11-10T14:45:00.000Z',
    durationSeconds: 210,
    difficultyLevel: 3,
    accuracy: 85,
    responseTimeMs: 2100,
    mistakes: 1,
    hintsUsed: 1,
    xpEarned: 25,
    completed: true,
  },
  {
    id: 's-4',
    childId: 'child-leo',
    gameId: 'speed_classifier',
    gameTitle: 'Rapid Classifier',
    domain: 'processing_speed',
    focusArea: 'concentration',
    band: 'senior_explorers',
    timestamp: '2026-11-10T15:00:00.000Z',
    durationSeconds: 90,
    difficultyLevel: 2,
    accuracy: 90,
    responseTimeMs: 510,
    mistakes: 2,
    hintsUsed: 0,
    xpEarned: 20,
    completed: true,
  },
  {
    id: 's-5',
    childId: 'child-leo',
    gameId: 'strategy_route',
    gameTitle: 'Route Planner',
    domain: 'executive_function',
    focusArea: 'concentration',
    band: 'senior_explorers',
    timestamp: '2026-11-11T10:15:00.000Z',
    durationSeconds: 240,
    difficultyLevel: 2,
    accuracy: 95,
    responseTimeMs: 1850,
    mistakes: 0,
    hintsUsed: 0,
    xpEarned: 35,
    completed: true,
  },
  {
    id: 's-m1',
    childId: 'child-maya',
    gameId: 'memory_pairs',
    gameTitle: 'Picture Pairs & Sequence',
    domain: 'memory',
    focusArea: 'mental_abilities',
    band: 'young_explorers',
    timestamp: '2026-11-10T11:00:00.000Z',
    durationSeconds: 120,
    difficultyLevel: 1,
    accuracy: 100,
    responseTimeMs: 1800,
    mistakes: 0,
    hintsUsed: 0,
    xpEarned: 25,
    completed: true,
  },
  {
    id: 's-s1',
    childId: 'child-sam',
    gameId: 'focus_hunter',
    gameTitle: 'Target Hunter & Rule Switch',
    domain: 'cognitive_flexibility',
    focusArea: 'concentration',
    band: 'discoverers',
    timestamp: '2026-11-10T17:00:00.000Z',
    durationSeconds: 190,
    difficultyLevel: 3,
    accuracy: 93,
    responseTimeMs: 480,
    mistakes: 1,
    hintsUsed: 0,
    xpEarned: 30,
    completed: true,
  },
];

export function getParentAccount(): ParentAccount {
  if (typeof window === 'undefined') return DEFAULT_PARENT;
  const stored = localStorage.getItem(STORAGE_KEYS.PARENT_DATA);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PARENT_DATA, JSON.stringify(DEFAULT_PARENT));
    return DEFAULT_PARENT;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_PARENT;
  }
}

export function saveParentAccount(account: ParentAccount): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PARENT_DATA, JSON.stringify(account));
}

export function getChildrenProfiles(): ChildProfile[] {
  if (typeof window === 'undefined') return DEFAULT_CHILDREN;
  const stored = localStorage.getItem(STORAGE_KEYS.CHILDREN);
  const allSessions = getAllSessions();
  if (!stored) {
    const initialized = DEFAULT_CHILDREN.map((c) => evaluateAndAwardAchievements(c, allSessions).updatedChild);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(initialized));
    return initialized;
  }
  try {
    const list: ChildProfile[] = JSON.parse(stored);
    // Recalculate age and band dynamically per PRD Section 7
    return list.map((c) => {
      const age = calculateAge(c.birthDate);
      const band = getDevelopmentalBand(age);
      const baseChild: ChildProfile = {
        ...c,
        calculatedAge: age,
        band,
        bestStreak: c.bestStreak || c.streakDays || 1,
        streakBadges: c.streakBadges || ['streak_1'],
        achievements: c.achievements || [],
        allowedFocusAreas: c.allowedFocusAreas || ['reading', 'concentration', 'mental_abilities'],
      };
      return evaluateAndAwardAchievements(baseChild, allSessions).updatedChild;
    });
  } catch {
    return DEFAULT_CHILDREN;
  }
}

export function saveChildProfile(child: ChildProfile): void {
  if (typeof window === 'undefined') return;
  const list = getChildrenProfiles();
  const index = list.findIndex((c) => c.id === child.id);
  const updatedChild = {
    ...child,
    calculatedAge: calculateAge(child.birthDate),
    band: getDevelopmentalBand(calculateAge(child.birthDate)),
    bestStreak: Math.max(child.bestStreak || 0, child.streakDays || 1),
    streakBadges: child.streakBadges || ['streak_1'],
    achievements: child.achievements || [],
    allowedFocusAreas: child.allowedFocusAreas || ['reading', 'concentration', 'mental_abilities'],
  };

  if (index >= 0) {
    list[index] = updatedChild;
  } else {
    list.push(updatedChild);
  }
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(list));
}

export function deleteChildProfile(childId: string): void {
  if (typeof window === 'undefined') return;
  const list = getChildrenProfiles().filter((c) => c.id !== childId);
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(list));

  const sessions = getAllSessions().filter((s) => s.childId !== childId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getAllSessions(): GameSession[] {
  if (typeof window === 'undefined') return DEFAULT_SESSIONS;
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    return DEFAULT_SESSIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SESSIONS;
  }
}

export function getChildSessions(childId: string): GameSession[] {
  return getAllSessions().filter((s) => s.childId === childId);
}

/**
 * Records a completed game session and updates daily streak & progression
 */
export function recordGameSession(session: GameSession): {
  streakIncremented: boolean;
  milestoneAwarded?: StreakMilestone;
  achievementsAwarded: AchievementDefinition[];
} {
  if (typeof window === 'undefined') {
    return { streakIncremented: false, achievementsAwarded: [] };
  }
  const sessions = getAllSessions();
  sessions.unshift(session);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  // Update child minutes, XP, Daily Streak, and Domain Mastery Achievements
  const children = getChildrenProfiles();
  const child = children.find((c) => c.id === session.childId);

  let streakResult: {
    streakIncremented: boolean;
    milestoneAwarded?: StreakMilestone;
    achievementsAwarded: AchievementDefinition[];
  } = {
    streakIncremented: false,
    achievementsAwarded: [],
  };

  if (child) {
    const minutes = Math.ceil(session.durationSeconds / 60);
    child.todayMinutesPlayed += minutes;
    child.totalXp += session.xpEarned;
    child.level = Math.floor(child.totalXp / 100) + 1;

    // Process daily streak
    const processed = processDailyActivity(child);

    // Evaluate cognitive domain mastery achievements
    const evalResult = evaluateAndAwardAchievements(processed.updatedChild, sessions);

    streakResult = {
      streakIncremented: processed.streakIncremented,
      milestoneAwarded: processed.milestoneAwarded,
      achievementsAwarded: evalResult.newlyUnlocked,
    };

    saveChildProfile(evalResult.updatedChild);
  }

  return streakResult;
}

export function getActiveChildId(): string {
  if (typeof window === 'undefined') return 'child-leo';
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHILD) || 'child-leo';
}

export function setActiveChildId(childId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD, childId);
}

export function resetAllDataToDemo(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(DEFAULT_CHILDREN));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.PARENT_DATA, JSON.stringify(DEFAULT_PARENT));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD, 'child-leo');
}

export function exportDataAsJSON(): string {
  return JSON.stringify(
    {
      parent: getParentAccount(),
      children: getChildrenProfiles(),
      sessions: getAllSessions(),
      exportedAt: new Date().toISOString(),
      platform: 'MindQuest v1.0',
    },
    null,
    2
  );
}

/**
 * Generates leaderboard entries for the family and world explorer guild
 */
export function getLeaderboardEntries(
  currentChildId: string,
  childrenOverride?: ChildProfile[]
): {
  familyLeaderboard: LeaderboardEntry[];
  worldGuildLeaderboard: LeaderboardEntry[];
} {
  const children =
    childrenOverride && childrenOverride.length > 0 ? childrenOverride : getChildrenProfiles();

  const familyLeaderboard: LeaderboardEntry[] = children
    .map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      band: c.band,
      level: c.level,
      totalXp: c.totalXp,
      streakDays: c.streakDays || 1,
      bestStreak: c.bestStreak || c.streakDays || 1,
      bestDomain: 'Cognitive Explorer',
      badgesCount: (c.streakBadges || []).length,
      isCurrentChild: c.id === currentChildId,
      specialBadge:
        c.totalXp > 800 ? 'Mastermind 👑' : c.streakDays >= 7 ? 'Weekly Dynamo ⚡' : 'Rising Star ⭐',
    }))
    .sort((a, b) => b.totalXp - a.totalXp);

  // Friendly world guild explorer peers (PRD Section 13 safe explorer league)
  const worldGuildPeers: LeaderboardEntry[] = [
    {
      id: 'peer-1',
      name: 'Oliver Owl',
      avatar: 'owl',
      band: 'young_explorers',
      level: 7,
      totalXp: 620,
      streakDays: 8,
      bestStreak: 10,
      bestDomain: 'Visual Memory',
      badgesCount: 3,
      specialBadge: 'Memory Scout 🦉',
    },
    {
      id: 'peer-2',
      name: 'Dash the Tiger',
      avatar: 'tiger',
      band: 'senior_explorers',
      level: 9,
      totalXp: 890,
      streakDays: 14,
      bestStreak: 16,
      bestDomain: 'Mental Mathematics',
      badgesCount: 4,
      specialBadge: 'Math Whiz ⚡',
    },
    {
      id: 'peer-3',
      name: 'Inspector Lynx',
      avatar: 'detective',
      band: 'discoverers',
      level: 11,
      totalXp: 1040,
      streakDays: 19,
      bestStreak: 21,
      bestDomain: 'Spatial Matrix',
      badgesCount: 4,
      specialBadge: 'Spatial Detective 🕵️',
    },
    {
      id: 'peer-4',
      name: 'Apex Strategist',
      avatar: 'strategist',
      band: 'masters',
      level: 14,
      totalXp: 1380,
      streakDays: 24,
      bestStreak: 30,
      bestDomain: 'Executive Planning',
      badgesCount: 5,
      specialBadge: 'Grandmaster ♟️',
    },
  ];

  // Merge current active child into world guild to show their ranking among explorers
  const activeChild = children.find((c) => c.id === currentChildId) || children[0];
  const activeEntry: LeaderboardEntry = {
    id: activeChild.id,
    name: `${activeChild.name} (You)`,
    avatar: activeChild.avatar,
    band: activeChild.band,
    level: activeChild.level,
    totalXp: activeChild.totalXp,
    streakDays: activeChild.streakDays || 1,
    bestStreak: activeChild.bestStreak || activeChild.streakDays || 1,
    bestDomain: 'All-Rounder',
    badgesCount: (activeChild.streakBadges || []).length,
    isCurrentChild: true,
    specialBadge: 'Your Explorer 🚀',
  };

  const worldGuildLeaderboard = [...worldGuildPeers, activeEntry].sort(
    (a, b) => b.totalXp - a.totalXp
  );

  return { familyLeaderboard, worldGuildLeaderboard };
}
