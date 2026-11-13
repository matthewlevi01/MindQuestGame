export type CognitiveDomain =
  | 'memory'
  | 'attention'
  | 'reasoning'
  | 'processing_speed'
  | 'cognitive_flexibility'
  | 'executive_function'
  | 'mental_math'
  | 'spatial_thinking'
  | 'reading_comprehension';

export type FocusArea = 'reading' | 'concentration' | 'mental_abilities';

export type DevelopmentalBand =
  | 'young_explorers' // 5-7
  | 'senior_explorers' // 8-10
  | 'discoverers'     // 11-13
  | 'masters';        // 14-16

export interface ChildAccessibility {
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  largeText: boolean;
}

export interface StreakMilestone {
  days: number;
  id: string;
  title: string;
  emoji: string;
  xpBonus: number;
  description: string;
}

export interface AchievementDefinition {
  id: string;
  domain: CognitiveDomain;
  title: string;
  stickerEmoji: string;
  stickerName: string;
  description: string;
  bgHex: string;
  borderHex: string;
  textColorClass: string;
  requiredAccuracy: number;
  xpBonus: number;
}

export interface ChildAchievement {
  id: string;
  domain: CognitiveDomain;
  unlockedAt: string;
}

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  calculatedAge: number;
  band: DevelopmentalBand;
  avatar: string; // Avatar icon id
  accessibility: ChildAccessibility;
  dailyLimitMinutes: number; // e.g. 20
  todayMinutesPlayed: number;
  streakDays: number;
  bestStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  streakBadges: string[]; // List of milestone IDs earned
  achievements?: ChildAchievement[]; // Domain mastery digital stickers & badges
  allowedFocusAreas?: FocusArea[]; // Parent choice: 'reading' | 'concentration' | 'mental_abilities'
  totalXp: number;
  level: number;
  createdAt: string;
}

export interface GameSession {
  id: string;
  childId: string;
  gameId: string;
  gameTitle: string;
  domain: CognitiveDomain;
  focusArea: FocusArea;
  band: DevelopmentalBand;
  timestamp: string; // ISO string
  durationSeconds: number;
  difficultyLevel: number; // 1 to 5
  accuracy: number; // 0 to 100
  score?: number;
  timedOut?: boolean;
  responseTimeMs?: number;
  mistakes: number;
  hintsUsed: number;
  xpEarned: number;
  completed: boolean;
  details?: Record<string, any>;
}

export interface DailyMission {
  id: string;
  childId: string;
  title: string;
  description: string;
  domain: CognitiveDomain;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
}

export interface GameDefinition {
  id: string;
  moduleId: string;
  moduleName: string;
  title: string;
  tagline: string;
  domain: CognitiveDomain;
  focusArea: FocusArea;
  subCategory: string;
  description: string;
  minAge: number;
  maxAge: number;
  allowedBands: DevelopmentalBand[];
  estimatedMinutes: number;
  iconName: string;
  badgeColor: string;
}

export interface DomainInfo {
  id: CognitiveDomain;
  title: string;
  shortDesc: string;
  fullDesc: string;
  focusArea: FocusArea;
  metrics: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export interface FocusAreaInfo {
  id: FocusArea;
  title: string;
  shortDesc: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface BandInfo {
  id: DevelopmentalBand;
  worldName: string;
  subName: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  themeDescription: string;
  color: string;
  bgGradient: string;
  avatarOptions: { id: string; name: string; emoji: string }[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  band: DevelopmentalBand;
  level: number;
  totalXp: number;
  streakDays: number;
  bestStreak: number;
  bestDomain: string;
  isCurrentChild?: boolean;
  badgesCount: number;
  specialBadge?: string;
}

export type AppView =
  | 'marketing'
  | 'marketing_worlds'
  | 'marketing_domains'
  | 'marketing_pricing'
  | 'marketing_faq'
  | 'parent_auth'
  | 'parent_dashboard'
  | 'parent_reports'
  | 'parent_children'
  | 'parent_settings'
  | 'child_select'
  | 'child_world'
  | 'child_game';
