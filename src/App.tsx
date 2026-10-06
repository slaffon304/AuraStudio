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
import { CategoryFilter } from './components/CategoryFilter';
import { TemplateCard } from './components/TemplateCard';
import { ProfileView } from './components/ProfileView';
import { PhotoTemplate } from './types';
import {
  Sparkles,
  Search,
  Image as ImageIcon,
  Users
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    language,
    t,
    currentView,
    setCurrentView,
    templates,
    selectedCategory,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreditModalOpen,
    setIsCreditModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    quickSelectTemplate,
    openCustomPinterest,
    openCoupleStudio,
    isBackendConnected
  } = useApp();

  const [previewTemplate, setPreviewTemplate] = useState<PhotoTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync URL path ↔ currentView (minimal routing for /app and /app/profile)
  useEffect(() => {
    const applyPath = () => {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      if (path === '/app/profile') {
        setCurrentView('profile' as any);
      } else if (path === '/app/gallery') {
        setCurrentView('gallery');
      } else if (path === '/app/library') {
        setCurrentView('library');
      } else if (path === '/app/admin') {
        setCurrentView('admin');
      } else if (path === '/app' || path.startsWith('/app/')) {
        setCurrentView('explore');
      } else {
        setCurrentView('landing');
      }
    };
    applyPath();
    window.addEventListener('popstate', applyPath);
    return () => window.removeEventListener('popstate', applyPath);
  }, [setCurrentView]);

  const filteredTemplates = templates.filter((template) => {
    if (!template.isActive) return false;
    if (selectedCategory !== 'All' && template.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (template.name[language] || template.name.ro || '').toLowerCase();
      const desc = (template.description[language] || template.description.ro || '').toLowerCase();
      const tags = (template.tags || []).join(' ').toLowerCase();
      return name.includes(q) || desc.includes(q) || tags.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-slate-900 dark:bg-[#090a0f] dark:text-slate-100 flex flex-col transition-colors">
      <Header />

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
              window.history.pushState({}, '', '/app');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 md:pb-16 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                  {t.exploreTemplates}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'ru'
                    ? 'Выбери готовый стиль, загрузи своё фото и примерь студийный образ'
                    : language === 'ro'
                    ? 'Alege un șablon, încarcă fotografia ta și încearcă un stil de studio'
                    : 'Choose a studio look, upload your selfie, and get an instant professional portrait'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={openCustomPinterest}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pinterest Reference</span>
                </button>
                <button
                  onClick={openCoupleStudio}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    {language === 'ru' ? 'Для пары' : language === 'ro' ? 'Pentru Cuplu' : 'Couple Studio'}
                  </span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                  <span>{t.createPhotoAction}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'ru'
                        ? 'Поиск образов (глянец, кофе, резюме...)'
                        : language === 'ro'
                        ? 'Caută stiluri...'
                        : 'Search styles...'
                    }
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
              <CategoryFilter />
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                    onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'ru' ? 'Шаблоны не найдены' : 'Niciun șablon găsit'}
                </p>
              </div>
            )}
          </div>
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
          <div className="pb-20 md:pb-10 bg-[#f4f5f9] dark:bg-[#090a0f] min-h-[70vh]">
            <ProfileView />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="pb-20 md:pb-10">
            <AdminDashboard />
          </div>
        )}
      </main>

      {currentView !== 'landing' && <BottomNav />}

      <CreatePhotoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialTemplate={previewTemplate}
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

      <CreditPurchaseModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} />

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
