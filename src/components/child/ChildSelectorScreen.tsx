import React from 'react';
import { ChildProfile } from '../../types';
import { DEVELOPMENTAL_BANDS } from '../../utils/engine';
import { Plus, Shield, ArrowRight, Clock, Flame } from 'lucide-react';

interface ChildSelectorScreenProps {
  childrenList: ChildProfile[];
  onSelectChild: (childId: string) => void;
  onOpenAddChild: () => void;
  onGoToParentPortal: () => void;
}

export const ChildSelectorScreen: React.FC<ChildSelectorScreenProps> = ({
  childrenList,
  onSelectChild,
  onOpenAddChild,
  onGoToParentPortal,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-child flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center">
            M
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">MindQuest</h1>
            <p className="text-xs text-slate-400">Play. Think. Discover. Grow.</p>
          </div>
        </div>

        <button
          onClick={onGoToParentPortal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
        >
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Parent Portal</span>
        </button>
      </div>

      {/* Main Selection Area */}
      <div className="max-w-4xl mx-auto w-full my-auto py-12 text-center relative z-10">
        <span className="text-xs uppercase tracking-widest text-teal-400 font-extrabold mb-2 block">
          Choose Your Explorer
        </span>
        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
          Who is ready to play today?
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
          Select your profile to enter your age-tailored cognitive training world and continue your missions.
        </p>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {childrenList.map((child) => {
            const band = DEVELOPMENTAL_BANDS[child.band];
            const avatarEmoji =
              band.avatarOptions.find((a) => a.id === child.avatar)?.emoji || '🦊';

            return (
              <button
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className="group p-6 rounded-3xl bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-teal-400 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-teal-500/10 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-700/80 group-hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-4xl mb-4 transition-transform group-hover:scale-105 shadow-inner">
                    {avatarEmoji}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-extrabold text-white mb-0.5">{child.name}</h3>
                    <p className="text-xs text-teal-300 font-bold mb-1">
                      {child.calculatedAge} Years · {band.subName}
                    </p>
                    <span className="text-xs text-slate-400 block mb-4">{band.worldName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {child.streakDays}d streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    {child.todayMinutesPlayed}m
                  </span>
                </div>
              </button>
            );
          })}

          {/* Add Profile Card */}
          <button
            onClick={onOpenAddChild}
            className="p-6 rounded-3xl border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-slate-400 hover:text-white transition-all flex flex-col items-center justify-center min-h-[240px] cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white mb-3 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm mb-1">Add Child Profile</span>
            <span className="text-xs text-slate-500 text-center max-w-[150px]">
              Set up a new explorer with date of birth
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 relative z-10">
        MindQuest Cognitive Practice Platform · Private & Safe · No Ads · No Diagnostic Claims
      </div>
    </div>
  );
};
