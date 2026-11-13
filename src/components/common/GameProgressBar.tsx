import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface GameProgressBarProps {
  current: number;
  total: number;
  unitLabel?: string;
  accentBgClass?: string;
}

export const GameProgressBar: React.FC<GameProgressBarProps> = ({
  current,
  total,
  unitLabel = 'questions',
  accentBgClass = 'bg-[#f76400]',
}) => {
  const safeTotal = Math.max(1, total);
  const clampedCurrent = Math.max(0, Math.min(safeTotal, current));
  const pct = Math.round((clampedCurrent / safeTotal) * 100);
  const remaining = Math.max(0, safeTotal - clampedCurrent);

  const statusText =
    clampedCurrent === 0
      ? 'Ready to go — answer your first challenge!'
      : clampedCurrent >= safeTotal
      ? `All ${safeTotal} ${unitLabel} completed!`
      : pct >= 75
      ? `Final stretch — only ${remaining} ${unitLabel} left!`
      : pct >= 50
      ? `Halfway there! ${remaining} ${unitLabel} remaining`
      : `Great start! ${remaining} ${unitLabel} to go`;

  return (
    <div className="mb-5 bg-[#53b0c9]/15 border-2 border-[#53b0c9] rounded-2xl p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-black text-black">
        <span className="flex items-center gap-1.5">
          {clampedCurrent >= safeTotal ? (
            <CheckCircle2 className="w-4 h-4 text-[#7f27a8]" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#f76400]" />
          )}
          <span>
            Progress: {clampedCurrent} / {safeTotal} {unitLabel}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-black/75 hidden sm:inline">
            {statusText}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-[#ffd400] border border-black text-black text-[11px] font-black tabular-nums">
            {pct}%
          </span>
        </div>
      </div>

      <div className="relative w-full h-4 bg-white rounded-xl border-2 border-black overflow-hidden shadow-inner">
        {/* Quarter milestone ticks */}
        <div className="absolute inset-0 flex pointer-events-none z-10">
          <div className="w-1/4 border-r border-black/20 h-full" />
          <div className="w-1/4 border-r border-black/20 h-full" />
          <div className="w-1/4 border-r border-black/20 h-full" />
          <div className="w-1/4 h-full" />
        </div>

        {/* Animated fill */}
        <div
          className={`h-full ${accentBgClass} transition-all duration-500 ease-out flex items-center justify-end pr-1.5`}
          style={{ width: `${pct}%` }}
        >
          {pct >= 12 && (
            <span className="w-2 h-2 rounded-full bg-[#ffd400] border border-black shrink-0" />
          )}
        </div>
      </div>

      <div className="text-[11px] font-bold text-black/75 mt-1.5 sm:hidden text-center">
        {statusText}
      </div>
    </div>
  );
};
