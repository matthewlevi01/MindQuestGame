import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Shield,
  Check,
  Lock,
  Sparkles,
  ArrowLeft,
  UserPlus,
  LogIn,
  AlertCircle,
  Loader2,
  LogOut,
  Users,
} from 'lucide-react';
import { ChildProfile } from '../../types';
import { calculateAge, getDevelopmentalBand, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import {
  CloudParentAccount,
  FamilyPlan,
  createChildInFirestore,
  createParentProfile,
  signInParentWithGoogle,
  signOutParent,
} from '../../services/firebaseService';

interface ParentAuthViewProps {
  firebaseUser: User | null;
  needsProfileSetup: boolean;
  initialMode?: 'signup' | 'signin';
  onSignupComplete: (account: CloudParentAccount, firstChildId?: string) => void;
  onExistingParentDetected: () => void;
  onBackToMarketing: () => void;
  onContinueDemoMode: () => void;
}

export const ParentAuthView: React.FC<ParentAuthViewProps> = ({
  firebaseUser,
  needsProfileSetup,
  initialMode = 'signup',
  onSignupComplete,
  onExistingParentDetected,
  onBackToMarketing,
  onContinueDemoMode,
}) => {
  const [authTab, setAuthTab] = useState<'signup' | 'signin'>(initialMode);
  const [authLoading, setAuthLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Onboarding Form State (Step 2)
  const [guardianName, setGuardianName] = useState('');
  const [pin, setPin] = useState('1234');
  const [plan, setPlan] = useState<FamilyPlan>('free');
  const [childSetupMode, setChildSetupMode] = useState<'custom' | 'starter'>('custom');
  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('2018-06-15');
  const [childAvatar, setChildAvatar] = useState('fox');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (firebaseUser) {
      setGuardianName((prev) => prev || firebaseUser.displayName || 'MindQuest Guardian');
    }
  }, [firebaseUser]);

  const previewAge = calculateAge(childBirthDate);
  const previewBand = getDevelopmentalBand(previewAge);
  const previewBandInfo = DEVELOPMENTAL_BANDS[previewBand];

  useEffect(() => {
    const validAvatars = previewBandInfo.avatarOptions.map((a) => a.id);
    if (!validAvatars.includes(childAvatar) && validAvatars.length > 0) {
      setChildAvatar(validAvatars[0]);
    }
  }, [previewBand, childAvatar, previewBandInfo.avatarOptions]);

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setAuthLoading(true);
    try {
      await signInParentWithGoogle();
      onExistingParentDetected();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('popup-closed-by-user') || message.includes('cancelled-popup-request')) {
        setErrorMsg('Google sign-in window was closed before finishing. Click below to try again.');
      } else if (message.includes('popup-blocked')) {
        setErrorMsg('Your browser blocked the sign-in popup. Please allow popups for MindQuest and retry.');
      } else {
        setErrorMsg('Could not sign in with Google right now. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setErrorMsg(null);
    try {
      await signOutParent();
    } catch {
      setErrorMsg('Failed to sign out. Please try again.');
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setErrorMsg(null);

    const trimmedName = guardianName.trim();
    const trimmedPin = pin.trim();

    if (trimmedName.length < 1 || trimmedName.length > 80) {
      setErrorMsg('Please enter your guardian display name (1–80 characters).');
      return;
    }

    if (!/^[0-9]{4,6}$/.test(trimmedPin)) {
      setErrorMsg('Parent Gate PIN must be 4 to 6 numeric digits (e.g., 1234).');
      return;
    }

    if (childSetupMode === 'custom' && childName.trim().length < 1) {
      setErrorMsg('Please enter your first child explorer’s name, or choose Sample Explorers.');
      return;
    }

    if (!termsAccepted || !consentGiven) {
      setErrorMsg('Please accept the MindQuest Terms and Guardian Safeguarding Consent to continue.');
      return;
    }

    if (!firebaseUser.email) {
      setErrorMsg('Verified Google account email is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      // Step A: Create Parent Guardian Document first (required by Firestore child rules)
      const parentAccount = await createParentProfile({
        uid: firebaseUser.uid,
        name: trimmedName,
        email: firebaseUser.email,
        pin: trimmedPin,
        plan,
        termsAccepted: true,
        consentGiven: true,
      });

      // Step B: Create Child Explorer profile(s) scoped under /parents/{uid}/children
      let firstChildId: string | undefined;

      if (childSetupMode === 'custom') {
        const cleanId = `child-${Date.now()}`;
        const firstChild: ChildProfile = {
          id: cleanId,
          parentId: firebaseUser.uid,
          name: childName.trim().slice(0, 60),
          birthDate: childBirthDate,
          calculatedAge: previewAge,
          band: previewBand,
          avatar: childAvatar,
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            soundEnabled: true,
            soundVolume: 0.8,
            largeText: previewAge <= 7,
          },
          dailyLimitMinutes: 20,
          todayMinutesPlayed: 0,
          streakDays: 1,
          bestStreak: 1,
          streakBadges: ['streak_1'],
          achievements: [],
          allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
          totalXp: 0,
          level: 1,
          createdAt: new Date().toISOString(),
        };
        const created = await createChildInFirestore(firebaseUser.uid, firstChild);
        firstChildId = created.id;
      } else {
        const now = Date.now();
        const starterKids: ChildProfile[] = [
          {
            id: `child-maya-${now}`,
            parentId: firebaseUser.uid,
            name: 'Maya',
            birthDate: '2020-05-14',
            calculatedAge: calculateAge('2020-05-14'),
            band: 'young_explorers',
            avatar: 'fox',
            accessibility: {
              highContrast: false,
              reducedMotion: false,
              soundEnabled: true,
              soundVolume: 0.8,
              largeText: true,
            },
            dailyLimitMinutes: 20,
            todayMinutesPlayed: 0,
            streakDays: 1,
            bestStreak: 1,
            streakBadges: ['streak_1'],
            achievements: [],
            allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
            totalXp: 0,
            level: 1,
            createdAt: new Date().toISOString(),
          },
          {
            id: `child-leo-${now + 1}`,
            parentId: firebaseUser.uid,
            name: 'Leo',
            birthDate: '2017-09-22',
            calculatedAge: calculateAge('2017-09-22'),
            band: 'senior_explorers',
            avatar: 'tiger',
            accessibility: {
              highContrast: false,
              reducedMotion: false,
              soundEnabled: true,
              soundVolume: 0.8,
              largeText: false,
            },
            dailyLimitMinutes: 25,
            todayMinutesPlayed: 0,
            streakDays: 1,
            bestStreak: 1,
            streakBadges: ['streak_1'],
            achievements: [],
            allowedFocusAreas: ['reading', 'concentration', 'mental_abilities'],
            totalXp: 0,
            level: 1,
            createdAt: new Date().toISOString(),
          },
        ];

        for (const kid of starterKids) {
          const created = await createChildInFirestore(firebaseUser.uid, kid);
          if (!firstChildId) firstChildId = created.id;
        }
      }

      onSignupComplete(parentAccount, firstChildId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg.includes('Quota exceeded')
          ? 'Daily cloud database quota reached. Try Demo Mode or retry tomorrow.'
          : 'Unable to save your family account. Please verify all fields and try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#7f27a8] text-black font-child flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Brand Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#53b0c9]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#c1008f]/45 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between relative z-10 mb-6">
        <button
          type="button"
          onClick={onBackToMarketing}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#ffd400] text-black border-2 border-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#ffd400] text-black border-2 border-black font-black flex items-center justify-center text-base">
            M
          </div>
          <span className="text-white font-black text-lg tracking-tight">MindQuest Family</span>
        </div>

        <button
          type="button"
          onClick={onContinueDemoMode}
          className="px-4 py-2 bg-[#53b0c9] hover:bg-[#ffd400] text-black border-2 border-black rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
        >
          Try Local Demo
        </button>
      </header>

      {/* Main Card */}
      <main className="max-w-2xl mx-auto w-full my-auto relative z-10">
        <div className="bg-white rounded-3xl border-4 border-black shadow-2xl overflow-hidden">
          {/* Card Banner */}
          <div className="bg-[#ffd400] border-b-4 border-black px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7f27a8] text-white border-2 border-black flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-black leading-tight">
                  {firebaseUser && needsProfileSetup
                    ? 'Complete Your Family Account'
                    : authTab === 'signup'
                    ? 'Parent Sign Up'
                    : 'Parent Sign In'}
                </h1>
                <p className="text-xs text-black font-bold">
                  Cloud-synced child profiles, streaks &amp; domain insights
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border-2 border-black text-xs font-extrabold text-black">
              <Sparkles className="w-3.5 h-3.5 text-[#c1008f]" />
              Safe &amp; Ad-Free
            </span>
          </div>

          <div className="p-6 md:p-8">
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-[#c1008f] text-white border-2 border-black rounded-2xl text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: GOOGLE AUTHENTICATION */}
            {!firebaseUser && (
              <div className="space-y-6">
                {/* Sign Up / Sign In Switcher */}
                <div className="flex gap-2 p-1.5 bg-[#53b0c9]/20 rounded-2xl border-2 border-black">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      authTab === 'signup'
                        ? 'bg-[#7f27a8] text-white border-2 border-black shadow-xs'
                        : 'text-black hover:bg-white/60'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>New Parent Sign Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signin');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      authTab === 'signin'
                        ? 'bg-[#7f27a8] text-white border-2 border-black shadow-xs'
                        : 'text-black hover:bg-white/60'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Existing Parent Sign In</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#e885cf]/20 border-2 border-[#c1008f] space-y-3">
                  <h2 className="text-base font-black text-black">
                    {authTab === 'signup'
                      ? 'Create Your Guardian Cloud Account in 2 Quick Steps'
                      : 'Welcome Back, Guardian!'}
                  </h2>
                  <p className="text-xs text-black font-semibold leading-relaxed">
                    {authTab === 'signup'
                      ? 'First, verify your parent identity with Google. Next, set your 4-digit Parent Gate PIN and add your child explorer profile — children never need emails or passwords.'
                      : 'Sign in with your Google account to load your family’s child profiles, streaks, achievements, and cognitive reports from the cloud.'}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-bold text-black">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> Synced across devices
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> Strict parent-only isolation
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> Custom 4-digit Parent PIN
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#7f27a8]" /> COPPA &amp; NDPA safeguarding
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleGoogleAuth}
                  className="w-full py-4 px-6 bg-[#f76400] hover:bg-[#c1008f] disabled:opacity-60 text-white border-3 border-black rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting Google Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-7 h-7 rounded-lg bg-white text-black border border-black font-black flex items-center justify-center text-sm">
                        G
                      </span>
                      <span>
                        {authTab === 'signup'
                          ? 'Continue with Google to Sign Up'
                          : 'Sign In with Google'}
                      </span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2 border-t-2 border-[#e885cf]/50">
                  <p className="text-xs text-black font-semibold">
                    Just exploring first?{' '}
                    <button
                      type="button"
                      onClick={onContinueDemoMode}
                      className="text-[#7f27a8] hover:text-[#c1008f] font-black underline cursor-pointer"
                    >
                      Play Local Demo without signing up
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: GUARDIAN PROFILE & FIRST CHILD ONBOARDING */}
            {firebaseUser && needsProfileSetup && (
              <form onSubmit={handleCompleteSignup} className="space-y-5">
                {/* Connected Verified Email Pill */}
                <div className="p-3.5 rounded-2xl bg-[#53b0c9]/20 border-2 border-[#53b0c9] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7f27a8] block">
                      Verified Google Account
                    </span>
                    <span className="text-sm font-black text-black">
                      {firebaseUser.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#ffd400] border border-black text-xs font-extrabold text-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Account</span>
                  </button>
                </div>

                {/* Guardian Name & Parent Gate PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1.5">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Sarah Johnson"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] focus:outline-hidden focus:ring-2 focus:ring-[#ffd400] text-sm font-bold text-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#7f27a8]" />
                      <span>Parent Gate PIN (4–6 digits)</span>
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4,6}"
                      minLength={4}
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="4 digits e.g. 1234"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] focus:outline-hidden focus:ring-2 focus:ring-[#ffd400] text-sm font-mono font-bold tracking-widest text-black bg-white"
                    />
                  </div>
                </div>

                {/* Membership Plan Selection */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
                    Select Family Plan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlan('free')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        plan === 'free'
                          ? 'bg-[#53b0c9]/25 border-black ring-2 ring-[#53b0c9]'
                          : 'bg-white border-black/30 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black text-black">Explorer Free</span>
                        <span className="text-xs font-extrabold bg-[#ffd400] px-2 py-0.5 rounded-md border border-black">
                          $0
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-black">
                        Core cognitive practice &amp; cloud-synced child progress.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlan('family_premium')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        plan === 'family_premium'
                          ? 'bg-[#7f27a8] text-white border-black ring-2 ring-[#ffd400]'
                          : 'bg-white text-black border-black/30 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black">Family Premium</span>
                        <span className="text-xs font-extrabold bg-[#ffd400] text-black px-2 py-0.5 rounded-md border border-black">
                          Full Access
                        </span>
                      </div>
                      <p className="text-xs font-semibold opacity-95">
                        All 9 modules, Faces &amp; Things, up to 5 child profiles.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Child Setup Option */}
                <div className="p-4 rounded-2xl bg-[#ffd400]/20 border-2 border-[#f76400] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#f76400]" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                        Initial Child Explorer Setup
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setChildSetupMode('custom')}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold border cursor-pointer ${
                          childSetupMode === 'custom'
                            ? 'bg-[#7f27a8] text-white border-black'
                            : 'bg-white text-black border-black/40'
                        }`}
                      >
                        Add My Child
                      </button>
                      <button
                        type="button"
                        onClick={() => setChildSetupMode('starter')}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold border cursor-pointer ${
                          childSetupMode === 'starter'
                            ? 'bg-[#7f27a8] text-white border-black'
                            : 'bg-white text-black border-black/40'
                        }`}
                      >
                        Use Sample Explorers
                      </button>
                    </div>
                  </div>

                  {childSetupMode === 'custom' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-black mb-1">
                            Child&apos;s First Name / Nickname
                          </label>
                          <input
                            type="text"
                            required={childSetupMode === 'custom'}
                            maxLength={60}
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            placeholder="e.g. Maya"
                            className="w-full px-3.5 py-2 rounded-xl border-2 border-[#7f27a8] text-sm font-bold text-black bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-black mb-1 flex items-center justify-between">
                            <span>Date of Birth</span>
                            <span className="text-[#7f27a8] font-extrabold">
                              Age {previewAge} ({previewBandInfo.subName})
                            </span>
                          </label>
                          <input
                            type="date"
                            required={childSetupMode === 'custom'}
                            min="2009-01-01"
                            max="2022-12-31"
                            value={childBirthDate}
                            onChange={(e) => setChildBirthDate(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border-2 border-[#7f27a8] text-sm font-bold text-black bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold text-black mb-1.5">
                          Choose Explorer Avatar
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {previewBandInfo.avatarOptions.map((opt) => (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => setChildAvatar(opt.id)}
                              className={`p-2 rounded-xl border-2 text-center cursor-pointer transition-all ${
                                childAvatar === opt.id
                                  ? 'bg-[#ffd400] border-black ring-2 ring-[#7f27a8]'
                                  : 'bg-white border-[#53b0c9] hover:border-black'
                              }`}
                            >
                              <span className="text-2xl block">{opt.emoji}</span>
                              <span className="text-[11px] font-extrabold text-black block truncate">
                                {opt.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-black bg-white p-3 rounded-xl border border-black/30">
                      Creates starter profiles <strong>Maya (Age 6, Young Explorers)</strong> and{' '}
                      <strong>Leo (Age 9, Senior Explorers)</strong> in your cloud account so you can
                      test different age worlds right away. You can edit or delete them anytime.
                    </p>
                  )}
                </div>

                {/* Safeguarding Consent & Terms */}
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-start gap-2.5 text-xs font-semibold text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 accent-[#7f27a8] w-4 h-4 shrink-0"
                    />
                    <span>
                      I agree to the MindQuest Terms of Use and understand MindQuest is a purposeful
                      educational cognitive platform (non-clinical, ad-free).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs font-semibold text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 accent-[#7f27a8] w-4 h-4 shrink-0"
                    />
                    <span>
                      I confirm I am the parent or legal guardian giving verifiable consent (COPPA /
                      NDPA / GDPR) to manage these child explorer profiles.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3.5 px-6 bg-[#7f27a8] hover:bg-[#c1008f] disabled:opacity-60 text-white border-3 border-black rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Family Cloud Account...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 text-[#ffd400]" />
                      <span>Create Parent Account &amp; Enter Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Authenticated and checking profile */}
            {firebaseUser && !needsProfileSetup && (
              <div className="py-10 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#7f27a8] mx-auto" />
                <p className="text-sm font-extrabold text-black">
                  Loading your MindQuest family dashboard...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-white/90 font-semibold mt-6 relative z-10">
        MindQuest Cognitive Practice Platform · Secured by Firebase · Original IP by Matthew Onaneye
      </footer>
    </div>
  );
};
