export interface WordItem {
  id?: string;
  w: string;       // Word
  tr: string | null; // Translation
  lg?: string;     // Language code
}

export interface WordSet {
  id: string;
  name: string;
  src: string;     // 'auto' | 'en' | 'ru' | 'uz' | 'de'
  to: string;      // 'uz' | 'en' | 'ru' | 'de'
  words: WordItem[];
}

export type GameModeId =
  | 'quiz'
  | 'tf'
  | 'match'
  | 'memory'
  | 'wheel'
  | 'bubble'
  | 'fill'
  | 'hang'
  | 'dictation'
  | 'listen'
  | 'spot'
  | 'scramble'
  | 'dragl'
  | 'puzzle'
  | 'cloze'
  | 'wsearch'
  | 'crossword'
  | 'race'
  | 'bomb'
  | 'simon';

export interface GameModeInfo {
  id: GameModeId;
  name: string;
  desc: string;
  category: 'matching' | 'listening' | 'letters' | 'speed';
}

export interface UserStats {
  stars: number;
  games: number;
  perfect: number;
  streak: number;
  best: number;
  lastDate: string;
  knownWords: Record<string, number>;
  playedModes: Record<string, number>;
  unlockedBadges: Record<string, string>; // badgeId -> date
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  isUnlocked: (stats: UserStats) => boolean;
}
