import React from 'react';
import { ChildProfile } from '../../types';
import { DEVELOPMENTAL_BANDS } from '../../utils/engine';
import { Plus, Shield, Clock, Flame } from 'lucide-react';

interface ChildSelectorScreenProps {
  childrenList: ChildProfile[];
  onSelectChild: (childId: string) => void;
  onOpenAddChild: () => void;
  onGoToParentPortal: () => void;
  parentAccountName?: string | null;
  isCloudSynced?: boolean;
}

export const ChildSelectorScreen: React.FC<ChildSelectorScreenProps> = ({
  childrenList,
  onSelectChild,
  onOpenAddChild,
  onGoToParentPortal,
  parentAccountName,
  isCloudSynced = false,
}) => {
  return (
    <div className="min-h-screen bg-[#7f27a8] text-white font-child flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Brand Palette Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#53b0c9]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c1008f]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffd400] text-black border-2 border-black font-black text-xl flex items-center justify-center">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">MindQuest</h1>
              {isCloudSynced && parentAccountName && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#53b0c9] text-black font-extrabold border border-black">
                  {parentAccountName}&apos;s Family
                </span>
              )}
            </div>
            <p className="text-xs text-white/90 font-semibold">Play. Think. Discover. Grow.</p>
          </div>
        </div>

        <button
          onClick={onGoToParentPortal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffd400] hover:bg-[#e885cf] text-black text-xs font-extrabold transition-all border-2 border-black cursor-pointer"
        >
          <Shield className="w-4 h-4 text-black" />
          <span>Parent Portal</span>
        </button>
      </div>

      {/* Main Selection Area */}
      <div className="max-w-4xl mx-auto w-full my-auto py-12 text-center relative z-10">
        <span className="inline-block text-xs uppercase tracking-widest bg-[#ffd400] text-black px-3 py-1 rounded-full font-extrabold mb-3 border border-black">
          Choose Your Explorer
        </span>
        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white">
          Who is ready to play today?
        </h2>
        <p className="text-white text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed font-medium">
          Select your profile to enter your age-tailored cognitive training world and continue your missions.
        </p>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {childrenList.map((child, idx) => {
            const band = DEVELOPMENTAL_BANDS[child.band];
            const avatarEmoji =
              band.avatarOptions.find((a) => a.id === child.avatar)?.emoji || '🦊';
            const cardAccent =
              idx % 3 === 0
                ? 'border-[#ffd400] hover:border-[#53b0c9]'
                : idx % 3 === 1
                ? 'border-[#53b0c9] hover:border-[#ffd400]'
                : 'border-[#e885cf] hover:border-[#ffd400]';

            return (
              <button
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`group p-6 rounded-3xl bg-white text-black border-4 ${cardAccent} text-left transition-all duration-300 transform hover:-translate-y-1 shadow-xl cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-[#ffd400] group-hover:bg-[#53b0c9] border-2 border-black flex items-center justify-center text-4xl mb-4 transition-transform group-hover:scale-105 shadow-inner">
                    {avatarEmoji}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-extrabold text-black mb-0.5">{child.name}</h3>
                    <p className="text-xs text-[#7f27a8] font-bold mb-1">
                      {child.calculatedAge} Years · {band.subName}
                    </p>
                    <span className="text-xs text-black font-semibold block mb-4">
                      {band.worldName}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#e885cf] flex items-center justify-between text-xs text-black font-bold">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#f76400] fill-[#f76400]" />
                    {child.streakDays}d streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#7f27a8]" />
                    {child.todayMinutesPlayed}m
                  </span>
                </div>
              </button>
            );
          })}

          {/* Add Profile Card */}
          <button
            onClick={onOpenAddChild}
            className="p-6 rounded-3xl border-4 border-dashed border-[#ffd400] bg-[#c1008f]/40 hover:bg-[#c1008f] text-white transition-all flex flex-col items-center justify-center min-h-[240px] cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#ffd400] text-black border-2 border-black flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm mb-1 text-white">Add Child Profile</span>
            <span className="text-xs text-white/90 text-center max-w-[150px]">
              Set up a new explorer with date of birth
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-white/90 font-semibold relative z-10">
        MindQuest Cognitive Practice Platform · Private &amp; Safe · No Ads · Original IP by Matthew Onaneye
      </div>
    </div>
  );
};
