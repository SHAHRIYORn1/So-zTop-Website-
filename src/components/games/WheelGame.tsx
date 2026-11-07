import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Volume2, RotateCw, ArrowRight } from 'lucide-react';

interface WheelGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

const WHEEL_COLORS = [
  { bg: '#3b82f6', text: '#ffffff' }, // blue
  { bg: '#06b6d4', text: '#ffffff' }, // cyan
  { bg: '#f59e0b', text: '#000000' }, // amber
  { bg: '#8b5cf6', text: '#ffffff' }, // purple
  { bg: '#10b981', text: '#ffffff' }, // emerald
  { bg: '#ef4444', text: '#ffffff' }, // red
];

export const WheelGame: React.FC<WheelGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [remainingWords, setRemainingWords] = useState<WordItem[]>(() => [...words]);
  const [totalCount] = useState<number>(words.length);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  // Rotation physics
  const thetaRef = useRef(0);
  const omegaRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Draw wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const n = remainingWords.length;
    if (n === 0) return;

    const arc = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, size, size);

    // Save context for rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(thetaRef.current);

    // Draw slices
    remainingWords.forEach((word, i) => {
      const angle = i * arc;
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = color.bg;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw word text
      ctx.save();
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = color.text;
      ctx.font = `bold ${Math.max(12, Math.min(18, 280 / n))}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(word.w, radius - 20, 5);
      ctx.restore();
    });

    // Draw center hub
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#4f46e5';
    ctx.fill();

    ctx.restore();
  }, [remainingWords]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const handleSettle = () => {
    setIsSpinning(false);
    const n = remainingWords.length;
    if (n === 0) return;

    // Pointer is at top (-PI/2)
    const normalizedTheta = ((-thetaRef.current - Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const sliceAngle = (2 * Math.PI) / n;
    const index = Math.floor(normalizedTheta / sliceAngle) % n;
    const chosen = remainingWords[index];

    setSelectedWord(chosen);
    setAnsweredOption(null);
    setIsCorrect(null);

    // Prepare 4 multiple-choice options for the translation (no free stars!)
    const correctTr = chosen.tr || '';
    const otherTrs = words
      .filter(w => w.tr && w.tr !== correctTr)
      .map(w => w.tr as string);
    const distractors = [...new Set(otherTrs)].sort(() => Math.random() - 0.5).slice(0, 3);
    const allOpts = [correctTr, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(allOpts);

    sounds.playPop();

    // Speak word
    if (chosen) {
      speech.speak(chosen.w, chosen.lg || 'en');
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (answeredOption || !selectedWord) return;
    setAnsweredOption(option);

    const correct = option === selectedWord.tr;
    setIsCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      setScore(s => s + 1);
      setLearnedWords(prev => [...prev, selectedWord.w]);
    } else {
      sounds.playWrong();
    }
  };

  const spin = () => {
    if (isSpinning || remainingWords.length === 0) return;
    setIsSpinning(true);
    setSelectedWord(null);
    sounds.playPop();

    // Random initial speed between 0.25 and 0.45 rad/frame
    omegaRef.current = 0.25 + Math.random() * 0.2;
    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const dt = Math.min(32, time - lastTimeRef.current);
      lastTimeRef.current = time;

      thetaRef.current += omegaRef.current * (dt / 16);
      omegaRef.current *= Math.pow(0.985, dt / 16);

      drawWheel();

      if (omegaRef.current < 0.002) {
        handleSettle();
      } else {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleNextWord = () => {
    if (!selectedWord) return;

    // Remove solved word from remaining
    const nextWords = remainingWords.filter(w => w.w !== selectedWord.w);
    setRemainingWords(nextWords);
    setSelectedWord(null);
    setAnsweredOption(null);
    setIsCorrect(null);

    const completed = totalCount - nextWords.length;
    onUpdateProgress(completed, totalCount);

    if (nextWords.length === 0) {
      onFinish(score, totalCount, learnedWords);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
      {/* Game Instruction */}
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Charxni aylantiring va tasodifiy so'zni o'rganing!
      </p>

      {/* Wheel Container with Pointer Pin */}
      <div className="relative flex items-center justify-center p-2 sm:p-4 max-w-full">
        {/* Pointer Pin at top */}
        <div className="absolute top-1 z-20 w-0 h-0 border-x-[12px] sm:border-x-[14px] border-x-transparent border-t-[24px] sm:border-t-[28px] border-t-rose-500 drop-shadow-md" />

        {/* Wheel Canvas (Responsive: scales down to 280px on phone, 340px on tablet/desktop) */}
        <div className="rounded-full shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] max-w-full">
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="w-full h-full cursor-pointer transition-transform"
            onClick={spin}
          />
        </div>
      </div>

      {/* Spin Button */}
      {!selectedWord && (
        <button
          type="button"
          onClick={spin}
          disabled={isSpinning || remainingWords.length === 0}
          className={`py-3.5 px-8 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-lg transition-all ${
            isSpinning || remainingWords.length === 0
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer'
          }`}
        >
          <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? "Aylanmoqda…" : "Charxni aylantirish 🎡"}</span>
        </button>
      )}

      {/* Selected Word Question Card */}
      {selectedWord && (
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {selectedWord.w}
            </span>
            <button
              onClick={() => speech.speak(selectedWord.w, selectedWord.lg || 'en')}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:scale-110 transition-transform cursor-pointer"
              title="Talaffuz"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            To'g'ri tarjimasini tanlang:
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt, i) => {
              const isSelected = answeredOption === opt;
              const isRealCorrect = opt === selectedWord.tr;

              let btnClass = 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100';

              if (answeredOption) {
                if (isRealCorrect) {
                  btnClass = 'bg-emerald-500 text-white border-emerald-600 font-black shadow-md';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500 text-white border-rose-600 font-bold';
                } else {
                  btnClass = 'opacity-50 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={answeredOption !== null}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`p-3.5 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback & Continue */}
          {answeredOption && (
            <div className="pt-2 animate-in fade-in duration-150">
              {isCorrect ? (
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-3">
                  🎉 To'g'ri topdingiz! (+1 ball)
                </p>
              ) : (
                <p className="text-xs font-bold text-rose-500 mb-3">
                  Noto'g'ri. To'g'ri javob: <span className="font-black underline">{selectedWord.tr}</span>
                </p>
              )}

              <button
                type="button"
                onClick={handleNextWord}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
              >
                <span>Keyingi so'z</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
