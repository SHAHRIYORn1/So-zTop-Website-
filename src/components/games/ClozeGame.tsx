import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Volume2, Sparkles, RotateCcw } from 'lucide-react';

interface ClozeGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface LetterSlot {
  index: number;
  originalChar: string;
  isHole: boolean;
  filledChar: string | null;
}

interface LetterPlug {
  id: string;
  char: string;
  isUsed: boolean;
}

export const ClozeGame: React.FC<ClozeGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => shuffleArray([...words]));
  const total = shuffled.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const [slots, setSlots] = useState<LetterSlot[]>([]);
  const [plugs, setPlugs] = useState<LetterPlug[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'failed'>('idle');
  const [mistakes, setMistakes] = useState(0);

  const currentWord = shuffled[currentIndex];

  useEffect(() => {
    if (!currentWord) return;

    const rawWord = currentWord.w.trim().toUpperCase();
    const chars = rawWord.split('');
    const len = chars.length;

    // Determine hole positions (1 to 3 holes depending on word length)
    const holeCount = len <= 4 ? 1 : len <= 7 ? 2 : 3;
    const holeIndices = new Set<number>();

    // Pick nicely spaced indices for holes
    const eligibleIndices = chars.map((_, i) => i).filter(i => chars[i] !== ' ');
    const shuffledIndices = shuffleArray([...eligibleIndices]);

    for (let i = 0; i < Math.min(holeCount, shuffledIndices.length); i++) {
      holeIndices.add(shuffledIndices[i]);
    }

    const newSlots: LetterSlot[] = chars.map((char, idx) => ({
      index: idx,
      originalChar: char,
      isHole: holeIndices.has(idx),
      filledChar: holeIndices.has(idx) ? null : char,
    }));

    // Missing correct letters
    const missingLetters = Array.from(holeIndices).map(idx => chars[idx]);

    // Distractor alphabet letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractorCount = Math.max(2, 6 - missingLetters.length);
    const distractors: string[] = [];

    while (distractors.length < distractorCount) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!missingLetters.includes(randChar) && !distractors.includes(randChar)) {
        distractors.push(randChar);
      }
    }

    const allPlugs: LetterPlug[] = shuffleArray([...missingLetters, ...distractors])
      .map((char, i) => ({
        id: `${char}-${i}-${Date.now()}`,
        char,
        isUsed: false,
      }));

    setSlots(newSlots);
    setPlugs(allPlugs);
    setStatus('idle');
    setMistakes(0);
  }, [currentIndex, currentWord]);

  // Click on a plug to fill the first empty hole
  const handlePlugClick = (plug: LetterPlug) => {
    if (status !== 'idle' || plug.isUsed) return;

    // Find first empty hole
    const emptyHoleIdx = slots.findIndex(s => s.isHole && s.filledChar === null);
    if (emptyHoleIdx === -1) return;

    sounds.playPop();

    // Fill hole
    const newSlots = [...slots];
    newSlots[emptyHoleIdx] = {
      ...newSlots[emptyHoleIdx],
      filledChar: plug.char,
    };
    setSlots(newSlots);

    // Mark plug as used
    setPlugs(prev => prev.map(p => (p.id === plug.id ? { ...p, isUsed: true } : p)));

    // Check if all holes are filled
    const allFilled = newSlots.every(s => !s.isHole || s.filledChar !== null);
    if (allFilled) {
      checkWordSolution(newSlots);
    }
  };

  // Click on a filled hole to remove the letter back to plugs
  const handleHoleClick = (slotIndex: number) => {
    if (status !== 'idle') return;
    const slot = slots[slotIndex];
    if (!slot || !slot.isHole || !slot.filledChar) return;

    const removedChar = slot.filledChar;
    sounds.playPop();

    // Clear hole
    const newSlots = [...slots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      filledChar: null,
    };
    setSlots(newSlots);

    // Unuse one matching plug
    setPlugs(prev => {
      let freed = false;
      return prev.map(p => {
        if (!freed && p.char === removedChar && p.isUsed) {
          freed = true;
          return { ...p, isUsed: false };
        }
        return p;
      });
    });
  };

  // Reset current word holes
  const handleResetHoles = () => {
    if (status !== 'idle') return;
    setSlots(prev => prev.map(s => (s.isHole ? { ...s, filledChar: null } : s)));
    setPlugs(prev => prev.map(p => ({ ...p, isUsed: false })));
  };

  const checkWordSolution = (currentSlots: LetterSlot[]) => {
    if (!currentWord) return;

    const formedWord = currentSlots.map(s => s.filledChar || '').join('');
    const target = currentWord.w.trim().toUpperCase();

    if (formedWord === target) {
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
        // 2nd mistake -> Show correct answer and move to next word!
        setStatus('failed');
        // Fill all slots with correct letters to show the user
        setSlots(prev => prev.map(s => ({ ...s, filledChar: s.originalChar })));
        speech.speak(currentWord.w, currentWord.lg || 'en');

        setTimeout(() => {
          advanceWord(false);
        }, 1600);
      } else {
        // 1st mistake -> Give 1 more chance
        setStatus('wrong');
        setTimeout(() => {
          handleResetHoles();
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
      {/* Target Clue Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Teshik to'ldir — Tushib qolgan teshiklarni to'ldiring!
          </p>
          <button
            onClick={() => speech.speak(currentWord.w, currentWord.lg || 'en')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Eshitish"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
          "{currentWord.tr}"
        </div>
      </div>

      {/* Interactive Word with Holes (Teshikli So'z) */}
      <div className="bg-slate-100/90 dark:bg-slate-900/60 border-2 border-dashed border-indigo-300 dark:border-indigo-950 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>So'z tuzilishi:</span>
          <button
            onClick={handleResetHoles}
            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qaytadan</span>
          </button>
        </div>

        {/* Word slots with cut-out holes (Adaptive sizing for phones) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 py-2">
          {slots.map(slot => {
            if (!slot.isHole) {
              // Fixed visible letter
              return (
                <div
                  key={slot.index}
                  className="w-9 h-12 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-black text-lg sm:text-3xl text-slate-800 dark:text-slate-100 flex items-center justify-center shadow-xs shrink-0"
                >
                  {slot.originalChar}
                </div>
              );
            }

            // Hole Slot
            const isFilled = slot.filledChar !== null;

            return (
              <div
                key={slot.index}
                onClick={() => handleHoleClick(slot.index)}
                className={`relative w-9 h-12 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl font-black text-lg sm:text-3xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  status === 'correct'
                    ? 'bg-emerald-500 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : status === 'wrong'
                    ? 'bg-rose-500 text-white border-2 border-rose-400 animate-shake'
                    : isFilled
                    ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95'
                    : 'bg-amber-100/60 dark:bg-amber-950/40 border-2 border-dashed border-amber-400 dark:border-amber-500 text-amber-500 animate-pulse hover:border-amber-600'
                }`}
                title={isFilled ? "Harfni qaytarib olish uchun bosing" : "Bo'sh teshik"}
              >
                {isFilled ? (
                  slot.filledChar
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-amber-500/80">🕳️</span>
                )}
              </div>
            );
          })}
        </div>

        {status === 'correct' && (
          <p className="text-emerald-600 font-black text-sm animate-in zoom-in">
            🎉 A'lo! Barcha teshiklar to'g'ri to'ldirildi!
          </p>
        )}
        {status === 'wrong' && (
          <p className="text-rose-500 font-bold text-xs animate-in zoom-in">
            1-xato! Yana 1 ta imkoniyatingiz bor, qayta urinib ko'ring!
          </p>
        )}
        {status === 'failed' && (
          <p className="text-rose-500 font-bold text-xs animate-in zoom-in">
            2 marta xato qilindi! To'g'ri javob: <span className="font-black underline">{currentWord.w}</span>
          </p>
        )}
      </div>

      {/* Letter Plugs Bank (Teshik tiqinlari / variantlar) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Teshikka mos harfni bosing:
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {plugs.map(plug => (
            <button
              key={plug.id}
              type="button"
              disabled={plug.isUsed || status !== 'idle'}
              onClick={() => handlePlugClick(plug)}
              className={`w-9 h-12 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl transition-all shrink-0 ${
                plug.isUsed
                  ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-700 cursor-not-allowed border border-transparent'
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30'
              }`}
            >
              {plug.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
