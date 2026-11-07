import React, { useState, useMemo } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordSet, WordItem, GameModeId } from '../../types';
import { GAME_MODES } from '../../data/gameModes';
import { Play, CheckSquare, Square, X, Hash } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface GameSetupModalProps {
  modeId: GameModeId | '?';
  activeSet: WordSet;
  onClose: () => void;
  onStart: (filteredWords: WordItem[], actualModeId: GameModeId) => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  modeId,
  activeSet,
  onClose,
  onStart,
}) => {
  // Available words in active set with translation
  const availableWords = useMemo(() => {
    return activeSet.words.filter(w => w.w.trim() && w.tr?.trim());
  }, [activeSet]);

  const totalAvailable = availableWords.length;

  const [selectionMode, setSelectionMode] = useState<'rand' | 'pick'>('rand');
  const [wordCount, setWordCount] = useState<number>(Math.min(10, totalAvailable));
  const [customInput, setCustomInput] = useState<string>('');
  const [pickedWords, setPickedWords] = useState<Set<string>>(() => {
    return new Set(availableWords.map(w => w.w.toLowerCase()));
  });

  const isRandomGame = modeId === '?';
  const modeInfo = isRandomGame
    ? { name: "Tasodifiy o'yin", desc: "Har safar kutilmagan rejim!", category: 'speed' }
    : GAME_MODES.find(m => m.id === modeId) || GAME_MODES[0];

  const handleSelectCount = (count: number) => {
    setWordCount(count === 0 ? totalAvailable : Math.min(count, totalAvailable));
    sounds.playPop();
  };

  const handleApplyCustomCount = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val >= 4 && val <= totalAvailable) {
      setWordCount(val);
      sounds.playPop();
    }
  };

  const handleToggleWord = (wordText: string) => {
    const key = wordText.toLowerCase();
    const next = new Set(pickedWords);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setPickedWords(next);
  };

  const handleSelectAll = () => {
    setPickedWords(new Set(availableWords.map(w => w.w.toLowerCase())));
    sounds.playPop();
  };

  const handleClearAll = () => {
    setPickedWords(new Set());
    sounds.playPop();
  };

  const selectedCount = selectionMode === 'rand'
    ? Math.min(wordCount, totalAvailable)
    : pickedWords.size;

  const canStart = selectedCount >= 4;

  const handleStartGame = () => {
    if (!canStart) return;

    let finalWords: WordItem[] = [];
    if (selectionMode === 'pick') {
      finalWords = availableWords.filter(w => pickedWords.has(w.w.toLowerCase()));
    } else {
      // Shuffle available words and take wordCount
      const shuffled = shuffleArray([...availableWords]);
      finalWords = shuffled.slice(0, wordCount === 0 ? totalAvailable : wordCount);
    }

    let actualId: GameModeId;
    if (isRandomGame) {
      const allModeIds = GAME_MODES.map(m => m.id);
      actualId = allModeIds[Math.floor(Math.random() * allModeIds.length)];
    } else {
      actualId = modeId as GameModeId;
    }

    sounds.playPop();
    onStart(finalWords, actualId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-inner font-bold">
            {isRandomGame ? '🎲' : '🎮'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {modeInfo.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeSet.name} to'plami ({totalAvailable} ta so'z)
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Qaysi so'zlar bilan o'ynaymiz?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectionMode('rand')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  selectionMode === 'rand'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>🎲</span> Tasodifiy
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('pick')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  selectionMode === 'pick'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>✋</span> O'zim tanlayman
              </button>
            </div>
          </div>

          {/* Random Selection Mode */}
          {selectionMode === 'rand' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Nechta so'z bilan?
              </label>

              {/* Preset counts */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20].map(cnt => {
                  if (cnt > totalAvailable) return null;
                  const isSelected = wordCount === cnt;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handleSelectCount(cnt)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {cnt} ta
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleSelectCount(0)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer text-center ${
                    wordCount === totalAvailable
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Barchasi ({totalAvailable})
                </button>
              </div>

              {/* Custom Number Input */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Yoki o'zingiz yozing (4–{totalAvailable}):
                </span>
                <input
                  type="number"
                  min={4}
                  max={totalAvailable}
                  placeholder={`masalan: ${Math.min(15, totalAvailable)}`}
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleApplyCustomCount();
                  }}
                  className="w-20 px-2.5 py-1.5 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomCount}
                  className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Manual Pick Mode */}
          {selectionMode === 'pick' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Tanlandi: <span className="text-indigo-600 font-extrabold">{pickedWords.size}</span> / {totalAvailable}
                  {pickedWords.size < 4 && (
                    <span className="text-rose-500 ml-1">(kamida 4 ta kerak)</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Barchasi
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Tozalash
                  </button>
                </div>
              </div>

              {/* Words Checkbox List */}
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                {availableWords.map(w => {
                  const isChecked = pickedWords.has(w.w.toLowerCase());
                  return (
                    <button
                      key={w.w}
                      type="button"
                      onClick={() => handleToggleWord(w.w)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition-colors cursor-pointer text-xs font-medium border ${
                        isChecked
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 opacity-60'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{w.w}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Start Game Button */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-2">
          <button
            type="button"
            disabled={!canStart}
            onClick={handleStartGame}
            className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
              canStart
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-[0.98] cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>O'yinni boshlash ({selectedCount} ta so'z)</span>
          </button>
          {!canStart && (
            <p className="text-center text-xs text-rose-500 mt-2 font-medium">
              O'yinni boshlash uchun kamida 4 ta so'z tanlanishi shart!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
