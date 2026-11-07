import React, { useState, useEffect } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Check, Volume2, HelpCircle } from 'lucide-react';

interface CrosswordGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface CrosswordEntry {
  id: number;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
  solved: boolean;
  userLetters: string[];
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  // Take 4 to 6 words suitable for crossword
  const [entries, setEntries] = useState<CrosswordEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(10);
  const [score, setScore] = useState<number>(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  useEffect(() => {
    // Select 4-6 clean words
    const cleanWords = words
      .filter(w => w.w.trim().length >= 3 && w.w.trim().length <= 8 && /^[a-zA-Z]+$/.test(w.w.trim()))
      .slice(0, 5);

    const targetWords = cleanWords.length >= 3 ? cleanWords : words.slice(0, 4);

    // Layout words in a crossword pattern
    // Word 1: Across at row 2, col 1
    // Word 2: Down intersecting or row 4
    const newEntries: CrosswordEntry[] = [];
    const size = 10;
    setGridSize(size);

    targetWords.forEach((item, idx) => {
      const clean = item.w.trim().toUpperCase();
      const dir: 'across' | 'down' = idx % 2 === 0 ? 'across' : 'down';

      let row = 1;
      let col = 1;

      if (idx === 0) {
        row = 2;
        col = 1;
      } else if (idx === 1) {
        row = 1;
        col = 3;
      } else if (idx === 2) {
        row = 5;
        col = 2;
      } else if (idx === 3) {
        row = 3;
        col = 6;
      } else {
        row = 8;
        col = 1;
      }

      newEntries.push({
        id: idx,
        word: clean,
        clue: item.tr || clean,
        row,
        col,
        direction: dir,
        number: idx + 1,
        solved: false,
        userLetters: new Array(clean.length).fill(''),
      });
    });

    setEntries(newEntries);
    setActiveEntryId(0);
    onUpdateProgress(0, newEntries.length);
  }, [words]);

  const activeEntry = entries.find(e => e.id === activeEntryId) || entries[0];

  const handleLetterChange = (letterIdx: number, val: string) => {
    if (!activeEntry || activeEntry.solved) return;

    const char = val.slice(-1).toUpperCase();
    const updatedUserLetters = [...activeEntry.userLetters];
    updatedUserLetters[letterIdx] = char;

    const updatedEntries = entries.map(e =>
      e.id === activeEntry.id ? { ...e, userLetters: updatedUserLetters } : e
    );
    setEntries(updatedEntries);

    // Check if current word is solved
    const formed = updatedUserLetters.join('');
    if (formed === activeEntry.word) {
      sounds.playCorrect();
      speech.speak(activeEntry.word);

      const solvedEntries = updatedEntries.map(e =>
        e.id === activeEntry.id ? { ...e, solved: true } : e
      );
      setEntries(solvedEntries);

      const newScore = score + 1;
      const newLearned = [...learnedWords, activeEntry.word];
      setScore(newScore);
      setLearnedWords(newLearned);

      const solvedCount = solvedEntries.filter(e => e.solved).length;
      onUpdateProgress(solvedCount, entries.length);

      if (solvedCount >= entries.length) {
        sounds.playWin();
        setTimeout(() => {
          onFinish(newScore, entries.length, newLearned);
        }, 1200);
      } else {
        // Switch to next unsolved entry
        const nextUnsolved = solvedEntries.find(e => !e.solved);
        if (nextUnsolved) {
          setActiveEntryId(nextUnsolved.id);
        }
      }
    }
  };

  // Build grid matrix for rendering
  const gridCells: Record<string, { letter: string; num?: number; isActive: boolean; isSolved: boolean; entryId: number; charIdx: number }> = {};

  entries.forEach(entry => {
    for (let i = 0; i < entry.word.length; i++) {
      const r = entry.direction === 'across' ? entry.row : entry.row + i;
      const c = entry.direction === 'across' ? entry.col + i : entry.col;
      const key = `${r}-${c}`;

      const isCurrentActive = activeEntry?.id === entry.id;
      const cellUserChar = entry.userLetters[i] || '';

      gridCells[key] = {
        letter: entry.solved ? entry.word[i] : cellUserChar,
        num: i === 0 ? entry.number : gridCells[key]?.num,
        isActive: isCurrentActive,
        isSolved: entry.solved,
        entryId: entry.id,
        charIdx: i,
      };
    }
  });

  if (entries.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none">
      {/* Current Clue Banner */}
      {activeEntry && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-600 text-white">
                #{activeEntry.number} {activeEntry.direction === 'across' ? '➡️ Eniga' : '⬇️ Bo\'yiga'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({activeEntry.word.length} ta harf)
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {activeEntry.clue}
            </div>
          </div>

          <button
            onClick={() => speech.speak(activeEntry.word)}
            className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:scale-105 transition-transform"
            title="Eshitish"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Crossword Interactive Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex justify-center overflow-x-auto">
        <div
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '460px',
          }}
        >
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => {
              const key = `${r}-${c}`;
              const cell = gridCells[key];

              if (!cell) {
                return (
                  <div
                    key={key}
                    className="aspect-square bg-slate-100/60 dark:bg-slate-800/20 rounded-lg sm:rounded-xl"
                  />
                );
              }

              return (
                <div
                  key={key}
                  onClick={() => setActiveEntryId(cell.entryId)}
                  className={`relative aspect-square rounded-lg sm:rounded-xl font-black text-sm sm:text-lg flex items-center justify-center cursor-pointer transition-all border-2 ${
                    cell.isSolved
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : cell.isActive
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-500 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-400/40'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {cell.num && (
                    <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold text-slate-400">
                      {cell.num}
                    </span>
                  )}
                  <span>{cell.letter}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Word Typing Input Boxes */}
      {activeEntry && !activeEntry.solved && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Harflarni kiriting:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 max-w-full">
            {Array.from({ length: activeEntry.word.length }).map((_, idx) => (
              <input
                key={idx}
                id={`cross-input-${idx}`}
                type="text"
                maxLength={1}
                value={activeEntry.userLetters[idx] || ''}
                onChange={e => {
                  handleLetterChange(idx, e.target.value);
                  if (e.target.value && idx < activeEntry.word.length - 1) {
                    const nextInput = document.getElementById(`cross-input-${idx + 1}`);
                    nextInput?.focus();
                  }
                }}
                className="w-8 h-10 sm:w-12 sm:h-14 text-center font-black text-base sm:text-xl uppercase rounded-lg sm:rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Clues List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>Barcha savollar / tarjimalar:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {entries.map(e => (
            <button
              key={e.id}
              onClick={() => setActiveEntryId(e.id)}
              className={`p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                e.id === activeEntry?.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="truncate pr-2">
                <span className="font-black text-indigo-600 mr-1.5">#{e.number}</span>
                <span>{e.clue}</span>
              </div>
              {e.solved && (
                <span className="shrink-0 p-1 rounded-full bg-emerald-500 text-white">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
