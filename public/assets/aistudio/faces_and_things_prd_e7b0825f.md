# Product Requirements Document (PRD): Faces and Things (Digital Edition)

**Document Version:** 1.0  
**Product Name:** Faces and Things – Kids' Cognitive & Memory Web App  
**Target Audience:** Children (Ages 3–12) and Parents/Educators  
**Intellectual Property:** Salewa Onaneye & Matthew Onaneye

---

## 1. Executive Summary & Product Vision

**Faces and Things** is an interactive, cognitive-training web application adapted from the physical educational card game of the same name. Designed to exercise visual memory, auditory recall, focus, spatial awareness, and creative storytelling in children aged 3–12, the app translates 16 distinct tabletop mini-games into an engaging, self-paced or parent-guided digital experience.

### Core Value Propositions
* **Multi-Sensory Cognitive Training:** Combines visual recognition, Text-to-Speech (TTS) auditory reinforcement, spatial grid recall, and voice-recorded creative storytelling.
* **Adaptive Difficulty:** Dynamically scales card counts, timers, and grid complexity based on the child’s age bracket (3–4, 5–8, and 8–12 years).
* **Dual Play Modes:** Supports **Solo Mode** (automated AI game master for independent child play) and **Co-Play / Pass-and-Play Mode** (facilitated by a parent or played competitively between siblings).

---

## 2. Target Audience & User Personas

| Persona | Age / Role | Primary Needs & Behaviors |
| :--- | :--- | :--- |
| **Early Learner** | Ages 3–4 | Cannot read fluently yet; relies on visual cues and spoken character names (audio prompts). Needs small card sets (3–5 cards) and forgiving timers. |
| **Developing Explorer** | Ages 5–8 | Beginning to read labels independently; enjoys streak rewards, moderate grids (6–16 cards), and silly storytelling prompts. |
| **Junior Strategist** | Ages 8–12 | Seeks high-difficulty challenges (up to 30–64 cards), fast timers, coordinate mapping, and sibling competition. |
| **Parent / Educator** | Facilitator | Wants screen time that builds measurable memory and focus muscles; uses Co-Play mode to bond, track progress, and reward milestones. |

---

## 3. Asset Inventory & Digital Card Deck

The application utilizes the existing illustrated asset library featuring white square cards with warm yellow/orange watercolor splashes, distinct hand-lettered uppercase/title-case typography, and a dark card back emblazoned with the colorful *"Who is this?"* splash logo.

### 3.1 Deck Breakdown (70 Total Cards)
* **Human Characters (35 Cards):** Bola, Amaka, Janet, Hannah, Felicia, Pa James, Tina, Tobi, Amina, Tony, Grandma Nina, Nicholas, Ade, Blessing, Zainab, Kemi, Chioma, Ruth, Matthew, Arinze, Naomi, Nonso, Grandma Cecilia, Joseph, Simon, Sunita, Segun, Funmi, Paul, Grandpa John, Jubril, Aisha, Kabir, Abel, Pat.
* **Animals (17 Cards):** Bull, Reindeer, Goat, Zebra, Dog, Horse, Monkey, Elephant, Sheep, Tiger, Chicken, Donkey, Tortoise, Snake, Cheetah, Cow, Rabbit.
* **Objects (18 Cards):** Ball, Aeroplane, Scissors, Cap, Book, Ship, Bag, Car, Oven, Light Bulb, Shirt, Iron, TV Remote, Phone, Television, Bottle, Chair, Pot.
* **Special Board Asset:** *Faces and Things Treasure Map* — A nautical-themed grid map with numbered X-axis (0–7) and Y-axis (0–7) intersections, compass rose, and dashed gridlines.

### 3.2 Card Component States
1. **Face-Up (Labeled):** Displays character/object illustration + text label + tap-to-hear TTS audio pronunciation (essential for pre-readers).
2. **Face-Up (Unlabeled / Masked):** Hides the bottom text label during recall/quiz phases (used in *Who Is This?*).
3. **Face-Down:** Displays the dark card back (*"Who is this?"* graphic).

---

## 4. Functional Requirements & Game Modes

*Note: Deduplication of the manual reveals 16 unique games (Game 14 and Game 18/19 are duplicated in the source guide).*

### 4.1 Core App Architecture
* **Profile & Difficulty Selector:** Upon launch, select Child Profile (Age 3–4, 5–8, 8–12) and Play Mode (**Solo AI Host** vs. **Parent/Sibling Co-Play**).
* **Audio Engine:** Pre-recorded human voiceovers (or high-clarity neural TTS) for all 70 card names, plus sound effects for flips, matches, timers, and applause.
* **Reward & Progression System:** Star/badge rewards per completed round, accuracy tracking, and a customizable "Parent Prize Prompt" (e.g., unlocking a real-world treat/reward upon hitting a score target).

### 4.2 Detailed Game Specifications

#### Category A: Recognition & Visual Recall
1. **Game 1: Who Is This? (Name & Face Recall)**
   * *Mechanic:* Display $N$ cards face-up with labels and voice narration during a study countdown. Shuffle into a deck, present one random card with the name label hidden, and prompt *"Who is this?"*
   * *Input:* Multiple-choice name buttons (for readers) or audio-assisted selection / parent-verified spoken answer.
2. **Game 2: Who/What Is Here? (Spatial Grid Memory)**
   * *Mechanic:* Arrange $N$ cards face-up in a grid. After the study timer expires, flip all cards face-down. Highlight one face-down slot and ask, *"Who/what is in this position?"*
   * *Input:* Select the correct card from a bottom tray of candidates.
3. **Game 3: Who Is Missing? (Presence & Focus)**
   * *Mechanic:* Display $N$ cards on screen for study. Trigger a "Curtain Drop / Blink" animation (simulating covering eyes) while removing 1–3 cards and closing gaps. Ask *"Who is missing?"* (or *"Who ran away from school?"*).
   * *Input:* Tap the missing character(s) from a selection bank.
4. **Game 5: Who/What Moved? (Position Shift Detection)**
   * *Mechanic:* Show $N$ cards face-up. Trigger a "Curtain Drop" animation while swapping the positions of 2 or more cards. Reveal the board and ask *"Who moved?"*
   * *Input:* Tap all cards that changed positions.

#### Category B: Association & Pairing
5. **Game 4: Who Owns What? (Item Association)**
   * *Mechanic:* Display pairs of `[Character Card] + [Object Card]` side-by-side (e.g., *Tobi + Book*). After the study phase, remove the Character cards. Prompt: *"What did Tobi bring today?"*
   * *Input:* Tap the matching object card on the board.
6. **Game 14: Match the Faces (Paired Memory Grid)**
   * *Mechanic:* Show assigned pairings on a "Clue Sheet" modal (e.g., *Musa – Kettle, Ada – Bag, Segun – Car*) for a few seconds. Place all cards face-down in a shuffled grid. Player flips two cards per turn to find the pre-assigned pairs.
7. **Game 17: Match 'Em Up (Sequential Relationship Pairs)**
   * *Mechanic:* Display a grid of 8–16 cards alongside a relationship key (e.g., *Horse – Zebra, Grandma Nina – Grandma Cecilia*). Flip cards face-down. Under a 30–45 second timer, player must flip pairs in valid sequence; a mismatch resets the active pair.

#### Category C: Position Tracking & Sequences
8. **Game 6 & 8: What's Their Position? (Visual & Auditory Sequence)**
   * *Mechanic:*
     * *Visual Mode (Game 6):* Child studies a numbered row of 5–20 cards. Cards are collected; a random card is shown and the app asks, *"What was Amaka's position?"*
     * *Auditory Mode (Game 8):* App calls out names and position numbers aloud (e.g., *"1. Amaka, 2. Segun, 3. Sunita"*) without visual order, then presents a random card to recall its spoken number.
   * *Input:* Tap the corresponding numbered slot (`#1`, `#2`, etc.).
9. **Game 7: Position Tracker (Live Shuffle)**
   * *Mechanic:* Arrange cards in rows and columns. While the child watches, cards visibly animate and swap places 5 to 15 times (scaled by age). App highlights a target character and asks the child to tap where they landed (or vice versa).
10. **Game 13: Swap the Faces (Grid Restoration)**
    * *Mechanic:* Display a $2 \times 2$ up to $8 \times 8$ (4–64 cards) square grid. Take a "snapshot" into memory, then scramble/swap multiple cards.
    * *Input:* Drag-and-drop (or tap-to-swap) cards back to their original grid coordinates before checking against the snapshot.
11. **Game 16: Pattern Trailer / Follow Me Closely (Simon-Style Sequence)**
    * *Mechanic:* Start with 4+ cards on screen. The app illuminates/animates cards in a sequence with distinct audio chimes, adding one step per round. Child must tap the cards in exact sequence.

#### Category D: Auditory & Verbal Chain Memory
12. **Game 10: Who/What Is Missing? (Auditory Version)**
    * *Mechanic:* App speaks a list of 3–10 character/animal/object names aloud (no cards shown on screen, or cards shown briefly then hidden). App repeats the list with 1–2 names omitted and asks, *"Who/what is missing?"*
13. **Game 11: Who Sang What? (Sound-to-Character Matching)**
    * *Mechanic:* Assign a unique musical tone, instrument riff, or ringtone to 5–20 characters (e.g., *"Sunita is playing this sound"*). During the quiz phase, play a random sound and ask, *"Who played this sound?"*
14. **Game 12: Memory Train ("I'm Going to the Beach")**
    * *Mechanic:* Pass-and-play or AI-assisted cumulative chain game. Draw a card (e.g., *Television*), tuck it away, and build a growing list: *"I am going to the beach, and I am taking my Television, Dog, and Cap with me."* In Solo mode, the child taps the previously drawn cards in chronological order from a grid to keep the train moving.

#### Category E: Creative Storytelling & Spatial Coordinates
15. **Game 9 & 15: Alternate Realities & Story Chain (Creative Studio)**
    * *Mechanic:*
      * *Alternate Realities (Game 9):* Child draws 1 Character, 1 Animal, and 1 Object (e.g., *Amaka, Elephant, Bag*). App prompts child to invent and voice-record a funny role-reversal sentence (e.g., *"An elephant with a bag riding on Amaka's back to school"*). After 2–3 rounds, app plays back prompts so the child recalls their earlier stories.
      * *What Is Who Doing? (Game 15):* Draws `[Human] + [Animal/Object]` pairs per turn to build a continuous multi-sentence story chain across players.
    * *Tech Feature:* Uses Web Audio API (`MediaRecorder`) to record, save, and replay the child's voice stories during the session.
16. **Game 18/19: Find the Treasure (Coordinate Mapping)**
    * *Mechanic:* Display the *Faces and Things Treasure Map* with 4–15 cards placed on grid line intersections (e.g., *Bag at `(2, 3)`*, *Elephant at `(4, 6)`*, *Sheep at `(6, 4)`*), marking the final item as the Treasure.
    * *Input:* Timed challenge where the child enters or selects `(X, Y)` coordinates for each listed item on screen.

---

## 5. Age-Based Difficulty Scaling Matrix

| Parameter | Tier 1: Little Geniuses (Ages 3–4) | Tier 2: Sharp Explorers (Ages 5–8) | Tier 3: Master Minds (Ages 8–12) |
| :--- | :--- | :--- | :--- |
| **Active Card Count** | 3 – 5 cards | 6 – 15 cards | 16 – 30+ cards (up to 64 in Grid Swap) |
| **Study Timer** | Unlimited / Manual "I'm Ready" | 15 – 45 seconds | 5 – 20 seconds |
| **Live Swaps (Game 7)** | 3 – 5 swaps (slow speed) | 8 – 10 swaps (medium speed) | 12 – 15 swaps (fast speed) |
| **Text Labels** | Auto-narrated via TTS on tap | Shown during study; hidden in quiz | Minimal hints; faster recall timers |
| **Treasure Map Grid** | $4 \times 4$ simplified grid | $7 \times 7$ full coordinate grid | $7 \times 7$ grid + timed speed bonus |

---

## 6. UI/UX & Visual Design Guidelines

* **Visual Identity:** Retain the authentic warmth of the physical deck—crisp white rounded-square cards (`border-radius: 16px`), soft drop shadows, yellow watercolor backing textures, and high-contrast hand-lettered labels.
* **Card Back:** Deep charcoal/matte black card backs with the vibrant multi-color *"Who is this?"* center emblem and smooth 3D CSS `rotateY(180deg)` flip animations.
* **Child-Friendly Ergonomics:**
  * Minimum touch target size of `64px × 64px` for cards and buttons.
  * Zero cluttered text menus; use visual icons, character avatars, and audio instructions.
  * Celebration micro-interactions (confetti bursts, cheering sound effects, star counters) after every successful round.
* **Responsive Layout:** Landscape-first optimization for tablets (iPad/Android) and laptops, with adaptive grid scaling for mobile screens.

---

## 7. Technical Architecture & Stack Recommendations

* **Frontend Framework:** React (with TypeScript) + Tailwind CSS for responsive grid layouts and smooth state transitions.
* **Animations:** Framer Motion for card dealing, 3D flips, live position swaps (Game 7), and curtain-drop transitions.
* **Audio & Voice Recording:**
  * Howler.js for low-latency sound effects, musical tones (Game 11), and character name voiceovers.
  * Browser `MediaRecorder` API for temporary in-session voice recording in *Alternate Realities* (Game 9) and *Story Chain* (Game 15).
* **State & Storage:** LocalStorage / IndexedDB for saving child profiles, star progress, and custom parent reward goals offline (ensuring COPPA/GDPR-K compliance with zero mandatory cloud PII collection for children).

---

## 8. Milestones & Development Roadmap

1. **Phase 1: Asset Digitization & Core Engine (Weeks 1–2)**
   * Slice and optimize all 70 character, animal, and object cards + Treasure Map into transparent/crisp WebP/PNG sprites.
   * Record/generate TTS voice clips for all 70 card names.
   * Build reusable `<GameCard/>`, `<CardGrid/>`, `<StudyTimer/>`, and `<CurtainOverlay/>` components.
2. **Phase 2: Visual & Association Mini-Games (Weeks 3–4)**
   * Implement Games 1, 2, 3, 4, 5, 14, and 17 (core flip, hide, swap, and match mechanics).
3. **Phase 3: Spatial, Auditory & Creative Modes (Weeks 5–6)**
   * Implement Games 6, 7, 8, 10, 11, 12, 13, 16, and 18/19 (live animations, audio matching, and coordinate grid).
   * Integrate voice recording and playback for Games 9 and 15.
4. **Phase 4: Gamification, Polish & Kid Testing (Week 7)**
   * Add age-tier presets, Pass-and-Play scoreboard, parent reward settings, and touch-responsiveness testing across tablets and phones.