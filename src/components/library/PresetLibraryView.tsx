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
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';

interface PresetLibraryViewProps {
  onPlayDirectly: (newSet: WordSet) => void;
  onAddToMySets: (newSet: WordSet) => void;
  onBack?: () => void;
}

const LANGUAGES = [
  { id: 'en' as const, label: 'Inglizcha', flag: '🇬🇧', code: 'EN' },
  { id: 'ru' as const, label: 'Ruscha', flag: '🇷🇺', code: 'RU' },
  { id: 'de' as const, label: 'Nemischa', flag: '🇩🇪', code: 'DE' },
];

const CATEGORY_ICONS: Record<string, string> = {
  all: '✨',
  'Kundalik hayot': '👨‍👩‍👦',
  'Taomlar va ichimliklar': '🍎',
  'Kasblar va faoliyat': '💼',
  "Ta'lim va fan": '🎓',
  'Sayohat va transport': '✈️',
  'IT va texnologiyalar': '💻',
  'Sport va salomatlik': '⚽',
  'Tabiat va hayvonlar': '🌿',
};

export const PresetLibraryView: React.FC<PresetLibraryViewProps> = ({
  onPlayDirectly,
  onAddToMySets,
  onBack,
}) => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'ru' | 'de'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<PresetTopic | null>(null);

  // Custom Dropdowns
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);

  const categories = ['all', ...Array.from(new Set(PRESET_TOPICS.map(t => t.category)))];

  const filteredTopics = PRESET_TOPICS.filter(
    t => selectedCategory === 'all' || t.category === selectedCategory
  );

  const activeLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];

  const previewWords = activeTopic
    ? createWordSetFromPreset(activeTopic, selectedLang).words
    : [];

  const handlePlayNow = (topic: PresetTopic) => {
    const wordSet = createWordSetFromPreset(topic, selectedLang);
    onPlayDirectly(wordSet);
  };

  const handleAddSet = (topic: PresetTopic) => {
    const wordSet = createWordSetFromPreset(topic, selectedLang);
    onAddToMySets(wordSet);
    setActiveTopic(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-pop">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {activeTopic ? (
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActiveTopic(null)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Barcha andozalarga qaytish"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-500" />
              <span>Barcha andozalar</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                <span className="text-2xl">{activeTopic.icon}</span>
                <span className="truncate">{activeTopic.name}</span>
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {previewWords.length} ta so'z • {activeLangObj.label}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Tayyor andozalar</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Kerakli til va mavzuni tanlang, to'plamingizga saqlang yoki darhol o'ynang
              </p>
            </div>
          </div>
        )}

        {/* Back to Home button (optional) */}
        {onBack && !activeTopic && (
          <button
            onClick={onBack}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            ← Bosh sahifaga qaytish
          </button>
        )}
      </div>

      {/* CUSTOM DROPDOWNS BAR (Single-Row, Custom Components, Zero Browser Select) */}
      {!activeTopic && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs">
          {/* Custom Language Dropdown (Tillar) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsCatMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isLangMenuOpen
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
              }`}
              title="Tilni o'zgartirish"
            >
              <span className="text-sm">{activeLangObj.flag}</span>
              <span className="font-extrabold">{activeLangObj.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isLangMenuOpen ? 'rotate-180 text-indigo-500' : ''
                }`}
              />
            </button>

            {/* Language Custom Popover Menu */}
            {isLangMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsLangMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-40 animate-pop">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    O'rganiladigan til
                  </div>
                  {LANGUAGES.map(lang => {
                    const isSelected = selectedLang === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang.id);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Custom Type / Category Dropdown (Andoza turi) */}
          <div className="relative">
            <div
              className={`flex items-center rounded-xl border transition-all shadow-2xs ${
                isCatMenuOpen
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-slate-800'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsCatMenuOpen(!isCatMenuOpen);
                  setIsLangMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                title="Mavzu / Andoza turini tanlash"
              >
                <span className="text-sm">{CATEGORY_ICONS[selectedCategory] || '🎯'}</span>
                <span className="max-w-[120px] xs:max-w-[160px] sm:max-w-[220px] truncate font-extrabold">
                  {selectedCategory === 'all' ? 'Barcha turlar' : selectedCategory}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isCatMenuOpen ? 'rotate-180 text-indigo-500' : ''
                  }`}
                />
              </button>

              {/* Reset X button beside category name when a category is selected */}
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('all');
                  }}
                  className="p-1.5 mr-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Barcha turlarga qaytarish"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Custom Popover Menu */}
            {isCatMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsCatMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-1.5 w-64 max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-40 animate-pop">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mavzu / Andoza turi
                  </div>
                  {categories.map(cat => {
                    const isSelected = selectedCategory === cat;
                    const count =
                      cat === 'all'
                        ? PRESET_TOPICS.length
                        : PRESET_TOPICS.filter(t => t.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCatMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="text-sm">{CATEGORY_ICONS[cat] || '📁'}</span>
                          <span className="truncate">{cat === 'all' ? 'Barcha turlar' : cat}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                            {count}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
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

      {/* Main Content Area */}
      <div>
        {activeTopic ? (
          /* Topic Detail View */
          <div className="space-y-5">
            {/* Action Buttons Bar */}
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              <button
                onClick={() => handleAddSet(activeTopic)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>To'plamga saqlash</span>
              </button>

              <button
                onClick={() => handlePlayNow(activeTopic)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Hozir o'ynash</span>
              </button>
            </div>

            {/* Topic Description Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {previewWords.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-colors group"
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
          /* Topics Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map(topic => (
              <div
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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

                <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>So'zlarni ko'rish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayNow(topic);
                    }}
                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
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
    </div>
  );
};
