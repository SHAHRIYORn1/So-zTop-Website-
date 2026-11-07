import React, { useState } from 'react';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';
import { Volume2, RefreshCw } from 'lucide-react';

interface WordRackProps {
  words: WordItem[];
}

export const WordRack: React.FC<WordRackProps> = ({ words }) => {
  const eligible = words.filter(w => w.w.trim().length >= 3 && w.w.trim().length <= 9);

  const getRandomWord = () => {
    if (eligible.length === 0) return { w: 'SOZTOP', tr: "So'z topish o'yini", lg: 'en' };
    return eligible[Math.floor(Math.random() * eligible.length)];
  };

  const [currentWord, setCurrentWord] = useState<WordItem>(getRandomWord);
  const [isSolved, setIsSolved] = useState(false);

  // Scramble letters helper
  const getScrambled = (text: string) => {
    const letters = text.toUpperCase().replace(/\s/g, '').split('');
    return letters.sort(() => Math.random() - 0.5);
  };

  const [scrambled, setScrambled] = useState<string[]>(() => getScrambled(currentWord.w));

  const handleNext = () => {
    const next = getRandomWord();
    setCurrentWord(next);
    setScrambled(getScrambled(next.w));
    setIsSolved(false);
  };

  const handleSolveToggle = () => {
    if (!isSolved) {
      setIsSolved(true);
      speakWord(currentWord.w, currentWord.lg || 'en');
    } else {
      handleNext();
    }
  };

  const displayLetters = isSolved
    ? currentWord.w.toUpperCase().replace(/\s/g, '').split('')
    : scrambled;

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-all w-full overflow-hidden">
      <div
        onClick={handleSolveToggle}
        className="flex flex-wrap gap-1.5 sm:gap-2 justify-center cursor-pointer py-2 sm:py-3 select-none max-w-full"
        title="Bosing, so'z yig'iladi"
      >
        {displayLetters.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={`flex items-center justify-center w-9 h-12 sm:w-13 sm:h-16 rounded-lg sm:rounded-xl font-black text-lg sm:text-2xl transition-all duration-200 shrink-0 ${
              isSolved
                ? 'bg-emerald-500 text-white shadow-[0_3px_0_#059669] scale-105'
                : 'bg-amber-400 dark:bg-amber-500 text-amber-950 shadow-[0_3px_0_#b45309] hover:-translate-y-0.5'
            }`}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4 text-center">
        {isSolved ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
              {currentWord.tr || currentWord.w}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(currentWord.w, currentWord.lg || 'en');
              }}
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer"
              title="Talaffuz"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Harflarni bosib so'zni oching
          </span>
        )}

        <button
          onClick={handleNext}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Boshqa so'z"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
