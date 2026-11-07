import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';
import { Volume2, RotateCcw } from 'lucide-react';

interface ScrambleGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface TileItem {
  id: number;
  char: string;
}

export const ScrambleGame: React.FC<ScrambleGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [questions, setQuestions] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<TileItem[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<TileItem[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    const valid = words.filter(w => w.w.trim().length >= 3 && w.w.trim().length <= 10);
    const shuffled = shuffleArray([...valid]).slice(0, 8);
    setQuestions(shuffled);
  }, [words]);

  const currentWord = questions[currentIndex];

  useEffect(() => {
    if (questions.length > 0 && currentWord) {
      onUpdateProgress(currentIndex, questions.length);
      const chars = currentWord.w.toUpperCase().replace(/\s/g, '').split('');
      const tiles = shuffleArray(chars.map((char, i) => ({ id: i, char })));

      setAvailableTiles(tiles);
      setSelectedTiles([]);
      setIsSuccess(false);
      setIsError(false);
      setMistakes(0);
    }
  }, [currentIndex, questions]);

  const handlePickTile = (tile: TileItem) => {
    if (isSuccess || !currentWord) return;
    const nextSelected = [...selectedTiles, tile];
    setSelectedTiles(nextSelected);
    setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));

    // Check if word is complete
    const targetWord = currentWord.w.toUpperCase().replace(/\s/g, '');
    if (nextSelected.length === targetWord.length) {
      const spelled = nextSelected.map(t => t.char).join('');
      if (spelled === targetWord) {
        setIsSuccess(true);
        speakWord(currentWord.w, currentWord.lg || 'en');
        setScore(s => s + 1);

        setTimeout(() => {
          if (currentIndex + 1 < questions.length) {
            setCurrentIndex(i => i + 1);
          } else {
            onFinish(score + 1, questions.length, questions.map(q => q.w));
          }
        }, 900);
      } else {
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);
        setIsError(true);

        if (nextMistakes >= 2) {
          // 2 mistakes -> Show correct word & advance
          speakWord(currentWord.w, currentWord.lg || 'en');
          setTimeout(() => {
            if (currentIndex + 1 < questions.length) {
              setCurrentIndex(i => i + 1);
            } else {
              onFinish(score, questions.length, questions.map(q => q.w));
            }
          }, 1400);
        } else {
          setTimeout(() => {
            handleReset();
            setIsError(false);
          }, 600);
        }
      }
    }
  };

  const handleRemoveTile = (tile: TileItem) => {
    if (isSuccess) return;
    setSelectedTiles(prev => prev.filter(t => t.id !== tile.id));
    setAvailableTiles(prev => [...prev, tile]);
  };

  const handleReset = () => {
    if (!currentWord) return;
    const chars = currentWord.w.toUpperCase().replace(/\s/g, '').split('');
    const tiles = shuffleArray(chars.map((char, i) => ({ id: i, char })));
    setAvailableTiles(tiles);
    setSelectedTiles([]);
  };

  if (!currentWord) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-pop">
      {/* Translation / Hint Card */}
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <span className="text-xs uppercase font-bold text-amber-500 mb-1">
          So'zni harflardan yig'ing
        </span>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            {currentWord.tr || '—'}
          </h2>
          <button
            onClick={() => speakWord(currentWord.w, currentWord.lg || 'en')}
            className="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
            title="Eshitish"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Answer Slots */}
      <div
        className={`flex flex-wrap gap-2 justify-center min-h-[64px] p-4 rounded-2xl border-2 transition-all ${
          isSuccess
            ? 'border-emerald-500 bg-emerald-500/10'
            : isError
            ? 'border-rose-500 bg-rose-500/10'
            : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'
        }`}
      >
        {selectedTiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => handleRemoveTile(tile)}
            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl font-black text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer ${
              isSuccess
                ? 'bg-emerald-500 text-white shadow-[0_3px_0_#059669]'
                : isError
                ? 'bg-rose-500 text-white animate-shake'
                : 'bg-amber-400 dark:bg-amber-500 text-amber-950 shadow-[0_3px_0_#b45309]'
            }`}
          >
            {tile.char}
          </button>
        ))}
      </div>

      {isError && mistakes >= 2 && (
        <p className="text-center text-rose-500 font-bold text-xs animate-in zoom-in">
          2 marta xato qilindi! To'g'ri javob: <span className="font-black underline">{currentWord.w}</span>
        </p>
      )}
      {isError && mistakes === 1 && (
        <p className="text-center text-rose-500 font-bold text-xs animate-in zoom-in">
          1-xato! Yana 1 ta imkoniyatingiz bor, qayta yig'ing!
        </p>
      )}

      {/* Available Letter Pool */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableTiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => handlePickTile(tile)}
            className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl font-black text-xl sm:text-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm hover:border-amber-400 hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          >
            {tile.char}
          </button>
        ))}
      </div>

      {/* Reset button */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Tozalash</span>
        </button>
      </div>
    </div>
  );
};
