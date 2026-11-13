import { DevelopmentalBand } from '../types';

export type VoiceRole = 'question' | 'instruction';

interface SpeakOptions {
  age?: number;
  band?: DevelopmentalBand;
  force?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

const ttsAudioCache = new Map<string, string>();
let soundEnabled = true;
let soundVolume = 0.85;
let activeAudioEl: HTMLAudioElement | null = null;
let currentSpeechToken = 0;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    window.speechSynthesis.getVoices();
  });
}

export function setVoicePreferences(enabled: boolean, volume: number): void {
  soundEnabled = enabled;
  soundVolume = Math.max(0.1, Math.min(1, volume));
  if (!enabled) {
    stopVoice();
  }
}

export function stopVoice(): void {
  currentSpeechToken += 1;

  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
      activeAudioEl.src = '';
    } catch {
      // Ignore cleanup errors
    }
    activeAudioEl = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speechSynthesis cancel errors
    }
  }
}

/**
 * Strip emojis and awkward math symbols so TTS reads natural spoken English.
 */
function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/\+/g, ' plus ')
    .replace(/=/g, ' equals ')
    .replace(/\?/g, '? ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAgeVoiceProfile(
  role: VoiceRole,
  age: number,
  band?: DevelopmentalBand
): { pitch: number; rate: number } {
  if (role === 'instruction') {
    // Natural, clear conversational narrator voice for pre-game instructions
    return { pitch: 1.04, rate: 0.95 };
  }

  const effectiveAge =
    Number.isFinite(age) && age > 0
      ? age
      : band === 'young_explorers'
      ? 6
      : band === 'senior_explorers'
      ? 9
      : band === 'discoverers'
      ? 12
      : 15;

  if (effectiveAge <= 5) {
    return { pitch: 1.65, rate: 0.88 };
  }
  if (effectiveAge <= 7) {
    return { pitch: 1.52, rate: 0.92 };
  }
  if (effectiveAge <= 10) {
    return { pitch: 1.38, rate: 0.96 };
  }
  if (effectiveAge <= 13) {
    return { pitch: 1.24, rate: 1.0 };
  }
  return { pitch: 1.12, rate: 1.02 };
}

function pickBestSystemVoice(role: VoiceRole): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pool = enVoices.length > 0 ? enVoices : voices;

  if (role === 'instruction') {
    const preferredNames = ['Natural', 'Google US English', 'Google UK English Female', 'Samantha', 'Daniel', 'Aria', 'Jenny'];
    for (const key of preferredNames) {
      const found = pool.find((v) => v.name.includes(key));
      if (found) return found;
    }
    return pool[0];
  }

  // Prefer lighter/brighter female or youth-friendly base voices before applying age pitch shift
  const childFriendlyNames = [
    'Google UK English Female',
    'Google US English',
    'Samantha',
    'Victoria',
    'Karen',
    'Tessa',
    'Aria',
    'Jenny',
    'Zira',
  ];
  for (const key of childFriendlyNames) {
    const found = pool.find((v) => v.name.includes(key));
    if (found) return found;
  }
  return pool[0];
}

function speakWithWebSpeech(
  text: string,
  role: VoiceRole,
  age: number,
  band: DevelopmentalBand | undefined,
  token: number,
  options?: SpeakOptions
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  if (token !== currentSpeechToken) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const { pitch, rate } = getAgeVoiceProfile(role, age, band);
    const voice = pickBestSystemVoice(role);

    if (voice) utterance.voice = voice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = soundVolume;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      if (token === currentSpeechToken) options?.onStart?.();
    };
    utterance.onend = () => {
      if (token === currentSpeechToken) options?.onEnd?.();
    };
    utterance.onerror = () => {
      if (token === currentSpeechToken) options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    options?.onEnd?.();
  }
}

async function speakText(
  rawText: string,
  role: VoiceRole,
  options: SpeakOptions = {}
): Promise<void> {
  if (!soundEnabled && !options.force) {
    options.onEnd?.();
    return;
  }

  const spokenText = cleanTextForSpeech(rawText);
  if (!spokenText) {
    options.onEnd?.();
    return;
  }

  stopVoice();
  const token = currentSpeechToken;
  const age = options.age ?? 7;
  const band = options.band;
  const ageBucket = age <= 5 ? '4' : age <= 7 ? '6' : age <= 10 ? '9' : age <= 13 ? '12' : '15';
  const cacheKey = `${role}:${ageBucket}:${spokenText}`;

  const playBase64Wav = (base64: string) => {
    if (token !== currentSpeechToken) return;
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audio.volume = soundVolume;
      activeAudioEl = audio;
      audio.onplay = () => {
        if (token === currentSpeechToken) options.onStart?.();
      };
      audio.onended = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        if (token === currentSpeechToken) options.onEnd?.();
      };
      audio.onerror = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        speakWithWebSpeech(spokenText, role, age, band, token, options);
      };
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          speakWithWebSpeech(spokenText, role, age, band, token, options);
        });
      }
    } catch {
      speakWithWebSpeech(spokenText, role, age, band, token, options);
    }
  };

  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    playBase64Wav(cached);
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spokenText, role, age }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (token !== currentSpeechToken) return;

    if (res.ok) {
      const data = await res.json();
      if (data?.audioBase64 && typeof data.audioBase64 === 'string') {
        ttsAudioCache.set(cacheKey, data.audioBase64);
        playBase64Wav(data.audioBase64);
        return;
      }
    }
  } catch {
    // Seamless client speechSynthesis fallback
  }

  speakWithWebSpeech(spokenText, role, age, band, token, options);
}

/**
 * Reads game instructions aloud in a warm, natural host voice before the game begins.
 */
export function speakGameInstruction(
  instructionText: string,
  age: number,
  band?: DevelopmentalBand,
  options?: Omit<SpeakOptions, 'age' | 'band'>
): void {
  void speakText(instructionText, 'instruction', { ...options, age, band });
}

/**
 * Asks in-game questions using a voice tuned to a little child in that age range.
 */
export function speakChildQuestion(
  questionText: string,
  age: number,
  band?: DevelopmentalBand,
  options?: Omit<SpeakOptions, 'age' | 'band'>
): void {
  void speakText(questionText, 'question', { ...options, age, band });
}
