import React from 'react';
import { Clock, Minus, Plus } from 'lucide-react';

interface GameTimerSetupProps {
  seconds: number;
  onChangeSeconds: (next: number) => void;
  minSeconds?: number;
  maxSeconds?: number;
  stepSeconds?: number;
}

export const formatTimerClock = (totalSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GameTimerSetup: React.FC<GameTimerSetupProps> = ({
  seconds,
  onChangeSeconds,
  minSeconds = 30,
  maxSeconds = 600,
  stepSeconds = 30,
}) => {
  const presets = [60, 120, 180, 300];

  return (
    <div className="bg-[#53b0c9]/20 border-2 border-[#53b0c9] rounded-2xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-black">
          <Clock className="w-5 h-5 text-[#7f27a8]" />
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-[#7f27a8] block">
              Race Against Time Timer
            </span>
            <span className="text-xs font-semibold text-black/80">
              Game ends and displays your score when time runs out
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeSeconds(Math.max(minSeconds, seconds - stepSeconds))}
            disabled={seconds <= minSeconds}
            className="p-2 rounded-xl bg-white hover:bg-[#ffd400] disabled:opacity-40 text-black border-2 border-black font-black transition-colors cursor-pointer"
            title={`Decrease timer by ${stepSeconds}s`}
            aria-label="Decrease timer"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="px-4 py-1.5 rounded-xl bg-[#ffd400] border-2 border-black font-black text-lg text-black tabular-nums min-w-[82px] text-center">
            {formatTimerClock(seconds)}
          </div>

          <button
            type="button"
            onClick={() => onChangeSeconds(Math.min(maxSeconds, seconds + stepSeconds))}
            disabled={seconds >= maxSeconds}
            className="p-2 rounded-xl bg-white hover:bg-[#ffd400] disabled:opacity-40 text-black border-2 border-black font-black transition-colors cursor-pointer"
            title={`Increase timer by ${stepSeconds}s`}
            aria-label="Increase timer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-black/75 mr-1">Quick Presets:</span>
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChangeSeconds(p)}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-colors cursor-pointer ${
              seconds === p
                ? 'bg-[#7f27a8] text-white border-black'
                : 'bg-white text-black border-[#7f27a8]/40 hover:bg-[#ffd400]'
            }`}
          >
            {Math.floor(p / 60)}m
          </button>
        ))}
      </div>
    </div>
  );
};

interface GameTimerHudProps {
  remainingSeconds: number;
  totalSeconds: number;
  onAdjustSeconds: (delta: number) => void;
  compact?: boolean;
}

export const GameTimerHud: React.FC<GameTimerHudProps> = ({
  remainingSeconds,
  totalSeconds,
  onAdjustSeconds,
  compact = false,
}) => {
  const safeTotal = Math.max(1, totalSeconds);
  const pct = Math.max(0, Math.min(100, (remainingSeconds / safeTotal) * 100));
  const isUrgent = remainingSeconds <= 15;
  const isWarning = remainingSeconds <= 30 && remainingSeconds > 15;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border-2 border-black px-2.5 py-1.5 transition-colors ${
        isUrgent
          ? 'bg-[#c1008f] text-white animate-pulse'
          : isWarning
          ? 'bg-[#f76400] text-white'
          : 'bg-[#ffd400] text-black'
      }`}
    >
      <Clock className="w-4 h-4 shrink-0" />
      <div className="flex flex-col min-w-[54px]">
        <span className="text-sm font-black leading-none tabular-nums">
          {formatTimerClock(remainingSeconds)}
        </span>
        {!compact && (
          <div className="w-full h-1 bg-black/20 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isUrgent || isWarning ? 'bg-white' : 'bg-[#7f27a8]'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-1">
        <button
          type="button"
          onClick={() => onAdjustSeconds(-15)}
          disabled={remainingSeconds <= 15}
          title="Decrease time by 15s"
          aria-label="Decrease time by 15 seconds"
          className="px-1.5 py-0.5 rounded-lg bg-white text-black hover:bg-[#53b0c9] disabled:opacity-40 border border-black text-[11px] font-black cursor-pointer"
        >
          -15s
        </button>
        <button
          type="button"
          onClick={() => onAdjustSeconds(15)}
          title="Increase time by 15s"
          aria-label="Increase time by 15 seconds"
          className="px-1.5 py-0.5 rounded-lg bg-white text-black hover:bg-[#53b0c9] border border-black text-[11px] font-black cursor-pointer"
        >
          +15s
        </button>
      </div>
    </div>
  );
};
