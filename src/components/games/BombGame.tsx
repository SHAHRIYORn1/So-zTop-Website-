import React, { useState, useEffect, useRef } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Bomb, Flame, Check, X } from 'lucide-react';

interface BombGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const BombGame: React.FC<BombGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => [...words].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  // Timers
  const INITIAL_TIME = 20;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [fuseLeft, setFuseLeft] = useState(7);
  const [fuseMax, setFuseMax] = useState(7);

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isExploded, setIsExploded] = useState(false);

  const currentWord = shuffled[currentIndex];
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Set fuse duration for each question
  useEffect(() => {
    if (currentWord) {
      const fuse = Math.max(5, 9 - Math.floor((currentIndex * 4) / shuffled.length));
      setFuseMax(fuse);
      setFuseLeft(fuse);
      setInputVal('');
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, currentWord, shuffled.length]);

  // Main countdown loop (100ms ticks)
  useEffect(() => {
    if (isExploded || currentIndex >= shuffled.length) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, +(prev - 0.1).toFixed(1));
        if (next <= 0) {
          clearInterval(interval);
          handleExplode();
          return 0;
        }
        return next;
      });

      setFuseLeft(prev => {
        const next = Math.max(0, +(prev - 0.1).toFixed(1));
        if (next <= 0) {
          // Fuse burned out for current word!
          handleFuseBurnOut();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isExploded, currentIndex, shuffled.length]);

  const handleExplode = () => {
    setIsExploded(true);
    sounds.playWrong();
    setTimeout(() => {
      onFinish(score, shuffled.length, learnedWords);
    }, 1200);
  };

  const handleFuseBurnOut = () => {
    sounds.playWrong();
    setFeedback('wrong');
    // Penalize -5 seconds
    setTimeLeft(t => Math.max(0, +(t - 5).toFixed(1)));

    setTimeout(() => {
      advanceWord(false);
    }, 800);
  };

  const advanceWord = (wasCorrect: boolean) => {
    if (wasCorrect && currentWord) {
      setLearnedWords(prev => [...prev, currentWord.w]);
    }
    const nextIdx = currentIndex + 1;
    onUpdateProgress(nextIdx, shuffled.length);

    if (nextIdx >= shuffled.length) {
      sounds.playWin();
      onFinish(score + (wasCorrect ? 1 : 0), shuffled.length, learnedWords);
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentWord || feedback) return;

    const userText = inputVal.trim().toLowerCase();
    const correctTarget = (currentWord.tr || '').trim().toLowerCase();

    // Check match or close match
    const isOk = userText === correctTarget || userText === currentWord.w.toLowerCase();

    if (isOk) {
      sounds.playCorrect();
      setFeedback('correct');
      setScore(s => s + 1);
      // Reward +2 seconds
      setTimeLeft(t => Math.min(INITIAL_TIME, +(t + 2).toFixed(1)));
      speech.speak(currentWord.w, currentWord.lg || 'en');
      setTimeout(() => advanceWord(true), 600);
    } else {
      sounds.playWrong();
      setFeedback('wrong');
      // Penalty -5 seconds
      setTimeLeft(t => Math.max(0, +(t - 5).toFixed(1)));
      setTimeout(() => advanceWord(false), 900);
    }
  };

  if (!currentWord || isExploded) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-6xl animate-bounce">💥</div>
        <h2 className="text-2xl font-black text-rose-600">Bomba portladi!</h2>
        <p className="text-slate-500">Vaqt tugadi. Natijalar hisoblanmoqda…</p>
      </div>
    );
  }

  const timePercent = Math.min(100, (timeLeft / INITIAL_TIME) * 100);
  const fusePercent = Math.min(100, (fuseLeft / fuseMax) * 100);
  const isUrgent = timeLeft < 7;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Bomb Header and Timer */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isUrgent ? 'bg-rose-600 animate-pulse' : 'bg-slate-800'}`}>
            <Bomb className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Umumiy vaqt
            </div>
            <div className={`text-2xl font-black tracking-tight ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`}>
              {Math.ceil(timeLeft)} soniya
            </div>
          </div>
        </div>

        {/* Word progress */}
        <div className="text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Savol
          </div>
          <div className="text-xl font-extrabold text-white">
            {currentIndex + 1} / {shuffled.length}
          </div>
        </div>
      </div>

      {/* Main Time Bar */}
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${
            isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
          }`}
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* Word Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 text-center relative">
        {/* Word Fuse Indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1 text-orange-500">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" /> Fitil
            </span>
            <span>{Math.ceil(fuseLeft)}s</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-100"
              style={{ width: `${fusePercent}%` }}
            />
          </div>
        </div>

        {/* Big Word to Translate */}
        <div className="py-4">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-wide">
            {currentWord.w}
          </span>
          <p className="text-xs font-semibold text-slate-400 mt-2">
            To'g'ri tarjimasini yozing: (+2s to'g'ri, −5s xato!)
          </p>
        </div>

        {/* Input Field */}
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              disabled={!!feedback}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCheckAnswer();
              }}
              placeholder="Tarjimani kiriting…"
              className={`w-full py-3.5 px-4 rounded-2xl text-center text-lg font-bold border-2 transition-all outline-none ${
                feedback === 'correct'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : feedback === 'wrong'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-indigo-500'
              }`}
            />
            {feedback === 'correct' && (
              <Check className="w-6 h-6 text-emerald-500 absolute right-4 top-4 animate-in zoom-in" />
            )}
            {feedback === 'wrong' && (
              <X className="w-6 h-6 text-rose-500 absolute right-4 top-4 animate-in zoom-in" />
            )}
          </div>

          {/* Correct answer reveal if wrong */}
          {feedback === 'wrong' && (
            <p className="text-sm font-bold text-rose-600 animate-in fade-in">
              To'g'ri javob: <span className="underline">{currentWord.tr}</span>
            </p>
          )}

          {/* Submit Button */}
          <button
            type="button"
            disabled={!inputVal.trim() || !!feedback}
            onClick={handleCheckAnswer}
            className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              inputVal.trim() && !feedback
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-98'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Tasdiqlash (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
