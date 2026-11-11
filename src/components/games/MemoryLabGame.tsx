import React, { useState, useEffect } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { Sparkles, RotateCcw, ArrowRight, Brain, Clock, Award } from 'lucide-react';

interface MemoryLabGameProps {
  child: ChildProfile;
  difficulty: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

interface CardItem {
  id: number;
  pairId: number;
  symbol: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_SETS = {
  young_explorers: [
    { symbol: '🦁', label: 'Lion' },
    { symbol: '🐘', label: 'Elephant' },
    { symbol: '🐬', label: 'Dolphin' },
    { symbol: '🐼', label: 'Panda' },
    { symbol: '🐸', label: 'Frog' },
    { symbol: '🦊', label: 'Fox' },
  ],
  senior_explorers: [
    { symbol: '🧭', label: 'Compass' },
    { symbol: '🗺️', label: 'Map' },
    { symbol: '🔭', label: 'Telescope' },
    { symbol: '💎', label: 'Gem' },
    { symbol: '⚓', label: 'Anchor' },
    { symbol: '🏕️', label: 'Camp' },
    { symbol: '🛶', label: 'Canoe' },
    { symbol: '🦜', label: 'Parrot' },
  ],
  discoverers: [
    { symbol: '🔬', label: 'Microscope' },
    { symbol: '🧬', label: 'Helix' },
    { symbol: '🔍', label: 'Magnifier' },
    { symbol: '🧪', label: 'Flask' },
    { symbol: '📐', label: 'Ruler' },
    { symbol: '⚖️', label: 'Scale' },
    { symbol: '🗝️', label: 'Key' },
    { symbol: '📜', label: 'Scroll' },
  ],
  masters: [
    { symbol: '⬡', label: 'Hex Core' },
    { symbol: '◈', label: 'Diamond' },
    { symbol: '▲', label: 'Prism' },
    { symbol: '◎', label: 'Orbital' },
    { symbol: '◬', label: 'Pyramid' },
    { symbol: '⎔', label: 'Node' },
    { symbol: '❂', label: 'Sun Pulse' },
    { symbol: '⯁', label: 'Matrix' },
  ],
};

export const MemoryLabGame: React.FC<MemoryLabGameProps> = ({
  child,
  difficulty,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    accuracy: number;
    duration: number;
    xp: number;
    isFlawless: boolean;
  } | null>(null);

  // Determine pair count based on band & difficulty
  const getPairCount = () => {
    if (child.band === 'young_explorers') return 3; // 6 cards total
    if (child.band === 'senior_explorers') return difficulty >= 3 ? 6 : 4; // 8-12 cards
    if (child.band === 'discoverers') return difficulty >= 3 ? 8 : 6; // 12-16 cards
    return 8; // Masters: 16 cards
  };

  const initGame = () => {
    const pairCount = getPairCount();
    const set = EMOJI_SETS[child.band] || EMOJI_SETS.senior_explorers;
    const selectedPairs = set.slice(0, pairCount);

    const deck: CardItem[] = [];
    selectedPairs.forEach((item, index) => {
      // First card
      deck.push({
        id: index * 2,
        pairId: index,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
      // Second card
      deck.push({
        id: index * 2 + 1,
        pairId: index,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMistakes(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setGameState('playing');
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  const handleCardClick = (cardId: number) => {
    if (isProcessing) return;
    const clickedCard = cards.find((c) => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    soundEngine.playPop();

    // Flip card
    const updatedCards = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsProcessing(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          soundEngine.playSuccess();
          const matchedDeck = updatedCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setCards(matchedDeck);
          setFlippedCards([]);
          setIsProcessing(false);

          // Check if all matched
          if (matchedDeck.every((c) => c.isMatched)) {
            finishGame(matchedDeck);
          }
        }, 400);
      } else {
        // Mismatch
        setMistakes((prev) => prev + 1);
        setTimeout(() => {
          soundEngine.playGentleError();
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const finishGame = (finalCards: CardItem[]) => {
    const duration = Math.max(10, Math.floor((Date.now() - startTime) / 1000));
    const pairCount = finalCards.length / 2;
    // Accuracy based on moves vs optimal moves
    const minMovesNeeded = pairCount;
    const extraMoves = Math.max(0, moves + 1 - minMovesNeeded);
    const accuracy = Math.max(40, Math.round(100 - extraMoves * 7));
    const isFlawless = mistakes === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless);

    soundEngine.playFanfare();

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'memory_pairs',
      gameTitle: 'Picture Pairs & Sequence',
      domain: 'memory',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / Math.max(1, moves)),
      mistakes,
      hintsUsed: 0,
      xpEarned: xp,
      completed: true,
      details: {
        totalPairs: pairCount,
        movesCompleted: moves + 1,
      },
    };

    setSummaryData({ accuracy, duration, xp, isFlawless });
    setGameState('summary');
    onFinish(session);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 select-none font-child">
      {/* Intro state */}
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <Brain className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Memory Lab: Picture Pairs
          </h2>
          <p className="text-slate-600 mb-6 text-base leading-relaxed">
            {child.band === 'young_explorers'
              ? 'Find the matching animal friends! Tap a card to flip it over, then find its partner.'
              : 'Test your spatial recall. Flip cards to reveal hidden symbols and pair them together in minimal moves.'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Target Pairs
              </span>
              <span className="text-lg font-bold text-slate-800">{getPairCount()} Pairs</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Challenge Tier
              </span>
              <span className="text-lg font-bold text-violet-600">Level {difficulty}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Domain
              </span>
              <span className="text-lg font-bold text-slate-800">Visual Memory</span>
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
              onClick={initGame}
              className="px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-lg shadow-lg hover:shadow-violet-200 transition-all transform active:scale-95 flex items-center gap-2"
            >
              Start Playing <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && (
        <div>
          {/* Top HUD */}
          <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5 text-violet-600" />
                <span className="font-bold text-base tabular-nums">
                  {Math.floor(elapsedSeconds / 60)}:
                  {(elapsedSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="text-slate-600">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 mr-2">
                  Moves
                </span>
                <span className="font-bold text-base tabular-nums text-slate-800">{moves}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={initGame}
                title="Restart"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Exit Game
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            className={`grid gap-3 md:gap-4 mx-auto max-w-2xl ${
              cards.length <= 6
                ? 'grid-cols-3 max-w-md'
                : cards.length <= 12
                ? 'grid-cols-3 sm:grid-cols-4'
                : 'grid-cols-4 sm:grid-cols-4'
            }`}
          >
            {cards.map((card) => {
              const showFace = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || card.isFlipped || isProcessing}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all duration-300 transform active:scale-95 shadow-sm border ${
                    showFace
                      ? card.isMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400'
                        : 'bg-violet-50 border-violet-300 text-violet-900 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-violet-300 shadow-sm cursor-pointer'
                  }`}
                >
                  {showFace ? (
                    <>
                      <span className="text-3xl md:text-5xl mb-1 select-none">{card.symbol}</span>
                      <span className="text-xs md:text-sm font-bold truncate max-w-full">
                        {card.label}
                      </span>
                    </>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-violet-100/70 text-violet-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary state */}
      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center max-w-md mx-auto animate-in fade-in zoom-in duration-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
            Challenge Completed!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Great memory practice! Your recall and accuracy are building up.
          </p>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-4 mb-6 text-center">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                {summaryData.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Time</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                {summaryData.duration}s
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">XP Earned</span>
              <span className="text-xl font-black text-amber-500 tabular-nums">
                +{summaryData.xp}
              </span>
            </div>
          </div>

          {summaryData.isFlawless && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Flawless Memory Match! Zero Mismatches!
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={initGame}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-md transition-colors"
            >
              Return to World
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
