import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { getSpatialBatch, SpatialPuzzleData } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Layers, ArrowRight, Award, HelpCircle, Clock } from 'lucide-react';

interface SpatialThinkingGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

const INTRO_PROMPTS = [
  'Conquer 20 brand-new mental rotation, cube net, and abstract spatial puzzles!',
  'Visualize shapes in 2D and 3D across 20 unique spatial challenges!',
  'Ready for 20 fresh spatial & abstract thinking riddles?',
];

export const SpatialThinkingGame: React.FC<SpatialThinkingGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [puzzles, setPuzzles] = useState<SpatialPuzzleData[]>([]);
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
  const currentQuestionSpeech = currentPuzzle ? currentPuzzle.question : '';

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestionSpeech) return;
    speakChildQuestion(currentQuestionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, currentIndex, currentQuestionSpeech, child.calculatedAge, child.band]);

  const startRound = () => {
    const seed = loginSessionId * 47 + playCount * 31 + (Date.now() % 1000);
    const list = getSpatialBatch(child.id, child.band, 20, seed);
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

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentPuzzle) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentPuzzle.correctIndex;
    if (isCorrect) {
      soundEngine.playSuccess();
      setIsAnswered(true);
      setShowConfetti(true);
      if (!missedCurrentQuestion) {
        setCorrectCount((c) => c + 1);
      }
    } else {
      soundEngine.playGentleError();
      setMistakes((m) => m + 1);
      setMissedCurrentQuestion(true);
      setAmberMessage(
        mistakes % 2 === 0
          ? "So close! Imagine turning the shape slowly and let's try again!"
          : "You didn't get it this time. Let's try again!"
      );
      setShowAmberAlert(true);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < puzzles.length) {
      setCurrentIndex((i) => i + 1);
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
    const total = Math.max(1, puzzles.length);
    const accuracy = Math.round((correctCount / total) * 100);
    const score = correctCount * 10;
    const isFlawless = !timedOut && accuracy === 100 && hintsUsedCount === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 25;

    soundEngine.playFanfare();
    setShowConfetti(true);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'spatial_thinking',
      gameTitle: 'Shape Shifters & Spatial Matrix',
      domain: 'spatial_thinking',
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
        totalPuzzles: total,
        correctAnswers: correctCount,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      correctCount,
      totalPuzzles: total,
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

  const renderVisualStage = (p: SpatialPuzzleData) => {
    if (p.visualType === 'cube_net' && p.visualCells.length >= 6) {
      return (
        <div className="flex flex-col items-center justify-center my-2 text-2xl font-bold">
          <div className="w-12 h-12 bg-white border-2 border-[#7f27a8] flex items-center justify-center rounded-t-lg">
            {p.visualCells[0]}
          </div>
          <div className="flex">
            <div className="w-12 h-12 bg-white border-2 border-[#7f27a8] flex items-center justify-center">
              {p.visualCells[1]}
            </div>
            <div className="w-12 h-12 bg-[#ffd400] border-2 border-[#f76400] flex items-center justify-center">
              {p.visualCells[2]}
            </div>
            <div className="w-12 h-12 bg-white border-2 border-[#7f27a8] flex items-center justify-center">
              {p.visualCells[3]}
            </div>
            <div className="w-12 h-12 bg-[#53b0c9]/40 border-2 border-[#7f27a8] flex items-center justify-center">
              {p.visualCells[4]}
            </div>
          </div>
          <div className="w-12 h-12 bg-white border-2 border-[#7f27a8] flex items-center justify-center rounded-b-lg">
            {p.visualCells[5]}
          </div>
        </div>
      );
    }

    if (p.visualType === 'grid3') {
      return (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto bg-[#7f27a8] p-3 rounded-2xl text-xl font-black text-center">
          {p.visualCells.map((cell, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl ${
                cell === '?'
                  ? 'bg-[#ffd400] text-black border-2 border-dashed border-[#f76400] animate-pulse'
                  : 'bg-white text-black'
              }`}
            >
              {cell}
            </div>
          ))}
        </div>
      );
    }

    if (p.visualType === 'mirror') {
      return (
        <div className="flex items-center justify-center gap-4 font-mono text-3xl font-black">
          <span className="p-3 bg-white border-2 border-[#7f27a8] rounded-xl text-black">
            {p.visualCells[0]}
          </span>
          <span className="text-[#c1008f] font-black">|</span>
          <span className="p-3 bg-[#ffd400] rounded-xl border-2 border-dashed border-[#f76400] text-black">
            ?
          </span>
        </div>
      );
    }

    if (p.visualType === 'rotate') {
      return (
        <div className="flex items-center justify-center gap-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-[#7f27a8] shadow-sm text-5xl text-black">
            {p.visualCells[0]}
          </div>
          <span className="text-lg font-black text-[#7f27a8] bg-[#ffd400]/40 px-3 py-1.5 rounded-xl border border-[#ffd400]">
            {p.visualCells[1]} = ?
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-5">
        <div className="px-6 py-4 rounded-2xl bg-[#7f27a8] text-white flex items-center justify-center border-4 border-dashed border-[#ffd400] text-3xl md:text-4xl font-black">
          {p.visualCells[0]}
        </div>
        <span className="text-2xl font-black text-black">= ?</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#7f27a8] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#7f27a8] text-white flex items-center justify-center shadow-md">
            <Layers className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Spatial &amp; Abstract Studio
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introPrompt}
          </p>

          <div className="bg-[#e885cf]/25 border border-[#e885cf] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Category
              </span>
              <span className="text-sm font-black text-black">Mental Abilities</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Challenges
              </span>
              <span className="text-sm font-black text-[#7f27a8]">20 Spatial Puzzles</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Level
              </span>
              <span className="text-sm font-black text-black">Tier {difficulty}</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome to the Spatial Studio, ${child.name}! Rotate, mirror, and fold shapes in your imagination to pick the matching piece across all 20 spatial puzzles.`}
            age={child.calculatedAge}
            band={child.band}
          />

          <GameTimerSetup seconds={timerSeconds} onChangeSeconds={setTimerSeconds} />

          <div className="flex gap-4 justify-center">
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl border-2 border-black text-black font-bold hover:bg-[#e885cf]/20 transition-colors cursor-pointer"
            >
              Back to World
            </button>
            <button
              onClick={startRound}
              className="px-8 py-3.5 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Start 20-Puzzle Studio <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentPuzzle && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#7f27a8] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#e885cf]">
            <div>
              <span className="text-xs font-black text-[#7f27a8] uppercase tracking-wider">
                Puzzle {currentIndex + 1} of {puzzles.length} · {currentPuzzle.title}
              </span>
              <h3 className="text-xl font-black text-black mt-0.5">
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
                className="text-xs font-bold text-black hover:bg-[#e885cf]/30 px-3 py-1.5 rounded-xl border border-black/20 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          <GameProgressBar
            current={currentIndex + (isAnswered ? 1 : 0)}
            total={puzzles.length}
            unitLabel="puzzles"
            accentBgClass="bg-[#7f27a8]"
          />

          <div className="bg-[#e885cf]/20 border-2 border-[#7f27a8]/40 rounded-3xl p-6 mb-6 flex items-center justify-center min-h-[160px]">
            {renderVisualStage(currentPuzzle)}
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

          <div className="grid grid-cols-2 gap-3 mb-6">
            {currentPuzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentPuzzle.correctIndex;

              let btnClasses =
                'p-4 rounded-2xl border-2 text-center font-black text-base transition-all flex flex-col items-center justify-center gap-1 ';
              if (!isAnswered) {
                btnClasses +=
                  'bg-white hover:bg-[#e885cf]/25 border-[#7f27a8]/40 hover:border-[#7f27a8] text-black shadow-xs cursor-pointer active:scale-95';
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
                  <span className="text-3xl mb-1">{opt.graphic}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 pt-6 border-t border-[#e885cf] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-black leading-relaxed text-center md:text-left">
                {currentPuzzle.explanation}
              </p>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {currentIndex + 1 === puzzles.length ? 'See Results' : 'Next Puzzle'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#7f27a8] shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[#7f27a8] text-white flex items-center justify-center shadow-inner">
            {summaryData.timedOut ? <Clock className="w-10 h-10" /> : <Award className="w-10 h-10" />}
          </div>

          {summaryData.timedOut && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c1008f] text-white text-xs font-black uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" /> Time&apos;s Up! Final Score
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-black mb-1">
            {summaryData.timedOut ? "Time's Up!" : '20 Spatial Puzzles Solved!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Solved {summaryData.correctCount} of {summaryData.totalPuzzles} spatial puzzles.
          </p>

          <div className="bg-[#ffd400] border-2 border-black rounded-2xl p-4 mb-4">
            <span className="text-xs font-black text-black uppercase tracking-wider block">
              Final Score
            </span>
            <span className="text-3xl font-black text-black tabular-nums">
              {summaryData.score} pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#e885cf]/20 border border-[#e885cf] rounded-2xl p-4 mb-6 text-center">
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
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#e885cf]/25 font-black transition-colors cursor-pointer"
            >
              Play 20 New Puzzles
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
          setSelectedOption(null);
        }}
      />
    </div>
  );
};
