import React, { useState } from 'react';
import {
  Brain,
  Target,
  Puzzle,
  Zap,
  Shuffle,
  Compass,
  Shield,
  Check,
  ChevronDown,
  Play,
  UserPlus,
} from 'lucide-react';

interface MarketingViewProps {
  onGoToParentPortal: () => void;
  onGoToParentAuth: (mode?: 'signup' | 'signin') => void;
  onGoToChildSelect: () => void;
  signedInParentName?: string | null;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  onGoToParentPortal,
  onGoToParentAuth,
  onGoToChildSelect,
  signedInParentName,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedWorldTab, setSelectedWorldTab] = useState<'explorers' | 'discoverers' | 'masters'>('explorers');

  const faqs = [
    {
      q: 'Does MindQuest replace clinical assessments or claim to boost IQ?',
      a: 'No. MindQuest is an educational practice platform. It offers targeted cognitive mini-games designed to exercise skills like memory, attention, and planning through play. We do not provide clinical diagnoses, screening for ADHD or dyslexia, or generate single IQ scores.',
    },
    {
      q: 'Do children need their own email addresses or passwords?',
      a: 'No. The parent owns the account. Children never need separate emails, passwords, or personal accounts. Parents sign in, select a child profile, and grant access to that child’s age-appropriate game world.',
    },
    {
      q: 'How does MindQuest know which game difficulty is right for my child?',
      a: 'We automatically assign an initial developmental band based on the child’s date of birth. During gameplay, our rules-based adaptive engine dynamically adjusts challenge levels based on accuracy and demonstrated performance.',
    },
    {
      q: 'Is there advertising or location tracking?',
      a: 'Never. MindQuest is strictly ad-free, does not track physical locations, and has no public social feeds or messaging features. Child profiles and gameplay records remain strictly private to the parent.',
    },
    {
      q: 'How do parent usage limits work?',
      a: 'Parents can configure daily play targets (such as 15 to 30 minutes). Once reached, the child is encouraged to take a rest and celebrate their progress, preventing excessive screen time.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-child selection:bg-[#ffd400] selection:text-black">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-[#ffd400]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xl font-black tracking-tight text-black whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-[#7f27a8] text-white border-2 border-black font-extrabold flex items-center justify-center text-sm">
              M
            </div>
            <span>MindQuest</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-black">
            <a href="#worlds" className="hover:text-[#7f27a8] transition-colors whitespace-nowrap shrink-0">
              Worlds
            </a>
            <a href="#domains" className="hover:text-[#c1008f] transition-colors whitespace-nowrap shrink-0">
              Domains
            </a>
            <a href="#how-it-works" className="hover:text-[#f76400] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#7f27a8] transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#c1008f] transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onGoToChildSelect}
              className="px-3.5 py-2 text-xs font-extrabold text-black bg-[#53b0c9] hover:bg-[#ffd400] border-2 border-black rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {signedInParentName ? 'Play Worlds' : 'Play Demo'}
            </button>
            {signedInParentName ? (
              <button
                onClick={onGoToParentPortal}
                className="px-4 py-2 text-xs font-extrabold text-white bg-[#7f27a8] hover:bg-[#c1008f] border-2 border-black rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
              >
                Dashboard ({signedInParentName.split(' ')[0]})
              </button>
            ) : (
              <>
                <button
                  onClick={() => onGoToParentAuth('signin')}
                  className="hidden sm:inline-flex px-3.5 py-2 text-xs font-extrabold text-black bg-white hover:bg-[#e885cf] border-2 border-black rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Parent Sign In
                </button>
                <button
                  onClick={() => onGoToParentAuth('signup')}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-[#7f27a8] hover:bg-[#c1008f] border-2 border-black rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Parent Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#e885cf]/30 to-transparent rounded-full -z-10 blur-2xl" />

        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest bg-[#ffd400] text-black px-4 py-1.5 rounded-full border-2 border-black mb-5">
            <span>Play</span>
            <span aria-hidden="true">·</span>
            <span>Think</span>
            <span aria-hidden="true">·</span>
            <span>Discover</span>
            <span aria-hidden="true">·</span>
            <span>Grow</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tight leading-[1.1] mb-6">
            Purposeful Cognitive Development for Growing Minds.
          </h1>

          <p className="text-lg text-black leading-relaxed mb-8 max-w-2xl mx-auto font-medium">
            Short, engaging, age-appropriate cognitive mini-games for children aged 5–16.
            Practice reading, concentration, mental math, spatial reasoning, and memory with transparent insights for parents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            {!signedInParentName && (
              <button
                onClick={() => onGoToParentAuth('signup')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ffd400] hover:bg-[#53b0c9] text-black font-black text-sm rounded-2xl border-2 border-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Parent Sign Up (Free)</span>
              </button>
            )}
            <button
              onClick={onGoToChildSelect}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#f76400] hover:bg-[#c1008f] text-white font-extrabold text-sm rounded-2xl border-2 border-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Child Game Worlds</span>
            </button>
            <button
              onClick={onGoToParentPortal}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#7f27a8] hover:bg-black text-white font-extrabold text-sm rounded-2xl border-2 border-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#ffd400]" />
              <span>{signedInParentName ? 'Open Parent Dashboard' : 'Demo Parent Portal'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-black font-bold border-t-2 border-[#e885cf] pt-6">
            <span>9 Cognitive Modules</span>
            <span aria-hidden="true">·</span>
            <span>4 Developmental Bands</span>
            <span aria-hidden="true">·</span>
            <span className="font-extrabold text-black bg-[#ffd400] px-2.5 py-1 rounded-lg border-2 border-black">
              ★ Faces &amp; Things Included (IP by Matthew Onaneye)
            </span>
            <span aria-hidden="true">·</span>
            <span>Parent-Controlled &amp; Safe</span>
            <span aria-hidden="true">·</span>
            <span>Zero Third-Party Ads</span>
          </div>
        </div>
      </section>

      {/* Developmental Worlds */}
      <section id="worlds" className="py-20 bg-[#53b0c9]/15 border-y-4 border-[#53b0c9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#7f27a8] block mb-2">
              Developmental Progression
            </span>
            <h2 className="text-3xl font-black text-black tracking-tight mb-3">
              Tailored Worlds for Every Stage of Growth
            </h2>
            <p className="text-sm text-black font-medium leading-relaxed">
              We never just alter a difficulty slider on identical games. Each age band features
              distinct mechanics, visual aesthetics, instructions, and cognitive pacing.
            </p>
          </div>

          {/* World Selector Tabs */}
          <div className="flex items-center gap-2 mb-8 p-1.5 bg-white border-2 border-black rounded-2xl max-w-md">
            <button
              onClick={() => setSelectedWorldTab('explorers')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                selectedWorldTab === 'explorers'
                  ? 'bg-[#ffd400] text-black border border-black shadow-xs'
                  : 'text-black hover:bg-[#e885cf]/30'
              }`}
            >
              Explorers (5–10)
            </button>
            <button
              onClick={() => setSelectedWorldTab('discoverers')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                selectedWorldTab === 'discoverers'
                  ? 'bg-[#7f27a8] text-white shadow-xs'
                  : 'text-black hover:bg-[#e885cf]/30'
              }`}
            >
              Discoverers (11–13)
            </button>
            <button
              onClick={() => setSelectedWorldTab('masters')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                selectedWorldTab === 'masters'
                  ? 'bg-[#c1008f] text-white shadow-xs'
                  : 'text-black hover:bg-[#e885cf]/30'
              }`}
            >
              Masters (14–16)
            </button>
          </div>

          {/* World Detail Cards */}
          {selectedWorldTab === 'explorers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border-4 border-[#53b0c9] shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold px-3 py-1 bg-[#53b0c9] text-black rounded-full border border-black">
                      Ages 5–7
                    </span>
                    <span className="text-3xl">🦊</span>
                  </div>
                  <h3 className="text-2xl font-black text-black mb-2">Young Explorers</h3>
                  <p className="text-sm text-black font-medium leading-relaxed mb-6">
                    Playful nature environments with friendly characters, large touch targets, clear
                    audio support, and minimal reading. Short, bite-sized activities (1–4 minutes).
                  </p>
                  <ul className="space-y-2 text-xs text-black font-bold mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> Big animal pairs &amp; friendly memory matching
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> Single-dimension shape and color sequences
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> Gentle encouragement with zero time panic
                    </li>
                  </ul>
                </div>
                <button
                  onClick={onGoToChildSelect}
                  className="w-full py-3 bg-[#53b0c9] hover:bg-[#ffd400] text-black border-2 border-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Explore Young Explorers
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 border-4 border-[#f76400] shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold px-3 py-1 bg-[#ffd400] text-black rounded-full border border-black">
                      Ages 8–10
                    </span>
                    <span className="text-3xl">🐯</span>
                  </div>
                  <h3 className="text-2xl font-black text-black mb-2">Senior Explorers</h3>
                  <p className="text-sm text-black font-medium leading-relaxed mb-6">
                    Adventure island themes with multi-item memory, numeric patterns, obstacle route
                    planning, and independent problem-solving.
                  </p>
                  <ul className="space-y-2 text-xs text-black font-bold mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f76400]" /> Age-scaled spatial recall &amp; Faces &amp; Things decks
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f76400]" /> Odd/even classification &amp; arithmetic pace
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f76400]" /> Island navigation with collectible resource gems
                    </li>
                  </ul>
                </div>
                <button
                  onClick={onGoToChildSelect}
                  className="w-full py-3 bg-[#f76400] hover:bg-[#c1008f] text-white border-2 border-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Explore Senior Explorers
                </button>
              </div>
            </div>
          )}

          {selectedWorldTab === 'discoverers' && (
            <div className="bg-white rounded-3xl p-8 border-4 border-[#7f27a8] shadow-md max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold px-3 py-1 bg-[#e885cf] text-black rounded-full border border-black">
                  Ages 11–13
                </span>
                <span className="text-3xl">🕵️</span>
              </div>
              <h3 className="text-2xl font-black text-black mb-2">Discoverers Academy</h3>
              <p className="text-sm text-black font-medium leading-relaxed mb-6">
                Mystery, investigation, and multi-step deduction. Challenges feature unexpected rule
                changes, clue synthesis, and working memory load designed for middle-schoolers (3–6 minutes).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-black font-semibold mb-8">
                <div className="p-3 bg-[#ffd400]/25 rounded-xl border-2 border-[#f76400]">
                  <strong>Dynamic Rule Inversion:</strong> Tapping targets shifts criteria midway from color to shape.
                </div>
                <div className="p-3 bg-[#53b0c9]/25 rounded-xl border-2 border-[#53b0c9]">
                  <strong>Rotational Matrix Puzzles:</strong> Deducing clockwise geometry shifts and letter ciphers.
                </div>
              </div>
              <button
                onClick={onGoToChildSelect}
                className="px-6 py-3 bg-[#7f27a8] hover:bg-[#c1008f] text-white border-2 border-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
              >
                Experience Discoverers World
              </button>
            </div>
          )}

          {selectedWorldTab === 'masters' && (
            <div className="bg-[#7f27a8] text-white rounded-3xl p-8 border-4 border-black shadow-xl max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold px-3 py-1 bg-[#ffd400] text-black rounded-full border border-black">
                  Ages 14–16
                </span>
                <span className="text-3xl">♟️</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Masters Neural Lab</h3>
              <p className="text-sm text-white font-medium leading-relaxed mb-6">
                Sophisticated strategic environments with abstract logic grids, recursive sequences,
                and complex working memory constraints (5–10 minutes).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-black font-semibold mb-8">
                <div className="p-3 bg-white rounded-xl border-2 border-black">
                  <strong>Abstract Deductions:</strong> Fibonacci transforms and modulo coordinate logic.
                </div>
                <div className="p-3 bg-[#e885cf] rounded-xl border-2 border-black">
                  <strong>Strategic Planning:</strong> High-density obstacle mazes under tight move budgets.
                </div>
              </div>
              <button
                onClick={onGoToChildSelect}
                className="px-6 py-3 bg-[#ffd400] hover:bg-[#53b0c9] text-black border-2 border-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
              >
                Enter Masters Lab
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Core Cognitive Domains */}
      <section id="domains" className="py-20 max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#c1008f] block mb-2">
            Scientific Framework
          </span>
          <h2 className="text-3xl font-black text-black tracking-tight mb-3">
            Core Cognitive Capabilities
          </h2>
          <p className="text-sm text-black font-medium leading-relaxed">
            MindQuest breaks mental exercise into distinct domains with individual reporting.
            We avoid simplistic IQ claims and focus on measurable practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border-3 border-[#7f27a8] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#7f27a8] text-white border-2 border-black flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-black mb-1">Memory Lab</h3>
              <p className="text-xs text-black font-medium mb-4 leading-relaxed">
                Encoding, storing, and retrieving information. Exercises visual paired-associates,
                spatial recall, and sequence retention.
              </p>
            </div>
            <div className="text-xs text-[#7f27a8] font-bold border-t-2 border-[#e885cf] pt-3">
              Measures: Recall accuracy · Sequence retention
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border-3 border-[#53b0c9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#53b0c9] text-black border-2 border-black flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-black mb-1">Focus Academy</h3>
              <p className="text-xs text-black font-medium mb-4 leading-relaxed">
                Sustaining attention and selectively filtering out visual distractors without impulsive clicks.
              </p>
            </div>
            <div className="text-xs text-[#7f27a8] font-bold border-t-2 border-[#53b0c9] pt-3">
              Measures: Target accuracy · Distractor resistance
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border-3 border-[#ffd400] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffd400] text-black border-2 border-black flex items-center justify-center mb-4">
                <Puzzle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-black mb-1">Logic Kingdom</h3>
              <p className="text-xs text-black font-medium mb-4 leading-relaxed">
                Identifying relational rules, progressive geometric patterns, and deductive conclusions.
              </p>
            </div>
            <div className="text-xs text-[#f76400] font-bold border-t-2 border-[#ffd400] pt-3">
              Measures: Deduction accuracy · Problem complexity
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border-3 border-[#f76400] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#f76400] text-white border-2 border-black flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-black mb-1">Brain Speed</h3>
              <p className="text-xs text-black font-medium mb-4 leading-relaxed">
                Efficiently interpreting and classifying visual information. Pacing is calibrated to
                never reward speed over accuracy.
              </p>
            </div>
            <div className="text-xs text-[#f76400] font-bold border-t-2 border-[#ffd400] pt-3">
              Measures: Response efficiency · Classification accuracy
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border-3 border-[#c1008f] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#c1008f] text-white border-2 border-black flex items-center justify-center mb-4">
                <Shuffle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-black mb-1">Cognitive Flexibility</h3>
              <p className="text-xs text-black font-medium mb-4 leading-relaxed">
                Adapting when rules dynamically change. Exercises task switching and mental agility.
              </p>
            </div>
            <div className="text-xs text-[#c1008f] font-bold border-t-2 border-[#e885cf] pt-3">
              Measures: Switch cost · Rule adaptation speed
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border-3 border-[#e885cf] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#e885cf] text-black border-2 border-black flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-black mb-1">Strategy Island</h3>
              <p className="text-xs text-black font-medium mb-4 leading-relaxed">
                Planning multi-step goals in advance, managing working memory constraints, and self-regulating.
              </p>
            </div>
            <div className="text-xs text-[#7f27a8] font-bold border-t-2 border-[#e885cf] pt-3">
              Measures: Forward step efficiency · Goal completion
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#ffd400]/20 border-y-4 border-[#ffd400]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#f76400] block mb-2">
              Simple &amp; Safe
            </span>
            <h2 className="text-3xl font-black text-black tracking-tight mb-3">
              How MindQuest Operates
            </h2>
            <p className="text-sm text-black font-medium leading-relaxed">
              Designed from the ground up for families: one parent account manages multiple independent child profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-3xl border-3 border-[#7f27a8] shadow-sm">
              <span className="text-2xl font-black text-[#7f27a8] block mb-3">01.</span>
              <h3 className="text-lg font-black text-black mb-2">Parent Creates Profiles</h3>
              <p className="text-xs text-black font-medium leading-relaxed">
                Enter your child&apos;s date of birth. MindQuest automatically assigns the appropriate
                developmental band. No child email addresses or passwords needed.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border-3 border-[#53b0c9] shadow-sm">
              <span className="text-2xl font-black text-[#53b0c9] block mb-3">02.</span>
              <h3 className="text-lg font-black text-black mb-2">Child Enters World</h3>
              <p className="text-xs text-black font-medium leading-relaxed">
                The child accesses their tailored world, playing fresh cognitive games on every login.
                Difficulty adapts dynamically based on demonstrated performance.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border-3 border-[#c1008f] shadow-sm">
              <span className="text-2xl font-black text-[#c1008f] block mb-3">03.</span>
              <h3 className="text-lg font-black text-black mb-2">Parents Review Insights</h3>
              <p className="text-xs text-black font-medium leading-relaxed">
                Parents review separate domain progress, weekly participation, and practice
                suggestions with factual, non-clinical indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#7f27a8] block mb-2">
            Transparent Access
          </span>
          <h2 className="text-3xl font-black text-black tracking-tight mb-3">
            MindQuest Membership Options
          </h2>
          <p className="text-sm text-black font-medium leading-relaxed">
            Free forever for core practice, with optional premium expansions for full catalog access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border-4 border-[#53b0c9] bg-white shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7f27a8] block mb-1">
                Explorer Free
              </span>
              <div className="text-3xl font-black text-black mb-4">$0 / Forever</div>
              <p className="text-xs text-black font-medium mb-6">
                Essential cognitive practice and basic parent reporting.
              </p>
              <ul className="space-y-3 text-xs text-black font-bold mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#7f27a8]" /> 1 Child Profile
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#7f27a8]" /> Access to core Memory &amp; Focus games
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#7f27a8]" /> Basic parent activity history
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#7f27a8]" /> Daily usage limits
                </li>
              </ul>
            </div>
            <button
              onClick={() => (signedInParentName ? onGoToChildSelect() : onGoToParentAuth('signup'))}
              className="w-full py-3 border-2 border-black bg-[#53b0c9] hover:bg-[#ffd400] text-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
            >
              {signedInParentName ? 'Start Free Practice' : 'Sign Up Free as Parent'}
            </button>
          </div>

          <div className="p-8 rounded-3xl border-4 border-black bg-[#7f27a8] text-white shadow-xl flex flex-col justify-between relative">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffd400] block mb-1">
                Family Premium
              </span>
              <div className="text-3xl font-black text-white mb-4">
                $6.99 <span className="text-xs font-normal text-white/90">/ month</span>
              </div>
              <p className="text-xs text-white font-medium mb-6">
                Complete cognitive development across all modules for the whole family.
              </p>
              <ul className="space-y-3 text-xs text-white font-bold mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ffd400]" /> Up to 5 Independent Child Profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ffd400]" /> All Cognitive Modules &amp; Faces &amp; Things
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ffd400]" /> Full rules-based adaptive progression
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ffd400]" /> Detailed multi-domain weekly parent reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ffd400]" /> Data export &amp; privacy management
                </li>
              </ul>
            </div>
            <button
              onClick={() => (signedInParentName ? onGoToParentPortal() : onGoToParentAuth('signup'))}
              className="w-full py-3 bg-[#ffd400] hover:bg-[#53b0c9] text-black border-2 border-black rounded-xl text-xs font-extrabold transition-colors shadow-md cursor-pointer"
            >
              {signedInParentName ? 'Manage Family Plan' : 'Sign Up for Family Account'}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#e885cf]/20 border-t-4 border-[#e885cf]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#c1008f] block mb-2">
              Common Inquiries
            </span>
            <h2 className="text-3xl font-black text-black tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border-2 border-[#7f27a8] overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-extrabold text-sm text-black flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7f27a8] transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-[#c1008f]' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-black font-medium leading-relaxed border-t-2 border-[#e885cf] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-[#7f27a8] py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-black font-semibold">
          <div className="flex items-center gap-3">
            <span className="font-black text-black">MindQuest</span>
            <span aria-hidden="true">·</span>
            <span>Play. Think. Discover. Grow.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onGoToParentPortal} className="hover:text-[#7f27a8] transition-colors cursor-pointer">
              Parent Dashboard
            </button>
            <button onClick={onGoToChildSelect} className="hover:text-[#c1008f] transition-colors cursor-pointer">
              Child Mode
            </button>
            <a href="#worlds" className="hover:text-[#f76400] transition-colors">
              Age Worlds
            </a>
            <a href="#domains" className="hover:text-[#7f27a8] transition-colors">
              Cognitive Framework
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} MindQuest &amp; Faces and Things · Original IP by Matthew Onaneye.
          </div>
        </div>
      </footer>
    </div>
  );
};
