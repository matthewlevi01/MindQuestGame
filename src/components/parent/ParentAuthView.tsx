import React, { useState, useEffect, useRef } from 'react';
import { ConfirmationResult, RecaptchaVerifier, User } from 'firebase/auth';
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
  Mail,
  Phone,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { ChildProfile } from '../../types';
import { calculateAge, getDevelopmentalBand, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import {
  CloudParentAccount,
  FamilyPlan,
  confirmPhoneVerificationCode,
  createChildInFirestore,
  createParentProfile,
  createPhoneRecaptchaVerifier,
  detectAuthProvider,
  isFirebaseUserVerified,
  reloadParentUser,
  resendParentVerificationEmail,
  sendParentPasswordReset,
  sendPhoneVerificationCode,
  signInParentWithEmail,
  signInParentWithGoogle,
  signOutParent,
  signUpParentWithEmail,
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

type AuthMethod = 'google' | 'email' | 'phone';

function mapFirebaseAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('auth/operation-not-allowed')) {
    return 'This sign-in method is not enabled yet in Firebase Console (project: splendid-curve-zvr20 -> Authentication -> Sign-in method). Enable Email/Password or Phone there, or use Google Sign-In.';
  }
  if (raw.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Switch to "Existing Parent Sign In" to log in.';
  }
  if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password') || raw.includes('auth/user-not-found')) {
    return 'Invalid email or password. Double-check your credentials or reset your password.';
  }
  if (raw.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters long.';
  }
  if (raw.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (raw.includes('auth/invalid-phone-number')) {
    return 'Please enter a valid phone number in international format (e.g., +15551234567).';
  }
  if (raw.includes('auth/invalid-verification-code')) {
    return 'That 6-digit SMS verification code did not match. Please try again.';
  }
  if (raw.includes('auth/code-expired')) {
    return 'That verification code expired. Please request a new SMS code.';
  }
  if (raw.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (raw.includes('popup-closed-by-user') || raw.includes('cancelled-popup-request')) {
    return 'Google sign-in window was closed before finishing. Click below to try again.';
  }
  if (raw.includes('popup-blocked')) {
    return 'Your browser blocked the sign-in popup. Please allow popups for MindQuest and retry.';
  }
  if (raw.includes('auth/unauthorized-domain')) {
    return 'This domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.';
  }
  return 'Authentication failed. Please check your details and try again.';
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
  const [authMethod, setAuthMethod] = useState<AuthMethod>('google');
  const [authLoading, setAuthLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Email/Password Auth State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailSignupName, setEmailSignupName] = useState('');
  const [verifyCheckLoading, setVerifyCheckLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Phone Auth State
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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

  const userVerified = isFirebaseUserVerified(firebaseUser);

  useEffect(() => {
    if (firebaseUser) {
      setGuardianName(
        (prev) => prev || firebaseUser.displayName || emailSignupName.trim() || 'MindQuest Guardian'
      );
    }
  }, [firebaseUser, emailSignupName]);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore cleanup error
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const previewAge = calculateAge(childBirthDate);
  const previewBand = getDevelopmentalBand(previewAge);
  const previewBandInfo = DEVELOPMENTAL_BANDS[previewBand];

  useEffect(() => {
    const validAvatars = previewBandInfo.avatarOptions.map((a) => a.id);
    if (!validAvatars.includes(childAvatar) && validAvatars.length > 0) {
      setChildAvatar(validAvatars[0]);
    }
  }, [previewBand, childAvatar, previewBandInfo.avatarOptions]);

  const clearMessages = () => {
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleGoogleAuth = async () => {
    clearMessages();
    setAuthLoading(true);
    try {
      await signInParentWithGoogle();
      onExistingParentDetected();
    } catch (err: unknown) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!emailInput.trim() || !passwordInput) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authTab === 'signup') {
        await signUpParentWithEmail(emailInput, passwordInput, emailSignupName);
        setInfoMsg(
          `Verification link sent to ${emailInput.trim()}. Please verify your email inbox, then click "I Verified My Email".`
        );
      } else {
        const user = await signInParentWithEmail(emailInput, passwordInput);
        if (user.emailVerified) {
          onExistingParentDetected();
        } else {
          setInfoMsg(
            'Your email address is not verified yet. Check your inbox or resend the verification email below.'
          );
        }
      }
    } catch (err: unknown) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();
    if (!emailInput.trim()) {
      setErrorMsg('Enter your email address above first so we can send a password reset link.');
      return;
    }
    setAuthLoading(true);
    try {
      await sendParentPasswordReset(emailInput);
      setInfoMsg(`Password reset email sent to ${emailInput.trim()}.`);
    } catch (err: unknown) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCheckEmailVerification = async () => {
    if (!firebaseUser) return;
    clearMessages();
    setVerifyCheckLoading(true);
    try {
      const refreshed = await reloadParentUser(firebaseUser);
      if (refreshed?.emailVerified) {
        onExistingParentDetected();
      } else {
        setErrorMsg('Email is still unverified. Click the link in your inbox (check Spam if needed), then retry.');
      }
    } catch (err: unknown) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setVerifyCheckLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    clearMessages();
    setResendLoading(true);
    try {
      await resendParentVerificationEmail(firebaseUser);
      setInfoMsg(`Fresh verification email sent to ${firebaseUser.email}.`);
    } catch (err: unknown) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setResendLoading(false);
    }
  };

  const resetRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const formatted = phoneInput.trim().replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{6,14}$/.test(formatted)) {
      setErrorMsg('Enter phone number in international E.164 format starting with +, e.g. +15551234567.');
      return;
    }

    if (!recaptchaContainerRef.current) {
      setErrorMsg('Security verification container is not ready. Please try again.');
      return;
    }

    setAuthLoading(true);
    try {
      resetRecaptcha();
      const verifier = createPhoneRecaptchaVerifier(recaptchaContainerRef.current, 'invisible');
      recaptchaVerifierRef.current = verifier;
      const result = await sendPhoneVerificationCode(formatted, verifier);
      setConfirmationResult(result);
      setInfoMsg(`6-digit SMS code sent to ${formatted}.`);
    } catch (err: unknown) {
      resetRecaptcha();
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleConfirmPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    clearMessages();

    if (otpInput.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    setAuthLoading(true);
    try {
      await confirmPhoneVerificationCode(confirmationResult, otpInput);
      onExistingParentDetected();
    } catch (err: unknown) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    clearMessages();
    setConfirmationResult(null);
    setOtpInput('');
    resetRecaptcha();
    try {
      await signOutParent();
    } catch {
      setErrorMsg('Failed to sign out. Please try again.');
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userVerified) return;
    clearMessages();

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

    const authProvider = detectAuthProvider(firebaseUser);
    if (authProvider === 'phone' && !firebaseUser.phoneNumber) {
      setErrorMsg('Verified phone number is required.');
      return;
    }
    if (authProvider !== 'phone' && !firebaseUser.email) {
      setErrorMsg('Verified email address is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      // Step A: Create Parent Guardian Document first (required by Firestore child rules)
      const parentAccount = await createParentProfile({
        uid: firebaseUser.uid,
        name: trimmedName,
        authProvider,
        email: authProvider !== 'phone' ? firebaseUser.email || undefined : undefined,
        phoneNumber: authProvider === 'phone' ? firebaseUser.phoneNumber || undefined : undefined,
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

  const verifiedIdentityLabel =
    firebaseUser?.email || firebaseUser?.phoneNumber || 'Verified Guardian';

  return (
    <div className="min-h-screen bg-[#7f27a8] text-black font-child flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Brand Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#53b0c9]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#c1008f]/45 rounded-full blur-3xl pointer-events-none" />

      {/* Invisible reCAPTCHA anchor for Phone Auth */}
      <div ref={recaptchaContainerRef} id="mindquest-phone-recaptcha" />

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
                  {firebaseUser && !userVerified
                    ? 'Verify Your Email Address'
                    : firebaseUser && userVerified && needsProfileSetup
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

            {infoMsg && (
              <div className="mb-5 p-3.5 bg-[#53b0c9]/25 text-black border-2 border-[#53b0c9] rounded-2xl text-xs font-bold flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#7f27a8] shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* STEP 1: MULTI-PROVIDER AUTHENTICATION (Google, Email/Password, Phone) */}
            {!firebaseUser && (
              <div className="space-y-5">
                {/* Sign Up / Sign In Switcher */}
                <div className="flex gap-2 p-1.5 bg-[#53b0c9]/20 rounded-2xl border-2 border-black">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      clearMessages();
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
                      clearMessages();
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

                {/* Auth Provider Tabs: Google / Email & Password / Phone SMS */}
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-black mb-2">
                    Choose Sign-In Method
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('google');
                        clearMessages();
                      }}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        authMethod === 'google'
                          ? 'bg-[#ffd400] text-black border-black ring-2 ring-[#7f27a8]'
                          : 'bg-white text-black border-black/30 hover:border-black'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-white border border-black font-black flex items-center justify-center text-[11px]">
                        G
                      </span>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('email');
                        clearMessages();
                      }}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        authMethod === 'email'
                          ? 'bg-[#ffd400] text-black border-black ring-2 ring-[#7f27a8]'
                          : 'bg-white text-black border-black/30 hover:border-black'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-[#7f27a8]" />
                      <span>Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('phone');
                        clearMessages();
                      }}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        authMethod === 'phone'
                          ? 'bg-[#ffd400] text-black border-black ring-2 ring-[#7f27a8]'
                          : 'bg-white text-black border-black/30 hover:border-black'
                      }`}
                    >
                      <Phone className="w-4 h-4 text-[#f76400]" />
                      <span>Phone SMS</span>
                    </button>
                  </div>
                </div>

                {/* Method 1: Google Sign-In */}
                {authMethod === 'google' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#e885cf]/20 border-2 border-[#c1008f] space-y-2">
                      <h2 className="text-base font-black text-black">
                        {authTab === 'signup'
                          ? 'One-Click Parent Verification via Google'
                          : 'Sign In with Your Google Account'}
                      </h2>
                      <p className="text-xs text-black font-semibold leading-relaxed">
                        {authTab === 'signup'
                          ? 'Connect your Google account instantly, then set your 4-digit Parent Gate PIN and add your child explorer profile.'
                          : 'Sign in with Google to restore your cloud-synced child profiles, streaks, and domain progress.'}
                      </p>
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
                  </div>
                )}

                {/* Method 2: Email & Password */}
                {authMethod === 'email' && (
                  <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                    {authTab === 'signup' && (
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
                          Parent / Guardian Name
                        </label>
                        <input
                          type="text"
                          maxLength={80}
                          value={emailSignupName}
                          onChange={(e) => setEmailSignupName(e.target.value)}
                          placeholder="e.g. Sarah Johnson"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] text-sm font-bold text-black bg-white"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
                        Parent Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] text-sm font-bold text-black bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-black">
                          Password (6+ characters)
                        </label>
                        {authTab === 'signin' && (
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-xs font-extrabold text-[#c1008f] hover:text-[#7f27a8] cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] text-sm font-bold text-black bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 px-6 bg-[#7f27a8] hover:bg-[#c1008f] disabled:opacity-60 text-white border-3 border-black rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{authTab === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 text-[#ffd400]" />
                          <span>
                            {authTab === 'signup'
                              ? 'Create Parent Account with Email'
                              : 'Sign In with Email'}
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Method 3: Phone Authentication */}
                {authMethod === 'phone' && (
                  <div className="space-y-4">
                    {!confirmationResult ? (
                      <form onSubmit={handleSendPhoneCode} className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#53b0c9]/15 border-2 border-[#53b0c9] text-xs font-semibold text-black">
                          Enter your mobile number with country code (e.g.{' '}
                          <strong className="font-mono">+15551234567</strong> or{' '}
                          <strong className="font-mono">+447700900123</strong>). We&apos;ll send a
                          one-time 6-digit SMS verification code.
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
                            Mobile Phone Number (E.164 format)
                          </label>
                          <input
                            type="tel"
                            required
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="+15551234567"
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] text-sm font-mono font-bold text-black bg-white"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full py-3.5 px-6 bg-[#f76400] hover:bg-[#c1008f] disabled:opacity-60 text-white border-3 border-black rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {authLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Sending SMS Code...</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-5 h-5" />
                              <span>Send 6-Digit SMS Verification Code</span>
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleConfirmPhoneOtp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
                            Enter 6-Digit SMS Code
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            autoFocus
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            className="w-full px-4 py-3 text-center text-2xl tracking-[0.4em] font-mono font-black rounded-xl border-2 border-[#7f27a8] text-black bg-white"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmationResult(null);
                              setOtpInput('');
                              clearMessages();
                            }}
                            className="px-4 py-3 bg-white hover:bg-[#ffd400] text-black border-2 border-black rounded-2xl text-xs font-extrabold cursor-pointer"
                          >
                            Change Number
                          </button>
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="flex-1 py-3 px-6 bg-[#7f27a8] hover:bg-[#c1008f] disabled:opacity-60 text-white border-2 border-black rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {authLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Verifying Code...</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="w-4 h-4 text-[#ffd400]" />
                                <span>Verify &amp; Continue</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="text-center pt-3 border-t-2 border-[#e885cf]/50">
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

            {/* STEP 1B: EMAIL VERIFICATION GATE (for Email/Password until emailVerified === true) */}
            {firebaseUser && !userVerified && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#ffd400]/25 border-2 border-[#f76400] space-y-2">
                  <h2 className="text-base font-black text-black flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#7f27a8]" />
                    <span>Confirm Your Parent Email</span>
                  </h2>
                  <p className="text-xs text-black font-semibold leading-relaxed">
                    We sent a verification link to <strong>{firebaseUser.email}</strong>. Click the
                    link in your email to activate your MindQuest parent account and protect your
                    family&apos;s cloud records.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={verifyCheckLoading}
                    onClick={handleCheckEmailVerification}
                    className="flex-1 py-3.5 px-5 bg-[#7f27a8] hover:bg-[#c1008f] disabled:opacity-60 text-white border-2 border-black rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {verifyCheckLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 text-[#ffd400]" />
                    )}
                    <span>I Verified My Email — Continue</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={handleResendVerification}
                    className="px-4 py-3.5 bg-[#53b0c9] hover:bg-[#ffd400] disabled:opacity-60 text-black border-2 border-black rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                    <span>Resend Link</span>
                  </button>
                </div>

                <div className="text-center pt-2 border-t border-black/15">
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="text-xs font-extrabold text-[#c1008f] hover:text-[#7f27a8] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Use a different sign-in method or email</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: GUARDIAN PROFILE & FIRST CHILD ONBOARDING */}
            {firebaseUser && userVerified && needsProfileSetup && (
              <form onSubmit={handleCompleteSignup} className="space-y-5">
                {/* Connected Verified Contact Pill */}
                <div className="p-3.5 rounded-2xl bg-[#53b0c9]/20 border-2 border-[#53b0c9] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7f27a8] block">
                      Verified via{' '}
                      {detectAuthProvider(firebaseUser) === 'phone'
                        ? 'Phone SMS'
                        : detectAuthProvider(firebaseUser) === 'password'
                        ? 'Email & Password'
                        : 'Google'}
                    </span>
                    <span className="text-sm font-black text-black">{verifiedIdentityLabel}</span>
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

            {/* Authenticated, verified, and checking profile */}
            {firebaseUser && userVerified && !needsProfileSetup && (
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
