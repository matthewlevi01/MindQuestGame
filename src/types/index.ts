export type CognitiveDomain =
  | 'memory'
  | 'attention'
  | 'reasoning'
  | 'processing_speed'
  | 'cognitive_flexibility'
  | 'executive_function';

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
  band: DevelopmentalBand;
  timestamp: string; // ISO string
  durationSeconds: number;
  difficultyLevel: number; // 1 to 5
  accuracy: number; // 0 to 100
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
  metrics: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
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
