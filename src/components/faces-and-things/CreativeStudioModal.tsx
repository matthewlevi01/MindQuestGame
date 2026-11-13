import React, { useState, useRef, useEffect } from 'react';
import { FacesCardItem } from '../../data/facesAndThingsDeck';
import { FacesCard } from './FacesCard';
import { Mic, Square, Sparkles, Award, RefreshCw, X } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface CreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: FacesCardItem;
  animal: FacesCardItem;
  object: FacesCardItem;
  onNewCards: () => void;
  onSaveStory: (storyTitle: string, xpBonus: number) => void;
}

export const CreativeStudioModal: React.FC<CreativeStudioModalProps> = ({
  isOpen,
  onClose,
  character,
  animal,
  object,
  onNewCards,
  onSaveStory,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [storySaved, setStorySaved] = useState(false);
  const [writtenStory, setWrittenStory] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      soundEngine.playPop();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      // Child can type or recite aloud
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      soundEngine.playSuccess();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFinish = () => {
    setStorySaved(true);
    soundEngine.playFanfare();
    onSaveStory(`${character.name}'s Adventure with ${animal.name}`, 60);
    setTimeout(() => {
      onClose();
      setStorySaved(false);
      setAudioUrl(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-child">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-[#ffd400] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-widest bg-[#e885cf] text-black px-3 py-1 rounded-full">
            Creative Story Studio
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
            Alternate Realities &amp; Story Chain
          </h2>
          <p className="text-sm text-black/80 max-w-lg mx-auto mt-1 font-medium">
            Original creative storytelling game by Matthew Onaneye. Look at these 3 cards and
            invent the funniest role-reversal tale you can imagine!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <FacesCard card={character} size="sm" />
          <span className="text-2xl font-black text-[#f76400]">+</span>
          <FacesCard card={animal} size="sm" />
          <span className="text-2xl font-black text-[#f76400]">+</span>
          <FacesCard card={object} size="sm" />
        </div>

        <div className="bg-[#53b0c9]/20 border-2 border-dashed border-[#53b0c9] rounded-2xl p-4 text-center mb-6">
          <div className="text-xs uppercase font-black text-[#7f27a8] tracking-wider mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-[#f76400]" />
            <span>Story Spark Prompt</span>
          </div>
          <p className="text-base md:text-lg font-bold text-black italic">
            &ldquo;One sunny morning, <span className="text-[#7f27a8] underline font-black">{character.name}</span> saw a{' '}
            <span className="text-[#c1008f] underline font-black">{animal.name}</span> balancing a{' '}
            <span className="text-[#f76400] underline font-black">{object.name}</span> on its nose! What happened next?&rdquo;
          </p>

          <button
            onClick={() => {
              soundEngine.playPop();
              onNewCards();
            }}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-black hover:bg-[#ffd400] text-black text-xs font-black transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Draw 3 New Cards</span>
          </button>
        </div>

        <div className="bg-[#ffd400]/20 rounded-2xl p-4 border-2 border-[#ffd400] mb-6 flex flex-col items-center">
          <div className="text-xs uppercase font-black text-black mb-2">
            Record Your Voice Story
          </div>

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c1008f] hover:bg-[#7f27a8] text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Start Recording Voice</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4 text-[#ffd400] fill-[#ffd400]" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="mt-4 w-full flex items-center justify-center gap-3 bg-white p-3 rounded-xl border border-black shadow-xs">
              <audio controls src={audioUrl} className="h-10 w-full max-w-sm" />
            </div>
          )}

          <div className="w-full mt-4">
            <input
              type="text"
              placeholder="Or write a sentence of your story here..."
              value={writtenStory}
              onChange={(e) => setWrittenStory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#7f27a8]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-black hover:bg-[#ffd400]/25 text-black font-black text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Finish &amp; Claim +60 XP!</span>
          </button>
        </div>

        {storySaved && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-6 z-30">
            <div className="text-6xl mb-3 animate-bounce">🎉</div>
            <h3 className="text-2xl font-black text-black">Brilliant Storyteller!</h3>
            <p className="text-[#7f27a8] font-black mt-1">+60 XP &amp; Creative Story Badge Earned!</p>
          </div>
        )}
      </div>
    </div>
  );
};
