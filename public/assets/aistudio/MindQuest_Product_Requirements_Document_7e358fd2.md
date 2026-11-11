# MindQuest

## Product Requirements Document (PRD)

**Version:** 1.0\
**Date:** 11 November 2026\
**Status:** Product definition and implementation guidance\
**Product tagline:** *Play. Think. Discover. Grow.*

------------------------------------------------------------------------

## 1. Executive Summary

MindQuest is a responsive, browser-based cognitive development gaming
platform for children aged 5--16. It uses short, engaging,
age-appropriate games and missions to help children practise specific
cognitive skills, including memory, attention, reasoning, processing
speed, cognitive flexibility and executive function.

A parent owns the account and can create multiple independent child
profiles. The parent signs in, selects a child profile and gives that
child access to their own age-appropriate game environment. Children do
not need separate email addresses or independent login accounts.

MindQuest will launch in English with globally neutral content. It will
be developed using an AI-assisted workflow centred on Google AI Studio,
GitHub and Vercel.

The product should be engaging and encouraging without making
unsupported claims about increasing intelligence, diagnosing learning
conditions or guaranteeing improved school results.

## 2. Product Vision

Make purposeful cognitive practice engaging and accessible to children
through play.

### Product objectives

1.  Provide children with enjoyable opportunities to practise different
    cognitive skills.
2.  Offer age-appropriate experiences for children aged 5--16.
3.  Adapt game difficulty in response to each child's demonstrated
    performance.
4.  Give parents understandable information about each child's
    participation and progress.
5.  Encourage consistent, balanced use without promoting excessive
    screen time.
6.  Build a secure platform that can grow in game content and features
    over time.

### Product positioning

MindQuest is a general cognitive development platform. Reading-related
activities may be included, but reading is not the product's central
identity.

### Tagline

**Play. Think. Discover. Grow.**

## 3. Goals and Non-Goals

### Goals

-   Deliver a responsive web application that works on desktop, tablet
    and mobile browsers.
-   Support one parent account with multiple independent child profiles.
-   Assign each child to an age-appropriate experience using date of
    birth.
-   Provide five game modules covering six cognitive domains.
-   Support game-specific difficulty progression.
-   Record activity and game performance for parent reporting.
-   Provide a safe, private and accessible child experience.
-   Establish an architecture that supports future PWA and offline
    capabilities.

### Non-goals for the initial release

-   Native iOS or Android applications.
-   Public child profiles, social feeds, chat or direct messaging.
-   Behavioural advertising or location tracking.
-   Clinical diagnosis or screening for ADHD, dyslexia or other
    conditions.
-   IQ testing or a single overall intelligence score.
-   A machine-learning-based adaptive engine in the MVP.
-   Building all 60 planned game experiences before validating the core
    product.
-   Institutional or school administration features in the first
    release.

## 4. Target Users

### Primary users: Children aged 5--16

MindQuest has three main age worlds, with an additional developmental
split inside Explorers.

  ------------------------------------------------------------------------
  World                                          Age Developmental
                                                     experience
  --------------------- ---------------------------- ---------------------
  Explorers                                    5--10 Playful, visual,
                                                     simple instructions
                                                     and short activities

  Young Explorers                               5--7 Internal sub-band of
                                                     Explorers; highly
                                                     visual and guided

  Senior Explorers                             8--10 Internal sub-band of
                                                     Explorers; more
                                                     complex patterns and
                                                     instructions

  Discoverers                                 11--13 Mystery,
                                                     investigation,
                                                     multi-step puzzles
                                                     and rule changes

  Masters                                     14--16 Strategy, abstract
                                                     reasoning, planning
                                                     and complex decisions
  ------------------------------------------------------------------------

The four operational developmental bands are 5--7, 8--10, 11--13 and
14--16.

### Secondary users: Parents and guardians

Parents create and manage the account, add children, select child
profiles, control usage and review reports.

### Future users

Schools, learning centres and other institutions may be considered in a
later product phase. They are not part of the initial release scope.

## 5. Cognitive Development Framework

MindQuest will provide practice across six distinct cognitive domains.

  -----------------------------------------------------------------------
  Domain                  Description             Possible game measures
  ----------------------- ----------------------- -----------------------
  Memory                  Encoding, storing and   Recall accuracy,
                          retrieving information  sequence recall and
                                                  delayed recall

  Attention               Sustaining and          Target accuracy, missed
                          selectively directing   targets and distractor
                          attention               errors

  Reasoning               Identifying             Correct solutions and
                          relationships, patterns level of problem
                          and logical conclusions complexity

  Processing Speed        Efficiently             Response efficiency and
                          interpreting and        accuracy under
                          responding to           appropriate time
                          information             conditions

  Cognitive Flexibility   Switching between       Accuracy and adjustment
                          rules, perspectives or  after rule changes
                          approaches              

  Executive Function      Planning, working       Planning accuracy, task
                          memory and              completion and ability
                          self-regulation         to follow multi-step
                                                  goals
  -----------------------------------------------------------------------

These domains must be reported separately. MindQuest must not combine
them into an IQ score or imply that a game score is a clinical
assessment.

## 6. Product Structure and Game Modules

The initial product will contain five game modules.

### 6.1 Memory Lab

Purpose: Practise remembering, retaining and retrieving information.

Possible games: - Picture Pairs - Hidden Treasure - Remember the
Sequence - Sound Recall - Story Recall - Reverse Recall - Delayed Recall

### 6.2 Focus Academy

Purpose: Practise sustained and selective attention, including
responding to changing rules.

Possible games: - Target Hunter - Colour Switch - Sound Detective -
Focus Trail - Rule Switch - Spot the Difference - Multi-Target Tracking

### 6.3 Logic Kingdom

Purpose: Practise pattern recognition, deduction and logical
problem-solving.

Possible games: - Pattern Detective - Number Patterns - Shape Logic -
Complete the Sequence - Odd One Out - Evidence Solver - Solve the
Mystery - Cause and Effect

### 6.4 Brain Speed

Purpose: Practise efficient visual recognition, classification and
response.

Possible games: - Quick Match - Rapid Recognition - Symbol Search - Fast
Sorting - Visual Comparison - Reaction Challenge - Rapid Classification

Speed must not be rewarded at the expense of accuracy or accessibility.
A slow response must not automatically be interpreted as poor attention
or ability.

### 6.5 Strategy Island

Purpose: Practise planning, working memory, decision-making and flexible
problem-solving.

Possible games: - Plan the Route - Resource Manager - Build a Bridge -
Escape the Maze - Switch the Rules - Mission Planner - Strategic
Allocation

## 7. Age-Specific Game Design

The platform must not simply display the same game with a different
difficulty setting for every age. Age bands should receive meaningfully
different instructions, content, mechanics and visual treatment.

### 7.1 Young Explorers: ages 5--7

-   Friendly characters, colourful environments and simple visual
    storytelling.
-   Large touch targets and minimal reading.
-   Clear, short instructions supported by visual demonstrations.
-   Audio may support instructions but must never be the only way to
    understand a task.
-   Activities typically lasting approximately 1--4 minutes.
-   Examples: picture matching, hidden objects, simple sequences, shape
    patterns and simple mazes.

### 7.2 Senior Explorers: ages 8--10

-   Playful adventure environments with more detailed challenges.
-   More complex sequences, patterns and instructions.
-   A gradual increase in independent problem-solving.
-   Activities typically lasting approximately 1--4 minutes.
-   Examples: sequence recall, target finding, number patterns and route
    planning.

### 7.3 Discoverers: ages 11--13

-   Mystery, detective and exploration themes.
-   Multi-step puzzles, clues, evidence and rule switching.
-   Greater emphasis on working memory, sustained attention and logical
    reasoning.
-   Activities typically lasting approximately 3--6 minutes.

### 7.4 Masters: ages 14--16

-   Sophisticated strategic environments and less childish visual
    treatment.
-   Abstract thinking, complex planning, decision-making and resource
    management.
-   More demanding multi-step tasks and adaptive challenges.
-   Activities typically lasting approximately 5--10 minutes.

### Age assignment

-   Collect the child's date of birth when the profile is created.
-   Calculate the child's current age from the date of birth.
-   Assign the appropriate developmental band automatically.
-   Do not rely on a manually entered age that becomes outdated.
-   Recalculate age eligibility over time.
-   When a child moves into another band, transition the experience
    without deleting historical progress.
-   Provide a clear parent-facing explanation when a transition occurs.

## 8. Accounts, Roles and Permissions

### 8.1 Parent account

A parent account should support: - Full name - Email address -
Password - Required terms acceptance and applicable parental consent -
Account recovery - Account settings - Subscription information when
subscriptions are introduced

### 8.2 Child profile

A parent can create multiple child profiles. Each profile should contain
only the information needed to operate the product:

-   Display name or first name
-   Date of birth
-   Avatar
-   Optional accessibility preferences
-   Language preference (English at launch)

Each child profile must have independent: - Game environment - Game and
activity history - Difficulty progression - Achievements and rewards -
Assessment or baseline history - Daily missions - Progress reports

Children do not need separate email addresses or passwords.

### 8.3 Parent permissions

Parents can: - Create, edit and manage their child profiles. - Select
which child profile enters the game environment. - View each child's
activity and reports. - Set daily usage limits. - Manage account and
subscription settings. - Request account or child-data deletion, subject
to applicable legal and operational requirements.

### 8.4 Child permissions

Children can: - Access their own game world after the parent selects
their profile. - Play available games and missions. - View their own
achievements and progress. - Adjust permitted game preferences.

Children must not access: - Parent payment information. - Parent account
settings. - Other children's profiles or records. - Administrative
functions.

Use a parent-controlled exit or profile-switching control. Do not rely
only on hiding navigation links to protect sibling profiles.

## 9. User Journeys

### 9.1 Parent onboarding

1.  Parent visits MindQuest.
2.  Parent creates an account or signs in.
3.  Parent reviews and accepts the applicable terms and consent notices.
4.  Parent creates one or more child profiles.
5.  Parent enters each child's date of birth and selects an avatar.
6.  The system assigns the appropriate age band.
7.  Parent arrives at the dashboard.
8.  Parent selects a child profile to begin.

### 9.2 Child gameplay

1.  Parent selects a child profile.
2.  Child enters their age-appropriate world.
3.  Child sees available games and recommended missions.
4.  Child opens a game and receives an introduction.
5.  The game explains the rules and provides a practice round where
    appropriate.
6.  Child completes the challenge.
7.  The game provides encouraging feedback and an appropriate reward.
8.  Performance is saved against that child's profile.
9.  The system selects an appropriate next challenge.

### 9.3 Parent progress review

1.  Parent signs in.
2.  Parent opens the dashboard.
3.  Parent selects a child.
4.  Parent reviews recent activity and progress across the six domains.
5.  Parent reviews suggested practice activities and usage information.

## 10. Application Screens and Functional Requirements

### 10.1 Public website

Required screens: - Home - About - How It Works - Worlds - Pricing -
Frequently Asked Questions - Registration - Login

The homepage should explain the product, show the three age worlds,
introduce the cognitive domains, explain how it works and provide clear
registration calls to action.

### 10.2 Parent portal

Required screens: - Registration - Login - Password recovery -
Onboarding - Parent dashboard - Child profile management - Child
details - Progress reports - Activity history - Daily usage limits -
Subscription - Account settings

The parent dashboard should show each child independently. It may
include recent activity, games completed, playtime and progress
indicators. Do not present invented demo scores as actual results.

### 10.3 Child portal

Required screens: - Child profile selection - Welcome screen - World map
or world landing page - Game library - Game introduction -
Instructions - Practice round - Main game - Results and feedback -
Achievements - Daily missions - Personal progress

The child portal must feel like a game environment, not a school
administration portal.

### 10.4 Administrative tools

Game management, content management, user administration and
subscription administration may be introduced after the core platform is
validated. They are not required for the first application foundation.

## 11. Game Session Requirements

Each game should support the following sequence where appropriate:

1.  Introduction
2.  Instructions
3.  Practice round
4.  Main challenge
5.  Feedback
6.  Reward
7.  Next step or return to the world

Game sessions should record, where relevant: - Child profile
identifier - Game and module identifiers - Start and completion
timestamps - Difficulty level - Accuracy - Response time, where
appropriate - Attempts - Error types - Hints used - Completion status -
Reward earned - Game version

The platform should handle interrupted sessions gracefully. A network
interruption should not silently attribute one child's session to
another profile.

## 12. Adaptive Difficulty

### MVP approach

Use a deterministic, rules-based adaptive difficulty engine. Do not
introduce machine learning into the first version.

Each game should have its own difficulty scale and challenge dimensions.
Difficulty must be adapted within the child's age-appropriate
experience.

### Illustrative rules

-   Three consecutive successful attempts may trigger a small increase
    in challenge.
-   Repeated errors or signs of difficulty should trigger simpler
    challenges, hints or scaffolding.
-   Mixed performance should generally maintain the current level while
    more evidence is gathered.
-   Strong performance across multiple sessions may unlock more complex
    challenges.
-   A decline in performance should lead to supportive practice, not
    punishment.

### Inputs

Where relevant, consider: - Accuracy - Response time - Error type -
Number of attempts - Retention after a delay - Performance across
multiple sessions - Age band - Accessibility preferences - Repeated
exposure to the same content - Fatigue or session length - Device
performance and network interruptions

Do not automatically interpret slow responses as poor attention or low
ability. Do not use one session to make broad conclusions about a child.

## 13. Missions, Rewards and Progression

### Rewards

Use positive reinforcement for: - Completing a challenge - Accuracy -
Attempting a more difficult level - Personal improvement - Completing a
daily mission

An illustrative reward model for testing is: - Challenge completion: 10
XP - High accuracy: +5 XP - Difficult level: +10 XP - Personal
improvement: +10 XP - Daily mission: +15 XP

These values are provisional and should be tuned through testing.

### Progression environments

Potential environments include: - Memory Forest - Focus Mountain - Logic
Castle - Speed City - Strategy Island

Children should be encouraged to beat their own personal bests rather
than compete against other children.

### Daily missions

Missions may combine short activities from different cognitive domains.
An optional total play target of approximately 10--20 minutes per day
may be explored, with shorter sessions for younger children and
appropriate breaks.

The product must not encourage excessive screen time or pressure
children to continue playing.

## 14. Assessment and Parent Reporting

### Starting assessment

An optional game-like baseline experience may sample the six cognitive
domains. It should feel like a set of introductory games rather than a
school examination.

It must not be described as an IQ test, diagnostic tool or clinical
assessment.

### Parent reports

Reports should show the six domains separately and use understandable
descriptions.

  Domain                  Possible report indicators
  ----------------------- --------------------------------------------
  Memory                  Recall accuracy and retention
  Attention               Target accuracy and missed responses
  Reasoning               Correct solutions and challenge complexity
  Processing Speed        Response efficiency on appropriate tasks
  Cognitive Flexibility   Performance when rules change
  Executive Function      Planning accuracy and task completion

### Weekly report

A weekly report may include: - Games played - Time spent - Activities
completed - Consistent areas of performance - Areas that may benefit
from further practice - Changes over time - Suggested activities

Reports should: - Use supportive, factual language. - Show trends across
multiple sessions rather than overemphasising a single result. - Explain
what each indicator measures. - Avoid comparisons with other children. -
Distinguish observed game performance from claims about real-world
ability. - Clearly identify insufficient data.

## 15. Visual Design and User Experience

### Brand

-   Name: MindQuest
-   Tagline: Play. Think. Discover. Grow.

### Proposed colour palette

  Colour       Hex             Suggested use
  ------------ --------------- -------------------------------------
  Deep Navy    `#172554`       Primary brand colour and navigation
  Teal         `#14B8A6`       Positive actions and highlights
  Amber        `#FBBF24`       Rewards and important highlights
  Violet       `#8B5CF6`       Secondary accents
  White        `#FFFFFF`       Main surfaces
  Light Grey   To be defined   Backgrounds and dividers
  Coral        To be defined   Select warnings and notices

### Typography

-   Nunito for friendly headings and child-facing interfaces.
-   Inter for parent dashboards, reports and professional interface
    text.

### Visual personalities

**Parent portal** - Clean, professional and modern. - Clear information
hierarchy. - Easy-to-understand progress indicators.

**Explorers** - Colourful, playful and illustrated. - Friendly
characters and adventure-map navigation. - Large touch controls and
minimal text for younger children.

**Discoverers** - Mystery, investigation, clues and exploration. - More
detailed information and multi-step interactions.

**Masters** - Sophisticated, strategic and modern. - Abstract or
futuristic elements without childish styling.

### Responsive design

Proposed breakpoints: - Desktop: 1024px and above - Tablet:
768--1023px - Mobile: below 768px

Do not merely shrink desktop layouts for mobile. Design mobile
navigation and game interactions intentionally. Game canvases must
resize correctly and support touch, mouse and keyboard where
appropriate.

## 16. Accessibility Requirements

-   Keyboard navigation for supported interfaces.
-   Readable colour contrast.
-   Large, touch-friendly controls for younger children.
-   Adjustable sound.
-   Reduced-motion support.
-   Clear visual instructions.
-   Audio must not be the only way to receive essential instructions.
-   Avoid relying on colour alone to communicate important information.
-   Provide appropriate text alternatives for meaningful visual
    elements.
-   Test layouts and interactions at common mobile and tablet sizes.

## 17. Privacy, Security and Safeguarding

MindQuest is designed for children, so privacy and security must be
foundational requirements.

### Requirements

-   Parent-owned accounts and applicable parental consent.
-   Collect only information necessary to provide the service.
-   No public child profiles.
-   No direct messaging or public social interaction in the MVP.
-   No location tracking.
-   No behavioural advertising.
-   No unnecessary personal information.
-   Secure authentication and authorisation.
-   Parent-controlled access to child information.
-   Data retention and deletion procedures.
-   Secure handling of child records and game activity.
-   No exposure of Supabase service-role credentials in client-side
    code.

### Database security

Use Supabase Row Level Security (RLS) to ensure that: - A parent can
access only their own account. - A parent can access only child profiles
linked to that parent. - Child game sessions, achievements and reports
are scoped to the correct child and parent. - A child cannot access
sibling data by changing a URL, identifier or client-side request. -
Privileged operations are performed securely on the server.

### Regulatory review

Before launch, review applicable requirements, including the Nigeria
Data Protection Act 2023 and relevant child-data requirements. If the
product serves users in other jurisdictions, assess applicable rules
such as COPPA in the United States and GDPR requirements in relevant
European markets.

Obtain appropriate legal and privacy advice before collecting real
children's data.

### Voice and recordings

Avoid voice recording features in the MVP. Any later speech-related
feature must have a clear educational purpose, appropriate consent and a
defined retention policy.

## 18. Technical Architecture

### Planned technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Application             Next.js                 Main web application
                                                  and routing

  UI                      React                   Reusable interface
                                                  components

  Language                TypeScript              Type safety and
                                                  maintainability

  Styling                 Tailwind CSS            Responsive styling

  Database                Supabase PostgreSQL     Application data

  Authentication          Supabase Auth           Parent authentication

  Game engine             Phaser 3                Interactive 2D
                                                  mini-games

  Animation               Rive (optional)         Selected interface and
                                                  character animations

  Source control          GitHub                  Version control

  Development             Google AI Studio        AI-assisted code
                                                  generation and
                                                  iteration

  Hosting                 Vercel                  Web application
                                                  deployment

  Future offline support  PWA, service worker and Caching and session
                          IndexedDB               synchronisation
  -----------------------------------------------------------------------

### Architectural principles

-   React and Next.js manage application pages, parent dashboards and
    shared interface elements.
-   Phaser manages interactive game scenes.
-   Keep game logic separate from dashboard and account logic.
-   Use reusable components and clear TypeScript types.
-   Keep secrets and privileged operations on the server.
-   Design the data layer to support additional games and age bands.
-   Do not introduce a full 3D engine for the MVP.
-   Add offline capabilities after the core online experience is stable.

### Proposed application structure

``` text
mindquest/
  app/
    (marketing)/
      page.tsx
      about/
      worlds/
      pricing/
    auth/
      login/
      register/
    parent/
      dashboard/
      children/
      reports/
      settings/
    play/
      select-child/
      explorers/
      discoverers/
      masters/
    admin/
  components/
    navigation/
    parent/
    child/
    games/
    shared/
  games/
    memory-lab/
    focus-academy/
    logic-kingdom/
    brain-speed/
    strategy-island/
  engine/
    scoring/
    adaptive-difficulty/
    assessment/
    progression/
  lib/
    supabase/
    validation/
    utilities/
  public/
    images/
    audio/
    animations/
    icons/
  types/
```

This is a proposed structure, not a requirement to reproduce every
folder immediately. Adjust it to the conventions of the generated
Next.js project.

## 19. Data Model

The initial database design should consider the following entities:

  -----------------------------------------------------------------------
  Entity                              Purpose
  ----------------------------------- -----------------------------------
  Parents                             Parent account and profile
                                      information

  Children                            Child subprofiles linked to parents

  Age Groups                          Developmental bands and age
                                      boundaries

  Cognitive Domains                   The six cognitive domains

  Game Modules                        The five game modules

  Games                               Individual game definitions

  Game Levels / Variants              Age-appropriate game versions and
                                      difficulty levels

  Game Sessions                       Individual play sessions and
                                      performance records

  Assessments                         Baseline or other supported
                                      assessment records

  Achievements                        Available rewards and achievements

  Child Achievements                  Rewards earned by individual
                                      children

  Daily Missions                      Mission definitions and
                                      availability

  Parent Settings                     Usage limits and preferences

  Subscriptions                       Subscription records when billing
                                      is introduced
  -----------------------------------------------------------------------

Every child-specific record must be associated with the correct child
and parent. Enforce relationships and permissions at database level, not
only in the interface.

The exact schema, constraints, indexes, migrations and RLS policies
should be designed and tested before real child data is stored.

## 20. Performance and Reliability

-   The public website and dashboards should load efficiently on common
    mobile connections.
-   Keep game assets appropriately sized and optimised.
-   Avoid loading every game asset before the child opens a game.
-   Handle network loss and interrupted sessions gracefully.
-   Save completed sessions reliably.
-   Prevent duplicate session submissions where possible.
-   Ensure game layouts resize correctly.
-   Test on current mainstream desktop and mobile browsers.
-   Monitor application errors and failed data operations.
-   Do not claim offline functionality until it has been implemented and
    tested.

## 21. Commercial Model

The commercial model is tentative and requires validation with parents
before final pricing.

### Potential freemium model

**Free** - Selected games. - Limited daily challenges. - Basic progress
information. - Potentially one child profile.

**Premium** - Access to all modules. - More missions and challenges. -
Adaptive difficulty. - Detailed progress reports. - Multiple child
profiles. - Expanded parent controls.

**Institutional offering (future)** - A possible plan for schools and
learning centres.

Do not set final subscription prices until willingness-to-pay research
and product testing have been conducted with the intended market.

## 22. Product Success Measures

The pilot should evaluate whether children can use the product, enjoy
returning to it and demonstrate measurable improvement on the specific
tasks being practised.

Potential measures: - Registration and onboarding completion. -
Successful child profile creation and selection. - Game start and
completion rates. - Voluntary return to the platform. - Repeat usage
over time. - Session duration and age-appropriate usage. - Game-specific
accuracy and progression. - Difficulty adjustment behaviour. - Parent
understanding and satisfaction with reports. - Technical errors and
session-save reliability. - Accessibility and usability feedback.

Where real-world transfer is investigated, use appropriate validated
measures and a suitable evaluation design. Account for age, initial
performance, practice time and repeated exposure. Game improvement alone
does not establish general cognitive or academic improvement.

## 23. Development Milestones

The roadmap is milestone-based, not tied to fixed calendar deadlines.
Each milestone must be reviewed and tested before moving forward.

### Milestone 1: Application Foundation

Build: - Public website. - Navigation and shared design system. - Parent
registration and login screens. - Parent onboarding. - Child profile
creation and selection. - Parent dashboard. - Child welcome dashboard. -
Age-specific world landing pages. - Placeholder game library pages. -
Responsive layouts.

Acceptance checks: - All required routes load. - Navigation works. -
Forms validate basic input. - Age band is calculated from date of
birth. - Child profiles are represented independently. - Demo data is
clearly labelled. - No fake authentication or database connection is
presented as operational. - Application builds successfully.

### Milestone 2: Authentication and Database

Build: - Supabase project configuration. - Parent authentication. -
Parent and child database records. - Child-parent relationships. -
Secure data access and RLS policies. - Profile creation, editing and
selection.

Acceptance checks: - Parent registration and login work. - Password
recovery works. - Multiple child profiles can be created. - Each child
has independent records. - A parent cannot access another parent's child
records. - Access restrictions are tested using direct requests, not
just interface navigation.

### Milestone 3: First Playable Games

Build: - Phaser 3 integration. - Game loading and unloading. - Game
session lifecycle. - First Memory Lab game, such as Picture Pairs or
Hidden Treasure. - Age-appropriate variants for the relevant
developmental bands. - Session result storage.

Acceptance checks: - Game works on supported mobile and desktop
browsers. - Touch, mouse and keyboard interactions work where
required. - Game resizes correctly. - Instructions and feedback are
understandable. - Session results are saved to the correct child
profile. - Interrupted sessions are handled safely.

### Milestone 4: Game Catalogue Expansion

Build: - Additional games across the five modules. - Age-appropriate
game variants. - Reusable mechanics and components. - Game content
configuration.

Acceptance checks: - Each game has a clear purpose and cognitive
domain. - Age-band content is appropriate. - Difficulty settings behave
as specified. - New games do not break existing games.

### Milestone 5: Cognitive Engine and Progression

Build: - Game-specific scoring. - Rules-based adaptive difficulty. - XP
and achievements. - Daily missions. - Progression map. - Baseline
game-like assessment where appropriate.

Acceptance checks: - Scoring rules are documented and repeatable. -
Difficulty changes follow tested rules. - Performance is stored per
child and per game. - No single overall intelligence score is
generated. - Children receive supportive feedback.

### Milestone 6: Parent Reports and Controls

Build: - Progress dashboard. - Six separate domain views. - Weekly
activity reports. - Usage limits. - Parent controls. - Data export or
deletion workflows as appropriate.

Acceptance checks: - Reports use real stored records. - Insufficient
data is clearly identified. - Parent can view only their own children's
records. - Usage controls are enforced. - Report language does not make
diagnostic claims.

### Milestone 7: Testing, Pilot and Launch

Build and verify: - Responsive and browser testing. - Accessibility
testing. - Security and privacy review. - Performance testing. - Error
monitoring. - Backup and recovery procedures. - PWA features if ready. -
Pilot onboarding and feedback process.

Pilot proposal: - Begin with a small group, potentially 30--50 children,
subject to consent and safeguarding arrangements. - Observe usability,
engagement, completion, repeat use and technical reliability. - Gather
parent feedback. - Review game-specific performance without overstating
cognitive transfer. - Fix critical issues before wider release.

## 24. Testing Requirements

Testing must cover:

### Functional testing

-   Registration, login and recovery.
-   Parent onboarding.
-   Multiple child profiles.
-   Date-of-birth age assignment.
-   Child selection and exit.
-   Game launch, completion and saving.
-   Rewards and progression.
-   Parent reports and controls.

### Security testing

-   Parent-to-parent data isolation.
-   Parent-to-child relationship enforcement.
-   Sibling profile isolation.
-   RLS policy verification.
-   Server-side validation.
-   Secret and environment-variable handling.
-   Direct API and URL access attempts.

### Usability testing

-   Age-appropriate comprehension.
-   Touch target size.
-   Clear instructions.
-   Parent understanding of reports.
-   Child ability to return to the world map.
-   No confusing or punitive feedback.

### Compatibility testing

-   Mobile, tablet and desktop layouts.
-   Common browsers.
-   Different screen sizes and orientations.
-   Touch, mouse and keyboard support as applicable.
-   Slow or interrupted network connections.

## 25. Key Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                    Potential impact        Mitigation
  ----------------------- ----------------------- -----------------------
  AI-generated code       Unreliable application  Review, run and test
  contains hidden errors                          each milestone

  Scope expands too       Delayed working product Build a small validated
  quickly                                         MVP first

  Weak data permissions   Exposure of children's  RLS, server-side
                          data                    authorisation and
                                                  security tests

  Games are repetitive    Poor engagement         Design distinct
  across age bands                                age-appropriate
                                                  mechanics and content

  Unsupported cognitive   Loss of trust and       Use skill-specific
  claims                  regulatory risk         measures and cautious
                                                  reporting

  Excessive screen time   Poor product experience Short sessions, breaks
                                                  and parent limits

  Unreliable adaptive     Frustrating or unfair   Transparent,
  logic                   difficulty              game-specific rules and
                                                  testing

  Network interruption    Lost or misattributed   Reliable session
                          progress                handling and sync
                                                  design

  Poor mobile performance Reduced accessibility   Optimise assets and
                          and engagement          test on real devices
  -----------------------------------------------------------------------

## 26. Decisions Still to Be Confirmed

The following items require product or implementation decisions before
the relevant milestone:

1.  Final product logo and detailed brand assets.
2.  Whether parent consent requires any additional verification at
    launch.
3.  Exact daily usage-limit defaults and whether parents can customise
    them.
4.  Final free and premium feature boundaries.
5.  Subscription pricing and payment provider.
6.  Whether the initial pilot will be Nigeria-only or include other
    countries.
7.  Which game will be the first playable prototype.
8.  Whether baseline activities will be included in the first public
    release.
9.  Data retention periods and the final deletion process.
10. The exact PWA and offline capabilities to include at launch.

Do not block the first visual application foundation on decisions that
are only needed for later milestones. Record unresolved items and
revisit them before implementation becomes dependent on them.

## 27. Instructions for AI-Assisted Development

Google AI Studio is the primary AI-assisted development environment.
GitHub is the source-control repository and Vercel is the planned
deployment platform.

Use this PRD as the product source of truth. Build one milestone at a
time.

For each milestone:

1.  Read the relevant PRD requirements.
2.  Inspect the existing project before making changes.
3.  Implement only the agreed milestone scope.
4.  Reuse existing components and architecture where appropriate.
5.  Do not replace working features unnecessarily.
6.  Do not invent backend functionality or claim integrations are
    operational when they are not.
7.  Identify assumptions and unresolved decisions.
8.  Run available checks and report their actual results.
9.  Explain changed files and configuration requirements.
10. Stop and report blockers rather than silently skipping requirements.

Do not ask the AI development tool to implement all game experiences,
backend functionality and reporting in one enormous prompt. Use the full
PRD for context and focused build prompts for each milestone.

## 28. Definition of MVP

The MVP should be considered ready for a controlled pilot only when:

-   Parents can register and securely sign in.
-   Parents can create and manage multiple child profiles.
-   Age bands are assigned correctly from date of birth.
-   Parent and child experiences are separated.
-   At least one polished, playable game works reliably.
-   Game sessions are stored against the correct child.
-   Basic progress and activity information is available to parents.
-   Data access controls have been tested.
-   Core flows work on supported mobile and desktop browsers.
-   Privacy, consent and safeguarding arrangements have been reviewed.
-   No critical functional, security or data-loss issues remain.

The MVP does not require all 60 planned game experiences. A small,
reliable and validated product is preferable to a large catalogue of
incomplete games.

------------------------------------------------------------------------

**End of Product Requirements Document**

*This document records the current product direction and proposed
requirements based on the MindQuest planning discussions. Items
explicitly described as proposed, illustrative or awaiting confirmation
are not final product decisions.*
