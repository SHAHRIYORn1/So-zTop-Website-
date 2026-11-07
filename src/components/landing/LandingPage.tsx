import React, { useState } from 'react';
import {
  Sparkles,
  LogIn,
  UserPlus,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { GAME_MODES } from '../../data/gameModes';

interface LandingPageProps {
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onOpenLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "So'zTop dan foydalanish bepulmi?",
      a: "Ha, barcha o'yinlar, lug'atlar, ovozli talaffuz va to'plamlar o'qituvchilar va o'quvchilar uchun 100% bepul!",
    },
    {
      q: "Qanday qilib yangi to'plam yaratsam bo'ladi?",
      a: "Ro'yxatdan o'tgach, 'Yangi to'plam' tugmasini bosib xohlagan mavzuingizdagi so'zlarni kiritasiz. Tizim tarjimalarni avtomatik o'zi topib beradi!",
    },
    {
      q: "Boshqa telefonda kirsam, ma'lumotlarim saqlanadimi?",
      a: "Albatta! Username va parolingiz orqali istalgan telefon, planshet yoki kompyuterdan kirsangiz, barcha to'plamlaringiz va yutuqlaringiz o'z joyida turadi.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1">
              <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-lg shadow-indigo-600/30">
                S
              </span>
              <span className="w-9 h-9 rounded-xl bg-violet-600 text-white font-black text-base flex items-center justify-center shadow-lg shadow-violet-600/30">
                O'
              </span>
              <span className="w-9 h-9 rounded-xl bg-pink-600 text-white font-black text-base flex items-center justify-center shadow-lg shadow-pink-600/30">
                Z
              </span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                So'z<span className="text-indigo-600 dark:text-indigo-400">Top</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Ta'limiy O'yinlar
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Kirish</span>
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ro'yxatdan o'tish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 px-4 sm:px-6">
        {/* Decorative blur glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-[550px] h-[350px] bg-indigo-500/15 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold shadow-sm animate-in fade-in">
            <Sparkles className="w-4 h-4" /> O'zbekistondagi eng qulay interaktiv ta'lim platformasi
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Darslarni <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">o'yin orqali</span> qiziqarli va zavqli qiling!
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Ustozlar va o'quvchilar uchun 20 xil interaktiv o'yin: Omad charxi, Bomba, Pufakchalar, Poyga, Krossvord va Diktant. Istalgan qurilmadan oson kiring!
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
            >
              <UserPlus className="w-5 h-5" />
              <span>Bepul hisob ochish</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-extrabold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="w-5 h-5 text-indigo-600" />
              <span>Mavjud hisobga kirish</span>
            </button>
          </div>

          {/* Trust stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">20+</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Interaktiv o'yinlar</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">300+</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Tayyor so'zlar</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">100%</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Bepul va qulay</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400">☁️ Cloud</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Bulutli xotira</div>
            </div>
          </div>
        </div>
      </section>

      {/* 20 Games Showcase Section */}
      <section className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Darsingizga mos istalgan o'yinni tanlang
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Har bir o'yin o'quvchilarda diqqat, tezlik, eslab qolish va orfografiyani rivojlantiradi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAME_MODES.slice(0, 8).map(mode => (
              <div
                key={mode.id}
                onClick={() => onOpenAuth('register')}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group space-y-2.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                  {mode.id === 'wheel' ? '🎡' : mode.id === 'bomb' ? '💣' : mode.id === 'race' ? '⚡' : mode.id === 'bubble' ? '🫧' : mode.id === 'hang' ? '🎯' : mode.id === 'wsearch' ? '🔍' : mode.id === 'memory' ? '🃏' : '✨'}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {mode.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {mode.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <span>Barcha 20 ta o'yinni ochish</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Oddiy va tez
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Qanday ishlaydi?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Ro'yxatdan o'ting
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Faqat username va istalgan parol bilan 10 soniyada o'z hisobingizni oching.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-black text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Mavzuni tanlang
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tayyor 9 ta to'plamdan tanlang yoki o'z darsingiz so'zlarini 1 daqiqada kiriting.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white font-black text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                O'yinni boshlang
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Charxni aylantiring, pufakchalarni yoring va bolalarning qiziqishini 100% oshiring!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Ko'p beriladigan savollar
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-indigo-600 font-black text-lg">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Hoziroq bepul boshlang!
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto font-medium">
            Hisob oching va o'z so'zlar to'plamlaringizni yaratib, o'quvchilaringiz bilan sinab ko'ring.
          </p>
          <div>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-4 rounded-2xl bg-white text-indigo-700 font-black text-base shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Ro'yxatdan o'tish (10 soniya)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-400">
        <p>So'zTop — Interaktiv so'z va ta'lim o'yinlari platformasi • 2026</p>
      </footer>
    </div>
  );
};
