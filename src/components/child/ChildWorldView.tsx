import React, { useState, useMemo } from 'react';
import { ChildProfile, GameSession, AchievementDefinition } from '../../types';
import { DEVELOPMENTAL_BANDS, GAME_DEFINITIONS, COGNITIVE_DOMAINS } from '../../utils/engine';
import { getChildAchievementStatuses } from '../../utils/achievements';
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
  Calculator,
  Layers,
  BookOpen,
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Gamepad2,
  X,
} from 'lucide-react';

interface ChildWorldViewProps {
  child: ChildProfile;
  sessions?: GameSession[];
  loginSessionId?: number;
  newlyUnlockedAchievements?: AchievementDefinition[];
  onDismissAchievementBanner?: () => void;
  onLaunchGame: (gameId: string) => void;
  onRequestParentExit: () => void;
  onToggleSound: () => void;
  onOpenStreakModal: () => void;
  onOpenLeaderboard: () => void;
}

export const ChildWorldView: React.FC<ChildWorldViewProps> = ({
  child,
  sessions = [],
  loginSessionId = 1,
  newlyUnlockedAchievements = [],
  onDismissAchievementBanner,
  onLaunchGame,
  onRequestParentExit,
  onToggleSound,
  onOpenStreakModal,
  onOpenLeaderboard,
}) => {
  const [worldTab, setWorldTab] = useState<'games' | 'achievements'>('games');
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('all');
  const bandInfo = DEVELOPMENTAL_BANDS[child.band] || DEVELOPMENTAL_BANDS.young_explorers;

  const achievementStatuses = useMemo(
    () => getChildAchievementStatuses(child, sessions),
    [child, sessions]
  );
  const unlockedCount = achievementStatuses.filter((a) => a.unlocked).length;

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
      case 'Calculator':
        return <Calculator className="w-7 h-7" />;
      case 'Layers':
        return <Layers className="w-7 h-7" />;
      case 'BookOpen':
        return <BookOpen className="w-7 h-7" />;
      default:
        return <Sparkles className="w-7 h-7" />;
    }
  };

  const getAvatarEmoji = () => {
    const opt = bandInfo.avatarOptions.find((a) => a.id === child.avatar);
    return opt ? opt.emoji : '🦊';
  };

  const isMaster = child.band === 'masters';

  const [sessionSeed] = useState(() => Math.floor(Date.now() + Math.random() * 100000));

  const parentAllowedAreas = child.allowedFocusAreas || ['reading', 'concentration', 'mental_abilities'];

  const allowedAllGames = useMemo(() => {
    return GAME_DEFINITIONS.filter((game) => parentAllowedAreas.includes(game.focusArea));
  }, [parentAllowedAreas]);

  const spotlightGame = useMemo(() => {
    if (allowedAllGames.length === 0) return null;
    const storageKey = `mindquest_last_spotlight_${child.id}`;
    const lastId = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const candidates =
      allowedAllGames.length > 1 && lastId
        ? allowedAllGames.filter((g) => g.id !== lastId)
        : allowedAllGames;
    const index = Math.abs(sessionSeed + loginSessionId * 7) % candidates.length;
    const chosen = candidates[index];
    if (typeof window !== 'undefined' && chosen) {
      window.localStorage.setItem(storageKey, chosen.id);
    }
    return chosen;
  }, [allowedAllGames, child.id, sessionSeed, loginSessionId]);

  const availableGames = useMemo(() => {
    const filtered = GAME_DEFINITIONS.filter((game) => {
      if (!parentAllowedAreas.includes(game.focusArea)) return false;
      if (selectedFocusArea === 'all') return true;
      return game.focusArea === selectedFocusArea;
    });

    const shuffled = [...filtered];
    let s = sessionSeed + loginSessionId * 131;
    for (let i = shuffled.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    if (shuffled.length > 1 && spotlightGame) {
      const idx = shuffled.findIndex((g) => g.id === spotlightGame.id);
      if (idx > 0) {
        const [item] = shuffled.splice(idx, 1);
        shuffled.unshift(item);
      }
    }

    return shuffled;
  }, [parentAllowedAreas, selectedFocusArea, sessionSeed, loginSessionId, spotlightGame]);

  const getGameColorTheme = (focusArea: string, domain: string) => {
    if (focusArea === 'reading') {
      return {
        iconBg: 'bg-[#c1008f] text-white',
        button: 'bg-[#c1008f] hover:bg-[#7f27a8] text-white',
        border: 'border-[#c1008f]',
      };
    }
    switch (domain) {
      case 'mental_math':
        return {
          iconBg: 'bg-[#53b0c9] text-black',
          button: 'bg-[#53b0c9] hover:bg-[#ffd400] text-black',
          border: 'border-[#53b0c9]',
        };
      case 'spatial_thinking':
        return {
          iconBg: 'bg-[#e885cf] text-black',
          button: 'bg-[#7f27a8] hover:bg-[#c1008f] text-white',
          border: 'border-[#e885cf]',
        };
      case 'memory':
        return {
          iconBg: 'bg-[#7f27a8] text-white',
          button: 'bg-[#7f27a8] hover:bg-[#c1008f] text-white',
          border: 'border-[#7f27a8]',
        };
      case 'attention':
        return {
          iconBg: 'bg-[#53b0c9] text-black',
          button: 'bg-[#53b0c9] hover:bg-[#ffd400] text-black',
          border: 'border-[#53b0c9]',
        };
      case 'reasoning':
        return {
          iconBg: 'bg-[#ffd400] text-black',
          button: 'bg-[#ffd400] hover:bg-[#f76400] text-black hover:text-white',
          border: 'border-[#ffd400]',
        };
      case 'processing_speed':
        return {
          iconBg: 'bg-[#f76400] text-white',
          button: 'bg-[#f76400] hover:bg-[#c1008f] text-white',
          border: 'border-[#f76400]',
        };
      default:
        return {
          iconBg: 'bg-[#e885cf] text-black',
          button: 'bg-[#f76400] hover:bg-[#7f27a8] text-white',
          border: 'border-[#e885cf]',
        };
    }
  };

  // Pick a representative game for a cognitive domain so kids can launch straight from locked sticker cards
  const findRecommendedGameForDomain = (domainId: string) => {
    const exactMatch =
      GAME_DEFINITIONS.find((g) => g.domain === domainId) ||
      (domainId === 'cognitive_flexibility'
        ? GAME_DEFINITIONS.find((g) => g.id === 'focus_hunter')
        : undefined);
    return exactMatch;
  };

  return (
    <div
      className={`min-h-screen ${
        isMaster ? 'bg-[#7f27a8]/10 text-black' : 'bg-white text-black'
      } font-child transition-colors duration-300 pb-16`}
    >
      {/* Top Banner / Child HUD */}
      <header
        className={`sticky top-0 z-30 px-4 md:px-8 py-3.5 border-b-4 backdrop-blur-md ${
          isMaster
            ? 'bg-[#7f27a8] border-[#ffd400] text-white'
            : 'bg-white/95 border-[#53b0c9] text-black shadow-xs'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Child Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffd400] flex items-center justify-center text-2xl shadow-sm border-2 border-black">
              {getAvatarEmoji()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg md:text-xl tracking-tight leading-none">
                  {child.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#53b0c9] text-black border border-black/20">
                  Level {child.level}
                </span>
              </div>
              <p
                className={`text-xs font-semibold mt-0.5 ${
                  isMaster ? 'text-white/90' : 'text-black'
                }`}
              >
                {bandInfo.worldName} · {bandInfo.ageRange}
              </p>
            </div>
          </div>

          {/* Quick HUD Meters */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onOpenStreakModal}
              title="View Daily Streak Milestones & Rewards"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black text-xs font-extrabold transition-all transform active:scale-95 shadow-xs cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>{child.streakDays || 1}d Streak</span>
            </button>

            <button
              onClick={() => setWorldTab('achievements')}
              title="Open Achievement Stickers & Domain Badges"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#e885cf] hover:bg-[#ffd400] text-black text-xs font-extrabold transition-all transform active:scale-95 shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Stickers</span>
              <span>
                ({unlockedCount}/{achievementStatuses.length})
              </span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              title="Open Leaderboard & Hall of Fame"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#53b0c9] hover:bg-[#e885cf] text-black text-xs font-extrabold transition-all transform active:scale-95 shadow-xs cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-[#ffd400] text-black" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#7f27a8] bg-white text-black text-xs font-bold">
              <Clock className="w-4 h-4 text-[#7f27a8]" />
              <span>
                {child.todayMinutesPlayed}/{child.dailyLimitMinutes}m Today
              </span>
            </div>

            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl border-2 border-black bg-[#e885cf] hover:bg-[#ffd400] text-black transition-colors cursor-pointer"
              title={child.accessibility.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {child.accessibility.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onRequestParentExit}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer bg-black hover:bg-[#c1008f] text-white"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Parent Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main World Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* Newly Unlocked Sticker Celebration Banner */}
        {newlyUnlockedAchievements.length > 0 && (
          <div className="mb-6 rounded-3xl p-5 bg-[#ffd400] border-4 border-black shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7f27a8] text-white border-2 border-black flex items-center justify-center text-3xl shrink-0">
                {newlyUnlockedAchievements[0].stickerEmoji}
              </div>
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-[#c1008f] block">
                  New Domain Sticker Unlocked! (+{newlyUnlockedAchievements.reduce((s, a) => s + a.xpBonus, 0)} Bonus XP)
                </span>
                <h3 className="text-lg font-black text-black">
                  {newlyUnlockedAchievements.map((a) => a.stickerName).join(' · ')}
                </h3>
                <p className="text-xs font-bold text-black/80">
                  Awesome domain mastery! Check out your digital sticker collection in the Achievements tab.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setWorldTab('achievements')}
                className="px-4 py-2 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-xs border-2 border-black cursor-pointer"
              >
                View Stickers
              </button>
              {onDismissAchievementBanner && (
                <button
                  onClick={onDismissAchievementBanner}
                  className="p-2 rounded-xl bg-white hover:bg-[#e885cf] text-black border-2 border-black cursor-pointer"
                  aria-label="Dismiss celebration"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* World Hero Banner */}
        <div
          className={`rounded-3xl p-6 md:p-8 mb-6 text-white relative overflow-hidden shadow-xl border-4 border-black bg-gradient-to-r ${bandInfo.bgGradient}`}
        >
          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase font-black tracking-widest bg-[#ffd400] text-black px-3 py-1 rounded-full inline-block mb-3 border border-black">
              {bandInfo.subName} Adventure Zone
            </span>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight text-white">
              Welcome to {bandInfo.worldName}!
            </h2>
            <p className="text-white text-sm md:text-base font-medium leading-relaxed mb-4">
              {bandInfo.themeDescription}
            </p>

            {/* XP & Streak Bar */}
            <div className="bg-black/40 backdrop-blur-xs rounded-2xl p-3 border-2 border-white/40 max-w-md flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-extrabold mb-1.5 text-white">
                  <span>Total XP: {child.totalXp}</span>
                  <span>Next Rank: {child.level * 100} XP</span>
                </div>
                <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffd400] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, child.totalXp % 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={onOpenStreakModal}
                className="px-3 py-1.5 rounded-xl bg-[#ffd400] hover:bg-[#e885cf] text-black font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 shrink-0 border-2 border-black cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>{child.streakDays || 1}d Streak 🔥</span>
              </button>
            </div>
          </div>
        </div>

        {/* World Primary Navigation Tabs: Game Chambers vs Achievements & Stickers */}
        <div className="flex items-center gap-3 mb-7 p-2 bg-[#53b0c9]/20 border-2 border-black rounded-2xl w-fit">
          <button
            onClick={() => setWorldTab('games')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer border-2 ${
              worldTab === 'games'
                ? 'bg-[#7f27a8] text-white border-black shadow-md'
                : 'bg-white text-black border-transparent hover:bg-[#ffd400]'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game Chambers ({availableGames.length})</span>
          </button>

          <button
            onClick={() => setWorldTab('achievements')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer border-2 ${
              worldTab === 'achievements'
                ? 'bg-[#ffd400] text-black border-black shadow-md'
                : 'bg-white text-black border-transparent hover:bg-[#e885cf]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Achievements &amp; Stickers</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#c1008f] text-white font-black">
              {unlockedCount}/{achievementStatuses.length}
            </span>
          </button>
        </div>

        {/* TAB 1: GAME CHAMBERS */}
        {worldTab === 'games' && (
          <>
            {/* DYNAMIC SPOTLIGHT CHALLENGE */}
            {spotlightGame && (
              <div className="mb-8 rounded-3xl p-6 md:p-7 bg-gradient-to-r from-[#f76400] via-[#c1008f] to-[#7f27a8] text-white shadow-xl relative overflow-hidden border-4 border-black">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase font-black tracking-widest bg-[#ffd400] text-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-black">
                        <Sparkles className="w-3.5 h-3.5 fill-black text-black animate-pulse" />
                        <span>Today&apos;s Login Spotlight Challenge</span>
                      </span>
                      <span className="text-xs font-bold text-white">
                        Refreshes on Every Visit!
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 flex items-center gap-2 text-white">
                      <span>{spotlightGame.title}</span>
                    </h3>
                    <p className="text-white text-xs md:text-sm font-medium leading-relaxed mb-4">
                      {spotlightGame.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => onLaunchGame(spotlightGame.id)}
                        className="px-6 py-3 rounded-2xl bg-[#ffd400] hover:bg-white text-black font-black text-sm shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2 border-2 border-black"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Play Spotlight Challenge (+50 Bonus XP)</span>
                      </button>
                      <div className="text-xs font-extrabold bg-black/40 px-3.5 py-2 rounded-xl border border-white/40 text-white">
                        {spotlightGame.subCategory} · ~{spotlightGame.estimatedMinutes} Mins
                      </div>
                    </div>
                  </div>

                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#53b0c9] border-4 border-black flex items-center justify-center text-black shadow-xl shrink-0 transform hover:scale-105 transition-transform">
                    {getGameIcon(spotlightGame.iconName)}
                  </div>
                </div>
              </div>
            )}

            {/* Focus Area Filter & Game Grid */}
            <section className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg md:text-xl font-black tracking-tight text-black">
                    Parent-Approved Skill Chambers
                  </h3>
                  <p className="text-xs text-black font-semibold">
                    Choose from Reading, Concentration, and Mental Abilities practice games.
                  </p>
                </div>

                <div className="p-1.5 rounded-2xl border-2 border-[#7f27a8] bg-[#e885cf]/20 flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setSelectedFocusArea('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      selectedFocusArea === 'all'
                        ? 'bg-[#ffd400] text-black border border-black shadow-xs'
                        : 'text-black hover:bg-white'
                    }`}
                  >
                    All Games
                  </button>
                  <button
                    onClick={() => setSelectedFocusArea('reading')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedFocusArea === 'reading'
                        ? 'bg-[#c1008f] text-white shadow-xs'
                        : 'text-black hover:bg-white'
                    }`}
                  >
                    <span>📖 1. Reading</span>
                  </button>
                  <button
                    onClick={() => setSelectedFocusArea('concentration')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedFocusArea === 'concentration'
                        ? 'bg-[#53b0c9] text-black border border-black shadow-xs'
                        : 'text-black hover:bg-white'
                    }`}
                  >
                    <span>🎯 2. Concentration</span>
                  </button>
                  <button
                    onClick={() => setSelectedFocusArea('mental_abilities')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedFocusArea === 'mental_abilities'
                        ? 'bg-[#7f27a8] text-white shadow-xs'
                        : 'text-black hover:bg-white'
                    }`}
                  >
                    <span>🧠 3. Mental Abilities</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {availableGames.map((game) => {
                  const theme = getGameColorTheme(game.focusArea, game.domain);
                  return (
                    <div
                      key={game.id}
                      className={`group rounded-3xl p-6 border-3 ${theme.border} bg-white transition-all hover:scale-[1.01] flex flex-col justify-between shadow-md`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-black ${theme.iconBg}`}
                          >
                            {getGameIcon(game.iconName)}
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ffd400] text-black border border-black">
                            ~{game.estimatedMinutes} Mins
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#7f27a8]">
                            {game.subCategory}
                          </span>
                        </div>

                        <h4 className="text-lg font-black mt-0.5 mb-1.5 text-black">
                          {game.title}
                        </h4>
                        <p className="text-xs leading-relaxed mb-6 text-black font-medium">
                          {game.description}
                        </p>
                      </div>

                      <button
                        onClick={() => onLaunchGame(game.id)}
                        className={`w-full py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer border-2 border-black ${theme.button}`}
                      >
                        <Play className="w-4 h-4 fill-current" /> Play Challenge
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: ACHIEVEMENTS & DIGITAL STICKER ALBUM */}
        {worldTab === 'achievements' && (
          <section className="space-y-8 mb-8">
            {/* Sticker Album Overview Card */}
            <div className="rounded-3xl p-6 md:p-7 bg-[#ffd400] border-4 border-black shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-black tracking-widest bg-[#7f27a8] text-white px-3 py-1 rounded-full border border-black inline-block mb-2">
                  Digital Sticker Album
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-black">
                  {child.name}&apos;s Domain Mastery Badges
                </h3>
                <p className="text-sm font-bold text-black/85 mt-1 max-w-xl">
                  Master each cognitive domain by scoring {achievementStatuses[0]?.definition.requiredAccuracy}%+ accuracy (or averaging 80%+ across 2+ games) to collect all {achievementStatuses.length} exclusive digital stickers!
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border-2 border-black min-w-[210px] text-center shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider text-[#7f27a8] block">
                  Stickers Collected
                </span>
                <div className="text-3xl font-black text-black my-1 tabular-nums">
                  {unlockedCount} / {achievementStatuses.length}
                </div>
                <div className="w-full h-3 bg-[#e885cf]/30 rounded-full overflow-hidden border border-black">
                  <div
                    className="h-full bg-[#c1008f] transition-all duration-500"
                    style={{
                      width: `${Math.round((unlockedCount / Math.max(1, achievementStatuses.length)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Domain Mastery Badges & Sticker Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievementStatuses.map((status) => {
                const { definition, unlocked, unlockedAt, sessionsCount, bestAccuracy, progressPercent } = status;
                const domainMeta = COGNITIVE_DOMAINS[definition.domain];
                const recommendedGame = findRecommendedGameForDomain(definition.domain);

                return (
                  <div
                    key={definition.id}
                    className={`rounded-3xl p-6 border-3 flex flex-col justify-between transition-all ${
                      unlocked
                        ? `bg-white ${definition.borderHex} shadow-lg`
                        : 'bg-[#53b0c9]/10 border-black/30 opacity-90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        {/* Sticker Seal */}
                        <div
                          className={`w-18 h-18 rounded-3xl border-3 border-black flex items-center justify-center text-4xl shadow-md transform transition-transform ${
                            unlocked
                              ? `${definition.bgHex} ${definition.textColorClass} -rotate-3 hover:rotate-3`
                              : 'bg-white text-black/40 grayscale'
                          }`}
                        >
                          {definition.stickerEmoji}
                        </div>

                        {unlocked ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffd400] text-black border-2 border-black text-xs font-black shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#7f27a8]" />
                            Mastered!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black border border-black text-xs font-extrabold">
                            <Lock className="w-3.5 h-3.5 text-[#c1008f]" />
                            Locked
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-black uppercase tracking-wider text-[#7f27a8] block">
                        {domainMeta?.title || definition.domain}
                      </span>
                      <h4 className="text-lg font-black text-black mt-0.5 mb-1">
                        {definition.title}
                      </h4>
                      <div className="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-[#e885cf]/35 text-black border border-[#c1008f] mb-2">
                        {definition.stickerName}
                      </div>
                      <p className="text-xs text-black font-medium leading-relaxed mb-4">
                        {definition.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t-2 border-black/15">
                      <div className="flex items-center justify-between text-xs font-extrabold text-black mb-1.5">
                        <span>
                          {sessionsCount} {sessionsCount === 1 ? 'session' : 'sessions'} · Best: {bestAccuracy}%
                        </span>
                        <span className="text-[#f76400]">+{definition.xpBonus} XP</span>
                      </div>

                      <div className="w-full h-2.5 bg-white border border-black rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all duration-500 ${
                            unlocked ? 'bg-[#53b0c9]' : 'bg-[#f76400]'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {unlocked ? (
                        <div className="text-[11px] font-bold text-[#7f27a8] text-center">
                          Unlocked{' '}
                          {unlockedAt
                            ? new Date(unlockedAt).toLocaleDateString()
                            : 'through mastery'}
                        </div>
                      ) : (
                        recommendedGame && (
                          <button
                            onClick={() => onLaunchGame(recommendedGame.id)}
                            className="w-full py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-xs border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Play {recommendedGame.title} to Unlock</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
