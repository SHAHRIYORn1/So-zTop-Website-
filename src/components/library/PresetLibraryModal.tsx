import React, { useState } from 'react';
import { PRESET_TOPICS, createWordSetFromPreset } from '../../data/presetLibrary';
import type { PresetTopic } from '../../data/presetLibrary';
import type { WordSet } from '../../types';
import { speakWord } from '../../services/speech';
import { X, Play, Plus, Volume2, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayDirectly: (newSet: WordSet) => void;
  onAddToMySets: (newSet: WordSet) => void;
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onPlayDirectly,
  onAddToMySets,
}) => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'ru' | 'de'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<PresetTopic | null>(null);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(PRESET_TOPICS.map(t => t.category)))];

  const filteredTopics = PRESET_TOPICS.filter(
    t => selectedCategory === 'all' || t.category === selectedCategory
  );

  // Prepare preview words for selected topic
  const previewWords = activeTopic
    ? createWordSetFromPreset(activeTopic, selectedLang).words
    : [];

  const handlePlayNow = (topic: PresetTopic) => {
    const wordSet = createWordSetFromPreset(topic, selectedLang);
    onPlayDirectly(wordSet);
    onClose();
  };

  const handleAddSet = (topic: PresetTopic) => {
    const wordSet = createWordSetFromPreset(topic, selectedLang);
    onAddToMySets(wordSet);
    setActiveTopic(null);
    // onAddToMySets already calls onClose via App.tsx
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-pop">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-none">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Tayyor to'plamlar kutubxonasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Mavzuni tanlang, so'zlarini ko'ring va xohlagan o'yinda mashq qiling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector & Category bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 flex-none">
          {/* Target Language Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              O'rganiladigan til:
            </span>
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇬🇧 Inglizcha
              </button>
              <button
                onClick={() => setSelectedLang('ru')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLang === 'ru'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇷🇺 Ruscha
              </button>
              <button
                onClick={() => setSelectedLang('de')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLang === 'de'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇩🇪 Nemischa
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex-none cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                {cat === 'all' ? 'Barcha to\'plamlar' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTopic ? (
            /* Topic Detail View (inside topic) */
            <div className="space-y-6">
              {/* Back to list button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTopic(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  ← Barcha to'plamlarga qaytish
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddSet(activeTopic)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>To'plamlarimga qo'shish</span>
                  </button>

                  <button
                    onClick={() => handlePlayNow(activeTopic)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Hozir o'ynash</span>
                  </button>
                </div>
              </div>

              {/* Topic Heading */}
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-4xl sm:text-5xl">{activeTopic.icon}</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {activeTopic.name}
                  </h3>
                  <p className="text-sm text-slate-500">{activeTopic.description}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    Jami: {previewWords.length} ta so'z
                  </span>
                </div>
              </div>

              {/* Word List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {previewWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 shadow-xs group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.w}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.tr}
                      </div>
                    </div>
                    <button
                      onClick={() => speakWord(item.w, item.lg || selectedLang)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                      title="Talaffuz"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Topics Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {topic.icon}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {topic.rawWords.length} ta so'z
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {topic.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>So'zlarni ko'rish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNow(topic);
                      }}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                      title="Darhol o'ynash"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-none">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Kutubxonada jami {PRESET_TOPICS.length} ta mavzu va 300+ so'z mavjud</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold hover:underline cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
