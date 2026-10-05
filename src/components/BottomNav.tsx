import React from 'react';
import { useApp } from '../context/AppContext';
import { House, Images, UserRound } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, setIsAuthModalOpen, currentUser, t } = useApp();

  const openPrivateView = (view: 'gallery' | 'profile') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const items = [
    { id: 'explore' as const, label: t.bottomHome, icon: House, action: () => setCurrentView('explore') },
    { id: 'gallery' as const, label: t.bottomMy, icon: Images, action: () => openPrivateView('gallery') },
    { id: 'profile' as const, label: t.bottomProfile, icon: UserRound, action: () => openPrivateView('profile') }
  ];

  return (
    <nav aria-label={t.mainNavigation} className="md:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(.65rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="grid w-full max-w-[360px] grid-cols-3 rounded-full border border-[#e6e9f1] bg-white/95 p-1.5 shadow-[0_8px_32px_rgba(35,46,78,.15)] backdrop-blur-xl pointer-events-auto">
        {items.map(({ id, label, icon: Icon, action }) => {
          const active = currentView === id || (id === 'gallery' && currentView === 'library');
          return (
            <button
              key={id}
              onClick={action}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-[11px] font-semibold transition-colors ${
                active ? 'bg-[#edf0ff] text-[#4c62e8]' : 'text-[#82899b] hover:bg-[#f6f7fa] hover:text-[#343d58]'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.9} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
