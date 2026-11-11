import React from 'react';
import { ChildProfile, GameDefinition } from '../../types';
import { DEVELOPMENTAL_BANDS, GAME_DEFINITIONS } from '../../utils/engine';
import {
  Sparkles,
  Flame,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Brain,
  Target,
  Puzzle,
  Zap,
  Compass,
} from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface ChildWorldViewProps {
  child: ChildProfile;
  onLaunchGame: (gameId: string) => void;
  onRequestParentExit: () => void;
  onToggleSound: () => void;
}

export const ChildWorldView: React.FC<ChildWorldViewProps> = ({
  child,
  onLaunchGame,
  onRequestParentExit,
  onToggleSound,
}) => {
  const bandInfo = DEVELOPMENTAL_BANDS[child.band] || DEVELOPMENTAL_BANDS.young_explorers;

  // Icon map for games
  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-7 h-7" />;
      case 'Target':
        return <Target className="w-7 h-7" />;
      case 'Puzzle':
        return <Puzzle className="w-7 h-7" />;
      case 'Zap':
        return <Zap className="w-7 h-7" />;
      case 'Compass':
        return <Compass className="w-7 h-7" />;
      default:
        return <Sparkles className="w-7 h-7" />;
    }
  };

  const getAvatarEmoji = () => {
    const opt = bandInfo.avatarOptions.find((a) => a.id === child.avatar);
    return opt ? opt.emoji : '🦊';
  };

  // Color accents tailored to band
  const isMaster = child.band === 'masters';
  const isYoung = child.band === 'young_explorers';

  return (
    <div
      className={`min-h-screen ${
        isMaster
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      } font-child transition-colors duration-300 pb-16`}
    >
      {/* Top Banner / Child HUD */}
      <header
        className={`sticky top-0 z-30 px-4 md:px-8 py-3.5 border-b backdrop-blur-md ${
          isMaster
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : 'bg-white/90 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Child Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-inner border border-amber-300">
              {getAvatarEmoji()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg md:text-xl tracking-tight leading-none">
                  {child.name}
                </h1>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isMaster
                      ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  Level {child.level}
                </span>
              </div>
              <p
                className={`text-xs font-semibold mt-0.5 ${
                  isMaster ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {bandInfo.worldName} · {bandInfo.ageRange}
              </p>
            </div>
          </div>

          {/* Quick HUD Meters: Streak, Playtime limit, Sound, Parent Exit */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Streak */}
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isMaster
                  ? 'bg-slate-800/80 border-slate-700 text-amber-400'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{child.streakDays} Day Streak</span>
            </div>

            {/* Daily Usage Time Meter */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isMaster
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-teal-600" />
              <span>
                {child.todayMinutesPlayed}/{child.dailyLimitMinutes}m Today
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                isMaster
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={child.accessibility.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {child.accessibility.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Parent Controlled Exit */}
            <button
              onClick={onRequestParentExit}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer ${
                isMaster
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Parent Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main World Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* World Hero Banner */}
        <div
          className={`rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl bg-gradient-to-r ${bandInfo.bgGradient}`}
        >
          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase font-black tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs inline-block mb-3">
              {bandInfo.subName} Adventure Zone
            </span>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">
              Welcome to {bandInfo.worldName}!
            </h2>
            <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed mb-4">
              {bandInfo.themeDescription}
            </p>

            {/* XP Bar */}
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/20 max-w-sm">
              <div className="flex justify-between text-xs font-extrabold mb-1.5">
                <span>Total XP: {child.totalXp}</span>
                <span>Next Rank: {child.level * 100} XP</span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (child.totalXp % 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-lg md:text-xl font-black tracking-tight ${
                  isMaster ? 'text-white' : 'text-slate-900'
                }`}
              >
                Today's Discovery Missions
              </h3>
              <p className={`text-xs ${isMaster ? 'text-slate-400' : 'text-slate-500'}`}>
                Complete missions to earn bonus XP and boost your cognitive skills!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mission 1 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isMaster
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                  Memory Lab
                </span>
                <span className="text-xs font-extrabold text-amber-500">+25 XP</span>
              </div>
              <h4
                className={`text-sm font-extrabold mb-1 ${
                  isMaster ? 'text-white' : 'text-slate-800'
                }`}
              >
                Picture Pairs Explorer
              </h4>
              <p
                className={`text-xs mb-3 ${
                  isMaster ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Match all hidden pairs with 80%+ accuracy.
              </p>
              <button
                onClick={() => onLaunchGame('memory_pairs')}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Mission
              </button>
            </div>

            {/* Mission 2 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isMaster
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Focus Academy
                </span>
                <span className="text-xs font-extrabold text-amber-500">+20 XP</span>
              </div>
              <h4
                className={`text-sm font-extrabold mb-1 ${
                  isMaster ? 'text-white' : 'text-slate-800'
                }`}
              >
                Rule Switch Challenger
              </h4>
              <p
                className={`text-xs mb-3 ${
                  isMaster ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Adapt quickly to 2 rule changes without misclicks.
              </p>
              <button
                onClick={() => onLaunchGame('focus_hunter')}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Mission
              </button>
            </div>

            {/* Mission 3 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isMaster
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Strategy Island
                </span>
                <span className="text-xs font-extrabold text-amber-500">+30 XP</span>
              </div>
              <h4
                className={`text-sm font-extrabold mb-1 ${
                  isMaster ? 'text-white' : 'text-slate-800'
                }`}
              >
                Island Route Navigator
              </h4>
              <p
                className={`text-xs mb-3 ${
                  isMaster ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Plot an optimal path and reach the trophy.
              </p>
              <button
                onClick={() => onLaunchGame('strategy_route')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Mission
              </button>
            </div>
          </div>
        </section>

        {/* 5 Cognitive Game Modules */}
        <section>
          <div className="mb-4">
            <h3
              className={`text-lg md:text-xl font-black tracking-tight ${
                isMaster ? 'text-white' : 'text-slate-900'
              }`}
            >
              Cognitive Training Chambers
            </h3>
            <p className={`text-xs ${isMaster ? 'text-slate-400' : 'text-slate-500'}`}>
              Select a module to practice a specific mental ability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAME_DEFINITIONS.map((game) => (
              <div
                key={game.id}
                className={`group rounded-3xl p-6 border transition-all hover:scale-[1.01] flex flex-col justify-between ${
                  isMaster
                    ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 shadow-lg'
                    : 'bg-white hover:bg-slate-50/70 border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        game.domain === 'memory'
                          ? 'bg-violet-100 text-violet-700'
                          : game.domain === 'attention'
                          ? 'bg-teal-100 text-teal-700'
                          : game.domain === 'reasoning'
                          ? 'bg-amber-100 text-amber-700'
                          : game.domain === 'processing_speed'
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {getGameIcon(game.iconName)}
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isMaster
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ~{game.estimatedMinutes} Mins
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {game.moduleName}
                  </span>
                  <h4
                    className={`text-lg font-black mt-0.5 mb-1.5 ${
                      isMaster ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {game.title}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed mb-6 ${
                      isMaster ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {game.description}
                  </p>
                </div>

                <button
                  onClick={() => onLaunchGame(game.id)}
                  className={`w-full py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
                    game.domain === 'memory'
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                      : game.domain === 'attention'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : game.domain === 'reasoning'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : game.domain === 'processing_speed'
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-white" /> Play Challenge
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
