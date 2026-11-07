import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { PenTool, Check, X } from 'lucide-react';

interface FillGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const FillGame: React.FC<FillGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => shuffleArray([...words]));
  const total = shuffled.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentWord = shuffled[currentIndex];
  const targetWord = currentWord ? (currentWord.tr || currentWord.w) : '';

  // Mask some characters
  const maskedDisplay = React.useMemo(() => {
    if (!targetWord) return '';
    const chars = [...targetWord];
    return chars
      .map((c, i) => {
        if (c === ' ') return '  ';
        return i % 2 === 1 ? '_' : c;
      })
      .join(' ');
  }, [targetWord]);

  useEffect(() => {
    setInputVal('');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentIndex, currentWord]);

  const handleCheck = () => {
    if (!currentWord || feedback) return;

    const userText = inputVal.trim().toLowerCase();
    const correctTarget = targetWord.trim().toLowerCase();

    const isOk = userText === correctTarget;
    if (isOk) {
      sounds.playCorrect();
      setFeedback('correct');
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
      speech.speak(currentWord.w, currentWord.lg || 'en');
    } else {
      sounds.playWrong();
      setFeedback('wrong');
    }

    const nextIdx = currentIndex + 1;
    onUpdateProgress(nextIdx, total);

    setTimeout(() => {
      if (nextIdx >= total) {
        sounds.playWin();
        onFinish(score + (isOk ? 1 : 0), total, learnedWords);
      } else {
        setCurrentIndex(nextIdx);
      }
    }, 1000);
  };

  if (!currentWord || currentIndex >= total) return null;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Target prompt */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-center gap-1.5">
          <PenTool className="w-4 h-4" /> Tushirib qoldirilgan harflarni to'ldiring!
        </span>
        <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
          {currentWord.w}
        </div>
        <div className="text-3xl font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
          {maskedDisplay}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            disabled={!!feedback}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCheck();
            }}
            placeholder="So'zni to'liq yozing…"
            className={`w-full py-4 px-4 rounded-2xl text-center text-lg font-bold border-2 transition-all outline-none ${
              feedback === 'correct'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : feedback === 'wrong'
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500'
            }`}
          />
          {feedback === 'correct' && (
            <Check className="w-6 h-6 text-emerald-500 absolute right-4 top-4" />
          )}
          {feedback === 'wrong' && (
            <X className="w-6 h-6 text-rose-500 absolute right-4 top-4" />
          )}
        </div>

        {feedback === 'wrong' && (
          <p className="text-center text-sm font-bold text-rose-600">
            To'g'ri yozilishi: <span className="underline">{targetWord}</span>
          </p>
        )}

        <button
          type="button"
          disabled={!inputVal.trim() || !!feedback}
          onClick={handleCheck}
          className={`w-full py-3.5 rounded-2xl font-black text-base transition-all cursor-pointer shadow-md ${
            inputVal.trim() && !feedback
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          Tasdiqlash (Enter)
        </button>
      </div>
    </div>
  );
};
