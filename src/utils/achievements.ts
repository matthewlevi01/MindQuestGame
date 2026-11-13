import {
  AchievementDefinition,
  ChildAchievement,
  ChildProfile,
  CognitiveDomain,
  GameSession,
} from '../types';

export const DOMAIN_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'master_memory',
    domain: 'memory',
    title: 'Memory Lab Master',
    stickerEmoji: '🦉',
    stickerName: 'Golden Memory Owl Sticker',
    description: 'Master Visual & Auditory Memory by scoring 85%+ accuracy (or 80%+ avg over 2+ runs).',
    bgHex: 'bg-[#7f27a8]',
    borderHex: 'border-[#7f27a8]',
    textColorClass: 'text-white',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_attention',
    domain: 'attention',
    title: 'Focus Academy Ace',
    stickerEmoji: '🎯',
    stickerName: 'Laser Bullseye Sticker',
    description: 'Master Sustained Attention by scoring 85%+ accuracy while resisting distractors.',
    bgHex: 'bg-[#53b0c9]',
    borderHex: 'border-[#53b0c9]',
    textColorClass: 'text-black',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_reasoning',
    domain: 'reasoning',
    title: 'Logic Kingdom Crown',
    stickerEmoji: '👑',
    stickerName: 'Royal Logic Crown Sticker',
    description: 'Master Pattern & Deductive Reasoning with 85%+ accuracy in Logic challenges.',
    bgHex: 'bg-[#ffd400]',
    borderHex: 'border-[#f76400]',
    textColorClass: 'text-black',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_processing_speed',
    domain: 'processing_speed',
    title: 'Lightning Brain Bolt',
    stickerEmoji: '⚡',
    stickerName: 'Turbo Lightning Sticker',
    description: 'Master Processing Speed by classifying items rapidly with 85%+ accuracy.',
    bgHex: 'bg-[#f76400]',
    borderHex: 'border-[#f76400]',
    textColorClass: 'text-white',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_cognitive_flexibility',
    domain: 'cognitive_flexibility',
    title: 'Shape-Shift Ninja',
    stickerEmoji: '🦊',
    stickerName: 'Swift Rule-Switch Sticker',
    description: 'Master Cognitive Flexibility by adapting through rule-switch challenges at 85%+ accuracy.',
    bgHex: 'bg-[#c1008f]',
    borderHex: 'border-[#c1008f]',
    textColorClass: 'text-white',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_executive_function',
    domain: 'executive_function',
    title: 'Grand Route Navigator',
    stickerEmoji: '🧭',
    stickerName: 'Captain Compass Sticker',
    description: 'Master Executive Planning by charting routes and memory sequences at 85%+ accuracy.',
    bgHex: 'bg-[#e885cf]',
    borderHex: 'border-[#c1008f]',
    textColorClass: 'text-black',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_mental_math',
    domain: 'mental_math',
    title: 'Number Wizard Star',
    stickerEmoji: '🔢',
    stickerName: 'Sparkle Calculator Sticker',
    description: 'Master Mental Mathematics by solving arithmetic quests with 85%+ accuracy.',
    bgHex: 'bg-[#53b0c9]',
    borderHex: 'border-[#53b0c9]',
    textColorClass: 'text-black',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_spatial_thinking',
    domain: 'spatial_thinking',
    title: '3D Matrix Architect',
    stickerEmoji: '🧊',
    stickerName: 'Crystal Cube Sticker',
    description: 'Master Spatial & Abstract Thinking with 85%+ accuracy in rotations and treasure maps.',
    bgHex: 'bg-[#7f27a8]',
    borderHex: 'border-[#7f27a8]',
    textColorClass: 'text-white',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
  {
    id: 'master_reading_comprehension',
    domain: 'reading_comprehension',
    title: 'Word Detective Badge',
    stickerEmoji: '📖',
    stickerName: 'Storybook Quill Sticker',
    description: 'Master Reading & Verbal Comprehension with 85%+ accuracy in Word Detective or Story Studio.',
    bgHex: 'bg-[#c1008f]',
    borderHex: 'border-[#c1008f]',
    textColorClass: 'text-white',
    requiredAccuracy: 85,
    xpBonus: 50,
  },
];

export interface DomainAchievementStatus {
  definition: AchievementDefinition;
  unlocked: boolean;
  unlockedAt?: string;
  sessionsCount: number;
  bestAccuracy: number;
  avgAccuracy: number;
  progressPercent: number;
}

function doesSessionCountForDomain(session: GameSession, domain: CognitiveDomain): boolean {
  if (session.domain === domain) return true;
  // Rule-switch focus sessions also train cognitive flexibility
  if (
    domain === 'cognitive_flexibility' &&
    session.domain === 'attention' &&
    Number(session.details?.ruleSwitchesAdapted || 0) >= 2
  ) {
    return true;
  }
  return false;
}

export function getChildAchievementStatuses(
  child: ChildProfile,
  allSessions: GameSession[]
): DomainAchievementStatus[] {
  const childSessions = allSessions.filter((s) => s.childId === child.id);
  const existingMap = new Map<string, ChildAchievement>(
    (child.achievements || []).map((a) => [a.id, a])
  );

  return DOMAIN_ACHIEVEMENTS.map((def) => {
    const domainSessions = childSessions.filter((s) => doesSessionCountForDomain(s, def.domain));
    const sessionsCount = domainSessions.length;
    const bestAccuracy =
      sessionsCount > 0 ? Math.max(...domainSessions.map((s) => s.accuracy)) : 0;
    const avgAccuracy =
      sessionsCount > 0
        ? Math.round(domainSessions.reduce((sum, s) => sum + s.accuracy, 0) / sessionsCount)
        : 0;

    const qualifiesBySessions =
      domainSessions.some((s) => s.completed && s.accuracy >= def.requiredAccuracy) ||
      (sessionsCount >= 2 && avgAccuracy >= 80);

    const saved = existingMap.get(def.id);
    const unlocked = Boolean(saved) || qualifiesBySessions;
    const unlockedAt = saved?.unlockedAt || (qualifiesBySessions ? domainSessions[0]?.timestamp : undefined);

    const progressPercent = unlocked
      ? 100
      : Math.min(95, Math.round((bestAccuracy / def.requiredAccuracy) * 100));

    return {
      definition: def,
      unlocked,
      unlockedAt,
      sessionsCount,
      bestAccuracy,
      avgAccuracy,
      progressPercent,
    };
  });
}

export function evaluateAndAwardAchievements(
  child: ChildProfile,
  allSessions: GameSession[]
): {
  updatedChild: ChildProfile;
  newlyUnlocked: AchievementDefinition[];
} {
  const existingIds = new Set((child.achievements || []).map((a) => a.id));
  const statuses = getChildAchievementStatuses(child, allSessions);

  const newlyUnlocked: AchievementDefinition[] = [];
  const nextAchievements: ChildAchievement[] = [...(child.achievements || [])];
  let bonusXp = 0;

  statuses.forEach((status) => {
    if (status.unlocked && !existingIds.has(status.definition.id)) {
      const unlockedAt = status.unlockedAt || new Date().toISOString();
      nextAchievements.push({
        id: status.definition.id,
        domain: status.definition.domain,
        unlockedAt,
      });
      if (status.sessionsCount > 0) {
        newlyUnlocked.push(status.definition);
        bonusXp += status.definition.xpBonus;
      }
    }
  });

  const nextTotalXp = child.totalXp + bonusXp;
  const updatedChild: ChildProfile = {
    ...child,
    achievements: nextAchievements,
    totalXp: nextTotalXp,
    level: Math.floor(nextTotalXp / 100) + 1,
  };

  return {
    updatedChild,
    newlyUnlocked,
  };
}
