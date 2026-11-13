import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { getStrategyBoardBatch, StrategyBoardData } from '../../data/questionBank';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Compass, Play, RotateCcw, Trash2, ArrowRight, Award, Clock } from 'lucide-react';

interface StrategyIslandGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

const INTRO_PROMPTS = [
  'Chart a clean path around boulders, collect every gem, and reach the beacon!',
  'Brand-new island grid loaded!Sequence your navigation moves before sailing!',
  'Plot up to 20 strategic steps in working memory to conquer this expedition!',
];

export const StrategyIslandGame: React.FC<StrategyIslandGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'planning' | 'executing' | 'summary'>('intro');
  const [playCount, setPlayCount] = useState(0);
  const [board, setBoard] = useState<StrategyBoardData>(() =>
    getStrategyBoardBatch(child.id, child.band, loginSessionId * 29)
  );
  const [commands, setCommands] = useState<Direction[]>([]);
  const [playerPos, setPlayerPos] = useState<Position>(board.startPos);
  const [gemsCollected, setGemsCollected] = useState<number[]>([]);
  const [executionMessage, setExecutionMessage] = useState<string>('');
  const [startTime, setStartTime] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(150);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(150);
  const [remainingSeconds, setRemainingSeconds] = useState(150);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAmberAlert, setShowAmberAlert] = useState(false);
  const [amberMessage, setAmberMessage] = useState("So close! Let's adjust the route and try again!");
  const [summaryData, setSummaryData] = useState<{
    score: number;
    gemsCount: number;
    totalGems: number;
    accuracy: number;
    duration: number;
    xp: number;
    timedOut: boolean;
  } | null>(null);

  const timeUpRef = useRef(false);
  const timeoutFinishRef = useRef<() => void>(() => {});

  const introPrompt = INTRO_PROMPTS[(loginSessionId + playCount) % INTRO_PROMPTS.length];
  const boardMissionSpeech = `Plan your route on ${board.title}! Collect all ${board.gems.length} gems, steer around rocks, and land on the golden trophy!`;

  useEffect(() => {
    if (gameState !== 'planning') return;
    speakChildQuestion(boardMissionSpeech, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, playCount, boardMissionSpeech, child.calculatedAge, child.band]);

  const initGame = () => {
    const nextSeed = loginSessionId * 37 + playCount * 19 + (Date.now() % 1000);
    const nextBoard = getStrategyBoardBatch(child.id, child.band, nextSeed);
    timeUpRef.current = false;
    setBoard(nextBoard);
    setPlayCount((p) => p + 1);
    setCommands([]);
    setPlayerPos(nextBoard.startPos);
    setGemsCollected([]);
    setExecutionMessage('');
    setAttempts(1);
    setShowAmberAlert(false);
    setTotalTimerSeconds(timerSeconds);
    setRemainingSeconds(timerSeconds);
    setStartTime(Date.now());
    setGameState('planning');
  };

  const handleAdjustRemaining = (delta: number) => {
    setRemainingSeconds((prev) => {
      const next = Math.max(5, Math.min(600, prev + delta));
      setTotalTimerSeconds((t) => Math.max(t, next));
      return next;
    });
  };

  const addCommand = (dir: Direction) => {
    if (commands.length >= 20) return;
    soundEngine.playPop();
    setCommands((prev) => [...prev, dir]);
  };

  const removeLastCommand = () => {
    soundEngine.playPop();
    setCommands((prev) => prev.slice(0, -1));
  };

  const clearCommands = () => {
    soundEngine.playPop();
    setCommands([]);
    setPlayerPos(board.startPos);
    setGemsCollected([]);
    setExecutionMessage('');
  };

  const executePlan = async () => {
    if (commands.length === 0) return;
    setGameState('executing');
    setPlayerPos(board.startPos);
    setGemsCollected([]);
    setExecutionMessage(`Navigating ${board.title}...`);

    let current = { ...board.startPos };
    const collected: number[] = [];

    for (let i = 0; i < commands.length; i++) {
      if (timeUpRef.current) return;
      const cmd = commands[i];
      await new Promise((r) => setTimeout(r, 380));
      if (timeUpRef.current) return;

      let nextX = current.x;
      let nextY = current.y;

      if (cmd === 'UP') nextY -= 1;
      if (cmd === 'DOWN') nextY += 1;
      if (cmd === 'LEFT') nextX -= 1;
      if (cmd === 'RIGHT') nextX += 1;

      if (nextX < 0 || nextX >= board.gridSize || nextY < 0 || nextY >= board.gridSize) {
        soundEngine.playGentleError();
        setAttempts((a) => a + 1);
        setAmberMessage('You reached the ocean edge! Adjust your arrows and try again!');
        setShowAmberAlert(true);
        setGameState('planning');
        return;
      }

      const hitObstacle = board.obstacles.some((obs) => obs.x === nextX && obs.y === nextY);
      if (hitObstacle) {
        soundEngine.playGentleError();
        setAttempts((a) => a + 1);
        setAmberMessage('Blocked by an island boulder! Reroute around it and try again!');
        setShowAmberAlert(true);
        setGameState('planning');
        return;
      }

      current = { x: nextX, y: nextY };
      setPlayerPos(current);
      soundEngine.playPop();

      const foundGem = board.gems.find((g) => g.pos.x === current.x && g.pos.y === current.y);
      if (foundGem && !collected.includes(foundGem.id)) {
        collected.push(foundGem.id);
        setGemsCollected([...collected]);
        soundEngine.playSuccess();
        setShowConfetti(true);
      }
    }

    if (timeUpRef.current) return;

    if (current.x === board.goalPos.x && current.y === board.goalPos.y) {
      soundEngine.playFanfare();
      setShowConfetti(true);
      finishGame(collected.length, false);
    } else {
      soundEngine.playGentleError();
      setAttempts((a) => a + 1);
      setAmberMessage("So close! Your explorer didn't quite reach the golden trophy 🏆. Let's try again!");
      setShowAmberAlert(true);
      setGameState('planning');
    }
  };

  const finishGame = (gemsCount: number, timedOut = false) => {
    stopVoice();
    setShowAmberAlert(false);
    const duration = timedOut
      ? totalTimerSeconds
      : Math.max(5, Math.floor((Date.now() - startTime) / 1000));
    const totalGems = Math.max(1, board.gems.length);
    const accuracy = timedOut
      ? Math.round((gemsCount / totalGems) * 60)
      : attempts === 1
      ? 100
      : Math.max(55, 100 - (attempts - 1) * 15);
    const score = (timedOut ? 0 : 100) + gemsCount * 25;
    const isFlawless = !timedOut && attempts === 1 && gemsCount === board.gems.length;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 20;

    soundEngine.playFanfare();

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'strategy_route',
      gameTitle: 'Route Planner',
      domain: 'executive_function',
      focusArea: 'concentration',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / Math.max(1, commands.length)),
      mistakes: attempts - 1,
      hintsUsed: 0,
      xpEarned: xp,
      score,
      timedOut,
      completed: true,
      details: {
        boardId: board.id,
        boardTitle: board.title,
        totalSteps: commands.length,
        gemsCollected: gemsCount,
        attemptsNeeded: attempts,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      gemsCount,
      totalGems,
      accuracy,
      duration,
      xp,
      timedOut,
    });
    setGameState('summary');
    onFinish(session);
  };

  timeoutFinishRef.current = () => {
    timeUpRef.current = true;
    finishGame(gemsCollected.length, true);
  };

  useEffect(() => {
    if (gameState !== 'planning' && gameState !== 'executing') return;
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

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#53b0c9] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#53b0c9] text-black flex items-center justify-center shadow-md">
            <Compass className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Strategy Island: Route Planner
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introPrompt}
          </p>

          <div className="bg-[#ffd400]/25 border border-[#ffd400] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Map
              </span>
              <span className="text-sm font-black text-black">{board.title}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Grid Size
              </span>
              <span className="text-sm font-black text-[#7f27a8]">
                {board.gridSize} × {board.gridSize}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Gems
              </span>
              <span className="text-sm font-black text-black">{board.gems.length} Gems</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome Explorer ${child.name}! Build your step-by-step arrow sequence to dodge boulders, gather every shiny gem, and land on the golden trophy before time runs out!`}
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
              Start Route Quest <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {(gameState === 'planning' || gameState === 'executing') && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#53b0c9] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#53b0c9]/30">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-[#7f27a8] uppercase tracking-wider">
                {board.title} · Gems: {gemsCollected.length}/{board.gems.length} 💎
              </span>
              <span className="text-xs text-black/70 font-bold">
                Attempt #{attempts}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <QuestionSpeakerButton
                text={boardMissionSpeech}
                age={child.calculatedAge}
                band={child.band}
                label="Hear Mission"
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
                className="px-3 py-1.5 text-xs font-bold text-black hover:bg-[#ffd400]/30 rounded-xl border border-black/20 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          <GameProgressBar
            current={gemsCollected.length}
            total={board.gems.length + 1}
            unitLabel="milestones"
            accentBgClass="bg-[#53b0c9]"
          />

          {executionMessage && (
            <div className="mb-4 p-3 rounded-xl text-xs font-black text-center bg-[#53b0c9]/20 text-black border border-[#53b0c9]">
              {executionMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center">
              <div
                className="grid gap-2 bg-[#7f27a8] p-3 rounded-2xl border-2 border-black shadow-inner"
                style={{
                  gridTemplateColumns: `repeat(${board.gridSize}, minmax(0, 1fr))`,
                  width: `${board.gridSize * 64}px`,
                }}
              >
                {Array.from({ length: board.gridSize * board.gridSize }).map((_, idx) => {
                  const x = idx % board.gridSize;
                  const y = Math.floor(idx / board.gridSize);

                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const isGoal = board.goalPos.x === x && board.goalPos.y === y;
                  const isObstacle = board.obstacles.some((o) => o.x === x && o.y === y);
                  const gemItem = board.gems.find((g) => g.pos.x === x && g.pos.y === y);
                  const isGem = gemItem && !gemsCollected.includes(gemItem.id);

                  return (
                    <div
                      key={idx}
                      className="w-13 h-13 md:w-14 md:h-14 bg-[#53b0c9] rounded-xl flex items-center justify-center relative border-2 border-black/30"
                    >
                      {isPlayer && (
                        <div className="w-10 h-10 rounded-full bg-[#ffd400] border-2 border-black shadow-lg flex items-center justify-center text-lg animate-bounce z-10">
                          🧭
                        </div>
                      )}
                      {isGoal && !isPlayer && <span className="text-2xl">🏆</span>}
                      {isObstacle && <span className="text-2xl">🪨</span>}
                      {isGem && !isPlayer && <span className="text-xl">💎</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-black text-black uppercase tracking-wider block mb-2">
                  Plotted Steps ({commands.length}/20 max)
                </span>
                <div className="min-h-14 p-2.5 bg-[#ffd400]/20 border-2 border-[#ffd400] rounded-xl flex items-center gap-1.5 flex-wrap">
                  {commands.length === 0 ? (
                    <span className="text-xs text-black/65 font-medium italic">
                      Tap arrows below to plot your explorer's path...
                    </span>
                  ) : (
                    commands.map((cmd, i) => (
                      <span
                        key={i}
                        className="w-8 h-8 rounded-lg bg-[#7f27a8] text-white font-black text-sm flex items-center justify-center shadow-xs"
                      >
                        {cmd === 'UP' && '⬆️'}
                        {cmd === 'DOWN' && '⬇️'}
                        {cmd === 'LEFT' && '⬅️'}
                        {cmd === 'RIGHT' && '➡️'}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                <div />
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('UP')}
                  className="p-3 bg-white hover:bg-[#ffd400] active:scale-95 border-2 border-black rounded-xl font-bold text-lg flex items-center justify-center cursor-pointer"
                >
                  ⬆️
                </button>
                <div />
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('LEFT')}
                  className="p-3 bg-white hover:bg-[#ffd400] active:scale-95 border-2 border-black rounded-xl font-bold text-lg flex items-center justify-center cursor-pointer"
                >
                  ⬅️
                </button>
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('DOWN')}
                  className="p-3 bg-white hover:bg-[#ffd400] active:scale-95 border-2 border-black rounded-xl font-bold text-lg flex items-center justify-center cursor-pointer"
                >
                  ⬇️
                </button>
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('RIGHT')}
                  className="p-3 bg-white hover:bg-[#ffd400] active:scale-95 border-2 border-black rounded-xl font-bold text-lg flex items-center justify-center cursor-pointer"
                >
                  ➡️
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={gameState === 'executing' || commands.length === 0}
                  onClick={removeLastCommand}
                  className="p-2.5 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/30 text-xs font-bold cursor-pointer"
                  title="Undo last step"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  disabled={gameState === 'executing' || commands.length === 0}
                  onClick={clearCommands}
                  className="p-2.5 rounded-xl border-2 border-black text-black hover:bg-[#e885cf]/40 text-xs font-bold cursor-pointer"
                  title="Clear all steps"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  disabled={gameState === 'executing' || commands.length === 0}
                  onClick={executePlan}
                  className="flex-1 py-3 bg-[#f76400] hover:bg-[#c1008f] active:scale-95 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {gameState === 'executing' ? 'Moving...' : 'Execute Route'}
                </button>
              </div>
            </div>
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
            {summaryData.timedOut ? "Time's Up!" : 'Island Route Mastered!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            {summaryData.timedOut
              ? `Collected ${summaryData.gemsCount} of ${summaryData.totalGems} gems on ${board.title}.`
              : `Forward planning and spatial navigation conquered on ${board.title}.`}
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
              onClick={initGame}
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/25 font-black transition-colors cursor-pointer"
            >
              Play New Island Map
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
          setPlayerPos(board.startPos);
          setGemsCollected([]);
        }}
      />
    </div>
  );
};
