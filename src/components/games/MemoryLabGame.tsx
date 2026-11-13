import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp, getAgeBasedCardConfig } from '../../utils/engine';
import { getMemoryPairsBatch } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Sparkles, RotateCcw, ArrowRight, Brain, Clock, Award } from 'lucide-react';

interface MemoryLabGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
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

const INTRO_PROMPTS = [
  'Flip cards to reveal hidden symbols and pair them in minimal moves!',
  'A fresh shuffled deck awaits! Spot every matching pair across the board!',
  'Train sharp visual memory with a brand-new deck on every run!',
];

export const MemoryLabGame: React.FC<MemoryLabGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [playCount, setPlayCount] = useState(0);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(120);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    score: number;
    matchedPairs: number;
    totalPairs: number;
    accuracy: number;
    duration: number;
    xp: number;
    isFlawless: boolean;
    timedOut: boolean;
  } | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showAmberAlert, setShowAmberAlert] = useState(false);
  const [amberMessage, setAmberMessage] = useState("So close! Let's try again and beat that score!");

  const timeoutFinishRef = useRef<() => void>(() => {});

  const ageConfig = getAgeBasedCardConfig(child.calculatedAge, difficulty);
  const pairCount = Math.min(10, Math.max(3, ageConfig.pairCount));
  const introPrompt = INTRO_PROMPTS[(loginSessionId + playCount) % INTRO_PROMPTS.length];
  const matchedPairCount = Math.floor(cards.filter((c) => c.isMatched).length / 2);
  const memoryMissionSpeech = `Flip two cards at a time to match all ${pairCount} hidden pairs!`;

  useEffect(() => {
    if (gameState !== 'playing') return;
    speakChildQuestion(memoryMissionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, playCount, memoryMissionSpeech, child.calculatedAge, child.band]);

  const initGame = () => {
    const nextSeed = loginSessionId * 41 + playCount * 29 + (Date.now() % 1000);
    const selectedPairs = getMemoryPairsBatch(child.id, child.band, pairCount, nextSeed);
    setPlayCount((p) => p + 1);

    const deck: CardItem[] = [];
    selectedPairs.forEach((item, index) => {
      deck.push({
        id: index * 2,
        pairId: index,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: index * 2 + 1,
        pairId: index,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMistakes(0);
    setShowAmberAlert(false);
    setTotalTimerSeconds(timerSeconds);
    setRemainingSeconds(timerSeconds);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const handleAdjustRemaining = (delta: number) => {
    setRemainingSeconds((prev) => {
      const next = Math.max(5, Math.min(600, prev + delta));
      setTotalTimerSeconds((t) => Math.max(t, next));
      return next;
    });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => timeoutFinishRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleCardClick = (cardId: number) => {
    if (isProcessing || showAmberAlert) return;
    const clickedCard = cards.find((c) => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    soundEngine.playPop();

    const updatedCards = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      setIsProcessing(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        setTimeout(() => {
          soundEngine.playSuccess();
          setShowConfetti(true);
          const matchedDeck = updatedCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setCards(matchedDeck);
          setFlippedCards([]);
          setIsProcessing(false);

          if (matchedDeck.every((c) => c.isMatched)) {
            finishGame(matchedDeck, nextMoves, mistakes);
          }
        }, 350);
      } else {
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);
        setTimeout(() => {
          soundEngine.playGentleError();
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);

          if (nextMistakes > pairCount * 2) {
            setAmberMessage("You didn't get it this time. Let's focus and try a fresh round!");
            setShowAmberAlert(true);
          }
        }, 750);
      }
    }
  };

  const finishGame = (
    finalCards: CardItem[],
    totalMoves: number,
    totalMistakes: number,
    timedOut = false
  ) => {
    stopVoice();
    setShowAmberAlert(false);
    const duration = timedOut
      ? totalTimerSeconds
      : Math.max(5, Math.floor((Date.now() - startTime) / 1000));
    const totalPairs = Math.max(1, finalCards.length / 2);
    const matchedPairs = Math.floor(finalCards.filter((c) => c.isMatched).length / 2);
    const minMovesNeeded = totalPairs;
    const extraMoves = Math.max(0, totalMoves - minMovesNeeded);
    const accuracy = timedOut
      ? Math.round((matchedPairs / totalPairs) * 100)
      : Math.max(40, Math.round(100 - extraMoves * 7));
    const score = matchedPairs * 20;
    const isFlawless = !timedOut && totalMistakes === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 15;

    soundEngine.playFanfare();

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'memory_pairs',
      gameTitle: 'Picture Pairs & Sequence',
      domain: 'memory',
      focusArea: 'mental_abilities',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / Math.max(1, totalMoves)),
      mistakes: totalMistakes,
      hintsUsed: 0,
      xpEarned: xp,
      score,
      timedOut,
      completed: true,
      details: {
        totalPairs,
        matchedPairs,
        movesCompleted: totalMoves,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      matchedPairs,
      totalPairs,
      accuracy,
      duration,
      xp,
      isFlawless,
      timedOut,
    });
    if (!timedOut && accuracy < 60) {
      setAmberMessage("So close! Let's try again and beat that accuracy score!");
      setShowAmberAlert(true);
    } else {
      setShowConfetti(true);
    }
    setGameState('summary');
    onFinish(session);
  };

  timeoutFinishRef.current = () => finishGame(cards, moves, mistakes, true);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#7f27a8] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#7f27a8] text-white flex items-center justify-center shadow-md">
            <Brain className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Memory Lab: Picture Pairs
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introPrompt}
          </p>

          <div className="bg-[#ffd400]/25 border border-[#ffd400] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Deck Size
              </span>
              <span className="text-sm font-black text-black">
                {pairCount * 2} Cards ({pairCount} Pairs)
              </span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Age Tier
              </span>
              <span className="text-sm font-black text-[#7f27a8]">
                Age {ageConfig.age} · Lv.{difficulty}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Domain
              </span>
              <span className="text-sm font-black text-black">Visual Memory</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome to Memory Lab, ${child.name}! Flip two cards each turn to uncover matching picture pairs. Clear all ${pairCount} pairs with the fewest moves before the timer runs out!`}
            age={child.calculatedAge}
            band={child.band}
          />

          <GameTimerSetup seconds={timerSeconds} onChangeSeconds={setTimerSeconds} />

          <div className="flex gap-4 justify-center">
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl border-2 border-black text-black font-bold hover:bg-[#ffd400]/20 transition-colors cursor-pointer"
            >
              Back to World
            </button>
            <button
              onClick={initGame}
              className="px-8 py-3.5 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Start Playing <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-[#7f27a8] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#7f27a8]/20">
            <div className="flex items-center gap-4 flex-wrap">
              <GameTimerHud
                remainingSeconds={remainingSeconds}
                totalSeconds={totalTimerSeconds}
                onAdjustSeconds={handleAdjustRemaining}
              />
              <div className="text-black">
                <span className="text-xs uppercase tracking-wider font-bold text-black/70 mr-2">
                  Moves
                </span>
                <span className="font-black text-base tabular-nums">{moves}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <QuestionSpeakerButton
                text={memoryMissionSpeech}
                age={child.calculatedAge}
                band={child.band}
                label="Hear Mission"
              />
              <button
                onClick={initGame}
                title="Draw Fresh Deck"
                className="p-2 text-black hover:bg-[#ffd400]/30 rounded-xl border border-black/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  stopVoice();
                  onExit();
                }}
                className="px-4 py-1.5 text-xs font-bold text-black hover:bg-[#ffd400]/30 rounded-xl border border-black/20 transition-colors cursor-pointer"
              >
                Exit Game
              </button>
            </div>
          </div>

          <GameProgressBar
            current={matchedPairCount}
            total={pairCount}
            unitLabel="pairs"
            accentBgClass="bg-[#7f27a8]"
          />

          <div
            className={`grid gap-3 md:gap-4 mx-auto max-w-2xl ${
              cards.length <= 6
                ? 'grid-cols-3 max-w-md'
                : cards.length <= 12
                ? 'grid-cols-3 sm:grid-cols-4'
                : 'grid-cols-4 sm:grid-cols-5'
            }`}
          >
            {cards.map((card) => {
              const showFace = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || card.isFlipped || isProcessing}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2.5 text-center transition-all duration-300 transform active:scale-95 shadow-sm border-2 ${
                    showFace
                      ? card.isMatched
                        ? 'bg-[#ffd400] border-[#f76400] text-black ring-2 ring-[#f76400]'
                        : 'bg-[#53b0c9]/25 border-[#53b0c9] text-black shadow-md'
                      : 'bg-white hover:bg-[#e885cf]/20 border-[#7f27a8] shadow-sm cursor-pointer'
                  }`}
                >
                  {showFace ? (
                    <>
                      <span className="text-3xl md:text-5xl mb-1 select-none">{card.symbol}</span>
                      <span className="text-xs md:text-sm font-black truncate max-w-full text-black">
                        {card.label}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-[#7f27a8] w-full h-full rounded-xl p-1.5 text-center border-2 border-[#ffd400]">
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd400] mb-0.5" />
                      <span className="text-[10px] sm:text-xs font-black text-white leading-tight">
                        Who or What
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#7f27a8] shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[#ffd400] text-black flex items-center justify-center shadow-inner">
            {summaryData.timedOut ? <Clock className="w-10 h-10" /> : <Award className="w-10 h-10" />}
          </div>

          {summaryData.timedOut && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c1008f] text-white text-xs font-black uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" /> Time&apos;s Up! Final Score
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-black mb-1">
            {summaryData.timedOut ? "Time's Up!" : 'Memory Deck Cleared!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Matched {summaryData.matchedPairs} of {summaryData.totalPairs} hidden pairs.
          </p>

          <div className="bg-[#ffd400] border-2 border-black rounded-2xl p-4 mb-4">
            <span className="text-xs font-black text-black uppercase tracking-wider block">
              Final Score
            </span>
            <span className="text-3xl font-black text-black tabular-nums">
              {summaryData.score} pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#53b0c9]/20 border border-[#53b0c9] rounded-2xl p-4 mb-6 text-center">
            <div>
              <span className="text-xs font-bold text-black/70 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-black tabular-nums">
                {summaryData.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-black/70 block uppercase">Time</span>
              <span className="text-xl font-black text-black tabular-nums">
                {formatTimerClock(summaryData.duration)}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-black/70 block uppercase">XP Earned</span>
              <span className="text-xl font-black text-[#f76400] tabular-nums">
                +{summaryData.xp}
              </span>
            </div>
          </div>

          {summaryData.isFlawless && (
            <div className="mb-6 p-3 bg-[#ffd400]/30 border-2 border-[#ffd400] rounded-xl text-black text-xs font-black flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f76400]" />
              Flawless Memory Match! Zero Mismatches!
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={initGame}
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/25 font-black transition-colors cursor-pointer"
            >
              Play New Card Set
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black shadow-md transition-colors cursor-pointer"
            >
              Return to World
            </button>
          </div>
        </div>
      )}

      <ConfettiOverlay show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AmberFailureAlert
        isOpen={showAmberAlert}
        customMessage={amberMessage}
        onRetry={() => {
          setShowAmberAlert(false);
          initGame();
        }}
      />
    </div>
  );
};
