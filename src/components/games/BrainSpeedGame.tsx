import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { getSpeedThemeBatch, SpeedThemePack } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Zap, Award, ArrowLeft, ArrowRight, Clock } from 'lucide-react';

interface BrainSpeedGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

const INTRO_PROMPTS = [
  'Sort 20 fast challenges using your eyes, brain speed, and arrow keys!',
  'Beat 20 rapid-fire sorting cards with razor-sharp accuracy!',
  'New rule set unlocked! Classify all 20 items cleanly!',
];

export const BrainSpeedGame: React.FC<BrainSpeedGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [playCount, setPlayCount] = useState(0);
  const [themePack, setThemePack] = useState<SpeedThemePack>(() =>
    getSpeedThemeBatch(child.id, child.band, loginSessionId * 31)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [missedCurrentItem, setMissedCurrentItem] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [itemStartTime, setItemStartTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(120);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAmberAlert, setShowAmberAlert] = useState(false);
  const [amberMessage, setAmberMessage] = useState("So close! Let's try again!");
  const [amberRetryAction, setAmberRetryAction] = useState<'retry_item' | 'restart_game'>('retry_item');
  const [summaryData, setSummaryData] = useState<{
    score: number;
    correctCount: number;
    totalItems: number;
    accuracy: number;
    avgReaction: number;
    duration: number;
    xp: number;
    timedOut: boolean;
  } | null>(null);

  const timeoutFinishRef = useRef<() => void>(() => {});

  const introPrompt = INTRO_PROMPTS[(loginSessionId + playCount) % INTRO_PROMPTS.length];

  const startSession = () => {
    const nextSeed = loginSessionId * 43 + playCount * 23 + (Date.now() % 1000);
    const nextPack = getSpeedThemeBatch(child.id, child.band, nextSeed);
    setThemePack(nextPack);
    setPlayCount((p) => p + 1);
    setCurrentIndex(0);
    setCorrectCount(0);
    setMistakeCount(0);
    setMissedCurrentItem(false);
    setReactionTimes([]);
    setShowAmberAlert(false);
    setTotalTimerSeconds(timerSeconds);
    setRemainingSeconds(timerSeconds);
    const now = Date.now();
    setGameStartTime(now);
    setItemStartTime(now);
    setGameState('playing');
  };

  const handleAdjustRemaining = (delta: number) => {
    setRemainingSeconds((prev) => {
      const next = Math.max(5, Math.min(600, prev + delta));
      setTotalTimerSeconds((t) => Math.max(t, next));
      return next;
    });
  };

  const handleClassify = (choice: 'left' | 'right') => {
    if (showAmberAlert) return;
    const currentItem = themePack.items[currentIndex];
    if (!currentItem) return;

    const reaction = Date.now() - itemStartTime;
    const isCorrect = choice === currentItem.category;

    if (isCorrect) {
      soundEngine.playSuccess();
      setReactionTimes((prev) => [...prev, reaction]);
      setShowConfetti(true);

      const nextCorrect = !missedCurrentItem ? correctCount + 1 : correctCount;
      if (!missedCurrentItem) {
        setCorrectCount(nextCorrect);
      }

      if (currentIndex + 1 < themePack.items.length) {
        setCurrentIndex((i) => i + 1);
        setMissedCurrentItem(false);
        setItemStartTime(Date.now());
      } else {
        finishGame(nextCorrect);
      }
    } else {
      soundEngine.playGentleError();
      setMistakeCount((m) => m + 1);
      setMissedCurrentItem(true);
      setAmberRetryAction('retry_item');
      setAmberMessage(
        mistakeCount % 2 === 0
          ? "You didn't get it this time. Let's try again!"
          : "So close! Check the two categories and try again!"
      );
      setShowAmberAlert(true);
    }
  };

  const handleAmberRetry = () => {
    setShowAmberAlert(false);
    if (amberRetryAction === 'restart_game') {
      startSession();
    } else {
      setItemStartTime(Date.now());
    }
  };

  const finishGame = (finalCorrect: number, timedOut = false) => {
    stopVoice();
    setShowAmberAlert(false);
    const duration = timedOut
      ? totalTimerSeconds
      : Math.max(5, Math.floor((Date.now() - gameStartTime) / 1000));
    const totalItems = Math.max(1, themePack.items.length);
    const accuracy = Math.round((finalCorrect / totalItems) * 100);
    const score = finalCorrect * 10;
    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 600;
    const isFlawless = !timedOut && accuracy === 100 && mistakeCount === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless);

    soundEngine.playFanfare();
    setShowConfetti(true);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'speed_classifier',
      gameTitle: 'Rapid Classifier',
      domain: 'processing_speed',
      focusArea: 'concentration',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: avgReaction,
      mistakes: mistakeCount,
      hintsUsed: 0,
      xpEarned: xp,
      score,
      timedOut,
      completed: true,
      details: {
        themeId: themePack.id,
        themeTitle: themePack.title,
        totalItems,
        correctCount: finalCorrect,
        avgReactionMs: avgReaction,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      correctCount: finalCorrect,
      totalItems,
      accuracy,
      avgReaction,
      duration,
      xp,
      timedOut,
    });
    setGameState('summary');
    onFinish(session);
  };

  timeoutFinishRef.current = () => finishGame(correctCount, true);

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

  useEffect(() => {
    if (gameState !== 'playing' || showAmberAlert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleClassify('left');
      } else if (e.key === 'ArrowRight') {
        handleClassify('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const currentItem = themePack.items[currentIndex];
  const currentQuestionSpeech = currentItem
    ? `${currentItem.display}${currentItem.subtext ? ', ' + currentItem.subtext : ''}. Does it belong to ${themePack.leftLabel} or ${themePack.rightLabel}?`
    : '';

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestionSpeech) return;
    speakChildQuestion(currentQuestionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, currentIndex, currentQuestionSpeech, child.calculatedAge, child.band]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#53b0c9] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#53b0c9] text-black flex items-center justify-center shadow-md">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Brain Speed: Rapid Classifier
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introPrompt}
          </p>

          <div className="bg-[#ffd400]/25 border border-[#ffd400] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Cards
              </span>
              <span className="text-sm font-black text-black">{themePack.items.length} Fresh Items</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Rule Focus
              </span>
              <span className="text-sm font-black text-[#7f27a8]">{themePack.title}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Domain
              </span>
              <span className="text-sm font-black text-black">Concentration</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome to Rapid Classifier, ${child.name}! Sort each of the ${themePack.items.length} cards into ${themePack.leftLabel} or ${themePack.rightLabel} using the buttons or left and right arrow keys before the timer ends!`}
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
              onClick={startSession}
              className="px-8 py-3.5 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Start 20-Item Sort <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentItem && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#53b0c9] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#53b0c9]/30">
            <div>
              <span className="text-xs font-black text-[#7f27a8] uppercase tracking-wider">
                Item {currentIndex + 1} of {themePack.items.length} · {themePack.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <QuestionSpeakerButton
                text={currentQuestionSpeech}
                age={child.calculatedAge}
                band={child.band}
              />
              <GameTimerHud
                remainingSeconds={remainingSeconds}
                totalSeconds={totalTimerSeconds}
                onAdjustSeconds={handleAdjustRemaining}
              />
              <button
                onClick={() => {
                  stopVoice();
                  onExit();
                }}
                className="text-xs font-bold text-black hover:bg-[#ffd400]/30 px-3 py-1 rounded-xl border border-black/20 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          <GameProgressBar
            current={currentIndex}
            total={themePack.items.length}
            unitLabel="items"
            accentBgClass="bg-[#f76400]"
          />

          <div className="bg-[#ffd400]/25 border-2 border-[#ffd400] rounded-3xl p-10 text-center mb-8 flex flex-col items-center justify-center min-h-[210px]">
            <span className="text-4xl md:text-6xl font-black text-black mb-2">
              {currentItem.display}
            </span>
            {currentItem.subtext && (
              <span className="text-sm font-bold text-black/75">{currentItem.subtext}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleClassify('left')}
              className="p-6 rounded-2xl bg-[#53b0c9] hover:bg-[#ffd400] border-2 border-black text-black font-black text-base md:text-lg shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                <ArrowLeft className="w-6 h-6" />
              </div>
              <span>{themePack.leftLabel}</span>
              <span className="text-xs font-bold text-black/80 hidden md:block">
                (Left Arrow Key)
              </span>
            </button>

            <button
              onClick={() => handleClassify('right')}
              className="p-6 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] border-2 border-black text-white font-black text-base md:text-lg shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ffd400] text-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-6 h-6" />
              </div>
              <span>{themePack.rightLabel}</span>
              <span className="text-xs font-bold text-white/90 hidden md:block">
                (Right Arrow Key)
              </span>
            </button>
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
            {summaryData.timedOut ? "Time's Up!" : '20 Items Sorted!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Sorted {summaryData.correctCount} of {summaryData.totalItems} cards accurately.
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

          <div className="flex gap-3 justify-center">
            <button
              onClick={startSession}
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/25 font-black transition-colors cursor-pointer"
            >
              Play New Rule Set
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
        onRetry={handleAmberRetry}
      />
    </div>
  );
};
