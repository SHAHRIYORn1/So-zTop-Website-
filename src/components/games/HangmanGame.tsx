import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';
import { Volume2, Heart } from 'lucide-react';

interface HangmanGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_LIVES = 6;

export const HangmanGame: React.FC<HangmanGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [questions, setQuestions] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  useEffect(() => {
    const valid = words.filter(w => {
      const clean = w.w.trim().replace(/\s/g, '');
      return clean.length >= 3 && clean.length <= 10 && w.tr;
    });
    const shuffled = shuffleArray([...valid]).slice(0, 6);
    setQuestions(shuffled);
  }, [words]);

  const currentWord = questions[currentIndex];

  useEffect(() => {
    if (questions.length > 0 && currentWord) {
      setGuessedLetters(new Set());
      onUpdateProgress(currentIndex, questions.length);
    }
  }, [currentIndex, questions]);

  if (!currentWord) return null;

  const targetWord = currentWord.w.toUpperCase().replace(/\s/g, '');
  const wrongGuesses = [...guessedLetters].filter(l => !targetWord.includes(l));
  const lives = MAX_LIVES - wrongGuesses.length;
  const isWon = [...targetWord].every(ch => guessedLetters.has(ch));
  const isLost = lives <= 0;
  const isRoundOver = isWon || isLost;

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || isRoundOver) return;
    const next = new Set([...guessedLetters, letter]);
    setGuessedLetters(next);

    const nextWrong = [...next].filter(l => !targetWord.includes(l));
    const nextLives = MAX_LIVES - nextWrong.length;
    const nextIsWon = [...targetWord].every(ch => next.has(ch));
    const nextIsLost = nextLives <= 0;

    if (nextIsWon) {
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
      speakWord(currentWord.w, currentWord.lg || 'en');
    }

    if (nextIsWon || nextIsLost) {
      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(i => i + 1);
        } else {
          onFinish(nextIsWon ? score + 1 : score, questions.length, learnedWords);
        }
      }, 1200);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-pop">
      {/* Lives indicator */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < lives
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-slate-200 dark:text-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Hint (translation) */}
      <div className="flex flex-col items-center p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
          Qaysi so'z?
        </span>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
            {currentWord.tr || '—'}
          </p>
          <button
            onClick={() => speakWord(currentWord.w, currentWord.lg || 'en')}
            className="p-1.5 rounded-full text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Word blanks */}
        <div className="flex gap-2 flex-wrap justify-center">
          {[...targetWord].map((ch, i) => (
            <div
              key={i}
              className={`w-10 h-12 rounded-xl border-b-2 flex items-center justify-center font-black text-xl transition-all ${
                guessedLetters.has(ch)
                  ? isWon
                    ? 'text-emerald-600 border-emerald-500'
                    : 'text-slate-900 dark:text-slate-100 border-slate-400'
                  : isLost
                  ? 'text-rose-500 border-rose-400'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {guessedLetters.has(ch) ? ch : isLost ? ch : ''}
            </div>
          ))}
        </div>

        {/* Wrong guesses */}
        {wrongGuesses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {wrongGuesses.map(l => (
              <span
                key={l}
                className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-500 font-bold text-sm flex items-center justify-center"
              >
                {l}
              </span>
            ))}
          </div>
        )}

        {/* Result message */}
        {isWon && (
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg animate-pop">
            🎉 To'g'ri!
          </p>
        )}
        {isLost && (
          <p className="text-rose-500 font-bold text-lg">
            😔 Javob: <strong>{currentWord.w}</strong>
          </p>
        )}
      </div>

      {/* Keyboard */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALPHABET.map(letter => {
          const isGuessed = guessedLetters.has(letter);
          const isWrong = isGuessed && !targetWord.includes(letter);
          const isCorrect = isGuessed && targetWord.includes(letter);

          return (
            <button
              key={letter}
              disabled={isGuessed || isRoundOver}
              onClick={() => handleGuess(letter)}
              className={`w-9 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                isCorrect
                  ? 'bg-emerald-500 text-white cursor-default'
                  : isWrong
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default opacity-40'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
