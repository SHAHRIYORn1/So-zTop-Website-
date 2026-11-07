import React, { useState } from 'react';
import { PRESET_TOPICS, createWordSetFromPreset } from '../../data/presetLibrary';
import type { PresetTopic } from '../../data/presetLibrary';
import type { WordSet } from '../../types';
import { speakWord } from '../../services/speech';
import {
  X,
  Play,
  Plus,
  Volume2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Layers,
  Globe2,
  Filter,
} from 'lucide-react';

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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-pop">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-none">
          {activeTopic ? (
            /* Topic Active: Clean Back button in top-left */
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={() => setActiveTopic(null)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer flex-none"
                title="Barcha to'plamlarga qaytish"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Barcha to'plamlar</span>
              </button>

              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                  <span>{activeTopic.icon}</span>
                  <span className="truncate">{activeTopic.name}</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                  {previewWords.length} ta so'z • {selectedLang === 'en' ? 'Inglizcha' : selectedLang === 'ru' ? 'Ruscha' : 'Nemischa'}
                </p>
              </div>
            </div>
          ) : (
            /* Normal Library Browse Header */
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-none">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Tayyor to'plamlar kutubxonasi
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Mavzuni tanlang, so'zlarini ko'ring va xohlagan o'yinda mashq qiling
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-none ml-2"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Single-Row Filter Bar (Hidden when inside a topic) */}
        {!activeTopic && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 flex-none">
            {/* Left: Language Dropdown/Select */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5">
              <div className="relative w-full sm:w-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="hidden xs:inline text-slate-400">Til:</span>
                  <select
                    value={selectedLang}
                    onChange={e => setSelectedLang(e.target.value as any)}
                    className="bg-transparent font-bold outline-none cursor-pointer pr-1"
                  >
                    <option value="en" className="dark:bg-slate-900">🇬🇧 Inglizcha</option>
                    <option value="ru" className="dark:bg-slate-900">🇷🇺 Ruscha</option>
                    <option value="de" className="dark:bg-slate-900">🇩🇪 Nemischa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Category Dropdown/Select with quick reset */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5">
              <div className="relative w-full sm:w-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="hidden xs:inline text-slate-400">Mavzu:</span>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-transparent font-bold outline-none cursor-pointer pr-1 max-w-[120px] xs:max-w-none truncate"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="dark:bg-slate-900">
                        {cat === 'all' ? "Barcha mavzular" : cat}
                      </option>
                    ))}
                  </select>
                  {selectedCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700"
                      title="Filtrni tozalash"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTopic ? (
            /* Topic Detail View (inside topic) */
            <div className="space-y-5">
              {/* Action Buttons Bar: Spacious & Clean */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleAddSet(activeTopic)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>To'plamga saqlash</span>
                </button>

                <button
                  onClick={() => handlePlayNow(activeTopic)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Hozir o'ynash</span>
                </button>
              </div>

              {/* Topic Description Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-3xl sm:text-4xl shrink-0">{activeTopic.icon}</div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    {activeTopic.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeTopic.description}
                  </p>
                </div>
              </div>

              {/* Word List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {previewWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-400 transition-colors group"
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredTopics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                        {topic.icon}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {topic.rawWords.length} ta so'z
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {topic.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>So'zlarni ko'rish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNow(topic);
                      }}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-xs"
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
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-none">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Jami {PRESET_TOPICS.length} ta mavzu va 300+ so'z</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold hover:underline cursor-pointer shrink-0 ml-2"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
