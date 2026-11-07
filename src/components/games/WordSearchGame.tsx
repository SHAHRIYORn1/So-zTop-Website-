import React, { useState, useEffect, useMemo } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Search, CheckCircle2 } from 'lucide-react';

interface WordSearchGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

const GRID_SIZE = 9;

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  // Target words (up to 5 words, uppercase, 2-8 chars)
  const targetWords = useMemo(() => {
    return words
      .map(w => ({
        original: w.w,
        clean: (w.tr || w.w).toUpperCase().replace(/[^A-ZА-ЯOʻGʻ]/gi, ''),
        lg: w.lg || 'en',
      }))
      .filter(w => w.clean.length >= 2 && w.clean.length <= 8)
      .slice(0, 5);
  }, [words]);

  const [grid, setGrid] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<{ original: string; clean: string; lg: string }[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<number>>(new Set());

  // Generate grid
  useEffect(() => {
    if (targetWords.length === 0) return;

    const N = GRID_SIZE;
    const g = Array(N * N).fill('');
    const D = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal
    ];
    const placed: { original: string; clean: string; lg: string }[] = [];

    targetWords.forEach(w => {
      const s = w.clean;
      for (let k = 0; k < 300; k++) {
        const [dy, dx] = D[Math.floor(Math.random() * D.length)];
        const y = Math.floor(Math.random() * N);
        const x = Math.floor(Math.random() * N);

        if (y + dy * (s.length - 1) >= N || x + dx * (s.length - 1) >= N) continue;

        const cells = Array.from({ length: s.length }, (_, i) => (y + dy * i) * N + (x + dx * i));

        const canPlace = cells.every((pos, i) => !g[pos] || g[pos] === s[i]);
        if (canPlace) {
          cells.forEach((pos, i) => {
            g[pos] = s[i];
          });
          placed.push(w);
          break;
        }
      }
    });

    // Fill remaining cells
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const finalGrid = g.map(cell => (cell ? cell : letters[Math.floor(Math.random() * letters.length)]));

    setGrid(finalGrid);
    setPlacedWords(placed);
    setFoundWords(new Set());
    setHighlightedCells(new Set());
    setSelectedStart(null);
  }, [targetWords]);

  const handleCellClick = (idx: number) => {
    if (selectedStart === null) {
      setSelectedStart(idx);
      sounds.playPop();
      return;
    }

    const start = selectedStart;
    setSelectedStart(null);

    const N = GRID_SIZE;
    const y1 = Math.floor(start / N);
    const x1 = start % N;
    const y2 = Math.floor(idx / N);
    const x2 = idx % N;

    const dy = y2 - y1;
    const dx = x2 - x1;
    const steps = Math.max(Math.abs(dy), Math.abs(dx));

    if (steps === 0) return;
    if (dy !== 0 && dx !== 0 && Math.abs(dy) !== Math.abs(dx)) {
      sounds.playWrong();
      return;
    }

    const stepY = Math.sign(dy);
    const stepX = Math.sign(dx);

    const lineCells = Array.from(
      { length: steps + 1 },
      (_, k) => (y1 + stepY * k) * N + (x1 + stepX * k)
    );

    const text = lineCells.map(pos => grid[pos]).join('');
    const reversed = [...text].reverse().join('');

    const matchedWord = placedWords.find(
      w => !foundWords.has(w.clean) && (w.clean === text || w.clean === reversed)
    );

    if (matchedWord) {
      sounds.playCorrect();
      const nextFound = new Set(foundWords);
      nextFound.add(matchedWord.clean);
      setFoundWords(nextFound);

      // Add to permanently highlighted cells
      setHighlightedCells(prev => {
        const next = new Set(prev);
        lineCells.forEach(c => next.add(c));
        return next;
      });

      speech.speak(matchedWord.clean, matchedWord.lg);

      onUpdateProgress(nextFound.size, placedWords.length);

      if (nextFound.size === placedWords.length) {
        sounds.playWin();
        setTimeout(() => {
          onFinish(placedWords.length, placedWords.length, placedWords.map(w => w.original));
        }, 800);
      }
    } else {
      sounds.playWrong();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" /> So'z qidiruvi
        </h2>
        <p className="text-xs text-slate-500">
          So'zning birinchi va oxirgi harfini ketma-ket bosing!
        </p>
      </div>

      {/* Target Word Chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {placedWords.map(w => {
          const isFound = foundWords.has(w.clean);
          return (
            <span
              key={w.clean}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isFound
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-600 line-through'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isFound && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{w.clean}</span>
            </span>
          );
        })}
      </div>

      {/* 9x9 Grid (Responsive: fits 360px+ phones without scroll) */}
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5 p-2 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl max-w-full">
        {grid.map((letter, idx) => {
          const isSelected = selectedStart === idx;
          const isHighlighted = highlightedCells.has(idx);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              className={`aspect-square rounded-lg sm:rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-md'
                  : isHighlighted
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
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
