import React, { useState, useEffect } from 'react';
import { ChildProfile, DevelopmentalBand } from '../../types';
import { calculateAge, getDevelopmentalBand, DEVELOPMENTAL_BANDS } from '../../utils/engine';
import { X, Calendar, Sparkles, Check } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: ChildProfile) => void;
  initialChild?: ChildProfile | null;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChild,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('2018-06-15');
  const [avatar, setAvatar] = useState('fox');
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(20);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [largeText, setLargeText] = useState(false);

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
    } else {
      setName('');
      setBirthDate('2018-06-15');
      setAvatar('fox');
      setDailyLimitMinutes(20);
      setHighContrast(false);
      setReducedMotion(false);
      setSoundEnabled(true);
      setLargeText(false);
    }
  }, [initialChild, isOpen]);

  if (!isOpen) return null;

  const currentAge = calculateAge(birthDate);
  const currentBand = getDevelopmentalBand(currentAge);
  const bandInfo = DEVELOPMENTAL_BANDS[currentBand];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const child: ChildProfile = {
      id: initialChild ? initialChild.id : `child-${Date.now()}`,
      parentId: initialChild ? initialChild.parentId : 'parent-main',
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
      totalXp: initialChild ? initialChild.totalXp : 0,
      level: initialChild ? initialChild.level : 1,
      createdAt: initialChild ? initialChild.createdAt : new Date().toISOString(),
    };

    onSave(child);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-parent">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialChild ? 'Edit Child Profile' : 'Add Child Profile'}
            </h3>
            <p className="text-xs text-slate-500">
              Automatic age band assignment based on date of birth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Child Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Child's First Name or Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya, Leo, Sam"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            />
          </div>

          {/* Date of Birth & Band Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Date of Birth</span>
              <span className="text-teal-600 font-semibold lowercase">
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            />

            {/* Developmental Band Pill */}
            <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Assigned World
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {bandInfo.subName} ({bandInfo.ageRange})
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
                {bandInfo.worldName}
              </span>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Character Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {bandInfo.avatarOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAvatar(opt.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    avatar === opt.id
                      ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-3xl block mb-1">{opt.emoji}</span>
                  <span className="text-xs font-bold text-slate-700 block truncate">
                    {opt.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Usage Limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily Usage Limit
              </label>
              <span className="text-sm font-extrabold text-slate-900">
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
              className="w-full accent-slate-900"
            />
            <span className="text-xs text-slate-400 block mt-1">
              Supports healthy screen balance without pressuring play (PRD Section 13).
            </span>
          </div>

          {/* Accessibility Settings */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Accessibility Preferences
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded-sm accent-slate-900"
                />
                <span className="font-semibold text-slate-700">Audio Feedback</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                  className="rounded-sm accent-slate-900"
                />
                <span className="font-semibold text-slate-700">Larger Touch Targets</span>
              </label>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
            >
              {initialChild ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
