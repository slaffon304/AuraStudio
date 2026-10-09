import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { BottomNav } from './components/BottomNav';
import { CreatePhotoModal } from './components/CreatePhotoModal';
import { TemplateDetailModal } from './components/TemplateDetailModal';
import { GalleryView } from './components/GalleryView';
import { PhotoLibraryView } from './components/PhotoLibraryView';
import { CreditPurchaseModal } from './components/CreditPurchaseModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { EmailConfirmBanner } from './components/EmailConfirmBanner';
import { ProfileView } from './components/ProfileView';
import { HistoryView } from './components/HistoryView';
import { LevelsView } from './components/LevelsView';
import { LegalView } from './components/LegalView';
import { ExploreCatalog } from './components/ExploreCatalog';
import { PhotoTemplate } from './types';
import { pathToView, viewToPath } from './lib/navigation';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isPhotoModalOpen,
    setIsPhotoModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    quickSelectTemplate,
    selectedTemplate,
    openCustomPinterest,
    openEnhanceQuality,
    isBackendConnected
  } = useApp();

  const [previewTemplate, setPreviewTemplate] = useState<PhotoTemplate | null>(null);

  useEffect(() => {
    const applyPath = () => {
      setCurrentView(pathToView(window.location.pathname) as any);
    };
    applyPath();
    window.addEventListener('popstate', applyPath);
    return () => window.removeEventListener('popstate', applyPath);
  }, [setCurrentView]);

  return (
    <div className="aura-stage min-h-screen w-full overflow-x-hidden text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Fixed ambient: geometry + ember/teal — light & dark via CSS */}
      <div className="aura-ambient" aria-hidden="true" />

      <Header />
      <EmailConfirmBanner />

      {!isBackendConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-300">
          <span>
            ⚠️ Supabase is not configured. Configurează <code>VITE_SUPABASE_URL</code> și{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> pentru a activa salvarea utilizatorilor.
          </span>
        </div>
      )}

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            onGoToApp={() => {
              setCurrentView('explore');
              window.history.pushState({}, '', viewToPath('explore'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'explore' && (
          <ExploreCatalog
            onPreview={(tmpl) => setPreviewTemplate(tmpl)}
            onSelect={(tmpl) => quickSelectTemplate(tmpl)}
            onPinterest={() => openCustomPinterest()}
            onEnhance={() => openEnhanceQuality()}
          />
        )}

        {currentView === 'gallery' && (
          <div className="pb-20 md:pb-10">
            <GalleryView />
          </div>
        )}

        {currentView === 'library' && (
          <div className="pb-20 md:pb-10">
            <PhotoLibraryView />
          </div>
        )}

        {currentView === ('profile' as any) && (
          <div className="pb-20 md:pb-10 min-h-[70vh]">
            <ProfileView />
          </div>
        )}

        {currentView === ('history' as any) && (
          <div className="pb-20 md:pb-10 min-h-[70vh]">
            <HistoryView />
          </div>
        )}

        {currentView === ('levels' as any) && (
          <div className="pb-20 md:pb-10 min-h-[70vh]">
            <LevelsView />
          </div>
        )}

        {(currentView === ('privacy' as any) ||
          currentView === ('terms' as any) ||
          currentView === ('offer' as any)) && (
          <LegalView page={currentView as 'privacy' | 'terms' | 'offer'} />
        )}

        {currentView === 'admin' && (
          <div className="pb-20 md:pb-10">
            <AdminDashboard />
          </div>
        )}
      </main>

      {currentView !== 'landing' &&
        !['privacy', 'terms', 'offer'].includes(currentView as string) && <BottomNav />}

      <CreatePhotoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialTemplate={previewTemplate || selectedTemplate}
      />

      <TemplateDetailModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(tmpl) => {
          setPreviewTemplate(null);
          quickSelectTemplate(tmpl);
        }}
      />

      <CreditPurchaseModal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
