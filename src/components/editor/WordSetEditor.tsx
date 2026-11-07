import React, { useState } from 'react';
import type { WordSet } from '../../types';
import { speakWord } from '../../services/speech';
import { translateSingleWord } from '../../services/translator';
import { Plus, Trash2, Volume2, Sparkles, ArrowLeft, Compass } from 'lucide-react';

interface WordSetEditorProps {
  sets: WordSet[];
  activeSet: WordSet;
  onSelectSet: (id: string) => void;
  onUpdateSet: (set: WordSet) => void;
  onAddSet: (newSet: WordSet) => void;
  onDeleteSet: (id: string) => void;
  onBack: () => void;
  onOpenLibrary?: () => void;
}

export const WordSetEditor: React.FC<WordSetEditorProps> = ({
  sets,
  activeSet,
  onSelectSet,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  onBack,
  onOpenLibrary,
}) => {
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);

  const handleWordChange = (index: number, text: string) => {
    const updatedWords = [...activeSet.words];
    updatedWords[index] = { ...updatedWords[index], w: text };
    onUpdateSet({ ...activeSet, words: updatedWords });
  };

  const handleTranslationChange = (index: number, translation: string) => {
    const updatedWords = [...activeSet.words];
    updatedWords[index] = { ...updatedWords[index], tr: translation };
    onUpdateSet({ ...activeSet, words: updatedWords });
  };

  const handleAutoTranslate = async (index: number) => {
    const item = activeSet.words[index];
    if (!item.w.trim()) return;

    setTranslatingIndex(index);
    try {
      const res = await translateSingleWord(item.w, activeSet.src, activeSet.to);
      if (res.translation) {
        const updatedWords = [...activeSet.words];
        updatedWords[index] = {
          ...updatedWords[index],
          tr: res.translation,
          lg: res.detectedLang || activeSet.src,
        };
        onUpdateSet({ ...activeSet, words: updatedWords });
      }
    } finally {
      setTranslatingIndex(null);
    }
  };

  const handleAddWordRow = () => {
    const updatedWords = [...activeSet.words, { w: '', tr: null, lg: activeSet.src }];
    onUpdateSet({ ...activeSet, words: updatedWords });
  };

  const handleDeleteWordRow = (index: number) => {
    const updatedWords = activeSet.words.filter((_, i) => i !== index);
    onUpdateSet({ ...activeSet, words: updatedWords });
  };

  const handleCreateNewSet = () => {
    const newSet: WordSet = {
      id: `set-${Date.now()}`,
      name: "Yangi to'plam",
      src: 'en',
      to: 'uz',
      words: [
        { w: '', tr: null, lg: 'en' },
        { w: '', tr: null, lg: 'en' },
        { w: '', tr: null, lg: 'en' },
        { w: '', tr: null, lg: 'en' },
      ],
    };
    onAddSet(newSet);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Tayyor to'plamdan tanlash</span>
            </button>
          )}

          <button
            onClick={handleCreateNewSet}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi to'plam</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Sets list sidebar */}
        <div className="md:col-span-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Mening to'plamlarim
          </h3>
          <div className="space-y-1.5">
            {sets.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSet(s.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  s.id === activeSet.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="truncate">{s.name}</span>
                <span className="text-xs text-slate-400 flex-none ml-2">
                  {s.words.filter(w => w.w.trim()).length} ta
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Word Editor Main Panel */}
        <div className="md:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Set title & languages */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                To'plam nomi:
              </label>
              <input
                type="text"
                value={activeSet.name}
                onChange={e => onUpdateSet({ ...activeSet, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  So'zlar tili:
                </label>
                <select
                  value={activeSet.src}
                  onChange={e => onUpdateSet({ ...activeSet, src: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
                >
                  <option value="auto">Avto aniqlash</option>
                  <option value="en">Inglizcha (English)</option>
                  <option value="ru">Ruscha (Русский)</option>
                  <option value="de">Nemischa (Deutsch)</option>
                  <option value="uz">O'zbekcha</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Tarjima tili:
                </label>
                <select
                  value={activeSet.to}
                  onChange={e => onUpdateSet({ ...activeSet, to: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
                >
                  <option value="uz">O'zbekcha</option>
                  <option value="en">Inglizcha (English)</option>
                  <option value="ru">Ruscha (Русский)</option>
                  <option value="de">Nemischa (Deutsch)</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Words List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                So'zlar ({activeSet.words.filter(w => w.w.trim()).length} ta)
              </span>
              <span className="text-xs text-slate-400">
                Tarjima avtomatik topilishi uchun ✨ tugmasini bosing
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {activeSet.words.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {/* Word input */}
                  <input
                    type="text"
                    placeholder="So'z (masalan: apple)"
                    value={item.w}
                    onChange={e => handleWordChange(idx, e.target.value)}
                    onBlur={() => {
                      if (item.w.trim() && !item.tr) {
                        handleAutoTranslate(idx);
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Translation input */}
                  <input
                    type="text"
                    placeholder="Tarjimasi (olma)"
                    value={item.tr || ''}
                    onChange={e => handleTranslationChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Auto translate button */}
                  <button
                    onClick={() => handleAutoTranslate(idx)}
                    disabled={translatingIndex === idx || !item.w.trim()}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-40 cursor-pointer"
                    title="Avto tarjima"
                  >
                    <Sparkles className={`w-4 h-4 ${translatingIndex === idx ? 'animate-spin' : ''}`} />
                  </button>

                  {/* Pronounce button */}
                  <button
                    onClick={() => speakWord(item.w, item.lg || activeSet.src)}
                    disabled={!item.w.trim()}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    title="Talaffuz"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Delete row */}
                  <button
                    onClick={() => handleDeleteWordRow(idx)}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddWordRow}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi so'z qo'shish</span>
            </button>
          </div>

          {/* Delete set option */}
          {sets.length > 1 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => onDeleteSet(activeSet.id)}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>To'plamni butunlay o'chirish</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
