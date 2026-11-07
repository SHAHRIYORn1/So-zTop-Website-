import type { GameModeInfo } from '../types';

export const GAME_MODES: GameModeInfo[] = [
  // 1. Tanlash va moslash
  { id: 'quiz', name: 'Test', desc: 'Savol va 4 ta variant', category: 'matching' },
  { id: 'tf', name: "To'g'ri / Noto'g'ri", desc: "Tarjima to'g'rimi?", category: 'matching' },
  { id: 'match', name: 'Juftliklarni topish', desc: 'Juftlarni ulang', category: 'matching' },
  { id: 'memory', name: "Xotira o'yini", desc: 'Kartalarni ochib toping', category: 'matching' },
  { id: 'wheel', name: 'Omad charxpalagi', desc: 'Charxni aylantiring', category: 'matching' },
  { id: 'bubble', name: 'Pufakchalar', desc: "To'g'ri pufakchani yoring", category: 'matching' },

  // 2. Yozish va eshitish
  { id: 'fill', name: "Bo'sh joyni to'ldirish", desc: "Tushib qolgan harflarni yozing", category: 'listening' },
  { id: 'hang', name: "So'z taxmini", desc: "Harflarni topib so'zni oching", category: 'listening' },
  { id: 'dictation', name: 'Diktant', desc: 'Eshiting va yozing', category: 'listening' },
  { id: 'listen', name: 'Eshitish', desc: 'Eshiting va tanlang', category: 'listening' },
  { id: 'spot', name: 'Xatoni top', desc: 'Xato harfni toping', category: 'listening' },

  // 3. Harflar bilan
  { id: 'scramble', name: 'Harflarni tartiblash', desc: "Harflardan so'z yig'ing", category: 'letters' },
  { id: 'dragl', name: "Harfni sudrab qo'y", desc: 'Harfni joyiga qo\'ying', category: 'letters' },
  { id: 'puzzle', name: 'Puzzle', desc: "So'z bo'laklarini yig'ing", category: 'letters' },
  { id: 'cloze', name: 'Teshik to\'ldir', desc: "So'zni bo'sh katakka qo'ying", category: 'letters' },
  { id: 'wsearch', name: "So'z topish", desc: 'Katakdan so\'zlarni toping', category: 'letters' },
  { id: 'crossword', name: 'Krossvord', desc: 'Krossvordni to\'ldiring', category: 'letters' },

  // 4. Tezlik va raqobat
  { id: 'race', name: 'Poyga', desc: 'Botga qarshi yozing', category: 'speed' },
  { id: 'bomb', name: 'Bomba', desc: 'Fitil tugamasdan yozing', category: 'speed' },
  { id: 'simon', name: 'Xotira zanjiri', desc: 'Ketma-ketlikni eslang', category: 'speed' },
];

export const CATEGORIES = [
  { id: 'matching', title: 'Tanlash va moslash', color: 'from-blue-500 to-indigo-600' },
  { id: 'listening', title: 'Yozish va eshitish', color: 'from-emerald-500 to-teal-600' },
  { id: 'letters', title: 'Harflar bilan', color: 'from-amber-500 to-orange-600' },
  { id: 'speed', title: 'Tezlik va raqobat', color: 'from-purple-500 to-pink-600' },
] as const;
