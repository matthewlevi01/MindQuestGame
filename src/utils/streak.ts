import { ChildProfile, StreakMilestone } from '../types';

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 1,
    id: 'streak_1',
    title: 'First Spark',
    emoji: '🌟',
    xpBonus: 15,
    description: 'Began the daily cognitive practice journey!',
  },
  {
    days: 3,
    id: 'streak_3',
    title: 'Streak Ember',
    emoji: '🔥',
    xpBonus: 35,
    description: '3 consecutive days of purposeful mental exercise!',
  },
  {
    days: 7,
    id: 'streak_7',
    title: 'Weekly Dynamo',
    emoji: '⚡',
    xpBonus: 80,
    description: 'A full week of consistent brain training and missions!',
  },
  {
    days: 14,
    id: 'streak_14',
    title: 'Fortnight Champion',
    emoji: '🏆',
    xpBonus: 160,
    description: '14 days of unstoppable curiosity and skill development!',
  },
  {
    days: 30,
    id: 'streak_30',
    title: 'Master of Habit',
    emoji: '👑',
    xpBonus: 350,
    description: 'A legendary 30-day streak of dedication and growth!',
  },
];

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date formatted as YYYY-MM-DD in local time
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates and updates child streak when completing a game activity.
 * Returns the updated profile, whether the streak incremented, and any new milestone unlocked.
 */
export function processDailyActivity(child: ChildProfile): {
  updatedChild: ChildProfile;
  streakIncremented: boolean;
  milestoneAwarded?: StreakMilestone;
} {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const lastActive = child.lastActiveDate;
  let newStreak = child.streakDays || 0;
  let streakIncremented = false;

  if (lastActive === today) {
    // Already active today; streak maintained
    newStreak = Math.max(1, newStreak);
  } else if (lastActive === yesterday) {
    // Played yesterday -> increment streak!
    newStreak += 1;
    streakIncremented = true;
  } else {
    // Gap of more than 1 day or first time playing -> start at 1
    newStreak = 1;
    streakIncremented = true;
  }

  const bestStreak = Math.max(child.bestStreak || 0, newStreak);
  const earnedBadges = new Set(child.streakBadges || []);

  // Check if any milestone was reached and not yet claimed
  let newlyAwarded: StreakMilestone | undefined;
  for (const milestone of STREAK_MILESTONES) {
    if (newStreak >= milestone.days && !earnedBadges.has(milestone.id)) {
      earnedBadges.add(milestone.id);
      newlyAwarded = milestone;
    }
  }

  const bonusXp = newlyAwarded ? newlyAwarded.xpBonus : 0;
  const updatedChild: ChildProfile = {
    ...child,
    streakDays: newStreak,
    bestStreak,
    lastActiveDate: today,
    streakBadges: Array.from(earnedBadges),
    totalXp: child.totalXp + bonusXp,
    level: Math.floor((child.totalXp + bonusXp) / 100) + 1,
  };

  return {
    updatedChild,
    streakIncremented,
    milestoneAwarded: newlyAwarded,
  };
}

/**
 * Finds the next upcoming milestone target for the child
 */
export function getNextStreakMilestone(currentStreak: number): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone.days > currentStreak) {
      return milestone;
    }
  }
  return null;
}

/**
 * Returns all earned milestone objects
 */
export function getEarnedStreakMilestones(badgeIds: string[] = []): StreakMilestone[] {
  const ids = new Set(badgeIds);
  return STREAK_MILESTONES.filter((m) => ids.has(m.id));
}
