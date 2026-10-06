import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, User, Globe, ChevronDown, LogOut, LogIn, Sun, Moon, Shield } from 'lucide-react';
import { Language, Currency } from '../types';
import logoImg from '../assets/images/aurastudio-logo.png';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    currentUser,
    signOut,
    currentView,
    setCurrentView,
    setIsAuthModalOpen
  } = useApp();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'ro', label: 'Română' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ];

  const currencies: Currency[] = ['MDL', 'RON', 'EUR'];

  const goLanding = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goApp = () => {
    setCurrentView('explore');
    window.history.pushState({}, '', '/app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goProfile = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView('profile' as any);
    window.history.pushState({}, '', '/app/profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goTariffs = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      window.history.pushState({}, '', '/');
      setTimeout(() => {
        document.getElementById('photo-packages')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById('photo-packages')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const photoLabel =
    language === 'ru' ? 'фото' : language === 'en' ? 'photo' : 'foto';
  const photosCount = currentUser ? currentUser.creditBalance : 1;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.07] bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={goLanding}
          className="flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
          aria-label={t.appName}
        >
          <img
            src={logoImg}
            alt="AuraStudio"
            className="h-7 sm:h-9 w-auto max-w-[140px] sm:max-w-[180px] object-contain dark:brightness-110"
          />
        </button>

        {/* Right cluster: Tariffs · Photo pill · Profile (+ lang on sm+) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={goTariffs}
            className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1"
          >
            {language === 'ru' ? 'Тарифы' : language === 'en' ? 'Pricing' : 'Tarife'}
          </button>

          {/* Photo balance pill → /app */}
          <button
            type="button"
            onClick={goApp}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 text-[11px] sm:text-xs font-bold transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              {photosCount} {photoLabel}
            </span>
          </button>

          {/* Language — desktop */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:border-white/20 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="uppercase font-bold text-[11px]">{language}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] p-2 shadow-2xl z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.language}
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLangMenuOpen(false);
                    }}
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
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.currency}
                </div>
                <div className="grid grid-cols-3 gap-1 p-1">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setIsLangMenuOpen(false);
                      }}
                      className={`rounded-lg py-1.5 text-[11px] font-bold transition-colors ${
                        currency === c
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsLangMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
                  <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile icon — always visible */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsUserMenuOpen(!isUserMenuOpen);
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Profile"
            >
              {currentUser ? (
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </button>

            {isUserMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] p-2 shadow-2xl z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name || 'Account'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    goProfile();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{language === 'ru' ? 'Профиль' : language === 'en' ? 'Profile' : 'Profil'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setCurrentView('gallery');
                    window.history.pushState({}, '', '/app/gallery');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <span>{t.myGallery}</span>
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentView('admin');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>{t.adminPanel}</span>
                  </button>
                )}
                <div className="border-t border-slate-100 dark:border-white/5 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
