import React, { useState } from 'react';
import {
  Brain,
  Target,
  Puzzle,
  Zap,
  Shuffle,
  Compass,
  Shield,
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  Lock,
  Heart,
  Play,
  Users,
} from 'lucide-react';
import { COGNITIVE_DOMAINS, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import { CognitiveDomain } from '../../types';

interface MarketingViewProps {
  onGoToParentPortal: () => void;
  onGoToChildSelect: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  onGoToParentPortal,
  onGoToChildSelect,
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
    <div className="min-h-screen bg-white text-slate-900 font-parent selection:bg-teal-100 selection:text-teal-900">
      {/* Top Bar Contract (§2): Zone 1 wordmark, Zone 2 single-line links, Zone 3 primary action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title, one line */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm">
              M
            </div>
            <span>MindQuest</span>
          </a>

          {/* Zone 2: 4-5 nav links, 1-2 word labels, single-line */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#worlds" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Worlds
            </a>
            <a href="#domains" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Domains
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGoToChildSelect}
              className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Play Demo
            </button>
            <button
              onClick={onGoToParentPortal}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Parent Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-teal-50/70 to-transparent rounded-full -z-10 blur-2xl" />

        <div className="max-w-3xl mx-auto">
          {/* Unboxed tagline */}
          <div className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest text-teal-700 mb-4">
            <span>Play</span>
            <span aria-hidden="true">·</span>
            <span>Think</span>
            <span aria-hidden="true">·</span>
            <span>Discover</span>
            <span aria-hidden="true">·</span>
            <span>Grow</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Purposeful Cognitive Development for Growing Minds.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
            Short, engaging, age-appropriate cognitive mini-games for children aged 5–16.
            Practice memory, attention, reasoning, and planning with transparent insights for parents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button
              onClick={onGoToChildSelect}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-teal-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Child Game Worlds</span>
            </button>
            <button
              onClick={onGoToParentPortal}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Open Parent Dashboard</span>
            </button>
          </div>

          {/* Social Proof Strip (§1.H - clean unboxed metrics) */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-6">
            <span>6 Cognitive Domains</span>
            <span aria-hidden="true">·</span>
            <span>4 Developmental Bands</span>
            <span aria-hidden="true">·</span>
            <span>Parent-Controlled & Safe</span>
            <span aria-hidden="true">·</span>
            <span>Zero Third-Party Ads</span>
          </div>
        </div>
      </section>

      {/* The Three Age Worlds (§7) */}
      <section id="worlds" className="py-20 bg-slate-50/60 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Developmental Progression
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Tailored Worlds for Every Stage of Growth
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We never just alter a difficulty slider on identical games. Each age band features
              distinct mechanics, visual aesthetics, instructions, and cognitive pacing.
            </p>
          </div>

          {/* World Selector Tabs */}
          <div className="flex items-center gap-2 mb-8 p-1.5 bg-slate-200/70 rounded-2xl max-w-md">
            <button
              onClick={() => setSelectedWorldTab('explorers')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedWorldTab === 'explorers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Explorers (5–10)
            </button>
            <button
              onClick={() => setSelectedWorldTab('discoverers')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedWorldTab === 'discoverers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discoverers (11–13)
            </button>
            <button
              onClick={() => setSelectedWorldTab('masters')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedWorldTab === 'masters'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masters (14–16)
            </button>
          </div>

          {/* World Detail Cards */}
          {selectedWorldTab === 'explorers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Ages 5–7
                    </span>
                    <span className="text-3xl">🦊</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Young Explorers</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Playful nature environments with friendly characters, large touch targets, clear
                    audio support, and minimal reading. Short, bite-sized activities (1–4 minutes).
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Big animal pairs & friendly memory matching
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Single-dimension shape and color sequences
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Gentle encouragement with zero time panic
                    </li>
                  </ul>
                </div>
                <button
                  onClick={onGoToChildSelect}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Explore Young Explorers
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                      Ages 8–10
                    </span>
                    <span className="text-3xl">🐯</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Senior Explorers</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Adventure island themes with multi-item memory, numeric patterns, obstacle route
                    planning, and independent problem-solving.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600" /> 12-card spatial recall and sequence memory
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600" /> Odd/even classification & arithmetic pace
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600" /> Island navigation with collectible resource gems
                    </li>
                  </ul>
                </div>
                <button
                  onClick={onGoToChildSelect}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Explore Senior Explorers
                </button>
              </div>
            </div>
          )}

          {selectedWorldTab === 'discoverers' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-200">
                  Ages 11–13
                </span>
                <span className="text-3xl">🕵️</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Discoverers Academy</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Mystery, investigation, and multi-step deduction. Challenges feature unexpected rule
                changes, clue synthesis, and working memory load designed for middle-schoolers (3–6 minutes).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium mb-8">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>Dynamic Rule Inversion:</strong> Tapping targets shifts criteria midway from color to shape.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>Rotational Matrix Puzzles:</strong> Deducing clockwise geometry shifts and letter ciphers.
                </div>
              </div>
              <button
                onClick={onGoToChildSelect}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Experience Discoverers World
              </button>
            </div>
          )}

          {selectedWorldTab === 'masters' && (
            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-blue-900/60 text-blue-300 rounded-full border border-blue-700">
                  Ages 14–16
                </span>
                <span className="text-3xl">♟️</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Masters Neural Lab</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Sophisticated strategic environments with abstract logic grids, recursive sequences,
                complex working memory constraints, and telemetry tracking (5–10 minutes).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-medium mb-8">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <strong>Abstract Deductions:</strong> Fibonacci transforms and modulo coordinate logic.
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <strong>Strategic Planning:</strong> High-density obstacle mazes under tight move budgets.
                </div>
              </div>
              <button
                onClick={onGoToChildSelect}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-extrabold transition-colors"
              >
                Enter Masters Lab
              </button>
            </div>
          )}
        </div>
      </section>

      {/* The 6 Cognitive Domains (§5) */}
      <section id="domains" className="py-20 max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Scientific Framework
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Six Core Cognitive Capabilities
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            MindQuest breaks mental exercise into distinct domains with individual reporting.
            We avoid simplistic IQ claims and focus on measurable practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Memory Lab</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Encoding, storing, and retrieving information. Exercises visual paired-associates,
                spatial recall, and sequence retention.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Measures: Recall accuracy · Sequence retention
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Focus Academy</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Sustaining attention and selectively filtering out visual distractors without impulsive clicks.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Measures: Target accuracy · Distractor resistance
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Puzzle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Logic Kingdom</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Identifying relational rules, progressive geometric patterns, and deductive conclusions.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Measures: Deduction accuracy · Problem complexity
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Brain Speed</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Efficiently interpreting and classifying visual information. Pacing is calibrated to
                never reward speed over accuracy.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Measures: Response efficiency · Classification accuracy
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Shuffle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Cognitive Flexibility</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Adapting when rules dynamically change. Exercises task switching and mental agility.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Measures: Switch cost · Rule adaptation speed
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Strategy Island</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Planning multi-step goals in advance, managing working memory constraints, and self-regulating.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Measures: Forward step efficiency · Goal completion
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (§9) */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Simple & Safe
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              How MindQuest Operates
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed from the ground up for families: one parent account manages multiple independent child profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-black text-slate-300 block mb-3">01.</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Parent Creates Profiles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your child's date of birth. MindQuest automatically assigns the appropriate
                developmental band. No child email addresses or passwords needed.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-black text-slate-300 block mb-3">02.</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Child Enters World</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The child accesses their tailored world, playing short 2–5 minute cognitive games.
                Difficulty adapts dynamically based on demonstrated performance.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-black text-slate-300 block mb-3">03.</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Parents Review Insights</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Parents review separate domain progress, weekly participation, and practice
                suggestions with factual, non-clinical indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Freemium Breakdown (§21) */}
      <section id="pricing" className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Transparent Access
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            MindQuest Membership Options
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Free forever for core practice, with optional premium expansions for full catalog access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Explorer Free
              </span>
              <div className="text-3xl font-black text-slate-900 mb-4">$0 / Forever</div>
              <p className="text-xs text-slate-600 mb-6">
                Essential cognitive practice and basic parent reporting.
              </p>
              <ul className="space-y-3 text-xs text-slate-700 font-medium mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" /> 1 Child Profile
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" /> Access to core Memory & Focus games
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" /> Basic parent activity history
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" /> Daily usage limits
                </li>
              </ul>
            </div>
            <button
              onClick={onGoToChildSelect}
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold transition-colors"
            >
              Start Free Practice
            </button>
          </div>

          <div className="p-8 rounded-3xl border-2 border-slate-900 bg-slate-900 text-white shadow-xl flex flex-col justify-between relative">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                Family Premium
              </span>
              <div className="text-3xl font-black text-white mb-4">
                $6.99 <span className="text-xs font-normal text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mb-6">
                Complete cognitive development across all modules for the whole family.
              </p>
              <ul className="space-y-3 text-xs text-slate-200 font-medium mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" /> Up to 5 Independent Child Profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" /> All 5 Cognitive Modules & Game Variants
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" /> Full rules-based adaptive progression
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" /> Detailed 6-domain weekly parent reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" /> Data export & privacy management
                </li>
              </ul>
            </div>
            <button
              onClick={onGoToParentPortal}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-extrabold transition-colors shadow-md"
            >
              Explore Family Membership
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Common Inquiries
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-slate-900' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer (§1.B Anti-slop: clean copyright and links) */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900">MindQuest</span>
            <span aria-hidden="true">·</span>
            <span>Play. Think. Discover. Grow.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onGoToParentPortal} className="hover:text-slate-900 transition-colors">
              Parent Dashboard
            </button>
            <button onClick={onGoToChildSelect} className="hover:text-slate-900 transition-colors">
              Child Mode
            </button>
            <a href="#worlds" className="hover:text-slate-900 transition-colors">
              Age Worlds
            </a>
            <a href="#domains" className="hover:text-slate-900 transition-colors">
              Cognitive Framework
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} MindQuest Cognitive Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
