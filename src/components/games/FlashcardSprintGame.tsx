import React, { useState } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { RotateCw, Check, X, Volume2, Sparkles } from 'lucide-react';

interface FlashcardSprintGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const FlashcardSprintGame: React.FC<FlashcardSprintGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => [...words].sort(() => Math.random() - 0.5));
  const total = shuffled.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const currentWord = shuffled[currentIndex];

  const handleFlip = () => {
    sounds.playPop();
    setIsFlipped(!isFlipped);
  };

  const handleKnown = (known: boolean) => {
    if (!currentWord) return;

    if (known) {
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
    } else {
      sounds.playWrong();
    }

    const nextIdx = currentIndex + 1;
    onUpdateProgress(nextIdx, total);
    setIsFlipped(false);

    setTimeout(() => {
      if (nextIdx >= total) {
        sounds.playWin();
        onFinish(score + (known ? 1 : 0), total, learnedWords);
      } else {
        setCurrentIndex(nextIdx);
      }
    }, 300);
  };

  if (!currentWord || currentIndex >= total) return null;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Interaktiv Flashcard
        </span>
        <p className="text-xs text-slate-400">
          Tarjimasini ko'rish uchun kartochkani bosing
        </p>
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={handleFlip}
        className="w-full h-72 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 shadow-xl cursor-pointer flex flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:scale-[1.02] select-none relative group"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speech.speak(currentWord.w, currentWord.lg || 'en');
          }}
          className="absolute top-5 right-5 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:scale-110 transition-transform"
          title="Talaffuz"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {isFlipped ? currentWord.tr : currentWord.w}
          </div>

          <div className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? "Asl so'zga qaytish" : "Tarjimasini ochish"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Know vs Need Practice */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleKnown(false)}
          className="py-4 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950/50 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Yana o'rganaman</span>
        </button>

        <button
          type="button"
          onClick={() => handleKnown(true)}
          className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Yodlab oldim ✅</span>
        </button>
      </div>
    </div>
  );
};
