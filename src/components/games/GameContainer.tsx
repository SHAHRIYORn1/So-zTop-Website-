import React, { useState } from 'react';
import type { WordItem, WordSet, GameModeId } from '../../types';
import { GAME_MODES } from '../../data/gameModes';
import { QuizGame } from './QuizGame';
import { MatchGame } from './MatchGame';
import { MemoryGame } from './MemoryGame';
import { ScrambleGame } from './ScrambleGame';
import { TrueFalseGame } from './TrueFalseGame';
import { HangmanGame } from './HangmanGame';
import { WheelGame } from './WheelGame';
import { BombGame } from './BombGame';
import { RaceGame } from './RaceGame';
import { BubbleGame } from './BubbleGame';
import { WordSearchGame } from './WordSearchGame';
import { ListenGame } from './ListenGame';
import { SpotGame } from './SpotGame';
import { FillGame } from './FillGame';
import { SimonGame } from './SimonGame';
import { DictationGame } from './DictationGame';
import { DragLetterGame } from './DragLetterGame';
import { PuzzleGame } from './PuzzleGame';
import { ClozeGame } from './ClozeGame';
import { CrosswordGame } from './CrosswordGame';
import { GameResults } from './GameResults';
import { ArrowLeft } from 'lucide-react';

interface GameContainerProps {
  modeId: GameModeId;
  activeSet: WordSet;
  filteredWords?: WordItem[];
  onExit: () => void;
  onRecordResult: (modeId: string, score: number, total: number, learnedWords: string[]) => {
    earnedStars: number;
    percent: number;
  };
}

export const GameContainer: React.FC<GameContainerProps> = ({
  modeId,
  activeSet,
  filteredWords,
  onExit,
  onRecordResult,
}) => {
  const [playCount, setPlayCount] = useState(0); // used as key to fully reset game
  const [progress, setProgress] = useState({ current: 0, total: 1 });
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; earnedStars: number }>({
    score: 0,
    total: 0,
    earnedStars: 0,
  });

  const modeInfo = GAME_MODES.find(m => m.id === modeId) || GAME_MODES[0];
  const wordsToPlay = (filteredWords && filteredWords.length >= 4) ? filteredWords : activeSet.words;

  const handleFinish = (score: number, total: number, learnedWords: string[]) => {
    const { earnedStars } = onRecordResult(modeId, score, total, learnedWords);
    setResult({ score, total, earnedStars });
    setIsFinished(true);
  };

  const handleUpdateProgress = (current: number, total: number) => {
    setProgress({ current, total: total || 1 });
  };

  const progressPercent = Math.round((progress.current / progress.total) * 100);

  // Render appropriate game
  const renderGame = () => {
    const props = {
      words: wordsToPlay,
      onFinish: handleFinish,
      onUpdateProgress: handleUpdateProgress,
    };
    const k = playCount;

    switch (modeId) {
      case 'quiz':
        return <QuizGame key={k} {...props} />;
      case 'tf':
        return <TrueFalseGame key={k} {...props} />;
      case 'match':
        return <MatchGame key={k} {...props} />;
      case 'memory':
        return <MemoryGame key={k} {...props} />;
      case 'hang':
        return <HangmanGame key={k} {...props} />;
      case 'scramble':
        return <ScrambleGame key={k} {...props} />;
      case 'dragl':
        return <DragLetterGame key={k} {...props} />;
      case 'puzzle':
        return <PuzzleGame key={k} {...props} />;
      case 'cloze':
        return <ClozeGame key={k} {...props} />;
      case 'wheel':
        return <WheelGame key={k} {...props} />;
      case 'bomb':
        return <BombGame key={k} {...props} />;
      case 'race':
        return <RaceGame key={k} {...props} />;
      case 'bubble':
        return <BubbleGame key={k} {...props} />;
      case 'wsearch':
        return <WordSearchGame key={k} {...props} />;
      case 'crossword':
        return <CrosswordGame key={k} {...props} />;
      case 'listen':
        return <ListenGame key={k} {...props} />;
      case 'spot':
        return <SpotGame key={k} {...props} />;
      case 'fill':
        return <FillGame key={k} {...props} />;
      case 'simon':
        return <SimonGame key={k} {...props} />;
      case 'dictation':
        return <DictationGame key={k} {...props} />;
      default:
        return <QuizGame key={k} {...props} />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onExit}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Orqaga"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {modeInfo.name}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {progress.current} / {progress.total}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Game Content or Results */}
      {isFinished ? (
        <GameResults
          score={result.score}
          total={result.total}
          earnedStars={result.earnedStars}
          onPlayAgain={() => {
            setIsFinished(false);
            setProgress({ current: 0, total: 1 });
            setPlayCount(c => c + 1);
          }}
          onGoHome={onExit}
        />
      ) : (
        renderGame()
      )}
    </div>
  );
};
