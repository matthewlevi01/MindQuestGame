/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { AppView, ChildProfile, GameSession, StreakMilestone, AchievementDefinition } from './types';
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
import { processDailyActivity } from './utils/streak';
import { evaluateAndAwardAchievements } from './utils/achievements';
import { soundEngine } from './utils/sound';
import { setVoicePreferences, stopVoice } from './utils/voiceService';
import {
  CloudParentAccount,
  FamilyPlan,
  createChildInFirestore,
  createSessionInFirestore,
  deleteChildInFirestore,
  getParentProfile,
  signOutParent,
  subscribeToAuthState,
  subscribeToChildren,
  subscribeToSessions,
  updateChildProgressInFirestore,
  updateChildSettingsInFirestore,
  updateParentProfile,
} from './services/firebaseService';

import { MarketingView } from './components/marketing/MarketingView';
import { ParentAuthView } from './components/parent/ParentAuthView';
import { ParentDashboardView } from './components/parent/ParentDashboardView';
import { ParentGateModal } from './components/parent/ParentGateModal';
import { AddChildModal } from './components/parent/AddChildModal';
import { ChildSelectorScreen } from './components/child/ChildSelectorScreen';
import { ChildWorldView } from './components/child/ChildWorldView';
import { LeaderboardModal } from './components/leaderboard/LeaderboardModal';
import { StreakModal } from './components/streak/StreakModal';

// Mini-Games
import { MemoryLabGame } from './components/games/MemoryLabGame';
import { FocusAcademyGame } from './components/games/FocusAcademyGame';
import { LogicKingdomGame } from './components/games/LogicKingdomGame';
import { BrainSpeedGame } from './components/games/BrainSpeedGame';
import { StrategyIslandGame } from './components/games/StrategyIslandGame';
import { MentalMathGame } from './components/games/MentalMathGame';
import { SpatialThinkingGame } from './components/games/SpatialThinkingGame';
import { ReadingDetectiveGame } from './components/games/ReadingDetectiveGame';
import { FacesAndThingsGame, MiniGameMode } from './components/faces-and-things/FacesAndThingsGame';

const FACES_GAME_MODES: Record<string, { mode: MiniGameMode; title: string }> = {
  faces_who_is_this: { mode: 'who_is_this', title: 'Faces & Things: Who or What?' },
  faces_who_is_here: { mode: 'who_is_here', title: 'Faces & Things: Spatial Grid' },
  faces_who_is_missing: { mode: 'who_is_missing', title: 'Faces & Things: Who Is Missing?' },
  faces_who_owns_what: { mode: 'who_owns_what', title: 'Faces & Things: Who Owns What?' },
  faces_who_moved: { mode: 'who_moved', title: 'Faces & Things: Who Moved?' },
  faces_position_tracker: { mode: 'position_tracker', title: 'Faces & Things: Live Shell Shuffle' },
  faces_whats_their_position: { mode: 'whats_their_position', title: 'Faces & Things: Number Lineup' },
  faces_who_sang_what: { mode: 'who_sang_what', title: 'Faces & Things: Who Sang What?' },
  faces_memory_train: { mode: 'memory_train', title: 'Faces & Things: Memory Train' },
  faces_treasure_map: { mode: 'find_the_treasure', title: 'Faces & Things: Treasure Map' },
  faces_creative_studio: { mode: 'creative_studio', title: 'Faces & Things: Story Studio' },
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('marketing');
  const [parentAuthMode, setParentAuthMode] = useState<'signup' | 'signin'>('signup');
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [activeChildId, setActiveChildIdState] = useState<string>('child-leo');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [loginNonce, setLoginNonce] = useState<number>(1);

  // Firebase Auth & Cloud Parent Account State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [parentAccount, setParentAccount] = useState<CloudParentAccount | null>(null);
  const [parentProfileChecked, setParentProfileChecked] = useState<boolean>(false);

  // Modals
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [parentGateTarget, setParentGateTarget] = useState<'parent_dashboard' | 'child_select'>('parent_dashboard');
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [newlyAwardedStreakMilestone, setNewlyAwardedStreakMilestone] = useState<StreakMilestone | null>(null);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<AchievementDefinition[]>([]);

  const isCloudAuthenticated = Boolean(authReady && authUser && parentAccount);
  const needsParentSignup = Boolean(authReady && authUser && parentProfileChecked && !parentAccount);

  const loadDemoData = useCallback(() => {
    const loadedProfiles = getChildrenProfiles();
    const loadedSessions = getAllSessions();
    const loadedActiveChildId = getActiveChildId();

    setProfiles(loadedProfiles);
    setSessions(loadedSessions);
    setActiveChildIdState(loadedActiveChildId);
  }, []);

  const syncParentAccountForUser = useCallback(
    async (user: User) => {
      setParentProfileChecked(false);
      try {
        const cloudParent = await getParentProfile(user.uid);
        setParentAccount(cloudParent);
        setParentProfileChecked(true);
        if (cloudParent) {
          setCurrentView((prev) => (prev === 'parent_auth' ? 'parent_dashboard' : prev));
        } else {
          // Authenticated via Google but hasn't finished Parent Sign-Up onboarding yet
          setCurrentView('parent_auth');
        }
      } catch {
        setParentAccount(null);
        setParentProfileChecked(true);
      }
    },
    []
  );

  // Subscribe to Firebase Authentication State
  useEffect(() => {
    loadDemoData();
    const unsubscribe = subscribeToAuthState((user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        void syncParentAccountForUser(user);
      } else {
        setParentAccount(null);
        setParentProfileChecked(true);
        loadDemoData();
      }
    });
    return () => unsubscribe();
  }, [loadDemoData, syncParentAccountForUser]);

  // Attach Firestore Real-Time Listeners ONLY when auth is ready & verified parent account exists
  useEffect(() => {
    if (!authReady || !authUser || !parentAccount) {
      return;
    }

    const unsubChildren = subscribeToChildren(
      authUser.uid,
      (cloudChildren) => {
        setProfiles(cloudChildren);
        setActiveChildIdState((prevId) => {
          if (cloudChildren.length === 0) return prevId;
          const exists = cloudChildren.some((c) => c.id === prevId);
          return exists ? prevId : cloudChildren[0].id;
        });
      },
      (err) => {
        console.error('Children subscription error:', err.message);
      }
    );

    const unsubSessions = subscribeToSessions(
      authUser.uid,
      (cloudSessions) => {
        setSessions(cloudSessions);
      },
      (err) => {
        console.error('Sessions subscription error:', err.message);
      }
    );

    return () => {
      unsubChildren();
      unsubSessions();
    };
  }, [authReady, authUser, parentAccount]);

  const activeChild = profiles.find((c) => c.id === activeChildId) || profiles[0];

  // Configure sound and voice preferences when active child changes
  useEffect(() => {
    if (activeChild) {
      soundEngine.setPreferences(
        activeChild.accessibility.soundEnabled,
        activeChild.accessibility.soundVolume
      );
      setVoicePreferences(
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

  // Navigate to Parent Sign-Up / Sign-In
  const handleGoToParentAuth = (mode: 'signup' | 'signin' = 'signup') => {
    setParentAuthMode(mode);
    setCurrentView('parent_auth');
  };

  // Launch a game
  const handleLaunchGame = (gameId: string) => {
    stopVoice();
    setActiveGameId(gameId);
    setCurrentView('child_game');
  };

  // Exit a game
  const handleExitGame = () => {
    stopVoice();
    setActiveGameId(null);
    setCurrentView('child_world');
  };

  // Finish a game session and record data + streak + domain achievement updates
  const handleFinishGame = (session: GameSession) => {
    if (isCloudAuthenticated && authUser) {
      const uid = authUser.uid;
      const targetChild = profiles.find((c) => c.id === session.childId) || activeChild;
      const nextSessions = [session, ...sessions];

      // Optimistic local state while Firestore real-time snapshot settles
      setSessions(nextSessions);

      void (async () => {
        await createSessionInFirestore(uid, session);
        if (targetChild) {
          const minutes = Math.ceil(session.durationSeconds / 60);
          const progressedChild: ChildProfile = {
            ...targetChild,
            todayMinutesPlayed: targetChild.todayMinutesPlayed + minutes,
            totalXp: targetChild.totalXp + session.xpEarned,
            level: Math.floor((targetChild.totalXp + session.xpEarned) / 100) + 1,
          };

          const processed = processDailyActivity(progressedChild);
          const evalResult = evaluateAndAwardAchievements(processed.updatedChild, nextSessions);

          await updateChildProgressInFirestore(uid, evalResult.updatedChild);

          if (evalResult.newlyUnlocked.length > 0) {
            setNewlyUnlockedAchievements((prev) => {
              const existingIds = new Set(prev.map((a) => a.id));
              return [
                ...prev,
                ...evalResult.newlyUnlocked.filter((a) => !existingIds.has(a.id)),
              ];
            });
          }

          if (processed.milestoneAwarded) {
            setNewlyAwardedStreakMilestone(processed.milestoneAwarded);
            setIsStreakModalOpen(true);
          }
        }
      })().catch((err) => {
        console.error('Failed to persist cloud game session:', err);
      });
      return;
    }

    // Local Demo Mode
    const { milestoneAwarded, achievementsAwarded } = recordGameSession(session);
    const updatedSessions = getAllSessions();
    const updatedProfiles = getChildrenProfiles();
    setSessions(updatedSessions);
    setProfiles(updatedProfiles);

    if (achievementsAwarded.length > 0) {
      setNewlyUnlockedAchievements((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        return [...prev, ...achievementsAwarded.filter((a) => !existingIds.has(a.id))];
      });
    }

    if (milestoneAwarded) {
      setNewlyAwardedStreakMilestone(milestoneAwarded);
      setIsStreakModalOpen(true);
    }
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
    if (isCloudAuthenticated && authUser) {
      const uid = authUser.uid;
      const isExisting = profiles.some((p) => p.id === child.id);
      const childWithParent: ChildProfile = { ...child, parentId: uid };
      setActiveChildIdState(childWithParent.id);
      setActiveChildId(childWithParent.id);

      void (isExisting
        ? updateChildSettingsInFirestore(uid, childWithParent)
        : createChildInFirestore(uid, childWithParent)
      ).catch((err) => {
        console.error('Failed to save cloud child profile:', err);
      });
      return;
    }

    saveChildProfile(child);
    const updated = getChildrenProfiles();
    setProfiles(updated);
    setActiveChildIdState(child.id);
    setActiveChildId(child.id);
  };

  // Delete child
  const handleDeleteChild = (childId: string) => {
    if (isCloudAuthenticated && authUser) {
      const uid = authUser.uid;
      const sessionIds = sessions.filter((s) => s.childId === childId).map((s) => s.id);
      void deleteChildInFirestore(uid, childId, sessionIds).catch((err) => {
        console.error('Failed to delete cloud child profile:', err);
      });
      const remaining = profiles.filter((p) => p.id !== childId);
      if (activeChildId === childId && remaining.length > 0) {
        setActiveChildIdState(remaining[0].id);
        setActiveChildId(remaining[0].id);
      }
      return;
    }

    deleteChildProfile(childId);
    const updated = getChildrenProfiles();
    setProfiles(updated);
    if (activeChildId === childId && updated.length > 0) {
      setActiveChildIdState(updated[0].id);
      setActiveChildId(updated[0].id);
    }
  };

  // Update cloud parent profile (Guardian name, PIN, plan)
  const handleUpdateParentAccount = async (updates: {
    name?: string;
    pin?: string;
    plan?: FamilyPlan;
  }) => {
    if (!authUser || !parentAccount) return;
    await updateParentProfile(authUser.uid, updates);
    setParentAccount((prev) =>
      prev
        ? {
            ...prev,
            name: updates.name ?? prev.name,
            pin: updates.pin ?? prev.pin,
            plan: updates.plan ?? prev.plan,
          }
        : prev
    );
  };

  // Sign out cloud parent
  const handleSignOutParent = () => {
    void signOutParent().then(() => {
      setParentAccount(null);
      setCurrentView('marketing');
      loadDemoData();
    });
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
    <div className="min-h-screen bg-white text-black">
      {/* 1. MARKETING / PUBLIC WEBSITE */}
      {currentView === 'marketing' && (
        <MarketingView
          onGoToParentPortal={() => {
            if (needsParentSignup) {
              setCurrentView('parent_auth');
            } else {
              setCurrentView('parent_dashboard');
            }
          }}
          onGoToParentAuth={handleGoToParentAuth}
          onGoToChildSelect={() => setCurrentView('child_select')}
          signedInParentName={parentAccount?.name || null}
        />
      )}

      {/* 1B. PARENT SIGN UP / SIGN IN */}
      {currentView === 'parent_auth' && (
        <ParentAuthView
          firebaseUser={authUser}
          needsProfileSetup={needsParentSignup}
          initialMode={parentAuthMode}
          onSignupComplete={(createdAccount, firstChildId) => {
            setParentAccount(createdAccount);
            setParentProfileChecked(true);
            if (firstChildId) {
              setActiveChildIdState(firstChildId);
              setActiveChildId(firstChildId);
            }
            setCurrentView('parent_dashboard');
          }}
          onExistingParentDetected={() => {
            if (authUser) {
              void syncParentAccountForUser(authUser);
            }
          }}
          onBackToMarketing={() => setCurrentView('marketing')}
          onContinueDemoMode={() => {
            loadDemoData();
            setCurrentView('child_select');
          }}
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
            setLoginNonce((n) => n + 1);
            setCurrentView('child_world');
          }}
          onGoToMarketing={() => setCurrentView('marketing')}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onUpdateChild={handleSaveChild}
          parentAccount={parentAccount}
          onUpdateParentAccount={handleUpdateParentAccount}
          onSignOutParent={handleSignOutParent}
          onOpenParentAuth={handleGoToParentAuth}
        />
      )}

      {/* 3. CHILD SELECTOR SCREEN */}
      {currentView === 'child_select' && (
        <ChildSelectorScreen
          childrenList={profiles}
          onSelectChild={(childId) => {
            handleSelectActiveChild(childId);
            setLoginNonce((n) => n + 1);
            setCurrentView('child_world');
          }}
          onOpenAddChild={() => {
            setEditingChild(null);
            setIsAddChildModalOpen(true);
          }}
          onGoToParentPortal={() => {
            if (needsParentSignup) {
              setCurrentView('parent_auth');
            } else {
              setCurrentView('parent_dashboard');
            }
          }}
          parentAccountName={parentAccount?.name || null}
          isCloudSynced={isCloudAuthenticated}
        />
      )}

      {/* 4. CHILD WORLD / ADVENTURE HUB */}
      {currentView === 'child_world' && activeChild && (
        <ChildWorldView
          child={activeChild}
          sessions={sessions.filter((s) => s.childId === activeChild.id)}
          loginSessionId={loginNonce}
          newlyUnlockedAchievements={newlyUnlockedAchievements}
          onDismissAchievementBanner={() => setNewlyUnlockedAchievements([])}
          onLaunchGame={handleLaunchGame}
          onRequestParentExit={() => requestParentAccess('parent_dashboard')}
          onToggleSound={handleToggleSound}
          onOpenStreakModal={() => {
            setNewlyAwardedStreakMilestone(null);
            setIsStreakModalOpen(true);
          }}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* 5. ACTIVE GAME VIEW */}
      {currentView === 'child_game' && activeChild && activeGameId && (
        <div
          className={
            FACES_GAME_MODES[activeGameId]
              ? 'min-h-screen w-full'
              : 'min-h-screen bg-[#53b0c9]/10 flex items-center justify-center py-6'
          }
        >
          {activeGameId === 'memory_pairs' && (
            <MemoryLabGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'focus_hunter' && (
            <FocusAcademyGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'logic_patterns' && (
            <LogicKingdomGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'speed_classifier' && (
            <BrainSpeedGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'strategy_route' && (
            <StrategyIslandGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'mental_math' && (
            <MentalMathGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'spatial_thinking' && (
            <SpatialThinkingGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {activeGameId === 'word_detective' && (
            <ReadingDetectiveGame
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              onFinish={handleFinishGame}
              onExit={handleExitGame}
            />
          )}

          {FACES_GAME_MODES[activeGameId] && (
            <FacesAndThingsGame
              key={`${activeGameId}-${loginNonce}`}
              child={activeChild}
              difficulty={currentDifficulty}
              loginSessionId={loginNonce}
              initialMode={FACES_GAME_MODES[activeGameId].mode}
              lockedMode={true}
              gameId={activeGameId}
              gameTitle={FACES_GAME_MODES[activeGameId].title}
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
        expectedPin={parentAccount?.pin}
      />

      {/* Add / Edit Child Profile Modal */}
      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        onSave={handleSaveChild}
        initialChild={editingChild}
        parentId={authUser?.uid || 'parent-main'}
      />

      {/* Leaderboard & Hall of Fame Modal */}
      {activeChild && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          activeChild={activeChild}
          sessions={sessions}
          childrenList={profiles}
        />
      )}

      {/* Daily Streak Modal */}
      {activeChild && (
        <StreakModal
          isOpen={isStreakModalOpen}
          onClose={() => setIsStreakModalOpen(false)}
          child={activeChild}
          newMilestone={newlyAwardedStreakMilestone}
        />
      )}
    </div>
  );
}
