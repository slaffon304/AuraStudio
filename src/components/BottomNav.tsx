import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, LayoutGrid, User, LogIn } from 'lucide-react';
import { viewToPath, setAfterAuthRedirect } from '../lib/navigation';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, setIsAuthModalOpen, currentUser, language } = useApp();

  const go = (view: 'explore' | 'profile' | 'gallery' | 'library') => {
    if ((view === 'profile' || view === 'gallery' || view === 'library') && !currentUser) {
      setAfterAuthRedirect(view);
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view as any);
    window.history.pushState({}, '', viewToPath(view));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tab = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center min-h-[48px] transition-colors ${
      active ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500'
    }`;

  const profileLabel = language === 'ru' ? 'Профиль' : language === 'en' ? 'Profile' : 'Profil';
  const homeLabel = language === 'ru' ? 'Главная' : language === 'en' ? 'Home' : 'Acasă';
  const catalogLabel = language === 'ru' ? 'Каталог' : language === 'en' ? 'Catalog' : 'Catalog';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="mx-auto mb-3 flex max-w-[280px] items-center rounded-full bg-white/95 dark:bg-[#151822]/95 shadow-[0_8px_30px_rgba(20,30,60,0.15)] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl pointer-events-auto px-1.5 py-1.5">
        <button type="button" onClick={() => go('explore')} className={tab(currentView === 'explore')}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">{homeLabel}</span>
        </button>
        <button type="button" onClick={() => go('explore')} className={tab(false)}>
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">{catalogLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => go('profile')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 transition-all ${
            currentView === ('profile' as any)
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
              : 'text-slate-500'
          }`}
        >
          {currentUser ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          <span className="text-[12px] font-semibold">{profileLabel}</span>
        </button>
      </div>
    </div>
  );
};
