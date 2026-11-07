import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { BrainCircuit } from 'lucide-react';

interface SimonGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

const MAX_ROUNDS = 6;

export const SimonGame: React.FC<SimonGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  // Pool of up to 6 words
  const pool = React.useMemo(() => {
    return shuffleArray([...words]).slice(0, 6);
  }, [words]);

  const [sequence, setSequence] = useState<WordItem[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeFlashWord, setActiveFlashWord] = useState<string | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Ketma-ketlikni eslab qoling…');

  // Start new round
  const startNextRound = (currentSeq: WordItem[]) => {
    const nextItem = pool[Math.floor(Math.random() * pool.length)];
    const newSeq = [...currentSeq, nextItem];
    setSequence(newSeq);
    setUserStep(0);
    setIsShowingSequence(true);
    setStatusMessage('Ketma-ketlikni eslab qoling…');

    // Play flashes
    newSeq.forEach((item, index) => {
      setTimeout(() => {
        setActiveFlashWord(item.w);
        sounds.playPop();
      }, (index + 1) * 800);

      setTimeout(() => {
        setActiveFlashWord(null);
      }, (index + 1) * 800 + 500);
    });

    // End sequence playback
    setTimeout(() => {
      setIsShowingSequence(false);
      setStatusMessage(`Xuddi shu tartibda bosing (${newSeq.length} ta)`);
    }, (newSeq.length + 1) * 800);
  };

  useEffect(() => {
    if (pool.length > 0) {
      startNextRound([]);
    }
  }, [pool]);

  const handleWordClick = (word: WordItem) => {
    if (isShowingSequence || sequence.length === 0) return;

    sounds.playPop();
    const expected = sequence[userStep];

    if (word.w === expected.w) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        sounds.playCorrect();
        onUpdateProgress(sequence.length, MAX_ROUNDS);

        if (sequence.length >= MAX_ROUNDS) {
          sounds.playWin();
          setTimeout(() => {
            onFinish(MAX_ROUNDS, MAX_ROUNDS, pool.map(w => w.w));
          }, 600);
        } else {
          setTimeout(() => {
            startNextRound(sequence);
          }, 800);
        }
      }
    } else {
      sounds.playWrong();
      setStatusMessage('Xato bosildi!');
      setTimeout(() => {
        onFinish(sequence.length - 1, MAX_ROUNDS, pool.map(w => w.w));
      }, 700);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Status banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-center gap-1.5">
          <BrainCircuit className="w-4 h-4" /> {statusMessage}
        </span>

        {/* Large flash display */}
        <div className="h-20 flex items-center justify-center">
          {activeFlashWord ? (
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 animate-in zoom-in-75">
              {activeFlashWord}
            </div>
          ) : (
            <div className="text-slate-300 dark:text-slate-700 text-sm font-semibold">
              {isShowingSequence ? 'Diqqat qiling…' : `Navbat: ${userStep + 1} / ${sequence.length}`}
            </div>
          )}
        </div>
      </div>

      {/* Word buttons pool */}
      <div className="grid grid-cols-2 gap-3">
        {pool.map((w, idx) => {
          const isFlashed = activeFlashWord === w.w;
          return (
            <button
              key={idx}
              type="button"
              disabled={isShowingSequence}
              onClick={() => handleWordClick(w)}
              className={`py-4 px-3 rounded-2xl font-bold text-sm border-2 transition-all cursor-pointer text-center ${
                isFlashed
                  ? 'border-indigo-500 bg-indigo-500 text-white scale-105 shadow-xl shadow-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
              }`}
            >
              {w.w}
            </button>
          );
        })}
      </div>
    </div>
  );
};
