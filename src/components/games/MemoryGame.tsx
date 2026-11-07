import React, { useState, useEffect } from 'react';
import type { WordItem } from '../../types';
import { speakWord } from '../../services/speech';

interface MemoryGameProps {
  words: WordItem[];
  onFinish: (score: number, total: number, learnedWords: string[]) => void;
  onUpdateProgress: (current: number, total: number) => void;
}

interface Card {
  id: number;
  text: string;
  pairId: number;
  isWord: boolean;
  lg?: string;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  words,
  onFinish,
  onUpdateProgress,
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);

  useEffect(() => {
    const valid = words.filter(w => w.tr && w.tr.trim());
    const subset = [...valid].sort(() => Math.random() - 0.5).slice(0, 6);
    setTotalPairs(subset.length);

    let cardId = 0;
    const generated: Card[] = [];
    subset.forEach((item, idx) => {
      generated.push({
        id: cardId++,
        text: item.w,
        pairId: idx,
        isWord: true,
        lg: item.lg || 'en',
      });
      generated.push({
        id: cardId++,
        text: item.tr!,
        pairId: idx,
        isWord: false,
      });
    });

    setCards(generated.sort(() => Math.random() - 0.5));
  }, [words]);

  useEffect(() => {
    onUpdateProgress(matchedPairIds.length, totalPairs);
    if (totalPairs > 0 && matchedPairIds.length === totalPairs) {
      setTimeout(() => {
        onFinish(totalPairs, totalPairs, words.map(w => w.w));
      }, 500);
    }
  }, [matchedPairIds, totalPairs]);

  const handleCardClick = (card: Card) => {
    if (
      flippedIds.length >= 2 ||
      flippedIds.includes(card.id) ||
      matchedPairIds.includes(card.pairId)
    ) {
      return;
    }

    if (card.isWord) {
      speakWord(card.text, card.lg || 'en');
    }

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const firstCard = cards.find(c => c.id === newFlipped[0])!;
      const secondCard = cards.find(c => c.id === newFlipped[1])!;

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        setMatchedPairIds(prev => [...prev, firstCard.pairId]);
        setFlippedIds([]);
      } else {
        // Mismatch - flip back
        setTimeout(() => {
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-pop">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold">Xotira o'yini</h2>
        <span className="text-sm font-semibold text-slate-500">
          Yurishlar: {moves}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map(card => {
          const isFlipped =
            flippedIds.includes(card.id) || matchedPairIds.includes(card.pairId);
          const isMatched = matchedPairIds.includes(card.pairId);

          return (
            <button
              key={card.id}
              disabled={isMatched}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl font-bold text-sm sm:text-base p-2 transition-all duration-300 transform flex items-center justify-center text-center cursor-pointer ${
                isMatched
                  ? 'bg-emerald-500 text-white opacity-80 cursor-default scale-95 shadow-none'
                  : isFlipped
                  ? 'bg-amber-400 dark:bg-amber-500 text-amber-950 shadow-[0_3px_0_#b45309]'
                  : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-400'
              }`}
            >
              {isFlipped ? card.text : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
