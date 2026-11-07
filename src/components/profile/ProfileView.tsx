import React, { useState } from 'react';
import type { UserStats, WordSet } from '../../types';
import { GAME_MODES } from '../../data/gameModes';
import { api, type AuthUser } from '../../services/api';
import { sounds } from '../../services/soundEffects';
import {
  LogOut,
  Camera,
  Star,
  Flame,
  Gamepad2,
  CloudCheck,
  ArrowLeft,
  Check,
  Edit2,
  Trophy,
} from 'lucide-react';

interface ProfileViewProps {
  user: AuthUser | null;
  stats: UserStats;
  sets: WordSet[];
  onBack: () => void;
  onUpdateUser: (updatedUser: AuthUser) => void;
  onLogout: () => void;
}

const AVATAR_LIST = ['🦁', '🦊', '🚀', '⚡', '👑', '🦉', '🎓', '🐬', '🐼', '🐯', '🌟', '🎯'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  sets,
  onBack,
  onUpdateUser,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'Foydalanuvchi');
  const [avatar, setAvatar] = useState(user?.avatar || '🦁');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image || null);

  // Calculate most played games
  const mostPlayedGames = React.useMemo(() => {
    const entries = Object.entries(stats.playedModes || {});
    if (entries.length === 0) return [];

    return entries
      .map(([modeId, count]) => {
        const mode = GAME_MODES.find(m => m.id === modeId);
        return {
          id: modeId,
          name: mode?.name || modeId,
          count: count as number,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [stats.playedModes]);

  // Handle image upload from computer / phone
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Rasm hajmi 2MB dan oshmasligi kerak!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfileImage(base64);
      sounds.playPop();
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        avatar,
        profile_image: profileImage || undefined,
      });
      onUpdateUser(updated);
      sounds.playWin();
      setIsEditing(false);
    } catch {
      // Offline fallback
      const localUpdated: AuthUser = {
        ...user,
        full_name: fullName.trim(),
        avatar,
        profile_image: profileImage,
      };
      onUpdateUser(localUpdated);
      sounds.playWin();
      setIsEditing(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar / Picture with upload overlay */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-4xl shadow-md overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profil rasmi" className="w-full h-full object-cover" />
              ) : (
                <span>{avatar}</span>
              )}
            </div>

            {/* Upload Button */}
            <label className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md transition-transform hover:scale-110">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {user?.full_name || 'Foydalanuvchi'}
              </h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Tahrirlash"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-bold text-slate-400">
              @{user?.username || 'mehmon'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5" /> Bulutli xotira faol
              </span>
            </div>
          </div>
        </div>

        {/* Edit fields if open */}
        {isEditing && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Ism va familiya:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Emoji avatar tanlang:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_LIST.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => { setAvatar(av); setProfileImage(null); }}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border ${
                      avatar === av && !profileImage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4" /> Saqlash
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-center">
            <Star className="w-5 h-5 text-amber-500 mx-auto mb-1 fill-current" />
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.stars}</div>
            <div className="text-xs font-semibold text-slate-500">Yulduzlar</div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1 fill-current" />
            <div className="text-xl font-black text-orange-600 dark:text-orange-400">{stats.streak} kun</div>
            <div className="text-xs font-semibold text-slate-500">Ketma-ket</div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-center">
            <Gamepad2 className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats.games}</div>
            <div className="text-xs font-semibold text-slate-500">O'yinlar</div>
          </div>
        </div>
      </div>

      {/* Most Played Games Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Eng ko'p o'ynalgan o'yinlar
          </h2>
        </div>

        {mostPlayedGames.length > 0 ? (
          <div className="space-y-2.5">
            {mostPlayedGames.map((game, idx) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {game.name}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {game.count} marta o'ynaldi
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            Hali o'yinlar o'ynalmadi. O'yin o'ynang va profilingizda statistika paydo bo'ladi!
          </p>
        )}
      </div>

      {/* Word Sets Cloud Status (AUTO-SYNCED) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
            Shaxsiy to'plamlar: {sets.length} ta
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Har bir yulduz va to'plam avtomatik ravishda saqlanadi
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <CloudCheck className="w-4 h-4 text-emerald-500" />
          <span>Avto-sinxron faol ⚡</span>
        </div>
      </div>
    </div>
  );
};
