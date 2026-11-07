import React, { useState } from 'react';
import { api, type AuthUser } from '../../services/api';
import { sounds } from '../../services/soundEffects';
import {
  X,
  LogIn,
  UserPlus,
  User,
  Lock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialTab?: 'login' | 'register';
}

const AVATARS = ['🦁', '🦊', '🚀', '⚡', '👑', '🦉', '🎓', '🐬', '🐼', '🐯', '🌟', '🎯'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [regStep, setRegStep] = useState<1 | 2>(1); // 1 = info, 2 = avatar

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setRegStep(1);
      setError(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Validate step 1 and move to avatar picker
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName) {
      setError('Iltimos, ismingizni kiriting');
      return;
    }
    if (cleanUsername.length < 3) {
      setError("Username kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setRegStep(2);
    sounds.playPop();
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Rasm hajmi 2MB dan oshmasligi kerak");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomPhoto(base64);
      setError(null);
      sounds.playPop();
    };
    reader.readAsDataURL(file);
  };

  // Final submit
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        if (!username.trim() || !password) {
          throw new Error('Username va parolni kiriting');
        }
        const res = await api.login(username.trim().toLowerCase(), password);
        sounds.playWin();
        onAuthSuccess(res.user);
        onClose();
      } else {
        const cleanUsername = username.trim().toLowerCase();
        const res = await api.register(cleanUsername, password, fullName.trim(), selectedAvatar);

        // If user picked a custom photo, update profile image right away
        if (customPhoto) {
          try {
            const updated = await api.updateProfile({ profile_image: customPhoto });
            res.user = updated;
          } catch {}
        }

        sounds.playWin();
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative">
        {/* Top Header: Brand + Standalone Close Button (Never overlaps tabs!) */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                S
              </span>
              <span className="w-7 h-7 rounded-lg bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                O'
              </span>
              <span className="w-7 h-7 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                Z
              </span>
            </div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              So'z<span className="text-indigo-600 dark:text-indigo-400">Top</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch (Only shown during Step 1) */}
        {regStep === 1 && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Kirish</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Ro'yxatdan o'tish</span>
            </button>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── TAB 1: LOGIN ─────────────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3.5 top-2.5 text-sm font-bold">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="masalan: nodira_ustoz"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Parolingizni kiriting"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Kirilmoqda…" : "Hisobga kirish"}</span>
            </button>
          </form>
        )}

        {/* ─── TAB 2: REGISTER STEP 1 (Credentials) ─────────────────────── */}
        {tab === 'register' && regStep === 1 && (
          <form onSubmit={handleNextStep} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Ismingiz (Ustoz yoki O'quvchi)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Masalan: Nodira Karimova"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Username (Foydalanuvchi nomi)
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3.5 top-2.5 text-sm font-bold">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="masalan: nodira_ustoz"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-500">
                  Parol
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  kamida 8 ta belgi
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Kamida 8 ta belgi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-3 flex items-center justify-center gap-2"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ─── TAB 2: REGISTER STEP 2 (Avatar / Profile Customization) ───── */}
        {tab === 'register' && regStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Profilingizni moslang
              </h3>
              <p className="text-xs text-slate-500">
                O'zingizga yoqqan avatarni tanlang yoki o'z rasmingizni yuklang
              </p>
            </div>

            {/* Current Selected Preview (Big center tile) */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-500 flex items-center justify-center text-4xl shadow-inner overflow-hidden">
                  {customPhoto ? (
                    <img src={customPhoto} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    selectedAvatar
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Emojis Grid */}
            <div>
              <div className="grid grid-cols-6 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      setCustomPhoto(null);
                      sounds.playPop();
                    }}
                    className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === av && !customPhoto
                        ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Back + Finish */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setRegStep(1)}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinalSubmit()}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? "Ochilmoqda…" : "Hisobni ochish va boshlash"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
