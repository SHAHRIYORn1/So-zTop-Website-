import React, { useState } from 'react';
import type { WordSet } from '../../types';
import { WordRack } from './WordRack';
import {
  BookPlus,
  Sparkles,
  ChevronDown,
  Check,
  FolderOpen,
  Plus,
} from 'lucide-react';

interface HomeViewProps {
  activeSet: WordSet;
  allSets: WordSet[];
  onSelectSet: (id: string) => void;
  onOpenEditor: () => void;
  onOpenLibrary: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeSet,
  allSets,
  onSelectSet,
  onOpenEditor,
  onOpenLibrary,
}) => {
  const [isSetSwitcherOpen, setIsSetSwitcherOpen] = useState(false);
  const validWords = activeSet?.words ? activeSet.words.filter(w => w.w.trim().length > 0) : [];

  return (
    <div className="space-y-8 pb-12">
      {/* ── CASE A: NEW USER (0 SETS) ─────────────────────────────────── */}
      {allSets.length === 0 ? (
        <section className="space-y-6 mt-2">
          {/* Main Welcome Hero Card */}
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Xush kelibsiz!
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                O'yinlarni boshlash uchun o'zingiz yangi so'z to'plamini yarating yoki tayyor andozalar kutubxonasidan qo'shing!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenEditor}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <BookPlus className="w-4 h-4" />
                <span>Yangi to'plam yaratish</span>
              </button>
              <button
                onClick={onOpenLibrary}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tayyor andozalardan qo'shish</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ── CASE B: USER HAS SETS ──────────────────────────────────── */
        <>
          {/* Active Word Set Overview Card */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Set Details & Quick Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Faol to'plam
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                    {validWords.length} ta so'z
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words text-slate-900 dark:text-slate-100">
                    {activeSet.name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Til: {activeSet.src.toUpperCase()} → {activeSet.to.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Custom Quick Set Switcher (NO native browser select) */}
              {allSets.length > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    To'plamni almashtirish:
                  </label>
                  <div className="relative w-full sm:w-auto flex-1 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setIsSetSwitcherOpen(!isSetSwitcherOpen)}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>📁</span>
                        <span className="truncate">{activeSet.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                          {activeSet.words.length} ta
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isSetSwitcherOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </button>

                    {isSetSwitcherOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsSetSwitcherOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-30 animate-pop">
                          {allSets.map(s => {
                            const isSelected = s.id === activeSet.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  onSelectSet(s.id);
                                  setIsSetSwitcherOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span>📁</span>
                                  <span className="truncate">{s.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                                    {s.words.length} ta
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5 pt-1 w-full">
                {/* Edit Set */}
                <button
                  onClick={onOpenEditor}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <BookPlus className="w-4 h-4 text-slate-500" />
                  <span>Tahrirlash</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Word Scramble Rack */}
            <div className="lg:col-span-5">
              <WordRack words={validWords} />
            </div>
          </section>

          {/* User's Word Sets Hub */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                    Barcha to'plamlarim
                  </h2>
                  <p className="text-xs text-slate-500">
                    Jami {allSets.length} ta to'plam mavjud
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenEditor}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yangi to'plam</span>
                </button>
                <button
                  onClick={onOpenLibrary}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Andozalardan qo'shish</span>
                </button>
              </div>
            </div>

            {/* Sets Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {allSets.map(s => {
                const isActive = s.id === activeSet.id;
                const wordsCount = s.words ? s.words.filter(w => w.w.trim()).length : 0;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSet(s.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                          📁
                        </div>
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black">
                            Faol
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {s.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {wordsCount} ta so'z • {s.src.toUpperCase()} → {s.to.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSet(s.id);
                          onOpenEditor();
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Tahrirlash
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
