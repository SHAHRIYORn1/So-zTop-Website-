import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { speech } from '../../services/speech';
import { Bot, User } from 'lucide-react';

interface RaceGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

export const RaceGame: React.FC<RaceGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [shuffled] = useState<WordItem[]>(() => shuffleArray([...words]));
  const total = shuffled.length;

  const [playerIndex, setPlayerIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  // Bot states
  const [botScore, setBotScore] = useState(0);
  const [botIsTyping, setBotIsTyping] = useState(false);

  // Current question options (4 options for rapid racing!)
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentWord = shuffled[playerIndex];

  // Prepare multiple choice options for quick reflex
  useEffect(() => {
    if (!currentWord) return;
    const correct = currentWord.tr || '';
    const otherWords = words.filter(w => w.tr && w.tr !== correct);
    const shuffledOthers = shuffleArray([...otherWords]).slice(0, 3);
    const opts = shuffleArray([correct, ...shuffledOthers.map(w => w.tr || '')]);
    setOptions(opts);
    setSelectedOption(null);
  }, [playerIndex, currentWord, words]);

  // Bot simulation loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const runBotCycle = () => {
      if (cancelled || botScore >= total || playerIndex >= total) return;

      setBotIsTyping(true);

      // Bot typing delay based on lead/lag
      const lead = playerScore - botScore;
      // If player is ahead, bot runs faster; if bot is ahead, bot slows down
      const baseDelay = lead > 1 ? 1600 : lead < -1 ? 3200 : 2300;
      const randomJitter = Math.random() * 800;

      timer = setTimeout(() => {
        if (cancelled) return;
        setBotIsTyping(false);

        // 18% fail rate for bot
        const botFailed = Math.random() < 0.18;
        if (!botFailed) {
          setBotScore(b => {
            const next = b + 1;
            if (next >= total && playerIndex < total) {
              // Bot finished first
              handleGameEnd(playerScore, next);
            }
            return next;
          });
        }

        // Schedule next word
        timer = setTimeout(runBotCycle, 1000 + Math.random() * 600);
      }, baseDelay + randomJitter);
    };

    timer = setTimeout(runBotCycle, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [playerScore, botScore, total, playerIndex]);

  const handleGameEnd = (finalPlayerScore: number, finalBotScore: number) => {
    if (finalPlayerScore >= finalBotScore) {
      sounds.playWin();
    } else {
      sounds.playWrong();
    }
    onFinish(finalPlayerScore, total, learnedWords);
  };

  const handleSelectOption = (opt: string) => {
    if (selectedOption || !currentWord) return;
    setSelectedOption(opt);

    const isCorrect = opt === currentWord.tr;
    if (isCorrect) {
      sounds.playCorrect();
      setPlayerScore(s => s + 1);
      setLearnedWords(l => [...l, currentWord.w]);
      speech.speak(currentWord.w, currentWord.lg || 'en');
    } else {
      sounds.playWrong();
    }

    const nextIdx = playerIndex + 1;
    onUpdateProgress(nextIdx, total);

    setTimeout(() => {
      if (nextIdx >= total) {
        handleGameEnd(playerScore + (isCorrect ? 1 : 0), botScore);
      } else {
        setPlayerIndex(nextIdx);
      }
    }, 450);
  };

  if (!currentWord || playerIndex >= total) {
    return null;
  }

  const playerPercent = Math.min(100, Math.round((playerScore / total) * 100));
  const botPercent = Math.min(100, Math.round((botScore / total) * 100));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Race Track Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        {/* Player lane */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <User className="w-4 h-4" /> Siz ({playerScore}/{total})
            </span>
            <span className="font-extrabold text-slate-700 dark:text-slate-300">{playerPercent}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${playerPercent}%` }}
            />
          </div>
        </div>

        {/* Bot lane */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-rose-500">
              <Bot className="w-4 h-4" /> Robot ({botScore}/{total})
              {botIsTyping && <span className="text-[10px] text-slate-400 animate-pulse font-normal">o'ylamoqda…</span>}
            </span>
            <span className="font-extrabold text-slate-700 dark:text-slate-300">{botPercent}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-rose-500 transition-all duration-300 rounded-full"
              style={{ width: `${botPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Target Word */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tezlikda tarjimasini toping!
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {currentWord.w}
          </div>
        </div>

        {/* Options Grid (4 Buttons) */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentWord.tr;

            let btnClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400';
            if (selectedOption) {
              if (isCorrect) {
                btnClass = 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30';
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
                disabled={!!selectedOption}
                onClick={() => handleSelectOption(opt)}
                className={`py-4 px-3 rounded-2xl font-bold text-sm border-2 transition-all cursor-pointer text-center ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
