import React, { useState, useEffect } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { Zap, Clock, Award, ArrowLeft, ArrowRight } from 'lucide-react';

interface BrainSpeedGameProps {
  child: ChildProfile;
  difficulty: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

interface StimulusItem {
  display: string;
  subtext?: string;
  category: 'left' | 'right';
}

const CATEGORY_CONFIGS = {
  young_explorers: {
    title: 'Animal or Vehicle?',
    leftLabel: 'Animal 🐾',
    rightLabel: 'Vehicle 🚗',
    items: [
      { display: '🐶 Dog', category: 'left' },
      { display: '🚗 Car', category: 'right' },
      { display: '🐱 Cat', category: 'left' },
      { display: '✈️ Airplane', category: 'right' },
      { display: '🐰 Rabbit', category: 'left' },
      { display: '🚲 Bicycle', category: 'right' },
      { display: '🦁 Lion', category: 'left' },
      { display: '🚂 Train', category: 'right' },
      { display: '🐼 Panda', category: 'left' },
      { display: '🚀 Rocket', category: 'right' },
    ] as StimulusItem[],
  },
  senior_explorers: {
    title: 'Odd or Even Number?',
    leftLabel: 'Odd Number (1, 3, 5)',
    rightLabel: 'Even Number (2, 4, 6)',
    items: [
      { display: '17', category: 'left' },
      { display: '24', category: 'right' },
      { display: '9', category: 'left' },
      { display: '38', category: 'right' },
      { display: '51', category: 'left' },
      { display: '42', category: 'right' },
      { display: '73', category: 'left' },
      { display: '88', category: 'right' },
      { display: '65', category: 'left' },
      { display: '100', category: 'right' },
    ] as StimulusItem[],
  },
  discoverers: {
    title: 'Value Comparison: Less or Greater than 50?',
    leftLabel: '< 50 (Under)',
    rightLabel: '> 50 (Over)',
    items: [
      { display: '6 × 7', subtext: '= 42', category: 'left' },
      { display: '8 × 7', subtext: '= 56', category: 'right' },
      { display: '9 × 5', subtext: '= 45', category: 'left' },
      { display: '12 × 5', subtext: '= 60', category: 'right' },
      { display: '15 + 28', subtext: '= 43', category: 'left' },
      { display: '34 + 29', subtext: '= 63', category: 'right' },
      { display: '70 - 24', subtext: '= 46', category: 'left' },
      { display: '90 - 32', subtext: '= 58', category: 'right' },
    ] as StimulusItem[],
  },
  masters: {
    title: 'Mental Arithmetic & Classification',
    leftLabel: 'Prime Number',
    rightLabel: 'Composite Number',
    items: [
      { display: '19', category: 'left' },
      { display: '21', category: 'right' },
      { display: '31', category: 'left' },
      { display: '27', category: 'right' },
      { display: '47', category: 'left' },
      { display: '49', category: 'right' },
      { display: '53', category: 'left' },
      { display: '57', category: 'right' },
    ] as StimulusItem[],
  },
};

export const BrainSpeedGame: React.FC<BrainSpeedGameProps> = ({
  child,
  difficulty,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [deck, setDeck] = useState<StimulusItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [itemStartTime, setItemStartTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [summaryData, setSummaryData] = useState<{
    accuracy: number;
    avgReaction: number;
    duration: number;
    xp: number;
  } | null>(null);

  const config = CATEGORY_CONFIGS[child.band] || CATEGORY_CONFIGS.senior_explorers;

  const startSession = () => {
    // Shuffle items
    const shuffled = [...config.items].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setCorrectCount(0);
    setMistakeCount(0);
    setReactionTimes([]);
    const now = Date.now();
    setGameStartTime(now);
    setItemStartTime(now);
    setGameState('playing');
  };

  const handleClassify = (choice: 'left' | 'right') => {
    const currentItem = deck[currentIndex];
    if (!currentItem) return;

    const reaction = Date.now() - itemStartTime;
    setReactionTimes((prev) => [...prev, reaction]);

    const isCorrect = choice === currentItem.category;
    if (isCorrect) {
      soundEngine.playSuccess();
      setCorrectCount((c) => c + 1);
    } else {
      soundEngine.playGentleError();
      setMistakeCount((m) => m + 1);
    }

    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((i) => i + 1);
      setItemStartTime(Date.now());
    } else {
      finishGame(isCorrect ? correctCount + 1 : correctCount);
    }
  };

  const finishGame = (finalCorrect: number) => {
    const duration = Math.max(5, Math.floor((Date.now() - gameStartTime) / 1000));
    const totalItems = deck.length;
    const accuracy = Math.round((finalCorrect / totalItems) * 100);
    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 600;
    const isFlawless = accuracy === 100;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless);

    soundEngine.playFanfare();

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'speed_classifier',
      gameTitle: 'Rapid Classifier',
      domain: 'processing_speed',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: avgReaction,
      mistakes: totalItems - finalCorrect,
      hintsUsed: 0,
      xpEarned: xp,
      completed: true,
      details: {
        totalItems,
        correctCount: finalCorrect,
        avgReactionMs: avgReaction,
      },
    };

    setSummaryData({ accuracy, avgReaction, duration, xp });
    setGameState('summary');
    onFinish(session);
  };

  // Keyboard arrow listener
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleClassify('left');
      } else if (e.key === 'ArrowRight') {
        handleClassify('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentIndex, deck, itemStartTime]);

  const currentItem = deck[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 select-none font-child">
      {/* Intro state */}
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Brain Speed: Rapid Classifier
          </h2>
          <p className="text-slate-600 mb-6 text-base leading-relaxed">
            Quick visual recognition and classification. Practice responding smoothly and
            accurately under comfortable timing. Accuracy always comes first!
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Cards
              </span>
              <span className="text-lg font-bold text-slate-800">{config.items.length} Items</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Rule Focus
              </span>
              <span className="text-lg font-bold text-cyan-600">{config.title}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Domain
              </span>
              <span className="text-lg font-bold text-slate-800">Processing Speed</span>
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
              onClick={startSession}
              className="px-8 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-lg shadow-lg hover:shadow-cyan-200 transition-all transform active:scale-95 flex items-center gap-2"
            >
              Start Sorting <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && currentItem && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 px-4 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
              Item {currentIndex + 1} of {deck.length}
            </span>
            <button
              onClick={onExit}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1 rounded-lg"
            >
              Exit
            </button>
          </div>

          {/* Central Target Card */}
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-lg text-center mb-8 flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-2">
              {currentItem.display}
            </span>
            {currentItem.subtext && (
              <span className="text-sm font-semibold text-slate-400">{currentItem.subtext}</span>
            )}
          </div>

          {/* Classification Choice Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleClassify('left')}
              className="p-6 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-900 font-extrabold text-base md:text-lg shadow-sm hover:shadow transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                <ArrowLeft className="w-6 h-6" />
              </div>
              <span>{config.leftLabel}</span>
              <span className="text-xs font-medium text-sky-600 hidden md:block">
                (Press Left Arrow)
              </span>
            </button>

            <button
              onClick={() => handleClassify('right')}
              className="p-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 font-extrabold text-base md:text-lg shadow-sm hover:shadow transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-6 h-6" />
              </div>
              <span>{config.rightLabel}</span>
              <span className="text-xs font-medium text-indigo-600 hidden md:block">
                (Press Right Arrow)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Summary state */}
      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
            Speed Round Completed!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Efficient categorization practice completed with balanced accuracy.
          </p>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-4 mb-6 text-center">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                {summaryData.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Response</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                {summaryData.avgReaction}ms
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
              onClick={startSession}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md transition-colors"
            >
              Return to World
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
