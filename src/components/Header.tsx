import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronDown,
  FolderHeart,
  Globe2,
  Images,
  LogOut,
  Moon,
  Shield,
  Sun,
  UserRound
} from 'lucide-react';
import { Language } from '../types';
import auraStudioLogo from '../assets/images/aurastudio-logo.png';

interface HeaderProps {
  variant?: 'app' | 'marketing';
  onNavigateApp?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'app',
  onNavigateApp,
  onNavigateHome
}) => {
  const {
    t,
    language,
    setLanguage,
    currentUser,
    isLocalPreviewMode,
    signOut,
    setCurrentView,
    setIsAuthModalOpen,
    theme,
    toggleTheme
  } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMarketing = variant === 'marketing';

  const languages: { code: Language; label: string }[] = [
    { code: 'ro', label: 'Română' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ];

  const goTo = (view: 'explore' | 'gallery' | 'library' | 'profile' | 'admin') => {
    setCurrentView(view);
    setIsMenuOpen(false);
    onNavigateApp?.();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e8ee] bg-[#fbfaf8]/95 text-[#171d38] backdrop-blur-xl dark:border-white/10 dark:bg-[#090a0f]/95 dark:text-slate-100">
      <div className="mx-auto grid h-[62px] w-full max-w-[1440px] grid-cols-[auto_1fr] items-center gap-3 px-4 sm:h-[68px] sm:px-7 lg:px-10">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex w-fit shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5969f5]"
          aria-label={t.appName}
        >
          <img
            src={auraStudioLogo}
            alt="AuraStudio"
            className="h-auto w-[104px] sm:w-[160px]"
          />
        </button>

        <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2.5">
          {isMarketing && (
            <nav className="mr-auto hidden items-center gap-6 pl-8 text-[12px] font-medium text-[#737b91] lg:flex dark:text-slate-400">
              <a href="#photo-packages" className="transition-colors hover:text-[#17203d] dark:hover:text-white">{t.landingPackagesTitle}</a>
              <a href="#faq" className="transition-colors hover:text-[#17203d] dark:hover:text-white">{t.landingFaqTitle}</a>
            </nav>
          )}

          <LanguageMenu
            language={language}
            setLanguage={setLanguage}
            languages={languages}
            label={t.language}
          />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`${t.theme}: ${theme === 'dark' ? t.themeDark : t.themeLight}`}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#6e7890] transition hover:bg-white hover:text-[#4358d2] lg:flex dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {isMarketing ? (
            <>
              {currentUser ? (
                <button
                  type="button"
                  onClick={onNavigateApp}
                  className="hidden h-9 w-9 items-center justify-center rounded-full bg-white text-[#3f4fce] ring-1 ring-[#e4e8f1] sm:flex dark:bg-white/5 dark:ring-white/10"
                  aria-label={t.bottomProfile}
                >
                  <UserRound className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden whitespace-nowrap rounded-full px-2 py-2 text-[12px] font-semibold text-[#65708b] transition hover:text-[#17203d] sm:inline-flex dark:text-slate-300 dark:hover:text-white"
                >
                  {t.login}
                </button>
              )}
              <button
                type="button"
                onClick={onNavigateApp}
                className="hidden min-h-9 whitespace-nowrap rounded-full bg-[#4f67f6] px-4 text-[11px] font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-[#4058e9] active:scale-[.98] sm:inline-flex sm:items-center sm:justify-center sm:text-[12px]"
              >
                {t.landingCta}
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => currentUser ? setIsMenuOpen((open) => !open) : setIsAuthModalOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#58647c] ring-1 ring-[#e4e8f1] transition hover:text-[#4358d2] dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"
                aria-label={currentUser ? t.bottomProfile : t.login}
                aria-expanded={isMenuOpen}
              >
                {currentUser?.role === 'admin' ? <Shield className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              </button>
              {isMenuOpen && currentUser && (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#e3e7f0] bg-white p-2.5 text-[#202744] shadow-[0_18px_50px_rgba(36,48,84,.16)] dark:border-white/10 dark:bg-[#141724] dark:text-white">
                  <div className="border-b border-[#edf0f5] px-2 pb-3 pt-1">
                    <p className="truncate text-sm font-bold">{currentUser.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#858da0]">{currentUser.email}</p>
                  </div>

                  <div className="space-y-0.5 py-2">
                    <MenuAction icon={<Images className="h-4 w-4" />} label={t.myGallery} onClick={() => goTo('gallery')} />
                    <MenuAction icon={<FolderHeart className="h-4 w-4" />} label={t.profilePhotos} onClick={() => goTo('library')} />
                    {currentUser.role === 'admin' && (
                      <MenuAction icon={<Shield className="h-4 w-4" />} label={t.adminPanel} onClick={() => goTo('admin')} />
                    )}
                  </div>

                  {!isLocalPreviewMode && (
                    <button
                      type="button"
                      onClick={() => { void signOut(); setIsMenuOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" /> {t.profileSignOut}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuAction: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-[#59627a] transition hover:bg-[#f4f6fb] hover:text-[#283251] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white">
    {icon}{label}
  </button>
);

const LanguageMenu: React.FC<{
  language: Language;
  setLanguage: (language: Language) => void;
  languages: { code: Language; label: string }[];
  label: string;
}> = ({ language, setLanguage, languages, label }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-white/80 px-2 text-[10px] font-semibold text-[#6e7890] ring-1 ring-[#e5e8f0] sm:h-9 sm:px-2.5 sm:text-[11px] dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"
        aria-label={label}
        aria-expanded={open}
      >
        <Globe2 className="h-3.5 w-3.5" /> {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-32 rounded-xl border border-[#e4e8f0] bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-[#141724]">
          {languages.map((item) => (
            <button
              type="button"
              key={item.code}
              onClick={() => { setLanguage(item.code); setOpen(false); }}
              className={`block w-full rounded-lg px-2.5 py-2 text-left text-xs ${language === item.code ? 'bg-[#eef1ff] font-bold text-[#4f64e6] dark:bg-indigo-400/10 dark:text-indigo-300' : 'text-[#626c83] hover:bg-[#f5f6fa] dark:text-slate-300 dark:hover:bg-white/5'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

