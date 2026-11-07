import React, { useState, useEffect, useRef } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Clock } from 'lucide-react';

interface BubbleGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface BubbleItem {
  id: number;
  text: string;
  isCorrect: boolean;
  xPercent: number; // 8% to 80%
  speed: number;
  y: number; // 100% to -15%
  popped: boolean;
  color: string;
}

const BUBBLE_COLORS = [
  'from-sky-400 to-blue-500 shadow-blue-500/30',
  'from-purple-400 to-indigo-500 shadow-indigo-500/30',
  'from-emerald-400 to-teal-500 shadow-teal-500/30',
  'from-amber-400 to-orange-500 shadow-orange-500/30',
  'from-rose-400 to-pink-500 shadow-pink-500/30',
];

export const BubbleGame: React.FC<BubbleGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => [...words].sort(() => Math.random() - 0.5));
  const total = shuffled.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<'timeout' | 'correct' | null>(null);
  const [timeLeft, setTimeLeft] = useState(14);

  const currentWord = shuffled[currentIndex];
  const animRef = useRef<number>(0);

  // Initialize bubbles and timer for current word
  useEffect(() => {
    if (!currentWord) return;

    const correctText = currentWord.tr || '';
    const otherWords = words.filter(w => w.tr && w.tr !== correctText);
    const distractorPool = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 4);

    const rawOptions = [
      { text: correctText, isCorrect: true },
      ...distractorPool.map(w => ({ text: w.tr || '', isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    const newBubbles: BubbleItem[] = rawOptions.map((opt, i) => ({
      id: i,
      text: opt.text,
      isCorrect: opt.isCorrect,
      xPercent: 10 + (i * 18) + (Math.random() * 6 - 3),
      speed: 0.28 + Math.random() * 0.14,
      y: 95 + i * 10, // start near bottom
      popped: false,
      color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    }));

    setBubbles(newBubbles);
    setIsAnswered(false);
    setStatusFeedback(null);
    setTimeLeft(14);
  }, [currentIndex, currentWord, words]);

  // Floating animation loop: respawns un-popped bubbles from bottom if they float off screen
  useEffect(() => {
    if (isAnswered || !currentWord) return;

    const animate = () => {
      setBubbles(prev =>
        prev.map(b => {
          if (b.popped) return b;
          let nextY = b.y - b.speed;
          // If float off the top screen, recycle from bottom so game doesn't get stuck!
          if (nextY < -15) {
            nextY = 105;
          }
          return {
            ...b,
            y: nextY,
          };
        })
      );
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isAnswered, currentWord]);

  // Round countdown timer
  useEffect(() => {
    if (isAnswered || !currentWord) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, currentWord]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setStatusFeedback('timeout');
    sounds.playWrong();

    setTimeout(() => {
      advanceWord(false);
    }, 1500);
  };

  const handlePopBubble = (bubble: BubbleItem) => {
    if (isAnswered || bubble.popped || !currentWord) return;

    sounds.playPop();

    // Mark as popped
    setBubbles(prev =>
      prev.map(b => (b.id === bubble.id ? { ...b, popped: true } : b))
    );

    if (bubble.isCorrect) {
      setIsAnswered(true);
      setStatusFeedback('correct');
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
      speech.speak(currentWord.w, currentWord.lg || 'en');

      setTimeout(() => advanceWord(true), 800);
    } else {
      sounds.playWrong();
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

  if (!currentWord || currentIndex >= total) return null;

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Header Prompt */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg text-center space-y-2 relative">
        {/* Timer badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{timeLeft}s</span>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          To'g'ri tarjima pufakchasini yorib yuboring! 🫧
        </p>
        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
          {currentWord.w}
        </div>

        {/* Feedback messages */}
        {statusFeedback === 'timeout' && (
          <div className="text-rose-600 font-extrabold text-sm animate-in zoom-in">
            ⏰ Vaqt tugadi! To'g'ri javob: <span className="underline">{currentWord.tr}</span>
          </div>
        )}
        {statusFeedback === 'correct' && (
          <div className="text-emerald-600 font-extrabold text-sm animate-in zoom-in">
            🎉 Barakalla! To'g'ri topildi!
          </div>
        )}
      </div>

      {/* Bubble Arena */}
      <div className="relative w-full h-96 bg-gradient-to-b from-sky-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 rounded-3xl border-2 border-dashed border-sky-300 dark:border-slate-800 overflow-hidden shadow-inner select-none">
        {bubbles.map(b => {
          if (b.popped) {
            return (
              <div
                key={b.id}
                className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 scale-150 opacity-0"
                style={{ left: `${b.xPercent}%`, top: `${b.y}%` }}
              >
                <span className="text-2xl">✨</span>
              </div>
            );
          }

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handlePopBubble(b)}
              style={{
                left: `${b.xPercent}%`,
                top: `${b.y}%`,
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-full bg-gradient-to-br ${b.color} text-white font-extrabold text-sm shadow-xl hover:scale-110 active:scale-95 transition-transform duration-75 cursor-pointer border-2 border-white/40 backdrop-blur-sm animate-pulse`}
            >
              {b.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};
