import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/shuffle';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';

interface MatchGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface MatchItem {
  id: string;
  text: string;
  pairId: number;
  type: 'word' | 'translation';
  lg?: string;
}

export const MatchGame: React.FC<MatchGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);
  const [selectedRight, setSelectedRight] = useState<MatchItem | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [totalPairs, setTotalPairs] = useState(0);

  useEffect(() => {
    const valid = words.filter(w => w.tr && w.tr.trim());
    const subset = shuffleArray([...valid]).slice(0, 6);
    setTotalPairs(subset.length);

    const left: MatchItem[] = shuffleArray(subset.map((item, idx) => ({
      id: `w-${idx}`,
      text: item.w,
      pairId: idx,
      type: 'word' as const,
      lg: item.lg || 'en',
    })));

    const right: MatchItem[] = shuffleArray(subset.map((item, idx) => ({
      id: `tr-${idx}`,
      text: item.tr!,
      pairId: idx,
      type: 'translation' as const,
    })));

    setLeftItems(left);
    setRightItems(right);
  }, [words]);

  useEffect(() => {
    onUpdateProgress(matchedPairIds.length, totalPairs);
    if (totalPairs > 0 && matchedPairIds.length === totalPairs) {
      setTimeout(() => {
        onFinish(totalPairs, totalPairs, words.map(w => w.w));
      }, 500);
    }
  }, [matchedPairIds, totalPairs]);

  const handleLeftClick = (item: MatchItem) => {
    if (matchedPairIds.includes(item.pairId)) return;
    speakWord(item.text, item.lg || 'en');
    setSelectedLeft(item);

    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item: MatchItem) => {
    if (matchedPairIds.includes(item.pairId)) return;
    setSelectedRight(item);

    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  const checkMatch = (left: MatchItem, right: MatchItem) => {
    if (left.pairId === right.pairId) {
      // Correct Match!
      setMatchedPairIds(prev => [...prev, left.pairId]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong Match
      setWrongPair([left.id, right.id]);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 600);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-pop">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">
          Juftliklarni ulang
        </h2>
        <p className="text-sm text-slate-500">So'z va uning tarjimasini tanlang</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Words) */}
        <div className="space-y-3">
          {leftItems.map(item => {
            const isMatched = matchedPairIds.includes(item.pairId);
            const isSelected = selectedLeft?.id === item.id;
            const isWrong = wrongPair?.[0] === item.id;

            let style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
            if (isMatched) {
              style = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-default';
            } else if (isWrong) {
              style = 'bg-rose-500 border-rose-500 text-white';
            } else if (isSelected) {
              style = 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/25';
            }

            return (
              <button
                key={item.id}
                disabled={isMatched}
                onClick={() => handleLeftClick(item)}
                className={`w-full p-4 rounded-2xl border-2 font-bold text-base transition-all text-center cursor-pointer ${style}`}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        {/* Right Column (Translations) */}
        <div className="space-y-3">
          {rightItems.map(item => {
            const isMatched = matchedPairIds.includes(item.pairId);
            const isSelected = selectedRight?.id === item.id;
            const isWrong = wrongPair?.[1] === item.id;

            let style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
            if (isMatched) {
              style = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-default';
            } else if (isWrong) {
              style = 'bg-rose-500 border-rose-500 text-white';
            } else if (isSelected) {
              style = 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/25';
            }

            return (
              <button
                key={item.id}
                disabled={isMatched}
                onClick={() => handleRightClick(item)}
                className={`w-full p-4 rounded-2xl border-2 font-bold text-base transition-all text-center cursor-pointer ${style}`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
