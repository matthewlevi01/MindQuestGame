import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp } from '../../utils/engine';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import { Target, Zap, Award, ArrowRight, Clock } from 'lucide-react';

interface FocusAcademyGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

interface TargetItem {
  id: number;
  shape: 'circle' | 'square' | 'star' | 'diamond' | 'triangle';
  icon: string;
  label: string;
  x: number;
  y: number;
  createdAt: number;
}

interface RuleDefinition {
  text: string;
  check: (item: { shape: string }) => boolean;
}

const RULE_PACKS: RuleDefinition[][] = [
  [
    { text: 'Phase 1 (1–7): Tap Stars ⭐ only!', check: (i) => i.shape === 'star' },
    { text: 'RULE SWITCH (8–14): Now tap Circles 🟢 only!', check: (i) => i.shape === 'circle' },
    { text: 'FINAL RULE (15–20): Tap Diamonds 💎 only!', check: (i) => i.shape === 'diamond' },
  ],
  [
    { text: 'Phase 1 (1–7): Tap Triangles 🔺 only!', check: (i) => i.shape === 'triangle' },
    { text: 'RULE SWITCH (8–14): Tap Squares 🟦 only!', check: (i) => i.shape === 'square' },
    { text: 'FINAL RULE (15–20): Tap Stars ⭐ only!', check: (i) => i.shape === 'star' },
  ],
  [
    { text: 'Phase 1 (1–7): Tap Diamonds 💎 only!', check: (i) => i.shape === 'diamond' },
    { text: 'RULE SWITCH (8–14): Tap Triangles 🔺 only!', check: (i) => i.shape === 'triangle' },
    { text: 'FINAL RULE (15–20): Tap Circles 🟢 only!', check: (i) => i.shape === 'circle' },
  ],
];

const INTRO_PROMPTS = [
  'Catch 20 matching targets as rules dynamically switch mid-mission!',
  'Lock in your attention across 20 target catches and resist distractors!',
  'Brand-new rule switch sequence ready! Catch 20 targets cleanly!',
];

export const FocusAcademyGame: React.FC<FocusAcademyGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  onFinish,
  onExit,
}) => {
  const TARGET_GOAL = 20;
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [playCount, setPlayCount] = useState(0);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [activeItems, setActiveItems] = useState<TargetItem[]>([]);
  const [hits, setHits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [showSwitchBanner, setShowSwitchBanner] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(90);
  const [remainingSeconds, setRemainingSeconds] = useState(90);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAmberAlert, setShowAmberAlert] = useState(false);
  const [amberMessage, setAmberMessage] = useState("So close! Avoid distractors and try again!");
  const [summaryData, setSummaryData] = useState<{
    score: number;
    accuracy: number;
    totalHits: number;
    falseAlarms: number;
    duration: number;
    avgReactionMs: number;
    xp: number;
    timedOut: boolean;
  } | null>(null);

  const itemCounterRef = useRef(0);
  const timeoutEndRef = useRef<() => void>(() => {});
  const packIndex = (loginSessionId + playCount) % RULE_PACKS.length;
  const rules = RULE_PACKS[packIndex];
  const currentRule = rules[currentRuleIndex] || rules[0];
  const introPrompt = INTRO_PROMPTS[(loginSessionId + playCount) % INTRO_PROMPTS.length];

  const startGame = () => {
    setPlayCount((p) => p + 1);
    setCurrentRuleIndex(0);
    setActiveItems([]);
    setHits(0);
    setFalseAlarms(0);
    setShowSwitchBanner(false);
    setShowAmberAlert(false);
    setReactionTimes([]);
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

  const triggerRuleSwitch = (newIndex: number) => {
    soundEngine.playRuleSwitchAlert();
    setCurrentRuleIndex(newIndex);
    setShowSwitchBanner(true);
    setTimeout(() => {
      setShowSwitchBanner(false);
    }, 2200);
  };

  useEffect(() => {
    if (gameState !== 'playing' || !currentRule?.text) return;
    speakChildQuestion(currentRule.text, child.calculatedAge, child.band);
    return () => stopVoice();
  }, [gameState, currentRuleIndex, currentRule?.text, child.calculatedAge, child.band]);

  useEffect(() => {
    if (gameState !== 'playing' || showAmberAlert) return;

    const spawnIntervalMs = child.band === 'young_explorers' ? 1100 : 800;

    const spawner = setInterval(() => {
      const shapes: TargetItem['shape'][] = ['circle', 'square', 'star', 'diamond', 'triangle'];
      // Bias slightly toward target shape so 20 catches remain snappy and engaging
      const targetShapes = shapes.filter((s) => currentRule.check({ shape: s }));
      const useTarget = Math.random() < 0.48 && targetShapes.length > 0;
      const randomShape = useTarget
        ? targetShapes[Math.floor(Math.random() * targetShapes.length)]
        : shapes[Math.floor(Math.random() * shapes.length)];

      const shapeMeta: Record<TargetItem['shape'], { icon: string; label: string }> = {
        star: { icon: '⭐', label: 'Star' },
        circle: { icon: '🟢', label: 'Circle' },
        diamond: { icon: '💎', label: 'Diamond' },
        square: { icon: '🟦', label: 'Square' },
        triangle: { icon: '🔺', label: 'Triangle' },
      };

      const newItem: TargetItem = {
        id: ++itemCounterRef.current,
        shape: randomShape,
        icon: shapeMeta[randomShape].icon,
        label: shapeMeta[randomShape].label,
        x: Math.floor(Math.random() * 76) + 12,
        y: Math.floor(Math.random() * 66) + 17,
        createdAt: Date.now(),
      };

      setActiveItems((prev) => [...prev.slice(-7), newItem]);
    }, spawnIntervalMs);

    return () => clearInterval(spawner);
  }, [gameState, currentRule, showAmberAlert, child.band]);

  const handleItemClick = (item: TargetItem) => {
    if (showAmberAlert) return;
    const isTargetNow = currentRule.check({ shape: item.shape });
    const reactionTime = Date.now() - item.createdAt;

    setActiveItems((prev) => prev.filter((i) => i.id !== item.id));

    if (isTargetNow) {
      soundEngine.playSuccess();
      const nextHits = hits + 1;
      setHits(nextHits);
      setShowConfetti(true);
      setReactionTimes((times) => [...times, reactionTime]);

      if (nextHits === 7 && currentRuleIndex === 0) {
        triggerRuleSwitch(1);
      } else if (nextHits === 14 && currentRuleIndex === 1) {
        triggerRuleSwitch(2);
      }

      if (nextHits >= TARGET_GOAL) {
        endGame(nextHits, falseAlarms);
      }
    } else {
      soundEngine.playGentleError();
      const nextFalse = falseAlarms + 1;
      setFalseAlarms(nextFalse);
      setAmberMessage(
        nextFalse % 2 === 1
          ? "Oops, that's a distractor! Watch the rule banner and try again!"
          : "So close! Tap only the shape listed in the active rule!"
      );
      setShowAmberAlert(true);
    }
  };

  const endGame = (finalHits: number, finalFalseAlarms: number, timedOut = false) => {
    stopVoice();
    setShowAmberAlert(false);
    const duration = timedOut
      ? totalTimerSeconds
      : Math.max(5, Math.floor((Date.now() - startTime) / 1000));
    const denominator = timedOut
      ? Math.max(TARGET_GOAL, finalHits + finalFalseAlarms)
      : Math.max(1, finalHits + finalFalseAlarms);
    const accuracy = Math.round((finalHits / denominator) * 100);
    const score = Math.max(0, finalHits * 10 - finalFalseAlarms * 2);
    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 650;
    const isFlawless = !timedOut && finalFalseAlarms === 0 && finalHits >= TARGET_GOAL;
    const xp = calculateRewardXp(accuracy, difficulty, isFlawless) + 20;

    soundEngine.playFanfare();
    setShowConfetti(true);

    const session: GameSession = {
      id: `session-${Date.now()}`,
      childId: child.id,
      gameId: 'focus_hunter',
      gameTitle: 'Target Hunter & Rule Switch',
      domain: 'attention',
      focusArea: 'concentration',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      difficultyLevel: difficulty,
      accuracy,
      responseTimeMs: avgReaction,
      mistakes: finalFalseAlarms,
      hintsUsed: 0,
      xpEarned: xp,
      score,
      timedOut,
      completed: true,
      details: {
        hits: finalHits,
        falseAlarms: finalFalseAlarms,
        ruleSwitchesAdapted: currentRuleIndex,
        score,
        timedOut,
      },
    };

    setSummaryData({
      score,
      accuracy,
      totalHits: finalHits,
      falseAlarms: finalFalseAlarms,
      duration,
      avgReactionMs: avgReaction,
      xp,
      timedOut,
    });
    setGameState('summary');
    onFinish(session);
  };

  timeoutEndRef.current = () => endGame(hits, falseAlarms, true);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => timeoutEndRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 select-none font-child">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-[#53b0c9] shadow-xl text-center max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#53b0c9] text-black flex items-center justify-center shadow-md">
            <Target className="w-10 h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
            Focus Academy: Rule Switch
          </h2>
          <p className="text-black mb-6 text-base leading-relaxed">
            {introPrompt}
          </p>

          <div className="bg-[#ffd400]/25 border border-[#ffd400] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Target Goal
              </span>
              <span className="text-sm font-black text-black">{TARGET_GOAL} Catches</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Rule Switches
              </span>
              <span className="text-sm font-black text-[#7f27a8]">2 Live Transitions</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                Domain
              </span>
              <span className="text-sm font-black text-black">Concentration</span>
            </div>
          </div>

          <GameInstructionBox
            instruction={`Welcome to Focus Academy, ${child.name}! Tap only the shapes matching the yellow rule banner until you catch 20 targets. Watch closely — the rule switches twice during the mission!`}
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
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Begin 20-Target Hunt <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="relative bg-white rounded-3xl p-5 border-2 border-[#53b0c9] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#53b0c9]/30">
            <div className="flex items-center gap-5">
              <div>
                <span className="text-xs font-black text-black/70 uppercase mr-2">Targets Caught</span>
                <span className="font-black text-[#7f27a8] text-lg tabular-nums">
                  {hits} / {TARGET_GOAL}
                </span>
              </div>
              <div>
                <span className="text-xs font-black text-black/70 uppercase mr-2">Distractors Hit</span>
                <span className="font-black text-[#c1008f] tabular-nums">{falseAlarms}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                className="px-4 py-1.5 text-xs font-bold text-black hover:bg-[#ffd400]/30 rounded-xl border border-black/20 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          <GameProgressBar
            current={hits}
            total={TARGET_GOAL}
            unitLabel="targets"
            accentBgClass="bg-[#f76400]"
          />

          <div
            className={`px-6 py-3.5 rounded-2xl mb-4 font-black text-center transition-all border-2 ${
              showSwitchBanner
                ? 'bg-[#f76400] border-black text-white shadow-lg animate-bounce'
                : 'bg-[#ffd400] border-black text-black'
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span className="text-base md:text-lg">{currentRule.text}</span>
              </div>
              <QuestionSpeakerButton
                text={currentRule.text}
                age={child.calculatedAge}
                band={child.band}
                label="Hear Rule"
              />
            </div>
          </div>

          <div className="relative h-96 w-full bg-[#7f27a8] rounded-3xl overflow-hidden border-2 border-black shadow-inner">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {activeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 p-3 bg-white hover:bg-[#ffd400] active:scale-90 transition-transform rounded-2xl border-2 border-black shadow-lg cursor-pointer flex items-center justify-center"
              >
                <span className="text-3xl md:text-4xl">{item.icon}</span>
              </button>
            ))}

            {activeItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                Target shapes incoming...
              </div>
            )}
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
            {summaryData.timedOut ? "Time's Up!" : '20 Targets Captured!'}
          </h2>
          <p className="text-black/75 text-sm mb-5 font-medium">
            Captured {summaryData.totalHits} of {TARGET_GOAL} targets across dynamic rule switches.
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
              onClick={startGame}
              className="px-5 py-3 rounded-xl border-2 border-black text-black hover:bg-[#ffd400]/25 font-black transition-colors cursor-pointer"
            >
              Play New Rule Pack
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
        onRetry={() => setShowAmberAlert(false)}
      />
    </div>
  );
};
