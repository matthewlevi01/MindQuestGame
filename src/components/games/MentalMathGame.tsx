import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { getMentalMathBatch, MathQuestion } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Calculator, Award, ArrowRight, HelpCircle, Clock } from 'lucide-react';

interface MentalMathGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

const INTRO_PROMPTS = [
  'Count, calculate, and crack 20 fresh mental math challenges!',
  'Sharpen your number agility across 20 brand-new math puzzles!',
  'Ready for a fresh set of 20 mental arithmetic riddles?',
];

export const MentalMathGame: React.FC<MentalMathGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [problems, setProblems] = useState<MathQuestion[]>([]);
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
    totalProblems: number;
    accuracy: number;
    duration: number;
    xp: number;
    timedOut: boolean;
  } | null>(null);

  const finishGameRef = useRef<(timedOut?: boolean) => void>(() => {});

  const introSubtitle =
    INTRO_PROMPTS[(loginSessionId + playCount) % INTRO_PROMPTS.length];

  const startRound = () => {
    const nextSeed = loginSessionId * 37 + playCount * 19 + (Date.now() % 1000);
    const list = getMentalMathBatch(child.id, child.band, 20, nextSeed);
    setProblems(list);
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

  const currentProblem = problems[currentIndex];
  const currentQuestionSpeech = currentProblem
    ? `${currentProblem.prompt}${currentProblem.subPrompt ? '. ' + currentProblem.subPrompt : ''}`
    : '';

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestionSpeech) return;
    speakChildQuestion(currentQuestionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, currentIndex, currentQuestionSpeech, child.calculatedAge, child.band]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentProblem) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentProblem.correctIndex;
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
          ? "You didn't get it this time. Let's try again!"
          : "So close! Let's try again!"
      );
      setShowAmberAlert(true);
    }
  };

  const handleAmberRetry = () => {
    setShowAmberAlert(false);
    setSelectedOption(null);
  };

  const handleNext = () => {
    if (currentIndex + 1 < problems.length) {
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
    const total = Math.max(1, problems.length);
    const accuracy = Math.round((correctCount / total) * 100);
    const score = correctCount * 10;
    const isFlawless = !timedOut && accuracy === 100 && hintsUsedCount === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 25;

    soundEngine.playFanfare();
    setShowConfetti(true);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'mental_math',
      gameTitle: 'Mental Math Challenge',
      domain: 'mental_math',
      focusArea: 'mental_abilities',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / total),
      mistakes,
      hintsUsed: hintsUsedCount,
      xpEarned: xp,
      score,
      timedOut,
      completed: true,
      details: {
        totalProblems: total,
        correctAnswers: correctCount,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      correctCount,
      totalProblems: total,
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
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#53b0c9] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#53b0c9] text-black flex items-center justify-center shadow-md">
            <Calculator className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Mental Math Arena
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introSubtitle}
          </p>

          <div className="bg-[#ffd400]/25 border border-[#ffd400] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Category
              </span>
              <span className="text-sm font-black text-black">Mental Abilities</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Questions
              </span>
              <span className="text-sm font-black text-[#7f27a8]">20 Fresh Problems</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Level
              </span>
              <span className="text-sm font-black text-black">Tier {difficulty}</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome ${child.name}! Pick the right answer for each of the 20 mental math problems before your timer runs out. Tap "Need a clue?" whenever you want a helpful tip!`}
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
              onClick={startRound}
              className="px-8 py-3.5 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Start 20-Question Quest <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentProblem && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#53b0c9] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#53b0c9]/30">
            <div>
              <span className="text-xs font-black text-[#7f27a8] uppercase tracking-wider">
                Math Problem {currentIndex + 1} of {problems.length}
              </span>
              <h3 className="text-xl font-black text-black mt-0.5">
                {currentProblem.prompt}
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
                className="text-xs font-bold text-black hover:bg-[#ffd400]/30 px-3 py-1.5 rounded-xl border border-black/20 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          <GameProgressBar
            current={currentIndex + (isAnswered ? 1 : 0)}
            total={problems.length}
            unitLabel="questions"
            accentBgClass="bg-[#f76400]"
          />

          <div className="bg-[#53b0c9]/20 border-2 border-[#53b0c9] rounded-3xl p-8 mb-6 text-center">
            {currentProblem.visualEmoji && (
              <div className="text-4xl md:text-5xl mb-3 tracking-widest filter drop-shadow">
                {currentProblem.visualEmoji}
              </div>
            )}
            {currentProblem.subPrompt && (
              <p className="text-base md:text-lg font-extrabold text-black">
                {currentProblem.subPrompt}
              </p>
            )}
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
              💡 Hint: {currentProblem.hint}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {currentProblem.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentProblem.correctIndex;

              let btnClasses =
                'p-4 rounded-2xl border-2 text-center font-black text-xl md:text-2xl transition-all ';
              if (!isAnswered) {
                btnClasses +=
                  'bg-white hover:bg-[#ffd400]/30 border-[#7f27a8]/40 hover:border-[#7f27a8] text-black shadow-xs cursor-pointer active:scale-95';
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
            <div className="mt-6 pt-6 border-t border-[#53b0c9]/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-black leading-relaxed text-center md:text-left">
                {currentProblem.explanation}
              </p>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#f76400] hover:bg-[#c1008f] text-white font-black shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {currentIndex + 1 === problems.length ? 'See Results' : 'Next Calculation'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
            {summaryData.timedOut ? "Time's Up!" : '20 Questions Mastered!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Solved {summaryData.correctCount} of {summaryData.totalProblems} mental math challenges.
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
              onClick={startRound}
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/25 font-black transition-colors cursor-pointer"
            >
              Play 20 New Questions
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
