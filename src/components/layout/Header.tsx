import React from 'react';
import { Sun, Moon, Flame, Star, Compass, Volume2, VolumeX, LogOut } from 'lucide-react';
import type { UserStats } from '../../types';

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  profileImage?: string | null;
  onOpenProfile: () => void;
  onLogout?: () => void;
  stats: UserStats;
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentView: 'home' | 'editor' | 'achievements' | 'game' | 'profile';
  onNavigate: (view: 'home' | 'editor' | 'achievements' | 'profile') => void;
  onOpenLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  userAvatar = '🦁',
  profileImage,
  onOpenProfile,
  onLogout,
  stats,
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  currentView,
  onNavigate,
  onOpenLibrary,
}) => {
  const letters = ["S", "O'", "Z", "T", "O", "P"];

  return (
    <header className="flex items-center justify-between py-2.5 sm:py-3.5 px-2 sm:px-4 border-b border-slate-200 dark:border-slate-800 transition-colors gap-2">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 focus:outline-none group cursor-pointer"
          aria-label="Bosh sahifaga qaytish"
        >
          <div className="flex gap-0.5 sm:gap-1">
            {letters.map((char, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-center w-6 h-8 sm:w-8 sm:h-10 rounded-md sm:rounded-lg bg-amber-400 dark:bg-amber-500 text-amber-950 font-black text-sm sm:text-xl shadow-[0_2px_0_#b45309] sm:shadow-[0_3px_0_#b45309] group-hover:scale-105 transition-transform"
              >
                {char}
              </span>
            ))}
          </div>
        </button>

        {/* Quick Library Button */}
        <button
          onClick={onOpenLibrary}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/60 transition-all cursor-pointer shadow-xs"
        >
          <Compass className="w-3.5 h-3.5 text-indigo-500" />
          <span>Kutubxona</span>
        </button>
      </div>

      {/* Right side: Stats, Settings, and PROMINENT PROFILE BUTTON */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Streak */}
        {stats.streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs sm:text-sm">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{stats.streak}</span>
          </div>
        )}

        {/* Stars button */}
        <button
          onClick={() => onNavigate('achievements')}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
          title="Yutuqlar va reyting"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{stats.stars}</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={soundEnabled ? "Tovush yoqilgan" : "Tovush o'chirilgan"}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
        </button>

        {/* PROMINENT USER PROFILE BUTTON */}
        <button
          onClick={onOpenProfile}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
            currentView === 'profile'
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-bold'
          }`}
          title="Profilni ko'rish va sozlash"
        >
          {profileImage ? (
            <img src={profileImage} alt="Avatar" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
          ) : (
            <span className="text-base sm:text-lg leading-none">{userAvatar}</span>
          )}
          <span className="text-xs sm:text-sm max-w-[80px] sm:max-w-[120px] truncate">
            {userName || 'Profil'}
          </span>
        </button>

        {/* Instant LogOut Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors cursor-pointer"
            title="Chiqish (Logout)"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
