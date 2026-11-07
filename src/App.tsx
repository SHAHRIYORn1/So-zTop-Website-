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

  // Sync with backend on mount if token exists
  useEffect(() => {
    const checkServerAuth = async () => {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setAuthUser(res.user);
          localStorage.setItem('soztop_user', JSON.stringify(res.user));
          loadUserContext(res.user.username, res.user.full_name, res.user.avatar);
        }
      } catch (err) {
        console.warn('Backend connection check:', err);
      }
    };
    if (authUser) {
      checkServerAuth();
    }
  }, []);

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem('soztop_user', JSON.stringify(user));
    loadUserContext(user.username, user.full_name, user.avatar);
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
    const validWords = activeSet.words.filter(w => w.w.trim() && w.tr?.trim());
    if (validWords.length < 4) {
      addToast("O'yin uchun kamida 4 ta so'zli to'plam bo'lishi kerak! To'plam yarating yoki qo'shing", 'error');
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
    if (authUser) {
      api.syncStats(stats);
    }
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
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenLibrary={() => setIsAuthOpen(true)}
        />
        <AuthModal
          isOpen={isAuthOpen}
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
