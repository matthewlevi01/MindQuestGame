import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  ChildAchievement,
  ChildProfile,
  CognitiveDomain,
  DevelopmentalBand,
  FocusArea,
  GameSession,
} from '../types';
import { calculateAge, getDevelopmentalBand } from '../utils/engine';

export type FamilyPlan = 'free' | 'family_premium';

export interface CloudParentAccount {
  uid: string;
  name: string;
  email: string;
  pin: string;
  plan: FamilyPlan;
  termsAccepted: boolean;
  consentGiven: boolean;
  createdAt: string;
  updatedAt?: string;
}

const VALID_BANDS: DevelopmentalBand[] = [
  'young_explorers',
  'senior_explorers',
  'discoverers',
  'masters',
];

const VALID_FOCUS_AREAS: FocusArea[] = [
  'reading',
  'concentration',
  'mental_abilities',
];

const VALID_DOMAINS: CognitiveDomain[] = [
  'memory',
  'attention',
  'reasoning',
  'processing_speed',
  'cognitive_flexibility',
  'executive_function',
  'mental_math',
  'spatial_thinking',
  'reading_comprehension',
];

function sanitizeId(raw: string, fallbackPrefix = 'id'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}-${Date.now()}`;
}

function clampInt(value: number, min: number, max: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : min);
  return Math.max(min, Math.min(max, rounded));
}

function clampNumber(value: number, min: number, max: number): number {
  const num = Number.isFinite(value) ? value : min;
  return Math.max(min, Math.min(max, num));
}

function formatIsoTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return new Date().toISOString();
}

function sanitizeBirthDate(raw: string): string {
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(raw)) {
    return raw;
  }
  return '2018-06-15';
}

function sanitizeAllowedFocusAreas(areas?: FocusArea[]): FocusArea[] {
  const filtered = (areas || []).filter((a) => VALID_FOCUS_AREAS.includes(a));
  const unique = Array.from(new Set(filtered)).slice(0, 3);
  return unique.length > 0 ? unique : ['reading', 'concentration', 'mental_abilities'];
}

function sanitizeStreakBadges(badges?: string[]): string[] {
  return (badges || ['streak_1'])
    .filter((b) => typeof b === 'string' && b.length > 0)
    .map((b) => b.slice(0, 40))
    .slice(0, 20);
}

function sanitizeAchievements(achievements?: ChildAchievement[]): ChildAchievement[] {
  return (achievements || [])
    .filter((a) => a && typeof a.id === 'string' && typeof a.domain === 'string')
    .slice(0, 30)
    .map((a) => ({
      id: a.id.slice(0, 64),
      domain: VALID_DOMAINS.includes(a.domain) ? a.domain : 'memory',
      unlockedAt: (a.unlockedAt || new Date().toISOString()).slice(0, 40),
    }));
}

export async function signInParentWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutParent(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getParentProfile(
  uid: string
): Promise<CloudParentAccount | null> {
  const path = `parents/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'parents', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: String(data.uid || uid),
      name: String(data.name || 'Guardian'),
      email: String(data.email || ''),
      pin: String(data.pin || '1234'),
      plan: data.plan === 'family_premium' ? 'family_premium' : 'free',
      termsAccepted: Boolean(data.termsAccepted),
      consentGiven: Boolean(data.consentGiven),
      createdAt: formatIsoTimestamp(data.createdAt),
      updatedAt: data.updatedAt ? formatIsoTimestamp(data.updatedAt) : undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createParentProfile(input: {
  uid: string;
  name: string;
  email: string;
  pin: string;
  plan: FamilyPlan;
  termsAccepted: boolean;
  consentGiven: boolean;
}): Promise<CloudParentAccount> {
  const cleanUid = sanitizeId(input.uid, 'parent');
  const cleanName = input.name.trim().slice(0, 80) || 'MindQuest Guardian';
  const cleanEmail = input.email.trim().slice(0, 160);
  const cleanPin = /^[0-9]{4,6}$/.test(input.pin.trim()) ? input.pin.trim() : '1234';
  const cleanPlan: FamilyPlan = input.plan === 'family_premium' ? 'family_premium' : 'free';

  const path = `parents/${cleanUid}`;
  try {
    await setDoc(doc(db, 'parents', cleanUid), {
      uid: cleanUid,
      name: cleanName,
      email: cleanEmail,
      pin: cleanPin,
      plan: cleanPlan,
      termsAccepted: true,
      consentGiven: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: cleanUid,
      name: cleanName,
      email: cleanEmail,
      pin: cleanPin,
      plan: cleanPlan,
      termsAccepted: true,
      consentGiven: true,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateParentProfile(
  uid: string,
  updates: { name?: string; pin?: string; plan?: FamilyPlan }
): Promise<void> {
  const cleanUid = sanitizeId(uid, 'parent');
  const path = `parents/${cleanUid}`;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.name === 'string') {
    payload.name = updates.name.trim().slice(0, 80) || 'MindQuest Guardian';
  }
  if (typeof updates.pin === 'string' && /^[0-9]{4,6}$/.test(updates.pin.trim())) {
    payload.pin = updates.pin.trim();
  }
  if (updates.plan === 'free' || updates.plan === 'family_premium') {
    payload.plan = updates.plan;
  }

  try {
    await updateDoc(doc(db, 'parents', cleanUid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

function mapDocToChildProfile(data: Record<string, unknown>, docId: string, parentUid: string): ChildProfile {
  const birthDate = sanitizeBirthDate(String(data.birthDate || '2018-06-15'));
  const calculatedAge = clampInt(calculateAge(birthDate), 3, 18);
  const rawBand = String(data.band || '');
  const band: DevelopmentalBand = VALID_BANDS.includes(rawBand as DevelopmentalBand)
    ? (rawBand as DevelopmentalBand)
    : getDevelopmentalBand(calculatedAge);

  const acc = (data.accessibility as Record<string, unknown> | undefined) || {};

  return {
    id: String(data.id || docId),
    parentId: String(data.parentId || parentUid),
    name: String(data.name || 'Explorer'),
    birthDate,
    calculatedAge,
    band,
    avatar: String(data.avatar || 'fox'),
    accessibility: {
      highContrast: Boolean(acc.highContrast),
      reducedMotion: Boolean(acc.reducedMotion),
      soundEnabled: acc.soundEnabled !== false,
      soundVolume: clampNumber(Number(acc.soundVolume ?? 0.8), 0, 1),
      largeText: Boolean(acc.largeText),
    },
    dailyLimitMinutes: clampInt(Number(data.dailyLimitMinutes ?? 20), 5, 120),
    todayMinutesPlayed: clampInt(Number(data.todayMinutesPlayed ?? 0), 0, 600),
    streakDays: clampInt(Number(data.streakDays ?? 1), 0, 5000),
    bestStreak: clampInt(Number(data.bestStreak ?? 1), 0, 5000),
    lastActiveDate:
      typeof data.lastActiveDate === 'string' && data.lastActiveDate.length > 0
        ? data.lastActiveDate.slice(0, 10)
        : undefined,
    streakBadges: sanitizeStreakBadges(data.streakBadges as string[] | undefined),
    achievements: sanitizeAchievements(data.achievements as ChildAchievement[] | undefined),
    allowedFocusAreas: sanitizeAllowedFocusAreas(data.allowedFocusAreas as FocusArea[] | undefined),
    totalXp: clampInt(Number(data.totalXp ?? 0), 0, 10000000),
    level: clampInt(Number(data.level ?? 1), 1, 1000),
    createdAt: formatIsoTimestamp(data.createdAt),
  };
}

export function subscribeToChildren(
  parentUid: string,
  onData: (children: ChildProfile[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `parents/${parentUid}/children`;
  const q = query(
    collection(db, 'parents', parentUid, 'children'),
    where('parentId', '==', parentUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapDocToChildProfile(d.data() as Record<string, unknown>, d.id, parentUid))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function createChildInFirestore(
  parentUid: string,
  child: ChildProfile
): Promise<ChildProfile> {
  const cleanParentUid = sanitizeId(parentUid, 'parent');
  const cleanChildId = sanitizeId(child.id || `child-${Date.now()}`, 'child');
  const birthDate = sanitizeBirthDate(child.birthDate);
  const age = clampInt(calculateAge(birthDate), 3, 18);
  const band = getDevelopmentalBand(age);

  const path = `parents/${cleanParentUid}/children/${cleanChildId}`;

  const payload: Record<string, unknown> = {
    id: cleanChildId,
    parentId: cleanParentUid,
    name: child.name.trim().slice(0, 60) || 'Explorer',
    birthDate,
    calculatedAge: age,
    band,
    avatar: (child.avatar || 'fox').slice(0, 40),
    accessibility: {
      highContrast: Boolean(child.accessibility?.highContrast),
      reducedMotion: Boolean(child.accessibility?.reducedMotion),
      soundEnabled: child.accessibility?.soundEnabled !== false,
      soundVolume: clampNumber(Number(child.accessibility?.soundVolume ?? 0.8), 0, 1),
      largeText: Boolean(child.accessibility?.largeText),
    },
    dailyLimitMinutes: clampInt(child.dailyLimitMinutes ?? 20, 5, 120),
    todayMinutesPlayed: clampInt(child.todayMinutesPlayed ?? 0, 0, 600),
    streakDays: clampInt(child.streakDays ?? 1, 0, 5000),
    bestStreak: clampInt(Math.max(child.bestStreak ?? 1, child.streakDays ?? 1), 0, 5000),
    streakBadges: sanitizeStreakBadges(child.streakBadges),
    achievements: sanitizeAchievements(child.achievements),
    allowedFocusAreas: sanitizeAllowedFocusAreas(child.allowedFocusAreas),
    totalXp: clampInt(child.totalXp ?? 0, 0, 10000000),
    level: clampInt(child.level ?? 1, 1, 1000),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (child.lastActiveDate && child.lastActiveDate.trim().length > 0) {
    payload.lastActiveDate = child.lastActiveDate.trim().slice(0, 10);
  }

  try {
    await setDoc(doc(db, 'parents', cleanParentUid, 'children', cleanChildId), payload);
    return {
      ...child,
      id: cleanChildId,
      parentId: cleanParentUid,
      calculatedAge: age,
      band,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateChildSettingsInFirestore(
  parentUid: string,
  child: ChildProfile
): Promise<void> {
  const cleanParentUid = sanitizeId(parentUid, 'parent');
  const cleanChildId = sanitizeId(child.id, 'child');
  const birthDate = sanitizeBirthDate(child.birthDate);
  const age = clampInt(calculateAge(birthDate), 3, 18);
  const band = getDevelopmentalBand(age);

  const path = `parents/${cleanParentUid}/children/${cleanChildId}`;

  // Action 1 allowed fields ONLY:
  // 'name', 'birthDate', 'calculatedAge', 'band', 'avatar',
  // 'accessibility', 'dailyLimitMinutes', 'allowedFocusAreas', 'updatedAt'
  const payload = {
    name: child.name.trim().slice(0, 60) || 'Explorer',
    birthDate,
    calculatedAge: age,
    band,
    avatar: (child.avatar || 'fox').slice(0, 40),
    accessibility: {
      highContrast: Boolean(child.accessibility?.highContrast),
      reducedMotion: Boolean(child.accessibility?.reducedMotion),
      soundEnabled: child.accessibility?.soundEnabled !== false,
      soundVolume: clampNumber(Number(child.accessibility?.soundVolume ?? 0.8), 0, 1),
      largeText: Boolean(child.accessibility?.largeText),
    },
    dailyLimitMinutes: clampInt(child.dailyLimitMinutes ?? 20, 5, 120),
    allowedFocusAreas: sanitizeAllowedFocusAreas(child.allowedFocusAreas),
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'parents', cleanParentUid, 'children', cleanChildId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateChildProgressInFirestore(
  parentUid: string,
  child: ChildProfile
): Promise<void> {
  const cleanParentUid = sanitizeId(parentUid, 'parent');
  const cleanChildId = sanitizeId(child.id, 'child');
  const path = `parents/${cleanParentUid}/children/${cleanChildId}`;

  // Action 2 allowed fields ONLY:
  // 'todayMinutesPlayed', 'streakDays', 'bestStreak', 'lastActiveDate',
  // 'streakBadges', 'achievements', 'totalXp', 'level', 'updatedAt'
  const payload: Record<string, unknown> = {
    todayMinutesPlayed: clampInt(child.todayMinutesPlayed ?? 0, 0, 600),
    streakDays: clampInt(child.streakDays ?? 1, 0, 5000),
    bestStreak: clampInt(Math.max(child.bestStreak ?? 1, child.streakDays ?? 1), 0, 5000),
    streakBadges: sanitizeStreakBadges(child.streakBadges),
    achievements: sanitizeAchievements(child.achievements),
    totalXp: clampInt(child.totalXp ?? 0, 0, 10000000),
    level: clampInt(child.level ?? 1, 1, 1000),
    updatedAt: serverTimestamp(),
  };

  if (child.lastActiveDate && child.lastActiveDate.trim().length > 0) {
    payload.lastActiveDate = child.lastActiveDate.trim().slice(0, 10);
  }

  try {
    await updateDoc(doc(db, 'parents', cleanParentUid, 'children', cleanChildId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteChildInFirestore(
  parentUid: string,
  childId: string,
  sessionIdsToDelete: string[] = []
): Promise<void> {
  const cleanParentUid = sanitizeId(parentUid, 'parent');
  const cleanChildId = sanitizeId(childId, 'child');
  const path = `parents/${cleanParentUid}/children/${cleanChildId}`;

  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'parents', cleanParentUid, 'children', cleanChildId));
    for (const sid of sessionIdsToDelete.slice(0, 400)) {
      const cleanSid = sanitizeId(sid, 'session');
      batch.delete(doc(db, 'parents', cleanParentUid, 'sessions', cleanSid));
    }
    await batch.commit();
  } catch (error) {
    // Fallback to single child delete if batch fails
    try {
      await deleteDoc(doc(db, 'parents', cleanParentUid, 'children', cleanChildId));
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.DELETE, path);
    }
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToSessions(
  parentUid: string,
  onData: (sessions: GameSession[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `parents/${parentUid}/sessions`;
  const q = query(
    collection(db, 'parents', parentUid, 'sessions'),
    where('parentId', '==', parentUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: GameSession[] = snapshot.docs
        .map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            id: String(data.id || d.id),
            childId: String(data.childId || ''),
            gameId: String(data.gameId || ''),
            gameTitle: String(data.gameTitle || ''),
            domain: VALID_DOMAINS.includes(data.domain as CognitiveDomain)
              ? (data.domain as CognitiveDomain)
              : 'memory',
            focusArea: VALID_FOCUS_AREAS.includes(data.focusArea as FocusArea)
              ? (data.focusArea as FocusArea)
              : 'mental_abilities',
            band: VALID_BANDS.includes(data.band as DevelopmentalBand)
              ? (data.band as DevelopmentalBand)
              : 'young_explorers',
            timestamp: String(data.timestamp || formatIsoTimestamp(data.createdAt)),
            durationSeconds: Number(data.durationSeconds ?? 0),
            difficultyLevel: clampInt(Number(data.difficultyLevel ?? 1), 1, 5),
            accuracy: clampNumber(Number(data.accuracy ?? 0), 0, 100),
            score: typeof data.score === 'number' ? data.score : undefined,
            timedOut: typeof data.timedOut === 'boolean' ? data.timedOut : undefined,
            responseTimeMs:
              typeof data.responseTimeMs === 'number' ? data.responseTimeMs : undefined,
            mistakes: clampInt(Number(data.mistakes ?? 0), 0, 1000),
            hintsUsed: clampInt(Number(data.hintsUsed ?? 0), 0, 1000),
            xpEarned: clampInt(Number(data.xpEarned ?? 0), 0, 10000),
            completed: Boolean(data.completed),
          };
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function createSessionInFirestore(
  parentUid: string,
  session: GameSession
): Promise<void> {
  const cleanParentUid = sanitizeId(parentUid, 'parent');
  const cleanSessionId = sanitizeId(session.id || `sess-${Date.now()}`, 'sess');
  const cleanChildId = sanitizeId(session.childId, 'child');
  const path = `parents/${cleanParentUid}/sessions/${cleanSessionId}`;

  const domain: CognitiveDomain = VALID_DOMAINS.includes(session.domain)
    ? session.domain
    : 'memory';
  const focusArea: FocusArea = VALID_FOCUS_AREAS.includes(session.focusArea)
    ? session.focusArea
    : 'mental_abilities';
  const band: DevelopmentalBand = VALID_BANDS.includes(session.band)
    ? session.band
    : 'young_explorers';

  // Omit `details` (not permitted in GameSession Firestore rules) and any undefined optionals
  const payload: Record<string, unknown> = {
    id: cleanSessionId,
    parentId: cleanParentUid,
    childId: cleanChildId,
    gameId: (session.gameId || 'unknown').slice(0, 64),
    gameTitle: (session.gameTitle || 'MindQuest Activity').slice(0, 120),
    domain,
    focusArea,
    band,
    timestamp: (session.timestamp || new Date().toISOString()).slice(0, 40),
    durationSeconds: clampNumber(session.durationSeconds ?? 0, 0, 7200),
    difficultyLevel: clampInt(session.difficultyLevel ?? 1, 1, 5),
    accuracy: clampNumber(session.accuracy ?? 0, 0, 100),
    mistakes: clampInt(session.mistakes ?? 0, 0, 1000),
    hintsUsed: clampInt(session.hintsUsed ?? 0, 0, 1000),
    xpEarned: clampInt(session.xpEarned ?? 0, 0, 10000),
    completed: Boolean(session.completed),
    createdAt: serverTimestamp(),
  };

  if (typeof session.score === 'number' && Number.isFinite(session.score)) {
    payload.score = clampNumber(session.score, 0, 10000);
  }
  if (typeof session.timedOut === 'boolean') {
    payload.timedOut = session.timedOut;
  }
  if (typeof session.responseTimeMs === 'number' && Number.isFinite(session.responseTimeMs)) {
    payload.responseTimeMs = clampNumber(session.responseTimeMs, 0, 600000);
  }

  try {
    await setDoc(doc(db, 'parents', cleanParentUid, 'sessions', cleanSessionId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
