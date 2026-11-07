import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { SearchCheck } from 'lucide-react';

interface SpotGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const SpotGame: React.FC<SpotGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  // Only words with at least 3 letters
  const validWords = words.filter(w => (w.tr || w.w).length >= 3);
  const [shuffled] = useState<WordItem[]>(() => shuffleArray([...validWords]));
  const total = shuffled.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const [letters, setLetters] = useState<string[]>([]);
  const [wrongIndex, setWrongIndex] = useState<number>(-1);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const currentWord = shuffled[currentIndex];

  useEffect(() => {
    if (!currentWord) return;

    const targetStr = (currentWord.tr || currentWord.w);
    const chars = [...targetStr];

    // Pick random letter position to corrupt
    const letterIndices = chars
      .map((c, i) => (/\p{L}/u.test(c) ? i : -1))
      .filter(i => i >= 0);

    const corruptIdx = letterIndices[Math.floor(Math.random() * letterIndices.length)];
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => c !== chars[corruptIdx].toLowerCase());
    const replacement = alphabet[Math.floor(Math.random() * alphabet.length)];

    const corruptedChars = [...chars];
    corruptedChars[corruptIdx] = replacement;

    setLetters(corruptedChars);
    setWrongIndex(corruptIdx);
    setSelectedIdx(null);
  }, [currentIndex, currentWord]);

  const handleSelectLetter = (idx: number) => {
    if (selectedIdx !== null || !currentWord) return;
    setSelectedIdx(idx);

    const isCorrect = idx === wrongIndex;
    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
      speech.speak(currentWord.w, currentWord.lg || 'en');
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
    }, 900);
  };

  if (!currentWord || currentIndex >= total) return null;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center justify-center gap-1.5">
          <SearchCheck className="w-4 h-4" /> 1 ta xato harf bor — toping!
        </span>
        <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
          {currentWord.w}
        </div>
      </div>

      {/* Corrupted Letter Tiles */}
      <div className="flex flex-wrap gap-2 justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800">
        {letters.map((char, i) => {
          const isSpace = char === ' ';
          if (isSpace) return <span key={i} className="w-4" />;

          const isSelected = selectedIdx === i;
          const isTheWrongChar = i === wrongIndex;

          let btnClass = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500';
          if (selectedIdx !== null) {
            if (isTheWrongChar) {
              btnClass = 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105';
            } else if (isSelected) {
              btnClass = 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/30';
            } else {
              btnClass = 'opacity-40 border-slate-200 dark:border-slate-800';
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={selectedIdx !== null}
              onClick={() => handleSelectLetter(i)}
              className={`w-12 h-14 rounded-2xl font-black text-2xl flex items-center justify-center border-2 transition-all cursor-pointer ${btnClass}`}
            >
              {char}
            </button>
          );
        })}
      </div>

      {/* Correction Display */}
      {selectedIdx !== null && (
        <div className="text-center text-sm font-bold text-slate-600 dark:text-slate-400 animate-in fade-in">
          To'g'ri yozilishi: <span className="text-emerald-600 font-extrabold">{currentWord.tr || currentWord.w}</span>
        </div>
      )}
    </div>
  );
};
