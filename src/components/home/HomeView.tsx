import React from 'react';
import type { WordSet, GameModeId } from '../../types';
import { GAME_MODES, CATEGORIES } from '../../data/gameModes';
import { PRESET_TOPICS } from '../../data/presetLibrary';
import { WordRack } from './WordRack';
import {
  Play,
  Shuffle,
  BookPlus,
  Compass,
  HelpCircle,
  CheckCircle2,
  GitCompare,
  Layers,
  Disc,
  CircleDot,
  PenTool,
  Hash,
  Headphones,
  Ear,
  AlertCircle,
  Move,
  Hand,
  Puzzle,
  Box,
  Search,
  Grid,
  Zap,
  Bomb,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface HomeViewProps {
  activeSet: WordSet;
  allSets: WordSet[];
  onSelectSet: (id: string) => void;
  onStartGame: (modeId: GameModeId | '?') => void;
  onOpenEditor: () => void;
  onOpenLibrary: () => void;
}

// Icon mapper for game modes
const getModeIcon = (id: GameModeId) => {
  switch (id) {
    case 'quiz': return <HelpCircle className="w-6 h-6 text-indigo-500" />;
    case 'tf': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    case 'match': return <GitCompare className="w-6 h-6 text-blue-500" />;
    case 'memory': return <Layers className="w-6 h-6 text-violet-500" />;
    case 'wheel': return <Disc className="w-6 h-6 text-amber-500" />;
    case 'bubble': return <CircleDot className="w-6 h-6 text-cyan-500" />;
    case 'fill': return <PenTool className="w-6 h-6 text-teal-500" />;
    case 'hang': return <Hash className="w-6 h-6 text-pink-500" />;
    case 'dictation': return <Headphones className="w-6 h-6 text-purple-500" />;
    case 'listen': return <Ear className="w-6 h-6 text-rose-500" />;
    case 'spot': return <AlertCircle className="w-6 h-6 text-orange-500" />;
    case 'scramble': return <Move className="w-6 h-6 text-amber-600" />;
    case 'dragl': return <Hand className="w-6 h-6 text-blue-600" />;
    case 'puzzle': return <Puzzle className="w-6 h-6 text-emerald-600" />;
    case 'cloze': return <Box className="w-6 h-6 text-indigo-600" />;
    case 'wsearch': return <Search className="w-6 h-6 text-teal-600" />;
    case 'crossword': return <Grid className="w-6 h-6 text-purple-600" />;
    case 'race': return <Zap className="w-6 h-6 text-yellow-500" />;
    case 'bomb': return <Bomb className="w-6 h-6 text-red-500" />;
    case 'simon': return <Activity className="w-6 h-6 text-fuchsia-500" />;
  }
};

export const HomeView: React.FC<HomeViewProps> = ({
  activeSet,
  allSets,
  onSelectSet,
  onStartGame,
  onOpenEditor,
  onOpenLibrary,
}) => {
  const validWords = activeSet?.words ? activeSet.words.filter(w => w.w.trim().length > 0) : [];
  const canPlay = validWords.length >= 4;

  const handleRandomPlay = () => {
    onStartGame('?');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ─── CASE A: NEW USER (0 SETS) ─────────────────────────────────── */}
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
              <p className="text-sm text-slate-500 dark:text-slate-400">
                O'yinlarni boshlash uchun tayyor kutubxonadan to'plam tanlang yoki o'zingiz yangi so'z to'plami yarating!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenLibrary}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Tayyor to'plamlar kutubxonasi</span>
              </button>
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <BookPlus className="w-4 h-4 text-indigo-500" />
                <span>O'zim yangi to'plam yarataman</span>
              </button>
            </div>
          </div>

          {/* Quick Popular Presets Preview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔥</span>
                <span>Ommabop tayyor to'plamlar:</span>
              </h2>
              <button
                onClick={onOpenLibrary}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Barchasini ko'rish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_TOPICS.slice(0, 3).map(topic => (
                <div
                  key={topic.id}
                  onClick={onOpenLibrary}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{topic.rawWords.length} ta so'z</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Informational Note (No noisy disabled game cards) */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
              <span>🎮</span>
              <span>Yuqoridagi to'plamlardan birini tanlashingiz bilan barcha 20 ta ta'limiy o'yin avtomatik ochiladi!</span>
            </div>
          </div>
        </section>
      ) : (
        /* ─── CASE B: USER HAS SETS (Full Set Selector + All 20 Games) ─── */
        <>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mt-2 w-full overflow-hidden">
            {/* Left Column: Set selector & CTA */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 w-full">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {validWords.length} ta so'z
                  </span>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 uppercase">
                    {activeSet.src || 'en'} → {activeSet.to || 'uz'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight break-words">
                    {activeSet.name}
                  </h1>
                </div>
              </div>

              {/* Quick set switcher */}
              {allSets.length > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    To'plamni almashtirish:
                  </label>
                  <div className="relative w-full sm:w-auto flex-1 max-w-full">
                    <select
                      value={activeSet.id}
                      onChange={e => onSelectSet(e.target.value)}
                      className="w-full px-3 py-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate cursor-pointer shadow-2xs"
                    >
                      {allSets.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.words.length} ta so'z)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5 pt-1 w-full">
                {canPlay ? (
                  <button
                    onClick={handleRandomPlay}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Tasodifiy o'yin</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenEditor}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm sm:text-base transition-all cursor-pointer"
                  >
                    <BookPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>So'z qo'shish (kamida 4 ta kerak)</span>
                  </button>
                )}

                {/* Open Preset Library Button */}
                <button
                  onClick={onOpenLibrary}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm transition-all cursor-pointer shadow-xs"
                >
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <span>Kutubxona</span>
                </button>

                <button
                  onClick={onOpenEditor}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all cursor-pointer"
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

          {/* Game Modes Categorized Grid (Active & Playable) */}
          <section className="space-y-8">
            {CATEGORIES.map(category => {
              const modes = GAME_MODES.filter(m => m.category === category.id);
              return (
                <div key={category.id} className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${category.color}`} />
                    {category.title}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {modes.map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => onStartGame(mode.id)}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                          canPlay
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md active:scale-98 cursor-pointer'
                            : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 hover:border-amber-400 cursor-pointer'
                        }`}
                      >
                        <div className="flex-none p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {getModeIcon(mode.id)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                            <span>{mode.name}</span>
                            {!canPlay && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">
                                To'plam qo'shing
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {canPlay ? mode.desc : "O'ynash uchun to'plam qo'shing"}
                          </div>
                        </div>
                        <Play className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
};
