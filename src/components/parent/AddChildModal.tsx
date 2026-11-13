import React, { useState, useEffect } from 'react';
import { ChildProfile, FocusArea } from '../../types';
import { calculateAge, getDevelopmentalBand, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import { X } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: ChildProfile) => void;
  initialChild?: ChildProfile | null;
  parentId?: string;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChild,
  parentId = 'parent-main',
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('2018-06-15');
  const [avatar, setAvatar] = useState('fox');
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(20);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [allowedFocusAreas, setAllowedFocusAreas] = useState<FocusArea[]>([
    'reading',
    'concentration',
    'mental_abilities',
  ]);

  useEffect(() => {
    if (initialChild) {
      setName(initialChild.name);
      setBirthDate(initialChild.birthDate);
      setAvatar(initialChild.avatar);
      setDailyLimitMinutes(initialChild.dailyLimitMinutes);
      setHighContrast(initialChild.accessibility.highContrast);
      setReducedMotion(initialChild.accessibility.reducedMotion);
      setSoundEnabled(initialChild.accessibility.soundEnabled);
      setLargeText(initialChild.accessibility.largeText);
      setAllowedFocusAreas(
        initialChild.allowedFocusAreas || ['reading', 'concentration', 'mental_abilities']
      );
    } else {
      setName('');
      setBirthDate('2018-06-15');
      setAvatar('fox');
      setDailyLimitMinutes(20);
      setHighContrast(false);
      setReducedMotion(false);
      setSoundEnabled(true);
      setLargeText(false);
      setAllowedFocusAreas(['reading', 'concentration', 'mental_abilities']);
    }
  }, [initialChild, isOpen]);

  if (!isOpen) return null;

  const currentAge = calculateAge(birthDate);
  const currentBand = getDevelopmentalBand(currentAge);
  const bandInfo = DEVELOPMENTAL_BANDS[currentBand];

  const toggleArea = (area: FocusArea) => {
    if (allowedFocusAreas.includes(area)) {
      if (allowedFocusAreas.length > 1) {
        setAllowedFocusAreas(allowedFocusAreas.filter((a) => a !== area));
      }
    } else {
      setAllowedFocusAreas([...allowedFocusAreas, area]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const child: ChildProfile = {
      id: initialChild ? initialChild.id : `child-${Date.now()}`,
      parentId: initialChild ? initialChild.parentId : parentId,
      name: name.trim(),
      birthDate,
      calculatedAge: currentAge,
      band: currentBand,
      avatar,
      accessibility: {
        highContrast,
        reducedMotion,
        soundEnabled,
        soundVolume: 0.8,
        largeText,
      },
      dailyLimitMinutes,
      todayMinutesPlayed: initialChild ? initialChild.todayMinutesPlayed : 0,
      streakDays: initialChild ? initialChild.streakDays : 1,
      bestStreak: initialChild ? initialChild.bestStreak || initialChild.streakDays : 1,
      streakBadges: initialChild ? initialChild.streakBadges || ['streak_1'] : ['streak_1'],
      allowedFocusAreas,
      totalXp: initialChild ? initialChild.totalXp : 0,
      level: initialChild ? initialChild.level : 1,
      createdAt: initialChild ? initialChild.createdAt : new Date().toISOString(),
    };

    onSave(child);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-child">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#53b0c9] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black bg-[#53b0c9] text-black">
          <div>
            <h3 className="text-lg font-black text-black">
              {initialChild ? 'Edit Child Profile' : 'Add Child Profile'}
            </h3>
            <p className="text-xs text-black font-semibold">
              Automatic age band assignment based on date of birth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-black hover:bg-white/40 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-black">
          {/* Child Name */}
          <div>
            <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1.5">
              Child&apos;s First Name or Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya, Leo, Sam"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] focus:outline-hidden focus:ring-2 focus:ring-[#ffd400] text-sm font-bold text-black bg-white"
            />
          </div>

          {/* Date of Birth & Band Preview */}
          <div>
            <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Date of Birth</span>
              <span className="text-[#7f27a8] font-extrabold lowercase">
                Age: {currentAge} years old
              </span>
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              min="2010-01-01"
              max="2021-12-31"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#7f27a8] focus:outline-hidden focus:ring-2 focus:ring-[#ffd400] text-sm font-bold text-black bg-white"
            />

            {/* Developmental Band Pill */}
            <div className="mt-3 p-3.5 bg-[#ffd400]/25 rounded-2xl border-2 border-[#f76400] flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black block">
                  Assigned World
                </span>
                <span className="text-sm font-black text-black">
                  {bandInfo.subName} ({bandInfo.ageRange})
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#ffd400] text-black border border-black font-extrabold">
                {bandInfo.worldName}
              </span>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-2">
              Select Character Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {bandInfo.avatarOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAvatar(opt.id)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    avatar === opt.id
                      ? 'border-black bg-[#ffd400] ring-2 ring-[#7f27a8]'
                      : 'border-[#53b0c9] hover:border-[#7f27a8] bg-white'
                  }`}
                >
                  <span className="text-3xl block mb-1">{opt.emoji}</span>
                  <span className="text-xs font-extrabold text-black block truncate">
                    {opt.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Parent Skill Categories / Focus Areas */}
          <div>
            <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-2">
              Allowed Skill Sub-Categories
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggleArea('reading')}
                className={`p-2.5 rounded-xl border-2 text-xs font-extrabold text-left transition-all cursor-pointer ${
                  allowedFocusAreas.includes('reading')
                    ? 'bg-[#c1008f] border-black text-white'
                    : 'bg-white border-[#e885cf] text-black opacity-60'
                }`}
              >
                📖 1. Reading
              </button>
              <button
                type="button"
                onClick={() => toggleArea('concentration')}
                className={`p-2.5 rounded-xl border-2 text-xs font-extrabold text-left transition-all cursor-pointer ${
                  allowedFocusAreas.includes('concentration')
                    ? 'bg-[#53b0c9] border-black text-black'
                    : 'bg-white border-[#53b0c9] text-black opacity-60'
                }`}
              >
                🎯 2. Focus
              </button>
              <button
                type="button"
                onClick={() => toggleArea('mental_abilities')}
                className={`p-2.5 rounded-xl border-2 text-xs font-extrabold text-left transition-all cursor-pointer ${
                  allowedFocusAreas.includes('mental_abilities')
                    ? 'bg-[#7f27a8] border-black text-white'
                    : 'bg-white border-[#7f27a8] text-black opacity-60'
                }`}
              >
                🧠 3. Mental
              </button>
            </div>
          </div>

          {/* Daily Usage Limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold text-black uppercase tracking-wider">
                Daily Usage Limit
              </label>
              <span className="text-sm font-black text-[#7f27a8]">
                {dailyLimitMinutes} Minutes / Day
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="5"
              value={dailyLimitMinutes}
              onChange={(e) => setDailyLimitMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-[#7f27a8]"
            />
            <span className="text-xs text-black font-medium block mt-1">
              Supports healthy screen balance without pressuring play (PRD Section 13).
            </span>
          </div>

          {/* Accessibility Settings */}
          <div className="pt-2 border-t-2 border-[#e885cf]">
            <span className="text-xs font-extrabold text-black uppercase tracking-wider block mb-2">
              Accessibility Preferences
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-[#53b0c9] cursor-pointer hover:bg-[#53b0c9]/15">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded-sm accent-[#7f27a8]"
                />
                <span className="font-bold text-black">Audio Feedback</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-[#53b0c9] cursor-pointer hover:bg-[#53b0c9]/15">
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                  className="rounded-sm accent-[#7f27a8]"
                />
                <span className="font-bold text-black">Larger Touch Targets</span>
              </label>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#e885cf]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-black bg-[#e885cf]/40 hover:bg-[#e885cf] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold text-black bg-[#ffd400] hover:bg-[#f76400] hover:text-white border-2 border-black rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {initialChild ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
