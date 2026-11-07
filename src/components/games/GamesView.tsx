import React, { useState } from 'react';
import type { WordSet, GameModeId } from '../../types';
import { GAME_MODES, CATEGORIES } from '../../data/gameModes';
import {
  Gamepad2,
  Shuffle,
  Play,
  BookPlus,
  Sparkles,
  ChevronDown,
  Check,
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
} from 'lucide-react';

interface GamesViewProps {
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

export const GamesView: React.FC<GamesViewProps> = ({
  activeSet,
  allSets,
  onSelectSet,
  onStartGame,
  onOpenEditor,
  onOpenLibrary,
}) => {
  const [isSetSwitcherOpen, setIsSetSwitcherOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const validWords = activeSet?.words ? activeSet.words.filter(w => w.w.trim().length > 0) : [];
  const canPlay = validWords.length >= 4;

  const filteredCategories = selectedCategory === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.id === selectedCategory);

  return (
    <div className="space-y-6 pb-12 animate-pop">
      {/* Games Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>O'yinlar markazi</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold">
                20 ta rejim
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Lug'at boyligingizni oshirish uchun interaktiv o'yin rejimini tanlang
            </p>
          </div>
        </div>

        {/* Right side: Active Set Switcher & Quick Random Play */}
        {allSets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active set dropdown selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSetSwitcherOpen(!isSetSwitcherOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                title="To'plamni almashtirish"
              >
                <span>📁</span>
                <span className="max-w-[140px] truncate">{activeSet?.name || "To'plam yo'q"}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {validWords.length} ta
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isSetSwitcherOpen ? 'rotate-180 text-indigo-500' : ''
                  }`}
                />
              </button>

              {/* Set dropdown menu */}
              {isSetSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSetSwitcherOpen(false)} />
                  <div className="absolute top-full right-0 mt-1.5 w-64 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-30 animate-pop">
                    <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      O'ynaladigan to'plam
                    </div>
                    {allSets.map(s => {
                      const isSelected = s.id === activeSet?.id;
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
                          <div className="flex items-center gap-1.5 shrink-0">
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

            {/* Quick Random Play Button */}
            <button
              onClick={() => onStartGame('?')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
              title="Tasodifiy o'yin rejimini tanlash"
            >
              <Shuffle className="w-4 h-4" />
              <span>Tasodifiy</span>
            </button>
          </div>
        )}
      </div>

      {/* No sets state warning */}
      {allSets.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-3xl">
            📚
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Hali to'plamingiz yo'q
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              O'yinlarni o'ynash uchun avval yangi so'z to'plami yarating yoki tayyor andozalardan qo'shing!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <BookPlus className="w-4 h-4" />
              <span>Yangi to'plam yaratish</span>
            </button>
            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tayyor andozalardan qo'shish</span>
            </button>
          </div>
        </div>
      ) : !canPlay ? (
        /* Insufficient words warning banner */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Tanlangan to'plamda <strong>{validWords.length} ta</strong> so'z bor. O'yinlarni o'ynash uchun kamida <strong>4 ta</strong> so'z bo'lishi kerak.
            </p>
          </div>
          <button
            onClick={onOpenEditor}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
          >
            So'z qo'shish →
          </button>
        </div>
      ) : null}

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
          }`}
        >
          Barchasi (20)
        </button>
        {CATEGORIES.map(cat => {
          const count = GAME_MODES.filter(m => m.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`} />
              <span>{cat.title}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Categorized Game Modes Grid */}
      <div className="space-y-8">
        {filteredCategories.map(category => {
          const modes = GAME_MODES.filter(m => m.category === category.id);
          return (
            <div key={category.id} className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${category.color}`} />
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-800 dark:text-slate-200">
                  {category.title}
                </h2>
                <span className="text-xs text-slate-400">({modes.length} ta rejim)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => onStartGame(mode.id)}
                    className={`flex items-center gap-3.5 p-4 rounded-3xl border text-left transition-all group ${
                      canPlay
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg active:scale-98 cursor-pointer'
                        : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 cursor-pointer opacity-90'
                    }`}
                  >
                    <div className="flex-none p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                      {getModeIcon(mode.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center justify-between gap-1">
                        <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {mode.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {mode.desc}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition-colors shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
