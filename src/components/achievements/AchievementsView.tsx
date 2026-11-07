import React from 'react';
import type { UserStats } from '../../types';
import { BADGES } from '../../data/badges';
import { Star, Flame, Trophy, CheckCircle, ArrowLeft } from 'lucide-react';

interface AchievementsViewProps {
  stats: UserStats;
  onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ stats, onBack }) => {
  const masteredCount = Object.values(stats.knownWords).filter(c => c >= 3).length;
  const unlockedCount = Object.keys(stats.unlockedBadges).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pop">
      {/* Top action */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Bosh sahifaga qaytish</span>
      </button>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-500 mx-auto flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {stats.stars}
          </div>
          <div className="text-xs font-semibold text-slate-400">Yulduzlar</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {stats.streak} kun
          </div>
          <div className="text-xs font-semibold text-slate-400">Streak (Ketma-ket)</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {stats.games}
          </div>
          <div className="text-xs font-semibold text-slate-400">O'yinlar</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {masteredCount} ta
          </div>
          <div className="text-xs font-semibold text-slate-400">O'zlashtirilgan so'z</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Nishonlar va yutuqlar
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {unlockedCount} / {BADGES.length} ochilgan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map(badge => {
            const isUnlocked = Boolean(stats.unlockedBadges[badge.id]);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border flex flex-col items-center text-center space-y-2 transition-all ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl">{badge.icon}</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {badge.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {badge.desc}
                </div>
                {isUnlocked && (
                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Ochilgan
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
