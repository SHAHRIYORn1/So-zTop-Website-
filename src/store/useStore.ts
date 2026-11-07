import { useState, useEffect, useCallback } from 'react';
import type { WordSet, UserStats } from '../types';
import { DEFAULT_WORD_SETS } from '../data/defaultSets';
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
      if (saved) return JSON.parse(saved);
      // If first time for this user
      localStorage.setItem(`soztop_sets_${initialUsername}`, JSON.stringify(DEFAULT_WORD_SETS));
      return DEFAULT_WORD_SETS;
    } catch {
      return DEFAULT_WORD_SETS;
    }
  });

  // 4. Active Set Id
  const [activeSetId, setActiveSetId] = useState<string>(() => {
    if (!initialUsername) return '';
    try {
      const saved = localStorage.getItem(`soztop_active_${initialUsername}`);
      if (saved) return saved;
      return sets[0]?.id || 's1';
    } catch {
      return 's1';
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

    // Read sets
    try {
      const savedSets = localStorage.getItem(userSetsKey);
      if (savedSets) {
        const parsedSets = JSON.parse(savedSets);
        setSets(parsedSets);
        const savedActive = localStorage.getItem(userActiveKey);
        setActiveSetId(savedActive || parsedSets[0]?.id || '');
      } else {
        setSets(DEFAULT_WORD_SETS);
        setActiveSetId(DEFAULT_WORD_SETS[0]?.id || 's1');
        localStorage.setItem(userSetsKey, JSON.stringify(DEFAULT_WORD_SETS));
        localStorage.setItem(userActiveKey, DEFAULT_WORD_SETS[0]?.id || 's1');
      }
    } catch {
      setSets(DEFAULT_WORD_SETS);
      setActiveSetId('s1');
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
    name: "Bo'sh to'plam",
    src: 'auto',
    to: 'uz',
    words: [],
  };

  const updateWordSet = (updated: WordSet) => {
    setSets(prev => {
      const nextSets = prev.map(s => (s.id === updated.id ? updated : s));
      if (currentUserKey) {
        localStorage.setItem(`soztop_sets_${currentUserKey}`, JSON.stringify(nextSets));
        // Auto-sync in background!
        api.syncSets(nextSets).catch(() => {});
      }
      return nextSets;
    });
  };

  const addWordSet = (newSet: WordSet) => {
    setSets(prev => {
      const nextSets = [newSet, ...prev];
      if (currentUserKey) {
        localStorage.setItem(`soztop_sets_${currentUserKey}`, JSON.stringify(nextSets));
        localStorage.setItem(`soztop_active_${currentUserKey}`, newSet.id);
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
      if (currentUserKey) {
        localStorage.setItem(`soztop_sets_${currentUserKey}`, JSON.stringify(filtered));
        // Auto-sync in background!
        api.syncSets(filtered).catch(() => {});
      }
      if (activeSetId === id) {
        const nextActive = filtered[0]?.id || '';
        setActiveSetId(nextActive);
        if (currentUserKey) {
          localStorage.setItem(`soztop_active_${currentUserKey}`, nextActive);
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
      if (currentUserKey) {
        localStorage.setItem(`soztop_stats_${currentUserKey}`, JSON.stringify(nextStats));
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
