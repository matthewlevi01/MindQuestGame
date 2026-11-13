import React, { useState } from 'react';
import { DevelopmentalBand } from '../../types';
import { speakChildQuestion } from '../../utils/voiceService';
import { Volume2 } from 'lucide-react';

interface QuestionSpeakerButtonProps {
  text: string;
  age: number;
  band?: DevelopmentalBand;
  label?: string;
}

export const QuestionSpeakerButton: React.FC<QuestionSpeakerButtonProps> = ({
  text,
  age,
  band,
  label = 'Hear Question',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleClick = () => {
    speakChildQuestion(text, age, band, {
      force: true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-black text-xs font-black transition-all cursor-pointer shrink-0 ${
        isSpeaking
          ? 'bg-[#f76400] text-white animate-pulse'
          : 'bg-[#ffd400] hover:bg-[#53b0c9] text-black'
      }`}
      title="Read question aloud"
    >
      <Volume2 className="w-3.5 h-3.5" />
      <span>{isSpeaking ? 'Speaking...' : label}</span>
    </button>
  );
};
