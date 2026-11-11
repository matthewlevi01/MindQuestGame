import React, { useState } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { Compass, Play, RotateCcw, Trash2, ArrowRight, Award, CheckCircle } from 'lucide-react';

interface StrategyIslandGameProps {
  child: ChildProfile;
  difficulty: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

export const StrategyIslandGame: React.FC<StrategyIslandGameProps> = ({
  child,
  difficulty,
  onFinish,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'planning' | 'executing' | 'summary'>('intro');
  const [commands, setCommands] = useState<Direction[]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [gemsCollected, setGemsCollected] = useState<number[]>([]);
  const [executionMessage, setExecutionMessage] = useState<string>('');
  const [isFailedRun, setIsFailedRun] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [summaryData, setSummaryData] = useState<{
    accuracy: number;
    duration: number;
    xp: number;
  } | null>(null);

  // Grid dimensions
  const gridSize = child.band === 'young_explorers' ? 4 : 5;

  // Level configuration
  const startPos: Position = { x: 0, y: 0 };
  const goalPos: Position = { x: gridSize - 1, y: gridSize - 1 };

  // Obstacles & Gems depending on size
  const obstacles: Position[] =
    gridSize === 4
      ? [{ x: 1, y: 1 }, { x: 2, y: 2 }]
      : [{ x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 1 }, { x: 1, y: 3 }];

  const gems: { id: number; pos: Position }[] =
    gridSize === 4
      ? [{ id: 1, pos: { x: 0, y: 2 } }, { id: 2, pos: { x: 2, y: 1 } }]
      : [{ id: 1, pos: { x: 1, y: 0 } }, { id: 2, pos: { x: 3, y: 2 } }, { id: 3, pos: { x: 2, y: 4 } }];

  const initGame = () => {
    setCommands([]);
    setPlayerPos(startPos);
    setGemsCollected([]);
    setExecutionMessage('');
    setIsFailedRun(false);
    setStartTime(Date.now());
    setGameState('planning');
  };

  const addCommand = (dir: Direction) => {
    if (commands.length >= 12) return;
    soundEngine.playPop();
    setCommands((prev) => [...prev, dir]);
    setIsFailedRun(false);
  };

  const removeLastCommand = () => {
    soundEngine.playPop();
    setCommands((prev) => prev.slice(0, -1));
  };

  const clearCommands = () => {
    soundEngine.playPop();
    setCommands([]);
    setPlayerPos(startPos);
    setGemsCollected([]);
    setIsFailedRun(false);
    setExecutionMessage('');
  };

  const executePlan = async () => {
    if (commands.length === 0) return;
    setGameState('executing');
    setIsFailedRun(false);
    setExecutionMessage('Executing your plotted route...');

    let current = { ...startPos };
    const collected: number[] = [];

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      // Delay between steps for visual playback
      await new Promise((r) => setTimeout(r, 450));

      let nextX = current.x;
      let nextY = current.y;

      if (cmd === 'UP') nextY -= 1;
      if (cmd === 'DOWN') nextY += 1;
      if (cmd === 'LEFT') nextX -= 1;
      if (cmd === 'RIGHT') nextX += 1;

      // Check bounds
      if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
        soundEngine.playGentleError();
        setIsFailedRun(true);
        setExecutionMessage('Oops! Your route hit the edge of the island.');
        setAttempts((a) => a + 1);
        setGameState('planning');
        return;
      }

      // Check obstacles
      const hitObstacle = obstacles.some((obs) => obs.x === nextX && obs.y === nextY);
      if (hitObstacle) {
        soundEngine.playGentleError();
        setIsFailedRun(true);
        setExecutionMessage('Path blocked by a boulder! Adjust your commands.');
        setAttempts((a) => a + 1);
        setGameState('planning');
        return;
      }

      // Step valid
      current = { x: nextX, y: nextY };
      setPlayerPos(current);
      soundEngine.playPop();

      // Check gem pickup
      const foundGem = gems.find((g) => g.pos.x === current.x && g.pos.y === current.y);
      if (foundGem && !collected.includes(foundGem.id)) {
        collected.push(foundGem.id);
        setGemsCollected([...collected]);
        soundEngine.playSuccess();
      }
    }

    // Check if reached goal
    if (current.x === goalPos.x && current.y === goalPos.y) {
      soundEngine.playFanfare();
      finishGame(collected.length);
    } else {
      soundEngine.playGentleError();
      setIsFailedRun(true);
      setExecutionMessage('Route completed, but didn’t reach the beacon 🏆 yet. Add more steps!');
      setAttempts((a) => a + 1);
      setGameState('planning');
    }
  };

  const finishGame = (gemsCount: number) => {
    const duration = Math.max(15, Math.floor((Date.now() - startTime) / 1000));
    const accuracy = attempts === 1 ? 100 : Math.max(50, 100 - (attempts - 1) * 15);
    const isFlawless = attempts === 1 && gemsCount === gems.length;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'strategy_route',
      gameTitle: 'Route Planner',
      domain: 'executive_function',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: Math.round((duration * 1000) / Math.max(1, commands.length)),
      mistakes: attempts - 1,
      hintsUsed: 0,
      xpEarned: xp,
      completed: true,
      details: {
        totalSteps: commands.length,
        gemsCollected: gemsCount,
        attemptsNeeded: attempts,
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
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Compass className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Strategy Island: Route Planner
          </h2>
          <p className="text-slate-600 mb-6 text-base leading-relaxed">
            {child.band === 'young_explorers'
              ? 'Plan the steps for your explorer! Pick arrows to walk around rocks, grab shiny gems, and reach the golden trophy!'
              : 'Test your executive function and forward planning. Formulate and sequence navigation instructions in working memory before executing your route.'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Grid Size
              </span>
              <span className="text-lg font-bold text-slate-800">{gridSize} × {gridSize}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Gems Target
              </span>
              <span className="text-lg font-bold text-emerald-600">{gems.length} Gems</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                Domain
              </span>
              <span className="text-lg font-bold text-slate-800">Executive Planning</span>
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
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-lg hover:shadow-emerald-200 transition-all transform active:scale-95 flex items-center gap-2"
            >
              Start Planning <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Planning / Execution state */}
      {(gameState === 'planning' || gameState === 'executing') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Gems: {gemsCollected.length} / {gems.length} 💎
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Attempt #{attempts}
              </span>
            </div>
            <button
              onClick={onExit}
              className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Exit
            </button>
          </div>

          {executionMessage && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs font-bold text-center ${
                isFailedRun
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {executionMessage}
            </div>
          )}

          {/* Grid Layout & Commands Deck */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Grid Arena */}
            <div className="flex justify-center">
              <div
                className="grid gap-2 bg-emerald-950 p-3 rounded-2xl border-4 border-emerald-800 shadow-inner"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  width: `${gridSize * 64}px`,
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                  const x = idx % gridSize;
                  const y = Math.floor(idx / gridSize);

                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const isGoal = goalPos.x === x && goalPos.y === y;
                  const isObstacle = obstacles.some((o) => o.x === x && o.y === y);
                  const gemItem = gems.find((g) => g.pos.x === x && g.pos.y === y);
                  const isGem = gemItem && !gemsCollected.includes(gemItem.id);

                  return (
                    <div
                      key={idx}
                      className="w-13 h-13 md:w-14 md:h-14 bg-emerald-900/60 rounded-xl flex items-center justify-center relative border border-emerald-800/40"
                    >
                      {isPlayer && (
                        <div className="w-10 h-10 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-lg animate-bounce z-10">
                          🧭
                        </div>
                      )}
                      {isGoal && !isPlayer && <span className="text-2xl filter drop-shadow">🏆</span>}
                      {isObstacle && <span className="text-2xl filter drop-shadow">🪨</span>}
                      {isGem && !isPlayer && <span className="text-xl filter drop-shadow">💎</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Command Controls & Sequence Deck */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Plotted Steps ({commands.length}/12 max)
                </span>
                <div className="min-h-14 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 flex-wrap">
                  {commands.length === 0 ? (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Tap arrow buttons below to plot forward steps...
                    </span>
                  ) : (
                    commands.map((cmd, i) => (
                      <span
                        key={i}
                        className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs"
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

              {/* Arrow Keys */}
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                <div />
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('UP')}
                  className="p-3 bg-slate-100 hover:bg-emerald-50 active:scale-95 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-lg flex items-center justify-center"
                >
                  ⬆️
                </button>
                <div />
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('LEFT')}
                  className="p-3 bg-slate-100 hover:bg-emerald-50 active:scale-95 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-lg flex items-center justify-center"
                >
                  ⬅️
                </button>
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('DOWN')}
                  className="p-3 bg-slate-100 hover:bg-emerald-50 active:scale-95 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-lg flex items-center justify-center"
                >
                  ⬇️
                </button>
                <button
                  disabled={gameState === 'executing'}
                  onClick={() => addCommand('RIGHT')}
                  className="p-3 bg-slate-100 hover:bg-emerald-50 active:scale-95 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-lg flex items-center justify-center"
                >
                  ➡️
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={gameState === 'executing' || commands.length === 0}
                  onClick={removeLastCommand}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  title="Undo last step"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  disabled={gameState === 'executing' || commands.length === 0}
                  onClick={clearCommands}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  title="Clear all steps"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  disabled={gameState === 'executing' || commands.length === 0}
                  onClick={executePlan}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {gameState === 'executing' ? 'Moving...' : 'Execute Route'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary state */}
      {gameState === 'summary' && summaryData && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
            Route Mastered!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Multi-step forward planning and spatial working memory practiced.
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
              onClick={initGame}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors"
            >
              Return to World
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
