import React from 'react';
import { AlertTriangle, RotateCcw, Heart } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface AmberFailureAlertProps {
  isOpen: boolean;
  onRetry: () => void;
  customMessage?: string;
}

const ENCOURAGING_MESSAGES = [
  "You didn't get it this time. Let's try again!",
  "So close! Let's try again!",
  "Almost had it! Every try makes your brain stronger — let's try again!",
  "Great effort! Take a deep breath and try again!",
];

export const AmberFailureAlert: React.FC<AmberFailureAlertProps> = ({
  isOpen,
  onRetry,
  customMessage,
}) => {
  if (!isOpen) return null;

  const message =
    customMessage ||
    ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#f76400]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn font-child"
    >
      {/* Full-Screen Amber Alert Warning Stripes at Top & Bottom */}
      <div className="fixed top-0 left-0 right-0 h-4 bg-gradient-to-r from-red-600 via-[#ffd400] to-red-600 animate-pulse shadow-lg" />
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-red-600 via-[#ffd400] to-red-600 animate-pulse shadow-lg" />

      {/* Main Amber Alert Container */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#ffd400] p-1.5 shadow-2xl border-4 border-red-600 animate-scaleUp">
        <div className="bg-white rounded-[20px] p-6 sm:p-8 text-center text-black flex flex-col items-center relative overflow-hidden">
          {/* Top Red Alert Banner on Screen */}
          <div className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl shadow-lg border-2 border-[#ffd400] mb-5 animate-pulse">
            <span className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
            <AlertTriangle className="w-5 h-5 fill-white text-red-600 shrink-0" />
            <span>RED ALERT · TRY AGAIN!</span>
          </div>

          {/* Warm Encouraging Icon */}
          <div className="w-20 h-20 rounded-3xl bg-[#ffd400]/30 border-4 border-[#f76400] flex items-center justify-center text-red-600 mb-4 shadow-inner">
            <Heart className="w-10 h-10 fill-red-500 text-red-600 animate-bounce" />
          </div>

          {/* Headline */}
          <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">
            Amber Alert: Keep Going!
          </h3>

          {/* Encouraging Message */}
          <div className="bg-[#ffd400]/20 border-2 border-[#f76400] rounded-2xl px-4 py-3.5 mb-6 w-full shadow-xs">
            <p className="text-base sm:text-lg font-extrabold text-black leading-snug">
              &ldquo;{message}&rdquo;
            </p>
          </div>

          {/* Retry CTA */}
          <button
            onClick={() => {
              soundEngine.playPop();
              onRetry();
            }}
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl border-b-4 border-red-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <RotateCcw className="w-5 h-5 stroke-[3]" />
            <span>Let&apos;s Try Again!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
