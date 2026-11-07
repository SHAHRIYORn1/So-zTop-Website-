import React from 'react';
import { Sun, Moon, Flame, Star, Sparkles, FolderOpen, Trophy, Volume2, VolumeX, LogOut } from 'lucide-react';
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
  currentView: 'home' | 'editor' | 'templates' | 'achievements' | 'game' | 'profile';
  onNavigate: (view: 'home' | 'editor' | 'templates' | 'achievements' | 'profile') => void;
  onOpenLibrary?: () => void;
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
}) => {
  return (
    <header className="py-2 sm:py-3.5 px-2.5 sm:px-4 border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
      {/* Top Bar: Brand, Stats, Sound, Dark mode, Profile */}
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Left: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 focus:outline-none group cursor-pointer"
            aria-label="Bosh sahifaga qaytish"
          >
            <div className="flex items-center -space-x-1">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                S
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-violet-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                O'
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                Z
              </span>
            </div>
            <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              So'z<span className="text-indigo-600 dark:text-indigo-400">Top</span>
            </span>
          </button>

          {/* Desktop Navigation Tabs (Visible on >= 768px) */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'home' || currentView === 'editor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>To'plamlarim</span>
            </button>

            <button
              onClick={() => onNavigate('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'templates'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Andozalar</span>
            </button>

            <button
              onClick={() => onNavigate('achievements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'achievements'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Yutuqlar</span>
            </button>
          </nav>
        </div>

        {/* Right side: Stats, Settings, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak */}
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{stats.streak}</span>
            </div>
          )}

          {/* Stars button */}
          <button
            onClick={() => onNavigate('achievements')}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs sm:text-sm transition-colors cursor-pointer"
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

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${
              currentView === 'profile'
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-bold'
            }`}
            title="Profilni ko'rish va sozlash"
          >
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base leading-none">
                {userAvatar}
              </span>
            )}
            <span className="hidden sm:inline-block text-xs sm:text-sm max-w-[100px] truncate">
              {userName || 'Profil'}
            </span>
          </button>

          {/* LogOut Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors cursor-pointer"
              title="Chiqish (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar (Segmented Pill, Seamless Dark/Light Colors) */}
      <nav className="flex md:hidden items-center justify-between p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mt-2.5 w-full gap-1">
        <button
          onClick={() => onNavigate('home')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            currentView === 'home' || currentView === 'editor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">To'plamlarim</span>
        </button>

        <button
          onClick={() => onNavigate('templates')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            currentView === 'templates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Andozalar</span>
        </button>

        <button
          onClick={() => onNavigate('achievements')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            currentView === 'achievements'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Yutuqlar</span>
        </button>
      </nav>
    </header>
  );
};
