import React, { useState } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { getLeaderboardEntries } from '../../utils/storage';
import { GAME_DEFINITIONS } from '../../utils/engine';
import { Trophy, Flame, Medal, X, Sparkles, Users, Crown } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  sessions: GameSession[];
  childrenList?: ChildProfile[];
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  activeChild,
  sessions,
  childrenList,
}) => {
  const [activeTab, setActiveTab] = useState<'family' | 'world' | 'personal'>('family');

  if (!isOpen) return null;

  const { familyLeaderboard, worldGuildLeaderboard } = getLeaderboardEntries(
    activeChild.id,
    childrenList
  );
  const childSessions = sessions.filter((s) => s.childId === activeChild.id);

  const personalBests = GAME_DEFINITIONS.map((game) => {
    const gameSessions = childSessions.filter((s) => s.gameId === game.id);
    const maxAccuracy =
      gameSessions.length > 0 ? Math.max(...gameSessions.map((s) => s.accuracy)) : null;
    const maxDifficulty =
      gameSessions.length > 0 ? Math.max(...gameSessions.map((s) => s.difficultyLevel)) : 1;
    const totalPlayed = gameSessions.length;

    return {
      game,
      maxAccuracy,
      maxDifficulty,
      totalPlayed,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-child">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-[#ffd400] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f76400] via-[#c1008f] to-[#7f27a8] text-white border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffd400] text-black border-2 border-black flex items-center justify-center text-xl shadow-inner">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Explorers Leaderboard &amp; Hall of Fame
              </h3>
              <p className="text-xs text-white font-medium">
                Celebrate consistency, streaks, and personal improvement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-around border-b-2 border-[#53b0c9] bg-[#e885cf]/20 px-4 py-2.5 gap-2">
          <button
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'family'
                ? 'bg-[#7f27a8] text-white border-black shadow-xs'
                : 'bg-white text-black border-[#53b0c9] hover:bg-[#ffd400]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Family Explorers</span>
          </button>

          <button
            onClick={() => setActiveTab('world')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'world'
                ? 'bg-[#7f27a8] text-white border-black shadow-xs'
                : 'bg-white text-black border-[#53b0c9] hover:bg-[#ffd400]'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>World League</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'personal'
                ? 'bg-[#7f27a8] text-white border-black shadow-xs'
                : 'bg-white text-black border-[#53b0c9] hover:bg-[#ffd400]'
            }`}
          >
            <Medal className="w-3.5 h-3.5 text-[#f76400]" />
            <span>My Personal Bests</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-black">
          {/* TAB 1: FAMILY LEADERBOARD */}
          {activeTab === 'family' && (
            <div className="space-y-3">
              <p className="text-xs text-black font-semibold mb-2">
                Independent sibling explorer standings. Encourage each other to maintain daily streaks!
              </p>

              {familyLeaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                    entry.isCurrentChild
                      ? 'bg-[#ffd400]/25 border-[#f76400] ring-2 ring-[#ffd400] shadow-sm'
                      : 'bg-white border-[#53b0c9] hover:bg-[#e885cf]/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border border-black ${
                        idx === 0
                          ? 'bg-[#ffd400] text-black shadow-xs'
                          : idx === 1
                          ? 'bg-[#53b0c9] text-black'
                          : idx === 2
                          ? 'bg-[#f76400] text-white'
                          : 'bg-[#e885cf] text-black'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="w-12 h-12 rounded-2xl bg-[#ffd400] border-2 border-black flex items-center justify-center text-2xl">
                      {entry.avatar === 'tiger'
                        ? '🐯'
                        : entry.avatar === 'fox'
                        ? '🦊'
                        : entry.avatar === 'detective'
                        ? '🕵️'
                        : '♟️'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-black">{entry.name}</span>
                        {entry.isCurrentChild && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffd400] text-black border border-black font-extrabold">
                            Active
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#53b0c9] text-black font-bold">
                          Lvl {entry.level}
                        </span>
                      </div>
                      <span className="text-xs text-[#7f27a8] font-bold">{entry.specialBadge}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="flex items-center gap-1 justify-end text-xs font-black text-[#f76400]">
                        <Flame className="w-3.5 h-3.5 fill-[#f76400] text-[#f76400]" />
                        <span>{entry.streakDays}d Streak</span>
                      </div>
                      <span className="text-xs font-black text-black tabular-nums">
                        {entry.totalXp} XP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: WORLD EXPLORER GUILD */}
          {activeTab === 'world' && (
            <div className="space-y-3">
              <p className="text-xs text-black font-semibold mb-2">
                Friendly cognitive explorer league featuring fellow avatars and character companions.
              </p>

              {worldGuildLeaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                    entry.isCurrentChild
                      ? 'bg-[#53b0c9]/25 border-[#7f27a8] ring-2 ring-[#53b0c9] shadow-sm'
                      : 'bg-white border-[#e885cf] hover:bg-[#ffd400]/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border border-black ${
                        idx === 0
                          ? 'bg-[#ffd400] text-black shadow-xs'
                          : idx === 1
                          ? 'bg-[#53b0c9] text-black'
                          : idx === 2
                          ? 'bg-[#f76400] text-white'
                          : 'bg-[#e885cf] text-black'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="w-11 h-11 rounded-2xl bg-[#53b0c9] border-2 border-black flex items-center justify-center text-2xl">
                      {entry.avatar === 'tiger'
                        ? '🐯'
                        : entry.avatar === 'owl'
                        ? '🦉'
                        : entry.avatar === 'detective'
                        ? '🕵️'
                        : entry.avatar === 'strategist'
                        ? '♟️'
                        : '🦊'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-black">{entry.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffd400] text-black font-bold">
                          Lvl {entry.level}
                        </span>
                      </div>
                      <span className="text-xs text-[#7f27a8] font-bold">{entry.specialBadge}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-xs font-black text-[#f76400]">
                      <Flame className="w-3.5 h-3.5 fill-[#f76400] text-[#f76400]" />
                      <span>{entry.streakDays}d Streak</span>
                    </div>
                    <span className="text-xs font-black text-black tabular-nums">
                      {entry.totalXp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PERSONAL BESTS HALL OF FAME */}
          {activeTab === 'personal' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#ffd400] border-2 border-black rounded-2xl text-xs text-black leading-relaxed flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong>Personal Bests Engine:</strong> Track your own improvement over time.
                  Every game you master sets a new benchmark for yourself!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalBests.map(({ game, maxAccuracy, maxDifficulty, totalPlayed }) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-2xl bg-white border-2 border-[#7f27a8] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-[#c1008f] uppercase tracking-wider">
                          {game.subCategory}
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#ffd400] text-black">
                          Tier {maxDifficulty}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-black mb-1">{game.title}</h4>
                      <p className="text-xs text-black font-medium mb-3 line-clamp-1">{game.tagline}</p>
                    </div>

                    <div className="pt-2 border-t-2 border-[#e885cf] flex items-center justify-between text-xs">
                      <span className="text-black font-semibold">
                        {totalPlayed} {totalPlayed === 1 ? 'play' : 'plays'}
                      </span>
                      {maxAccuracy !== null ? (
                        <div className="flex items-center gap-1 font-black text-[#7f27a8]">
                          <Medal className="w-3.5 h-3.5 text-[#f76400]" />
                          <span>{maxAccuracy}% Best Record</span>
                        </div>
                      ) : (
                        <span className="text-black/70 font-semibold italic">Not played yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#53b0c9] border-t-2 border-black text-center text-xs text-black font-extrabold">
          Consistent daily practice builds true cognitive agility!
        </div>
      </div>
    </div>
  );
};
