import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';
import { sounds } from '../../services/soundEffects';
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react';

interface TrueFalseGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface TFQuestion {
  word: WordItem;
  shownTranslation: string;
  isCorrect: boolean;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [questions, setQuestions] = useState<TFQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  useEffect(() => {
    const valid = words.filter(w => w.tr && w.tr.trim());
    const shuffled = shuffleArray([...valid]);
    const count = Math.min(10, shuffled.length);

    const qs: TFQuestion[] = shuffled.slice(0, count).map(item => {
      const isCorrect = Math.random() > 0.5;
      let shownTranslation = item.tr!;
      if (!isCorrect) {
        // Pick a wrong translation
        const wrongPool = valid.filter(w => w.tr !== item.tr);
        if (wrongPool.length > 0) {
          const wrong = wrongPool[Math.floor(Math.random() * wrongPool.length)];
          shownTranslation = wrong.tr!;
        } else {
          // fallback: flip to correct
          return { word: item, shownTranslation: item.tr!, isCorrect: true };
        }
      }
      return { word: item, shownTranslation, isCorrect };
    });

    setQuestions(qs);
  }, [words]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (questions.length > 0 && currentQ) {
      onUpdateProgress(currentIndex, questions.length);
      speakWord(currentQ.word.w, currentQ.word.lg || 'en');
    }
  }, [currentIndex, questions]);

  const handleAnswer = (userSaysCorrect: boolean) => {
    if (answered !== null || !currentQ) return;

    const isRight = userSaysCorrect === currentQ.isCorrect;
    setAnswered(userSaysCorrect);

    if (isRight) {
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentQ.word.w]);
    } else {
      sounds.playWrong();
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setAnswered(null);
      } else {
        onFinish(isRight ? score + 1 : score, questions.length, learnedWords);
      }
    }, 900);
  };

  if (!currentQ) return null;

  const wasCorrect = answered !== null && answered === currentQ.isCorrect;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-pop">
      {/* Word Card */}
      <div className="flex flex-col items-center p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
          Tarjima to'g'rimi?
        </span>

        <div className="flex items-center gap-3">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100">
            {currentQ.word.w}
          </h2>
          <button
            onClick={() => speakWord(currentQ.word.w, currentQ.word.lg || 'en')}
            className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 hover:scale-110 transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`px-6 py-3 rounded-2xl text-2xl font-bold transition-colors ${
            answered === null
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              : wasCorrect
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 line-through'
          }`}
        >
          {currentQ.shownTranslation}
        </div>

        {answered !== null && !currentQ.isCorrect && (
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            To'g'ri tarjima: <strong>{currentQ.word.tr}</strong>
          </div>
        )}
      </div>

      {/* True / False Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          disabled={answered !== null}
          onClick={() => handleAnswer(true)}
          className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-2 font-black text-xl transition-all cursor-pointer ${
            answered === true
              ? currentQ.isCorrect
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-rose-600 border-rose-600 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600'
          }`}
        >
          <CheckCircle2 className="w-7 h-7" />
          To'g'ri
        </button>

        <button
          disabled={answered !== null}
          onClick={() => handleAnswer(false)}
          className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-2 font-black text-xl transition-all cursor-pointer ${
            answered === false
              ? !currentQ.isCorrect
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-rose-600 border-rose-600 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600'
          }`}
        >
          <XCircle className="w-7 h-7" />
          Noto'g'ri
        </button>
      </div>
    </div>
  );
};
