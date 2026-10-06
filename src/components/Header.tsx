import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Coins, Shield, User, Globe, ChevronDown, Plus, LogOut, LogIn, Sun, Moon } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.07] bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-left transition-transform active:scale-95 cursor-pointer"
            aria-label={t.appName}
          >
            <img
              src={logoImg}
              alt="AuraStudio"
              className="h-8 sm:h-9 w-auto max-w-[150px] sm:max-w-[180px] object-contain dark:brightness-110"
            />
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <a
            href="#how-it-works"
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.landingHowTitle || (language === 'ru' ? 'Как это работает' : language === 'en' ? 'How it works' : 'Cum funcționează')}
          </a>
          <a
            href="#photo-packages"
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.landingPackagesTitle || (language === 'ru' ? 'Пакеты фото' : language === 'en' ? 'Photo packs' : 'Pachete foto')}
          </a>
          <a
            href="#faq"
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.landingFaqTitle || 'FAQ'}
          </a>
        </nav>

        {/* Zone 3: Primary Actions (Тарифы, 1 фото pill, User Avatar, Theme/Lang) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tariffs link (visible on all screens like in screenshot) */}
          <button
            onClick={() => setIsCreditModalOpen(true)}
            className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-1"
          >
            {language === 'ru' ? 'Тарифы' : language === 'en' ? 'Pricing' : 'Tarife'}
          </button>

          {/* Blue Credit Pill (PifPaf AI style: ✨ 1 фото) */}
          <button
            onClick={() => setIsCreditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 text-xs font-bold transition-all shadow-2xs"
            title={t.buyCredits}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              {currentUser
                ? `${currentUser.creditBalance} ${language === 'ru' ? 'фото' : language === 'en' ? 'photos' : 'foto'}`
                : language === 'ru'
                ? '1 фото'
                : language === 'en'
                ? '1 photo'
                : '1 foto'}
            </span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
            title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-slate-700" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:border-white/20 transition-colors shadow-2xs"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="uppercase font-bold text-[11px]">{language}</span>
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
          ) : null}
        </div>
      </div>
    </header>
  );
};
