import {
  CognitiveDomain,
  DevelopmentalBand,
  FocusArea,
  DomainInfo,
  FocusAreaInfo,
  BandInfo,
  GameDefinition,
  GameSession,
} from '../types';

export const FOCUS_AREAS: Record<FocusArea, FocusAreaInfo> = {
  reading: {
    id: 'reading',
    title: 'Reading & Verbal Comprehension',
    shortDesc: 'Phonics, vocabulary deduction, context clues, and reading comprehension.',
    emoji: '📖',
    color: 'text-black',
    bgColor: 'bg-[#e885cf]/25',
    borderColor: 'border-[#c1008f]',
  },
  concentration: {
    id: 'concentration',
    title: 'Concentration & Sustained Focus',
    shortDesc: 'Selective attention, impulse control, rule-switching, and distractor resistance.',
    emoji: '🎯',
    color: 'text-black',
    bgColor: 'bg-[#53b0c9]/25',
    borderColor: 'border-[#53b0c9]',
  },
  mental_abilities: {
    id: 'mental_abilities',
    title: 'Mental Abilities & Reasoning',
    shortDesc: 'Mental mathematics, spatial/abstract thinking, pattern logic, and memory.',
    emoji: '🧠',
    color: 'text-black',
    bgColor: 'bg-[#ffd400]/25',
    borderColor: 'border-[#f76400]',
  },
};

export const COGNITIVE_DOMAINS: Record<CognitiveDomain, DomainInfo> = {
  memory: {
    id: 'memory',
    title: 'Memory Lab',
    shortDesc: 'Encoding, storing and retrieving information',
    fullDesc: 'Practise retaining visual pairs, auditory patterns, spatial locations, and retrieving sequences accurately.',
    focusArea: 'mental_abilities',
    metrics: ['Recall accuracy', 'Sequence retention', 'Delayed retrieval'],
    color: 'text-white',
    bgColor: 'bg-[#7f27a8]',
    borderColor: 'border-[#7f27a8]',
    icon: 'Brain',
  },
  attention: {
    id: 'attention',
    title: 'Focus Academy',
    shortDesc: 'Sustaining and selectively directing attention',
    fullDesc: 'Practise zeroing in on key targets amidst distracting visual noise and sustaining focus over time.',
    focusArea: 'concentration',
    metrics: ['Target accuracy', 'Missed targets', 'Distractor resistance'],
    color: 'text-black',
    bgColor: 'bg-[#53b0c9]',
    borderColor: 'border-[#53b0c9]',
    icon: 'Target',
  },
  reasoning: {
    id: 'reasoning',
    title: 'Logic Kingdom',
    shortDesc: 'Identifying relationships, patterns and deduction',
    fullDesc: 'Practise spotting geometric matrices, numerical series, deductive clues, and cause-and-effect reasoning.',
    focusArea: 'mental_abilities',
    metrics: ['Pattern recognition', 'Deductive accuracy', 'Complexity level'],
    color: 'text-black',
    bgColor: 'bg-[#ffd400]',
    borderColor: 'border-[#f76400]',
    icon: 'Puzzle',
  },
  processing_speed: {
    id: 'processing_speed',
    title: 'Brain Speed',
    shortDesc: 'Efficiently interpreting and responding to info',
    fullDesc: 'Practise rapid visual classification and quick recognition without sacrificing accuracy for raw speed.',
    focusArea: 'concentration',
    metrics: ['Response efficiency', 'Accuracy under pace', 'Symbol search rate'],
    color: 'text-white',
    bgColor: 'bg-[#f76400]',
    borderColor: 'border-[#f76400]',
    icon: 'Zap',
  },
  cognitive_flexibility: {
    id: 'cognitive_flexibility',
    title: 'Rule Switch',
    shortDesc: 'Switching between rules, perspectives or approaches',
    fullDesc: 'Practise dynamically adapting when rules shift abruptly from one dimension to another.',
    focusArea: 'concentration',
    metrics: ['Switch-cost adaptation', 'Rule transition speed', 'Inhibition control'],
    color: 'text-white',
    bgColor: 'bg-[#c1008f]',
    borderColor: 'border-[#c1008f]',
    icon: 'Shuffle',
  },
  executive_function: {
    id: 'executive_function',
    title: 'Strategy Island',
    shortDesc: 'Planning, working memory and self-regulation',
    fullDesc: 'Practise looking ahead several steps, managing constraints, and formulating multi-step navigation plans.',
    focusArea: 'concentration',
    metrics: ['Step efficiency', 'Forward planning', 'Goal completion rate'],
    color: 'text-black',
    bgColor: 'bg-[#e885cf]',
    borderColor: 'border-[#c1008f]',
    icon: 'Compass',
  },
  mental_math: {
    id: 'mental_math',
    title: 'Number Sense & Mental Math',
    shortDesc: 'Rapid mental calculation, arithmetic fluency & number sense',
    fullDesc: 'Practise agile mental arithmetic, multiplication tables, percentages, and numerical estimation tailored to age.',
    focusArea: 'mental_abilities',
    metrics: ['Calculation speed', 'Arithmetic accuracy', 'Formula agility'],
    color: 'text-black',
    bgColor: 'bg-[#53b0c9]',
    borderColor: 'border-[#53b0c9]',
    icon: 'Calculator',
  },
  spatial_thinking: {
    id: 'spatial_thinking',
    title: 'Spatial & Abstract Thinking',
    shortDesc: 'Mental rotation, 2D/3D spatial reasoning, and matrix patterns',
    fullDesc: 'Practise mentally manipulating shapes in space, folding nets, perspective transformations, and abstract matrix puzzles.',
    focusArea: 'mental_abilities',
    metrics: ['Rotation accuracy', '3D projection insight', 'Spatial transformation'],
    color: 'text-white',
    bgColor: 'bg-[#7f27a8]',
    borderColor: 'border-[#7f27a8]',
    icon: 'Layers',
  },
  reading_comprehension: {
    id: 'reading_comprehension',
    title: 'Word Detective & Reading',
    shortDesc: 'Phonics, vocabulary in context, and inferential reading',
    fullDesc: 'Practise vocabulary building, rhyming sight words, context clues, and deduction from reading passages.',
    focusArea: 'reading',
    metrics: ['Vocabulary mastery', 'Reading comprehension', 'Context inference'],
    color: 'text-white',
    bgColor: 'bg-[#c1008f]',
    borderColor: 'border-[#c1008f]',
    icon: 'BookOpen',
  },
};

export const DEVELOPMENTAL_BANDS: Record<DevelopmentalBand, BandInfo> = {
  young_explorers: {
    id: 'young_explorers',
    worldName: 'Explorers Grove',
    subName: 'Young Explorers',
    ageRange: 'Ages 5–7',
    minAge: 5,
    maxAge: 7,
    themeDescription: 'Playful nature adventures with friendly guides, large buttons, audio guidance, and zero reading pressure.',
    color: 'pond',
    bgGradient: 'from-[#53b0c9] via-[#7f27a8] to-[#c1008f]',
    avatarOptions: [
      { id: 'fox', name: 'Pip the Fox', emoji: '🦊' },
      { id: 'bear', name: 'Barnaby Bear', emoji: '🐻' },
      { id: 'bunny', name: 'Luna Bunny', emoji: '🐰' },
      { id: 'owl', name: 'Oliver Owl', emoji: '🦉' },
    ],
  },
  senior_explorers: {
    id: 'senior_explorers',
    worldName: 'Explorers Trail',
    subName: 'Senior Explorers',
    ageRange: 'Ages 8–10',
    minAge: 8,
    maxAge: 10,
    themeDescription: 'Curious island expeditions with deeper pattern challenges, multi-item memory, and mission badges.',
    color: 'juice',
    bgGradient: 'from-[#f76400] via-[#c1008f] to-[#7f27a8]',
    avatarOptions: [
      { id: 'tiger', name: 'Dash the Tiger', emoji: '🐯' },
      { id: 'hawk', name: 'Sky the Hawk', emoji: '🦅' },
      { id: 'dolphin', name: 'Echo the Dolphin', emoji: '🐬' },
      { id: 'panda', name: 'Bamboo Panda', emoji: '🐼' },
    ],
  },
  discoverers: {
    id: 'discoverers',
    worldName: 'Discoverers Academy',
    subName: 'Discoverers',
    ageRange: 'Ages 11–13',
    minAge: 11,
    maxAge: 13,
    themeDescription: 'Mystery, investigative deduction, multi-step puzzles, clues, and dynamic rule-switching tests.',
    color: 'bat',
    bgGradient: 'from-[#7f27a8] via-[#c1008f] to-[#f76400]',
    avatarOptions: [
      { id: 'detective', name: 'Inspector Lynx', emoji: '🕵️' },
      { id: 'cipher', name: 'Nova Navigator', emoji: '🧭' },
      { id: 'falcon', name: 'Aero Falcon', emoji: '⚡' },
      { id: 'alchemist', name: 'Kite Alchemist', emoji: '🔮' },
    ],
  },
  masters: {
    id: 'masters',
    worldName: 'Masters Neural Lab',
    subName: 'Masters',
    ageRange: 'Ages 14–16',
    minAge: 14,
    maxAge: 16,
    themeDescription: 'High-level strategic analysis, abstract logic grids, working memory load, and complex decision-making.',
    color: 'heart',
    bgGradient: 'from-[#7f27a8] via-[#53b0c9] to-[#c1008f]',
    avatarOptions: [
      { id: 'strategist', name: 'Apex Strategist', emoji: '♟️' },
      { id: 'quantum', name: 'Quantum Core', emoji: '⚛️' },
      { id: 'architect', name: 'Nexus Architect', emoji: '🏛️' },
      { id: 'cyber', name: 'Cyber Voyager', emoji: '🛸' },
    ],
  },
};

export const GAME_DEFINITIONS: GameDefinition[] = [
  // 1. Memory Lab
  {
    id: 'memory_pairs',
    moduleId: 'memory_lab',
    moduleName: 'Memory Lab',
    title: 'Picture Pairs & Sequence',
    tagline: 'Visual memory and location retention',
    domain: 'memory',
    focusArea: 'mental_abilities',
    subCategory: 'Memory & Retention',
    description: 'Find matching cards and track spatial locations. Adapts card count and distractors to child age.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Brain',
    badgeColor: 'violet',
  },

  // 2. Focus Academy
  {
    id: 'focus_hunter',
    moduleId: 'focus_academy',
    moduleName: 'Focus Academy',
    title: 'Target Hunter & Rule Switch',
    tagline: 'Selective attention & cognitive flexibility',
    domain: 'attention',
    focusArea: 'concentration',
    subCategory: 'Concentration & Focus',
    description: 'Tap target shapes quickly while ignoring distractors. Watch out when the bell chimes for a surprise rule switch!',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Target',
    badgeColor: 'teal',
  },

  // 3. Logic Kingdom
  {
    id: 'logic_patterns',
    moduleId: 'logic_kingdom',
    moduleName: 'Logic Kingdom',
    title: 'Pattern Detective',
    tagline: 'Deductive reasoning and sequence completion',
    domain: 'reasoning',
    focusArea: 'mental_abilities',
    subCategory: 'Mental Abilities',
    description: 'Analyze sequences of shapes, numbers, and colors to deduce the missing piece in the puzzle.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'Puzzle',
    badgeColor: 'amber',
  },

  // 4. Brain Speed
  {
    id: 'speed_classifier',
    moduleId: 'brain_speed',
    moduleName: 'Brain Speed',
    title: 'Rapid Classifier',
    tagline: 'Visual processing speed & categorization',
    domain: 'processing_speed',
    focusArea: 'concentration',
    subCategory: 'Concentration & Speed',
    description: 'Sort stimulus cards into target bins at a brisk pace. Accuracy counts just as much as speed!',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 2,
    iconName: 'Zap',
    badgeColor: 'cyan',
  },

  // 5. Strategy Island
  {
    id: 'strategy_route',
    moduleId: 'strategy_island',
    moduleName: 'Strategy Island',
    title: 'Route Planner',
    tagline: 'Executive function & multi-step planning',
    domain: 'executive_function',
    focusArea: 'concentration',
    subCategory: 'Executive Focus',
    description: 'Plot moves in advance on a grid to gather resources, bypass obstacles, and reach the destination.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'Compass',
    badgeColor: 'emerald',
  },

  // 6. NEW: Mental Mathematics (Mental Abilities)
  {
    id: 'mental_math',
    moduleId: 'brain_speed',
    moduleName: 'Math Arena',
    title: 'Mental Math Challenge',
    tagline: 'Rapid mental arithmetic and numerical reasoning',
    domain: 'mental_math',
    focusArea: 'mental_abilities',
    subCategory: 'Mental Mathematics',
    description: 'Solve engaging mental math challenges suited to age: picture arithmetic for young ages, times tables and algebraic equations for older explorers.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Calculator',
    badgeColor: 'blue',
  },

  // 7. NEW: Spatial & Abstract Thinking (Mental Abilities)
  {
    id: 'spatial_thinking',
    moduleId: 'logic_kingdom',
    moduleName: 'Spatial Studio',
    title: 'Shape Shifters & Spatial Matrix',
    tagline: 'Mental rotation, 3D projections, and abstract spatial puzzles',
    domain: 'spatial_thinking',
    focusArea: 'mental_abilities',
    subCategory: 'Spatial & Abstract Thinking',
    description: 'Mentally rotate shapes, match folded 3D cube nets, and identify abstract non-verbal spatial patterns.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Layers',
    badgeColor: 'fuchsia',
  },

  // 8. Reading & Word Detective (Reading)
  {
    id: 'word_detective',
    moduleId: 'memory_lab',
    moduleName: 'Word Academy',
    title: 'Word Detective & Reading Quest',
    tagline: 'Phonics, vocabulary in context, and reading comprehension',
    domain: 'reading_comprehension',
    focusArea: 'reading',
    subCategory: 'Reading Comprehension',
    description: 'Solve phonics rhymes for early readers, vocabulary riddles for seniors, and contextual inference puzzles for advanced explorers.',
    minAge: 5,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'BookOpen',
    badgeColor: 'rose',
  },

  // 9. Faces & Things: Who or What? (Memory Lab)
  {
    id: 'faces_who_is_this',
    moduleId: 'memory_lab',
    moduleName: 'Memory Lab',
    title: 'Faces & Things: Who or What?',
    tagline: 'Card recall with authentic Who or What cards by Matthew Onaneye',
    domain: 'memory',
    focusArea: 'mental_abilities',
    subCategory: 'Memory & Retention',
    description: 'Study character and object cards, then identify the masked card as cards flip to "Who or What". Card count scales directly with your age!',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Brain',
    badgeColor: 'amber',
  },

  // 10. Faces & Things: Who Is Missing? (Focus Academy)
  {
    id: 'faces_who_is_missing',
    moduleId: 'focus_academy',
    moduleName: 'Focus Academy',
    title: 'Faces & Things: Who Is Missing?',
    tagline: 'Attention & presence detection by Matthew Onaneye',
    domain: 'attention',
    focusArea: 'concentration',
    subCategory: 'Concentration & Focus',
    description: 'Close your eyes as the curtain drops! Spot which character ran away from the table. Number of cards scales to child age.',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Target',
    badgeColor: 'teal',
  },

  // 11. Faces & Things: Who Owns What? (Logic Kingdom)
  {
    id: 'faces_who_owns_what',
    moduleId: 'logic_kingdom',
    moduleName: 'Logic Kingdom',
    title: 'Faces & Things: Who Owns What?',
    tagline: 'Associative deduction and pairing by Matthew Onaneye',
    domain: 'reasoning',
    focusArea: 'mental_abilities',
    subCategory: 'Mental Abilities',
    description: 'Remember which items each character brought with them today and deduce the matching pair.',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Puzzle',
    badgeColor: 'amber',
  },

  // 12. Faces & Things: Live Shell Shuffle (Brain Speed)
  {
    id: 'faces_position_tracker',
    moduleId: 'brain_speed',
    moduleName: 'Brain Speed',
    title: 'Faces & Things: Live Shell Shuffle',
    tagline: 'Rapid position tracking and focus by Matthew Onaneye',
    domain: 'processing_speed',
    focusArea: 'concentration',
    subCategory: 'Concentration & Speed',
    description: 'Watch the cards shuffle and slide in real time! Track your target card with your eyes and tap where it lands.',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Zap',
    badgeColor: 'cyan',
  },

  // 13. Faces & Things: Nautical Treasure Map (Spatial Thinking)
  {
    id: 'faces_treasure_map',
    moduleId: 'logic_kingdom',
    moduleName: 'Spatial Studio',
    title: 'Faces & Things: Treasure Map',
    tagline: 'Nautical coordinate grid mapping by Matthew Onaneye',
    domain: 'spatial_thinking',
    focusArea: 'mental_abilities',
    subCategory: 'Spatial & Abstract Thinking',
    description: 'Navigate the 0-7 nautical coordinate map, plot latitude and longitude intersections, and pinpoint hidden treasures.',
    minAge: 4,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'Compass',
    badgeColor: 'emerald',
  },

  // 14. Faces & Things: Creative Story Studio (Word Academy)
  {
    id: 'faces_creative_studio',
    moduleId: 'memory_lab',
    moduleName: 'Word Academy',
    title: 'Faces & Things: Story Studio',
    tagline: 'Creative storytelling & voice recording by Matthew Onaneye',
    domain: 'reading_comprehension',
    focusArea: 'reading',
    subCategory: 'Reading Comprehension',
    description: 'Draw 3 cards, invent hilarious role-reversal stories, record your voice, and share with your family!',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'BookOpen',
    badgeColor: 'rose',
  },

  // 15. Faces & Things: Spatial Grid Memory (Memory Lab)
  {
    id: 'faces_who_is_here',
    moduleId: 'memory_lab',
    moduleName: 'Memory Lab',
    title: 'Faces & Things: Spatial Grid',
    tagline: 'Grid location memory with Who or What cards by Matthew Onaneye',
    domain: 'memory',
    focusArea: 'mental_abilities',
    subCategory: 'Memory & Retention',
    description: 'Memorize where every character and object sits on the board before cards flip to "Who or What"!',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Brain',
    badgeColor: 'violet',
  },

  // 16. Faces & Things: Who Moved? (Focus Academy)
  {
    id: 'faces_who_moved',
    moduleId: 'focus_academy',
    moduleName: 'Focus Academy',
    title: 'Faces & Things: Who Moved?',
    tagline: 'Position shift detection by Matthew Onaneye',
    domain: 'attention',
    focusArea: 'concentration',
    subCategory: 'Concentration & Focus',
    description: 'Study the lineup, close your eyes during the curtain drop, and spot which cards swapped positions!',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Target',
    badgeColor: 'teal',
  },

  // 17. Faces & Things: What's Their Position? (Logic Kingdom)
  {
    id: 'faces_whats_their_position',
    moduleId: 'logic_kingdom',
    moduleName: 'Logic Kingdom',
    title: 'Faces & Things: Number Lineup',
    tagline: 'Sequential order deduction by Matthew Onaneye',
    domain: 'reasoning',
    focusArea: 'mental_abilities',
    subCategory: 'Mental Abilities',
    description: 'Remember each character’s exact position number in the lineup as the card count grows with your age.',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Puzzle',
    badgeColor: 'amber',
  },

  // 18. Faces & Things: Who Sang What? (Memory Lab)
  {
    id: 'faces_who_sang_what',
    moduleId: 'memory_lab',
    moduleName: 'Memory Lab',
    title: 'Faces & Things: Who Sang What?',
    tagline: 'Musical tone & auditory memory by Matthew Onaneye',
    domain: 'memory',
    focusArea: 'mental_abilities',
    subCategory: 'Memory & Retention',
    description: 'Listen carefully to each character’s unique musical melody and match the mystery song to its singer!',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 3,
    iconName: 'Brain',
    badgeColor: 'violet',
  },

  // 19. Faces & Things: Memory Train (Strategy Island)
  {
    id: 'faces_memory_train',
    moduleId: 'strategy_island',
    moduleName: 'Strategy Island',
    title: 'Faces & Things: Memory Train',
    tagline: 'Cumulative sequence planning by Matthew Onaneye',
    domain: 'executive_function',
    focusArea: 'concentration',
    subCategory: 'Executive Focus',
    description: 'Pack items onto the Memory Train and recall every card in exact chronological order!',
    minAge: 3,
    maxAge: 16,
    allowedBands: ['young_explorers', 'senior_explorers', 'discoverers', 'masters'],
    estimatedMinutes: 4,
    iconName: 'Compass',
    badgeColor: 'emerald',
  },
];

/**
 * Calculates age-scaled card count and difficulty parameters.
 * Guarantees card count and difficulty increase directly with the player's age.
 */
export function getAgeBasedCardConfig(age: number, adaptiveDifficulty: number = 1) {
  const clampedAge = Math.max(3, Math.min(16, age));
  const baseCards =
    clampedAge <= 4
      ? 3
      : clampedAge === 5
      ? 4
      : clampedAge === 6
      ? 5
      : clampedAge === 7
      ? 6
      : clampedAge === 8
      ? 7
      : clampedAge === 9
      ? 8
      : clampedAge <= 11
      ? 10
      : clampedAge <= 13
      ? 12
      : 14;

  const cardCount = Math.min(16, baseCards + Math.max(0, adaptiveDifficulty - 1));
  const studySeconds = Math.max(4, Math.round(16 - clampedAge * 0.65));
  const numSwaps = Math.min(18, Math.max(3, Math.floor(clampedAge * 0.9) + adaptiveDifficulty));
  const swapIntervalMs = Math.max(300, Math.round(860 - clampedAge * 32));
  const missingCount = clampedAge <= 7 ? 1 : clampedAge <= 11 ? 2 : 3;
  const pairCount = Math.min(8, Math.max(3, Math.floor(clampedAge / 2) + 1));
  const trainMaxSteps = Math.min(8, Math.max(3, Math.floor(clampedAge / 2) + 1));
  const gridSize = clampedAge <= 5 ? 4 : clampedAge <= 8 ? 6 : 8;
  const treasureItemsCount = Math.min(14, Math.max(4, clampedAge));
  const effectiveDifficulty = Math.min(
    5,
    Math.max(1, Math.ceil(clampedAge / 3) + Math.floor((adaptiveDifficulty - 1) / 2))
  );

  return {
    age: clampedAge,
    cardCount,
    studySeconds,
    numSwaps,
    swapIntervalMs,
    missingCount,
    pairCount,
    trainMaxSteps,
    gridSize,
    treasureItemsCount,
    effectiveDifficulty,
  };
}

/**
 * Calculates current age from a birth date (YYYY-MM-DD).
 * Recalculates dynamically over time per PRD Section 7.
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 8;
  const today = new Date();
  const birth = new Date(birthDateString);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(3, Math.min(16, age));
}

/**
 * Assigns developmental band based on calculated age.
 * 5-7: young_explorers
 * 8-10: senior_explorers
 * 11-13: discoverers
 * 14-16: masters
 */
export function getDevelopmentalBand(age: number): DevelopmentalBand {
  if (age <= 7) return 'young_explorers';
  if (age <= 10) return 'senior_explorers';
  if (age <= 13) return 'discoverers';
  return 'masters';
}

/**
 * Deterministic rules-based adaptive difficulty calculation (PRD Section 12).
 * Level 1 to 5 based on consecutive session accuracy.
 */
export function calculateAdaptiveDifficulty(sessions: GameSession[], gameId?: string): number {
  const filtered = gameId ? sessions.filter((s) => s.gameId === gameId) : sessions;
  if (filtered.length === 0) return 1;

  // Look at last 3 sessions
  const recent = filtered.slice(-3);
  const avgAccuracy = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;

  if (recent.length >= 3 && avgAccuracy >= 90) return 4;
  if (recent.length >= 2 && avgAccuracy >= 80) return 3;
  if (avgAccuracy >= 65) return 2;
  return 1;
}

/**
 * Reward XP calculator per PRD Section 13:
 * Completion: 10 XP
 * High accuracy (>=85%): +5 XP
 * Difficult level: +10 XP
 * Personal best or flawless: +10 XP
 */
export function calculateRewardXp(accuracy: number, difficulty: number, isFlawless: boolean): number {
  let xp = 10;
  if (accuracy >= 85) xp += 5;
  if (difficulty >= 3) xp += 10;
  if (isFlawless) xp += 10;
  return xp;
}
