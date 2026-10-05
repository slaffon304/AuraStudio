import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Coins, Shield, User, Globe, ChevronDown, Plus, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { Language, Currency } from '../types';

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
    setIsCreditModalOpen,
    setIsCreateModalOpen,
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.07] bg-white/90 dark:bg-[#090a0f]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('explore')}
            className="flex items-center gap-2 text-left group transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold shadow-md shadow-amber-500/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              AuraStudio
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => {
              setCurrentView('explore');
              const el = document.getElementById('templates-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-amber-600 dark:hover:text-white ${
              currentView === 'explore'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'ru' ? 'Фотосессии' : language === 'en' ? 'Templates' : 'Șabloane'}
          </button>

          <button
            onClick={() => {
              setCurrentView('explore');
              const el = document.getElementById('before-after-showcase');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-white transition-colors"
          >
            {language === 'ru' ? 'До / После' : language === 'en' ? 'Before & After' : 'Înainte / După'}
          </button>

          <button
            onClick={() => {
              setCurrentView('explore');
              const el = document.getElementById('pricing-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-white transition-colors"
          >
            {language === 'ru' ? 'Тарифы' : language === 'en' ? 'Pricing' : 'Prețuri'}
          </button>

          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setCurrentView('gallery');
            }}
            className={`transition-colors hover:text-amber-600 dark:hover:text-white ${
              currentView === 'gallery'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.myGallery}
          </button>

          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setCurrentView('library');
            }}
            className={`transition-colors hover:text-amber-600 dark:hover:text-white ${
              currentView === 'library'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.photoLibrary}
          </button>

          {/* Admin link only visible to admin role */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 transition-colors hover:text-amber-600 dark:hover:text-white ${
                currentView === 'admin'
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span>{t.adminPanel}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Theme Toggle, Credits, Language, User Auth) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
            title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-slate-700" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Credit Balance & Top-Up Button (When logged in) */}
          {currentUser ? (
            <button
              onClick={() => setIsCreditModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95 shadow-2xs"
              title={t.buyCredits}
            >
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-bold tabular-nums text-sm text-slate-900 dark:text-white">
                {currentUser.creditBalance}
              </span>
              <span className="hidden sm:inline opacity-80">{t.credits}</span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300">
                <Plus className="h-3 w-3" />
              </div>
            </button>
          ) : null}

          {/* Primary Create Button (Desktop) */}
          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsCreateModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-amber-500 dark:via-amber-400 dark:to-amber-500 text-white dark:text-slate-950 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400 dark:text-slate-950" />
            <span className="whitespace-nowrap">{t.createPhotoAction}</span>
          </button>

          {/* Language & Currency Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:border-white/20 transition-colors shadow-2xs"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="uppercase font-bold text-[11px]">{language}</span>
              <span className="text-[11px] text-slate-400">·</span>
              <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400">{currency}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
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
                          ? 'bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login Trigger */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-semibold line-clamp-1 max-w-[90px]">
                  {currentUser.name || 'Cont'}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <span>{t.credits}:</span>
                      <span>{currentUser.creditBalance}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setCurrentView('gallery');
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <span>{t.myGallery}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setCurrentView('library');
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <span>{t.photoLibrary}</span>
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
                  </div>

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
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 text-white dark:bg-white/10 dark:hover:bg-white/15 px-3 py-2 text-xs font-bold transition-all hover:bg-black active:scale-95 shadow-xs"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
