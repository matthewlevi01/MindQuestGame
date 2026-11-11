import React, { useState } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { Puzzle, HelpCircle, ArrowRight, Award, CheckCircle2 } from 'lucide-react';

interface LogicKingdomGameProps {
  child: ChildProfile;
  difficulty: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

interface PatternPuzzle {
  question: string;
  sequence: string[];
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

const PUZZLES_BY_BAND: Record<string, PatternPuzzle[]> = {
  young_explorers: [
    {
      question: 'Which shape comes next in the pattern?',
      sequence: ['🔴', '🔷', '🔴', '🔷', '🔴', '?'],
      options: ['🔷', '⭐', '🔴', '🔺'],
      correctIndex: 0,
      hint: 'It alternates: circle, diamond, circle, diamond...',
      explanation: 'Great job! The pattern goes back and forth between circle and diamond.',
    },
    {
      question: 'What belongs in the missing spot?',
      sequence: ['⭐', '⭐', '🌙', '⭐', '⭐', '?'],
      options: ['☀️', '🌙', '⭐', '☁️'],
      correctIndex: 1,
      hint: 'Two stars, one moon, two stars...',
      explanation: 'Two stars are always followed by one moon!',
    },
    {
      question: 'Which fruit completes this sequence?',
      sequence: ['🍎', '🍌', '🍎', '🍌', '?'],
      options: ['🍇', '🍎', '🍓', '🍌'],
      correctIndex: 1,
      hint: 'Apple, banana, apple, banana...',
      explanation: 'Next is the red apple!',
    },
  ],
  senior_explorers: [
    {
      question: 'Find the next number in this pattern:',
      sequence: ['2', '4', '8', '16', '?'],
      options: ['24', '32', '20', '30'],
      correctIndex: 1,
      hint: 'Notice each number is multiplied by 2 (doubled).',
      explanation: '16 × 2 = 32! Each number doubles.',
    },
    {
      question: 'Which shape comes next in the progression?',
      sequence: ['▲ (3)', '■ (4)', '⬟ (5)', '?'],
      options: ['● (0)', '⬡ (6)', '◈ (4)', '▲ (3)'],
      correctIndex: 1,
      hint: 'Count the number of sides on each shape: 3 sides, 4 sides, 5 sides...',
      explanation: 'A hexagon has 6 sides, continuing the sequence of adding 1 side.',
    },
    {
      question: 'What is the missing term?',
      sequence: ['10', '13', '17', '22', '?'],
      options: ['27', '28', '29', '26'],
      correctIndex: 1,
      hint: 'Look at the step size: +3, +4, +5...',
      explanation: 'The difference increases by 1 each time (+3, +4, +5, +6). 22 + 6 = 28!',
    },
  ],
  discoverers: [
    {
      question: 'Identify the missing element in the transformational sequence:',
      sequence: ['◧ (Half Left)', '◨ (Half Right)', '◩ (Half Top)', '?'],
      options: ['◪ (Half Bottom)', '■ (Solid)', '□ (Empty)', '◧ (Half Left)'],
      correctIndex: 0,
      hint: 'The shaded sector rotates clockwise: Left -> Right -> Top -> ...',
      explanation: 'The half-shading progresses to the bottom sector next.',
    },
    {
      question: 'Solve the alphanumeric cipher matrix:',
      sequence: ['A-1', 'C-3', 'F-6', 'J-10', '?'],
      options: ['M-13', 'O-15', 'N-14', 'P-16'],
      correctIndex: 1,
      hint: 'The gaps between letters are +2, +3, +4, +5...',
      explanation: 'J + 5 letters = O, and O is the 15th letter. Correct answer is O-15.',
    },
    {
      question: 'Matrix logic: which symbol restores balance?',
      sequence: ['△ 2', '▲ 4', '△ 8', '▲ 16', '?'],
      options: ['▲ 32', '△ 32', '△ 24', '▲ 64'],
      correctIndex: 1,
      hint: 'Hollow and filled alternate, while numbers multiply by 2.',
      explanation: 'Filled ▲ 16 alternates back to hollow △ with double the value (32).',
    },
  ],
  masters: [
    {
      question: 'Fibonacci composite pattern deduction:',
      sequence: ['3', '5', '8', '13', '21', '?'],
      options: ['34', '31', '33', '35'],
      correctIndex: 0,
      hint: 'Each number is the sum of the previous two numbers.',
      explanation: '13 + 21 = 34. Classical recursive summation.',
    },
    {
      question: 'Abstract dual-rotation transformation:',
      sequence: ['⬆️ 🟢', '➡️ 🔷', '⬇️ 🟢', '⬅️ 🔷', '?'],
      options: ['⬆️ 🟢', '➡️ 🟢', '⬆️ 🔷', '⬇️ 🔷'],
      correctIndex: 0,
      hint: 'Arrows rotate 90° clockwise, while the token alternates Circle / Diamond.',
      explanation: '90° clockwise from Left returns to Up, and token alternates back to Circle.',
    },
    {
      question: 'Modulo coordinate pattern:',
      sequence: ['[1, 1]', '[2, 4]', '[3, 9]', '[4, 16]', '?'],
      options: ['[5, 20]', '[5, 25]', '[6, 36]', '[5, 30]'],
      correctIndex: 1,
      hint: 'The second coordinate equals the square of the first: y = x²',
      explanation: 'For x = 5, y = 5² = 25. The coordinate pair is [5, 25].',
    },
  ],
};

export const LogicKingdomGame: React.FC<LogicKingdomGameProps> = ({
  child,
  difficulty,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [puzzles, setPuzzles] = useState<PatternPuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [summaryData, setSummaryData] = useState<{
    accuracy: number;
    duration: number;
    xp: number;
  } | null>(null);

  const startPuzzleRound = () => {
    const list = PUZZLES_BY_BAND[child.band] || PUZZLES_BY_BAND.senior_explorers;
    setPuzzles(list);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setHintsUsedCount(0);
    setCorrectCount(0);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const currentPuzzle = puzzles[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentPuzzle.correctIndex;
    if (isCorrect) {
      soundEngine.playSuccess();
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEngine.playGentleError();
    }
  };

  const handleNextPuzzle = () => {
    if (currentIndex + 1 < puzzles.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const duration = Math.max(10, Math.floor((Date.now() - startTime) / 1000));
    const finalCorrect = correctCount + (selectedOption === currentPuzzle?.correctIndex ? 1 : 0);
    const totalPuzzles = puzzles.length;
    const accuracy = Math.round((finalCorrect / totalPuzzles) * 100);
    const isFlawless = accuracy === 100 && hintsUsedCount === 0;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless);

    soundEngine.playFanfare();

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'logic_patterns',
      gameTitle: 'Pattern Detective',
      domain: 'reasoning',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / totalPuzzles),
      mistakes: totalPuzzles - finalCorrect,
      hintsUsed: hintsUsedCount,
      xpEarned: xp,
      completed: true,
      details: {
        totalPuzzles,
        correctAnswers: finalCorrect,
      },
    };

    setSummaryData({ accuracy, duration, xp });
    setGameState('summary');
    onFinish(session);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 select-none font-child">
      {/* Intro state */}
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Puzzle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Logic Kingdom: Pattern Detective
          </h2>
          <p className="text-slate-600 mb-6 text-base leading-relaxed">
            {child.band === 'young_explorers'
              ? 'Find the pattern rule and discover which shape or friend completes the line!'
              : 'Analyze logical sequences, geometric transformations, and deduce missing terms through reasoning.'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Puzzles
              </span>
              <span className="text-lg font-bold text-slate-800">3 Challenges</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Tier
              </span>
              <span className="text-lg font-bold text-amber-600">Level {difficulty}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Domain
              </span>
              <span className="text-lg font-bold text-slate-800">Deductive Logic</span>
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
              onClick={startPuzzleRound}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-lg hover:shadow-amber-200 transition-all transform active:scale-95 flex items-center gap-2"
            >
              Start Deductions <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && currentPuzzle && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Puzzle {currentIndex + 1} of {puzzles.length}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
                {currentPuzzle.question}
              </h3>
            </div>
            <button
              onClick={onExit}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Exit
            </button>
          </div>

          {/* Sequence visual banner */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8 flex items-center justify-center gap-3 md:gap-5 flex-wrap">
            {currentPuzzle.sequence.map((item, idx) => (
              <div
                key={idx}
                className={`min-w-14 h-14 md:min-w-16 md:h-16 px-3 rounded-2xl flex items-center justify-center font-extrabold text-xl md:text-2xl shadow-sm ${
                  item === '?'
                    ? 'bg-amber-100 text-amber-700 border-2 border-dashed border-amber-400 animate-pulse'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Hint button */}
          {!showHint && !isAnswered && (
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  setShowHint(true);
                  setHintsUsedCount((h) => h + 1);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
              >
                <HelpCircle className="w-4 h-4" /> Need a clue?
              </button>
            </div>
          )}

          {showHint && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 text-center">
              💡 Hint: {currentPuzzle.hint}
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {currentPuzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentPuzzle.correctIndex;

              let btnClasses =
                'p-4 rounded-2xl border text-center font-bold text-lg md:text-xl transition-all ';
              if (!isAnswered) {
                btnClasses +=
                  'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-300 text-slate-800 shadow-sm hover:shadow cursor-pointer active:scale-95';
              } else if (isCorrectOpt) {
                btnClasses +=
                  'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300';
              } else if (isSelected && !isCorrectOpt) {
                btnClasses += 'bg-rose-50 border-rose-300 text-rose-700';
              } else {
                btnClasses += 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
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

          {/* Explanation & Next Step */}
          {isAnswered && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-700 leading-relaxed text-center md:text-left">
                {currentPuzzle.explanation}
              </p>
              <button
                onClick={handleNextPuzzle}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                {currentIndex + 1 === puzzles.length ? 'See Results' : 'Next Puzzle'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary state */}
      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
            Logic Mystery Solved!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Deductive problem solving and pattern recognition practiced.
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

          <div className="flex gap-3 justify-center">
            <button
              onClick={startPuzzleRound}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition-colors"
            >
              Return to World
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
