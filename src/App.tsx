import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CategoryFilter } from './components/CategoryFilter';
import { TemplateCard } from './components/TemplateCard';
import { TemplateDetailModal } from './components/TemplateDetailModal';
import { CreatePhotoModal } from './components/CreatePhotoModal';
import { GalleryView } from './components/GalleryView';
import { PhotoLibraryView } from './components/PhotoLibraryView';
import { CreditPurchaseModal } from './components/CreditPurchaseModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { PhotoTemplate, TemplateCategory } from './types';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Heart,
  ImagePlus,
  MapPin,
  Search,
  LogOut,
  Sparkles,
  UserRound,
  WandSparkles
} from 'lucide-react';

type Navigate = (path: '/' | '/app') => void;

const MainAppContent: React.FC<{ navigate: Navigate }> = ({ navigate }) => {
  const {
    t,
    language,
    currency,
    setLanguage,
    setCurrency,
    currentView,
    setCurrentView,
    templates,
    selectedCategory,
    setSelectedCategory,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreditModalOpen,
    setIsCreditModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isLocalPreviewMode,
    currentUser,
    signOut,
    quickSelectTemplate,
    openCustomPinterest,
    openCoupleStudio,
    genderFilter,
    setGenderFilter
  } = useApp();

  const [previewTemplate, setPreviewTemplate] = useState<PhotoTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const trendingRailRef = useRef<HTMLDivElement>(null);
  const railDragStartRef = useRef<{ x: number; left: number } | null>(null);
  const railWasDraggedRef = useRef(false);

  const activeTemplates = useMemo(() => templates.filter((template) => template.isActive), [templates]);
  const visibleTemplates = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return activeTemplates.filter((template) => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesGender = genderFilter === 'all'
        || (genderFilter === 'women' && (template.gender === 'women' || template.gender === 'unisex' || !template.gender))
        || (genderFilter === 'men' && (template.gender === 'men' || template.gender === 'unisex'))
        || (genderFilter === 'couples' && (template.category === 'Couple' || template.gender === 'couple'));
      const searchableText = [
        template.name.ro,
        template.name.ru,
        template.name.en,
        template.description.ro,
        template.description.ru,
        template.description.en,
        template.category,
        ...(template.tags || [])
      ].join(' ').toLocaleLowerCase();
      return matchesCategory && matchesGender && (!query || searchableText.includes(query));
    });
  }, [activeTemplates, selectedCategory, searchQuery, genderFilter]);

  const trendingTemplates = useMemo(() => {
    const matchesGender = (template: PhotoTemplate) => genderFilter === 'all'
      || (genderFilter === 'women' && (template.gender === 'women' || template.gender === 'unisex' || !template.gender))
      || (genderFilter === 'men' && (template.gender === 'men' || template.gender === 'unisex'))
      || (genderFilter === 'couples' && (template.category === 'Couple' || template.gender === 'couple'));
    const curated = activeTemplates.filter((template) => matchesGender(template) && (
      template.category === 'Trending' || (template.tags || []).some((tag) => tag.toLowerCase() === 'trending')
    ));
    const rest = activeTemplates.filter((template) => matchesGender(template) && !curated.some((item) => item.id === template.id));
    return [...curated, ...rest].slice(0, 8);
  }, [activeTemplates, genderFilter]);

  const quickCollections: { category: TemplateCategory; label: string; image: PhotoTemplate | undefined; icon: React.ElementType }[] = [
    { category: 'Heritage', label: t.appQuickMoldova, image: activeTemplates.find((template) => template.category === 'Heritage'), icon: MapPin },
    { category: 'Couple', label: t.appQuickCouple, image: activeTemplates.find((template) => template.category === 'Couple'), icon: Heart },
    { category: 'Business', label: t.appQuickBusiness, image: activeTemplates.find((template) => template.category === 'Business'), icon: BriefcaseBusiness }
  ];

  const scrollTrending = (direction: -1 | 1) => {
    trendingRailRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });
  };

  const startTrendingDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    railDragStartRef.current = { x: event.clientX, left: trendingRailRef.current?.scrollLeft || 0 };
    railWasDraggedRef.current = false;
  };

  const moveTrendingDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const start = railDragStartRef.current;
    if (!start || event.buttons !== 1 || !trendingRailRef.current) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) > 4) railWasDraggedRef.current = true;
    if (railWasDraggedRef.current) {
      event.preventDefault();
      trendingRailRef.current.scrollLeft = start.left - distance;
    }
  };

  const endTrendingDrag = () => {
    railDragStartRef.current = null;
    window.setTimeout(() => { railWasDraggedRef.current = false; }, 0);
  };

  const preventClickAfterDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (railWasDraggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const openPrivateView = (view: 'gallery' | 'library' | 'profile') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#eef1f8] pb-28 text-[#1d2540] transition-colors md:pb-8 dark:bg-[#090a0f] dark:text-slate-100">
      <Header variant="app" onNavigateHome={() => navigate('/')} onNavigateApp={() => navigate('/app')} />
      {isLocalPreviewMode && (
        <div role="status" className="mx-auto mt-3 max-w-[1180px] px-4 text-[10px] leading-relaxed text-indigo-700 sm:px-6 dark:text-indigo-300">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 dark:border-indigo-400/20 dark:bg-indigo-400/[0.06]">
            {t.localPreviewBanner}
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
        {currentView === 'explore' && (
          <div>
            <div className="mx-auto max-w-[720px] pt-4 sm:pt-6">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#9aa2b2]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.appSearchPlaceholder}
                  className="h-11 w-full rounded-full border border-[#e3e7f0] bg-white px-11 text-[12px] text-[#29324c] shadow-[0_2px_8px_rgba(42,55,91,.035)] outline-none placeholder:text-[#a0a7b6] focus:border-[#aebafb] focus:ring-4 focus:ring-[#536dfe]/[0.08] sm:h-12 sm:text-[13px] dark:border-white/10 dark:bg-[#141724] dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>
              <div className="mt-2 sm:mt-3">
                <CategoryFilter />
              </div>
              <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1" aria-label={t.genderFilterLabel}>
                {[
                  { id: 'all' as const, label: t.genderFilterAll },
                  { id: 'women' as const, label: t.genderFilterWomen },
                  { id: 'men' as const, label: t.genderFilterMen },
                  { id: 'couples' as const, label: t.genderFilterCouples }
                ].map((item) => (
                  <button key={item.id} type="button" onClick={() => setGenderFilter(item.id)} aria-pressed={genderFilter === item.id} className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition sm:text-[11px] ${genderFilter === item.id ? 'border-[#536dfe] bg-[#536dfe] text-white' : 'border-[#e2e6ef] bg-white text-[#7f899e] hover:border-[#b8c1e1] dark:border-white/10 dark:bg-[#141724] dark:text-slate-400 dark:hover:border-white/20'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <section aria-label={t.appCollectionsLabel} className="mt-4 grid grid-cols-3 gap-2.5 sm:mt-5 sm:gap-3">
              {quickCollections.map(({ category, label, image, icon: Icon }) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="group relative h-[88px] overflow-hidden rounded-[18px] bg-white text-left ring-1 ring-[#e5e8f0] transition active:scale-[.985] sm:h-[112px] sm:rounded-[20px] dark:bg-[#141724] dark:ring-white/10"
                >
                  {image && <img src={image.previewImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-[#10182d]/80 via-[#10182d]/18 to-[#10182d]/5" />
                  <span className="absolute left-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#5268ec] shadow-sm sm:left-3 sm:top-3 sm:h-7 sm:w-7">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="absolute inset-x-2 bottom-2.5 line-clamp-2 text-[9px] font-bold leading-tight text-white sm:inset-x-3 sm:bottom-3 sm:text-[11px]">
                    {label}
                  </span>
                </button>
              ))}
            </section>

            <div className="mt-3 flex gap-2">
              <button type="button" onClick={openCustomPinterest} className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e1e5ef] bg-white px-3 text-[10px] font-bold text-[#65718c] transition hover:border-[#bfc8ef] hover:text-[#5169e8] sm:text-xs dark:border-white/10 dark:bg-[#141724] dark:text-slate-300">
                <ImagePlus className="h-3.5 w-3.5" />{t.openPinterestStudio}
              </button>
              <button type="button" onClick={openCoupleStudio} className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e1e5ef] bg-white px-3 text-[10px] font-bold text-[#65718c] transition hover:border-[#e8c2ce] hover:text-[#b34c6b] sm:text-xs dark:border-white/10 dark:bg-[#141724] dark:text-slate-300">
                <Heart className="h-3.5 w-3.5" />{t.openCoupleStudio}
              </button>
            </div>

            <section className="mt-6 sm:mt-8" aria-labelledby="trending-title">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h1 id="trending-title" className="text-[17px] font-extrabold tracking-tight text-[#202844] sm:text-xl dark:text-white">{t.appTrendingTitle}</h1>
                <div className="hidden items-center gap-1.5 sm:flex">
                  <button onClick={() => scrollTrending(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#78829a] ring-1 ring-[#e4e8f0] transition hover:text-[#4c62e8] dark:bg-[#141724] dark:text-slate-300 dark:ring-white/10" aria-label={t.scrollTrendingLeft}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => scrollTrending(1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#78829a] ring-1 ring-[#e4e8f0] transition hover:text-[#4c62e8] dark:bg-[#141724] dark:text-slate-300 dark:ring-white/10" aria-label={t.scrollTrendingRight}>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div
                ref={trendingRailRef}
                className="no-scrollbar -mx-4 flex snap-x snap-mandatory select-none gap-2.5 overflow-x-auto overscroll-x-contain px-4 pb-1 touch-pan-x cursor-grab active:cursor-grabbing sm:mx-0 sm:gap-3 sm:px-0"
                style={{ scrollPaddingLeft: '1rem' }}
                onMouseDown={startTrendingDrag}
                onMouseMove={moveTrendingDrag}
                onMouseUp={endTrendingDrag}
                onClickCapture={preventClickAfterDrag}
              >
                {trendingTemplates.map((template) => (
                  <div key={template.id} className="w-[104px] flex-none sm:w-[128px] lg:w-[142px]">
                    <TemplateCard template={template} variant="carousel" onPreview={setPreviewTemplate} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7 sm:mt-9" aria-labelledby="try-title">
              <div className="mb-3 flex items-end justify-between sm:mb-4">
                <div>
                  <h2 id="try-title" className="text-[17px] font-extrabold tracking-tight text-[#202844] sm:text-xl dark:text-white">{t.appTryTitle}</h2>
                  <p className="mt-1 text-[10px] text-[#9299aa] sm:text-xs dark:text-slate-400">{t.landingSamplesSub}</p>
                </div>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[10px] font-semibold text-[#5268ed] sm:text-xs">
                    {t.clearSearch}
                  </button>
                )}
              </div>

              {visibleTemplates.length === 0 ? (
                <div className="rounded-2xl border border-[#e3e7f0] bg-white px-5 py-12 text-center dark:border-white/10 dark:bg-[#141724]">
                  <p className="text-sm font-semibold text-[#404b68] dark:text-slate-200">{t.noTemplatesFound}</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-2 text-xs font-semibold text-[#536dfe]">{t.resetFilters}</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {visibleTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} onPreview={setPreviewTemplate} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'gallery' && <GalleryView />}
        {currentView === 'library' && <PhotoLibraryView />}
        {currentView === 'admin' && <AdminDashboard />}

        {currentView === 'profile' && currentUser && (
          <section className="mx-auto max-w-xl py-7 sm:py-10">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#202844] dark:text-white">{t.profileTitle}</h1>
            <p className="mt-1 text-sm text-[#858ea2] dark:text-slate-400">{t.profileSub}</p>
            <div className="mt-5 rounded-[22px] border border-[#e3e7f0] bg-white p-5 shadow-[0_6px_25px_rgba(42,55,91,.04)] dark:border-white/10 dark:bg-[#141724]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8ecff] text-[#536dfe]"><UserRound className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#27314f] dark:text-slate-100">{currentUser.name}</p>
                  <p className="truncate text-xs text-[#8a92a4] dark:text-slate-400">{currentUser.email}</p>
                </div>
              </div>
              <button onClick={() => setIsCreditModalOpen(true)} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#f3f5ff] px-4 py-3 text-left dark:bg-white/5">
                <span className="text-xs font-medium text-[#747f99]">{t.currentBalance}</span>
                <span className="text-sm font-extrabold text-[#4e64e6]">{currentUser.creditBalance} {t.credits}</span>
              </button>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setCurrentView('library')} className="rounded-xl border border-[#e6e9f1] px-3 py-3 text-xs font-semibold text-[#5d6882] hover:bg-[#f7f8fb] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">{t.profilePhotos}</button>
                <button onClick={() => setCurrentView('gallery')} className="rounded-xl border border-[#e6e9f1] px-3 py-3 text-xs font-semibold text-[#5d6882] hover:bg-[#f7f8fb] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">{t.myGallery}</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label className="rounded-xl bg-[#f7f8fb] px-3 py-2 text-[10px] font-semibold text-[#8991a2] dark:bg-white/5 dark:text-slate-400">
                  {t.profileLanguage}
                  <select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)} className="mt-1 block w-full bg-transparent text-xs font-bold text-[#3d4967] outline-none dark:text-slate-200">
                    <option value="ro">Română</option><option value="ru">Русский</option><option value="en">English</option>
                  </select>
                </label>
                <label className="rounded-xl bg-[#f7f8fb] px-3 py-2 text-[10px] font-semibold text-[#8991a2] dark:bg-white/5 dark:text-slate-400">
                  {t.profileCurrency}
                  <select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className="mt-1 block w-full bg-transparent text-xs font-bold text-[#3d4967] outline-none dark:text-slate-200">
                    <option value="MDL">MDL</option><option value="RON">RON</option><option value="EUR">EUR</option>
                  </select>
                </label>
              </div>
              {!isLocalPreviewMode && (
                <button onClick={() => { void signOut(); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold text-rose-500 hover:bg-rose-50">
                  <LogOut className="h-4 w-4" /> {t.profileSignOut}
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      <BottomNav />

      <CreatePhotoModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <TemplateDetailModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(template) => {
          setPreviewTemplate(null);
          setCurrentView('explore');
          quickSelectTemplate(template);
        }}
      />
      <CreditPurchaseModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

const MarketingLanding: React.FC<{ navigate: Navigate }> = ({ navigate }) => {
  const { t, language, templates, setCurrentView, isAuthModalOpen, setIsAuthModalOpen, isCreditModalOpen, setIsCreditModalOpen } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const activeTemplates = templates.filter((template) => template.isActive);
  const heroTemplate = activeTemplates[0];
  const sideTemplates = activeTemplates.slice(1, 3);

  const openApp = () => navigate('/app');
  const showTemplate = () => {
    setCurrentView('explore');
    openApp();
  };

  return (
    <div className="min-h-screen bg-[#eef1f8] text-[#18203b] dark:bg-[#090a0f] dark:text-slate-100">
      <Header variant="marketing" onNavigateApp={openApp} onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      <main>
        <section className="mx-auto max-w-[980px] px-5 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:pt-16">
          <div className="mx-auto max-w-[760px] text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-bold tracking-[.13em] text-[#6675d4] ring-1 ring-[#e2e7f2] sm:text-[10px]">
              <Sparkles className="h-3 w-3" /> {t.landingBadge}
            </span>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.06] tracking-[-.045em] text-[#151d38] sm:mt-6 sm:text-5xl md:text-[58px] dark:text-white">
              <span className="block">{t.landingHeadlineLead}</span>
              <span className="mt-1 block text-[#5269f5]">{t.landingHeadlineHighlight}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[590px] text-[12px] leading-[1.75] text-[#7d879d] sm:mt-5 sm:text-sm dark:text-slate-400">
              {t.landingSubhead}
            </p>
            <button
              type="button"
              onClick={openApp}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#4e67f7] px-7 text-xs font-bold text-white shadow-[0_8px_20px_rgba(78,103,247,.22)] transition hover:-translate-y-0.5 hover:bg-[#4059e8] active:translate-y-0 sm:mt-6 sm:min-h-12 sm:px-8 sm:text-sm"
            >
              {t.landingCta}<ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-2 text-[10px] text-[#9aa2b3]">{t.landingFreeNote}</p>
          </div>

          <div className="relative mx-auto mt-8 h-[295px] max-w-[470px] sm:mt-10 sm:h-[390px] md:mt-12">
            {heroTemplate && (
              <div className="absolute bottom-2 right-[6%] top-0 w-[67%] overflow-hidden rounded-[26px] bg-white shadow-[0_20px_55px_rgba(34,47,80,.18)] ring-1 ring-white/70 sm:rounded-[32px]">
                <img src={heroTemplate.previewImage} alt={heroTemplate.name[language] || heroTemplate.name.ro} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#4e5a76] shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:text-[10px]">
                  <Sparkles className="h-3 w-3 text-[#566cf4]" /> {t.landingSamplesTitle}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#11182d]/65 to-transparent px-4 pb-4 pt-12 text-white sm:px-5 sm:pb-5">
                  <p className="text-[10px] font-medium text-white/80">{t.categories[heroTemplate.category] || heroTemplate.category}</p>
                  <p className="mt-1 text-sm font-bold sm:text-base">{heroTemplate.name[language] || heroTemplate.name.ro}</p>
                </div>
              </div>
            )}
            {sideTemplates[0] && (
              <div className="absolute bottom-[10%] left-[2%] z-10 h-[46%] w-[37%] rotate-[-4deg] overflow-hidden rounded-[19px] bg-white p-1.5 shadow-[0_15px_35px_rgba(34,47,80,.2)] sm:rounded-[22px] sm:p-2">
                <img src={sideTemplates[0].previewImage} alt={sideTemplates[0].name[language] || sideTemplates[0].name.ro} className="h-full w-full rounded-[14px] object-cover sm:rounded-[16px]" />
                <span className="absolute bottom-3 left-3 right-3 truncate rounded-full bg-white/90 px-2 py-1 text-center text-[8px] font-bold text-[#44516e] sm:text-[9px]">
                  {sideTemplates[0].name[language] || sideTemplates[0].name.ro}
                </span>
              </div>
            )}
            {sideTemplates[1] && (
              <div className="absolute right-[2%] top-[8%] z-10 h-[27%] w-[27%] rotate-[5deg] overflow-hidden rounded-[17px] bg-white p-1.5 shadow-[0_12px_28px_rgba(34,47,80,.18)] sm:rounded-[20px] sm:p-2">
                <img src={sideTemplates[1].previewImage} alt={sideTemplates[1].name[language] || sideTemplates[1].name.ro} className="h-full w-full rounded-[12px] object-cover sm:rounded-[15px]" />
              </div>
            )}
            <div className="absolute bottom-[1%] right-[0%] z-20 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[9px] font-semibold text-[#5d6984] shadow-[0_8px_25px_rgba(34,47,80,.14)] sm:bottom-[4%] sm:px-4 sm:py-2.5 sm:text-[10px]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#edf0ff] text-[#546af4]"><Check className="h-3 w-3" /></span>
              {t.landingStep1Body.split('.')[0]}
            </div>
          </div>
        </section>

        <section id="examples" className="border-y border-[#e4e8f1] bg-white/65 py-8 sm:py-11 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-[#1d2540] sm:text-2xl dark:text-white">{t.landingSamplesTitle}</h2>
                <p className="mt-1 text-[11px] text-[#9098aa] sm:text-xs dark:text-slate-400">{t.landingSamplesSub}</p>
              </div>
              <button onClick={openApp} className="hidden items-center gap-1 text-xs font-bold text-[#5269f5] sm:inline-flex">
                {t.exploreTemplates}<ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {activeTemplates.slice(0, 4).map((template) => (
                <TemplateCard key={template.id} template={template} onPreview={showTemplate} />
              ))}
            </div>
            <button onClick={openApp} className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-[#5269f5] sm:hidden">
              {t.exploreTemplates}<ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-[1020px] px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-[560px] text-center">
            <span className="text-[9px] font-bold uppercase tracking-[.15em] text-[#7180dc]">AuraStudio</span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#1c2541] sm:text-3xl dark:text-white">{t.landingHowTitle}</h2>
            <p className="mt-2 text-[11px] text-[#8c95a9] sm:text-sm dark:text-slate-400">{t.landingHowSub}</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { number: '01', title: t.step1Template, body: t.landingStep1Body, icon: <WandSparkles className="h-4 w-4" /> },
              { number: '02', title: t.step2Photo, body: t.landingStep2Body, icon: <ImagePlus className="h-4 w-4" /> },
              { number: '03', title: t.step3Generate, body: t.landingStep3Body, icon: <Sparkles className="h-4 w-4" /> }
            ].map((step) => (
              <div key={step.number} className="rounded-[20px] border border-[#e8ebf2] bg-white p-4 shadow-[0_5px_18px_rgba(42,55,91,.035)] sm:p-5 dark:border-white/10 dark:bg-[#141724]">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f3ff] text-[#576df3]">{step.icon}</span>
                  <span className="text-sm font-extrabold text-[#cad0df]">{step.number}</span>
                </div>
                <h3 className="mt-4 text-[12px] font-bold text-[#27314e] sm:text-sm dark:text-slate-100">{step.title}</h3>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[#8a93a7] sm:text-xs dark:text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-10 sm:px-6 sm:pb-14">
          <div className="mx-auto flex max-w-[1020px] flex-col items-center justify-between gap-5 rounded-[24px] bg-[#111832] px-5 py-7 text-center text-white sm:flex-row sm:px-9 sm:py-8 sm:text-left">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t.landingHeadlineLead}</h2>
              <p className="mt-1.5 text-[11px] text-white/60 sm:text-sm">{t.landingFreeNote}</p>
            </div>
            <button onClick={openApp} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#536dfe] px-6 text-xs font-bold text-white shadow-md shadow-black/20 transition hover:bg-[#6680ff]">
              {t.landingCta}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-[760px] px-4 pb-10 sm:px-6 sm:pb-14">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1d2540] sm:text-2xl">{t.landingFaqTitle}</h2>
          </div>
          <div className="space-y-2">
            {[
              [t.landingFaqPromptQ, t.landingFaqPromptA],
              [t.landingFaqFormatsQ, t.landingFaqFormatsA],
              [t.landingFaqPrivacyQ, t.landingFaqPrivacyA],
              [t.landingFaqRatioQ, t.landingFaqRatioA]
            ].map(([question, answer], index) => (
              <details key={question} open={faqOpen === index} onToggle={(event) => {
                if ((event.currentTarget as HTMLDetailsElement).open) setFaqOpen(index);
                else if (faqOpen === index) setFaqOpen(null);
              }} className="group rounded-2xl border border-[#e4e8f0] bg-white px-4 py-3.5 open:shadow-[0_5px_18px_rgba(42,55,91,.04)] sm:px-5 dark:border-white/10 dark:bg-[#141724]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[11px] font-bold text-[#303a57] sm:text-xs dark:text-slate-100">
                  {question}<ChevronDown className="h-4 w-4 shrink-0 text-[#8792aa] transition group-open:rotate-180" />
                </summary>
                <p className="pt-2.5 text-[10px] leading-relaxed text-[#858ea2] sm:text-xs dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e2e6ef] px-4 py-5 text-center text-[10px] text-[#9aa2b2] sm:py-6 dark:border-white/10 dark:text-slate-400">
        <div className="font-bold text-[#56617c]">AuraStudio <span className="font-normal text-[#a4abba]">· Moldova & România</span></div>
        <p className="mt-1">© {new Date().getFullYear()} AuraStudio. {t.rightsReserved}</p>
      </footer>

      <CreditPurchaseModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { setCurrentView } = useApp();
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const navigate = useCallback<Navigate>((path) => {
    if (path === '/app') setCurrentView('explore');
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [setCurrentView]);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  return pathname === '/app' || pathname.startsWith('/app/')
    ? <MainAppContent navigate={navigate} />
    : <MarketingLanding navigate={navigate} />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
