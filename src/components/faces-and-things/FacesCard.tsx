import React from 'react';
import { FacesCardItem, speakCardName } from '../../data/facesAndThingsDeck';
import { Volume2, Sparkles, HelpCircle, Check, X } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

export interface FacesCardProps {
  card: FacesCardItem;
  isFlipped?: boolean;
  isMasked?: boolean;
  isSelected?: boolean;
  isTarget?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isDimmed?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAudioButton?: boolean;
  audioAutoPlay?: boolean;
  onClick?: () => void;
  badgeText?: string;
  className?: string;
}

export const FacesCard: React.FC<FacesCardProps> = ({
  card,
  isFlipped = false,
  isMasked = false,
  isSelected = false,
  isTarget = false,
  isCorrect = false,
  isWrong = false,
  isDimmed = false,
  size = 'md',
  showAudioButton = true,
  onClick,
  badgeText,
  className = '',
}) => {
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPop();
    speakCardName(card.name);
  };

  const sizeClasses = {
    sm: 'w-24 h-32 md:w-28 md:h-36 text-xs',
    md: 'w-32 h-44 md:w-36 md:h-48 text-sm',
    lg: 'w-40 h-52 md:w-48 md:h-60 text-base',
    xl: 'w-48 h-64 md:w-56 md:h-72 text-lg',
  }[size];

  const emojiSizes = {
    sm: 'text-3xl md:text-4xl',
    md: 'text-4xl md:text-5xl',
    lg: 'text-5xl md:text-6xl',
    xl: 'text-6xl md:text-7xl',
  }[size];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Card back: Who or What' : isMasked ? 'Hidden card' : card.name}
      className={`relative select-none perspective-[1000px] cursor-pointer transition-transform duration-200 active:scale-95 ${sizeClasses} ${
        isDimmed ? 'opacity-40 grayscale-[40%]' : ''
      } ${className}`}
    >
      <div
        className={`w-full h-full relative transition-transform duration-500 transform-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* CARD FRONT */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl bg-white border-2 flex flex-col justify-between overflow-hidden shadow-md backface-hidden transition-all ${
            isCorrect
              ? 'border-[#ffd400] ring-4 ring-[#ffd400]'
              : isWrong
              ? 'border-[#c1008f] ring-4 ring-[#c1008f]'
              : isTarget
              ? 'border-[#f76400] ring-4 ring-[#ffd400] animate-pulse'
              : isSelected
              ? 'border-[#7f27a8] ring-4 ring-[#e885cf] shadow-lg'
              : 'border-[#53b0c9] hover:border-[#7f27a8] hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between px-2 pt-1.5 z-10">
            <span
              className={`text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded-full ${
                card.category === 'character'
                  ? 'bg-[#ffd400] text-black'
                  : card.category === 'animal'
                  ? 'bg-[#53b0c9] text-black'
                  : 'bg-[#e885cf] text-black'
              }`}
            >
              {card.category}
            </span>

            {showAudioButton && !isMasked && (
              <button
                type="button"
                onClick={handleAudioClick}
                className="w-6 h-6 rounded-full bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shadow-2xs cursor-pointer"
                title={`Hear "${card.name}" spoken`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-0.5">
            <div
              className="absolute inset-2 rounded-full opacity-35 filter blur-[1px] transform scale-110 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, #ffd400 0%, #f76400 50%, #e885cf 85%, transparent 100%)',
              }}
            />

            <div className={`relative z-10 ${emojiSizes} transform transition-transform filter drop-shadow-sm`}>
              {card.emoji}
            </div>

            {isCorrect && (
              <div className="absolute inset-0 bg-[#ffd400]/30 z-20 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#7f27a8] text-white flex items-center justify-center shadow-md animate-bounce">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            )}
            {isWrong && (
              <div className="absolute inset-0 bg-[#c1008f]/30 z-20 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#c1008f] text-white flex items-center justify-center shadow-md">
                  <X className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          <div className="px-2 pb-2 pt-1 text-center bg-white z-10">
            {isMasked ? (
              <div className="bg-[#ffd400] text-black font-black rounded-lg py-1 px-2 flex items-center justify-center gap-1 border border-black animate-pulse">
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="text-xs tracking-wider">???</span>
              </div>
            ) : (
              <div className="font-black text-black tracking-tight truncate px-1">
                {card.name}
              </div>
            )}

            {badgeText && (
              <div className="text-[10px] font-black text-white bg-[#7f27a8] rounded-md py-0.5 mt-0.5">
                {badgeText}
              </div>
            )}
          </div>
        </div>

        {/* CARD BACK: Strictly "Who or What" in Brand Palette */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-[#7f27a8] border-2 border-[#ffd400] p-2.5 flex flex-col items-center justify-center shadow-xl backface-hidden rotate-y-180 overflow-hidden"
        >
          <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#ffd400]/70 pointer-events-none" />
          <div
            className="absolute w-28 h-28 rounded-full opacity-55 filter blur-sm pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #ffd400 0%, #c1008f 55%, #f76400 85%, transparent 100%)',
            }}
          />

          <div className="relative z-10 text-center flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-[#ffd400] mb-1 animate-pulse" />
            <div className="font-black text-[#ffd400] text-[10px] tracking-widest uppercase">
              FACES &amp; THINGS
            </div>
            <div className="font-black text-white text-base md:text-xl leading-tight mt-0.5 tracking-tight">
              Who or What
            </div>
            <div className="w-8 h-1 bg-[#ffd400] mt-1.5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
