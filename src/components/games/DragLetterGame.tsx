import React, { useState, useEffect } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Volume2, RotateCcw } from 'lucide-react';

interface DragLetterGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface LetterTile {
  id: number;
  letter: string;
  originalIndex: number;
}

export const DragLetterGame: React.FC<DragLetterGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffledWords] = useState<WordItem[]>(() => [...words].sort(() => Math.random() - 0.5));
  const total = shuffledWords.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  // Slots at target word
  const [slots, setSlots] = useState<(LetterTile | null)[]>([]);
  // Remaining letters in pool
  const [pool, setPool] = useState<LetterTile[]>([]);
  const [draggedTile, setDraggedTile] = useState<LetterTile | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'failed'>('idle');
  const [mistakes, setMistakes] = useState(0);

  const currentWord = shuffledWords[currentIndex];

  useEffect(() => {
    if (!currentWord) return;

    const cleanWord = currentWord.w.trim().toUpperCase();
    const letters = cleanWord.split('').map((char, idx) => ({
      id: idx,
      letter: char,
      originalIndex: idx,
    }));

    setSlots(new Array(letters.length).fill(null));
    // Shuffle pool
    setPool([...letters].sort(() => Math.random() - 0.5));
    setStatus('idle');
    setMistakes(0);
  }, [currentIndex, currentWord]);

  // Touch or click letter from pool into first open slot
  const handleTapPool = (tile: LetterTile) => {
    if (status !== 'idle') return;

    const firstEmptyIndex = slots.findIndex(s => s === null);
    if (firstEmptyIndex === -1) return;

    sounds.playPop();
    const newSlots = [...slots];
    newSlots[firstEmptyIndex] = tile;
    setSlots(newSlots);
    setPool(prev => prev.filter(p => p.id !== tile.id));

    checkComplete(newSlots);
  };

  // Remove letter from slot back to pool
  const handleTapSlot = (index: number) => {
    if (status !== 'idle') return;
    const tile = slots[index];
    if (!tile) return;

    sounds.playPop();
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    setPool(prev => [...prev, tile]);
  };

  // Reset current word
  const handleReset = () => {
    if (status !== 'idle' || !currentWord) return;
    const cleanWord = currentWord.w.trim().toUpperCase();
    const letters = cleanWord.split('').map((char, idx) => ({
      id: idx,
      letter: char,
      originalIndex: idx,
    }));
    setSlots(new Array(letters.length).fill(null));
    setPool([...letters].sort(() => Math.random() - 0.5));
  };

  // Drag and Drop handlers
  const handleDragStart = (tile: LetterTile) => {
    setDraggedTile(tile);
  };

  const handleDropOnSlot = (targetIndex: number) => {
    if (!draggedTile || status !== 'idle') return;

    // If slot has a tile, send old tile back to pool
    const existing = slots[targetIndex];
    const newSlots = [...slots];
    newSlots[targetIndex] = draggedTile;
    setSlots(newSlots);

    setPool(prev => {
      const filtered = prev.filter(p => p.id !== draggedTile.id);
      return existing ? [...filtered, existing] : filtered;
    });

    setDraggedTile(null);
    checkComplete(newSlots);
  };

  const checkComplete = (currentSlots: (LetterTile | null)[]) => {
    if (!currentWord) return;
    const isFull = currentSlots.every(s => s !== null);
    if (!isFull) return;

    const formedWord = currentSlots.map(s => s?.letter).join('');
    const targetWord = currentWord.w.trim().toUpperCase();

    if (formedWord === targetWord) {
      sounds.playCorrect();
      speech.speak(currentWord.w, currentWord.lg || 'en');
      setStatus('correct');
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);

      setTimeout(() => advanceWord(true), 1100);
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
          setStatus('idle');
        }, 1000);
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
      {/* Target prompt */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Harflarni sudrab joy-joyiga qo'ying ✋
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

      {/* Target Slots */}
      <div className="bg-slate-100/80 dark:bg-slate-900/50 border-2 border-dashed border-indigo-200 dark:border-indigo-950/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 min-h-[55px] sm:min-h-[70px]">
          {slots.map((tile, idx) => (
            <div
              key={idx}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDropOnSlot(idx)}
              onClick={() => handleTapSlot(idx)}
              className={`w-9 h-12 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-2xl transition-all cursor-pointer ${
                tile
                  ? status === 'correct'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-400'
                    : status === 'wrong'
                    ? 'bg-rose-500 text-white shadow-lg border-2 border-rose-400 animate-shake'
                    : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-md border-2 border-indigo-500/30'
                  : 'bg-white/50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {tile?.letter || ''}
            </div>
          ))}
        </div>

        {status === 'correct' && (
          <p className="text-emerald-600 font-black text-sm mt-3 animate-in zoom-in-95">
            🎉 A'lo darajada! To'g'ri terildi!
          </p>
        )}
        {status === 'wrong' && (
          <p className="text-rose-500 font-bold text-xs mt-3 animate-in zoom-in-95">
            1-xato! Yana 1 ta imkoniyatingiz bor, harfni bosib qaytarib oling va qayta urinib ko'ring!
          </p>
        )}
        {status === 'failed' && (
          <p className="text-rose-500 font-bold text-xs mt-3 animate-in zoom-in-95">
            2 marta xato qilindi! To'g'ri javob: <span className="font-black underline">{currentWord.w}</span>
          </p>
        )}
      </div>

      {/* Letters Pool */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Harflar (sudrang yoki bosing):
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta yig'ish</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 min-h-[50px] sm:min-h-[60px]">
          {pool.map(tile => (
            <div
              key={tile.id}
              draggable
              onDragStart={() => handleDragStart(tile)}
              onClick={() => handleTapPool(tile)}
              className="w-9 h-12 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black text-base sm:text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              {tile.letter}
            </div>
          ))}
          {pool.length === 0 && (
            <span className="text-xs text-slate-400 italic">Barcha harflar joylashtirildi</span>
          )}
        </div>
      </div>
    </div>
  );
};
