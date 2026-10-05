import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Sparkles, Images, FolderHeart, Shield, User, LogIn } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, setIsCreateModalOpen, setIsAuthModalOpen, currentUser, t } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Explore */}
        <button
          onClick={() => setCurrentView('explore')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            currentView === 'explore' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{t.exploreTemplates.split(' ')[0]}</span>
        </button>

        {/* Tab 2: Gallery */}
        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setCurrentView('gallery');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            currentView === 'gallery' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Images className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{t.myGallery.split(' ')[0]}</span>
        </button>

        {/* Tab 3: Center Create Button (Prominent Hit Target) */}
        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setIsCreateModalOpen(true);
          }}
          className="min-h-[48px] flex flex-col items-center justify-center group"
          aria-label={t.createPhotoAction}
        >
          <div className="flex h-11 w-11 -mt-4 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/30 transition-transform active:scale-95 group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-amber-300 font-semibold">{t.createPhotoAction.split(' ')[0]}</span>
        </button>

        {/* Tab 4: Photo Library */}
        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setCurrentView('library');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            currentView === 'library' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderHeart className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{t.photoLibrary.split(' ')[0]}</span>
        </button>

        {/* Tab 5: Admin / User / LogIn */}
        <button
          onClick={() => {
            if (!currentUser) {
              setIsAuthModalOpen(true);
            } else if (currentUser.role === 'admin') {
              setCurrentView('admin');
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentUser ? (
            currentUser.role === 'admin' ? (
              <>
                <Shield className="h-5 w-5 text-amber-400" />
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Admin</span>
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Profil</span>
              </>
            )
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Login</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
