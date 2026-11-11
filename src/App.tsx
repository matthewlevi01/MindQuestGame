/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, ChildProfile, GameSession } from './types';
import {
  getChildrenProfiles,
  saveChildProfile,
  deleteChildProfile,
  getAllSessions,
  recordGameSession,
  getActiveChildId,
  setActiveChildId,
} from './utils/storage';
import { calculateAdaptiveDifficulty } from './utils/engine';
import { soundEngine } from './utils/sound';

import { MarketingView } from './components/marketing/MarketingView';
import { ParentDashboardView } from './components/parent/ParentDashboardView';
import { ParentGateModal } from './components/parent/ParentGateModal';
import { AddChildModal } from './components/parent/AddChildModal';
import { ChildSelectorScreen } from './components/child/ChildSelectorScreen';
import { ChildWorldView } from './components/child/ChildWorldView';

import { MemoryLabGame } from './components/games/MemoryLabGame';
import { FocusAcademyGame } from './components/games/FocusAcademyGame';
import { LogicKingdomGame } from './components/games/LogicKingdomGame';
import { BrainSpeedGame } from './components/games/BrainSpeedGame';
import { StrategyIslandGame } from './components/games/StrategyIslandGame';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('marketing');
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [activeChildId, setActiveChildIdState] = useState<string>('child-leo');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Modals
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [parentGateTarget, setParentGateTarget] = useState<'parent_dashboard' | 'child_select'>('parent_dashboard');
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedProfiles = getChildrenProfiles();
    const loadedSessions = getAllSessions();
    const loadedActiveChildId = getActiveChildId();

    setProfiles(loadedProfiles);
    setSessions(loadedSessions);
    setActiveChildIdState(loadedActiveChildId);
  }, []);

  const activeChild = profiles.find((c) => c.id === activeChildId) || profiles[0];

  // Configure sound preferences when active child changes
  useEffect(() => {
    if (activeChild) {
      soundEngine.setPreferences(
        activeChild.accessibility.soundEnabled,
        activeChild.accessibility.soundVolume
      );
    }
  }, [activeChild]);

  // Handle switching active child
  const handleSelectActiveChild = (childId: string) => {
    setActiveChildIdState(childId);
    setActiveChildId(childId);
  };

  // Launch a game
  const handleLaunchGame = (gameId: string) => {
    setActiveGameId(gameId);
    setCurrentView('child_game');
  };

  // Exit a game
  const handleExitGame = () => {
    setActiveGameId(null);
    setCurrentView('child_world');
  };

  // Finish a game session and record data
  const handleFinishGame = (session: GameSession) => {
    recordGameSession(session);
    // Reload state
    setSessions(getAllSessions());
    setProfiles(getChildrenProfiles());
  };

  // Parent Gate Request
  const requestParentAccess = (target: 'parent_dashboard' | 'child_select') => {
    setParentGateTarget(target);
    setIsParentGateOpen(true);
  };

  const handleParentGateSuccess = () => {
    setIsParentGateOpen(false);
    setCurrentView(parentGateTarget);
  };

  // Save new or edited child
  const handleSaveChild = (child: ChildProfile) => {
    saveChildProfile(child);
    const updated = getChildrenProfiles();
    setProfiles(updated);
    setActiveChildIdState(child.id);
    setActiveChildId(child.id);
  };

  // Delete child
  const handleDeleteChild = (childId: string) => {
    deleteChildProfile(childId);
    const updated = getChildrenProfiles();
    setProfiles(updated);
    if (activeChildId === childId && updated.length > 0) {
      setActiveChildIdState(updated[0].id);
      setActiveChildId(updated[0].id);
    }
  };

  // Toggle child sound
  const handleToggleSound = () => {
    if (!activeChild) return;
    const updated: ChildProfile = {
      ...activeChild,
      accessibility: {
        ...activeChild.accessibility,
        soundEnabled: !activeChild.accessibility.soundEnabled,
      },
    };
    handleSaveChild(updated);
  };

  // Adaptive difficulty for active child and game
  const currentDifficulty = activeChild
    ? calculateAdaptiveDifficulty(sessions.filter((s) => s.childId === activeChild.id), activeGameId || undefined)
    : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. MARKETING / PUBLIC WEBSITE */}
      {currentView === 'marketing' && (
        <MarketingView
          onGoToParentPortal={() => setCurrentView('parent_dashboard')}
          onGoToChildSelect={() => setCurrentView('child_select')}
        />
      )}

      {/* 2. PARENT DASHBOARD & CONTROLS */}
      {currentView === 'parent_dashboard' && (
        <ParentDashboardView
          childrenList={profiles}
          activeChildId={activeChildId}
          onSelectActiveChild={handleSelectActiveChild}
          sessions={sessions}
          onOpenAddChild={() => {
            setEditingChild(null);
            setIsAddChildModalOpen(true);
          }}
          onOpenEditChild={(child) => {
            setEditingChild(child);
            setIsAddChildModalOpen(true);
          }}
          onDeleteChild={handleDeleteChild}
          onLaunchChildWorld={(childId) => {
            handleSelectActiveChild(childId);
            setCurrentView('child_world');
          }}
          onGoToMarketing={() => setCurrentView('marketing')}
        />
      )}

      {/* 3. CHILD SELECTOR SCREEN */}
      {currentView === 'child_select' && (
        <ChildSelectorScreen
          childrenList={profiles}
          onSelectChild={(childId) => {
            handleSelectActiveChild(childId);
            setCurrentView('child_world');
          }}
          onOpenAddChild={() => {
            setEditingChild(null);
            setIsAddChildModalOpen(true);
          }}
          onGoToParentPortal={() => setCurrentView('parent_dashboard')}
        />
      )}

      {/* 4. CHILD WORLD / ADVENTURE HUB */}
      {currentView === 'child_world' && activeChild && (
        <ChildWorldView
          child={activeChild}
          onLaunchGame={handleLaunchGame}
          onRequestParentExit={() => requestParentAccess('parent_dashboard')}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 5. ACTIVE GAME VIEW */}
      {currentView === 'child_game' && activeChild && activeGameId && (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center py-6">
          {activeGameId === 'memory_pairs' && (
            <MemoryLabGame
              child={activeChild}
              difficulty={currentDifficulty}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'focus_hunter' && (
            <FocusAcademyGame
              child={activeChild}
              difficulty={currentDifficulty}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'logic_patterns' && (
            <LogicKingdomGame
              child={activeChild}
              difficulty={currentDifficulty}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'speed_classifier' && (
            <BrainSpeedGame
              child={activeChild}
              difficulty={currentDifficulty}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'strategy_route' && (
            <StrategyIslandGame
              child={activeChild}
              difficulty={currentDifficulty}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}
        </div>
      )}

      {/* MODALS */}
      {/* Parent Verification Gate */}
      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={handleParentGateSuccess}
      />

      {/* Add / Edit Child Profile Modal */}
      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        onSave={handleSaveChild}
        initialChild={editingChild}
      />
    </div>
  );
}
