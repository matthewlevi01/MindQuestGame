import React from 'react';
import { ChildProfile, StreakMilestone } from '../../types';
import { STREAK_MILESTONES, getNextStreakMilestone } from '../../utils/streak';
import { CheckCircle, X, Sparkles } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  newMilestone?: StreakMilestone | null;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  child,
  newMilestone,
}) => {
  if (!isOpen) return null;

  const currentStreak = child.streakDays || 1;
  const bestStreak = child.bestStreak || currentStreak;
  const earnedBadgeIds = new Set(child.streakBadges || []);
  const nextMilestone = getNextStreakMilestone(currentStreak);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-child">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#ffd400] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-[#f76400] via-[#c1008f] to-[#7f27a8] text-white relative border-b-2 border-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#ffd400] text-black border-2 border-black flex items-center justify-center text-3xl shadow-inner animate-bounce">
              🔥
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#ffd400] font-extrabold block">
                Daily Habit Power
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                {currentStreak} Day Streak!
              </h3>
              <p className="text-xs text-white font-semibold mt-0.5">
                Personal Best Record: {bestStreak} Days in a Row
              </p>
            </div>
          </div>
        </div>

        {/* New Milestone Celebration Banner */}
        {newMilestone && (
          <div className="p-4 bg-[#ffd400] border-b-2 border-black flex items-center gap-3 text-black">
            <span className="text-3xl">{newMilestone.emoji}</span>
            <div>
              <span className="text-xs font-extrabold text-[#7f27a8] uppercase">
                New Milestone Unlocked!
              </span>
              <h4 className="text-sm font-black text-black">{newMilestone.title}</h4>
              <span className="text-xs text-black font-bold">
                +{newMilestone.xpBonus} Bonus XP Awarded
              </span>
            </div>
          </div>
        )}

        {/* Next Target Progress Strip */}
        <div className="p-6 bg-[#e885cf]/20 border-b-2 border-[#e885cf]">
          {nextMilestone ? (
            <div>
              <div className="flex items-center justify-between text-xs font-extrabold text-black mb-2">
                <span>
                  Next Milestone: {nextMilestone.title} ({nextMilestone.days} Days)
                </span>
                <span className="text-[#c1008f] font-black">
                  {nextMilestone.days - currentStreak}{' '}
                  {nextMilestone.days - currentStreak === 1 ? 'day' : 'days'} to go!
                </span>
              </div>
              <div className="w-full h-3 bg-white border border-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f76400] to-[#c1008f] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentStreak / nextMilestone.days) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-xs font-extrabold text-[#7f27a8] flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#f76400]" />
              Maximum Habit Milestone Achieved! You are a legendary Master of Habit!
            </div>
          )}
        </div>

        {/* Milestone Badges Catalog */}
        <div className="p-6 overflow-y-auto space-y-3 text-black">
          <span className="text-xs font-extrabold uppercase tracking-wider text-black block mb-1">
            Streak Milestone Badges
          </span>

          {STREAK_MILESTONES.map((m) => {
            const isEarned = earnedBadgeIds.has(m.id) || currentStreak >= m.days;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isEarned
                    ? 'bg-[#ffd400]/25 border-[#f76400] shadow-xs'
                    : 'bg-white border-[#53b0c9] opacity-65'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-black">{m.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-black text-black font-bold">
                        {m.days} {m.days === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>
                    <p className="text-xs text-black font-medium">{m.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isEarned ? (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#53b0c9] text-black border border-black flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-black" /> Earned
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-[#7f27a8]">+{m.xpBonus} XP</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#53b0c9]/25 border-t-2 border-[#53b0c9] flex items-center justify-between gap-4">
          <span className="text-xs text-black font-bold">
            Playing just 1 challenge every day keeps your streak blazing!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#7f27a8] hover:bg-[#c1008f] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
