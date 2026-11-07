import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Volume2 } from 'lucide-react';

interface ListenGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const ListenGame: React.FC<ListenGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => shuffleArray([...words]));
  const total = shuffled.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const currentWord = shuffled[currentIndex];

  useEffect(() => {
    if (!currentWord) return;

    // Speak audio immediately
    speech.speak(currentWord.w, currentWord.lg || 'en');

    // Create 4 word options
    const correct = currentWord.w;
    const others = words.filter(w => w.w !== correct);
    const dist = shuffleArray([...others]).slice(0, 3);
    const opts = shuffleArray([correct, ...dist.map(w => w.w)]);

    setOptions(opts);
    setSelectedOpt(null);
  }, [currentIndex, currentWord, words]);

  const handlePlayAudio = () => {
    if (!currentWord) return;
    speech.speak(currentWord.w, currentWord.lg || 'en');
  };

  const handleSelect = (opt: string) => {
    if (selectedOpt || !currentWord) return;
    setSelectedOpt(opt);

    const isCorrect = opt === currentWord.w;
    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
    } else {
      sounds.playWrong();
    }

    const nextIdx = currentIndex + 1;
    onUpdateProgress(nextIdx, total);

    setTimeout(() => {
      if (nextIdx >= total) {
        sounds.playWin();
        onFinish(score + (isCorrect ? 1 : 0), total, learnedWords);
      } else {
        setCurrentIndex(nextIdx);
      }
    }, 800);
  };

  if (!currentWord || currentIndex >= total) return null;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Speaker Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="w-24 h-24 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-all cursor-pointer group"
          >
            <Volume2 className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Eshiting va to'g'ri so'zni tanlang!
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Qayta eshitish uchun tugmani bosing
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isSelected = selectedOpt === opt;
          const isCorrect = opt === currentWord.w;

          let btnClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500';
          if (selectedOpt) {
            if (isCorrect) {
              btnClass = 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
            } else if (isSelected) {
              btnClass = 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20';
            } else {
              btnClass = 'opacity-40 border-slate-200 dark:border-slate-800';
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={!!selectedOpt}
              onClick={() => handleSelect(opt)}
              className={`py-4 px-4 rounded-2xl font-bold text-base border-2 transition-all cursor-pointer text-center ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
