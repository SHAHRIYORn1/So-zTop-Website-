import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface OnboardingModalProps {
  isOpen: boolean;
  initialName?: string;
  initialAvatar?: string;
  onSave: (name: string, avatar: string) => void;
  onClose?: () => void;
}

const AVATARS = ['🦁', '🚀', '🦊', '⚡', '👑', '🦉', '🐼', '🐯', '🎯', '🔥'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialName = '',
  initialAvatar = '🦁',
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playWin();
    onSave(name.trim(), avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Xush kelibsiz! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Natijalaringiz, yulduzlaringiz va reytingingizni saqlab borish uchun ismingizni kiriting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Avatar selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Sevimli avataringizni tanlang:
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {AVATARS.map(av => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    sounds.playPop();
                    setAvatar(av);
                  }}
                  className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-indigo-600 text-white shadow-md scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Ismingiz:
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Sardor"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>Platformaga kirish</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:underline cursor-pointer"
          >
            Keyinroq kiritaman
          </button>
        )}
      </div>
    </div>
  );
};
