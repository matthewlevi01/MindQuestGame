# MINDQUEST
## Game Catalogue and Mini-Game Product Requirements Document

**Version 1.0** · 11 November 2026 · Supplementary to the main MindQuest PRD

---

## 1. Purpose

This document expands the main MindQuest Product Requirements Document by defining 20 additional game concepts and the requirements for implementing them.

It establishes:

- The purpose and mechanics of each game.
- Which cognitive skills each game practises.
- How each game should differ across the four developmental bands.
- Which games should be developed first.
- Shared game mechanics, scoring and adaptive difficulty requirements.
- Testing and acceptance criteria.
- Technical requirements for implementation using Google AI Studio, Next.js, Phaser 3, Supabase, GitHub and Vercel.

This is a supplementary document. The main MindQuest PRD remains the source of truth for the overall product, accounts, parent portal, security, database architecture and deployment.

---

## 2. Game Development Philosophy

MindQuest should not feel like a collection of school exercises disguised as games.

The games should provide different experiences: exploring, investigating, remembering, building, planning, solving mysteries and making decisions.

Every game must:

- Have a clearly defined objective.
- Practise at least one identifiable cognitive skill.
- Be appropriate for the intended age group.
- Have understandable instructions.
- Provide encouraging feedback.
- Support progressive difficulty.
- Record meaningful game performance.
- Work on mobile, tablet and desktop browsers.
- Support accessibility preferences.
- Encourage improvement without comparing children against one another.

**Important distinction:** MindQuest provides opportunities to practise cognitive skills. Game performance alone cannot establish improved general intelligence, academic achievement or the presence or absence of a learning difficulty.

---

## 3. Developmental Bands

| World | Age band | Design approach |
|-------|----------|-----------------|
| Young Explorers | 5–7 | Simple, colourful, visual and highly guided |
| Senior Explorers | 8–10 | More independent, increasingly complex challenges |
| Discoverers | 11–13 | Investigation, multi-step puzzles and changing rules |
| Masters | 14–16 | Abstract reasoning, strategic thinking and complex planning |

Age is calculated using the child's date of birth.

The same underlying game mechanic may be reused across age groups, but the instructions, content, rules, visuals and mental demands must be adapted.

---

## 4. Expanded Game Catalogue

### Module A: Memory Lab

**Primary purpose:** Practise remembering, retaining and retrieving information.

#### 1. The Memory Market
Children study a shopping list, then visit a virtual market and select the remembered items.

- **Age adaptations:** 5–7 remembers a few illustrated items; 8–10 remembers longer lists; 11–13 remembers categories and quantities; 14–16 handles multi-part shopping requirements and delayed recall.
- **Measures:** Correct recall, omissions and incorrect selections.

#### 2. Rhythm Master
Children listen to or watch a sequence of beats and reproduce it in the correct order.

- **Age adaptations:** Short beats for 5–7; longer patterns for 8–10; complex rhythms for 11–13; layered sequences and changing tempos for 14–16.
- **Measures:** Sequence accuracy, order errors and missed beats.

#### 3. The Change Detective
Children study a scene, then identify objects that have disappeared, moved or changed.

- **Age adaptations:** One obvious change for 5–7; several changes for 8–10; more similar objects for 11–13; complex spatial changes for 14–16.
- **Measures:** Changes identified, false selections and omissions.

#### 4. Path Keeper
A route is displayed briefly, hidden and then reproduced by the child.

- **Age adaptations:** Short routes for 5–7; longer routes for 8–10; branching routes for 11–13; complex routes with checkpoints for 14–16.
- **Measures:** Correct steps, route accuracy and completion.

### Module B: Focus Academy

**Primary purpose:** Practise sustained attention, selective attention and response control.

#### 5. Signal Hunters
Children identify specific symbols while ignoring distractors.

- **Age adaptations:** One target for 5–7; multiple target features for 8–10; similar-looking distractors for 11–13; multiple target classes for 14–16.
- **Measures:** Correct detections, missed targets and false alarms.

#### 6. Traffic Control
Children manage traffic at a fictional intersection, directing vehicles safely while monitoring changing conditions.

- **Age adaptations:** One crossing for 5–7; two lanes for 8–10; multiple approaches for 11–13; interacting traffic constraints for 14–16.
- **Measures:** Safe passages, missed events and rule errors.

#### 7. Stop, Think, Go!
Children move or withhold a response according to signals. Later rounds introduce exceptions and changing rules.

- **Age adaptations:** Simple stop/go signals for 5–7; additional rules for 8–10; reversed rules for 11–13; conditional rules for 14–16.
- **Measures:** Correct responses, correct withholds and rule-switch errors.

#### 8. Follow the Clues
Children follow one or more moving objects as they swap positions among other objects.

- **Age adaptations:** One slow-moving target for 5–7; more swaps for 8–10; distractions for 11–13; multiple targets for 14–16.
- **Measures:** Correct target identification and tracking accuracy.

### Module C: Logic Kingdom

**Primary purpose:** Practise logical reasoning, deduction, pattern recognition and problem-solving.

#### 9. Codebreaker
Children use clues to discover a hidden combination of numbers, symbols or colours.

- **Age adaptations:** Simple patterns for 5–7; short codes for 8–10; multi-clue codes for 11–13; complex interacting constraints for 14–16.
- **Measures:** Attempts, clue usage and correct solutions.

#### 10. The Invention Lab
Children connect gears, switches and other components to make a fictional machine work.

- **Age adaptations:** Complete a simple connection for 5–7; connect a sequence for 8–10; combine components for 11–13; solve constrained systems for 14–16.
- **Measures:** Successful configurations, attempts and constraints satisfied.

#### 11. Shape Shifters
Children rotate, flip and rearrange shapes to reproduce a target design.

- **Age adaptations:** Large simple shapes for 5–7; more pieces for 8–10; irregular shapes for 11–13; abstract transformations for 14–16.
- **Measures:** Correct placement, moves and solution completion.

#### 12. Mystery Files
Children investigate fictional mysteries by examining evidence, eliminating possibilities and selecting the best-supported explanation.

- **Age adaptations:** Picture mysteries for 5–7; story clues for 8–10; competing explanations for 11–13; multi-stage cases for 14–16.
- **Measures:** Clues examined, explanations eliminated and conclusions supported by evidence.

### Module D: Brain Speed

**Primary purpose:** Practise efficient recognition, classification and response. Accuracy must remain important.

#### 13. Sorting Factory
Children sort items into categories while the sorting rules become progressively more complex or change.

- **Age adaptations:** Two obvious categories for 5–7; several categories for 8–10; rule changes for 11–13; combined rules for 14–16.
- **Measures:** Correct sorting, classification errors, omissions and response efficiency.

#### 14. Quick Connections
Children identify relationships between symbols, objects and patterns, then select the matching relationship.

- **Age adaptations:** Matching identical items for 5–7; functional relationships for 8–10; analogies for 11–13; abstract relationships for 14–16.
- **Measures:** Correct answers, error patterns and response efficiency.

#### 15. Number Sense Challenge
Children estimate quantities, compare values and identify approximate numerical answers.

- **Age adaptations:** Small quantities for 5–7; larger estimates for 8–10; fractions and proportions for 11–13; percentages, ratios and practical estimation for 14–16.
- **Measures:** Estimation accuracy, accepted answer ranges and response time where appropriate.

### Module E: Strategy Island

**Primary purpose:** Practise planning, working memory, decision-making and flexible problem-solving.

#### 16. Tower Architect
Children construct a stable tower or structure using limited materials and constraints.

- **Age adaptations:** Simple stacking for 5–7; stable structures for 8–10; multiple constraints for 11–13; optimisation challenges for 14–16.
- **Measures:** Stability, constraints met, materials used and attempts.

#### 17. Expedition Planner
Children plan an expedition while managing limited energy, supplies, time and route choices.

- **Age adaptations:** Simple route choices for 5–7; basic resources for 8–10; multiple resources for 11–13; interacting constraints for 14–16.
- **Measures:** Route decisions, resources allocated, objectives completed and constraint violations.

#### 18. Robot Programmer
Children arrange instructions to guide a robot through an environment and complete a mission.

- **Age adaptations:** Directional arrows for 5–7; longer sequences for 8–10; loops and conditions for 11–13; complex instruction systems for 14–16.
- **Measures:** Instruction sequences, successful completion, errors and solution efficiency.

#### 19. Rescue Mission
Children plan a sequence of actions and use available tools and routes to rescue fictional characters.

- **Age adaptations:** Simple tool selection for 5–7; short action sequences for 8–10; multi-stage challenges for 11–13; resource and constraint management for 14–16.
- **Measures:** Correct action sequence, objectives achieved and resources used.

#### 20. The Next Move
Children make strategic decisions while considering possible future outcomes.

- **Age adaptations:** Simple next-step choices for 5–7; short plans for 8–10; anticipating responses for 11–13; longer strategic planning for 14–16.
- **Measures:** Decisions, move sequences, objective outcomes and revisions.

---

## 5. Recommended First 10 Games

Picture Pairs is already part of the original catalogue. It remains in the first development group as the initial memory-game prototype.

| Priority | Game | Module | Primary skill |
|----------|------|--------|---------------|
| 1 | Picture Pairs | Memory Lab | Memory |
| 2 | The Memory Market | Memory Lab | Memory |
| 3 | Stop, Think, Go! | Focus Academy | Executive function |
| 4 | Shape Shifters | Logic Kingdom | Reasoning |
| 5 | Codebreaker | Logic Kingdom | Reasoning |
| 6 | Robot Programmer | Strategy Island | Executive function |
| 7 | The Change Detective | Memory Lab | Memory |
| 8 | Sorting Factory | Brain Speed | Processing efficiency |
| 9 | Tower Architect | Strategy Island | Executive function |
| 10 | Mystery Files | Logic Kingdom | Reasoning |

### Recommended implementation waves

**Wave 1: Core prototypes**
- Picture Pairs
- The Memory Market
- Stop, Think, Go!

**Wave 2: Different interaction mechanics**
- Shape Shifters
- Codebreaker
- Robot Programmer

**Wave 3: Catalogue expansion**
- The Change Detective
- Sorting Factory
- Tower Architect
- Mystery Files

The first wave should establish the reusable game architecture before expanding the catalogue.

---

## 6. Shared Game Requirements

Every mini-game should use a common game experience where appropriate:

1. Introduction
2. Instructions
3. Practice round
4. Main challenge
5. Feedback
6. Reward
7. Next step

A game may combine some of these stages, but the child must always understand the objective and know how to exit.

### Common game states

Use explicit states such as:

- `loading`
- `intro`
- `instructions`
- `practice`
- `playing`
- `paused`
- `completed`
- `results`
- `interrupted`

The game must prevent duplicate completion and reward events.

### Shared controls

Where appropriate:

- Exit
- Pause
- Restart
- Sound control
- Help or hints
- Progress indicator

Avoid filling simple games with unnecessary controls.

---

## 7. Scoring and Adaptive Difficulty

Each game must have its own scoring model.

Potential performance measures include:

- Accuracy
- Correct sequence positions
- Missed targets
- False selections
- Number of attempts
- Hints used
- Completion
- Response time where relevant
- Planning constraints met
- Solution efficiency

**XP and performance must be kept separate.** XP is a motivational reward, not a cognitive score.

### Adaptive difficulty

The initial version should use a deterministic, rules-based system.

Illustrative rules:

- Repeated successful attempts may increase one difficulty variable.
- Repeated difficulty may trigger a hint, demonstration or simpler challenge.
- Mixed performance may maintain the current level.
- Strong performance across multiple sessions may unlock more complex challenges.
- A decline in performance should result in supportive practice, not punishment.

Possible difficulty variables include:

- Number of objects.
- Sequence length.
- Distractor similarity.
- Number of steps.
- Number of constraints.
- Rule-switch frequency.
- Route complexity.
- Preview duration.

Do not automatically interpret slow responses as poor attention or low ability. Device lag and network delays must not be counted as the child's performance.

---

## 8. Technical Requirements

### Planned architecture

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Main application | Next.js | Routing and application structure |
| Interface | React | Dashboards and shared components |
| Programming language | TypeScript | Types and game contracts |
| Styling | Tailwind CSS | Responsive interface |
| Game engine | Phaser 3 | Interactive mini-games |
| Authentication | Supabase Auth | Parent login |
| Database | Supabase PostgreSQL | Profiles, games and sessions |
| Source control | GitHub | Version history |
| AI-assisted development | Google AI Studio | Code generation and iteration |
| Deployment | Vercel | Hosting |

### Architecture principle

React and Next.js should manage the application and dashboards.  
Phaser should manage the game scene and mechanics.

Do not create a completely separate application for every game. Develop a reusable game shell with independent game implementations.

### Proposed project structure

```
mindquest/
  components/
    games/
      GameShell.tsx
      GameIntro.tsx
      GameInstructions.tsx
      GameResults.tsx
  games/
    registry.ts
    memory-lab/
      picture-pairs/
      memory-market/
      rhythm-master/
      change-detective/
      path-keeper/
    focus-academy/
      signal-hunters/
      traffic-control/
      stop-think-go/
      follow-the-clues/
    logic-kingdom/
      codebreaker/
      invention-lab/
      shape-shifters/
      mystery-files/
    brain-speed/
      sorting-factory/
      quick-connections/
      number-sense/
    strategy-island/
      tower-architect/
      expedition-planner/
      robot-programmer/
      rescue-mission/
      the-next-move/
  engine/
    session/
    scoring/
    difficulty/
    rewards/
```

This is an architectural guide, not a requirement to restructure an already working application unnecessarily.

---

## 9. Data Requirements

Each game session should record:

- Session ID
- Parent and child relationship
- Child ID
- Game ID
- Game version
- Age variant
- Difficulty configuration
- Start and end timestamps
- Completion status
- Game-specific performance measures
- Hints used
- XP awarded
- Interruption or error information

All child-specific records must be protected using Supabase Row Level Security and server-side authorisation.

Do not record voice, video or precise location for these games.

---

## 10. Accessibility Requirements

All games should:

- Work on supported mobile, tablet and desktop screen sizes.
- Support touch controls.
- Support keyboard navigation where appropriate.
- Avoid colour-only instructions.
- Include visual alternatives to essential audio.
- Support sound off.
- Respect reduced-motion preferences where possible.
- Provide readable instructions.
- Allow safe pause and exit.

### Special considerations

| Game | Important accessibility consideration |
|------|---------------------------------------|
| Rhythm Master | Visual alternative to sound |
| Follow the Clues | Reduced-motion alternative |
| Shape Shifters | Forgiving touch manipulation |
| Sorting Factory | Untimed or relaxed mode |
| Stop, Think, Go! | Adjustable response windows |
| Picture Pairs | Large touch targets |

---

## 11. Testing and Acceptance Criteria

A game is not complete merely because its screen looks attractive.

Before marking it implemented, confirm:

- Core gameplay works.
- Instructions are understandable.
- Practice and main rounds work.
- Scoring is documented and reproducible.
- Difficulty settings behave as intended.
- Supported age variants are tested.
- Results are saved to the correct child.
- Repeated submissions do not award duplicate rewards.
- Pause, exit and interruption work.
- Mobile and desktop behaviour is checked.
- Accessibility requirements are reviewed.
- No child can access another child's records.

### Game-specific essential tests

| Game | Essential check |
|------|-----------------|
| Picture Pairs | Match and mismatch logic works |
| Memory Market | Recall, omissions and incorrect selections are distinguished |
| Stop, Think, Go! | Rule changes are applied correctly |
| Shape Shifters | Rotation and placement work on touch and mouse |
| Codebreaker | Every puzzle has a valid, logically consistent solution |
| Robot Programmer | Instructions execute in the correct sequence |
| Change Detective | Every introduced change can be identified |
| Sorting Factory | Sorting rules and category changes work |
| Tower Architect | Stability and construction constraints are consistent |
| Mystery Files | Conclusions are supported by the clues |

---

## 12. Implementation Milestones

### Milestone A: Shared game foundation
Develop the game shell, registry, session lifecycle, instructions, results and secure child context.  
**Exit condition:** A sample Phaser game can launch, complete, save and return to the correct child world.

### Milestone B: First prototype group
Implement Picture Pairs, The Memory Market and Stop, Think, Go!  
**Exit condition:** All three work, have distinct mechanics and save appropriate session data.

### Milestone C: Interaction variety
Implement Shape Shifters, Codebreaker and Robot Programmer.  
**Exit condition:** The shared architecture supports manipulation, deduction and sequencing without major rewrites.

### Milestone D: First catalogue expansion
Implement The Change Detective, Sorting Factory, Tower Architect and Mystery Files.  
**Exit condition:** All ten priority games are reviewed and ready for controlled usability testing.

### Milestone E: Remaining game catalogue
Add the other eleven concepts in order of product value and technical readiness:

- Rhythm Master
- Path Keeper
- Signal Hunters
- Traffic Control
- Follow the Clues
- The Invention Lab
- Quick Connections
- Number Sense Challenge
- Expedition Planner
- Rescue Mission
- The Next Move

### Milestone F: Refinement
Use testing feedback to improve instructions, difficulty, performance, accessibility and parent reporting.

---

## 13. Pilot Evaluation

Before making the games widely available, test them with children from the intended age bands, subject to appropriate parental consent and safeguarding arrangements.

Observe:

- Whether children understand the instructions.
- Whether they can complete the practice round.
- Whether controls work on their devices.
- Whether they understand the feedback.
- Whether they voluntarily return to the games.
- Whether difficulty changes are fair.
- Whether parents understand the reports.
- Whether sessions are saved reliably.

A pilot group of approximately 30–50 children may be considered.

Game-score improvement alone must not be used to claim general cognitive or academic improvement.

---

## 14. Definition of a Completed Game

A game can be marked **implemented** only when its core gameplay, rules, scoring, age variants, session recording, responsiveness and acceptance tests have been completed.

It can be marked **pilot-ready** only after child usability testing and safeguarding review.

It can be marked **released** only after the production deployment and relevant monitoring have been verified.

These statuses must not be used interchangeably.

---

## 15. Instructions for Google AI Studio

Use this document alongside the main MindQuest PRD.

Do not ask Google AI Studio to build all 20 games in one prompt.

For each game:

- Inspect the existing codebase.
- Confirm the game ID, module, cognitive domain and age variants.
- Reuse the existing game shell.
- Implement only the selected game.
- Keep its logic separate from the parent portal and database code.
- Add the game's scoring and difficulty configuration.
- Test the game at its supported screen sizes.
- Test child-session attribution.
- Run available checks.
- Report what works, what remains a placeholder and what was actually tested.

### First game development prompt

```
Read the main MindQuest Product Requirements Document and the
MindQuest Game Catalogue and Mini-Game Requirements Document.

Inspect the existing codebase before making any changes.

For this task, implement only the shared game foundation and
the first playable game, Picture Pairs.

Requirements:

1. Integrate Phaser 3 with the existing Next.js and React project.
2. Create a reusable game shell.
3. Create a central game registry.
4. Implement Picture Pairs as a complete playable game.
5. Support the four developmental bands:
   5–7, 8–10, 11–13 and 14–16.
6. Ensure age variants have meaningful differences in content
   and challenge, not merely different timers.
7. Support touch, mouse and keyboard where appropriate.
8. Create a documented game-specific scoring model.
9. Keep XP rewards separate from game performance.
10. Prepare a typed session-result structure.
11. Do not fabricate Supabase integration.
12. If Supabase is not configured, use a clearly labelled
    local development adapter.
13. Preserve existing working features.
14. Do not implement the remaining games in this task.

Before finishing, report:

- Files created or changed.
- How to launch the game.
- Which age variants work.
- What is genuinely functional.
- What remains a placeholder.
- Tests performed and their actual results.
- Any configuration still required.
```

---

## 16. Final Product Recommendation

The most important architectural decision is to build a reusable game platform, not 20 unrelated mini-applications.

Each game should have its own mechanics, rules and scoring, but share the same underlying infrastructure for:

- Launching and exiting games.
- Instructions and practice rounds.
- Child profile context.
- Session recording.
- Rewards.
- Progress tracking.
- Accessibility controls.

That will make it easier to expand MindQuest beyond the initial 20 games without rebuilding the application every time.

The immediate development target should be the shared game foundation and the first three prototypes, not the full catalogue.
