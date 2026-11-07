import { useState, useEffect } from 'react';
import { useAppStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { HomeView } from './components/home/HomeView';
import { WordSetEditor } from './components/editor/WordSetEditor';
import { AchievementsView } from './components/achievements/AchievementsView';
import { GameContainer } from './components/games/GameContainer';
import { GameSetupModal } from './components/games/GameSetupModal';
import { PresetLibraryModal } from './components/library/PresetLibraryModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileView } from './components/profile/ProfileView';
import { Toast, useToast } from './components/ui/Toast';
import { api, type AuthUser } from './services/api';
import type { GameModeId, WordSet, WordItem } from './types';

export function App() {
  const {
    userName,
    userAvatar,
    loadUserContext,
    syncWithServerData,
    resetUserContext,
    updateProfile,
    soundEnabled,
    toggleSound,
    sets,
    activeSet,
    setActiveSetId,
    updateWordSet,
    addWordSet,
    deleteWordSet,
    stats,
    recordGameResult,
    isDark,
    toggleTheme,
  } = useAppStore();

  const { messages: toastMessages, addToast, removeToast } = useToast();

  // Current logged in user (null means user MUST see Landing page)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('soztop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'achievements' | 'game' | 'profile'>('home');
  const [activeGameMode, setActiveGameMode] = useState<GameModeId | null>(null);
  const [setupModeId, setSetupModeId] = useState<GameModeId | '?' | null>(null);
  const [filteredGameWords, setFilteredGameWords] = useState<WordItem[] | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Live Cross-Device Sync: Mount, Focus, Tab Visibility & Periodic Polling
  useEffect(() => {
    let isMounted = true;

    const checkServerAuth = async () => {
      const token = api.getToken();
      if (!token && !authUser) return;

      try {
        const res = await api.getMe();
        if (res && res.user && isMounted) {
          setAuthUser(res.user);
          localStorage.setItem('soztop_user', JSON.stringify(res.user));
          const serverSets = await api.getSets();
          if (isMounted) {
            syncWithServerData(res.user, res.stats, serverSets);
          }
        }
      } catch (err) {
        console.warn('Backend connection check:', err);
      }
    };

    // 1. Initial sync on page mount / refresh
    checkServerAuth();

    // 2. Cross-tab & Cross-window live sync when user focuses or returns to tab
    const handleSyncTrigger = () => {
      if (document.visibilityState === 'visible') {
        checkServerAuth();
      }
    };

    window.addEventListener('visibilitychange', handleSyncTrigger);
    window.addEventListener('focus', handleSyncTrigger);

    // 3. Periodic background live polling (every 10s when tab is active)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkServerAuth();
      }
    }, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleSyncTrigger);
      window.removeEventListener('focus', handleSyncTrigger);
      clearInterval(pollInterval);
    };
  }, [syncWithServerData, currentView]);

  const handleAuthSuccess = async (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem('soztop_user', JSON.stringify(user));
    try {
      const [meRes, serverSets] = await Promise.all([api.getMe(), api.getSets()]);
      syncWithServerData(user, meRes?.stats, serverSets);
    } catch {
      loadUserContext(user.username, user.full_name, user.avatar);
    }
    setIsAuthOpen(false);
    setCurrentView('home');
    addToast(`Xush kelibsiz, ${user.full_name}!`, 'success');
  };

  // Instant single-click logout with complete state wipe
  const handleLogout = () => {
    api.setToken(null);
    setAuthUser(null);
    localStorage.removeItem('soztop_user');
    localStorage.removeItem('soztop_token');
    resetUserContext();
    setCurrentView('home');
    addToast('Hisobdan chiqildi', 'info');
  };

  const handleStartGameSetup = (modeId: GameModeId | '?') => {
    // Toplamsiz o'yin o'ynamoqchi bo'lsa xabar chiqarish va to'plam qo'shishga yo'naltirish
    if (sets.length === 0) {
      addToast("O'yin o'ynash uchun avval to'plam qo'shing!", 'error');
      setIsLibraryOpen(true);
      return;
    }
    const validWords = activeSet.words.filter(w => w.w.trim() && w.tr?.trim());
    if (validWords.length < 4) {
      addToast("O'yin o'ynash uchun kamida 4 ta so'z kerak! Avval to'plamga so'z qo'shing.", 'error');
      setCurrentView('editor');
      return;
    }
    setSetupModeId(modeId);
  };

  const handleConfirmStart = (words: WordItem[], actualModeId: GameModeId) => {
    setFilteredGameWords(words);
    setActiveGameMode(actualModeId);
    setSetupModeId(null);
    setCurrentView('game');
  };

  const handleExitGame = () => {
    setActiveGameMode(null);
    setFilteredGameWords(null);
    setCurrentView('home');
  };

  const handleDeleteWordSet = (id: string) => {
    deleteWordSet(id);
    addToast("To'plam o'chirildi", 'info');
  };

  // Preset library handlers
  const handlePlayDirectly = (newSet: WordSet) => {
    addWordSet(newSet);
    setActiveSetId(newSet.id);
    setIsLibraryOpen(false);
    setSetupModeId('?');
    addToast(`"${newSet.name}" to'plami qo'shildi! So'zlar sonini tanlang`, 'success');
  };

  const handleAddToMySets = (newSet: WordSet) => {
    addWordSet(newSet);
    setActiveSetId(newSet.id);
    setIsLibraryOpen(false);
    setCurrentView('home');
    addToast(`"${newSet.name}" to'plamlaringizga saqlandi va faollashtirildi!`, 'success');
  };
  // IF USER IS NOT LOGGED IN -> ALWAYS SHOW LANDING PAGE! (No guest bypass)
  if (!authUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={(tab = 'login') => {
            setAuthTab(tab);
            setIsAuthOpen(true);
          }}
          onOpenLibrary={() => {
            setAuthTab('login');
            setIsAuthOpen(true);
          }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialTab={authTab}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        <Toast messages={toastMessages} onRemove={removeToast} />
      </>
    );
  }

  // LOGGED IN USER INTERFACE
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6 flex flex-col min-h-screen w-full">
        {/* Navigation Header */}
        <Header
          userName={authUser.full_name || userName}
          userAvatar={authUser.avatar || userAvatar}
          profileImage={authUser.profile_image}
          onOpenProfile={() => setCurrentView('profile')}
          onLogout={handleLogout}
          stats={stats}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          currentView={currentView}
          onNavigate={view => {
            setCurrentView(view);
            setActiveGameMode(null);
          }}
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 mt-6">
          {currentView === 'home' && (
            <HomeView
              activeSet={activeSet}
              allSets={sets}
              onSelectSet={setActiveSetId}
              onStartGame={handleStartGameSetup}
              onOpenEditor={() => setCurrentView('editor')}
              onOpenLibrary={() => setIsLibraryOpen(true)}
              onDeleteSet={handleDeleteWordSet}
            />
          )}

          {currentView === 'editor' && (
            <WordSetEditor
              sets={sets}
              activeSet={activeSet}
              onSelectSet={setActiveSetId}
              onUpdateSet={updateWordSet}
              onAddSet={(newSet) => {
                addWordSet(newSet);
                addToast("Yangi to'plam yaratildi!", 'success');
              }}
              onDeleteSet={handleDeleteWordSet}
              onBack={() => setCurrentView('home')}
              onOpenLibrary={() => setIsLibraryOpen(true)}
            />
          )}

          {currentView === 'achievements' && (
            <AchievementsView
              stats={stats}
              onBack={() => setCurrentView('home')}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              user={authUser}
              stats={stats}
              sets={sets}
              onBack={() => setCurrentView('home')}
              onUpdateUser={updated => {
                setAuthUser(updated);
                localStorage.setItem('soztop_user', JSON.stringify(updated));
                updateProfile(updated.full_name, updated.avatar);
                addToast('Profil saqlandi!', 'success');
              }}
              onLogout={handleLogout}
            />
          )}

          {currentView === 'game' && activeGameMode && (
            <GameContainer
              modeId={activeGameMode}
              activeSet={activeSet}
              filteredWords={filteredGameWords || undefined}
              onExit={handleExitGame}
              onRecordResult={recordGameResult}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          <p>So'zTop — Interaktiv so'z va ta'lim o'yinlari platformasi • Python FastAPI + React + TypeScript</p>
        </footer>
      </div>

      {/* Game Setup Modal */}
      {setupModeId !== null && (
        <GameSetupModal
          modeId={setupModeId}
          activeSet={activeSet}
          onClose={() => setSetupModeId(null)}
          onStart={handleConfirmStart}
        />
      )}

      {/* Preset Word Sets Library Modal */}
      <PresetLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onPlayDirectly={handlePlayDirectly}
        onAddToMySets={handleAddToMySets}
      />

      {/* Global Toast Notifications */}
      <Toast messages={toastMessages} onRemove={removeToast} />
    </div>
  );
}

export default App;
