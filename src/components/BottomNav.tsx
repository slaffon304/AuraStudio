import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Images, User, LogIn } from 'lucide-react';
import { viewToPath, setAfterAuthRedirect } from '../lib/navigation';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, setIsAuthModalOpen, currentUser, language } = useApp();

  const go = (view: 'explore' | 'profile' | 'gallery') => {
    if ((view === 'profile' || view === 'gallery') && !currentUser) {
      setAfterAuthRedirect(view);
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view as any);
    window.history.pushState({}, '', viewToPath(view));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const item = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
      active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
    }`;

  const homeLabel = language === 'ru' ? 'Главная' : language === 'en' ? 'Home' : 'Acasă';
  const galleryLabel = language === 'ru' ? 'Галерея' : language === 'en' ? 'Gallery' : 'Galerie';
  const profileLabel = language === 'ru' ? 'Профиль' : language === 'en' ? 'Profile' : 'Profil';

  const galleryActive = currentView === 'gallery';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-[max(6px,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto mb-1.5 flex max-w-[200px] items-center rounded-full bg-white/95 dark:bg-[#151822]/95 shadow-[0_4px_20px_rgba(20,30,60,0.12)] border border-slate-200/70 dark:border-white/10 backdrop-blur-xl pointer-events-auto px-2 py-1">
        <button
          type="button"
          onClick={() => go('explore')}
          className={item(currentView === 'explore' || currentView === 'landing')}
          aria-label={homeLabel}
        >
          <Home className="h-4 w-4" strokeWidth={currentView === 'explore' || currentView === 'landing' ? 2.5 : 2} />
          <span className="text-[8px] font-medium leading-none">{homeLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => go('gallery')}
          className={item(galleryActive)}
          aria-label={galleryLabel}
        >
          <Images className="h-4 w-4" strokeWidth={galleryActive ? 2.5 : 2} />
          <span className="text-[8px] font-medium leading-none">{galleryLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => go('profile')}
          className={item(currentView === ('profile' as any))}
          aria-label={profileLabel}
        >
          {currentUser ? (
            <User className="h-4 w-4" strokeWidth={currentView === ('profile' as any) ? 2.5 : 2} />
          ) : (
            <LogIn className="h-4 w-4" strokeWidth={2} />
          )}
          <span className="text-[8px] font-medium leading-none">{profileLabel}</span>
        </button>
      </div>
    </div>
  );
};
