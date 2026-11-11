import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { Target, Zap, Clock, Award, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';

interface FocusAcademyGameProps {
  child: ChildProfile;
  difficulty: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

interface TargetItem {
  id: number;
  shape: 'circle' | 'square' | 'star' | 'diamond' | 'triangle';
  color: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
  icon: string;
  isTarget: boolean;
  x: number; // percentage
  y: number; // percentage
  createdAt: number;
}

interface RuleRuleDefinition {
  text: string;
  check: (item: { shape: string; color: string }) => boolean;
}

export const FocusAcademyGame: React.FC<FocusAcademyGameProps> = ({
  child,
  difficulty,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [activeItems, setActiveItems] = useState<TargetItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [showSwitchBanner, setShowSwitchBanner] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [summaryData, setSummaryData] = useState<{
    accuracy: number;
    totalHits: number;
    falseAlarms: number;
    avgReactionMs: number;
    xp: number;
  } | null>(null);

  const gameDuration = child.band === 'young_explorers' ? 25 : child.band === 'senior_explorers' ? 35 : 45;
  const itemCounterRef = useRef(0);

  // Age-adapted rules sequence
  const rules: RuleRuleDefinition[] =
    child.band === 'young_explorers'
      ? [
          { text: 'Tap Yellow Stars ⭐ only!', check: (i) => i.shape === 'star' },
          { text: 'RULE SWITCH: Now tap Green Circles 🟢 only!', check: (i) => i.shape === 'circle' },
        ]
      : child.band === 'senior_explorers'
      ? [
          { text: 'Rule 1: Tap all Stars ⭐ & Diamonds 💎', check: (i) => i.shape === 'star' || i.shape === 'diamond' },
          { text: 'RULE SWITCH: Tap ONLY Cyan/Blue Shapes 🔷', check: (i) => i.color === 'cyan' || i.color === 'indigo' },
          { text: 'RULE SWITCH: Tap ONLY Triangles 🔺', check: (i) => i.shape === 'triangle' },
        ]
      : [
          { text: 'Phase 1: Tap Diamonds 💎 OR Stars ⭐', check: (i) => i.shape === 'diamond' || i.shape === 'star' },
          { text: 'RULE SHIFT: Tap ONLY Red 🛑 and Amber 🔶 items', check: (i) => i.color === 'rose' || i.color === 'amber' },
          { text: 'RULE SHIFT: Tap ONLY Circles 🟢 & Invert colors', check: (i) => i.shape === 'circle' },
        ];

  const currentRule = rules[currentRuleIndex] || rules[0];

  const startGame = () => {
    setCurrentRuleIndex(0);
    setActiveItems([]);
    setTimeLeft(gameDuration);
    setScore(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setShowSwitchBanner(false);
    setReactionTimes([]);
    setGameState('playing');
  };

  // Main game timer & rule switch schedule
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }

        // Rule switch check points
        const elapsed = gameDuration - prev;
        const switchPoint1 = Math.floor(gameDuration * 0.45);
        const switchPoint2 = Math.floor(gameDuration * 0.75);

        if (elapsed === switchPoint1 && rules.length > 1 && currentRuleIndex === 0) {
          triggerRuleSwitch(1);
        } else if (elapsed === switchPoint2 && rules.length > 2 && currentRuleIndex === 1) {
          triggerRuleSwitch(2);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentRuleIndex]);

  const triggerRuleSwitch = (newIndex: number) => {
    soundEngine.playRuleSwitchAlert();
    setCurrentRuleIndex(newIndex);
    setShowSwitchBanner(true);
    setTimeout(() => {
      setShowSwitchBanner(false);
    }, 2200);
  };

  // Stimulus generator
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnIntervalMs = child.band === 'young_explorers' ? 1400 : 900;
    const itemLifetimeMs = child.band === 'young_explorers' ? 3800 : 2500;

    const spawner = setInterval(() => {
      const shapes: TargetItem['shape'][] = ['circle', 'square', 'star', 'diamond', 'triangle'];
      const colors: TargetItem['color'][] = ['emerald', 'amber', 'rose', 'indigo', 'cyan'];

      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const shapeIcons: Record<string, string> = {
        star: '⭐',
        circle: '🟢',
        diamond: '💎',
        square: '🟦',
        triangle: '🔺',
      };

      const newItem: TargetItem = {
        id: ++itemCounterRef.current,
        shape: randomShape,
        color: randomColor,
        icon: shapeIcons[randomShape],
        isTarget: currentRule.check({ shape: randomShape, color: randomColor }),
        x: Math.floor(Math.random() * 75) + 10,
        y: Math.floor(Math.random() * 65) + 15,
        createdAt: Date.now(),
      };

      setActiveItems((prev) => [...prev.slice(-7), newItem]);
    }, spawnIntervalMs);

    return () => clearInterval(spawner);
  }, [gameState, currentRule]);

  const handleItemClick = (item: TargetItem) => {
    const isTargetNow = currentRule.check({ shape: item.shape, color: item.color });
    const reactionTime = Date.now() - item.createdAt;

    // Remove clicked item
    setActiveItems((prev) => prev.filter((i) => i.id !== item.id));

    if (isTargetNow) {
      soundEngine.playSuccess();
      setHits((h) => h + 1);
      setScore((s) => s + 10);
      setReactionTimes((times) => [...times, reactionTime]);
    } else {
      // False alarm (tapped distractor)
      soundEngine.playGentleError();
      setFalseAlarms((f) => f + 1);
      setScore((s) => Math.max(0, s - 5));
    }
  };

  const endGame = () => {
    const totalTaps = hits + falseAlarms;
    const accuracy = totalTaps > 0 ? Math.round((hits / totalTaps) * 100) : 50;
    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 650;
    const isFlawless = falseAlarms === 0 && hits >= 5;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless);

    soundEngine.playFanfare();

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'focus_hunter',
      gameTitle: 'Target Hunter & Rule Switch',
      domain: 'attention',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: gameDuration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: avgReaction,
      mistakes: falseAlarms,
      hintsUsed: 0,
      xpEarned: xp,
      completed: true,
      details: {
        hits,
        falseAlarms,
        ruleSwitchesAdapted: currentRuleIndex,
      },
    };

    setSummaryData({
      accuracy,
      totalHits: hits,
      falseAlarms,
      avgReactionMs: avgReaction,
      xp,
    });
    setGameState('summary');
    onFinish(session);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 select-none font-child">
      {/* Intro state */}
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <Target className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Focus Academy: Rule Switch
          </h2>
          <p className="text-slate-600 mb-6 text-base leading-relaxed">
            {child.band === 'young_explorers'
              ? 'Watch the shapes pop up! Only tap the target shape. When the chime rings, listen for the new rule!'
              : 'Sustain your attention and resist distracting shapes. Stay alert for dynamic rule switches that test your cognitive flexibility!'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Session Length
              </span>
              <span className="text-lg font-bold text-slate-800">{gameDuration}s</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Rule Switches
              </span>
              <span className="text-lg font-bold text-teal-600">{rules.length - 1} Transitions</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Domain
              </span>
              <span className="text-lg font-bold text-slate-800">Attention & Switch</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-100 transition-colors"
            >
              Back to World
            </button>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg shadow-lg hover:shadow-teal-200 transition-all transform active:scale-95 flex items-center gap-2"
            >
              Begin Session <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && (
        <div className="relative">
          {/* Top HUD */}
          <div className="flex items-center justify-between mb-4 px-5 py-3 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Clock className="w-5 h-5 text-teal-600" />
                <span className="tabular-nums text-lg">{timeLeft}s</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase mr-2">Hits</span>
                <span className="font-extrabold text-teal-600 text-lg tabular-nums">{hits}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase mr-2">Avoided</span>
                <span className="font-bold text-slate-600 tabular-nums">{falseAlarms} errors</span>
              </div>
            </div>

            <button
              onClick={onExit}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Exit
            </button>
          </div>

          {/* Active Rule Banner */}
          <div
            className={`px-6 py-3.5 rounded-2xl mb-4 font-bold text-center transition-all ${
              showSwitchBanner
                ? 'bg-amber-500 text-white shadow-lg animate-bounce'
                : 'bg-teal-50 border border-teal-200 text-teal-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-base md:text-lg">{currentRule.text}</span>
            </div>
          </div>

          {/* Target arena */}
          <div className="relative h-96 w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-inner">
            {/* Subtle grid backdrop */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Stimuli items */}
            {activeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 active:scale-90 transition-transform rounded-2xl backdrop-blur-xs border border-white/20 shadow-lg cursor-pointer flex items-center justify-center"
              >
                <span className="text-3xl md:text-4xl filter drop-shadow-md">{item.icon}</span>
              </button>
            ))}

            {activeItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                Target incoming...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary state */}
      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
            Focus Mission Accomplished!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Excellent selective attention and rule flexibility practice.
          </p>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-4 mb-6 text-center">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                {summaryData.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Avg Reaction</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                {summaryData.avgReactionMs}ms
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">XP Earned</span>
              <span className="text-xl font-black text-amber-500 tabular-nums">
                +{summaryData.xp}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={startGame}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-colors"
            >
              Return to World
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
