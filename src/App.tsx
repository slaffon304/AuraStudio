import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CategoryFilter } from './components/CategoryFilter';
import { TemplateCard } from './components/TemplateCard';
import { TemplateDetailModal } from './components/TemplateDetailModal';
import { CreatePhotoModal } from './components/CreatePhotoModal';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { GalleryView } from './components/GalleryView';
import { PhotoLibraryView } from './components/PhotoLibraryView';
import { CreditPurchaseModal } from './components/CreditPurchaseModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { PhotoTemplate } from './types';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Camera,
  Layers,
  Heart,
  Users,
  Image as ImageIcon
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
    genderFilter,
    setGenderFilter
  } = useApp();

  const [previewTemplate, setPreviewTemplate] = useState<PhotoTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter templates by category, gender, and search
  const visibleTemplates = templates.filter((tmpl) => {
    if (!tmpl.isActive) return false;
    const matchesCategory =
      selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesGender =
      genderFilter === 'all'
        ? true
        : genderFilter === 'women'
        ? tmpl.gender === 'women' || tmpl.gender === 'unisex' || !tmpl.gender
        : genderFilter === 'men'
        ? tmpl.gender === 'men' || tmpl.gender === 'unisex'
        : genderFilter === 'couples'
        ? tmpl.category === 'Couple' || tmpl.gender === 'couple'
        : true;
    const matchesSearch =
      searchQuery === '' ||
      tmpl.name.ro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.name.ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesGender && matchesSearch;
  });

  const { isBackendConnected } = useApp();

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col pb-20 md:pb-10">
      {/* Top Header */}
      <Header />

      {/* Supabase Setup Notice Banner (Only shown if env vars are pending) */}
      {!isBackendConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300">
          <span>⚠️ Supabase is not configured. Pentru a activa autentificarea și stocarea de fotografii în producție, configurează <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> și <code>SUPABASE_SECRET_KEY</code> în variabilele de mediu.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: EXPLORE & BROWSE TEMPLATES */}
        {currentView === 'explore' && (
          <div>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#11131c] via-[#0b0c12] to-[#090a0f] pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
              {/* Subtle ambient lighting flares */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-24 right-10 w-96 h-96 bg-violet-600/[0.04] rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-4xl mx-auto text-center space-y-5">
                {/* Quiet Region marker (No pill badge, natural unboxed typography) */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 tracking-wide">
                  <span>🇲🇩 Moldova</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>🇷🇴 România</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">AI Photo Studio</span>
                </div>

                {/* Primary Headline */}
                <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.15]">
                  {t.heroHeadline}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-slate-300/90 max-w-xl mx-auto leading-relaxed">
                  {t.heroSubhead}
                </p>

                {/* Primary CTA and PifPaf Quick Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-7 py-3 text-xs font-bold text-slate-950 shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{t.createPhotoAction}</span>
                  </button>

                  <button
                    onClick={openCustomPinterest}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>{language === 'ru' ? 'Свой Pinterest-референс' : 'Referință Pinterest'}</span>
                  </button>

                  <button
                    onClick={openCoupleStudio}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all"
                  >
                    <Users className="h-4 w-4" />
                    <span>{language === 'ru' ? 'Для пары' : 'Pentru Cuplu'}</span>
                  </button>
                </div>

                {/* 3 Value Pillars */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Fotografii 100% private</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Rezultat gata în 10 secunde</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-amber-300" />
                    <span>Fără setări tehnice sau prompturi</span>
                  </div>
                </div>
              </div>
            </section>

            {/* INTERACTIVE BEFORE/AFTER SLIDER (PIFPAF SHOWCASE) */}
            <BeforeAfterSlider
              language={language}
              onSelectTemplate={(tmplId) => {
                const found = templates.find((t) => t.id === tmplId);
                if (found) quickSelectTemplate(found);
                else setIsCreateModalOpen(true);
              }}
              onOpenCustomPinterest={openCustomPinterest}
            />

            {/* TEMPLATES SHOWCASE SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {/* Audience / Gender Filter Bar (PifPaf Quick Filter) */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
                  {[
                    { id: 'all', ro: 'Toate', ru: 'Все', en: 'All' },
                    { id: 'women', ro: 'Pentru Ea', ru: 'Для неё', en: 'Women' },
                    { id: 'men', ro: 'Pentru El', ru: 'Для него', en: 'Men' },
                    { id: 'couples', ro: 'Cupluri', ru: 'Пары', en: 'Couples' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setGenderFilter(filter.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        genderFilter === filter.id
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {filter[language]}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="w-full sm:w-64 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Caută stil sau oraș..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400/80 transition-colors"
                  />
                </div>
              </div>

              {/* Category Filter Bar */}
              <div className="mb-6">
                <CategoryFilter />
              </div>

              {/* Templates Grid */}
              {visibleTemplates.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.01]">
                  <p className="text-xs text-slate-400">Nu am găsit șabloane pentru căutarea selectată.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setGenderFilter('all');
                    }}
                    className="mt-3 text-xs text-amber-400 hover:underline"
                  >
                    Resetează filtrele
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {visibleTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                      onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: USER GALLERY */}
        {currentView === 'gallery' && <GalleryView />}

        {/* VIEW 3: PHOTO LIBRARY */}
        {currentView === 'library' && <PhotoLibraryView />}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#07080b] py-8 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-sm">AuraStudio</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-[11px] text-slate-400">Moldova & România</span>
          </div>

          <div className="text-[11px] text-slate-500">
            {t.footerTagline}
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} AuraStudio. {t.rightsReserved}
          </div>
        </div>
      </footer>

      {/* Bottom Floating Navigation (Mobile-first app feel) */}
      <BottomNav />

      {/* MODALS */}
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

      <CreditPurchaseModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
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
