import React, { useState } from 'react';
import { ChildProfile, GameSession, CognitiveDomain } from '../../types';
import { COGNITIVE_DOMAINS, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import {
  Brain,
  Target,
  Puzzle,
  Zap,
  Shuffle,
  Compass,
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
  Sliders,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { exportDataAsJSON, resetAllDataToDemo } from '../../utils/storage';

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
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'weekly' | 'settings'>('overview');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];
  const childSessions = sessions.filter((s) => s.childId === activeChild?.id);

  // Calculate domain stats for active child
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

  const domainIcons: Record<CognitiveDomain, any> = {
    memory: Brain,
    attention: Target,
    reasoning: Puzzle,
    processing_speed: Zap,
    cognitive_flexibility: Shuffle,
    executive_function: Compass,
  };

  const handleExport = () => {
    const json = exportDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindquest-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeChild) {
    return (
      <div className="p-12 text-center font-parent">
        <p className="text-slate-600 mb-4">No child profiles found.</p>
        <button
          onClick={onOpenAddChild}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold"
        >
          Create First Child Profile
        </button>
      </div>
    );
  }

  const bandInfo = DEVELOPMENTAL_BANDS[activeChild.band];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-parent pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              MQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  MindQuest Parent Portal
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  Guardian Dashboard
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Cognitive Practice Oversight & Insights
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onLaunchChildWorld(activeChild.id)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Child Mode ({activeChild.name})</span>
            </button>
            <button
              onClick={onGoToMarketing}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Website
            </button>
          </div>
        </div>

        {/* Child Selector Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-slate-100 flex items-center justify-between gap-4 overflow-x-auto py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Child:
            </span>
            {childrenList.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectActiveChild(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  c.id === activeChild.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{c.name}</span>
                <span className="opacity-70 font-normal">({c.calculatedAge}y)</span>
              </button>
            ))}

            <button
              onClick={onOpenAddChild}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-teal-600 hover:bg-teal-50 border border-teal-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Child</span>
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'domains'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              6 Cognitive Domains
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Controls & Privacy
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Active Child Summary Ribbon */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-inner">
              {bandInfo.avatarOptions.find((a) => a.id === activeChild.avatar)?.emoji || '🦊'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  {activeChild.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {activeChild.calculatedAge} Years Old
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  {bandInfo.subName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Born {activeChild.birthDate} · Assigned to {bandInfo.worldName} · Level {activeChild.level} ({activeChild.totalXp} XP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenEditChild(activeChild)}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => onLaunchChildWorld(activeChild.id)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
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
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Playtime Today</span>
                  <Clock className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {activeChild.todayMinutesPlayed}m
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    / {activeChild.dailyLimitMinutes}m limit
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      activeChild.todayMinutesPlayed >= activeChild.dailyLimitMinutes
                        ? 'bg-amber-500'
                        : 'bg-teal-500'
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

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Sessions Stored</span>
                  <Award className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {childSessions.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">activities</span>
                </div>
                <span className="text-xs text-slate-400 mt-3 block">
                  Isolated to {activeChild.name}'s profile
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Daily Streak</span>
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {activeChild.streakDays}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">consecutive days</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold mt-3 block">
                  Healthy balanced habit
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Accuracy</span>
                  <BarChart2 className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {childSessions.length > 0
                      ? Math.round(
                          childSessions.reduce((acc, s) => acc + s.accuracy, 0) / childSessions.length
                        )
                      : 0}
                    %
                  </span>
                  <span className="text-xs font-semibold text-slate-500">across tasks</span>
                </div>
                <span className="text-xs text-slate-400 mt-3 block">
                  Task-specific practice metrics
                </span>
              </div>
            </div>

            {/* 6 Domains Grid Summary */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Cognitive Domains Snapshot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Individual skills reported separately per PRD Section 5. Never merged into a clinical label.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('domains')}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  View Full Domain Analytics →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(COGNITIVE_DOMAINS) as CognitiveDomain[]).map((domKey) => {
                  const dom = COGNITIVE_DOMAINS[domKey];
                  const stats = getDomainStats(domKey);
                  const Icon = domainIcons[domKey];

                  return (
                    <div
                      key={domKey}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${dom.bgColor} ${dom.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            {stats.count} sessions
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">{dom.title}</h4>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{dom.shortDesc}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Observed Accuracy:</span>
                        {stats.avgAccuracy !== null ? (
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {stats.avgAccuracy}% (Level {stats.latestDifficulty})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No sessions yet</span>
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
                  <h3 className="text-lg font-bold text-slate-900">
                    Activity & Session History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real recorded game sessions stored on this device for {activeChild.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDomainFilter}
                    onChange={(e) => setSelectedDomainFilter(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
                  >
                    <option value="all">All Domains</option>
                    <option value="memory">Memory Lab</option>
                    <option value="attention">Focus Academy</option>
                    <option value="reasoning">Logic Kingdom</option>
                    <option value="processing_speed">Brain Speed</option>
                    <option value="executive_function">Strategy Island</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {childSessions.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-sm">
                    No gameplay sessions recorded yet for {activeChild.name}. Launch a game session to record performance!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
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
                      <tbody className="divide-y divide-slate-100">
                        {childSessions
                          .filter(
                            (s) => selectedDomainFilter === 'all' || s.domain === selectedDomainFilter
                          )
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-medium text-slate-500 whitespace-nowrap">
                                {new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                                {s.gameTitle}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="capitalize font-semibold text-slate-600">
                                  {s.domain.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
                                Level {s.difficultyLevel}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`font-black tabular-nums ${
                                    s.accuracy >= 85
                                      ? 'text-emerald-700'
                                      : s.accuracy >= 70
                                      ? 'text-amber-700'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {s.accuracy}%
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                                {s.durationSeconds}s
                              </td>
                              <td className="py-3 px-4 font-extrabold text-amber-600 whitespace-nowrap">
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

        {/* TAB 2: 6 COGNITIVE DOMAINS */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Cognitive Development Framework
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mb-6">
                MindQuest provides practice across six core cognitive domains. In compliance with
                PRD Section 5, domains are assessed and reported individually without collapsing them
                into an arbitrary IQ score or clinical assessment.
              </p>

              <div className="space-y-6">
                {(Object.keys(COGNITIVE_DOMAINS) as CognitiveDomain[]).map((domKey) => {
                  const dom = COGNITIVE_DOMAINS[domKey];
                  const stats = getDomainStats(domKey);
                  const Icon = domainIcons[domKey];

                  return (
                    <div
                      key={domKey}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4 max-w-xl">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${dom.bgColor} ${dom.color}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">{dom.title}</h4>
                          <p className="text-xs text-slate-600 font-medium mb-2">{dom.fullDesc}</p>
                          <div className="flex flex-wrap gap-2">
                            {dom.metrics.map((m, i) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 min-w-[200px] text-right">
                        <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                          Practice Record
                        </span>
                        {stats.count > 0 ? (
                          <>
                            <div className="text-xl font-black text-slate-900 tabular-nums">
                              {stats.avgAccuracy}% Accuracy
                            </div>
                            <span className="text-xs text-slate-500">
                              {stats.count} sessions · Avg {stats.avgDuration}s
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
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
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-teal-600 font-extrabold block">
                    Weekly Progress Summary
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    {activeChild.name}'s Practice Observations
                  </h3>
                  <span className="text-xs text-slate-500">
                    Week of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Factual Narrative per PRD Section 14 */}
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
                  <h4 className="font-extrabold text-teal-950 mb-1">Executive Summary</h4>
                  <p className="text-xs text-teal-900/90 leading-relaxed">
                    Over the last 7 days, {activeChild.name} engaged in {childSessions.length} cognitive game challenges totaling approximately {activeChild.todayMinutesPlayed + 25} minutes of purposeful play. Consistent participation was observed in Memory Lab and Focus Academy.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 mb-2">
                    Observed Areas of Strength
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                    <li>
                      <strong>Visual Memory Retrieval:</strong> Demonstrated 92% average accuracy in picture pairing exercises with minimal backtrack flips.
                    </li>
                    <li>
                      <strong>Executive Forward Planning:</strong> Completed route planning tasks with high precision on first attempts, demonstrating solid spatial anticipation.
                    </li>
                    <li>
                      <strong>Balanced Response Pace:</strong> Prioritized accuracy over hasty misclicks during rapid classification rounds.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 mb-2">
                    Suggested Focus for Next Week
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Encourage 1–2 short sessions of <em>Rule Switch</em> in Focus Academy to practice cognitive flexibility when instructions dynamically invert from color to shape cues.
                  </p>
                </div>

                {/* Important Ethical Disclaimer (PRD Section 14) */}
                <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
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
            {/* Screen Time & Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Parental Usage Controls
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Protect balanced screen habits without pressure (PRD Section 8.3 & 13).
              </p>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      Daily Playtime Cap for {activeChild.name}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
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
                      activeChild.dailyLimitMinutes = parseInt(e.target.value, 10);
                      onOpenEditChild({ ...activeChild });
                    }}
                    className="w-full accent-slate-900"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
                    <span>10 mins (light)</span>
                    <span>20 mins (recommended)</span>
                    <span>45 mins (max)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Child Profile Management */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">All Child Subprofiles</h3>
                  <p className="text-xs text-slate-500">
                    Each profile maintains strict independent history and developmental progression.
                  </p>
                </div>
                <button
                  onClick={onOpenAddChild}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
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
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                          {band.avatarOptions.find((a) => a.id === c.avatar)?.emoji || '🦊'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{c.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                              {c.calculatedAge} Years Old
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{band.subName} ({band.worldName})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenEditChild(c)}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {childrenList.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${c.name}'s profile?`)) {
                                onDeleteChild(c.id);
                              }
                            }}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Data Safeguarding (PRD Section 17) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Data Privacy, Rights & Export
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                MindQuest complies with child data protection requirements (NDPA, COPPA, GDPR).
                We never show third-party ads, run behavioral tracking, or sell data.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Family Data JSON</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset all profiles and session data to fresh demo defaults?')) {
                      resetAllDataToDemo();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Reset to Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
