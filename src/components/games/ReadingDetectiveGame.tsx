import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { getReadingBatch, ReadingQuestion } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { BookOpen, Award, ArrowRight, HelpCircle, Clock } from 'lucide-react';

interface ReadingDetectiveGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

const INTRO_LINES = [
  'Uncover 20 brand-new reading clues, rhymes, and vocabulary mysteries!',
  'Put on your detective hat and solve 20 fresh word puzzles!',
  'Ready for 20 new comprehension riddles tailored to your age?',
];

export const ReadingDetectiveGame: React.FC<ReadingDetectiveGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
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
  const [amberMessage, setAmberMessage] = useState("So close! Let's try again!");
  const [summaryData, setSummaryData] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    accuracy: number;
    duration: number;
    xp: number;
    timedOut: boolean;
  } | null>(null);

  const finishGameRef = useRef<(timedOut?: boolean) => void>(() => {});

  const currentQ = questions[currentIndex];
  const introLine = INTRO_LINES[(loginSessionId + playCount) % INTRO_LINES.length];
  const currentQuestionSpeech = currentQ
    ? `${currentQ.prompt}${currentQ.passage ? '. ' + currentQ.passage : ''}`
    : '';

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestionSpeech) return;
    speakChildQuestion(currentQuestionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, currentIndex, currentQuestionSpeech, child.calculatedAge, child.band]);

  const startRound = () => {
    const seed = loginSessionId * 41 + playCount * 23 + (Date.now() % 1000);
    const list = getReadingBatch(child.id, child.band, 20, seed);
    setQuestions(list);
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
    if (isAnswered || !currentQ) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentQ.correctIndex;
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
          ? "You didn't get it this time. Let's try again!"
          : "So close! Read the clue one more time and try again!"
      );
      setShowAmberAlert(true);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
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
    const total = Math.max(1, questions.length);
    const accuracy = Math.round((correctCount / total) * 100);
    const score = correctCount * 10;
    const isFlawless = !timedOut && accuracy === 100 && hintsUsedCount === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 25;

    soundEngine.playFanfare();
    setShowConfetti(true);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'word_detective',
      gameTitle: 'Word Detective & Reading Quest',
      domain: 'reading_comprehension',
      focusArea: 'reading',
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
        totalQuestions: total,
        correctAnswers: correctCount,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      correctCount,
      totalQuestions: total,
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
        <div className="bg-white rounded-3xl p-8 border-2 border-[#c1008f] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#c1008f] text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Word Detective Academy
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introLine}
          </p>

          <div className="bg-[#e885cf]/25 border border-[#e885cf] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Category
              </span>
              <span className="text-sm font-black text-black">Reading Comprehension</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Challenges
              </span>
              <span className="text-sm font-black text-[#c1008f]">20 Fresh Clues</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Level
              </span>
              <span className="text-sm font-black text-black">Tier {difficulty}</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome Detective ${child.name}! Listen or read each short story clue carefully and choose the answer that solves the mystery. Complete all 20 clues before the timer finishes!`}
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
              className="px-8 py-3.5 rounded-2xl bg-[#c1008f] hover:bg-[#7f27a8] text-white font-black text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Start 20-Clue Quest <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentQ && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#c1008f] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#e885cf]">
            <div>
              <span className="text-xs font-black text-[#c1008f] uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length} · {currentQ.title}
              </span>
              <h3 className="text-xl font-black text-black mt-0.5">
                {currentQ.prompt}
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
            total={questions.length}
            unitLabel="clues"
            accentBgClass="bg-[#c1008f]"
          />

          {currentQ.passage && (
            <div className="bg-[#e885cf]/25 border-2 border-[#e885cf] rounded-3xl p-6 mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#7f27a8] block mb-2">
                Clue Passage:
              </span>
              <p className="text-sm md:text-base font-bold text-black leading-relaxed italic">
                {currentQ.passage}
              </p>
            </div>
          )}

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
              💡 Hint: {currentQ.hint}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentQ.correctIndex;

              let btnClasses =
                'p-4 rounded-2xl border-2 text-left font-bold text-sm md:text-base transition-all ';
              if (!isAnswered) {
                btnClasses +=
                  'bg-white hover:bg-[#e885cf]/25 border-[#c1008f]/40 hover:border-[#c1008f] text-black shadow-xs cursor-pointer active:scale-95';
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
            <div className="mt-6 pt-6 border-t border-[#e885cf] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-black leading-relaxed text-center md:text-left">
                {currentQ.explanation}
              </p>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#c1008f] hover:bg-[#7f27a8] text-white font-black shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {currentIndex + 1 === questions.length ? 'See Results' : 'Next Clue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#c1008f] shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[#e885cf] text-black flex items-center justify-center shadow-inner">
            {summaryData.timedOut ? <Clock className="w-10 h-10" /> : <Award className="w-10 h-10" />}
          </div>

          {summaryData.timedOut && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c1008f] text-white text-xs font-black uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" /> Time&apos;s Up! Final Score
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-black mb-1">
            {summaryData.timedOut ? "Time's Up!" : '20 Clues Solved!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Solved {summaryData.correctCount} of {summaryData.totalQuestions} reading mysteries.
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
              Play 20 New Clues
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-[#c1008f] hover:bg-[#7f27a8] text-white font-black shadow-md transition-colors cursor-pointer"
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
