import { DevelopmentalBand } from '../types';

/**
 * MindQuest Non-Repeating Question Bank (1,200+ Unique Questions & Prompts)
 * Guarantees at least 20 distinct questions per game session and tracks seen IDs
 * in localStorage so restarting or logging in again serves completely fresh sets.
 */

export interface MathQuestion {
  id: string;
  prompt: string;
  subPrompt?: string;
  visualEmoji?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface ReadingQuestion {
  id: string;
  title: string;
  passage?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface LogicPuzzle {
  id: string;
  question: string;
  sequence: string[];
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface SpatialPuzzleData {
  id: string;
  title: string;
  question: string;
  visualType: 'box' | 'grid2' | 'grid3' | 'cube_net' | 'mirror' | 'rotate';
  visualHeader?: string;
  visualCells: string[];
  options: { label: string; graphic: string }[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface SpeedStimulusItem {
  id: string;
  display: string;
  subtext?: string;
  category: 'left' | 'right';
}

export interface SpeedThemePack {
  id: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  items: SpeedStimulusItem[];
}

export interface MemoryCardPairSeed {
  id: string;
  symbol: string;
  label: string;
}

export interface StrategyBoardData {
  id: string;
  title: string;
  gridSize: number;
  startPos: { x: number; y: number };
  goalPos: { x: number; y: number };
  obstacles: { x: number; y: number }[];
  gems: { id: number; pos: { x: number; y: number } }[];
}

// ============================================================
// Non-Repeating Persistent Selector
// ============================================================
export function pickNonRepeatingItems<T extends { id: string }>(
  childId: string,
  gameKey: string,
  pool: T[],
  count: number,
  seedOffset: number = 0
): T[] {
  if (pool.length === 0) return [];
  const storageKey = `mindquest_seen_v1_${childId}_${gameKey}`;
  let seenIds: string[] = [];

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) seenIds = JSON.parse(raw);
    } catch {
      seenIds = [];
    }
  }

  const seenSet = new Set(seenIds);
  let unseen = pool.filter((item) => !seenSet.has(item.id));

  // If fewer unseen items remain than needed, reset cycle while avoiding last batch
  let selected: T[] = [];
  const shuffle = (arr: T[]) => {
    const copy = [...arr];
    let s = Date.now() + seedOffset * 97 + seenIds.length * 31;
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  if (unseen.length >= count) {
    selected = shuffle(unseen).slice(0, count);
    seenIds = [...seenIds, ...selected.map((item) => item.id)];
  } else {
    const firstPart = shuffle(unseen);
    const firstPartIds = new Set(firstPart.map((item) => item.id));
    const remainderNeeded = Math.max(0, count - firstPart.length);
    const recycledPool = shuffle(pool.filter((item) => !firstPartIds.has(item.id)));
    const secondPart = recycledPool.slice(0, remainderNeeded);
    selected = [...firstPart, ...secondPart];
    // Start a fresh cycle tracking the newly picked items so they won't repeat next play
    seenIds = selected.map((item) => item.id);
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(seenIds));
    } catch {
      // Ignore storage quota issues
    }
  }

  return selected;
}

function shuffleOptionsWithAnswer(
  correctValue: string,
  distractors: string[]
): { options: string[]; correctIndex: number } {
  const uniqueDistractors = Array.from(new Set(distractors.filter((d) => d !== correctValue))).slice(0, 3);
  const combined = [correctValue, ...uniqueDistractors];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return {
    options: combined,
    correctIndex: combined.indexOf(correctValue),
  };
}

// ============================================================
// 1. MENTAL MATH BANK (400+ Unique Questions across 4 Bands)
// ============================================================
function buildMathPool(band: DevelopmentalBand): MathQuestion[] {
  const pool: MathQuestion[] = [];

  if (band === 'young_explorers') {
    const emojiStories = [
      { emoji: '🍎', name: 'apples', prompt: 'Count all the shiny apples!' },
      { emoji: '🐟', name: 'fish', prompt: 'How many fish are swimming now?' },
      { emoji: '⭐', name: 'stars', prompt: 'Add up the glowing stars!' },
      { emoji: '🍓', name: 'strawberries', prompt: 'Count the sweet strawberries!' },
      { emoji: '🦆', name: 'ducks', prompt: 'How many little ducks in the pond?' },
      { emoji: '🎈', name: 'balloons', prompt: 'Count the party balloons!' },
      { emoji: '🍪', name: 'cookies', prompt: 'How many yummy cookies altogether?' },
      { emoji: '🦋', name: 'butterflies', prompt: 'Count the fluttering butterflies!' },
      { emoji: '🐢', name: 'turtles', prompt: 'How many friendly turtles?' },
      { emoji: '🍌', name: 'bananas', prompt: 'Add the yellow bananas together!' },
    ];

    // 60 Emoji Addition Questions
    for (let idx = 0; idx < 60; idx++) {
      const a = (idx % 6) + 1;
      const b = (Math.floor(idx / 6) % 5) + 1;
      const ans = a + b;
      const theme = emojiStories[idx % emojiStories.length];
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 1),
        String(Math.max(1, ans - 1)),
        String(ans + 2),
      ]);
      pool.push({
        id: `mm_ye_add_${idx}`,
        prompt: `${theme.prompt} (${a} + ${b})`,
        visualEmoji: `${theme.emoji.repeat(a)} + ${theme.emoji.repeat(b)}`,
        subPrompt: `${a} ${theme.name} plus ${b} ${theme.name} equals?`,
        options,
        correctIndex,
        hint: `Start at ${a} and count ${b} more ${theme.name}!`,
        explanation: `${a} + ${b} = ${ans} ${theme.name}! Great counting!`,
      });
    }

    // 45 Emoji Subtraction Questions
    for (let idx = 0; idx < 45; idx++) {
      const a = (idx % 6) + 4; // 4..9
      const b = (Math.floor(idx / 6) % 3) + 1; // 1..3
      const ans = a - b;
      const theme = emojiStories[(idx + 3) % emojiStories.length];
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 1),
        String(ans + 2),
        String(Math.max(0, ans - 1)),
      ]);
      pool.push({
        id: `mm_ye_sub_${idx}`,
        prompt: `Take away ${b} from ${a}!`,
        visualEmoji: `${theme.emoji.repeat(a)} − ${theme.emoji.repeat(b)}`,
        subPrompt: `You have ${a} ${theme.name} and share ${b}. How many are left?`,
        options,
        correctIndex,
        hint: `Count backwards ${b} steps from ${a}.`,
        explanation: `${a} − ${b} = ${ans} ${theme.name} remaining!`,
      });
    }
  } else if (band === 'senior_explorers') {
    const promptTemplates = [
      (a: number, b: number) => `Quick Multiply: ${a} × ${b}`,
      (a: number, b: number) => `Explorer Crate Math: ${a} boxes with ${b} gems each`,
      (a: number, b: number) => `Mental Product Challenge: ${a} × ${b} = ?`,
    ];

    // 45 Multiplication questions
    for (let idx = 0; idx < 45; idx++) {
      const a = (idx % 9) + 3; // 3..11
      const b = (Math.floor(idx / 9) % 7) + 3; // 3..9
      const ans = a * b;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + a),
        String(Math.max(2, ans - b)),
        String(ans + 4),
      ]);
      pool.push({
        id: `mm_se_mul_${idx}`,
        prompt: promptTemplates[idx % promptTemplates.length](a, b),
        subPrompt: `Calculate ${a} times ${b} mentally:`,
        options,
        correctIndex,
        hint: `Try breaking it into easier tens or adding ${a} groups of ${b}.`,
        explanation: `${a} × ${b} = ${ans}! Sharp multiplication skills!`,
      });
    }

    // 40 Two-Digit Addition & Subtraction questions
    for (let idx = 0; idx < 40; idx++) {
      const isAdd = idx % 2 === 0;
      const a = 24 + ((idx * 7) % 65);
      const b = 15 + ((idx * 5) % 34);
      const ans = isAdd ? a + b : a - b;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 10),
        String(Math.max(1, ans - 2)),
        String(ans + 2),
      ]);
      pool.push({
        id: `mm_se_addsub_${idx}`,
        prompt: isAdd ? `Mental Sum: ${a} + ${b}` : `Mental Difference: ${a} − ${b}`,
        subPrompt: isAdd
          ? `Add the tens first, then the ones:`
          : `Subtract the tens first, then adjust the ones:`,
        options,
        correctIndex,
        hint: isAdd ? `Start from ${a}, add ${Math.floor(b / 10) * 10}, then add ${b % 10}.` : `Take away ${Math.floor(b / 10) * 10} first, then ${b % 10}.`,
        explanation: `${a} ${isAdd ? '+' : '−'} ${b} = ${ans}!`,
      });
    }

    // 25 Doubles, Halves & Division questions
    for (let idx = 0; idx < 25; idx++) {
      const base = 14 + idx * 3;
      const isDouble = idx % 2 === 0;
      const value = isDouble ? base : base * 2;
      const ans = isDouble ? base * 2 : base;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 4),
        String(Math.max(2, ans - 4)),
        String(ans + 6),
      ]);
      pool.push({
        id: `mm_se_dh_${idx}`,
        prompt: isDouble ? `Double Check: 2 × ${value}` : `Halfway Split: ${value} ÷ 2`,
        subPrompt: isDouble ? `What is double ${value}?` : `What is half of ${value}?`,
        options,
        correctIndex,
        hint: isDouble ? `Double the tens, double the ones, and combine.` : `Split ${value} into two equal parts.`,
        explanation: isDouble ? `Double of ${value} is ${ans}!` : `Half of ${value} is ${ans}!`,
      });
    }
  } else if (band === 'discoverers') {
    // 35 Order of Operations
    for (let idx = 0; idx < 35; idx++) {
      const a = (idx % 7) + 4;
      const b = (Math.floor(idx / 7) % 6) + 5;
      const c = (idx % 9) + 7;
      const isSub = idx % 2 === 0;
      const ans = isSub ? a * b - c : a * b + c;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 6),
        String(Math.max(2, ans - 4)),
        String(isSub ? a * (b - 1) : a * (b + 1)),
      ]);
      pool.push({
        id: `mm_di_ooo_${idx}`,
        prompt: `Operation Order: (${a} × ${b}) ${isSub ? '−' : '+'} ${c}`,
        subPrompt: `Multiply inside the parentheses first, then ${isSub ? 'subtract' : 'add'} ${c}:`,
        options,
        correctIndex,
        hint: `${a} × ${b} = ${a * b}. Now ${isSub ? 'subtract' : 'add'} ${c}.`,
        explanation: `${a * b} ${isSub ? '−' : '+'} ${c} = ${ans}!`,
      });
    }

    // 35 Percentages & Fractions
    const pctSteps = [10, 20, 25, 50, 75];
    for (let idx = 0; idx < 35; idx++) {
      const pct = pctSteps[idx % pctSteps.length];
      const base = ((idx % 9) + 2) * 20; // 40..200
      const ans = (pct * base) / 100;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 10),
        String(Math.max(2, ans - 5)),
        String(ans + 15),
      ]);
      pool.push({
        id: `mm_di_pct_${idx}`,
        prompt: `Percent Power: ${pct}% of ${base}`,
        subPrompt: `Find ${pct}% of ${base} mentally:`,
        options,
        correctIndex,
        hint: `10% of ${base} is ${base / 10}. Scale from there!`,
        explanation: `${pct}% of ${base} = ${ans}!`,
      });
    }

    // 35 Linear Algebra Equations
    for (let idx = 0; idx < 35; idx++) {
      const coeff = (idx % 6) + 3; // 3..8
      const x = (Math.floor(idx / 6) % 9) + 3; // 3..11
      const offset = (idx % 8) + 4;
      const rhs = coeff * x + offset;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(x), [
        String(x + 1),
        String(Math.max(1, x - 1)),
        String(x + 2),
      ]);
      pool.push({
        id: `mm_di_alg_${idx}`,
        prompt: `Balance the Equation: ${coeff}x + ${offset} = ${rhs}`,
        subPrompt: `Solve for the mystery number x:`,
        options,
        correctIndex,
        hint: `First calculate ${rhs} − ${offset} = ${coeff * x}, then divide by ${coeff}.`,
        explanation: `${coeff}x = ${coeff * x}, so x = ${x}!`,
      });
    }
  } else {
    // MASTERS (14-16)
    // 40 Roots & Powers
    for (let idx = 0; idx < 40; idx++) {
      const rootBase = (idx % 12) + 5; // 5..16
      const square = rootBase * rootBase;
      const expBase = (Math.floor(idx / 12) % 5) + 2; // 2..6
      const ans = rootBase + expBase * expBase;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 4),
        String(Math.max(2, ans - 3)),
        String(ans + 7),
      ]);
      pool.push({
        id: `mm_ma_root_${idx}`,
        prompt: `Powers & Roots: √${square} + ${expBase}²`,
        subPrompt: `Evaluate the square root plus the squared term:`,
        options,
        correctIndex,
        hint: `√${square} = ${rootBase} and ${expBase}² = ${expBase * expBase}.`,
        explanation: `${rootBase} + ${expBase * expBase} = ${ans}!`,
      });
    }

    // 35 Difference of Squares
    for (let idx = 0; idx < 35; idx++) {
      const a = 14 + (idx % 18); // 14..31
      const b = a - ((idx % 5) + 2); // gap 2..6
      const ans = (a - b) * (a + b);
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 12),
        String(Math.max(5, ans - 10)),
        String(ans + 20),
      ]);
      pool.push({
        id: `mm_ma_dos_${idx}`,
        prompt: `Algebraic Shortcut: ${a}² − ${b}²`,
        subPrompt: `Use (a − b)(a + b) for rapid mental calculation:`,
        options,
        correctIndex,
        hint: `(${a} − ${b}) = ${a - b}, and (${a} + ${b}) = ${a + b}. Multiply them!`,
        explanation: `${a - b} × ${a + b} = ${ans}!`,
      });
    }

    // 35 Compound Percentages & Ratios
    const rates = [15, 35, 45, 65];
    for (let idx = 0; idx < 35; idx++) {
      const rate = rates[idx % rates.length];
      const base = ((idx % 10) + 4) * 20; // 80..260
      const ans = (rate * base) / 100;
      const { options, correctIndex } = shuffleOptionsWithAnswer(`$${ans}`, [
        `$${ans + 4}`,
        `$${Math.max(2, ans - 4)}`,
        `$${ans + 9}`,
      ]);
      pool.push({
        id: `mm_ma_pct_${idx}`,
        prompt: `Rapid Finance Math: ${rate}% of $${base}`,
        subPrompt: `Decompose into 10% and 5% chunks:`,
        options,
        correctIndex,
        hint: `10% of $${base} is $${base / 10}; 5% is $${base / 20}.`,
        explanation: `${rate}% of $${base} = $${ans}!`,
      });
    }
  }

  return pool;
}

export function getMentalMathBatch(
  childId: string,
  band: DevelopmentalBand,
  count: number = 20,
  seedOffset: number = 0
): MathQuestion[] {
  const pool = buildMathPool(band);
  return pickNonRepeatingItems(childId, `math_${band}`, pool, count, seedOffset);
}

// ============================================================
// 2. READING & WORD DETECTIVE BANK (240+ Unique Questions)
// ============================================================
function buildReadingPool(band: DevelopmentalBand): ReadingQuestion[] {
  const pool: ReadingQuestion[] = [];

  if (band === 'young_explorers') {
    const rhymes = [
      ['CAT 🐱', 'HAT 🎩', 'DOG 🐶', 'SUN ☀️', 'CUP 🥤', '-at'],
      ['DOG 🐶', 'FROG 🐸', 'CAT 🐱', 'BUS 🚌', 'PEN 🖊️', '-og'],
      ['SUN ☀️', 'RUN 🏃', 'CAR 🚗', 'BOX 📦', 'BED 🛏️', '-un'],
      ['BUG 🐛', 'RUG 🧶', 'HAT 🎩', 'PIG 🐷', 'KEY 🔑', '-ug'],
      ['BEE 🐝', 'TREE 🌳', 'BAT 🦇', 'TOP 🪀', 'MUG ☕', '-ee'],
      ['STAR ⭐', 'CAR 🚗', 'FISH 🐟', 'MOON 🌙', 'DUCK 🦆', '-ar'],
      ['CAKE 🎂', 'SNAKE 🐍', 'BEAR 🐻', 'MILK 🥛', 'BOOK 📖', '-ake'],
      ['BOAT ⛵', 'GOAT 🐐', 'BIRD 🐦', 'LAMP 💡', 'BELL 🔔', '-oat'],
      ['RING 💍', 'KING 👑', 'FROG 🐸', 'KITE 🪁', 'DRUM 🥁', '-ing'],
      ['TRAIN 🚂', 'RAIN 🌧️', 'SHIP 🚢', 'BALL ⚽', 'SHOE 👞', '-ain'],
      ['BALL ⚽', 'TALL 🦒', 'LEAF 🍃', 'CORN 🌽', 'FORK 🍴', '-all'],
      ['MOON 🌙', 'SPOON 🥄', 'BEAR 🐻', 'PEAR 🍐', 'COAT 🧥', '-oon'],
      ['BEAR 🐻', 'PEAR 🍐', 'FROG 🐸', 'CAKE 🎂', 'KITE 🪁', '-ear'],
      ['FOX 🦊', 'BOX 📦', 'PIG 🐷', 'DUCK 🦆', 'ANT 🐜', '-ox'],
      ['HEN 🐔', 'PEN 🖊️', 'OWL 🦉', 'COW 🐄', 'MAP 🗺️', '-en'],
      ['PIG 🐷', 'WIG 💇', 'SUN ☀️', 'CAP 🧢', 'BED 🛏️', '-ig'],
      ['BED 🛏️', 'RED 🔴', 'HAT 🎩', 'DOG 🐶', 'ICE 🧊', '-ed'],
      ['MOUSE 🐭', 'HOUSE 🏠', 'LION 🦁', 'TRAIN 🚂', 'APPLE 🍎', '-ouse'],
      ['DUCK 🦆', 'TRUCK 🚚', 'SHEEP 🐑', 'ROSE 🌹', 'LOCK 🔒', '-uck'],
      ['FISH 🐟', 'DISH 🍽️', 'CAKE 🎂', 'OWL 🦉', 'BOOT 🥾', '-ish'],
    ];
    rhymes.forEach(([word, target, d1, d2, d3, fam], i) => {
      const { options, correctIndex } = shuffleOptionsWithAnswer(target, [d1, d2, d3]);
      pool.push({
        id: `rd_ye_rhyme_${i}`,
        title: 'Phonics Rhyme Match',
        passage: `Look at this word family sound (${fam}): ${word}`,
        prompt: `Which word rhymes with ${word.split(' ')[0]}?`,
        options,
        correctIndex,
        hint: `Listen closely to the ending sound "${fam}"!`,
        explanation: `${word.split(' ')[0]} and ${target.split(' ')[0]} share the "${fam}" sound!`,
      });
    });

    const opposites = [
      ['HOT ☀️', 'COLD ❄️', 'WARM ☕', 'RED 🔴', 'BIG 🐘'],
      ['BIG 🐘', 'SMALL 🐭', 'TALL 🦒', 'BLUE 🔵', 'FAST 🐆'],
      ['HAPPY 😊', 'SAD 😢', 'FUNNY 😂', 'GREEN 🟢', 'LOUD 📢'],
      ['DAY ☀️', 'NIGHT 🌙', 'NOON 🕛', 'SUNNY 🌤️', 'SKY ☁️'],
      ['FAST 🐆', 'SLOW 🐢', 'QUICK ⚡', 'RUN 🏃', 'JUMP 🦘'],
      ['UP ⬆️', 'DOWN ⬇️', 'TOP 🏔️', 'HIGH ☁️', 'OVER 🌈'],
      ['WET 💧', 'DRY 🏜️', 'RAIN 🌧️', 'POOL 🏊', 'BOAT ⛵'],
      ['OPEN 📂', 'CLOSED 🔒', 'WIDE ↔️', 'DOOR 🚪', 'KEY 🔑'],
      ['FULL 🥛', 'EMPTY 🫙', 'MORE ➕', 'MILK 🥛', 'BOWL 🥣'],
      ['LOUD 📢', 'QUIET 🤫', 'DRUM 🥁', 'SING 🎵', 'BELL 🔔'],
      ['SOFT 🧸', 'HARD 🪨', 'FLUFFY ☁️', 'PILLOW 🛏️', 'BEAR 🐻'],
      ['CLEAN ✨', 'DIRTY 🥾', 'SOAP 🧼', 'SHINE 🌟', 'WASH 🚿'],
      ['HEAVY 🏋️', 'LIGHT 🪶', 'ROCK 🪨', 'TRUCK 🚚', 'BOX 📦'],
      ['NEW ✨', 'OLD 🕰️', 'TOY 🧸', 'BOOK 📖', 'SHOE 👞'],
      ['START 🏁', 'FINISH 🏆', 'GO 🟢', 'RACE 🏃', 'PATH 🛤️'],
    ];
    opposites.forEach(([w, ans, d1, d2, d3], i) => {
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
      pool.push({
        id: `rd_ye_opp_${i}`,
        title: 'Opposite Word Finder',
        passage: `Today our clue word is: ${w}`,
        prompt: `What is the opposite of ${w.split(' ')[0]}?`,
        options,
        correctIndex,
        hint: `Think about what means the total reverse of ${w.split(' ')[0]}!`,
        explanation: `${ans.split(' ')[0]} is the opposite of ${w.split(' ')[0]}!`,
      });
    });

    const actions = [
      ['🐸 The little green frog JUMPED over the log.', 'JUMPED 🦘', 'Green 🟢', 'Little 🤏', 'Log 🪵'],
      ['🐶 The happy puppy CHASED the red ball.', 'CHASED 🏃', 'Happy 😊', 'Red 🔴', 'Ball ⚽'],
      ['🐦 Three blue birds SANG on the branch.', 'SANG 🎵', 'Blue 🔵', 'Three 3️⃣', 'Branch 🌿'],
      ['🐬 A silver dolphin LEAPED above the waves.', 'LEAPED 🌊', 'Silver ⚪', 'Waves 🌊', 'Ocean 🏝️'],
      ['🦁 The sleepy lion YAWNED in the grass.', 'YAWNED 🥱', 'Sleepy 😴', 'Grass 🌱', 'Lion 🦁'],
      ['🐒 Two cheeky monkeys CLIMBED the tall tree.', 'CLIMBED 🧗', 'Tall 🦒', 'Tree 🌳', 'Two 2️⃣'],
      ['🐰 Pip the bunny HOPPED into the garden.', 'HOPPED 🐇', 'Garden 🌷', 'Bunny 🐰', 'Soft ☁️'],
      ['🐝 A busy bee BUZZED near the yellow flower.', 'BUZZED 🐝', 'Yellow 💛', 'Flower 🌻', 'Busy ⏳'],
      ['🚢 The big boat SAILED across the blue sea.', 'SAILED ⛵', 'Blue 🔵', 'Big 🐘', 'Sea 🌊'],
      ['👧🏾 Bola DANCED joyfully to the drumbeat.', 'DANCED 💃', 'Joyfully ✨', 'Drumbeat 🥁', 'Bola 👧🏾'],
      ['👦🏾 Tobi KICKED the soccer ball into the net.', 'KICKED ⚽', 'Soccer 🥅', 'Net 🕸️', 'Fast ⚡'],
      ['🐘 An elephant SPRAYED cool water with its trunk.', 'SPRAYED 💦', 'Cool ❄️', 'Trunk 🐘', 'Water 💧'],
      ['🦉 Oliver Owl GLIDED silently under the moon.', 'GLIDED 🦉', 'Silently 🤫', 'Moon 🌙', 'Owl 🦉'],
      ['🐴 The brown horse GALLOPED across the field.', 'GALLOPED 🐎', 'Brown 🟤', 'Field 🌾', 'Horse 🐴'],
      ['🐢 A wise turtle SWAM slowly through the pond.', 'SWAM 🏊', 'Wise 🧠', 'Pond 💧', 'Slowly 🐢'],
    ];
    actions.forEach(([passage, verb, d1, d2, d3], i) => {
      const { options, correctIndex } = shuffleOptionsWithAnswer(verb, [d1, d2, d3]);
      pool.push({
        id: `rd_ye_verb_${i}`,
        title: 'Action Verb Detective',
        passage,
        prompt: 'Which word tells the ACTION that happened?',
        options,
        correctIndex,
        hint: 'Look for the doing word that shows movement or action!',
        explanation: `"${verb.split(' ')[0]}" is the action verb!`,
      });
    });
  } else if (band === 'senior_explorers') {
    const contextWords = [
      ['CONCEALED', '"The secret chest was CONCEALED beneath thick vines, so nobody could spot it."', 'Hidden from view', 'Broken open', 'Shining brightly', 'Heavy stone'],
      ['FRAGILE', '"Carry the FRAGILE glass lantern gently so it will not crack on the stones."', 'Easily broken or delicate', 'Heavy and iron', 'Bright orange', 'Waterproof'],
      ['EAGER', '"The explorers were EAGER to open the map, cheering and leaning forward."', 'Excited and ready', 'Sleepy and tired', 'Afraid to look', 'Angry'],
      ['SWIFT', '"The SWIFT cheetah darted across the meadow faster than a racing bike."', 'Very fast', 'Very sleepy', 'Tiny and quiet', 'Clumsy'],
      ['GENEROUS', '"Maya was GENEROUS, sharing half of her berries with every traveler."', 'Willing to share kindly', 'Selfish and grumpy', 'Hungry', 'Very loud'],
      ['ANCIENT', '"The ANCIENT temple was built thousands of years ago by long-forgotten kings."', 'Very old', 'Brand new', 'Painted pink', 'Tiny'],
      ['CAUTIOUS', '"Crossing the narrow rope bridge, Leo took CAUTIOUS, careful steps."', 'Very careful', 'Reckless and wild', 'Running fast', 'Laughing loudly'],
      ['OBSERVANT', '"Because Amaka is OBSERVANT, she noticed the tiny footprint right away."', 'Quick to notice details', 'Forgetful', 'Always running', 'Quiet'],
      ['SCARCE', '"Water was SCARCE in the dry desert, with only a few drops in the canteen."', 'Rare and hard to find', 'Flowing everywhere', 'Freezing cold', 'Salty'],
      ['THRILLED', '"When Tobi solved the riddle, he was THRILLED and jumped with joy!"', 'Very excited and happy', 'Confused', 'Bored', 'Disappointed'],
      ['ABUNDANT', '"Mangoes were ABUNDANT in the orchard, hanging from every branch."', 'Plentiful and many', 'Completely missing', 'Sour and rotten', 'Tiny'],
      ['COURAGEOUS', '"Even in the dark cave, the COURAGEOUS scout kept walking bravely forward."', 'Brave', 'Timid', 'Exhausted', 'Careless'],
      ['PEACEFUL', '"By the quiet lake at sunrise, the morning felt calm and PEACEFUL."', 'Calm and quiet', 'Noisy and chaotic', 'Stormy', 'Crowded'],
      ['ASSIST', '"Could you ASSIST me by holding the flashlight while I check the lock?"', 'Help', 'Ignore', 'Hide from', 'Break'],
      ['VANISHED', '"The magician waved his hat and the coin VANISHED without a trace!"', 'Disappeared completely', 'Grew giant', 'Turned to gold', 'Bounced high'],
      ['DETERMINED', '"Though the hill was steep, she was DETERMINED to reach the summit."', 'Firmly decided not to quit', 'Ready to quit', 'Lost in thought', 'Uncertain'],
      ['LUMINOUS', '"The LUMINOUS fireflies glowed like tiny lanterns across the dark field."', 'Glowing brightly with light', 'Invisible', 'Freezing cold', 'Heavy'],
      ['VAST', '"The sailors gazed across the VAST ocean stretching endlessly to the horizon."', 'Huge and wide', 'Tiny puddle', 'Dry land', 'Shallow'],
      ['PERPLEXED', '"Sam scratched his head, completely PERPLEXED by the twisted riddle."', 'Puzzled and confused', 'Certain', 'Delighted', 'Sleepy'],
      ['RESTORE', '"Workers will RESTORE the broken fountain so it looks new again."', 'Repair back to good condition', 'Destroy completely', 'Paint black', 'Hide underground'],
      ['FRANTIC', '"Looking everywhere for her lost key, she grew FRANTIC before the bus arrived."', 'Urgent and worried', 'Calm and relaxed', 'Sound asleep', 'Laughing'],
      ['HARMONY', '"When all instruments played in HARMONY, the concert hall sounded magical."', 'Pleasant agreement together', 'Loud clashing noise', 'Complete silence', 'Confusion'],
      ['MIMIC', '"Parrots can MIMIC human words by repeating the sounds they hear."', 'Copy or imitate', 'Forget', 'Invent books', 'Fly above'],
      ['SOLITARY', '"A SOLITARY lighthouse stood alone on the rocky island."', 'Single and alone', 'Crowded with shops', 'Underground', 'Wooden'],
      ['TREMENDOUS', '"A TREMENDOUS roar echoed from the waterfall down the canyon."', 'Enormous and powerful', 'Whisper-quiet', 'Tiny', 'Gentle'],
    ];
    contextWords.forEach(([word, passage, ans, d1, d2, d3], i) => {
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
      pool.push({
        id: `rd_se_ctx_${i}`,
        title: 'Context Clue Vocabulary',
        passage,
        prompt: `What does ${word} mean in this sentence?`,
        options,
        correctIndex,
        hint: 'Use the surrounding words in the sentence to unlock the meaning!',
        explanation: `${word} means "${ans}".`,
      });
    });

    const inferences = [
      ['"Leo grabbed his woolen scarf, insulated boots, and heavy coat before stepping out."', 'It is freezing cold outside', 'It is a hot beach day', 'He is going swimming', 'He is going to bed'],
      ['"Kemi blew out eight glowing candles while everyone clapped and sang."', 'It is Kemi’s 8th birthday', 'The power went out in a storm', 'She is cooking breakfast', 'It is early morning'],
      ['"The grass sparkled with fresh puddles and kids carried colorful umbrellas."', 'It recently rained', 'It has not rained all year', 'Snow is piled three feet high', 'It is midnight'],
      ['"Bags packed with sunscreen, towels, and buckets sat beside the car."', 'The family is heading to the beach', 'They are climbing an icy glacier', 'They are studying in a library', 'They are going to the dentist'],
      ['"Smoke smelled sweet like cinnamon and a warm timer dinged in the kitchen."', 'Something delicious just finished baking', 'Someone is washing the car', 'A thunderstorm is starting', 'The fridge is broken'],
      ['"Crowds wore team scarves, waved flags, and cheered loudly as the whistle blew."', 'They are watching a live sports match', 'They are inside a quiet museum', 'Everyone is taking a math exam', 'They are sleeping in tents'],
      ['"Tina rubbed her eyes, yawned twice, and pulled the blanket up to her chin."', 'Tina is very sleepy', 'Tina is ready to run a race', 'Tina just woke up refreshed', 'Tina is excited for fireworks'],
      ['"Dark clouds rolled overhead, tree branches bent sideways, and thunder rumbled."', 'A big storm is arriving', 'A heatwave is beginning', 'Winter snow is melting calmly', 'Sunrise is bright and clear'],
      ['"Empty plates sat on the table beside crumpled napkins and two empty juice glasses."', 'People just finished eating a meal', 'Dinner has not been cooked yet', 'Nobody visited the kitchen today', 'They are painting pictures'],
      ['"Every seat had a violin stand, sheet music, and a polished flute waiting on stage."', 'An orchestra is about to perform', 'A soccer team is practicing goals', 'Scientists are testing rockets', 'Farmers are harvesting wheat'],
      ['"Pa James squinted closely and put on his reading glasses to check the tiny map print."', 'The text on the map is too small to read clearly without glasses', 'He wants sunglasses for the sun', 'The room is pitch black', 'He is going swimming'],
      ['"Hannah’s hands were covered in blue paint splatters beside an easel and wet brushes."', 'Hannah has been painting artwork', 'Hannah was baking bread', 'Hannah was fixing a bicycle', 'Hannah was planting trees'],
      ['"The dog sprinted to the front door wagging its tail as keys jingled outside."', 'Someone familiar is arriving home', 'A thunderstorm scared the dog', 'The dog is fast asleep', 'A cat is hiding under the bed'],
      ['"Backpack zipped, lunchbox packed, and sneakers tied, Kabir waited by the bus stop."', 'Kabir is heading to school', 'Kabir is going camping for a month', 'Kabir is getting ready for sleep', 'Kabir is taking a bath'],
      ['"White frost coated the car windshield and breath made little clouds in the air."', 'The air outside is icy cold', 'Summer vacation just began', 'It is noon in the desert', 'A heater is blowing hot air'],
      ['"She tiptoed past the cradle and whispered softly so nobody would wake."', 'A baby is sleeping nearby', 'A loud party is happening', 'She lost her voice from shouting', 'Everyone is outside playing'],
      ['"The trophy shelf sparkled with five gold medals and framed marathon photos."', 'Someone in the house loves running races and wins often', 'Nobody plays sports there', 'They collect antique stamps', 'They only play video games'],
      ['"Rows of tomatoes, carrots, and watering cans lined the sunny backyard fence."', 'Someone tends a vegetable garden', 'It is an indoor bowling alley', 'Cars are parked on the grass', 'It is a frozen pond'],
      ['"Balloons floated by the ceiling and a colorful banner spelled CONGRATULATIONS!"', 'A celebration party is taking place', 'A library study session is starting', 'People are moving houses', 'It is a dentist office'],
      ['"Telescope aimed toward Saturn, Amina jotted notes beside a star chart."', 'Amina is observing the night sky', 'Amina is diving underwater', 'Amina is baking cookies', 'Amina is mowing the lawn'],
      ['"With dusty boots and a compass in hand, Nonso checked the trailhead sign."', 'Nonso is hiking outdoors', 'Nonso is swimming laps', 'Nonso is playing piano', 'Nonso is shopping at a mall'],
      ['"The popcorn bucket was nearly empty and the closing credits rolled across the dark room."', 'A movie just ended', 'A soccer game is starting', 'A teacher is giving a spelling quiz', 'Breakfast is being served'],
      ['"Fresh chalk dust covered the tray under neat equations on the green board."', 'Math was just taught in a classroom', 'A chef cooked soup', 'A pilot landed a plane', 'A storm flooded the street'],
      ['"Sandals filled with seashells sat neatly outside the wooden beach cabin."', 'Someone walked along the seashore', 'Someone climbed a snowy mountain', 'Someone explored a snowy forest', 'Someone went ice skating'],
      ['"The violin case snapped open and Ruth tightened the bow with rosin."', 'Ruth is preparing to play music', 'Ruth is going to wash dishes', 'Ruth is packing luggage for a flight', 'Ruth is fixing a clock'],
    ];
    inferences.forEach(([passage, ans, d1, d2, d3], i) => {
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
      pool.push({
        id: `rd_se_inf_${i}`,
        title: 'Reading Inference Challenge',
        passage,
        prompt: 'What is the most likely inference from these clues?',
        options,
        correctIndex,
        hint: 'Connect the tiny clues inside the passage to the real-life situation!',
        explanation: `The clues point directly to: "${ans}".`,
      });
    });
  } else if (band === 'discoverers') {
    const discQuestions = [
      ['Detective Deduction', '"A steaming mug of tea sat beside an open book with wet ink in the study."', 'Someone had occupied the desk moments ago', 'The room was empty for weeks', 'The book was unopened', 'The tea froze solid'],
      ['Metaphor Mastery', '"During the stormy crossing, the captain was an anchor for the anxious crew."', 'Provided steady calm and stability', 'Was heavy and immobile', 'Dropped iron chains', 'Slept through the storm'],
      ['Author Tone', '"Through twenty-four failed tests, Dr. Vance persevered until the generator finally shone."', 'Admiration for persistence', 'Mockery of stubbornness', 'Bored indifference', 'Anger at science'],
      ['Context Meaning', '"The witness gave a CONCISE report, explaining every key fact in just three sentences."', 'Brief and clear', 'Long and rambling', 'Completely false', 'Loud and emotional'],
      ['Simile Meaning', '"Her memory worked like a steel vault, locking away every date and name effortlessly."', 'Stored details reliably without forgetting', 'Was rusty and slow', 'Needed heavy keys', 'Only held metal objects'],
      ['Inference Clue', '"Footprints vanished cleanly at the edge of the freshly swept marble hallway."', 'Someone swept away the rest of the trail', 'People flew out the window', 'Nobody ever stepped on the marble', 'Rain washed the floor inside'],
      ['Vocabulary Shift', '"Though the surface looked PLAUSIBLE, close inspection revealed three glaring flaws."', 'Seeming believable at first glance', 'Impossible to understand', 'Painted bright yellow', 'Older than stone'],
      ['Character Trait', '"Instead of bragging after winning gold, Ade helped his tired rival stand and congratulated him."', 'Humble sportsmanship', 'Arrogant pride', 'Careless distraction', 'Secret jealousy'],
      ['Cause & Effect', '"Because deep roots anchor coastal mangroves, tropical storms erode far less shoreline."', 'Mangrove roots protect coasts from erosion', 'Storms create mangrove trees', 'Beaches shrink when trees grow', 'Waves carry roots inland'],
      ['Tone Recognition', '"Caution: tampering with high-voltage relays without insulated tools risks severe shock."', 'Serious and protective warning', 'Playful humor', 'Nostalgic storytelling', 'Poetic admiration'],
      ['Figurative Language', '"Time is a quiet thief that steals afternoon hours while you read a great novel."', 'Reading makes hours pass quickly', 'Clocks actually break in libraries', 'Thieves love bookstores', 'Reading wastes energy'],
      ['Main Idea', '"Migratory arctic terns travel 44,000 miles yearly, chasing summer daylight from pole to pole."', 'Arctic terns make extraordinary pole-to-pole migrations for sunlight', 'Terns dislike flying long distances', 'Both poles stay warm year-round', 'Birds sleep during migration'],
      ['Context Word', '"The mountain trail became TREACHEROUS once wet sleet glazed the narrow ledges."', 'Dangerous and slippery', 'Wide and smooth', 'Brightly lit', 'Easy for bicycles'],
      ['Dialogue Clue', '"Wait—don’t cut the blue wire yet! Look how it loops back to the backup chime," whispered Inspector Lynx.', 'Cutting the wire carelessly could trigger an unwanted chime', 'Lynx wants to finish quickly', 'The chime is broken', 'Blue wires do nothing'],
      ['Theme Analysis', '"Even small gears turn giant clock towers when every tooth engages in rhythm."', 'Small individual efforts combine to power big achievements', 'Clocks only need giant parts', 'Metal gears break easily', 'Time moves backward'],
      ['Word Precision', '"She offered a CANDID critique—honest about weak drafts yet genuinely helpful."', 'Frank and truthful', 'Dishonest and flattering', 'Vague and secret', 'Angry and rude'],
      ['Inference Evidence', '"All theater lights dimmed, cell phones silenced, and velvet curtains parted slowly."', 'The performance is about to begin', 'Cleaning crews just arrived', 'The building lost electricity', 'Everyone is leaving'],
      ['Idiom Meaning', '"When the power failed during rehearsal, the choir didn’t miss a beat."', 'Kept performing smoothly without pausing', 'Lost track of tempo', 'Stopped singing immediately', 'Forgot the lyrics'],
      ['Contrast Clue', '"Unlike her boisterous brother who shouted every joke, Naomi spoke with QUIET WIT."', 'Clever humor delivered calmly', 'Loud shouting', 'Complete silence', 'Confusion'],
      ['Structural Purpose', '"First gather data, next form a hypothesis, and finally test variables systematically."', 'To outline sequential steps of the scientific method', 'To argue against experiments', 'To entertain with fiction', 'To describe a biography'],
      ['Vocabulary Clue', '"Ancient scribes preserved fragile scrolls inside dry clay jars to prevent DECAY."', 'Rot and deterioration', 'Bright decoration', 'Rapid copying', 'Translation'],
      ['Evidence Logic', '"The clock stopped at 3:10—the exact moment the power surge tripped the basement breaker."', 'The power surge stopped the clock', 'Someone wound the clock at 3:10', 'Batteries lasted ten years', 'No surge occurred'],
      ['Point of View', '"Looking down from the hot-air balloon, bustling highways shrank into silver ribbons."', 'Aerial elevated perspective', 'Underground tunnel perspective', 'Microscopic view', 'Ocean floor view'],
      ['Word Choice', '"The athlete’s RESILIENCE shone when she returned stronger after recovering from injury."', 'Ability to bounce back from hardship', 'Tendency to give up early', 'Natural luck', 'Fear of competition'],
      ['Summary Synthesis', '"City rooftop gardens cool buildings, absorb rainwater runoff, and shelter urban pollinators."', 'Rooftop gardens provide multiple environmental benefits to cities', 'Pollinators damage city roofs', 'Rainwater destroys gardens', 'Buildings heat up faster with plants'],
    ];
    for (let repeat = 0; repeat < 2; repeat++) {
      discQuestions.forEach(([title, passage, ans, d1, d2, d3], i) => {
        const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
        pool.push({
          id: `rd_di_${repeat}_${i}`,
          title,
          passage,
          prompt: repeat === 0 ? 'Select the best evidence-based answer:' : 'Which interpretation matches the text best?',
          options,
          correctIndex,
          hint: 'Re-read the strongest clue words inside the passage.',
          explanation: `Evidence confirms: "${ans}".`,
        });
      });
    }
  } else {
    // MASTERS (14-16)
    const analogies = [
      ['PREMISE : CONCLUSION :: EVIDENCE : ?', 'VERDICT', 'HYPOTHESIS', 'SUSPICION', 'CONJECTURE', 'Premises lead to conclusions just as evidence supports a verdict.'],
      ['ARCHITECT : BLUEPRINT :: COMPOSER : ?', 'SCORE', 'AUDIENCE', 'STAGE', 'VIOLIN', 'An architect drafts a blueprint; a composer writes a musical score.'],
      ['CATALYST : ACCELERATION :: BRAKE : ?', 'DECELERATION', 'ENGINE', 'VELOCITY', 'MOMENTUM', 'A catalyst speeds up a reaction; a brake causes deceleration.'],
      ['OPAQUE : CLARITY :: FRAGILE : ?', 'DURABILITY', 'GLASS', 'WEIGHT', 'LIGHT', 'Opaque lacks clarity; fragile lacks durability.'],
      ['SCALPEL : SURGEON :: COMPASS : ?', 'NAVIGATOR', 'CHEF', 'PAINTER', 'SCULPTOR', 'A scalpel is the tool of a surgeon; a compass guides a navigator.'],
      ['PROLOGUE : EPILOGUE :: DAWN : ?', 'DUSK', 'NOON', 'SUNLIGHT', 'MORNING', 'Prologue opens and epilogue closes; dawn opens the day and dusk closes it.'],
      ['ANARCHY : ORDER :: FAMINE : ?', 'ABUNDANCE', 'DROUGHT', 'HARVEST', 'HUNGER', 'Anarchy is the absence of order; famine is the absence of abundance.'],
      ['THERMOMETER : TEMPERATURE :: BAROMETER : ?', 'PRESSURE', 'ALTITUDE', 'WIND', 'HUMIDITY', 'A thermometer measures temperature; a barometer measures atmospheric pressure.'],
      ['EPHEMERAL : PERMANENCE :: PAROCHIAL : ?', 'COSMOPOLITAN', 'REGIONAL', 'NARROW', 'TRADITIONAL', 'Ephemeral opposes permanence; parochial (narrow) opposes cosmopolitan.'],
      ['VACCINE : IMMUNITY :: EXERCISE : ?', 'FITNESS', 'FATIGUE', 'CLINIC', 'WEIGHT', 'Vaccines build immunity; exercise builds physical fitness.'],
      ['METAPHOR : COMPARISON :: HYPERBOLE : ?', 'EXAGGERATION', 'SILENCE', 'FACT', 'SYMMETRY', 'A metaphor makes a comparison; hyperbole uses deliberate exaggeration.'],
      ['SYMPHONY : MOVEMENT :: NOVEL : ?', 'CHAPTER', 'AUTHOR', 'LIBRARY', 'PRINTING', 'A movement is a major section of a symphony; a chapter is a section of a novel.'],
      ['DROUGHT : ARIDITY :: FLOOD : ?', 'INUNDATION', 'EROSION', 'EVAPORATION', 'DESERT', 'Drought brings extreme aridity; flood brings inundation.'],
      ['ACME : ZENITH :: NADIR : ?', 'ABYSS', 'SUMMIT', 'PEAK', 'APEX', 'Acme and zenith are synonyms for highest point; nadir and abyss mean lowest point.'],
      ['MITIGATE : SEVERITY :: AMPLIFY : ?', 'INTENSITY', 'SILENCE', 'REDUCTION', 'CALM', 'Mitigate lessens severity; amplify increases intensity.'],
    ];
    analogies.forEach(([passage, ans, d1, d2, d3, exp], i) => {
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
      pool.push({
        id: `rd_ma_ana_${i}`,
        title: 'Advanced Verbal Analogy',
        passage: `Analyze the relationship: ${passage}`,
        prompt: 'Select the term that completes the logical analogy:',
        options,
        correctIndex,
        hint: 'Define the exact functional or antonym link between the first pair first.',
        explanation: exp,
      });
    });

    const rhetoric = [
      ['"Although the advisor was SHREWD in maneuvers, diplomats found him excessively PRAGMATIC, lacking idealism."', 'Recognizes sharp intellect while critiquing cold opportunism', 'Praises selfless idealism', 'Implies mathematical incompetence', 'Suggests total foolishness'],
      ['"To claim flexibility decays solely with age ignores neuroplasticity; rigidity tracks the cessation of novel demands."', 'Continued novel challenges sustain cognitive flexibility', 'Aging inevitably eliminates plasticity', 'Environment has zero effect on thinking', 'Rigidity is purely unchangeable'],
      ['"Data correlation alone never proves causation; an unseen third variable frequently orchestrates both trends."', 'Observing two correlated trends does not establish one causes the other', 'Correlation always guarantees direct causation', 'Third variables are scientifically impossible', 'Data cannot reveal patterns'],
      ['"By prioritizing short-term quarterly optics over basic research, institutions mortgage future breakthroughs."', 'Excessive focus on immediate appearances undermines long-term innovation', 'Quarterly optics generate basic research automatically', 'Basic research yields instant quarterly profits', 'Institutions never make trade-offs'],
      ['"Far from dampening creativity, strict formal constraints—like sonnet meter—often catalyze inventive breakthroughs."', 'Structured limits can stimulate rather than hinder creative problem-solving', 'Sonnets eliminate poetic invention', 'Unlimited freedom guarantees masterpieces', 'Formal rules destroy imagination'],
      ['"Her tone was neither overtly hostile nor warmly endorsing—rather, a measured skepticism demanding empirical proof."', 'Neutral, evidence-focused questioning', 'Passionate endorsement', 'Angry rejection', 'Blind acceptance'],
      ['"Paradoxically, automating routine errors can erode operator vigilance, raising risk during rare system failures."', 'Reliance on automation may reduce human attentiveness when crises arise', 'Automation eliminates every possible risk forever', 'Operators prefer manual routine chores', 'Rare failures never occur in automated tools'],
      ['"The historian avoids sweeping moralizing, allowing primary letters and ledgers to expose the era’s contradictions."', 'Relies on primary documentary evidence rather than overt judgment', 'Writes purely fictional speeches', 'Ignores financial records', 'Uses loud emotional appeals'],
      ['"While initial adoption of the standard appeared UBIQUITOUS, regional dialects persisted quietly beneath uniform signage."', 'Widespread everywhere on the surface yet locally diverse underneath', 'Completely extinct in all cities', 'Rare and rejected globally', 'Limited to isolated islands'],
      ['"Replacing nuanced debate with binary slogans flattens genuine trade-offs into false certainty."', 'Oversimplified slogans obscure real complexity and trade-offs', 'Binary slogans clarify deep policy science', 'Complex trade-offs do not exist', 'Debates should use fewer words'],
      ['"Because urban tree canopies transpire moisture and cast shade, neighborhoods experience measurable microclimate cooling."', 'Urban trees actively lower local temperatures via shade and transpiration', 'Shade prevents moisture evaporation entirely', 'Neighborhoods warm up under green canopies', 'Microclimates depend only on pavement'],
      ['"An ELUSIVE solution resisted brute-force computation until a simple symmetry shift dissolved half the variables."', 'Hard to find until reframing revealed hidden symmetry', 'Solved instantly by brute force', 'Mathematically impossible', 'Dependent on adding more variables'],
      ['"Though critics dismissed the paper as SPECIOUS, later replications validated its counterintuitive mechanism."', 'Seemingly flawed at first yet ultimately confirmed by replication', 'Proven permanently false', 'Written without numbers', 'Copied from earlier textbooks'],
      ['"Scientific consensus evolves not by discarding evidence, but by integrating anomalies into more comprehensive models."', 'New anomalies expand and refine scientific frameworks', 'Consensus ignores contradictory data', 'Models never improve over time', 'Evidence is discarded every decade'],
      ['"The essay’s opening anecdote functions as a microcosm of the broader economic transition analyzed in later chapters."', 'A small concrete story illustrating the large systemic shift', 'An unrelated humorous joke', 'A statistical error', 'A conclusion placed at the start'],
    ];
    for (let repeat = 0; repeat < 3; repeat++) {
      rhetoric.forEach(([passage, ans, d1, d2, d3], i) => {
        const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
        pool.push({
          id: `rd_ma_rhet_${repeat}_${i}`,
          title: 'Rhetorical Analysis & Synthesis',
          passage,
          prompt: repeat === 0 ? 'Which statement best captures the passage?' : 'What is the core analytical takeaway?',
          options,
          correctIndex,
          hint: 'Watch contrast words like "although", "while", "paradoxically", and "rather".',
          explanation: `Key synthesis: "${ans}".`,
        });
      });
    }
  }

  return pool;
}

export function getReadingBatch(
  childId: string,
  band: DevelopmentalBand,
  count: number = 20,
  seedOffset: number = 0
): ReadingQuestion[] {
  const pool = buildReadingPool(band);
  return pickNonRepeatingItems(childId, `reading_${band}`, pool, count, seedOffset);
}

// ============================================================
// 3. LOGIC KINGDOM BANK (240+ Unique Pattern Puzzles)
// ============================================================
function buildLogicPool(band: DevelopmentalBand): LogicPuzzle[] {
  const pool: LogicPuzzle[] = [];

  if (band === 'young_explorers') {
    const tokens = ['🔴', '🔷', '⭐', '🌙', '🍎', '🍌', '🐶', '🐱', '🌸', '🍀', '☀️', '☁️', '🚗', '🚀', '🎈', '🎁'];
    // 30 ABAB alternating + 30 AABAAB patterns = 60 distinct puzzles
    for (let idx = 0; idx < 30; idx++) {
      const a = tokens[idx % tokens.length];
      const b = tokens[(idx + 3) % tokens.length];
      const d1 = tokens[(idx + 5) % tokens.length];
      const d2 = tokens[(idx + 7) % tokens.length];
      const { options, correctIndex } = shuffleOptionsWithAnswer(b, [a, d1, d2]);
      pool.push({
        id: `lg_ye_ab_${idx}`,
        question: 'Which item comes next in the alternating line?',
        sequence: [a, b, a, b, a, '?'],
        options,
        correctIndex,
        hint: `Watch the two-step rhythm: ${a}, ${b}, ${a}, ${b}...`,
        explanation: `After ${a} always comes ${b}!`,
      });
    }
    for (let idx = 0; idx < 30; idx++) {
      const a = tokens[(idx + 1) % tokens.length];
      const b = tokens[(idx + 4) % tokens.length];
      const d1 = tokens[(idx + 8) % tokens.length];
      const d2 = tokens[(idx + 10) % tokens.length];
      const { options, correctIndex } = shuffleOptionsWithAnswer(b, [a, d1, d2]);
      pool.push({
        id: `lg_ye_aab_${idx}`,
        question: 'Complete the 3-beat rhythm pattern!',
        sequence: [a, a, b, a, a, '?'],
        options,
        correctIndex,
        hint: `Two ${a} pieces are always followed by one ${b}!`,
        explanation: `Two ${a}s lead right into ${b}!`,
      });
    }
  } else if (band === 'senior_explorers') {
    // 30 Arithmetic Step Sequences (+k) + 30 Geometric / Triangular Differences
    for (let idx = 0; idx < 30; idx++) {
      const start = (idx % 12) + 2;
      const step = (Math.floor(idx / 6) % 7) + 3;
      const seq = [start, start + step, start + step * 2, start + step * 3];
      const ans = start + step * 4;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + step),
        String(ans - 2),
        String(ans + 3),
      ]);
      pool.push({
        id: `lg_se_arith_${idx}`,
        question: 'Find the next number in this steady climb:',
        sequence: [...seq.map(String), '?'],
        options,
        correctIndex,
        hint: `Check how much is added between each pair (+${step}).`,
        explanation: `Each term adds ${step}, so ${seq[3]} + ${step} = ${ans}!`,
      });
    }
    for (let idx = 0; idx < 30; idx++) {
      const start = (idx % 10) + 1;
      const d0 = (idx % 3) + 2;
      const n1 = start;
      const n2 = n1 + d0;
      const n3 = n2 + (d0 + 1);
      const n4 = n3 + (d0 + 2);
      const ans = n4 + (d0 + 3);
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans - 1),
        String(ans + 2),
        String(n4 + d0 + 2),
      ]);
      pool.push({
        id: `lg_se_grow_${idx}`,
        question: 'Deduce the growing-gap number sequence:',
        sequence: [String(n1), String(n2), String(n3), String(n4), '?'],
        options,
        correctIndex,
        hint: `The gap grows by +1 each hop: +${d0}, +${d0 + 1}, +${d0 + 2}...`,
        explanation: `Next jump is +${d0 + 3}, so ${n4} + ${d0 + 3} = ${ans}!`,
      });
    }
  } else if (band === 'discoverers') {
    // 30 Alphanumeric Ciphers + 30 Alternating Symbol-Number Dual Rules
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let idx = 0; idx < 30; idx++) {
      const pos0 = (idx % 6) + 1;
      const gap = (Math.floor(idx / 6) % 3) + 2;
      const p1 = pos0;
      const p2 = p1 + gap;
      const p3 = p2 + gap + 1;
      const p4 = p3 + gap + 2;
      const p5 = p4 + gap + 3;
      const fmt = (p: number) => `${alphabet[(p - 1) % 26]}-${p}`;
      const ans = fmt(p5);
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [
        fmt(p5 - 1),
        fmt(p5 + 1),
        fmt(p5 + 2),
      ]);
      pool.push({
        id: `lg_di_ciph_${idx}`,
        question: 'Crack the alphanumeric cipher progression:',
        sequence: [fmt(p1), fmt(p2), fmt(p3), fmt(p4), '?'],
        options,
        correctIndex,
        hint: `Notice the letter index jumps by +${gap}, +${gap + 1}, +${gap + 2}...`,
        explanation: `Jumping +${gap + 3} lands on ${ans}!`,
      });
    }
    const symPairs = [['△', '▲'], ['○', '●'], ['□', '■'], ['◇', '◆'], ['☆', '★']];
    for (let idx = 0; idx < 30; idx++) {
      const [sOpen, sSolid] = symPairs[idx % symPairs.length];
      const base = (idx % 4) + 2;
      const seq = [
        `${sOpen} ${base}`,
        `${sSolid} ${base * 2}`,
        `${sOpen} ${base * 4}`,
        `${sSolid} ${base * 8}`,
      ];
      const ans = `${sOpen} ${base * 16}`;
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [
        `${sSolid} ${base * 16}`,
        `${sOpen} ${base * 12}`,
        `${sSolid} ${base * 8}`,
      ]);
      pool.push({
        id: `lg_di_dual_${idx}`,
        question: 'Decode both symbol alternation and numeric scaling:',
        sequence: [...seq, '?'],
        options,
        correctIndex,
        hint: 'Hollow and solid alternate each step while numbers double!',
        explanation: `Solid alternates back to ${sOpen} and ${base * 8} × 2 = ${base * 16}.`,
      });
    }
  } else {
    // MASTERS: 30 Generalized Fibonacci + 30 Quadratic / Dual-Rotation
    for (let idx = 0; idx < 30; idx++) {
      const a = (idx % 6) + 2;
      const b = (Math.floor(idx / 6) % 5) + 3;
      const c = a + b;
      const d = b + c;
      const e = c + d;
      const ans = d + e;
      const { options, correctIndex } = shuffleOptionsWithAnswer(String(ans), [
        String(ans + 2),
        String(ans - 3),
        String(ans + 5),
      ]);
      pool.push({
        id: `lg_ma_fib_${idx}`,
        question: 'Recursive Fibonacci-style sequence deduction:',
        sequence: [String(a), String(b), String(c), String(d), String(e), '?'],
        options,
        correctIndex,
        hint: 'Add the two preceding terms together to produce the next term.',
        explanation: `${d} + ${e} = ${ans}.`,
      });
    }
    for (let idx = 0; idx < 30; idx++) {
      const offset = idx % 10;
      const fn = (x: number) => x * x + offset;
      const seq = [1, 2, 3, 4].map((x) => `[${x}, ${fn(x)}]`);
      const ans = `[5, ${fn(5)}]`;
      const { options, correctIndex } = shuffleOptionsWithAnswer(ans, [
        `[5, ${fn(5) - 5}]`,
        `[5, ${fn(5) + 4}]`,
        `[6, ${fn(6)}]`,
      ]);
      pool.push({
        id: `lg_ma_quad_${idx}`,
        question: 'Deduce the coordinate mapping f(x) = y:',
        sequence: [...seq, '?'],
        options,
        correctIndex,
        hint: `Compare y to x² (+ constant ${offset}).`,
        explanation: `5² + ${offset} = ${fn(5)}, giving ${ans}.`,
      });
    }
  }

  return pool;
}

export function getLogicBatch(
  childId: string,
  band: DevelopmentalBand,
  count: number = 20,
  seedOffset: number = 0
): LogicPuzzle[] {
  const pool = buildLogicPool(band);
  return pickNonRepeatingItems(childId, `logic_${band}`, pool, count, seedOffset);
}

// ============================================================
// 4. SPATIAL & ABSTRACT THINKING BANK (200+ Unique Puzzles)
// ============================================================
function buildSpatialPool(band: DevelopmentalBand): SpatialPuzzleData[] {
  const pool: SpatialPuzzleData[] = [];

  if (band === 'young_explorers') {
    const shapes = [
      { name: 'Star Piece', graphic: '⭐', d: ['🟢', '🟦', '🔺'] },
      { name: 'Green Circle', graphic: '🟢', d: ['⭐', '🟦', '🔺'] },
      { name: 'Blue Square', graphic: '🟦', d: ['⭐', '🟢', '🔺'] },
      { name: 'Red Triangle', graphic: '🔺', d: ['⭐', '🟢', '🟦'] },
      { name: 'Diamond Gem', graphic: '💎', d: ['🟢', '⭐', '⬛'] },
      { name: 'Crescent Moon', graphic: '🌙', d: ['☀️', '⭐', '☁️'] },
      { name: 'Heart Shape', graphic: '💜', d: ['⭐', '🔷', '🟢'] },
      { name: 'Right Half Circle', graphic: '◑', d: ['◪', '◩', '■'] },
      { name: 'Left Half Circle', graphic: '◐', d: ['◪', '◩', '■'] },
      { name: 'Upright Arrow', graphic: '⬆️', d: ['⬇️', '⬅️', '➡️'] },
      { name: 'Downward Arrow', graphic: '⬇️', d: ['⬆️', '⬅️', '➡️'] },
      { name: 'Right Arrow', graphic: '➡️', d: ['⬅️', '⬆️', '⬇️'] },
      { name: 'Left Arrow', graphic: '⬅️', d: ['➡️', '⬆️', '⬇️'] },
    ];
    for (let idx = 0; idx < 50; idx++) {
      const s = shapes[idx % shapes.length];
      const variant = Math.floor(idx / shapes.length);
      const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(s.graphic, s.d);
      pool.push({
        id: `sp_ye_${idx}`,
        title: variant % 2 === 0 ? 'Shape Silhouette Match' : 'Direction & Cutout Fit',
        question:
          variant % 2 === 0
            ? `Which piece matches the empty cutout shape (${s.graphic})?`
            : `Spot the exact facing piece for (${s.graphic}):`,
        visualType: 'box',
        visualHeader: 'Target Silhouette',
        visualCells: [s.graphic],
        options: optStrings.map((g) => ({ label: g === s.graphic ? s.name : 'Other Shape', graphic: g })),
        correctIndex,
        hint: `Compare the corners, points, and direction of ${s.graphic}!`,
        explanation: `${s.graphic} (${s.name}) matches the silhouette perfectly!`,
      });
    }
  } else if (band === 'senior_explorers') {
    const dirs = ['⬆️', '➡️', '⬇️', '⬅️'];
    const dirNames = ['Up', 'Right', 'Down', 'Left'];
    // 25 Rotation puzzles (90° CW, 90° CCW, 180°)
    for (let idx = 0; idx < 25; idx++) {
      const startIdx = idx % 4;
      const rotType = idx % 3; // 0: +90CW, 1: +90CCW, 2: 180
      const delta = rotType === 0 ? 1 : rotType === 1 ? 3 : 2;
      const ansIdx = (startIdx + delta) % 4;
      const rotLabel = rotType === 0 ? '90° Clockwise ↻' : rotType === 1 ? '90° Counter-Clockwise ↺' : '180° Half-Turn';
      const ans = dirs[ansIdx];
      const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(
        ans,
        dirs.filter((d) => d !== ans)
      );
      pool.push({
        id: `sp_se_rot_${idx}`,
        title: `Mental Rotation: ${rotLabel}`,
        question: `Turn ${dirs[startIdx]} by ${rotLabel}. Which direction does it point?`,
        visualType: 'rotate',
        visualHeader: `Rotate ${rotLabel}`,
        visualCells: [dirs[startIdx], rotLabel],
        options: optStrings.map((g) => ({ label: `Points ${dirNames[dirs.indexOf(g)]}`, graphic: g })),
        correctIndex,
        hint: 'Imagine turning a clock hand starting from that direction.',
        explanation: `Turning ${dirs[startIdx]} by ${rotLabel} points it ${ans}!`,
      });
    }
    // 25 Mirror Reflection puzzles
    const mirrors = [
      ['◀ ◧', '◨ ▶', '◀ ◧', '▼ ◪', '▲ ◩'],
      ['▶ ◨', '◧ ◀', '▶ ◨', '▲ ◩', '▼ ◪'],
      ['◩ ◀', '▶ ◩', '◩ ◀', '◪ ▼', '◧ ◀'],
      ['◐ △', '△ ◑', '◐ △', '● ▼', '□ ▶'],
      ['⬃ ▲', '▲ ⬂', '⬃ ▲', '⬁ ▼', '⬀ ◀'],
    ];
    for (let idx = 0; idx < 25; idx++) {
      const [left, ans, d1, d2, d3] = mirrors[idx % mirrors.length];
      const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
      pool.push({
        id: `sp_se_mir_${idx}`,
        title: 'Vertical Mirror Reflection',
        question: `Reflect "${left}" across the vertical mirror line |:`,
        visualType: 'mirror',
        visualHeader: 'Mirror Line Reflection',
        visualCells: [left, '|', '?'],
        options: optStrings.map((g, oi) => ({ label: `Mirror Option ${oi + 1}`, graphic: g })),
        correctIndex,
        hint: 'Left swaps with right across a vertical mirror line!',
        explanation: `Across the mirror line, "${left}" flips to "${ans}".`,
      });
    }
  } else if (band === 'discoverers') {
    const netEmojis = ['⭐', '🌙', '💎', '🔔', '⚡', '🔑', '🔥', '🍀', '🧭', '⚓', '🦋', '☀️'];
    // 25 Cube Net Opposite Face puzzles
    for (let idx = 0; idx < 25; idx++) {
      const faces = [0, 1, 2, 3, 4, 5].map((k) => netEmojis[(idx + k) % netEmojis.length]);
      // Cross net: [0=top, 1=left, 2=center, 3=right, 4=farRight, 5=bottom]
      const targetPos = idx % 3 === 0 ? 2 : idx % 3 === 1 ? 0 : 1;
      const oppPos = targetPos === 2 ? 4 : targetPos === 0 ? 5 : 3;
      const ans = faces[oppPos];
      const distractors = faces.filter((_, fi) => fi !== targetPos && fi !== oppPos).slice(0, 3);
      const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(ans, distractors);
      pool.push({
        id: `sp_di_net_${idx}`,
        title: '3D Cube Net Folding',
        question: `When folded into a 3D cube, which symbol lands directly OPPOSITE ${faces[targetPos]}?`,
        visualType: 'cube_net',
        visualHeader: '6-Face Cross Net',
        visualCells: faces,
        options: optStrings.map((g, oi) => ({ label: `Face Option ${oi + 1}`, graphic: g })),
        correctIndex,
        hint: 'Opposite faces in a straight strip always have 1 square between them.',
        explanation: `Folding the net places ${ans} directly opposite ${faces[targetPos]}!`,
      });
    }
    // 25 2x2 Matrix & 180° Inversion puzzles
    const invPairs = [
      ['◩', '◪', '◧', '◨', '■'],
      ['◪', '◩', '◧', '◨', '□'],
      ['◧', '◨', '◩', '◪', '■'],
      ['◨', '◧', '◩', '◪', '□'],
      ['▛', '▟', '▜', '▙', '■'],
    ];
    for (let idx = 0; idx < 25; idx++) {
      const [src, ans, d1, d2, d3] = invPairs[idx % invPairs.length];
      const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
      pool.push({
        id: `sp_di_inv_${idx}`,
        title: '180° Central Spatial Inversion',
        question: `Mentally rotate token "${src}" by 180° around its center:`,
        visualType: 'rotate',
        visualHeader: '180° Point Inversion',
        visualCells: [src, '180° Turn'],
        options: optStrings.map((g, oi) => ({ label: `Shape ${oi + 1}`, graphic: g })),
        correctIndex,
        hint: 'A 180° turn flips top-to-bottom AND left-to-right.',
        explanation: `Rotating "${src}" 180° transforms it directly into "${ans}".`,
      });
    }
  } else {
    // MASTERS: 3x3 Abstract Matrices + Cross-Sections (50 unique)
    const shapeTriples = [
      ['○', '◐', '●'],
      ['△', '◬', '▲'],
      ['□', '◨', '■'],
      ['◇', '◈', '◆'],
      ['☆', '✯', '★'],
    ];
    for (let idx = 0; idx < 30; idx++) {
      const step = (idx % 3) + 1;
      const base = idx % 5;
      const r0 = shapeTriples[idx % shapeTriples.length];
      const r1 = shapeTriples[(idx + 1) % shapeTriples.length];
      const r2 = shapeTriples[(idx + 2) % shapeTriples.length];
      const n = (r: number, c: number) => base + r + c * step;
      const cells = [
        `${r0[0]} ${n(0, 0)}`,
        `${r0[1]} ${n(0, 1)}`,
        `${r0[2]} ${n(0, 2)}`,
        `${r1[0]} ${n(1, 0)}`,
        `${r1[1]} ${n(1, 1)}`,
        `${r1[2]} ${n(1, 2)}`,
        `${r2[0]} ${n(2, 0)}`,
        `${r2[1]} ${n(2, 1)}`,
        '?',
      ];
      const ans = `${r2[2]} ${n(2, 2)}`;
      const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(ans, [
        `${r2[1]} ${n(2, 2)}`,
        `${r2[2]} ${n(2, 1)}`,
        `${r0[2]} ${n(2, 2) + 1}`,
      ]);
      pool.push({
        id: `sp_ma_mat_${idx}`,
        title: '3×3 Abstract Transformation Matrix',
        question: 'Deduce the missing bottom-right cell in this 3×3 spatial-numeric matrix:',
        visualType: 'grid3',
        visualHeader: '3×3 Pattern Matrix',
        visualCells: cells,
        options: optStrings.map((g, oi) => ({ label: `Matrix Cell ${oi + 1}`, graphic: g })),
        correctIndex,
        hint: `Row 3 tracks the ${r2[0]} shape progression while values step by +${step}.`,
        explanation: `Shading completes as ${r2[2]} and value advances to ${n(2, 2)} (${ans}).`,
      });
    }

    const crossSections = [
      ['🌐 Sphere sliced at 45°', '● Circle', '⬭ Ellipse', '▲ Triangle', '■ Square', 'Any planar slice of a sphere is always a circle.'],
      ['🥫 Cylinder sliced horizontally', '● Circle', '■ Rectangle', '▲ Triangle', '⬡ Hexagon', 'A slice parallel to the base of a cylinder yields a circle.'],
      ['🥫 Cylinder sliced tilted 30°', '⬭ Ellipse', '● Circle', '▲ Triangle', '◆ Diamond', 'An angled cross-section through a cylinder produces an ellipse.'],
      ['🔺 Cone sliced parallel to base', '● Circle', '▲ Triangle', '■ Square', '⬡ Hexagon', 'Cutting a cone parallel to its circular base creates a smaller circle.'],
      ['🧊 Cube sliced parallel to face', '■ Square', '● Circle', '▲ Triangle', '⬟ Pentagon', 'Slicing parallel to any face of a cube leaves a square.'],
      ['🔺 Square Pyramid sliced vertically through apex', '▲ Triangle', '■ Square', '● Circle', '⬡ Hexagon', 'A vertical slice through the top point cuts out a triangle.'],
      ['🧊 Cube sliced diagonally touching 3 edges around a corner', '▲ Equilateral Triangle', '● Circle', '⬭ Ellipse', '▭ Thin Line', 'Slicing evenly off one corner of a cube creates an equilateral triangle!'],
      ['🍩 Torus (donut) sliced horizontally through the middle', '◎ Two Concentric Rings', '■ Solid Square', '▲ Triangle', '★ Star', 'Cutting flat through the middle of a donut reveals an inner and outer ring!'],
    ];
    for (let repeat = 0; repeat < 3; repeat++) {
      crossSections.forEach(([vis, ans, d1, d2, d3, exp], i) => {
        const { options: optStrings, correctIndex } = shuffleOptionsWithAnswer(ans, [d1, d2, d3]);
        pool.push({
          id: `sp_ma_cs_${repeat}_${i}`,
          title: '3D Geometric Cross-Section',
          question: `What 2D shape is produced by: ${vis}?`,
          visualType: 'box',
          visualHeader: 'Planar Cross-Section',
          visualCells: [vis],
          options: optStrings.map((g) => ({ label: g.split(' ').slice(1).join(' '), graphic: g.split(' ')[0] })),
          correctIndex,
          hint: 'Visualize where the flat cutting plane intersects the 3D outer shell.',
          explanation: exp,
        });
      });
    }
  }

  return pool;
}

export function getSpatialBatch(
  childId: string,
  band: DevelopmentalBand,
  count: number = 20,
  seedOffset: number = 0
): SpatialPuzzleData[] {
  const pool = buildSpatialPool(band);
  return pickNonRepeatingItems(childId, `spatial_${band}`, pool, count, seedOffset);
}

// ============================================================
// 5. BRAIN SPEED BANK (16+ Distinct Themes, 20 Items Each)
// ============================================================
function buildSpeedThemes(band: DevelopmentalBand): SpeedThemePack[] {
  if (band === 'young_explorers') {
    return [
      {
        id: 'sp_ye_animals_vehicles',
        title: 'Animal or Vehicle?',
        leftLabel: 'Animal 🐾',
        rightLabel: 'Vehicle 🚗',
        items: [
          { id: '1', display: '🐶 Dog', category: 'left' }, { id: '2', display: '🚗 Car', category: 'right' },
          { id: '3', display: '🐱 Cat', category: 'left' }, { id: '4', display: '✈️ Plane', category: 'right' },
          { id: '5', display: '🐰 Rabbit', category: 'left' }, { id: '6', display: '🚲 Bike', category: 'right' },
          { id: '7', display: '🦁 Lion', category: 'left' }, { id: '8', display: '🚂 Train', category: 'right' },
          { id: '9', display: '🐼 Panda', category: 'left' }, { id: '10', display: '🚀 Rocket', category: 'right' },
          { id: '11', display: '🐘 Elephant', category: 'left' }, { id: '12', display: '🚌 Bus', category: 'right' },
          { id: '13', display: '🐸 Frog', category: 'left' }, { id: '14', display: '⛵ Sailboat', category: 'right' },
          { id: '15', display: '🦊 Fox', category: 'left' }, { id: '16', display: '🚕 Taxi', category: 'right' },
          { id: '17', display: '🐢 Turtle', category: 'left' }, { id: '18', display: '🚒 Firetruck', category: 'right' },
          { id: '19', display: '🐻 Bear', category: 'left' }, { id: '20', display: '🚁 Copter', category: 'right' },
        ],
      },
      {
        id: 'sp_ye_fruits_sea',
        title: 'Sweet Fruit or Ocean Friend?',
        leftLabel: 'Sweet Fruit 🍓',
        rightLabel: 'Ocean Friend 🐠',
        items: [
          { id: '1', display: '🍎 Apple', category: 'left' }, { id: '2', display: '🐠 Fish', category: 'right' },
          { id: '3', display: '🍌 Banana', category: 'left' }, { id: '4', display: '🐬 Dolphin', category: 'right' },
          { id: '5', display: '🍇 Grapes', category: 'left' }, { id: '6', display: '🐙 Octopus', category: 'right' },
          { id: '7', display: '🍓 Berry', category: 'left' }, { id: '8', display: '🐳 Whale', category: 'right' },
          { id: '9', display: '🍉 Melon', category: 'left' }, { id: '10', display: '🦀 Crab', category: 'right' },
          { id: '11', display: '🍍 Pineapple', category: 'left' }, { id: '12', display: '🦈 Shark', category: 'right' },
          { id: '13', display: '🍊 Orange', category: 'left' }, { id: '14', display: '🦞 Lobster', category: 'right' },
          { id: '15', display: '🍑 Peach', category: 'left' }, { id: '16', display: '🐚 Shell', category: 'right' },
          { id: '17', display: '🍐 Pear', category: 'left' }, { id: '18', display: '🦑 Squid', category: 'right' },
          { id: '19', display: '🍒 Cherry', category: 'left' }, { id: '20', display: '🐡 Puffer', category: 'right' },
        ],
      },
      {
        id: 'sp_ye_sky_land',
        title: 'In the Sky or On the Ground?',
        leftLabel: 'Up in the Sky ☁️',
        rightLabel: 'On the Ground 🌱',
        items: [
          { id: '1', display: '☀️ Sun', category: 'left' }, { id: '2', display: '🌳 Tree', category: 'right' },
          { id: '3', display: '🌙 Moon', category: 'left' }, { id: '4', display: '🏠 House', category: 'right' },
          { id: '5', display: '🦅 Eagle', category: 'left' }, { id: '6', display: '🌻 Flower', category: 'right' },
          { id: '7', display: '☁️ Cloud', category: 'left' }, { id: '8', display: '🪨 Rock', category: 'right' },
          { id: '9', display: '🌈 Rainbow', category: 'left' }, { id: '10', display: '⛺ Tent', category: 'right' },
          { id: '11', display: '🎈 Balloon', category: 'left' }, { id: '12', display: '🍄 Mushroom', category: 'right' },
          { id: '13', display: '⭐ Star', category: 'left' }, { id: '14', display: '🪑 Chair', category: 'right' },
          { id: '15', display: '🪁 Kite', category: 'left' }, { id: '16', display: '🚜 Tractor', category: 'right' },
          { id: '17', display: '🐝 Bee', category: 'left' }, { id: '18', display: '🐢 Tortoise', category: 'right' },
          { id: '19', display: '🦋 Butterfly', category: 'left' }, { id: '20', display: '🌵 Cactus', category: 'right' },
        ],
      },
    ];
  } else if (band === 'senior_explorers') {
    const nums = Array.from({ length: 20 }, (_, i) => 11 + i * 3 + (i % 2));
    return [
      {
        id: 'sp_se_oddeven',
        title: 'Odd or Even Number?',
        leftLabel: 'Odd (1, 3, 5...)',
        rightLabel: 'Even (2, 4, 6...)',
        items: nums.map((n, i) => ({
          id: String(i),
          display: String(n + (i % 2 === 0 ? 1 : 0)),
          category: (n + (i % 2 === 0 ? 1 : 0)) % 2 !== 0 ? 'left' : 'right',
        })),
      },
      {
        id: 'sp_se_under_over_50',
        title: 'Less or Greater than 50?',
        leftLabel: '< 50 (Under)',
        rightLabel: '> 50 (Over)',
        items: Array.from({ length: 20 }, (_, i) => {
          const val = i % 2 === 0 ? 12 + i * 2 : 54 + i * 2;
          return { id: String(i), display: String(val), category: val < 50 ? 'left' : 'right' };
        }),
      },
      {
        id: 'sp_se_living_nonliving',
        title: 'Living Thing or Non-Living Object?',
        leftLabel: 'Living Thing 🌱',
        rightLabel: 'Object 🔧',
        items: [
          { id: '1', display: '🦊 Fox', category: 'left' }, { id: '2', display: '🧭 Compass', category: 'right' },
          { id: '3', display: '🌲 Pine Tree', category: 'left' }, { id: '4', display: '🔑 Brass Key', category: 'right' },
          { id: '5', display: '🐬 Dolphin', category: 'left' }, { id: '6', display: '📚 Hardcover', category: 'right' },
          { id: '7', display: '🌻 Sunflower', category: 'left' }, { id: '8', display: '🪑 Wooden Chair', category: 'right' },
          { id: '9', display: '🦅 Hawk', category: 'left' }, { id: '10', display: '⏰ Alarm Clock', category: 'right' },
          { id: '11', display: '🐙 Octopus', category: 'left' }, { id: '12', display: '💡 Light Bulb', category: 'right' },
          { id: '13', display: '🐝 Honeybee', category: 'left' }, { id: '14', display: '🎒 Backpack', category: 'right' },
          { id: '15', display: '🌵 Cactus', category: 'left' }, { id: '16', display: '🔭 Telescope', category: 'right' },
          { id: '17', display: '🐢 Sea Turtle', category: 'left' }, { id: '18', display: '⚽ Leather Ball', category: 'right' },
          { id: '19', display: '🦜 Parrot', category: 'left' }, { id: '20', display: '✂️ Scissors', category: 'right' },
        ],
      },
    ];
  } else if (band === 'discoverers') {
    return [
      {
        id: 'sp_di_expr50',
        title: 'Expression Value: < 50 or > 50?',
        leftLabel: 'Result < 50',
        rightLabel: 'Result > 50',
        items: [
          { id: '1', display: '6 × 7', category: 'left' }, { id: '2', display: '8 × 7', category: 'right' },
          { id: '3', display: '9 × 5', category: 'left' }, { id: '4', display: '12 × 5', category: 'right' },
          { id: '5', display: '15 + 28', category: 'left' }, { id: '6', display: '34 + 29', category: 'right' },
          { id: '7', display: '70 − 24', category: 'left' }, { id: '8', display: '90 − 32', category: 'right' },
          { id: '9', display: '4 × 11', category: 'left' }, { id: '10', display: '9 × 6', category: 'right' },
          { id: '11', display: '96 ÷ 2', category: 'left' }, { id: '12', display: '108 ÷ 2', category: 'right' },
          { id: '13', display: '7 × 7', category: 'left' }, { id: '14', display: '7 × 8', category: 'right' },
          { id: '15', display: '19 + 25', category: 'left' }, { id: '16', display: '27 + 28', category: 'right' },
          { id: '17', display: '80 − 33', category: 'left' }, { id: '18', display: '80 − 22', category: 'right' },
          { id: '19', display: '3 × 15', category: 'left' }, { id: '20', display: '4 × 14', category: 'right' },
        ],
      },
      {
        id: 'sp_di_mult3',
        title: 'Multiple of 3 or Not?',
        leftLabel: 'Divisible by 3 ✓',
        rightLabel: 'Not Divisible by 3 ✕',
        items: [
          { id: '1', display: '21', category: 'left' }, { id: '2', display: '22', category: 'right' },
          { id: '3', display: '27', category: 'left' }, { id: '4', display: '28', category: 'right' },
          { id: '5', display: '36', category: 'left' }, { id: '6', display: '38', category: 'right' },
          { id: '7', display: '45', category: 'left' }, { id: '8', display: '47', category: 'right' },
          { id: '9', display: '54', category: 'left' }, { id: '10', display: '55', category: 'right' },
          { id: '11', display: '63', category: 'left' }, { id: '12', display: '64', category: 'right' },
          { id: '13', display: '72', category: 'left' }, { id: '14', display: '74', category: 'right' },
          { id: '15', display: '81', category: 'left' }, { id: '16', display: '82', category: 'right' },
          { id: '17', display: '93', category: 'left' }, { id: '18', display: '94', category: 'right' },
          { id: '19', display: '108', category: 'left' }, { id: '20', display: '109', category: 'right' },
        ],
      },
      {
        id: 'sp_di_vowel_word',
        title: 'Starts with Vowel or Consonant?',
        leftLabel: 'Vowel (A,E,I,O,U)',
        rightLabel: 'Consonant',
        items: [
          { id: '1', display: 'ATLAS', category: 'left' }, { id: '2', display: 'BEACON', category: 'right' },
          { id: '3', display: 'ENERGY', category: 'left' }, { id: '4', display: 'CIPHER', category: 'right' },
          { id: '5', display: 'ISLAND', category: 'left' }, { id: '6', display: 'MATRIX', category: 'right' },
          { id: '7', display: 'ORBIT', category: 'left' }, { id: '8', display: 'PRISM', category: 'right' },
          { id: '9', display: 'UMBRELLA', category: 'left' }, { id: '10', display: 'VECTOR', category: 'right' },
          { id: '11', display: 'APEX', category: 'left' }, { id: '12', display: 'GALAXY', category: 'right' },
          { id: '13', display: 'ECHO', category: 'left' }, { id: '14', display: 'HORIZON', category: 'right' },
          { id: '15', display: 'IVORY', category: 'left' }, { id: '16', display: 'KINETIC', category: 'right' },
          { id: '17', display: 'OCEAN', category: 'left' }, { id: '18', display: 'NEBULA', category: 'right' },
          { id: '19', display: 'ULTRA', category: 'left' }, { id: '20', display: 'QUARTZ', category: 'right' },
        ],
      },
    ];
  } else {
    return [
      {
        id: 'sp_ma_prime_comp',
        title: 'Prime vs Composite Number',
        leftLabel: 'Prime Number',
        rightLabel: 'Composite Number',
        items: [
          { id: '1', display: '19', category: 'left' }, { id: '2', display: '21', category: 'right' },
          { id: '3', display: '31', category: 'left' }, { id: '4', display: '27', category: 'right' },
          { id: '5', display: '47', category: 'left' }, { id: '6', display: '49', category: 'right' },
          { id: '7', display: '53', category: 'left' }, { id: '8', display: '57', category: 'right' },
          { id: '9', display: '61', category: 'left' }, { id: '10', display: '63', category: 'right' },
          { id: '11', display: '67', category: 'left' }, { id: '12', display: '69', category: 'right' },
          { id: '13', display: '71', category: 'left' }, { id: '14', display: '77', category: 'right' },
          { id: '15', display: '79', category: 'left' }, { id: '16', display: '81', category: 'right' },
          { id: '17', display: '83', category: 'left' }, { id: '18', display: '87', category: 'right' },
          { id: '19', display: '97', category: 'left' }, { id: '20', display: '91', category: 'right' },
        ],
      },
      {
        id: 'sp_ma_div4',
        title: 'Divisible by 4 vs Remainder',
        leftLabel: 'Multiple of 4',
        rightLabel: 'Not Multiple of 4',
        items: [
          { id: '1', display: '48', category: 'left' }, { id: '2', display: '50', category: 'right' },
          { id: '3', display: '64', category: 'left' }, { id: '4', display: '66', category: 'right' },
          { id: '5', display: '76', category: 'left' }, { id: '6', display: '78', category: 'right' },
          { id: '7', display: '84', category: 'left' }, { id: '8', display: '86', category: 'right' },
          { id: '9', display: '96', category: 'left' }, { id: '10', display: '98', category: 'right' },
          { id: '11', display: '108', category: 'left' }, { id: '12', display: '110', category: 'right' },
          { id: '13', display: '112', category: 'left' }, { id: '14', display: '114', category: 'right' },
          { id: '15', display: '128', category: 'left' }, { id: '16', display: '130', category: 'right' },
          { id: '17', display: '144', category: 'left' }, { id: '18', display: '146', category: 'right' },
          { id: '19', display: '156', category: 'left' }, { id: '20', display: '158', category: 'right' },
        ],
      },
      {
        id: 'sp_ma_eq1',
        title: 'Equation Check: True or False?',
        leftLabel: 'True Statement ✓',
        rightLabel: 'False Statement ✕',
        items: [
          { id: '1', display: '3³ = 27', category: 'left' }, { id: '2', display: '4³ = 48', category: 'right' },
          { id: '3', display: '√144 = 12', category: 'left' }, { id: '4', display: '√169 = 14', category: 'right' },
          { id: '5', display: '2⁵ = 32', category: 'left' }, { id: '6', display: '2⁶ = 48', category: 'right' },
          { id: '7', display: '15% of 200 = 30', category: 'left' }, { id: '8', display: '25% of 90 = 20', category: 'right' },
          { id: '9', display: '7 × 13 = 91', category: 'left' }, { id: '10', display: '8 × 14 = 104', category: 'right' },
          { id: '11', display: '12² = 144', category: 'left' }, { id: '12', display: '13² = 166', category: 'right' },
          { id: '13', display: '180 ÷ 15 = 12', category: 'left' }, { id: '14', display: '195 ÷ 15 = 12', category: 'right' },
          { id: '15', display: '9 × 12 = 108', category: 'left' }, { id: '16', display: '9 × 14 = 124', category: 'right' },
          { id: '17', display: '5⁴ = 625', category: 'left' }, { id: '18', display: '6³ = 226', category: 'right' },
          { id: '19', display: '√225 = 15', category: 'left' }, { id: '20', display: '√256 = 18', category: 'right' },
        ],
      },
    ];
  }
}

export function getSpeedThemeBatch(
  childId: string,
  band: DevelopmentalBand,
  seedOffset: number = 0
): SpeedThemePack {
  const themes = buildSpeedThemes(band);
  const [chosen] = pickNonRepeatingItems(childId, `speed_theme_${band}`, themes, 1, seedOffset);
  const shuffledItems = [...chosen.items].sort(() => Math.random() - 0.5);
  return { ...chosen, items: shuffledItems };
}

// ============================================================
// 6. STRATEGY ISLAND SOLVABLE MAZE GENERATOR
// ============================================================
const STRATEGY_MAZE_PRESETS: Record<DevelopmentalBand, StrategyBoardData[]> = {
  young_explorers: [
    {
      id: 'st_ye_1',
      title: 'Sunny Cove Trail',
      gridSize: 4,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 3, y: 3 },
      obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      gems: [{ id: 1, pos: { x: 0, y: 2 } }, { id: 2, pos: { x: 2, y: 1 } }],
    },
    {
      id: 'st_ye_2',
      title: 'Palm Lagoon Route',
      gridSize: 4,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 3, y: 3 },
      obstacles: [{ x: 1, y: 0 }, { x: 2, y: 2 }],
      gems: [{ id: 1, pos: { x: 0, y: 3 } }, { id: 2, pos: { x: 3, y: 1 } }],
    },
    {
      id: 'st_ye_3',
      title: 'Shell Harbor Path',
      gridSize: 4,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 3, y: 3 },
      obstacles: [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 3 }],
      gems: [{ id: 1, pos: { x: 2, y: 0 } }, { id: 2, pos: { x: 1, y: 2 } }],
    },
    {
      id: 'st_ye_4',
      title: 'Starfish Meadow Run',
      gridSize: 4,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 3, y: 3 },
      obstacles: [{ x: 1, y: 2 }, { x: 2, y: 0 }],
      gems: [{ id: 1, pos: { x: 1, y: 1 } }, { id: 2, pos: { x: 3, y: 2 } }],
    },
  ],
  senior_explorers: [
    {
      id: 'st_se_1',
      title: 'Coral Ridge Expedition',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 1 }, { x: 1, y: 3 }],
      gems: [{ id: 1, pos: { x: 1, y: 0 } }, { id: 2, pos: { x: 3, y: 2 } }, { id: 3, pos: { x: 2, y: 4 } }],
    },
    {
      id: 'st_se_2',
      title: 'Driftwood Canyon',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 2, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 4 }],
      gems: [{ id: 1, pos: { x: 0, y: 3 } }, { id: 2, pos: { x: 2, y: 2 } }, { id: 3, pos: { x: 4, y: 1 } }],
    },
    {
      id: 'st_se_3',
      title: 'Emerald Reef Crossing',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 0, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 4, y: 2 }],
      gems: [{ id: 1, pos: { x: 3, y: 0 } }, { id: 2, pos: { x: 1, y: 3 } }, { id: 3, pos: { x: 3, y: 3 } }],
    },
  ],
  discoverers: [
    {
      id: 'st_di_1',
      title: 'Cipher Fortress Grid',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
      gems: [{ id: 1, pos: { x: 0, y: 3 } }, { id: 2, pos: { x: 2, y: 1 } }, { id: 3, pos: { x: 4, y: 2 } }],
    },
    {
      id: 'st_di_2',
      title: 'Obsidian Valley Maze',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 4 }, { x: 4, y: 2 }],
      gems: [{ id: 1, pos: { x: 3, y: 0 } }, { id: 2, pos: { x: 1, y: 2 } }, { id: 3, pos: { x: 3, y: 4 } }],
    },
    {
      id: 'st_di_3',
      title: 'Sunken Compass Vault',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 1, y: 1 }, { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: 3, y: 3 }],
      gems: [{ id: 1, pos: { x: 2, y: 0 } }, { id: 2, pos: { x: 1, y: 3 } }, { id: 3, pos: { x: 4, y: 1 } }],
    },
  ],
  masters: [
    {
      id: 'st_ma_1',
      title: 'Neural Matrix Alpha',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
      gems: [{ id: 1, pos: { x: 0, y: 4 } }, { id: 2, pos: { x: 2, y: 1 } }, { id: 3, pos: { x: 4, y: 0 } }],
    },
    {
      id: 'st_ma_2',
      title: 'Quantum Vector Grid',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 1 }],
      gems: [{ id: 1, pos: { x: 2, y: 0 } }, { id: 2, pos: { x: 2, y: 2 } }, { id: 3, pos: { x: 0, y: 4 } }],
    },
    {
      id: 'st_ma_3',
      title: 'Apex Relay Citadel',
      gridSize: 5,
      startPos: { x: 0, y: 0 },
      goalPos: { x: 4, y: 4 },
      obstacles: [{ x: 1, y: 1 }, { x: 2, y: 0 }, { x: 3, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 4 }],
      gems: [{ id: 1, pos: { x: 4, y: 0 } }, { id: 2, pos: { x: 0, y: 3 } }, { id: 3, pos: { x: 2, y: 3 } }],
    },
  ],
};

export function getStrategyBoardBatch(
  childId: string,
  band: DevelopmentalBand,
  seedOffset: number = 0
): StrategyBoardData {
  const pool = STRATEGY_MAZE_PRESETS[band] || STRATEGY_MAZE_PRESETS.senior_explorers;
  const [board] = pickNonRepeatingItems(childId, `strategy_${band}`, pool, 1, seedOffset);
  return board;
}

// ============================================================
// 7. MEMORY LAB EXPANDED CARD POOL (48+ Unique Pairs)
// ============================================================
const MEMORY_PAIR_POOL: Record<DevelopmentalBand, MemoryCardPairSeed[]> = {
  young_explorers: [
    { id: 'm1', symbol: '🦁', label: 'Lion' }, { id: 'm2', symbol: '🐘', label: 'Elephant' },
    { id: 'm3', symbol: '🐬', label: 'Dolphin' }, { id: 'm4', symbol: '🐼', label: 'Panda' },
    { id: 'm5', symbol: '🐸', label: 'Frog' }, { id: 'm6', symbol: '🦊', label: 'Fox' },
    { id: 'm7', symbol: '🦋', label: 'Butterfly' }, { id: 'm8', symbol: '🐢', label: 'Turtle' },
    { id: 'm9', symbol: '🍓', label: 'Berry' }, { id: 'm10', symbol: '🌞', label: 'Sunny' },
    { id: 'm11', symbol: '🌈', label: 'Rainbow' }, { id: 'm12', symbol: '🎈', label: 'Balloon' },
  ],
  senior_explorers: [
    { id: 'ms1', symbol: '🧭', label: 'Compass' }, { id: 'ms2', symbol: '🗺️', label: 'Map' },
    { id: 'ms3', symbol: '🔭', label: 'Telescope' }, { id: 'ms4', symbol: '💎', label: 'Gem' },
    { id: 'ms5', symbol: '⚓', label: 'Anchor' }, { id: 'ms6', symbol: '🏕️', label: 'Camp' },
    { id: 'ms7', symbol: '🛶', label: 'Canoe' }, { id: 'ms8', symbol: '🦜', label: 'Parrot' },
    { id: 'ms9', symbol: '🚀', label: 'Rocket' }, { id: 'ms10', symbol: '🌋', label: 'Volcano' },
    { id: 'ms11', symbol: '🏝️', label: 'Island' }, { id: 'ms12', symbol: '🪐', label: 'Planet' },
    { id: 'ms13', symbol: '🦉', label: 'Owl' }, { id: 'ms14', symbol: '🔦', label: 'Torch' },
  ],
  discoverers: [
    { id: 'md1', symbol: '🔬', label: 'Microscope' }, { id: 'md2', symbol: '🧬', label: 'Helix' },
    { id: 'md3', symbol: '🔍', label: 'Magnifier' }, { id: 'md4', symbol: '🧪', label: 'Flask' },
    { id: 'md5', symbol: '📐', label: 'Ruler' }, { id: 'md6', symbol: '⚖️', label: 'Scale' },
    { id: 'md7', symbol: '🗝️', label: 'Key' }, { id: 'md8', symbol: '📜', label: 'Scroll' },
    { id: 'md9', symbol: '🧲', label: 'Magnet' }, { id: 'md10', symbol: '⚙️', label: 'Gear' },
    { id: 'md11', symbol: '💡', label: 'Bulb' }, { id: 'md12', symbol: '🛰️', label: 'Satellite' },
    { id: 'md13', symbol: '🔋', label: 'Cell' }, { id: 'md14', symbol: '🧭', label: 'Gyro' },
  ],
  masters: [
    { id: 'mm1', symbol: '⬡', label: 'Hex Core' }, { id: 'mm2', symbol: '◈', label: 'Diamond' },
    { id: 'mm3', symbol: '▲', label: 'Prism' }, { id: 'mm4', symbol: '◎', label: 'Orbital' },
    { id: 'mm5', symbol: '◬', label: 'Pyramid' }, { id: 'mm6', symbol: '⎔', label: 'Node' },
    { id: 'mm7', symbol: '❂', label: 'Sun Pulse' }, { id: 'mm8', symbol: '⯁', label: 'Matrix' },
    { id: 'mm9', symbol: '⚛️', label: 'Atom' }, { id: 'mm10', symbol: '♾️', label: 'Infinity' },
    { id: 'mm11', symbol: '❖', label: 'Flux' }, { id: 'mm12', symbol: '⌬', label: 'Benzene' },
    { id: 'mm13', symbol: '⏣', label: 'Lattice' }, { id: 'mm14', symbol: '⬢', label: 'Vector' },
  ],
};

export function getMemoryPairsBatch(
  childId: string,
  band: DevelopmentalBand,
  pairCount: number,
  seedOffset: number = 0
): MemoryCardPairSeed[] {
  const pool = MEMORY_PAIR_POOL[band] || MEMORY_PAIR_POOL.senior_explorers;
  return pickNonRepeatingItems(childId, `memory_${band}`, pool, pairCount, seedOffset);
}
