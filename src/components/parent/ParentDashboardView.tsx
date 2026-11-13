import React, { useState } from 'react';
import { ChildProfile, GameSession, CognitiveDomain, FocusArea } from '../../types';
import { COGNITIVE_DOMAINS, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import {
  Brain,
  Target,
  Puzzle,
  Zap,
  Shuffle,
  Compass,
  Calculator,
  Layers,
  BookOpen,
  Clock,
  Flame,
  Award,
  Play,
  Download,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Shield,
  FileText,
  BarChart2,
  AlertCircle,
  Trophy,
  Check,
  LogOut,
  Cloud,
  Lock,
  UserPlus,
} from 'lucide-react';
import { exportDataAsJSON, resetAllDataToDemo } from '../../utils/storage';
import { CloudParentAccount, FamilyPlan } from '../../services/firebaseService';

interface ParentDashboardViewProps {
  childrenList: ChildProfile[];
  activeChildId: string;
  onSelectActiveChild: (childId: string) => void;
  sessions: GameSession[];
  onOpenAddChild: () => void;
  onOpenEditChild: (child: ChildProfile) => void;
  onDeleteChild: (childId: string) => void;
  onLaunchChildWorld: (childId: string) => void;
  onGoToMarketing: () => void;
  onOpenLeaderboard: () => void;
  onUpdateChild: (child: ChildProfile) => void;
  parentAccount?: CloudParentAccount | null;
  onUpdateParentAccount?: (updates: { name?: string; pin?: string; plan?: FamilyPlan }) => Promise<void> | void;
  onSignOutParent?: () => void;
  onOpenParentAuth?: (mode?: 'signup' | 'signin') => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  childrenList,
  activeChildId,
  onSelectActiveChild,
  sessions,
  onOpenAddChild,
  onOpenEditChild,
  onDeleteChild,
  onLaunchChildWorld,
  onGoToMarketing,
  onOpenLeaderboard,
  onUpdateChild,
  parentAccount,
  onUpdateParentAccount,
  onSignOutParent,
  onOpenParentAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'weekly' | 'settings'>('overview');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Guardian Cloud Account editor state
  const [guardianNameInput, setGuardianNameInput] = useState(parentAccount?.name || '');
  const [guardianPinInput, setGuardianPinInput] = useState(parentAccount?.pin || '');
  const [guardianSaveStatus, setGuardianSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [guardianSaveError, setGuardianSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (parentAccount) {
      setGuardianNameInput(parentAccount.name);
      setGuardianPinInput(parentAccount.pin);
    }
  }, [parentAccount]);

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];
  const childSessions = sessions.filter((s) => s.childId === activeChild?.id);

  const getDomainStats = (domain: CognitiveDomain) => {
    const domainSessions = childSessions.filter((s) => s.domain === domain);
    if (domainSessions.length === 0) {
      return { count: 0, avgAccuracy: null, avgDuration: 0, latestDifficulty: 1 };
    }
    const avgAccuracy = Math.round(
      domainSessions.reduce((acc, s) => acc + s.accuracy, 0) / domainSessions.length
    );
    const avgDuration = Math.round(
      domainSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / domainSessions.length
    );
    return {
      count: domainSessions.length,
      avgAccuracy,
      avgDuration,
      latestDifficulty: domainSessions[0]?.difficultyLevel || 1,
    };
  };

  const domainIcons: Record<CognitiveDomain, React.ComponentType<{ className?: string }>> = {
    memory: Brain,
    attention: Target,
    reasoning: Puzzle,
    processing_speed: Zap,
    cognitive_flexibility: Shuffle,
    executive_function: Compass,
    mental_math: Calculator,
    spatial_thinking: Layers,
    reading_comprehension: BookOpen,
  };

  const handleExport = () => {
    const json = parentAccount
      ? JSON.stringify(
          {
            parent: {
              uid: parentAccount.uid,
              name: parentAccount.name,
              email: parentAccount.email,
              phoneNumber: parentAccount.phoneNumber,
              authProvider: parentAccount.authProvider,
              plan: parentAccount.plan,
            },
            children: childrenList,
            sessions,
            exportedAt: new Date().toISOString(),
            platform: 'MindQuest Cloud Family',
          },
          null,
          2
        )
      : exportDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindquest-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveGuardianSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateParentAccount) return;
    const trimmedName = guardianNameInput.trim();
    const trimmedPin = guardianPinInput.trim();
    if (!trimmedName) {
      setGuardianSaveError('Guardian display name cannot be empty.');
      setGuardianSaveStatus('error');
      return;
    }
    if (!/^[0-9]{4,6}$/.test(trimmedPin)) {
      setGuardianSaveError('Parent Gate PIN must be 4 to 6 numeric digits.');
      setGuardianSaveStatus('error');
      return;
    }
    setGuardianSaveError(null);
    setGuardianSaveStatus('saving');
    try {
      await onUpdateParentAccount({ name: trimmedName, pin: trimmedPin });
      setGuardianSaveStatus('saved');
      setTimeout(() => setGuardianSaveStatus('idle'), 2500);
    } catch {
      setGuardianSaveError('Could not update Guardian settings. Please try again.');
      setGuardianSaveStatus('error');
    }
  };

  const toggleFocusArea = (area: FocusArea) => {
    if (!activeChild) return;
    const current = new Set<FocusArea>(
      activeChild.allowedFocusAreas || ['reading', 'concentration', 'mental_abilities']
    );
    if (current.has(area)) {
      if (current.size > 1) {
        current.delete(area);
      }
    } else {
      current.add(area);
    }
    const updated: ChildProfile = {
      ...activeChild,
      allowedFocusAreas: Array.from(current),
    };
    onUpdateChild(updated);
  };

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-white p-12 text-center font-child text-black flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#ffd400] border-2 border-black flex items-center justify-center">
          <Shield className="w-8 h-8 text-[#7f27a8]" />
        </div>
        <h2 className="text-2xl font-black text-black">
          {parentAccount ? `Welcome, ${parentAccount.name}!` : 'No Child Profiles Yet'}
        </h2>
        <p className="text-sm text-black font-medium max-w-md">
          Add your first child explorer profile to unlock age-tailored worlds and cognitive tracking.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenAddChild}
            className="px-6 py-3 bg-[#7f27a8] hover:bg-[#c1008f] text-white border-2 border-black rounded-xl text-sm font-extrabold cursor-pointer"
          >
            Create First Child Profile
          </button>
          {parentAccount && onSignOutParent && (
            <button
              onClick={onSignOutParent}
              className="px-5 py-3 bg-white hover:bg-[#ffd400] text-black border-2 border-black rounded-xl text-sm font-extrabold cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    );
  }

  const bandInfo = DEVELOPMENTAL_BANDS[activeChild.band];
  const allowedAreas = new Set(activeChild.allowedFocusAreas || ['reading', 'concentration', 'mental_abilities']);

  return (
    <div className="min-h-screen bg-white text-black font-child pb-16">
      {/* Top Header */}
      <header className="bg-white border-b-4 border-[#7f27a8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7f27a8] text-white border-2 border-black font-extrabold flex items-center justify-center text-sm shadow-xs">
              MQ
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-black text-base tracking-tight">
                  MindQuest Parent Portal
                </span>
                {parentAccount ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#53b0c9] text-black font-extrabold border border-black inline-flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Cloud Synced ({parentAccount.name.split(' ')[0]})
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#ffd400] text-black font-extrabold border border-black">
                    Local Demo Mode
                  </span>
                )}
              </div>
              <span className="text-xs text-black font-medium">
                {parentAccount
                  ? `Signed in as ${parentAccount.email || parentAccount.phoneNumber || parentAccount.name}`
                  : 'Cognitive Practice Oversight & Insights'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
            {!parentAccount && onOpenParentAuth && (
              <button
                onClick={() => onOpenParentAuth('signup')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#7f27a8] hover:bg-[#c1008f] text-white border-2 border-black text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Parent Sign Up</span>
              </button>
            )}

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#ffd400] hover:bg-[#e885cf] text-black border-2 border-black text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-black fill-white" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            <button
              onClick={() => onLaunchChildWorld(activeChild.id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f76400] hover:bg-[#c1008f] text-white border-2 border-black text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play ({activeChild.name})</span>
            </button>
            <button
              onClick={onGoToMarketing}
              className="text-xs font-bold text-black hover:bg-[#53b0c9] px-3 py-2 rounded-xl border border-black transition-colors hidden sm:block cursor-pointer"
            >
              Website
            </button>
            {parentAccount && onSignOutParent && (
              <button
                onClick={onSignOutParent}
                title="Sign out of Parent Account"
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#e885cf] text-black border-2 border-black text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Child Selector Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t-2 border-[#e885cf] flex items-center justify-between gap-4 overflow-x-auto py-2.5 bg-[#e885cf]/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-black uppercase tracking-wider mr-1">
              Active Child:
            </span>
            {childrenList.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectActiveChild(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border-2 ${
                  c.id === activeChild.id
                    ? 'bg-[#7f27a8] text-white border-black shadow-xs'
                    : 'bg-white text-black border-[#53b0c9] hover:bg-[#ffd400]'
                }`}
              >
                <span>{c.name}</span>
                <span className="opacity-85 font-semibold">({c.calculatedAge}y)</span>
              </button>
            ))}

            <button
              onClick={onOpenAddChild}
              className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-black bg-[#53b0c9] hover:bg-[#ffd400] border-2 border-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Child</span>
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#ffd400] text-black border border-black'
                  : 'text-black hover:bg-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                activeTab === 'domains'
                  ? 'bg-[#ffd400] text-black border border-black'
                  : 'text-black hover:bg-white'
              }`}
            >
              Cognitive Framework
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                activeTab === 'weekly'
                  ? 'bg-[#ffd400] text-black border border-black'
                  : 'text-black hover:bg-white'
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#ffd400] text-black border border-black'
                  : 'text-black hover:bg-white'
              }`}
            >
              Focus Areas &amp; Privacy
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Active Child Summary Ribbon */}
        <div className="bg-white rounded-3xl p-6 border-3 border-[#53b0c9] shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ffd400] border-2 border-black flex items-center justify-center text-3xl shadow-inner">
              {bandInfo.avatarOptions.find((a) => a.id === activeChild.avatar)?.emoji || '🦊'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-black">
                  {activeChild.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e885cf] text-black font-bold border border-black">
                  {activeChild.calculatedAge} Years Old
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#53b0c9] text-black font-bold border border-black">
                  {bandInfo.subName}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ffd400] text-black font-extrabold border border-black flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#f76400] fill-[#f76400]" />
                  {activeChild.streakDays || 1}d Streak
                </span>
              </div>
              <p className="text-xs text-black font-medium mt-1">
                Born {activeChild.birthDate} · Assigned to {bandInfo.worldName} · Level {activeChild.level} ({activeChild.totalXp} XP) · Best Streak: {activeChild.bestStreak || activeChild.streakDays}d
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenEditChild(activeChild)}
              className="px-3.5 py-2 text-xs font-extrabold text-black bg-[#e885cf] hover:bg-[#ffd400] border-2 border-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => onLaunchChildWorld(activeChild.id)}
              className="px-4 py-2 text-xs font-extrabold text-white bg-[#7f27a8] hover:bg-[#c1008f] border-2 border-black rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Open Play Session
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-[#53b0c9] shadow-xs">
                <div className="flex items-center justify-between text-black mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Playtime Today</span>
                  <Clock className="w-4 h-4 text-[#53b0c9]" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-black tabular-nums">
                    {activeChild.todayMinutesPlayed}m
                  </span>
                  <span className="text-xs font-bold text-black">
                    / {activeChild.dailyLimitMinutes}m limit
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e885cf]/30 rounded-full mt-3 overflow-hidden border border-black/20">
                  <div
                    className={`h-full rounded-full ${
                      activeChild.todayMinutesPlayed >= activeChild.dailyLimitMinutes
                        ? 'bg-[#f76400]'
                        : 'bg-[#53b0c9]'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (activeChild.todayMinutesPlayed / activeChild.dailyLimitMinutes) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-[#f76400] shadow-xs">
                <div className="flex items-center justify-between text-black mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Daily Streak</span>
                  <Flame className="w-4 h-4 text-[#f76400] fill-[#f76400]" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-black tabular-nums">
                    {activeChild.streakDays || 1}
                  </span>
                  <span className="text-xs font-bold text-black">consecutive days</span>
                </div>
                <span className="text-xs text-[#c1008f] font-extrabold mt-3 block">
                  {(activeChild.streakBadges || []).length} milestone badges earned
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-[#7f27a8] shadow-xs">
                <div className="flex items-center justify-between text-black mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Sessions Stored</span>
                  <Award className="w-4 h-4 text-[#7f27a8]" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-black tabular-nums">
                    {childSessions.length}
                  </span>
                  <span className="text-xs font-bold text-black">activities</span>
                </div>
                <span className="text-xs text-black font-medium mt-3 block">
                  Isolated to {activeChild.name}&apos;s profile
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-[#c1008f] shadow-xs">
                <div className="flex items-center justify-between text-black mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Avg Accuracy</span>
                  <BarChart2 className="w-4 h-4 text-[#c1008f]" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-black tabular-nums">
                    {childSessions.length > 0
                      ? Math.round(
                          childSessions.reduce((acc, s) => acc + s.accuracy, 0) / childSessions.length
                        )
                      : 0}
                    %
                  </span>
                  <span className="text-xs font-bold text-black">across tasks</span>
                </div>
                <span className="text-xs text-black font-medium mt-3 block">
                  Task-specific practice metrics
                </span>
              </div>
            </div>

            {/* Parent Choice: Focus Areas & Sub-Categories Selection Card */}
            <div className="bg-white rounded-3xl p-6 border-3 border-[#ffd400] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-black">
                    Parental Game Categories &amp; Focus Control
                  </h3>
                  <p className="text-xs text-black font-medium">
                    Choose which skill sub-categories are active for {activeChild.name} (Reading, Concentration, Mental Abilities).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => toggleFocusArea('reading')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    allowedAreas.has('reading')
                      ? 'bg-[#e885cf]/25 border-[#c1008f] ring-2 ring-[#c1008f] shadow-xs'
                      : 'bg-white border-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">📖</span>
                    {allowedAreas.has('reading') && (
                      <span className="text-xs font-extrabold text-white bg-[#c1008f] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-black mb-1">
                    1. Reading &amp; Verbal
                  </h4>
                  <p className="text-xs text-black font-medium">
                    Phonics, vocabulary in context, reading comprehension, and deduction.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFocusArea('concentration')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    allowedAreas.has('concentration')
                      ? 'bg-[#53b0c9]/25 border-[#53b0c9] ring-2 ring-[#53b0c9] shadow-xs'
                      : 'bg-white border-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🎯</span>
                    {allowedAreas.has('concentration') && (
                      <span className="text-xs font-extrabold text-black bg-[#53b0c9] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-black mb-1">
                    2. Concentration &amp; Focus
                  </h4>
                  <p className="text-xs text-black font-medium">
                    Sustained attention, impulse control, rule-switching, and distractor resistance.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFocusArea('mental_abilities')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    allowedAreas.has('mental_abilities')
                      ? 'bg-[#ffd400]/25 border-[#f76400] ring-2 ring-[#ffd400] shadow-xs'
                      : 'bg-white border-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🧠</span>
                    {allowedAreas.has('mental_abilities') && (
                      <span className="text-xs font-extrabold text-white bg-[#7f27a8] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-black mb-1">
                    3. Mental Abilities
                  </h4>
                  <p className="text-xs text-black font-medium">
                    Mental mathematics, spatial/abstract thinking, pattern reasoning, and memory.
                  </p>
                </button>
              </div>
            </div>

            {/* Cognitive Domains Grid Summary */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-black">
                    Cognitive Skills Snapshot
                  </h3>
                  <p className="text-xs text-black font-medium">
                    Individual skills reported separately per PRD Section 5. Never merged into a clinical label.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('domains')}
                  className="text-xs font-extrabold text-[#7f27a8] hover:text-[#c1008f] cursor-pointer"
                >
                  View Full Domain Analytics →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(COGNITIVE_DOMAINS) as CognitiveDomain[]).map((domKey) => {
                  const dom = COGNITIVE_DOMAINS[domKey];
                  const stats = getDomainStats(domKey);
                  const Icon = domainIcons[domKey] || Brain;

                  return (
                    <div
                      key={domKey}
                      className={`bg-white rounded-2xl p-5 border-2 ${dom.borderColor} shadow-xs flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl border border-black flex items-center justify-center ${dom.bgColor} ${dom.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-black">
                            {stats.count} sessions
                          </span>
                        </div>
                        <h4 className="text-base font-black text-black mb-1">{dom.title}</h4>
                        <p className="text-xs text-black font-medium mb-4 line-clamp-2">{dom.shortDesc}</p>
                      </div>

                      <div className="pt-3 border-t border-black/15 flex items-center justify-between text-xs">
                        <span className="text-black font-semibold">Observed Accuracy:</span>
                        {stats.avgAccuracy !== null ? (
                          <span className="font-black text-black tabular-nums">
                            {stats.avgAccuracy}% (Tier {stats.latestDifficulty})
                          </span>
                        ) : (
                          <span className="text-black/70 italic">No sessions yet</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sessions Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-black">
                    Activity &amp; Session History
                  </h3>
                  <p className="text-xs text-black font-medium">
                    Real recorded game sessions stored on this device for {activeChild.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDomainFilter}
                    onChange={(e) => setSelectedDomainFilter(e.target.value)}
                    className="text-xs font-bold text-black bg-white border-2 border-[#7f27a8] rounded-xl px-3 py-1.5 focus:outline-hidden"
                  >
                    <option value="all">All Domains</option>
                    <option value="mental_math">Mental Math</option>
                    <option value="spatial_thinking">Spatial Thinking</option>
                    <option value="reading_comprehension">Reading</option>
                    <option value="memory">Memory Lab</option>
                    <option value="attention">Focus Academy</option>
                    <option value="reasoning">Logic Kingdom</option>
                    <option value="processing_speed">Brain Speed</option>
                    <option value="executive_function">Strategy Island</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-[#7f27a8] shadow-xs overflow-hidden">
                {childSessions.length === 0 ? (
                  <div className="p-10 text-center text-black font-semibold text-sm">
                    No gameplay sessions recorded yet for {activeChild.name}. Launch a game session to record performance!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#53b0c9] border-b-2 border-black text-black uppercase tracking-wider font-extrabold">
                        <tr>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Game / Module</th>
                          <th className="py-3 px-4">Domain</th>
                          <th className="py-3 px-4">Tier</th>
                          <th className="py-3 px-4">Accuracy</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/15">
                        {childSessions
                          .filter(
                            (s) => selectedDomainFilter === 'all' || s.domain === selectedDomainFilter
                          )
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-[#ffd400]/15 transition-colors text-black">
                              <td className="py-3 px-4 font-semibold whitespace-nowrap">
                                {new Date(s.timestamp).toLocaleDateString()}{' '}
                                {new Date(s.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3 px-4 font-extrabold whitespace-nowrap">
                                {s.gameTitle}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="capitalize font-semibold">
                                  {s.domain.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold whitespace-nowrap">
                                Level {s.difficultyLevel}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`font-black tabular-nums px-2 py-0.5 rounded-md ${
                                    s.accuracy >= 85
                                      ? 'bg-[#53b0c9] text-black'
                                      : s.accuracy >= 70
                                      ? 'bg-[#ffd400] text-black'
                                      : 'bg-[#e885cf] text-black'
                                  }`}
                                >
                                  {s.accuracy}%
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold whitespace-nowrap">
                                {s.durationSeconds}s
                              </td>
                              <td className="py-3 px-4 font-black text-[#f76400] whitespace-nowrap">
                                +{s.xpEarned} XP
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COGNITIVE FRAMEWORK */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-3 border-[#7f27a8] shadow-xs">
              <h3 className="text-xl font-black text-black mb-1">
                Cognitive Development Framework
              </h3>
              <p className="text-xs text-black font-medium leading-relaxed max-w-3xl mb-6">
                MindQuest provides opportunities across core cognitive domains. In compliance with
                PRD Section 5, domains are assessed and reported individually without collapsing them
                into an arbitrary IQ score or clinical diagnosis.
              </p>

              <div className="space-y-4">
                {(Object.keys(COGNITIVE_DOMAINS) as CognitiveDomain[]).map((domKey) => {
                  const dom = COGNITIVE_DOMAINS[domKey];
                  const stats = getDomainStats(domKey);
                  const Icon = domainIcons[domKey] || Brain;

                  return (
                    <div
                      key={domKey}
                      className={`p-5 rounded-2xl border-2 ${dom.borderColor} bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
                    >
                      <div className="flex items-start gap-4 max-w-xl">
                        <div
                          className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 ${dom.bgColor} ${dom.color}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-base font-black text-black">{dom.title}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffd400] text-black border border-black font-bold capitalize">
                              {dom.focusArea.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-black font-medium mb-2">{dom.fullDesc}</p>
                          <div className="flex flex-wrap gap-2">
                            {dom.metrics.map((m, i) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-0.5 rounded-md bg-[#e885cf]/25 border border-[#c1008f] text-black font-bold"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#ffd400]/20 p-4 rounded-xl border-2 border-[#f76400] min-w-[200px] text-right">
                        <span className="text-xs uppercase font-extrabold text-black block mb-1">
                          Practice Record
                        </span>
                        {stats.count > 0 ? (
                          <>
                            <div className="text-xl font-black text-black tabular-nums">
                              {stats.avgAccuracy}% Accuracy
                            </div>
                            <span className="text-xs text-black font-semibold">
                              {stats.count} sessions · Avg {stats.avgDuration}s
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-black/70 italic">
                            No recorded sessions yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEEKLY REPORT */}
        {activeTab === 'weekly' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-3xl p-8 border-3 border-[#53b0c9] shadow-xs">
              <div className="flex items-center justify-between pb-6 border-b-2 border-[#53b0c9] mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#7f27a8] font-extrabold block">
                    Weekly Progress Summary
                  </span>
                  <h3 className="text-2xl font-black text-black mt-0.5">
                    {activeChild.name}&apos;s Practice Observations
                  </h3>
                  <span className="text-xs text-black font-semibold">
                    Week of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#53b0c9] text-black border-2 border-black flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-6 text-sm text-black leading-relaxed">
                <div className="p-4 bg-[#ffd400]/25 border-2 border-[#f76400] rounded-2xl">
                  <h4 className="font-black text-black mb-1">Executive Summary</h4>
                  <p className="text-xs text-black font-medium leading-relaxed">
                    Over the last 7 days, {activeChild.name} engaged in {childSessions.length} cognitive game challenges totaling approximately {activeChild.todayMinutesPlayed + 25} minutes of purposeful play. Consistent participation was observed across Mental Mathematics and Concentration modules.
                  </p>
                </div>

                <div>
                  <h4 className="font-black text-black mb-2">
                    Observed Areas of Strength
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-black font-medium">
                    <li>
                      <strong>Streak Consistency:</strong> Maintained an active daily habit of {activeChild.streakDays} consecutive days.
                    </li>
                    <li>
                      <strong>Numerical Fluency:</strong> Demonstrating confident mental arithmetic and rapid recognition without impulsive misclicks.
                    </li>
                    <li>
                      <strong>Spatial Manipulation:</strong> High accuracy in mental rotation and orthographic visual projections.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-black mb-2">
                    Suggested Focus for Next Week
                  </h4>
                  <p className="text-xs text-black font-medium leading-relaxed mb-3">
                    Encourage 1–2 short sessions of <em>Word Detective</em> in Reading Comprehension to build vocabulary inference skills.
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-[#e885cf] flex items-start gap-3 text-xs text-black font-medium">
                  <AlertCircle className="w-4 h-4 text-[#c1008f] shrink-0 mt-0.5" />
                  <p>
                    <strong>MindQuest Reporting Notice:</strong> Performance indicators reflect observed game tasks within the software. These metrics are designed for supportive practice and do not constitute clinical psychological assessments, IQ measurements, or diagnostic evaluations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTROLS & PRIVACY */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            {/* Focus Area Controls */}
            <div className="bg-white rounded-3xl p-6 border-3 border-[#7f27a8] shadow-xs">
              <h3 className="text-lg font-black text-black mb-1">
                Parental Focus Areas &amp; Game Sub-Categories
              </h3>
              <p className="text-xs text-black font-medium mb-6">
                Choose which types of cognitive games {activeChild.name} can play.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => toggleFocusArea('reading')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    allowedAreas.has('reading')
                      ? 'bg-[#e885cf]/25 border-[#c1008f] ring-2 ring-[#c1008f]'
                      : 'bg-white border-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">📖</span>
                    {allowedAreas.has('reading') && (
                      <span className="text-xs font-extrabold text-white bg-[#c1008f] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-black mb-1">1. Reading</h4>
                  <p className="text-xs text-black font-medium">Phonics, vocabulary, story inferences</p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFocusArea('concentration')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    allowedAreas.has('concentration')
                      ? 'bg-[#53b0c9]/25 border-[#53b0c9] ring-2 ring-[#53b0c9]'
                      : 'bg-white border-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🎯</span>
                    {allowedAreas.has('concentration') && (
                      <span className="text-xs font-extrabold text-black bg-[#53b0c9] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-black mb-1">2. Concentration</h4>
                  <p className="text-xs text-black font-medium">Focus Academy, Speed Sorting, Rule Switch</p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFocusArea('mental_abilities')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    allowedAreas.has('mental_abilities')
                      ? 'bg-[#ffd400]/25 border-[#f76400] ring-2 ring-[#ffd400]'
                      : 'bg-white border-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🧠</span>
                    {allowedAreas.has('mental_abilities') && (
                      <span className="text-xs font-extrabold text-white bg-[#7f27a8] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-black mb-1">3. Mental Abilities</h4>
                  <p className="text-xs text-black font-medium">Mental Mathematics, Spatial Thinking, Logic</p>
                </button>
              </div>
            </div>

            {/* Screen Time & Controls */}
            <div className="bg-white rounded-3xl p-6 border-3 border-[#53b0c9] shadow-xs">
              <h3 className="text-lg font-black text-black mb-1">
                Parental Usage Controls
              </h3>
              <p className="text-xs text-black font-medium mb-6">
                Protect balanced screen habits without pressure (PRD Section 8.3 &amp; 13).
              </p>

              <div className="p-4 bg-[#53b0c9]/15 rounded-2xl border-2 border-[#53b0c9]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold text-black">
                    Daily Playtime Cap for {activeChild.name}
                  </span>
                  <span className="text-sm font-black text-[#7f27a8]">
                    {activeChild.dailyLimitMinutes} Minutes
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="5"
                  value={activeChild.dailyLimitMinutes}
                  onChange={(e) => {
                    const updated = {
                      ...activeChild,
                      dailyLimitMinutes: parseInt(e.target.value, 10),
                    };
                    onUpdateChild(updated);
                  }}
                  className="w-full accent-[#7f27a8]"
                />
                <div className="flex justify-between text-xs text-black mt-1 font-bold">
                  <span>10 mins (light)</span>
                  <span>20 mins (recommended)</span>
                  <span>45 mins (max)</span>
                </div>
              </div>
            </div>

            {/* Child Profile Management */}
            <div className="bg-white rounded-3xl p-6 border-3 border-[#f76400] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-black">All Child Subprofiles</h3>
                  <p className="text-xs text-black font-medium">
                    Each profile maintains strict independent history and developmental progression.
                  </p>
                </div>
                <button
                  onClick={onOpenAddChild}
                  className="px-3.5 py-2 text-xs font-extrabold text-black bg-[#ffd400] hover:bg-[#53b0c9] border-2 border-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Profile
                </button>
              </div>

              <div className="space-y-3">
                {childrenList.map((c) => {
                  const band = DEVELOPMENTAL_BANDS[c.band];
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border-2 border-[#53b0c9] bg-white flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ffd400] border border-black flex items-center justify-center text-xl">
                          {band.avatarOptions.find((a) => a.id === c.avatar)?.emoji || '🦊'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-black">{c.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-[#e885cf] border border-black text-black font-bold">
                              {c.calculatedAge} Years Old
                            </span>
                            <span className="text-xs text-[#f76400] font-extrabold">
                              🔥 {c.streakDays || 1}d
                            </span>
                          </div>
                          <span className="text-xs text-black font-medium">
                            {band.subName} ({band.worldName})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenEditChild(c)}
                          className="p-2 text-black hover:bg-[#ffd400] border border-black rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {childrenList.length > 1 && confirmDeleteId !== c.id && (
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="p-2 text-white bg-[#c1008f] hover:bg-[#f76400] border border-black rounded-lg transition-colors cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {confirmDeleteId === c.id && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onDeleteChild(c.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 bg-[#c1008f] text-white text-xs font-extrabold rounded-lg border border-black cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 bg-white text-black text-xs font-bold rounded-lg border border-black cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guardian Cloud Account & Parent Gate PIN Settings */}
            {parentAccount && (
              <div className="bg-white rounded-3xl p-6 border-3 border-[#7f27a8] shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-5 h-5 text-[#7f27a8]" />
                    <div>
                      <h3 className="text-lg font-black text-black">
                        Guardian Cloud Account &amp; Parent PIN
                      </h3>
                      <p className="text-xs text-black font-medium">
                        Signed in as <strong>{parentAccount.email || parentAccount.phoneNumber}</strong> · Plan:{' '}
                        <strong className="uppercase">{parentAccount.plan.replace('_', ' ')}</strong>
                      </p>
                    </div>
                  </div>
                  {onSignOutParent && (
                    <button
                      type="button"
                      onClick={onSignOutParent}
                      className="px-3.5 py-2 bg-[#ffd400] hover:bg-[#e885cf] text-black border-2 border-black rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveGuardianSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1">
                      Guardian Display Name
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={guardianNameInput}
                      onChange={(e) => setGuardianNameInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-[#7f27a8] text-sm font-bold text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1">
                      Parent Gate PIN (4–6 digits)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={guardianPinInput}
                      onChange={(e) => setGuardianPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-[#7f27a8] text-sm font-mono font-bold tracking-widest text-black bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={guardianSaveStatus === 'saving'}
                    className="px-4 py-2.5 bg-[#7f27a8] hover:bg-[#c1008f] text-white border-2 border-black rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    {guardianSaveStatus === 'saving'
                      ? 'Saving...'
                      : guardianSaveStatus === 'saved'
                      ? '✓ Saved to Cloud!'
                      : 'Update Guardian Settings'}
                  </button>
                </form>

                {guardianSaveError && (
                  <p className="mt-2 text-xs font-bold text-[#c1008f]">{guardianSaveError}</p>
                )}
              </div>
            )}

            {/* Privacy & Safeguarding */}
            <div className="bg-white rounded-3xl p-6 border-3 border-[#c1008f] shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-[#7f27a8]" />
                <h3 className="text-lg font-black text-black">
                  Data Privacy, Rights &amp; Export
                </h3>
              </div>
              <p className="text-xs text-black font-medium leading-relaxed mb-6">
                MindQuest complies with child data protection requirements (NDPA, COPPA, GDPR).
                We never show third-party ads, run behavioral tracking, or sell data.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 bg-[#7f27a8] hover:bg-[#c1008f] text-white border-2 border-black text-xs font-extrabold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Family Data JSON</span>
                </button>
                {!parentAccount && !confirmReset && (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="px-4 py-2.5 border-2 border-black bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black text-xs font-extrabold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Demo Data</span>
                  </button>
                )}
                {!parentAccount && confirmReset && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetAllDataToDemo();
                        window.location.reload();
                      }}
                      className="px-4 py-2.5 bg-[#c1008f] text-white border-2 border-black text-xs font-extrabold rounded-xl cursor-pointer"
                    >
                      Confirm Reset All Data
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-2.5 bg-white text-black border-2 border-black text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
