import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Volume2, Check, X } from 'lucide-react';

interface DictationGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const DictationGame: React.FC<DictationGameProps> = ({
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

  useEffect(() => {
    if (!currentWord) return;
    setInputVal('');
    setFeedback(null);
    speech.speak(currentWord.w, currentWord.lg || 'en');
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [currentIndex, currentWord]);

  const handlePlayAudio = () => {
    if (!currentWord) return;
    speech.speak(currentWord.w, currentWord.lg || 'en');
  };

  const handleCheck = () => {
    if (!currentWord || feedback) return;

    const userText = inputVal.trim().toLowerCase();
    const target = currentWord.w.trim().toLowerCase();

    const isOk = userText === target;
    if (isOk) {
      sounds.playCorrect();
      setFeedback('correct');
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
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
      {/* Audio speaker card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
        <button
          type="button"
          onClick={handlePlayAudio}
          className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mx-auto"
        >
          <Volume2 className="w-10 h-10" />
        </button>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Diktant
          </span>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Eshitgan so'zingizni to'g'ri yozing
          </p>
          {currentWord.tr && (
            <p className="text-xs text-slate-400 mt-1">
              Tarjimasi: <span className="font-bold text-slate-600 dark:text-slate-300">{currentWord.tr}</span>
            </p>
          )}
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
            placeholder="So'zni kiriting…"
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
            To'g'ri yozilishi: <span className="underline">{currentWord.w}</span>
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
          Tekshirish (Enter)
        </button>
      </div>
    </div>
  );
};
