import React, { useEffect, useState } from 'react';
import { DevelopmentalBand } from '../../types';
import { speakGameInstruction, stopVoice } from '../../utils/voiceService';
import { Volume2, Square, Info } from 'lucide-react';

interface GameInstructionBoxProps {
  title?: string;
  instruction: string;
  age: number;
  band?: DevelopmentalBand;
  autoSpeak?: boolean;
}

export const GameInstructionBox: React.FC<GameInstructionBoxProps> = ({
  title = 'How to Play',
  instruction,
  age,
  band,
  autoSpeak = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlay = () => {
    speakGameInstruction(instruction, age, band, {
      force: true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleStop = () => {
    stopVoice();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!autoSpeak) return;
    const timer = setTimeout(() => {
      speakGameInstruction(instruction, age, band, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }, 180);

    return () => {
      clearTimeout(timer);
      stopVoice();
      setIsSpeaking(false);
    };
  }, [instruction, age, band, autoSpeak]);

  return (
    <div className="bg-[#e885cf]/20 border-2 border-[#7f27a8] rounded-2xl p-4 mb-5 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-black">
          <div className="w-7 h-7 rounded-lg bg-[#7f27a8] text-white flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#7f27a8]">
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={isSpeaking ? handleStop : handlePlay}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-black text-xs font-black transition-colors cursor-pointer ${
            isSpeaking
              ? 'bg-[#f76400] text-white animate-pulse'
              : 'bg-[#ffd400] hover:bg-[#53b0c9] text-black'
          }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Read Instructions</span>
            </>
          )}
        </button>
      </div>

      <p className="text-sm font-bold text-black leading-relaxed">{instruction}</p>
    </div>
  );
};
