import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Coins, Shield, User, Globe, ChevronDown, Plus, LogOut, LogIn } from 'lucide-react';
import { Language, Currency } from '../types';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
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

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ro', label: 'Română', flag: '🇲🇩 🇷🇴' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const currencies: Currency[] = ['MDL', 'RON', 'EUR'];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#090a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('explore')}
            className="flex items-center gap-2 text-left group transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-200 text-slate-950 font-bold shadow-lg shadow-amber-500/10">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              AuraStudio
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentView('explore')}
            className={`transition-colors hover:text-white ${
              currentView === 'explore' ? 'text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.exploreTemplates}
          </button>
          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setCurrentView('gallery');
            }}
            className={`transition-colors hover:text-white ${
              currentView === 'gallery' ? 'text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.myGallery}
          </button>
          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setCurrentView('library');
            }}
            className={`transition-colors hover:text-white ${
              currentView === 'library' ? 'text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.photoLibrary}
          </button>

          {/* Admin link only visible to admin role */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 transition-colors hover:text-white ${
                currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-500/80" />
              <span>{t.adminPanel}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Credits, Language, User Auth) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Credit Balance & Top-Up Button (When logged in) */}
          {currentUser ? (
            <button
              onClick={() => setIsCreditModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-3 py-1.5 text-xs font-medium text-amber-300 transition-all hover:border-amber-500/40 hover:bg-amber-500/[0.14] active:scale-95"
              title={t.buyCredits}
            >
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold tabular-nums text-sm text-white">
                {currentUser.creditBalance}
              </span>
              <span className="hidden sm:inline text-amber-300/80">{t.credits}</span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
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
            className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-[length:200%_auto] px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-right hover:shadow-amber-500/30 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{t.createPhotoAction}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300 hover:border-white/20 hover:text-white transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span className="uppercase font-semibold text-[11px]">{language}</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-2 py-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {t.language}
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      language === l.code ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[11px] text-slate-400">{l.flag}</span>
                  </button>
                ))}

                <div className="my-1 border-t border-white/5" />
                <div className="px-2 py-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
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
                      className={`rounded-md py-1 text-[11px] font-semibold transition-colors ${
                        currency === c
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:bg-white/5'
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
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 pl-2 text-xs text-slate-300 hover:border-white/20 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-slate-800 border border-white/20 overflow-hidden flex items-center justify-center">
                  {currentUser.role === 'admin' ? (
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate text-slate-200 text-xs font-medium">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#12141c] p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="p-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{currentUser.country}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-medium">
                        {currentUser.creditBalance} {t.credits}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 pb-1 space-y-1">
                    <button
                      onClick={() => {
                        setCurrentView('gallery');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <span>{t.myGallery}</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('library');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <span>{t.photoLibrary}</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 hover:bg-amber-400/10 transition-colors"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>{t.adminPanel}</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-1 mt-1">
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
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
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
