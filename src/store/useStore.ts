import { useState, useEffect, useCallback } from 'react';
import type { WordSet, UserStats } from '../types';
import { BADGES } from '../data/badges';
import { sounds } from '../services/soundEffects';
import { api } from '../services/api';

const getTodayString = () => new Date().toISOString().split('T')[0];
const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const getEmptyStats = (): UserStats => ({
  stars: 0,
  games: 0,
  perfect: 0,
  streak: 0,
  best: 0,
  lastDate: '',
  knownWords: {},
  playedModes: {},
  unlockedBadges: {},
});

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('soztop_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const cleanSetsList = (arr: any): WordSet[] => {
  if (!Array.isArray(arr)) return [];
  // Qat'iy hech qanday eski default 3 ta toplam ('s1', 's2', 's3') qo'shilmaydi
  return arr.filter(s => s && s.id && !['s1', 's2', 's3'].includes(s.id));
};

export function useAppStore() {
  const initialUser = getSavedUser();
  const initialUsername = initialUser?.username ? initialUser.username.trim().toLowerCase() : '';

  // 1. Current user
  const [currentUserKey, setCurrentUserKey] = useState<string>(initialUsername);
  const [userName, setUserName] = useState<string>(initialUser?.full_name || initialUsername);
  const [userAvatar, setUserAvatar] = useState<string>(initialUser?.avatar || '🦁');

  // 2. Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const s = localStorage.getItem('soztop_sound_enabled');
    return s ? s === 'true' : true;
  });

  useEffect(() => {
    sounds.enabled = soundEnabled;
    localStorage.setItem('soztop_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  // 3. Sets state (Directly initialized from localStorage with username key)
  const [sets, setSets] = useState<WordSet[]>(() => {
    if (!initialUsername) return [];
    try {
      const saved = localStorage.getItem(`soztop_sets_${initialUsername}`);
      if (saved) return cleanSetsList(JSON.parse(saved));
      // Yangi foydalanuvchi doimo 0 ta to'plam bilan boshlaydi
      return [];
    } catch {
      return [];
    }
  });

  // 4. Active Set Id
  const [activeSetId, setActiveSetId] = useState<string>(() => {
    if (!initialUsername) return '';
    try {
      const saved = localStorage.getItem(`soztop_active_${initialUsername}`);
      if (saved && !['s1', 's2', 's3'].includes(saved)) return saved;
      return '';
    } catch {
      return '';
    }
  });

  // 5. Stats state (Directly initialized from localStorage with username key)
  const [stats, setStats] = useState<UserStats>(() => {
    if (!initialUsername) return getEmptyStats();
    try {
      const saved = localStorage.getItem(`soztop_stats_${initialUsername}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
      const fresh = getEmptyStats();
      localStorage.setItem(`soztop_stats_${initialUsername}`, JSON.stringify(fresh));
      return fresh;
    } catch {
      return getEmptyStats();
    }
  });

  // Load account data when user logs in or switches
  const loadUserContext = useCallback((username: string, fullName = '', avatar = '🦁') => {
    const cleanUsername = username.trim().toLowerCase();
    setCurrentUserKey(cleanUsername);
    setUserName(fullName || username);
    setUserAvatar(avatar);

    if (!cleanUsername) {
      setSets([]);
      setActiveSetId('');
      setStats(getEmptyStats());
      return;
    }

    const userSetsKey = `soztop_sets_${cleanUsername}`;
    const userActiveKey = `soztop_active_${cleanUsername}`;
    const userStatsKey = `soztop_stats_${cleanUsername}`;

    // Read sets - strictly 0 sets for new users or clean legacy sets
    try {
      const savedSets = localStorage.getItem(userSetsKey);
      if (savedSets) {
        const parsedSets = cleanSetsList(JSON.parse(savedSets));
        setSets(parsedSets);
        localStorage.setItem(userSetsKey, JSON.stringify(parsedSets));
        const savedActive = localStorage.getItem(userActiveKey);
        const activeValid = parsedSets.some(s => s.id === savedActive);
        setActiveSetId(activeValid ? savedActive! : parsedSets[0]?.id || '');
      } else {
        // Yangi foydalanuvchi doimo 0 ta to'plam bilan boshlaydi
        setSets([]);
        setActiveSetId('');
      }
    } catch {
      setSets([]);
      setActiveSetId('');
    }

    // Read stats
    try {
      const savedStats = localStorage.getItem(userStatsKey);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      } else {
        const freshStats = getEmptyStats();
        setStats(freshStats);
        localStorage.setItem(userStatsKey, JSON.stringify(freshStats));
      }
    } catch {
      setStats(getEmptyStats());
    }
  }, []);

  // Sync complete state with server cloud data (guarantees cross-device & cross-tab persistent sync)
  const syncWithServerData = useCallback((
    serverUser: { username: string; full_name?: string; avatar?: string },
    serverStats?: any,
    serverSets?: WordSet[]
  ) => {
    const cleanUsername = serverUser.username.trim().toLowerCase();
    setCurrentUserKey(cleanUsername);
    setUserName(serverUser.full_name || cleanUsername);
    setUserAvatar(serverUser.avatar || '🦁');

    const userSetsKey = `soztop_sets_${cleanUsername}`;
    const userActiveKey = `soztop_active_${cleanUsername}`;
    const userStatsKey = `soztop_stats_${cleanUsername}`;

    // 1. Sync sets: If server has sets, use them, otherwise preserve local
    if (serverSets && serverSets.length > 0) {
      const cleaned = cleanSetsList(serverSets);
      setSets(cleaned);
      localStorage.setItem(userSetsKey, JSON.stringify(cleaned));
      const savedActive = localStorage.getItem(userActiveKey);
      const activeValid = cleaned.some(s => s.id === savedActive);
      setActiveSetId(activeValid ? savedActive! : cleaned[0]?.id || '');
    } else {
      const savedSets = localStorage.getItem(userSetsKey);
      if (savedSets) {
        const parsed = cleanSetsList(JSON.parse(savedSets));
        setSets(parsed);
        if (parsed.length > 0) {
          api.syncSets(parsed).catch(() => {});
        }
      } else {
        setSets([]);
        setActiveSetId('');
      }
    }

    // 2. Sync stats: Accumulate and merge to guarantee progress is NEVER lost across devices
    let localStats: UserStats = getEmptyStats();
    try {
      const saved = localStorage.getItem(userStatsKey);
      if (saved) localStats = JSON.parse(saved);
    } catch {}

    const allModeKeys = new Set([
      ...Object.keys(serverStats?.played_modes || {}),
      ...Object.keys(localStats.playedModes || {}),
    ]);
    const mergedModes: Record<string, number> = {};
    allModeKeys.forEach(k => {
      mergedModes[k] = Math.max(
        serverStats?.played_modes?.[k] || 0,
        localStats.playedModes?.[k] || 0
      );
    });

    const allWords = new Set([
      ...Object.keys(serverStats?.known_words || {}),
      ...Object.keys(localStats.knownWords || {}),
    ]);
    const mergedWords: Record<string, number> = {};
    allWords.forEach(w => {
      mergedWords[w] = Math.max(
        serverStats?.known_words?.[w] || 0,
        localStats.knownWords?.[w] || 0
      );
    });

    const mergedStats: UserStats = {
      stars: Math.max(serverStats?.stars || 0, localStats.stars || 0),
      games: Math.max(serverStats?.games || 0, localStats.games || 0),
      perfect: Math.max(serverStats?.perfect || 0, localStats.perfect || 0),
      streak: Math.max(serverStats?.streak || 0, localStats.streak || 0),
      best: Math.max(serverStats?.best || 0, localStats.best || 0, serverStats?.streak || 0, localStats.streak || 0),
      lastDate: serverStats?.lastDate || localStats.lastDate || getTodayString(),
      playedModes: mergedModes,
      knownWords: mergedWords,
      unlockedBadges: { ...(serverStats?.unlocked_badges || {}), ...(localStats.unlockedBadges || {}) },
    };

    setStats(mergedStats);
    localStorage.setItem(userStatsKey, JSON.stringify(mergedStats));
    api.syncStats(mergedStats).catch(() => {});
  }, []);

  // Clear account data on logout
  const resetUserContext = useCallback(() => {
    setCurrentUserKey('');
    setUserName('');
    setUserAvatar('🦁');
    setSets([]);
    setActiveSetId('');
    setStats(getEmptyStats());
  }, []);

  // 6. Dark Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('soztop_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('soztop_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('soztop_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleSound = () => setSoundEnabled(prev => !prev);

  const updateProfile = (name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar);
    const currentUser = getSavedUser();
    if (currentUser) {
      const updated = { ...currentUser, full_name: name, avatar };
      localStorage.setItem('soztop_user', JSON.stringify(updated));
    }
  };

  // Word set helpers + AUTO-SYNC
  const activeSet = sets.find(s => s.id === activeSetId) || sets[0] || {
    id: 's_empty',
    name: "To'plam yo'q",
    src: 'en',
    to: 'uz',
    words: [],
  };

  const updateWordSet = (updated: WordSet) => {
    setSets(prev => {
      const nextSets = prev.map(s => (s.id === updated.id ? updated : s));
      const targetUser = currentUserKey || getSavedUser()?.username?.trim()?.toLowerCase();
      if (targetUser) {
        localStorage.setItem(`soztop_sets_${targetUser}`, JSON.stringify(nextSets));
        // Auto-sync in background!
        api.syncSets(nextSets).catch(() => {});
      }
      return nextSets;
    });
  };

  const addWordSet = (newSet: WordSet) => {
    setSets(prev => {
      const nextSets = [newSet, ...prev];
      const targetUser = currentUserKey || getSavedUser()?.username?.trim()?.toLowerCase();
      if (targetUser) {
        localStorage.setItem(`soztop_sets_${targetUser}`, JSON.stringify(nextSets));
        localStorage.setItem(`soztop_active_${targetUser}`, newSet.id);
        // Auto-sync in background!
        api.syncSets(nextSets).catch(() => {});
      }
      return nextSets;
    });
    setActiveSetId(newSet.id);
  };

  const deleteWordSet = (id: string) => {
    setSets(prev => {
      const filtered = prev.filter(s => s.id !== id);
      const targetUser = currentUserKey || getSavedUser()?.username?.trim()?.toLowerCase();
      if (targetUser) {
        localStorage.setItem(`soztop_sets_${targetUser}`, JSON.stringify(filtered));
        // Auto-sync in background!
        api.syncSets(filtered).catch(() => {});
      }
      if (activeSetId === id) {
        const nextActive = filtered[0]?.id || '';
        setActiveSetId(nextActive);
        if (targetUser) {
          localStorage.setItem(`soztop_active_${targetUser}`, nextActive);
        }
      }
      return filtered;
    });
  };

  // Result recording with INSTANT persistent storage + AUTO-SYNC
  const recordGameResult = (modeId: string, score: number, total: number, learnedWords: string[]) => {
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let earnedStars = 0;
    if (percent >= 90) earnedStars = 3;
    else if (percent >= 70) earnedStars = 2;
    else if (percent >= 40) earnedStars = 1;

    setStats(prev => {
      const isNewDay = prev.lastDate !== today;
      let newStreak = prev.streak;

      if (isNewDay) {
        if (prev.lastDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      const nextKnown = { ...prev.knownWords };
      learnedWords.forEach(w => {
        const key = w.toLowerCase();
        nextKnown[key] = (nextKnown[key] || 0) + 1;
      });

      const nextPlayed = { ...prev.playedModes };
      nextPlayed[modeId] = (nextPlayed[modeId] || 0) + 1;

      const nextStats: UserStats = {
        ...prev,
        stars: prev.stars + earnedStars,
        games: prev.games + 1,
        perfect: percent >= 100 ? prev.perfect + 1 : prev.perfect,
        streak: newStreak,
        best: Math.max(prev.best, newStreak),
        lastDate: today,
        knownWords: nextKnown,
        playedModes: nextPlayed,
      };

      const unlocked = { ...prev.unlockedBadges };
      BADGES.forEach(badge => {
        if (!unlocked[badge.id] && badge.isUnlocked(nextStats)) {
          unlocked[badge.id] = today;
          sounds.playWin();
        }
      });
      nextStats.unlockedBadges = unlocked;

      // INSTANT localStorage write so F5 NEVER loses stars!
      const targetUser = currentUserKey || getSavedUser()?.username?.trim()?.toLowerCase();
      if (targetUser) {
        localStorage.setItem(`soztop_stats_${targetUser}`, JSON.stringify(nextStats));
        // AUTO-SYNC to backend in background!
        api.syncStats(nextStats).catch(() => {});
      }

      return nextStats;
    });

    return { earnedStars, percent };
  };

  return {
    currentUserKey,
    loadUserContext,
    syncWithServerData,
    resetUserContext,
    userName,
    userAvatar,
    updateProfile,
    soundEnabled,
    toggleSound,
    sets,
    activeSet,
    activeSetId,
    setActiveSetId,
    updateWordSet,
    addWordSet,
    deleteWordSet,
    stats,
    recordGameResult,
    isDark,
    toggleTheme,
  };
}
