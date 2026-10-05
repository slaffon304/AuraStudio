import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Coins,
  Shield,
  UserRound,
  Globe2,
  ChevronDown,
  LogOut,
  Images,
  FolderHeart,
  Languages,
  Moon,
  Sun
} from 'lucide-react';
import { Currency, Language } from '../types';

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
    currency,
    setCurrency,
    currentUser,
    isLocalPreviewMode,
    signOut,
    setCurrentView,
    setIsCreditModalOpen,
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
  const currencies: Currency[] = ['MDL', 'RON', 'EUR'];

  const goTo = (view: 'explore' | 'gallery' | 'library' | 'profile' | 'admin') => {
    setCurrentView(view);
    setIsMenuOpen(false);
    onNavigateApp?.();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e7f0] bg-[#eef1f8]/95 text-[#171d38] backdrop-blur-xl dark:border-white/10 dark:bg-[#090a0f]/95 dark:text-slate-100">
      <div className="mx-auto flex h-[58px] max-w-6xl items-center justify-between px-3 sm:px-6">
        {isMarketing ? (
          <>
            <button
              onClick={onNavigateHome}
              className="flex shrink-0 items-center gap-2 text-left"
              aria-label="AuraStudio home"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#536dfe] text-white shadow-sm shadow-blue-200 sm:h-8 sm:w-8 sm:rounded-xl">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="text-[15px] font-extrabold tracking-tight text-[#17203d] sm:text-[17px] dark:text-white">AuraStudio</span>
            </button>

            <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#737b91] md:flex dark:text-slate-400">
              <button onClick={onNavigateApp} className="transition-colors hover:text-[#17203d] dark:hover:text-white">{t.exploreTemplates}</button>
              <a href="#how-it-works" className="transition-colors hover:text-[#17203d] dark:hover:text-white">{t.landingHowTitle}</a>
              <a href="#examples" className="transition-colors hover:text-[#17203d] dark:hover:text-white">{t.landingSamplesTitle}</a>
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageMenu
                language={language}
                setLanguage={setLanguage}
                languages={languages}
              />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`${t.theme}: ${theme === 'dark' ? t.themeDark : t.themeLight}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6e7890] transition hover:bg-white hover:text-[#4358d2] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              {currentUser ? (
                <button
                  onClick={() => onNavigateApp?.()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3f4fce] ring-1 ring-[#e4e8f1] dark:bg-white/5 dark:ring-white/10"
                  aria-label={t.bottomProfile}
                >
                  <UserRound className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden rounded-full px-3 py-2 text-[13px] font-semibold text-[#65708b] hover:text-[#17203d] dark:text-slate-300 dark:hover:text-white sm:inline-flex"
                >
                  {t.login}
                </button>
              )}
              <button
                onClick={onNavigateApp}
                className="whitespace-nowrap rounded-full bg-[#4f67f6] px-3 py-2 text-[10px] font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-[#4058e9] active:scale-[.98] sm:px-4 sm:text-[12px]"
              >
                {t.landingCta}
              </button>
            </div>
          </>
        ) : (
          <div className="grid w-full grid-cols-3 items-center">
            <div className="justify-self-start">
              {currentUser && (
                <button
                  onClick={() => setIsCreditModalOpen(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#e3e9ff] px-3 text-[11px] font-bold text-[#4c62de]"
                  aria-label={`${currentUser.creditBalance} ${t.credits}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{currentUser.creditBalance}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setCurrentView('explore')}
              className="flex items-center justify-center gap-1.5 justify-self-center text-left"
              aria-label="AuraStudio home"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#536dfe] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-[15px] font-extrabold tracking-tight text-[#17203d] dark:text-white">AuraStudio</span>
            </button>

            <div className="relative flex items-center gap-2 justify-self-end">
              <LanguageMenu
                language={language}
                setLanguage={setLanguage}
                languages={languages}
              />
              <button
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
                    <button
                      onClick={() => { setIsCreditModalOpen(true); setIsMenuOpen(false); }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eef1ff] px-2.5 py-1 text-xs font-semibold text-[#4f64e6]"
                    >
                      <Coins className="h-3.5 w-3.5" /> {currentUser.creditBalance} {t.credits}
                    </button>
                  </div>

                  <div className="space-y-0.5 py-2">
                    <MenuAction icon={<Images className="h-4 w-4" />} label={t.myGallery} onClick={() => goTo('gallery')} />
                    <MenuAction icon={<FolderHeart className="h-4 w-4" />} label={t.profilePhotos} onClick={() => goTo('library')} />
                    {currentUser.role === 'admin' && (
                      <MenuAction icon={<Shield className="h-4 w-4" />} label={t.adminPanel} onClick={() => goTo('admin')} />
                    )}
                  </div>

                  <div className="border-t border-[#edf0f5] px-2 py-2">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#858da0]">
                      <Languages className="h-3.5 w-3.5" /> {t.language}
                    </div>
                    <div className="flex gap-1">
                      {languages.map((item) => (
                        <button
                          key={item.code}
                          onClick={() => setLanguage(item.code)}
                          className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold ${language === item.code ? 'bg-[#536dfe] text-white' : 'bg-[#f4f6fb] text-[#737b91]'}`}
                        >
                          {item.code.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="mb-1 mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#858da0]">
                      <Globe2 className="h-3.5 w-3.5" /> {t.currency}
                    </div>
                    <div className="flex gap-1">
                      {currencies.map((item) => (
                        <button
                          key={item}
                          onClick={() => setCurrency(item)}
                          className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold ${currency === item ? 'bg-[#536dfe] text-white' : 'bg-[#f4f6fb] text-[#737b91]'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="mt-3 flex w-full items-center justify-between rounded-xl bg-[#f4f6fb] px-2.5 py-2 text-[11px] font-semibold text-[#65708a] dark:bg-white/5 dark:text-slate-300"
                    >
                      <span>{t.theme}</span>
                      <span className="inline-flex items-center gap-1.5 text-[#4e64e6] dark:text-indigo-300">
                        {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                        {theme === 'dark' ? t.themeDark : t.themeLight}
                      </span>
                    </button>
                  </div>

                  {!isLocalPreviewMode && (
                    <button
                      onClick={() => { void signOut(); setIsMenuOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-rose-500 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> {t.profileSignOut}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
}> = ({ language, setLanguage, languages }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1.5 text-[10px] font-semibold text-[#6e7890] ring-1 ring-[#e5e8f0] sm:px-2.5 sm:py-2 sm:text-[11px] dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"
        aria-label="Select language"
      >
        <Globe2 className="h-3.5 w-3.5" /> {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-32 rounded-xl border border-[#e4e8f0] bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-[#141724]">
          {languages.map((item) => (
            <button
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
