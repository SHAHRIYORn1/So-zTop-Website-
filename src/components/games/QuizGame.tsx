import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';
import { sounds } from '../../services/soundEffects';
import { Volume2 } from 'lucide-react';

interface QuizGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface Question {
  word: WordItem;
  options: string[];
  correctAnswer: string;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  // Prepare questions
  useEffect(() => {
    const valid = words.filter(w => w.tr && w.tr.trim());
    const shuffled = shuffleArray([...valid]);
    const roundCount = Math.min(10, shuffled.length);

    const generated: Question[] = shuffled.slice(0, roundCount).map(item => {
      const correctTr = (item.tr || '').trim();
      const uniqueWrong = Array.from(
        new Set(
          valid
            .filter(w => (w.tr || '').trim() !== correctTr)
            .map(w => (w.tr || '').trim())
        )
      ).filter(Boolean);
      const wrongPool = shuffleArray(uniqueWrong).slice(0, 3);
      const allOptions = shuffleArray([...wrongPool, correctTr]);
      return {
        word: item,
        options: allOptions,
        correctAnswer: correctTr,
      };
    });

    setQuestions(generated);
  }, [words]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (questions.length > 0 && currentQ) {
      onUpdateProgress(currentIndex, questions.length);
      // Auto-pronounce word
      speakWord(currentQ.word.w, currentQ.word.lg || 'en');
    }
  }, [currentIndex, questions]);

  const handleSelect = (option: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentQ.word.w]);
    } else {
      sounds.playWrong();
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        onFinish(isCorrect ? score + 1 : score, questions.length, learnedWords);
      }
    }, 900);
  };

  if (!currentQ) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-pop">
      {/* Question Card */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-500 mb-2">
          Tarjimasini toping
        </span>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {currentQ.word.w}
          </h2>
          <button
            onClick={() => speakWord(currentQ.word.w, currentQ.word.lg || 'en')}
            className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Talaffuz"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {currentQ.options.map((opt, i) => {
          let btnStyle =
            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

          if (isAnswered) {
            if (opt === currentQ.correctAnswer) {
              btnStyle = 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20';
            } else if (opt === selectedOption) {
              btnStyle = 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-500/20';
            } else {
              btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
            }
          }

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
              className={`p-4 sm:p-5 rounded-2xl border-2 font-bold text-lg text-center transition-all cursor-pointer active:scale-98 ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
