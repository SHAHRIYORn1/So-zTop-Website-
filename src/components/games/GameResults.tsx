import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { Star, RotateCcw, Home, Trophy } from 'lucide-react';

interface GameResultsProps {
  score: number;
  total: number;
  earnedStars: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({
  score,
  total,
  earnedStars,
  onPlayAgain,
  onGoHome,
}) => {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    sounds.playWin();
    if (percent >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // confetti fallback
      }
    }
  }, [percent]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg mt-6 animate-pop">
      {/* Trophy / Icon */}
      <div className="w-20 h-20 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center">
        <Trophy className="w-10 h-10" />
      </div>

      {/* Percentage & Message */}
      <div className="space-y-1">
        <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100">
          {percent}%
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400">
          {percent >= 90
            ? 'Ajoyib natija! Mukammal bilasiz!'
            : percent >= 70
            ? 'Yaxshi! Deyarli hammasi to‘g‘ri!'
            : 'Yana mashq qilsangiz, natijangiz yanada yaxshilanadi!'}
        </p>
      </div>

      {/* Stars earned */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(index => (
          <Star
            key={index}
            className={`w-9 h-9 transition-all ${
              index <= earnedStars
                ? 'fill-amber-400 text-amber-400 scale-110'
                : 'text-slate-200 dark:text-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Score details */}
      <div className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
        To'g'ri javoblar: {score} / {total}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 w-full pt-2">
        <button
          onClick={onPlayAgain}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Qayta o'ynash</span>
        </button>

        <button
          onClick={onGoHome}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Bosh sahifa</span>
        </button>
      </div>
    </div>
  );
};
