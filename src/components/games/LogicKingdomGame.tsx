import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { getLogicBatch, LogicPuzzle } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Puzzle, HelpCircle, ArrowRight, Award, Clock } from 'lucide-react';

interface LogicKingdomGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

const INTRO_PROMPTS = [
  'Analyze 20 fresh pattern sequences and crack the missing rule!',
  'Test your deductive logic across 20 brand-new kingdom mysteries!',
  'Ready to solve 20 unique logic progressions today?',
];

export const LogicKingdomGame: React.FC<LogicKingdomGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [puzzles, setPuzzles] = useState<LogicPuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [missedCurrentQuestion, setMissedCurrentQuestion] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(180);
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAmberAlert, setShowAmberAlert] = useState(false);
  const [amberMessage, setAmberMessage] = useState("You didn't get it this time. Let's try again!");
  const [summaryData, setSummaryData] = useState<{
    score: number;
    correctCount: number;
    totalPuzzles: number;
    accuracy: number;
    duration: number;
    xp: number;
    timedOut: boolean;
  } | null>(null);

  const finishGameRef = useRef<(timedOut?: boolean) => void>(() => {});

  const currentPuzzle = puzzles[currentIndex];
  const introPrompt = INTRO_PROMPTS[(loginSessionId + playCount) % INTRO_PROMPTS.length];
  const currentQuestionSpeech = currentPuzzle
    ? `${currentPuzzle.question}. Pattern: ${currentPuzzle.sequence
        .map((s) => (s === '?' ? 'mystery blank' : s))
        .join(', ')}`
    : '';

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestionSpeech) return;
    speakChildQuestion(currentQuestionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, currentIndex, currentQuestionSpeech, child.calculatedAge, child.band]);

  const startPuzzleRound = () => {
    const seed = loginSessionId * 43 + playCount * 29 + (Date.now() % 1000);
    const list = getLogicBatch(child.id, child.band, 20, seed);
    setPuzzles(list);
    setPlayCount((p) => p + 1);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setHintsUsedCount(0);
    setCorrectCount(0);
    setMistakes(0);
    setMissedCurrentQuestion(false);
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

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || !currentPuzzle) return;
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentPuzzle.correctIndex;
    if (isCorrect) {
      soundEngine.playSuccess();
      setIsAnswered(true);
      setShowConfetti(true);
      if (!missedCurrentQuestion) {
        setCorrectCount((prev) => prev + 1);
      }
    } else {
      soundEngine.playGentleError();
      setMistakes((m) => m + 1);
      setMissedCurrentQuestion(true);
      setAmberMessage(
        mistakes % 2 === 0
          ? "So close! Look closely at the pattern and let's try again!"
          : "You didn't get it this time. Let's try again!"
      );
      setShowAmberAlert(true);
    }
  };

  const handleNextPuzzle = () => {
    if (currentIndex + 1 < puzzles.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
      setMissedCurrentQuestion(false);
    } else {
      finishGame();
    }
  };

  const finishGame = (timedOut = false) => {
    stopVoice();
    setShowAmberAlert(false);
    const duration = timedOut
      ? totalTimerSeconds
      : Math.max(5, Math.floor((Date.now() - startTime) / 1000));
    const totalPuzzles = Math.max(1, puzzles.length);
    const accuracy = Math.round((correctCount / totalPuzzles) * 100);
    const score = correctCount * 10;
    const isFlawless = !timedOut && accuracy === 100 && hintsUsedCount === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 25;

    soundEngine.playFanfare();
    setShowConfetti(true);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'logic_patterns',
      gameTitle: 'Pattern Detective',
      domain: 'reasoning',
      focusArea: 'mental_abilities',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / totalPuzzles),
      mistakes,
      hintsUsed: hintsUsedCount,
      xpEarned: xp,
      score,
      timedOut,
      completed: true,
      details: {
        totalPuzzles,
        correctAnswers: correctCount,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      correctCount,
      totalPuzzles,
      accuracy,
      duration,
      xp,
      timedOut,
    });
    setGameState('summary');
    onFinish(session);
  };

  finishGameRef.current = finishGame;

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => finishGameRef.current(true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#f76400] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#ffd400] text-black flex items-center justify-center shadow-md">
            <Puzzle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Logic Kingdom: Pattern Detective
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introPrompt}
          </p>

          <div className="bg-[#ffd400]/25 border border-[#ffd400] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Puzzles
              </span>
              <span className="text-lg font-black text-black">20 Fresh Challenges</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Tier
              </span>
              <span className="text-lg font-black text-[#f76400]">Level {difficulty}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Domain
              </span>
              <span className="text-lg font-black text-black">Deductive Logic</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome to Logic Kingdom, ${child.name}! Spot the secret rule behind each pattern sequence and select the piece that belongs in the mystery blank. Solve all 20 puzzles before time runs out!`}
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
              onClick={startPuzzleRound}
              className="px-8 py-3.5 rounded-2xl bg-[#f76400] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              Start 20-Puzzle Quest <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentPuzzle && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#f76400] shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#ffd400]">
            <div>
              <span className="text-xs font-black text-[#f76400] uppercase tracking-wider">
                Puzzle {currentIndex + 1} of {puzzles.length}
              </span>
              <h3 className="text-lg md:text-xl font-black text-black mt-1">
                {currentPuzzle.question}
              </h3>
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
                className="px-3 py-1.5 text-xs font-bold text-black rounded-xl border border-black/20 hover:bg-[#ffd400]/30 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          <GameProgressBar
            current={currentIndex + (isAnswered ? 1 : 0)}
            total={puzzles.length}
            unitLabel="puzzles"
            accentBgClass="bg-[#f76400]"
          />

          <div className="p-6 bg-[#53b0c9]/20 rounded-2xl border-2 border-[#53b0c9] mb-8 flex items-center justify-center gap-3 md:gap-5 flex-wrap">
            {currentPuzzle.sequence.map((item, idx) => (
              <div
                key={idx}
                className={`min-w-14 h-14 md:min-w-16 md:h-16 px-3 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-sm ${
                  item === '?'
                    ? 'bg-[#ffd400] text-black border-2 border-dashed border-[#f76400] animate-pulse'
                    : 'bg-white text-black border-2 border-[#7f27a8]/30'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {!showHint && !isAnswered && (
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  setShowHint(true);
                  setHintsUsedCount((h) => h + 1);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7f27a8] hover:text-[#c1008f] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" /> Need a clue?
              </button>
            </div>
          )}

          {showHint && (
            <div className="mb-6 p-3 bg-[#ffd400]/30 border-2 border-[#ffd400] rounded-xl text-xs font-bold text-black text-center">
              💡 Hint: {currentPuzzle.hint}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {currentPuzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentPuzzle.correctIndex;

              let btnClasses =
                'p-4 rounded-2xl border-2 text-center font-black text-lg md:text-xl transition-all ';
              if (!isAnswered) {
                btnClasses +=
                  'bg-white hover:bg-[#ffd400]/30 border-[#f76400]/40 hover:border-[#f76400] text-black shadow-sm cursor-pointer active:scale-95';
              } else if (isCorrectOpt) {
                btnClasses +=
                  'bg-[#ffd400] border-[#f76400] text-black ring-2 ring-[#f76400]';
              } else if (isSelected && !isCorrectOpt) {
                btnClasses += 'bg-[#c1008f] border-[#c1008f] text-white';
              } else {
                btnClasses += 'bg-white border-black/15 text-black/40';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={btnClasses}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 pt-6 border-t border-[#ffd400] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-black leading-relaxed text-center md:text-left">
                {currentPuzzle.explanation}
              </p>
              <button
                onClick={handleNextPuzzle}
                className="px-6 py-3 rounded-xl bg-[#f76400] hover:bg-[#c1008f] text-white font-black shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {currentIndex + 1 === puzzles.length ? 'See Results' : 'Next Puzzle'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#f76400] shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[#ffd400] text-black flex items-center justify-center shadow-inner">
            {summaryData.timedOut ? <Clock className="w-10 h-10" /> : <Award className="w-10 h-10" />}
          </div>

          {summaryData.timedOut && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c1008f] text-white text-xs font-black uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" /> Time&apos;s Up! Final Score
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-black mb-1">
            {summaryData.timedOut ? "Time's Up!" : '20 Logic Puzzles Solved!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Solved {summaryData.correctCount} of {summaryData.totalPuzzles} logic patterns.
          </p>

          <div className="bg-[#ffd400] border-2 border-black rounded-2xl p-4 mb-4">
            <span className="text-xs font-black text-black uppercase tracking-wider block">
              Final Score
            </span>
            <span className="text-3xl font-black text-black tabular-nums">
              {summaryData.score} pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#ffd400]/20 border border-[#ffd400] rounded-2xl p-4 mb-6 text-center">
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
              onClick={startPuzzleRound}
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/25 font-black transition-colors cursor-pointer"
            >
              Play 20 New Puzzles
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-[#f76400] hover:bg-[#c1008f] text-white font-black shadow-md transition-colors cursor-pointer"
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
          setSelectedOption(null);
        }}
      />
    </div>
  );
};
