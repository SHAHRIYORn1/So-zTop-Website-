import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Volume2, Puzzle as PuzzleIcon } from 'lucide-react';

interface PuzzleGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface Piece {
  id: number;
  text: string;
  order: number;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffledWords] = useState<WordItem[]>(() => shuffleArray([...words]));
  const total = shuffledWords.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedPieces, setSelectedPieces] = useState<Piece[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'failed'>('idle');
  const [mistakes, setMistakes] = useState(0);

  const currentWord = shuffledWords[currentIndex];

  // Helper to split a word into 2-4 nice jigsaw pieces
  const splitIntoPieces = (word: string): Piece[] => {
    const clean = word.trim().toUpperCase();
    const len = clean.length;
    let parts: string[] = [];

    if (len <= 4) {
      // 2 pieces
      const mid = Math.floor(len / 2);
      parts = [clean.slice(0, mid), clean.slice(mid)];
    } else if (len <= 7) {
      // 3 pieces
      const p1 = Math.ceil(len / 3);
      const p2 = p1 * 2;
      parts = [clean.slice(0, p1), clean.slice(p1, p2), clean.slice(p2)];
    } else {
      // 4 pieces
      const step = Math.ceil(len / 4);
      parts = [
        clean.slice(0, step),
        clean.slice(step, step * 2),
        clean.slice(step * 2, step * 3),
        clean.slice(step * 3),
      ];
    }

    return parts.filter(p => p.length > 0).map((text, idx) => ({
      id: idx,
      text,
      order: idx,
    }));
  };

  useEffect(() => {
    if (!currentWord) return;

    const rawPieces = splitIntoPieces(currentWord.w);
    // Shuffle available pieces
    setPieces(shuffleArray([...rawPieces]));
    setSelectedPieces([]);
    setStatus('idle');
    setMistakes(0);
  }, [currentIndex, currentWord]);

  const handlePickPiece = (piece: Piece) => {
    if (status !== 'idle') return;

    sounds.playPop();
    const nextSelected = [...selectedPieces, piece];
    setSelectedPieces(nextSelected);
    setPieces(prev => prev.filter(p => p.id !== piece.id));

    // Check if all pieces selected
    if (nextSelected.length === splitIntoPieces(currentWord.w).length) {
      const assembled = nextSelected.map(p => p.text).join('');
      const target = currentWord.w.trim().toUpperCase();

      if (assembled === target) {
        sounds.playCorrect();
        speech.speak(currentWord.w, currentWord.lg || 'en');
        setStatus('correct');
        setScore(s => s + 1);
        setLearnedWords(l => [...l, currentWord.w]);

        setTimeout(() => advanceWord(true), 1000);
      } else {
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);
        sounds.playWrong();

        if (nextMistakes >= 2) {
          // 2 mistakes -> Show correct answer & move on
          setStatus('failed');
          speech.speak(currentWord.w, currentWord.lg || 'en');
          setTimeout(() => {
            advanceWord(false);
          }, 1600);
        } else {
          setStatus('wrong');
          setTimeout(() => {
            // Reset current word pieces
            const rawPieces = splitIntoPieces(currentWord.w);
            setPieces(shuffleArray([...rawPieces]));
            setSelectedPieces([]);
            setStatus('idle');
          }, 1200);
        }
      }
    }
  };

  const advanceWord = (wasCorrect: boolean) => {
    const nextIdx = currentIndex + 1;
    onUpdateProgress(nextIdx, total);

    if (nextIdx >= total) {
      sounds.playWin();
      onFinish(score + (wasCorrect ? 1 : 0), total, learnedWords);
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6 select-none">
      {/* Target Word Clue Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <PuzzleIcon className="w-5 h-5 text-indigo-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Bo'laklardan so'zni yig'ing (Puzzle)
          </p>
          <button
            onClick={() => speech.speak(currentWord.w, currentWord.lg || 'en')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            title="Eshitish"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
          {currentWord.tr}
        </div>
      </div>

      {/* Assembly Area (Jigsaw slot tray) */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-2 border-dashed border-indigo-300 dark:border-indigo-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-h-[60px] sm:min-h-[75px]">
          {selectedPieces.map((piece, i) => (
            <div
              key={i}
              className={`px-3 py-2.5 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl flex items-center justify-center shadow-lg transition-transform animate-in zoom-in-95 shrink-0 ${
                status === 'correct'
                  ? 'bg-emerald-500 text-white border-2 border-emerald-400'
                  : status === 'wrong'
                  ? 'bg-rose-500 text-white border-2 border-rose-400 animate-shake'
                  : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-500/40'
              }`}
            >
              {piece.text}
            </div>
          ))}

          {selectedPieces.length === 0 && (
            <span className="text-xs font-semibold text-slate-400 italic">
              Bo'laklarni ketma-ket bosing...
            </span>
          )}
        </div>

        {status === 'correct' && (
          <p className="text-emerald-600 font-black text-sm mt-3 animate-in zoom-in">
            🎉 Barakalla! Puzzle to'g'ri yig'ildi!
          </p>
        )}
        {status === 'wrong' && (
          <p className="text-rose-500 font-bold text-xs mt-3 animate-in zoom-in">
            1-xato! Yana 1 ta imkoniyatingiz bor, qayta urinib ko'ring!
          </p>
        )}
        {status === 'failed' && (
          <p className="text-rose-500 font-bold text-xs mt-3 animate-in zoom-in">
            2 marta xato qilindi! To'g'ri javob: <span className="font-black underline">{currentWord.w}</span>
          </p>
        )}
      </div>

      {/* Pieces Tray */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          Mavjud bo'laklar:
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {pieces.map(piece => (
            <button
              key={piece.id}
              type="button"
              onClick={() => handlePickPiece(piece)}
              className="px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-lg sm:text-2xl shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              {piece.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
