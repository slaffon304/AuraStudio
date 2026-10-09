import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  User,
  LogOut,
  Sun,
  Moon,
  Shield,
  Menu,
  X,
  Images,
  Download
} from 'lucide-react';
import { Language } from '../types';
import logoImg from '../assets/images/aurastudio-logo.png';
import { viewToPath, setAfterAuthRedirect } from '../lib/navigation';
import {
  canPromptInstall,
  isStandalone,
  promptInstall,
  subscribePwaInstall
} from '../lib/pwaInstall';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    currentUser,
    session,
    signOut,
    currentView,
    setCurrentView,
    setIsAuthModalOpen,
    setIsPhotoModalOpen
  } = useApp();

  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const languages: { code: Language; label: string }[] = [
    { code: 'ro', label: 'Română' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ];

  const isAppShell =
    currentView !== 'landing' &&
    currentView !== 'privacy' &&
    currentView !== 'terms' &&
    currentView !== 'offer';

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setIsBurgerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const sync = () => setCanInstall(canPromptInstall() && !isStandalone());
    sync();
    return subscribePwaInstall(sync);
  }, []);

  const navigate = (
    view: 'landing' | 'explore' | 'profile' | 'gallery' | 'library' | 'admin' | 'history' | 'levels'
  ) => {
    setCurrentView(view as any);
    window.history.pushState({}, '', viewToPath(view as any));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsBurgerOpen(false);
  };

  const goLanding = () => navigate('landing');
  const goApp = () => navigate('explore');

  const goProfile = () => {
    if (!session) {
      setAfterAuthRedirect('profile');
      setIsAuthModalOpen(true);
      return;
    }
    navigate('profile');
  };

  const goTariffs = () => {
    if (currentView !== 'landing') {
      navigate('landing');
      setTimeout(() => {
        document.getElementById('photo-packages')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('photo-packages')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onPhotoPill = () => {
    if (isAppShell) {
      if (!session) {
        setIsAuthModalOpen(true);
        return;
      }
      setIsPhotoModalOpen(true);
    } else {
      goApp();
    }
  };

  const photoLabel = language === 'ru' ? 'фото' : language === 'en' ? 'photo' : 'foto';
  const photosDisplay = currentUser
    ? String(currentUser.photoBalance ?? 0)
    : session
    ? '…'
    : '0';

  const tariffsLabel = language === 'ru' ? 'Тарифы' : language === 'en' ? 'Pricing' : 'Tarife';
  const profileLabel = language === 'ru' ? 'Профиль' : language === 'en' ? 'Profile' : 'Profil';
  const loginLabel = language === 'ru' ? 'Вход' : language === 'en' ? 'Log in' : 'Autentificare';
  const installLabel =
    language === 'ru'
      ? 'Установить приложение'
      : language === 'en'
      ? 'Install app'
      : 'Instalează aplicația';
  const themeLabel =
    theme === 'light'
      ? language === 'ru'
        ? 'Тёмная тема'
        : language === 'en'
        ? 'Dark mode'
        : 'Temă închisă'
      : language === 'ru'
      ? 'Светлая тема'
      : language === 'en'
      ? 'Light mode'
      : 'Temă deschisă';

  const menuPanel =
    'absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#12141c] p-2 shadow-2xl z-[110]';

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-[100] w-full border-b border-transparent bg-transparent backdrop-blur-md transition-colors"
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={goLanding}
          className="flex items-center shrink-0 transition-transform active:scale-[0.98] cursor-pointer"
          aria-label={t.appName}
        >
          <img
            src={logoImg}
            alt="AuraStudio"
            className="h-8 sm:h-9 w-auto max-w-[150px] sm:max-w-[180px] object-contain object-left dark:brightness-110"
          />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={goTariffs}
            className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1.5 sm:px-2"
          >
            {tariffsLabel}
          </button>

          <button
            type="button"
            onClick={onPhotoPill}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 text-[11px] sm:text-xs font-bold transition-all tabular-nums backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              {photosDisplay} {photoLabel}
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBurgerOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
              aria-label="Menu"
              aria-expanded={isBurgerOpen}
            >
              {isBurgerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {isBurgerOpen && (
              <div className={menuPanel}>
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.language}
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${
                      language === l.code
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="uppercase text-[10px] font-bold text-slate-400">{l.code}</span>
                  </button>
                ))}

                <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />

                <button
                  type="button"
                  onClick={() => toggleTheme()}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {theme === 'light' ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>{themeLabel}</span>
                </button>

                {canInstall && (
                  <>
                    <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />
                    <button
                      type="button"
                      onClick={async () => {
                        setIsBurgerOpen(false);
                        await promptInstall();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{installLabel}</span>
                    </button>
                  </>
                )}

                <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />

                <button
                  type="button"
                  onClick={() => goProfile()}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{currentUser ? profileLabel : loginLabel}</span>
                </button>

                {currentUser && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('gallery')}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <Images className="h-3.5 w-3.5" />
                      <span>{t.myGallery}</span>
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => navigate('admin')}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>{t.adminPanel}</span>
                      </button>
                    )}
                    <div className="border-t border-slate-100 dark:border-white/5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBurgerOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
