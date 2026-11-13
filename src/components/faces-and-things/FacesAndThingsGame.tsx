import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, GameSession } from '../../types';
import {
  FacesCardItem,
  ALL_FACES_DECK,
  FACES_CHARACTERS,
  FACES_ANIMALS,
  FACES_OBJECTS,
  playCardRiff,
} from '../../data/facesAndThingsDeck';
import { pickNonRepeatingItems } from '../../data/questionBank';
import {
  fetchSongsForSession,
  playInternetSongClip,
  stopCurrentSong,
  InternetSongTrack,
} from '../../utils/musicService';
import { FacesCard } from './FacesCard';
import { TreasureMapView, TreasurePlottedItem } from './TreasureMapView';
import { CreativeStudioModal } from './CreativeStudioModal';
import { soundEngine } from '../../utils/sound';
import { calculateRewardXp, getAgeBasedCardConfig } from '../../utils/engine';
import { ConfettiOverlay } from '../common/ConfettiOverlay';
import { AmberFailureAlert } from '../common/AmberFailureAlert';
import { GameTimerSetup, GameTimerHud, formatTimerClock } from '../common/GameTimerBar';
import { GameProgressBar } from '../common/GameProgressBar';
import { GameInstructionBox } from '../common/GameInstructionBox';
import { QuestionSpeakerButton } from '../common/QuestionSpeakerButton';
import { speakChildQuestion, stopVoice } from '../../utils/voiceService';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  EyeOff,
  Music,
  User,
  Users,
} from 'lucide-react';

export type MiniGameMode =
  | 'who_is_this'
  | 'who_is_here'
  | 'who_is_missing'
  | 'who_owns_what'
  | 'who_moved'
  | 'position_tracker'
  | 'whats_their_position'
  | 'who_sang_what'
  | 'memory_train'
  | 'find_the_treasure'
  | 'creative_studio';

export type AgeTier = 'tier1' | 'tier2' | 'tier3';

interface FacesAndThingsGameProps {
  child: ChildProfile;
  difficulty: number;
  loginSessionId?: number;
  initialMode?: MiniGameMode;
  lockedMode?: boolean;
  gameId?: string;
  gameTitle?: string;
  onFinish: (session: GameSession) => void;
  onExit: () => void;
}

const STUDY_BANNERS = [
  'Study Phase: Look & Remember',
  'Memory Scan: Lock These In!',
  'Eagle Eyes: Spot Every Detail!',
  'Brain Snapshot: Ready to Recall?',
];

function getModeInstruction(mode: MiniGameMode, cardCount: number, playerName: string): string {
  switch (mode) {
    case 'who_is_this':
      return `Hi ${playerName}! Study the ${cardCount} faces and objects carefully. When one mystery card hides behind a mask, pick its real name from the choices below!`;
    case 'who_is_here':
      return `Hi ${playerName}! Memorize which card sits in each spot on the grid. When the cards flip over to "Who or What", remember who is hiding in the highlighted spot!`;
    case 'who_is_missing':
      return `Hi ${playerName}! Look closely at every card on the table. When the curtain drops and rises again, spot which character or object slipped away!`;
    case 'who_owns_what':
      return `Hi ${playerName}! Remember which item each character brought with them today, then match the right owner to their belonging!`;
    case 'who_moved':
      return `Hi ${playerName}! Memorize the numbered spots carefully. While the curtain closes, two cards swap seats — tap both cards that moved!`;
    case 'position_tracker':
      return `Hi ${playerName}! Keep your eyes glued to the target character as the cards flip face down and shuffle around, then tap where they landed!`;
    case 'whats_their_position':
      return `Hi ${playerName}! Notice the exact number position of each card in line, then answer which number spot the mystery card held!`;
    case 'who_sang_what':
      return `Hi ${playerName}! Tap Hear Song beneath each character to listen to their internet music clip, then play the Mystery Song and pick who sang it!`;
    case 'memory_train':
      return `Hi ${playerName}! Watch items hop onto the Memory Train one by one, then tap the passengers in the exact same order from start to finish!`;
    case 'find_the_treasure':
      return `Hi ${playerName}! Scan the treasure map grid and tap the exact square where the hidden character or treasure is waiting!`;
    case 'creative_studio':
      return `Hi ${playerName}! Mix surprise characters, animals, and objects to invent your own playful story!`;
    default:
      return `Hi ${playerName}! Study each card carefully and answer all 20 memory challenges before the timer ends!`;
  }
}

export const FacesAndThingsGame: React.FC<FacesAndThingsGameProps> = ({
  child,
  difficulty,
  loginSessionId = 1,
  initialMode = 'who_is_this',
  lockedMode = true,
  gameId = 'faces_who_is_this',
  gameTitle = 'Faces & Things',
  onFinish,
  onExit,
}) => {
  const ageConfig = getAgeBasedCardConfig(child.calculatedAge, difficulty);

  const initialTier: AgeTier =
    ageConfig.age <= 4 ? 'tier1' : ageConfig.age <= 8 ? 'tier2' : 'tier3';

  const [activeTier] = useState<AgeTier>(initialTier);
  const [playMode, setPlayMode] = useState<'solo' | 'co_play'>('solo');
  const [activeTurn, setActiveTurn] = useState<1 | 2>(1);
  const [playerScores, setPlayerScores] = useState({ p1: 0, p2: 0 });

  const [activeMode, setActiveMode] = useState<MiniGameMode>(initialMode);
  const [gamePhase, setGamePhase] = useState<'intro' | 'study' | 'quiz' | 'feedback' | 'finished'>('intro');

  const [studyTimeRemaining, setStudyTimeRemaining] = useState<number>(ageConfig.studySeconds);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swapIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Race-against-time countdown timer
  const [timerSeconds, setTimerSeconds] = useState<number>(240);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState<number>(240);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(240);
  const [didTimeOut, setDidTimeOut] = useState<boolean>(false);
  const timeoutCompleteRef = useRef<() => void>(() => {});

  // 20 questions/rounds per game section
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds] = useState(20);
  const [playCount, setPlayCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [missedCurrentRound, setMissedCurrentRound] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // 1. Who Is This?
  const [studyCards, setStudyCards] = useState<FacesCardItem[]>([]);
  const [targetCard, setTargetCard] = useState<FacesCardItem | null>(null);
  const [nameChoices, setNameChoices] = useState<string[]>([]);
  const [selectedNameChoice, setSelectedNameChoice] = useState<string | null>(null);

  // 2. Who/What Is Here? (Spatial Grid)
  const [gridSlots, setGridSlots] = useState<{ id: number; card: FacesCardItem; isFlipped: boolean }[]>([]);
  const [highlightedSlotIndex, setHighlightedSlotIndex] = useState<number | null>(null);
  const [gridCandidates, setGridCandidates] = useState<FacesCardItem[]>([]);

  // 3. Who Is Missing?
  const [cardsRemainingAfterDrop, setCardsRemainingAfterDrop] = useState<FacesCardItem[]>([]);
  const [missingCardsList, setMissingCardsList] = useState<FacesCardItem[]>([]);
  const [missingCandidates, setMissingCandidates] = useState<FacesCardItem[]>([]);
  const [curtainActive, setCurtainActive] = useState<boolean>(false);

  // 4. Who Owns What?
  const [pairedOwners, setPairedOwners] = useState<{ character: FacesCardItem; object: FacesCardItem }[]>([]);
  const [activePairPrompt, setActivePairPrompt] = useState<{ character: FacesCardItem; object: FacesCardItem } | null>(null);
  const [objectCandidates, setObjectCandidates] = useState<FacesCardItem[]>([]);

  // 5. Who Moved?
  const [movedSlotCards, setMovedSlotCards] = useState<FacesCardItem[]>([]);
  const [movedIndices, setMovedIndices] = useState<number[]>([]);
  const [childTappedMovedIndices, setChildTappedMovedIndices] = useState<number[]>([]);

  // 6. Position Tracker
  const [trackerCards, setTrackerCards] = useState<FacesCardItem[]>([]);
  const [trackerTarget, setTrackerTarget] = useState<FacesCardItem | null>(null);
  const [isShufflingActive, setIsShufflingActive] = useState(false);
  const [shufflePositions, setShufflePositions] = useState<number[]>([0, 1, 2, 3]);

  // 7. What's Their Position?
  const [positionSequence, setPositionSequence] = useState<FacesCardItem[]>([]);
  const [positionTarget, setPositionTarget] = useState<{ card: FacesCardItem; correctPos: number } | null>(null);

  // 8. Who Sang What? (Internet Song Integration)
  const [singingCast, setSingingCast] = useState<FacesCardItem[]>([]);
  const [mysterySinger, setMysterySinger] = useState<FacesCardItem | null>(null);
  const [songTracksMap, setSongTracksMap] = useState<Record<string, InternetSongTrack>>({});
  const [songsLoading, setSongsLoading] = useState(false);
  const [nowPlayingKey, setNowPlayingKey] = useState<string | null>(null);

  // 9. Memory Train
  const [trainDeck, setTrainDeck] = useState<FacesCardItem[]>([]);
  const [trainChoices, setTrainChoices] = useState<FacesCardItem[]>([]);
  const [trainStepIndex, setTrainStepIndex] = useState(1);
  const [trainUserSequence, setTrainUserSequence] = useState<FacesCardItem[]>([]);

  // 10. Find the Treasure
  const [plottedTreasureItems, setPlottedTreasureItems] = useState<TreasurePlottedItem[]>([]);
  const [treasureTarget, setTreasureTarget] = useState<TreasurePlottedItem | null>(null);

  // 11. Creative Studio
  const [isCreativeStudioOpen, setIsCreativeStudioOpen] = useState(false);
  const [creativeCharacter, setCreativeCharacter] = useState<FacesCardItem>(FACES_CHARACTERS[0]);
  const [creativeAnimal, setCreativeAnimal] = useState<FacesCardItem>(FACES_ANIMALS[0]);
  const [creativeObject, setCreativeObject] = useState<FacesCardItem>(FACES_OBJECTS[0]);

  // Visual feedback, Confetti & Amber Alert states
  const [roundFeedback, setRoundFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAmberAlert, setShowAmberAlert] = useState(false);
  const [amberMessage, setAmberMessage] = useState("You didn't get it this time. Let's try again!");
  const [amberRetryAction, setAmberRetryAction] = useState<'retry_round' | 'restart_game'>('retry_round');
  const [selectedMissingIds, setSelectedMissingIds] = useState<string[]>([]);

  const tierOffset = activeTier === initialTier ? 0 : activeTier === 'tier1' ? -2 : activeTier === 'tier3' ? 2 : 0;
  const cardCountByTier = Math.max(3, Math.min(16, ageConfig.cardCount + tierOffset));
  const studySecondsByTier = ageConfig.studySeconds;

  const shuffleArray = <T,>(arr: T[]): T[] => {
    return [...arr].sort(() => 0.5 - Math.random());
  };

  const handleExitGame = () => {
    stopVoice();
    stopCurrentSong();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    onExit();
  };

  const handleAdjustRemaining = (delta: number) => {
    setRemainingSeconds((prev) => {
      const next = Math.max(5, Math.min(900, prev + delta));
      setTotalTimerSeconds((t) => Math.max(t, next));
      return next;
    });
  };

  const beginRaceSession = (modeToStart = activeMode) => {
    const nextPlay = playCount + 1;
    setPlayCount(nextPlay);
    setRoundNumber(1);
    setCorrectCount(0);
    setMistakes(0);
    setPlayerScores({ p1: 0, p2: 0 });
    setActiveTurn(1);
    setDidTimeOut(false);
    setTotalTimerSeconds(timerSeconds);
    setRemainingSeconds(timerSeconds);
    setStartTime(Date.now());
    startNewRound(modeToStart, 1, nextPlay);
  };

  const loadInternetSongsForCast = async (cast: FacesCardItem[], roundSeed: number) => {
    setSongsLoading(true);
    setNowPlayingKey(null);
    const tracks = await fetchSongsForSession(loginSessionId, roundSeed);
    const assigned: Record<string, InternetSongTrack> = {};
    cast.forEach((singer, idx) => {
      if (tracks.length > 0) {
        assigned[singer.id] = tracks[idx % tracks.length];
      }
    });
    setSongTracksMap(assigned);
    setSongsLoading(false);
  };

  const startNewRound = (mode = activeMode, roundIdx = roundNumber, currentPlay = playCount) => {
    stopCurrentSong();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    setGamePhase('study');
    setRoundFeedback(null);
    setChildTappedMovedIndices([]);
    setSelectedNameChoice(null);
    setSelectedMissingIds([]);
    setMissedCurrentRound(false);
    setNowPlayingKey(null);

    const seed = loginSessionId * 53 + currentPlay * 31 + roundIdx * 17;
    const count = cardCountByTier;
    // Draw non-repeating target cards first so each round highlights new faces & things
    const pickedTargets = pickNonRepeatingItems(
      child.id,
      `faces_${mode}`,
      ALL_FACES_DECK,
      1,
      seed
    );
    const primaryTarget = pickedTargets[0] || ALL_FACES_DECK[0];
    const remainingShuffled = shuffleArray(
      ALL_FACES_DECK.filter((c) => c.id !== primaryTarget.id)
    );
    const selectedPool = shuffleArray([primaryTarget, ...remainingShuffled.slice(0, count - 1)]);

    if (mode === 'who_is_this') {
      setStudyCards(selectedPool);
      setTargetCard(primaryTarget);

      const distractorCount = ageConfig.age >= 9 ? 5 : 3;
      const distractors = shuffleArray(
        ALL_FACES_DECK.filter((c) => c.name !== primaryTarget.name)
      ).slice(0, distractorCount);
      setNameChoices(shuffleArray([primaryTarget.name, ...distractors.map((d) => d.name)]));

      setStudyTimeRemaining(studySecondsByTier);
      startStudyTimer(mode, primaryTarget, null, []);
    } else if (mode === 'who_is_here') {
      const slots = selectedPool.map((card, idx) => ({ id: idx, card, isFlipped: false }));
      const targetSlotIdx = selectedPool.findIndex((c) => c.id === primaryTarget.id);
      setGridSlots(slots);
      setHighlightedSlotIndex(targetSlotIdx >= 0 ? targetSlotIdx : 0);

      const distractorCount = ageConfig.age >= 9 ? 4 : 2;
      const distractors = remainingShuffled.slice(count - 1, count - 1 + distractorCount);
      setGridCandidates(shuffleArray([...selectedPool, ...distractors]));

      setStudyTimeRemaining(studySecondsByTier + 2);
      startStudyTimer(mode, primaryTarget, null, []);
    } else if (mode === 'who_is_missing') {
      setStudyCards(selectedPool);
      const missingCount = Math.min(selectedPool.length - 1, ageConfig.missingCount);
      const missing = [primaryTarget, ...selectedPool.filter((c) => c.id !== primaryTarget.id).slice(0, missingCount - 1)];
      setMissingCardsList(missing);
      const remaining = shuffleArray(selectedPool.filter((c) => !missing.some((m) => m.id === c.id)));
      setCardsRemainingAfterDrop(remaining);

      const distractors = remainingShuffled.slice(count, count + 3);
      setMissingCandidates(shuffleArray([...missing, ...distractors]));

      setStudyTimeRemaining(studySecondsByTier);
      startStudyTimer(mode, primaryTarget, null, []);
    } else if (mode === 'who_owns_what') {
      const pairCount = Math.min(ageConfig.pairCount, count);
      const [leadChar] = pickNonRepeatingItems(child.id, `faces_owners_${mode}`, FACES_CHARACTERS, 1, seed);
      const otherChars = shuffleArray(FACES_CHARACTERS.filter((c) => c.id !== leadChar.id));
      const characters = [leadChar, ...otherChars].slice(0, pairCount);
      const objects = shuffleArray(FACES_OBJECTS).slice(0, pairCount);
      const pairs = characters.map((c, i) => ({ character: c, object: objects[i] }));
      setPairedOwners(pairs);
      const targetPair = pairs[0];
      setActivePairPrompt(targetPair);
      setObjectCandidates(shuffleArray(objects));

      setStudyTimeRemaining(studySecondsByTier + 3);
      startStudyTimer(mode, primaryTarget, targetPair, []);
    } else if (mode === 'who_moved') {
      setMovedSlotCards(selectedPool);
      const idx1 = Math.floor(Math.random() * count);
      let idx2 = Math.floor(Math.random() * count);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * count);
      }
      const swappedPair = [idx1, idx2];
      setMovedIndices(swappedPair);

      setStudyTimeRemaining(studySecondsByTier);
      startStudyTimer(mode, primaryTarget, null, swappedPair);
    } else if (mode === 'position_tracker') {
      const trackerCount = Math.min(8, Math.max(4, Math.floor(ageConfig.age / 2) + 1));
      const [pickedChar] = pickNonRepeatingItems(child.id, `faces_tracker`, FACES_CHARACTERS, 1, seed);
      const others = shuffleArray(FACES_CHARACTERS.filter((c) => c.id !== pickedChar.id)).slice(0, trackerCount - 1);
      const selected = shuffleArray([pickedChar, ...others]);
      setTrackerCards(selected);
      setTrackerTarget(pickedChar);
      setShufflePositions(selected.map((_, i) => i));
      setIsShufflingActive(false);

      speakChildQuestion(`Keep your eyes on ${pickedChar.name}!`, ageConfig.age, child.band);
      setTimeout(() => {
        runTrackerShuffle(selected, pickedChar);
      }, 1700);
    } else if (mode === 'whats_their_position') {
      setPositionSequence(selectedPool);
      const targetIndex = selectedPool.findIndex((c) => c.id === primaryTarget.id);
      const validIndex = targetIndex >= 0 ? targetIndex : 0;
      const targetObj = { card: selectedPool[validIndex], correctPos: validIndex + 1 };
      setPositionTarget(targetObj);

      setStudyTimeRemaining(studySecondsByTier);
      startStudyTimer(mode, primaryTarget, null, [], targetObj);
    } else if (mode === 'who_sang_what') {
      const singerCount = Math.min(6, Math.max(3, Math.floor(ageConfig.age / 2) + 1));
      const [leadSinger] = pickNonRepeatingItems(child.id, `faces_singer`, FACES_CHARACTERS, 1, seed);
      const others = shuffleArray(FACES_CHARACTERS.filter((c) => c.id !== leadSinger.id)).slice(0, singerCount - 1);
      const cast = shuffleArray([leadSinger, ...others]);
      setSingingCast(cast);
      setMysterySinger(leadSinger);
      setGamePhase('study');
      loadInternetSongsForCast(cast, roundIdx + currentPlay);
    } else if (mode === 'memory_train') {
      const deck = shuffleArray([primaryTarget, ...remainingShuffled]).slice(0, ageConfig.trainMaxSteps + 2);
      setTrainDeck(deck);
      setTrainStepIndex(1);
      setTrainChoices(shuffleArray(deck.slice(0, Math.min(3, deck.length))));
      setTrainUserSequence([]);
      setGamePhase('study');
      speakChildQuestion(`First on the train: ${deck[0].name}`, ageConfig.age, child.band);
    } else if (mode === 'find_the_treasure') {
      const gridSize = ageConfig.gridSize;
      const selected = [primaryTarget, ...remainingShuffled.slice(0, ageConfig.treasureItemsCount - 1)];
      const usedCoords = new Set<string>();
      const plotted: TreasurePlottedItem[] = [];

      selected.forEach((card, idx) => {
        let x = Math.floor(Math.random() * gridSize);
        let y = Math.floor(Math.random() * gridSize);
        while (usedCoords.has(`${x}-${y}`)) {
          x = Math.floor(Math.random() * gridSize);
          y = Math.floor(Math.random() * gridSize);
        }
        usedCoords.add(`${x}-${y}`);
        plotted.push({ id: `item_${idx}`, card, x, y });
      });

      setPlottedTreasureItems(plotted);
      const target = plotted[0];
      setTreasureTarget(target);
      setGamePhase('quiz');
      speakChildQuestion(`Find ${target.card.name} on the map!`, ageConfig.age, child.band);
    } else if (mode === 'creative_studio') {
      const [ch] = pickNonRepeatingItems(child.id, 'creative_char', FACES_CHARACTERS, 1, seed);
      const [an] = pickNonRepeatingItems(child.id, 'creative_anim', FACES_ANIMALS, 1, seed);
      const [ob] = pickNonRepeatingItems(child.id, 'creative_obj', FACES_OBJECTS, 1, seed);
      setCreativeCharacter(ch);
      setCreativeAnimal(an);
      setCreativeObject(ob);
      setIsCreativeStudioOpen(true);
    }
  };

  const startStudyTimer = (
    mode: MiniGameMode,
    target: FacesCardItem | null,
    pairTarget: { character: FacesCardItem; object: FacesCardItem } | null,
    swappedPair: number[],
    posTarget?: { card: FacesCardItem; correctPos: number }
  ) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setStudyTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleFinishStudyPhase(mode, target, pairTarget, swappedPair, posTarget);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishStudyPhase = (
    mode = activeMode,
    tCard = targetCard,
    pairTarget = activePairPrompt,
    swappedPair = movedIndices,
    posTarget = positionTarget
  ) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    soundEngine.playPop();

    if (mode === 'who_is_this') {
      setGamePhase('quiz');
      if (tCard) speakChildQuestion('Who or what is hiding behind the mask?', ageConfig.age, child.band);
    } else if (mode === 'who_is_here') {
      setGridSlots((prev) => prev.map((s) => ({ ...s, isFlipped: true })));
      setGamePhase('quiz');
      speakChildQuestion('Who or what was in the highlighted spot?', ageConfig.age, child.band);
    } else if (mode === 'who_is_missing') {
      setCurtainActive(true);
      soundEngine.playPop();
      setTimeout(() => {
        setCurtainActive(false);
        setGamePhase('quiz');
        speakChildQuestion('Who ran away? Who is missing?', ageConfig.age, child.band);
      }, 1000);
    } else if (mode === 'who_owns_what') {
      setGamePhase('quiz');
      if (pairTarget) {
        speakChildQuestion(`What did ${pairTarget.character.name} bring today?`, ageConfig.age, child.band);
      }
    } else if (mode === 'who_moved') {
      setCurtainActive(true);
      setTimeout(() => {
        setMovedSlotCards((prev) => {
          const next = [...prev];
          const [i1, i2] = swappedPair;
          if (next[i1] && next[i2]) {
            const temp = next[i1];
            next[i1] = next[i2];
            next[i2] = temp;
          }
          return next;
        });
        setCurtainActive(false);
        setGamePhase('quiz');
        speakChildQuestion('Which two cards swapped positions? Tap both!', ageConfig.age, child.band);
      }, 1000);
    } else if (mode === 'whats_their_position') {
      setGamePhase('quiz');
      if (posTarget) {
        speakChildQuestion(`What was ${posTarget.card.name}'s number position?`, ageConfig.age, child.band);
      }
    }
  };

  const runTrackerShuffle = (cards: FacesCardItem[], target: FacesCardItem) => {
    if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    setIsShufflingActive(true);
    let positions = cards.map((_, i) => i);
    const numSwaps = ageConfig.numSwaps;
    let step = 0;

    swapIntervalRef.current = setInterval(() => {
      const s1 = Math.floor(Math.random() * cards.length);
      let s2 = Math.floor(Math.random() * cards.length);
      while (s2 === s1) s2 = Math.floor(Math.random() * cards.length);

      const nextPositions = [...positions];
      const temp = nextPositions[s1];
      nextPositions[s1] = nextPositions[s2];
      nextPositions[s2] = temp;
      positions = nextPositions;
      setShufflePositions(nextPositions);
      soundEngine.playPop();

      step++;
      if (step >= numSwaps) {
        if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
        setIsShufflingActive(false);
        setGamePhase('quiz');
        speakChildQuestion(`Where did ${target.name} land?`, ageConfig.age, child.band);
      }
    }, ageConfig.swapIntervalMs);
  };

  const ENCOURAGING_FAIL_LINES = [
    "You didn't get it this time. Let's try again!",
    "So close! Let's try again!",
    "Almost there! Take a breath and try again!",
  ];

  const handleAmberRetry = () => {
    setShowAmberAlert(false);
    setRoundFeedback(null);
    setSelectedNameChoice(null);
    setChildTappedMovedIndices([]);
    setSelectedMissingIds([]);
    setTrainUserSequence([]);

    if (amberRetryAction === 'restart_game') {
      setPlayCount((p) => p + 1);
      setRoundNumber(1);
      setCorrectCount(0);
      setMistakes(0);
      setStartTime(Date.now());
      startNewRound(activeMode, 1, playCount + 1);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    stopCurrentSong();
    setNowPlayingKey(null);

    if (isCorrect) {
      soundEngine.playMatch();
      setRoundFeedback('correct');
      setShowConfetti(true);

      const nextCorrectCount = !missedCurrentRound ? correctCount + 1 : correctCount;
      if (!missedCurrentRound) {
        setCorrectCount(nextCorrectCount);
      }

      if (playMode === 'co_play') {
        if (activeTurn === 1) {
          setPlayerScores((prev) => ({ ...prev, p1: prev.p1 + 10 }));
        } else {
          setPlayerScores((prev) => ({ ...prev, p2: prev.p2 + 10 }));
        }
      }

      setTimeout(() => {
        if (playMode === 'co_play') {
          setActiveTurn((prev) => (prev === 1 ? 2 : 1));
        }

        if (roundNumber >= totalRounds) {
          handleGameComplete(nextCorrectCount);
        } else {
          const nextRound = roundNumber + 1;
          setRoundNumber(nextRound);
          startNewRound(activeMode, nextRound, playCount);
        }
      }, 1150);
    } else {
      soundEngine.playError();
      setRoundFeedback('wrong');
      setMistakes((prev) => prev + 1);
      setMissedCurrentRound(true);
      setAmberMessage(
        ENCOURAGING_FAIL_LINES[Math.floor(Math.random() * ENCOURAGING_FAIL_LINES.length)]
      );
      setAmberRetryAction('retry_round');
      setShowAmberAlert(true);
    }
  };

  const handleGameComplete = (finalCorrect = correctCount, timedOut = false) => {
    stopVoice();
    stopCurrentSong();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    setShowAmberAlert(false);
    setIsCreativeStudioOpen(false);
    setCurtainActive(false);
    setDidTimeOut(timedOut);

    const accuracy = Math.round((finalCorrect / totalRounds) * 100);
    const score = finalCorrect * 10;

    setGamePhase('finished');
    setShowConfetti(true);
    soundEngine.playFanfare();

    const durationSec = timedOut
      ? totalTimerSeconds
      : Math.max(10, Math.round((Date.now() - startTime) / 1000));
    const xp = calculateRewardXp(
      accuracy,
      ageConfig.effectiveDifficulty,
      !timedOut && mistakes === 0
    );

    const session: GameSession = {
      id: `session_faces_${Date.now()}`,
      childId: child.id,
      gameId,
      gameTitle,
      domain:
        activeMode === 'who_is_missing' || activeMode === 'who_moved'
          ? 'attention'
          : activeMode === 'who_owns_what' || activeMode === 'whats_their_position'
          ? 'reasoning'
          : activeMode === 'position_tracker'
          ? 'processing_speed'
          : activeMode === 'find_the_treasure'
          ? 'spatial_thinking'
          : activeMode === 'memory_train'
          ? 'executive_function'
          : activeMode === 'creative_studio'
          ? 'reading_comprehension'
          : 'memory',
      focusArea:
        activeMode === 'creative_studio'
          ? 'reading'
          : activeMode === 'who_is_missing' ||
            activeMode === 'who_moved' ||
            activeMode === 'position_tracker' ||
            activeMode === 'memory_train'
          ? 'concentration'
          : 'mental_abilities',
      band: child.band,
      timestamp: new Date().toISOString(),
      durationSeconds: durationSec,
      difficultyLevel: ageConfig.effectiveDifficulty,
      accuracy,
      mistakes,
      hintsUsed: 0,
      xpEarned: xp + 40,
      score,
      timedOut,
      completed: true,
      details: {
        activeMode,
        age: ageConfig.age,
        cardsDisplayed: cardCountByTier,
        playMode,
        playerScores,
        score,
        timedOut,
      },
    };

    onFinish(session);
  };

  timeoutCompleteRef.current = () => handleGameComplete(correctCount, true);

  useEffect(() => {
    if (gamePhase === 'intro' || gamePhase === 'finished') return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => timeoutCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gamePhase]);

  useEffect(() => {
    return () => {
      stopVoice();
      stopCurrentSong();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    };
  }, [activeMode]);

  const studyBannerText = STUDY_BANNERS[(loginSessionId + roundNumber + playCount) % STUDY_BANNERS.length];

  const activeQuestionPrompt = (() => {
    if (activeMode === 'who_is_this') {
      return gamePhase === 'study'
        ? `Remember these ${cardCountByTier} faces and names!`
        : 'Who or what is hiding behind the mask?';
    }
    if (activeMode === 'who_is_here') {
      return gamePhase === 'study'
        ? 'Remember where each card is sitting!'
        : 'Who or what was in the highlighted spot?';
    }
    if (activeMode === 'who_is_missing') {
      return gamePhase === 'study'
        ? 'Look closely! Someone will disappear.'
        : 'Who ran away? Who is missing?';
    }
    if (activeMode === 'who_owns_what') {
      return gamePhase === 'study'
        ? 'Remember who brought each object!'
        : activePairPrompt
        ? `What did ${activePairPrompt.character.name} bring today?`
        : 'Match the owner!';
    }
    if (activeMode === 'who_moved') {
      return gamePhase === 'study'
        ? 'Remember where each card is placed!'
        : 'Which two cards swapped positions? Tap both!';
    }
    if (activeMode === 'position_tracker' && trackerTarget) {
      return isShufflingActive
        ? `Keep your eyes on ${trackerTarget.name}!`
        : `Where did ${trackerTarget.name} land?`;
    }
    if (activeMode === 'whats_their_position') {
      return gamePhase === 'study'
        ? 'Remember each card’s number in line!'
        : positionTarget
        ? `What was ${positionTarget.card.name}'s number position?`
        : 'Pick the position number!';
    }
    if (activeMode === 'who_sang_what') {
      return 'Tap Hear Song for each character, then play the Mystery Song and pick who sang it!';
    }
    if (activeMode === 'memory_train') {
      return 'Tap the passengers on the Memory Train in exact order!';
    }
    if (activeMode === 'find_the_treasure' && treasureTarget) {
      return `Find ${treasureTarget.card.name} on the treasure map!`;
    }
    return '';
  })();

  return (
    <div className="min-h-screen bg-[#53b0c9]/15 text-black font-child flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-[#7f27a8] px-4 md:px-8 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExitGame}
              className="p-2 rounded-xl bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black border border-black transition-colors cursor-pointer"
              title="Exit to World"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#ffd400] text-black px-2 py-0.5 rounded-full border border-black">
                  Original IP: Matthew Onaneye
                </span>
                <span className="text-[10px] font-black text-white bg-[#7f27a8] px-2 py-0.5 rounded-full">
                  Age {ageConfig.age} · {cardCountByTier} Cards · Lv.{ageConfig.effectiveDifficulty}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-black flex items-center gap-1.5 leading-tight mt-0.5">
                <span>{gameTitle}</span>
                <Sparkles className="w-4 h-4 text-[#f76400] fill-[#ffd400]" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {gamePhase !== 'intro' && gamePhase !== 'finished' && (
              <GameTimerHud
                remainingSeconds={remainingSeconds}
                totalSeconds={totalTimerSeconds}
                onAdjustSeconds={handleAdjustRemaining}
                compact={true}
              />
            )}

            <div className="hidden sm:flex bg-[#53b0c9]/25 p-1 rounded-xl border border-[#53b0c9] text-xs font-black">
              <button
                onClick={() => setPlayMode('solo')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playMode === 'solo'
                    ? 'bg-[#7f27a8] text-white shadow-xs'
                    : 'text-black hover:bg-white/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Solo Host</span>
              </button>
              <button
                onClick={() => setPlayMode('co_play')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playMode === 'co_play'
                    ? 'bg-[#7f27a8] text-white shadow-xs'
                    : 'text-black hover:bg-white/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pass &amp; Play</span>
              </button>
            </div>

            <div className="bg-[#ffd400] text-black text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black flex items-center gap-1">
              <span>Round {roundNumber}/{totalRounds}</span>
            </div>
          </div>
        </div>

        {!lockedMode && (
          <div className="max-w-6xl mx-auto mt-2.5 overflow-x-auto pb-1 flex items-center gap-1.5 text-xs font-black">
            {[
              { id: 'who_is_this', label: 'Who or What?', icon: '❓' },
              { id: 'who_is_here', label: 'Spatial Grid', icon: '🗺️' },
              { id: 'who_is_missing', label: 'Who Missing?', icon: '👀' },
              { id: 'who_owns_what', label: 'Who Owns What?', icon: '🎒' },
              { id: 'who_moved', label: 'Who Moved?', icon: '🔀' },
              { id: 'position_tracker', label: 'Live Shuffle', icon: '⚡' },
              { id: 'whats_their_position', label: 'Number Pos', icon: '🔢' },
              { id: 'who_sang_what', label: 'Sound Match', icon: '🎵' },
              { id: 'memory_train', label: 'Memory Train', icon: '🚂' },
              { id: 'find_the_treasure', label: 'Treasure Map', icon: '🧭' },
              { id: 'creative_studio', label: 'Creative Studio', icon: '🎙️' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  soundEngine.playPop();
                  const nextMode = m.id as MiniGameMode;
                  setActiveMode(nextMode);
                  beginRaceSession(nextMode);
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeMode === m.id
                    ? 'bg-[#7f27a8] text-white border-black'
                    : 'bg-white hover:bg-[#ffd400]/30 text-black border-[#53b0c9]'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {playMode === 'co_play' && (
        <div className="bg-[#f76400] text-white font-black text-xs py-1.5 px-4 text-center flex items-center justify-center gap-6 shadow-xs border-b border-black">
          <div className={`flex items-center gap-1.5 ${activeTurn === 1 ? 'scale-110 underline' : 'opacity-80'}`}>
            <span>👦 Player 1 ({child.name}): {playerScores.p1} pts</span>
          </div>
          <div>vs</div>
          <div className={`flex items-center gap-1.5 ${activeTurn === 2 ? 'scale-110 underline' : 'opacity-80'}`}>
            <span>👨‍👩‍👧 Player 2: {playerScores.p2} pts</span>
          </div>
          <span className="bg-[#ffd400] text-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
            Player {activeTurn}'s Turn!
          </span>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1 flex flex-col items-center justify-center relative">
        {curtainActive && (
          <div className="absolute inset-0 bg-[#7f27a8] z-50 rounded-3xl flex flex-col items-center justify-center text-white border-4 border-[#ffd400]">
            <EyeOff className="w-16 h-16 text-[#ffd400] mb-3 animate-pulse" />
            <h3 className="text-3xl font-black text-[#ffd400]">Close Your Eyes!</h3>
            <p className="text-white font-bold mt-1">Cards are shuffling...</p>
          </div>
        )}

        {gamePhase === 'intro' && (
          <div className="bg-white rounded-3xl p-8 border-2 border-[#7f27a8] shadow-xl text-center max-w-xl w-full mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#ffd400] border-2 border-black text-black flex items-center justify-center text-4xl shadow-md">
              🃏
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-black mb-2">
              {gameTitle}
            </h2>
            <p className="text-black/80 font-medium mb-6 text-sm md:text-base">
              Race the clock across 20 unique rounds with {cardCountByTier} age-tuned cards per table!
            </p>

            <div className="bg-[#53b0c9]/20 border border-[#53b0c9] rounded-2xl p-4 mb-6 flex items-center justify-around text-left">
              <div>
                <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                  Rounds
                </span>
                <span className="text-sm font-black text-black">{totalRounds} Challenges</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                  Deck Size
                </span>
                <span className="text-sm font-black text-[#7f27a8]">{cardCountByTier} Cards</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-black/70 font-bold block">
                  Player Age
                </span>
                <span className="text-sm font-black text-black">Age {ageConfig.age}</span>
              </div>
            </div>

            <GameInstructionBox
              instruction={getModeInstruction(activeMode, cardCountByTier, child.name)}
              age={ageConfig.age}
              band={child.band}
            />

            <GameTimerSetup seconds={timerSeconds} onChangeSeconds={setTimerSeconds} maxSeconds={900} />

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleExitGame}
                className="px-6 py-3 rounded-2xl border-2 border-black text-black font-bold hover:bg-[#ffd400]/20 transition-colors cursor-pointer"
              >
                Back to World
              </button>
              <button
                onClick={() => beginRaceSession(activeMode)}
                className="px-8 py-3.5 rounded-2xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-lg shadow-lg transition-all cursor-pointer"
              >
                Start 20-Round Race →
              </button>
            </div>
          </div>
        )}

        {gamePhase !== 'intro' && gamePhase !== 'finished' && (
          <div className="w-full max-w-4xl mb-4 flex flex-col gap-2">
            <GameProgressBar
              current={Math.max(0, roundNumber - 1 + (roundFeedback === 'correct' ? 1 : 0))}
              total={totalRounds}
              unitLabel="rounds"
              accentBgClass="bg-[#f76400]"
            />
            {activeQuestionPrompt && (
              <div className="flex justify-end">
                <QuestionSpeakerButton
                  text={activeQuestionPrompt}
                  age={ageConfig.age}
                  band={child.band}
                />
              </div>
            )}
          </div>
        )}

        {/* MODE 1: WHO IS THIS? */}
        {gamePhase !== 'intro' && activeMode === 'who_is_this' && (
          <div className="w-full flex flex-col items-center">
            {gamePhase === 'study' && (
              <div className="text-center w-full">
                <div className="mb-4">
                  <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
                    {studyBannerText}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                    Remember These {cardCountByTier} Faces &amp; Names!
                  </h2>
                  <p className="text-sm text-black/80 font-medium">
                    Tap the speaker icon on any card to hear its name.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                  {studyCards.map((card) => (
                    <FacesCard key={card.id} card={card} size="md" />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-black font-black text-sm bg-[#ffd400] px-4 py-2 rounded-xl border-2 border-black">
                    <Clock className="w-4 h-4" />
                    <span>Auto-advance in {studyTimeRemaining}s</span>
                  </div>

                  <button
                    onClick={() => handleFinishStudyPhase()}
                    className="px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    I'm Ready! Let's Guess!
                  </button>
                </div>
              </div>
            )}

            {gamePhase === 'quiz' && targetCard && (
              <div className="text-center w-full max-w-md bg-white p-6 rounded-3xl border-2 border-[#7f27a8] shadow-lg">
                <div className="mb-4">
                  <h2 className="text-2xl md:text-3xl font-black text-black">
                    Who or What Is This?
                  </h2>
                  <p className="text-sm text-black/75 font-medium">
                    Tap the matching name below!
                  </p>
                </div>

                <div className="flex justify-center my-6">
                  <FacesCard card={targetCard} isMasked={true} size="lg" />
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  {nameChoices.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedNameChoice(name);
                        handleAnswerSubmit(name === targetCard.name);
                      }}
                      className={`p-3.5 rounded-2xl border-2 font-black text-base transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                        selectedNameChoice === name
                          ? name === targetCard.name
                            ? 'bg-[#ffd400] text-black border-[#f76400]'
                            : 'bg-[#c1008f] text-white border-black'
                          : 'bg-white hover:bg-[#ffd400]/30 border-[#7f27a8] text-black'
                      }`}
                    >
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: WHO IS HERE? */}
        {gamePhase !== 'intro' && activeMode === 'who_is_here' && (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-4">
              <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
                {gamePhase === 'study' ? studyBannerText : 'Identify Highlighted Slot'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                {gamePhase === 'study' ? 'Where is each card sitting?' : 'Who or what was in this spot?'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-4">
              {gridSlots.map((slot, idx) => (
                <div key={slot.id} className="relative">
                  <FacesCard
                    card={slot.card}
                    isFlipped={slot.isFlipped}
                    isTarget={gamePhase === 'quiz' && highlightedSlotIndex === idx}
                    size="sm"
                  />
                  {gamePhase === 'quiz' && highlightedSlotIndex === idx && (
                    <div className="absolute -top-3 -right-2 bg-[#f76400] text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md animate-bounce border border-black">
                      THIS ONE!
                    </div>
                  )}
                </div>
              ))}
            </div>

            {gamePhase === 'study' && (
              <button
                onClick={() => handleFinishStudyPhase()}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all cursor-pointer"
              >
                I Memorized the Grid! ({studyTimeRemaining}s)
              </button>
            )}

            {gamePhase === 'quiz' && highlightedSlotIndex !== null && (
              <div className="w-full max-w-xl mt-6 bg-white rounded-2xl p-4 border-2 border-[#7f27a8] shadow-md">
                <div className="text-xs font-black uppercase tracking-wider text-black text-center mb-3">
                  Choose the matching card:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {gridCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() =>
                        handleAnswerSubmit(cand.id === gridSlots[highlightedSlotIndex].card.id)
                      }
                      className="px-3 py-2 rounded-xl border-2 border-[#53b0c9] hover:border-black bg-white hover:bg-[#ffd400] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-2xl">{cand.emoji}</span>
                      <span className="font-black text-xs text-black">{cand.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: WHO IS MISSING? */}
        {gamePhase !== 'intro' && activeMode === 'who_is_missing' && (
          <div className="w-full flex flex-col items-center">
            {gamePhase === 'study' && (
              <div className="text-center w-full">
                <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
                  {studyBannerText}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                  Look closely! Someone will disappear...
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                  {studyCards.map((card) => (
                    <FacesCard key={card.id} card={card} size="md" />
                  ))}
                </div>

                <button
                  onClick={() => handleFinishStudyPhase()}
                  className="px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Drop the Curtain! ({studyTimeRemaining}s)
                </button>
              </div>
            )}

            {gamePhase === 'quiz' && (
              <div className="text-center w-full max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-black text-black">
                  Who Ran Away? Who Is Missing?
                </h2>
                <p className="text-sm text-black/80 font-medium">
                  The remaining cards stayed behind. Pick who is missing from the table!
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 my-6 p-4 bg-white rounded-2xl border-2 border-dashed border-[#53b0c9]">
                  {cardsRemainingAfterDrop.map((card) => (
                    <FacesCard key={card.id} card={card} size="sm" />
                  ))}
                </div>

                <div className="w-full bg-white rounded-2xl p-4 border-2 border-[#7f27a8] shadow-md">
                  <div className="text-xs font-black uppercase tracking-wider text-black text-center mb-3">
                    {missingCardsList.length > 1
                      ? `Tap the ${missingCardsList.length} missing cards (${selectedMissingIds.length}/${missingCardsList.length} selected):`
                      : 'Tap the missing card:'}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {missingCandidates.map((cand) => {
                      const isPicked = selectedMissingIds.includes(cand.id);
                      return (
                        <button
                          key={cand.id}
                          onClick={() => {
                            if (missingCardsList.length === 1) {
                              handleAnswerSubmit(missingCardsList.some((m) => m.id === cand.id));
                            } else {
                              soundEngine.playPop();
                              const next = isPicked
                                ? selectedMissingIds.filter((id) => id !== cand.id)
                                : [...selectedMissingIds, cand.id];
                              setSelectedMissingIds(next);
                              if (next.length === missingCardsList.length) {
                                const allCorrect = missingCardsList.every((m) => next.includes(m.id));
                                handleAnswerSubmit(allCorrect);
                              }
                            }
                          }}
                          className={`px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                            isPicked
                              ? 'border-black bg-[#ffd400] text-black'
                              : 'border-[#53b0c9] hover:border-black bg-white hover:bg-[#e885cf]/30 text-black'
                          }`}
                        >
                          <span className="text-2xl">{cand.emoji}</span>
                          <span className="font-black text-sm">{cand.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 4: WHO OWNS WHAT? */}
        {gamePhase !== 'intro' && activeMode === 'who_owns_what' && (
          <div className="w-full flex flex-col items-center">
            {gamePhase === 'study' && (
              <div className="text-center w-full">
                <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
                  Association &amp; Pairing
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                  Who brought what today?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-6 max-w-2xl mx-auto">
                  {pairedOwners.map((pair, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-3 border-2 border-[#7f27a8] shadow-sm flex items-center justify-center gap-3"
                    >
                      <FacesCard card={pair.character} size="sm" />
                      <span className="text-lg font-black text-[#f76400]">owns</span>
                      <FacesCard card={pair.object} size="sm" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleFinishStudyPhase()}
                  className="px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  I Remembered the Pairs! ({studyTimeRemaining}s)
                </button>
              </div>
            )}

            {gamePhase === 'quiz' && activePairPrompt && (
              <div className="text-center w-full max-w-md bg-white p-6 rounded-3xl border-2 border-[#7f27a8] shadow-lg">
                <h2 className="text-2xl md:text-3xl font-black text-black mb-2">
                  What did {activePairPrompt.character.name} bring?
                </h2>

                <div className="flex justify-center my-4">
                  <FacesCard card={activePairPrompt.character} size="md" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {objectCandidates.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => handleAnswerSubmit(obj.id === activePairPrompt.object.id)}
                      className="p-3 rounded-2xl border-2 border-[#53b0c9] hover:border-black bg-white hover:bg-[#ffd400] text-black transition-all flex items-center justify-center gap-2 font-black text-sm shadow-sm cursor-pointer active:scale-95"
                    >
                      <span className="text-2xl">{obj.emoji}</span>
                      <span>{obj.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 5: WHO MOVED? */}
        {gamePhase !== 'intro' && activeMode === 'who_moved' && (
          <div className="w-full flex flex-col items-center">
            {gamePhase === 'study' && (
              <div className="text-center w-full">
                <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
                  Position Shift Detection
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                  Remember where each card is placed!
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                  {movedSlotCards.map((card, idx) => (
                    <FacesCard key={idx} card={card} size="sm" badgeText={`Spot #${idx + 1}`} />
                  ))}
                </div>

                <button
                  onClick={() => handleFinishStudyPhase()}
                  className="px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Ready! Drop the Curtain! ({studyTimeRemaining}s)
                </button>
              </div>
            )}

            {gamePhase === 'quiz' && (
              <div className="text-center w-full max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-black text-black">
                  Which 2 cards swapped places?
                </h2>
                <p className="text-sm text-black/80 font-medium">
                  Tap the 2 cards that moved! ({childTappedMovedIndices.length}/2 selected)
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                  {movedSlotCards.map((card, idx) => {
                    const isSelected = childTappedMovedIndices.includes(idx);
                    return (
                      <FacesCard
                        key={idx}
                        card={card}
                        isSelected={isSelected}
                        size="sm"
                        badgeText={`Spot #${idx + 1}`}
                        onClick={() => {
                          soundEngine.playPop();
                          if (childTappedMovedIndices.includes(idx)) {
                            setChildTappedMovedIndices((prev) => prev.filter((i) => i !== idx));
                          } else {
                            const next = [...childTappedMovedIndices, idx];
                            setChildTappedMovedIndices(next);
                            if (next.length === 2) {
                              const isMatch =
                                movedIndices.every((m) => next.includes(m)) &&
                                next.every((n) => movedIndices.includes(n));
                              handleAnswerSubmit(isMatch);
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 6: LIVE SHUFFLE */}
        {gamePhase !== 'intro' && activeMode === 'position_tracker' && trackerTarget && (
          <div className="w-full flex flex-col items-center text-center">
            <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
              Live Shuffle Shell Game
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
              {isShufflingActive
                ? `Keep your eyes on ${trackerTarget.name}!`
                : `Where did ${trackerTarget.name} land?`}
            </h2>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-2 border-[#7f27a8] shadow-sm my-4">
              <span className="text-2xl">{trackerTarget.emoji}</span>
              <span className="font-black text-black">Find: {trackerTarget.name}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 my-4 max-w-2xl">
              {trackerCards.map((card, originalIdx) => {
                const currentSlot = shufflePositions[originalIdx];
                return (
                  <div
                    key={card.id}
                    style={{ order: currentSlot }}
                    className="transition-all duration-300 transform"
                  >
                    <FacesCard
                      card={card}
                      isFlipped={isShufflingActive || gamePhase === 'quiz'}
                      size="sm"
                      onClick={() => {
                        if (gamePhase === 'quiz' && !isShufflingActive) {
                          handleAnswerSubmit(card.id === trackerTarget.id);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 7: WHAT'S THEIR POSITION? */}
        {gamePhase !== 'intro' && activeMode === 'whats_their_position' && (
          <div className="w-full flex flex-col items-center text-center">
            {gamePhase === 'study' && (
              <div>
                <span className="text-xs uppercase font-black bg-[#ffd400] text-black px-3 py-1 rounded-full border border-black">
                  Visual &amp; Number Sequence
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                  Remember their number in line!
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                  {positionSequence.map((card, idx) => (
                    <FacesCard key={card.id} card={card} size="sm" badgeText={`#${idx + 1}`} />
                  ))}
                </div>

                <button
                  onClick={() => handleFinishStudyPhase()}
                  className="px-6 py-2.5 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  I Know Their Positions! ({studyTimeRemaining}s)
                </button>
              </div>
            )}

            {gamePhase === 'quiz' && positionTarget && (
              <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-[#7f27a8] shadow-lg">
                <h2 className="text-2xl md:text-3xl font-black text-black mb-2">
                  What was {positionTarget.card.name}'s position?
                </h2>
                <div className="flex justify-center my-4">
                  <FacesCard card={positionTarget.card} size="md" />
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                  {positionSequence.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(idx + 1 === positionTarget.correctPos)}
                      className="p-3 rounded-2xl border-2 border-[#7f27a8] bg-white hover:bg-[#ffd400] font-black text-lg transition-all active:scale-95 shadow-sm cursor-pointer text-black"
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 8: WHO SANG WHAT? (REAL INTERNET SONGS) */}
        {gamePhase !== 'intro' && activeMode === 'who_sang_what' && mysterySinger && (
          <div className="w-full flex flex-col items-center text-center max-w-3xl">
            <div className="mb-4">
              <span className="text-xs uppercase font-black bg-[#e885cf] text-black px-3 py-1 rounded-full border border-black">
                Musical Tone &amp; Song Matching · Real Internet Songs
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
                Who Sang What?
              </h2>
              <p className="text-sm text-black/80 font-medium">
                Tap each character to hear their song clip from the internet, then play the Mystery Song!
              </p>
            </div>

            {songsLoading && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-[#ffd400] text-black font-black text-xs border border-black">
                Loading fresh internet songs for Round {roundNumber}...
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 my-4">
              {singingCast.map((c) => {
                const track = songTracksMap[c.id];
                const isPlaying = nowPlayingKey === c.id;
                return (
                  <div key={c.id} className="flex flex-col items-center">
                    <FacesCard card={c} size="sm" />
                    <button
                      onClick={async () => {
                        soundEngine.playPop();
                        setNowPlayingKey(c.id);
                        await playInternetSongClip(track, c.musicalRiff, playCardRiff);
                      }}
                      className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border-2 border-black cursor-pointer transition-all ${
                        isPlaying
                          ? 'bg-[#f76400] text-white scale-105'
                          : 'bg-[#ffd400] hover:bg-[#e885cf] text-black'
                      }`}
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>{isPlaying ? 'Playing Clip...' : 'Hear Song'}</span>
                    </button>
                    {track && (
                      <span className="text-[10px] font-bold text-black/75 max-w-[110px] truncate mt-1">
                        ♪ {track.title}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-5 bg-white rounded-3xl border-2 border-[#7f27a8] shadow-md w-full flex flex-col items-center">
              <button
                onClick={async () => {
                  soundEngine.playPop();
                  setNowPlayingKey('mystery');
                  await playInternetSongClip(
                    songTracksMap[mysterySinger.id],
                    mysterySinger.musicalRiff,
                    playCardRiff
                  );
                }}
                className="px-6 py-3 rounded-full bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-base shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Music className="w-5 h-5" />
                <span>
                  {nowPlayingKey === 'mystery'
                    ? 'Playing Mystery Song...'
                    : "Play Mystery Singer's Song!"}
                </span>
              </button>

              <div className="mt-4 text-xs font-black uppercase tracking-wider text-black">
                Tap the character who sang that internet song:
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {singingCast.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAnswerSubmit(c.id === mysterySinger.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#53b0c9]/25 hover:bg-[#ffd400] border-2 border-black text-black font-black text-sm cursor-pointer active:scale-95 transition-colors"
                  >
                    {c.name} {c.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 9: MEMORY TRAIN */}
        {gamePhase !== 'intro' && activeMode === 'memory_train' && (
          <div className="w-full flex flex-col items-center text-center max-w-xl">
            <span className="text-xs uppercase font-black bg-[#53b0c9] text-black px-3 py-1 rounded-full border border-black">
              Memory Train Sequence
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
              The Memory Train is Rolling!
            </h2>
            <p className="text-sm text-black/80 font-medium">
              Tap the items packed on the train in exact order!
            </p>

            <div className="flex items-center gap-2 my-4 overflow-x-auto p-4 bg-white rounded-2xl border-2 border-[#53b0c9] max-w-full">
              <span className="text-3xl">🚂</span>
              {trainDeck.slice(0, trainStepIndex).map((card, idx) => (
                <div key={card.id} className="flex items-center gap-1.5 shrink-0">
                  <div className="bg-[#ffd400] border-2 border-black rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-2xl">{card.emoji}</span>
                    <span className="font-black text-xs text-black">{card.name}</span>
                  </div>
                  {idx < trainStepIndex - 1 && <span className="text-[#7f27a8] font-black">→</span>}
                </div>
              ))}
            </div>

            <div className="w-full bg-white rounded-2xl p-4 border-2 border-[#7f27a8] shadow-md mt-2">
              <div className="text-xs font-black uppercase tracking-wider text-black mb-2">
                Sequence entered: ({trainUserSequence.length}/{trainStepIndex})
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[40px]">
                {trainUserSequence.map((c, i) => (
                  <span
                    key={i}
                    className="bg-[#7f27a8] text-white text-xs font-black px-2.5 py-1 rounded-lg"
                  >
                    #{i + 1} {c.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {trainChoices.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      soundEngine.playPop();
                      const next = [...trainUserSequence, card];
                      setTrainUserSequence(next);

                      const targetCardAtStep = trainDeck[next.length - 1];
                      if (!targetCardAtStep || card.id !== targetCardAtStep.id) {
                        handleAnswerSubmit(false);
                        setTrainUserSequence([]);
                      } else if (next.length === trainStepIndex) {
                        soundEngine.playSuccess();
                        if (trainStepIndex >= ageConfig.trainMaxSteps) {
                          handleAnswerSubmit(true);
                        } else {
                          const nextStep = trainStepIndex + 1;
                          setTrainStepIndex(nextStep);
                          setTrainChoices(
                            shuffleArray(trainDeck.slice(0, Math.min(nextStep + 2, trainDeck.length)))
                          );
                          setTrainUserSequence([]);
                          if (trainDeck[trainStepIndex]) {
                            speakChildQuestion(
                              `Next passenger: ${trainDeck[trainStepIndex].name}`,
                              ageConfig.age,
                              child.band
                            );
                          }
                        }
                      }
                    }}
                    className="p-2.5 rounded-xl border-2 border-[#53b0c9] hover:border-black bg-white hover:bg-[#ffd400] text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{card.emoji}</span>
                    <span>{card.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 10: FIND THE TREASURE */}
        {gamePhase !== 'intro' && activeMode === 'find_the_treasure' && treasureTarget && (
          <TreasureMapView
            gridSize={ageConfig.gridSize}
            plottedItems={plottedTreasureItems}
            targetItem={treasureTarget}
            onCoordinateFound={(_x, _y, correct) => handleAnswerSubmit(correct)}
          />
        )}

        {/* MODE 11: CREATIVE STUDIO */}
        {gamePhase !== 'intro' && activeMode === 'creative_studio' && !isCreativeStudioOpen && gamePhase !== 'finished' && (
          <div className="text-center max-w-md bg-white p-8 rounded-3xl border-2 border-[#7f27a8] shadow-lg">
            <div className="text-5xl mb-3">🎙️</div>
            <h2 className="text-2xl font-black text-black mb-2">Creative Story Studio</h2>
            <p className="text-sm text-black/80 font-medium mb-6">
              Ready to invent a funny role-reversal tale with 3 surprise cards?
            </p>
            <button
              onClick={() => setIsCreativeStudioOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black font-black text-sm border-2 border-black shadow-md cursor-pointer"
            >
              Open Story Studio
            </button>
          </div>
        )}
      </main>

      <ConfettiOverlay show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <AmberFailureAlert
        isOpen={showAmberAlert}
        customMessage={amberMessage}
        onRetry={handleAmberRetry}
      />

      {roundFeedback === 'correct' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-black text-base text-black bg-[#ffd400] border-2 border-black animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-[#7f27a8]" />
          <span>Brilliant Memory! Round {roundNumber} Won! +10 XP</span>
        </div>
      )}

      {gamePhase === 'finished' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border-4 border-[#ffd400] shadow-2xl">
            <div className="text-6xl mb-2 animate-bounce">{didTimeOut ? '⏰' : '🏆'}</div>
            <span
              className={`text-xs uppercase font-black tracking-widest px-3 py-1 rounded-full border border-black ${
                didTimeOut ? 'bg-[#c1008f] text-white' : 'bg-[#ffd400] text-black'
              }`}
            >
              {didTimeOut ? "Time's Up! Final Score" : 'Faces & Things Champion!'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-black mt-2">
              {didTimeOut ? "Time's Up!" : '20 Rounds Complete!'}
            </h2>
            <p className="text-sm text-black/80 font-medium mt-1">
              {child.name} solved {correctCount} of {totalRounds} unique challenges in {formatTimerClock(didTimeOut ? totalTimerSeconds : Math.max(10, Math.round((Date.now() - startTime) / 1000)))}.
            </p>

            <div className="bg-[#ffd400] border-2 border-black rounded-2xl p-3.5 my-4">
              <div className="text-[11px] font-black text-black uppercase tracking-wider">Final Score</div>
              <div className="text-3xl font-black text-black tabular-nums">{correctCount * 10} pts</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="bg-[#53b0c9]/25 p-3.5 rounded-2xl border-2 border-[#53b0c9]">
                <div className="text-[11px] font-black text-black uppercase">Accuracy</div>
                <div className="text-2xl font-black text-black mt-0.5">
                  {Math.round((correctCount / totalRounds) * 100)}%
                </div>
              </div>
              <div className="bg-[#e885cf]/30 p-3.5 rounded-2xl border-2 border-[#7f27a8]">
                <div className="text-[11px] font-black text-black uppercase">XP Awarded</div>
                <div className="text-2xl font-black text-[#7f27a8] mt-0.5">
                  +{calculateRewardXp(Math.round((correctCount / totalRounds) * 100), difficulty, !didTimeOut && correctCount === totalRounds) + 40} XP
                </div>
              </div>
            </div>

            {playMode === 'co_play' && (
              <div className="bg-[#ffd400]/30 p-3 rounded-2xl border-2 border-[#ffd400] mb-6">
                <div className="text-xs font-black text-black">
                  Co-Play: Player 1 ({playerScores.p1} pts) vs Player 2 ({playerScores.p2} pts)
                </div>
                <div className="text-sm font-black text-[#7f27a8] mt-1">
                  {playerScores.p1 > playerScores.p2
                    ? '🎉 Player 1 Takes the Crown!'
                    : playerScores.p2 > playerScores.p1
                    ? '🎉 Player 2 Takes the Crown!'
                    : '🤝 A Brilliant Tie Game!'}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundEngine.playPop();
                  beginRaceSession(activeMode);
                }}
                className="flex-1 py-3 rounded-xl border-2 border-black hover:bg-[#ffd400]/30 text-black font-black text-sm transition-colors cursor-pointer"
              >
                Play 20 New Rounds
              </button>
              <button
                onClick={handleExitGame}
                className="flex-1 py-3 rounded-xl bg-[#7f27a8] hover:bg-[#c1008f] text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Back to World
              </button>
            </div>
          </div>
        </div>
      )}

      <CreativeStudioModal
        isOpen={isCreativeStudioOpen}
        onClose={() => {
          setIsCreativeStudioOpen(false);
          if (lockedMode) handleExitGame();
        }}
        character={creativeCharacter}
        animal={creativeAnimal}
        object={creativeObject}
        onNewCards={() => {
          setCreativeCharacter(shuffleArray(FACES_CHARACTERS)[0]);
          setCreativeAnimal(shuffleArray(FACES_ANIMALS)[0]);
          setCreativeObject(shuffleArray(FACES_OBJECTS)[0]);
        }}
        onSaveStory={() => {
          setIsCreativeStudioOpen(false);
          handleGameComplete(totalRounds);
        }}
      />
    </div>
  );
};
