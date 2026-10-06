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
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { RotatingHeadlineWord } from './components/RotatingHeadlineWord';
import { HEADLINE_ROTATING_WORDS, HERO_WISH_WORDS } from './data/headlineWords';
import auraStudioLogo from './assets/images/aurastudio-logo.png';
import { PhotoTemplate, TemplateCategory } from './types';
import {
  ArrowLeft,
  ArrowRight,
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
  const railDragStartRef = useRef<{ pointerId: number; x: number; left: number } | null>(null);
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

  const startTrendingDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !trendingRailRef.current) return;
    railDragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      left: trendingRailRef.current.scrollLeft
    };
    railWasDraggedRef.current = false;
  };

  const moveTrendingDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = railDragStartRef.current;
    if (!start || start.pointerId !== event.pointerId || !trendingRailRef.current) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) > 4) railWasDraggedRef.current = true;
    if (railWasDraggedRef.current) {
      event.preventDefault();
      trendingRailRef.current.scrollLeft = start.left - distance;
    }
  };

  const endTrendingDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = railDragStartRef.current;
    if (start && start.pointerId !== event.pointerId) return;
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
                onPointerDown={startTrendingDrag}
                onPointerMove={moveTrendingDrag}
                onPointerUp={endTrendingDrag}
                onPointerCancel={endTrendingDrag}
                onPointerLeave={endTrendingDrag}
                onDragStart={(event) => event.preventDefault()}
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
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

const MarketingLanding: React.FC<{ navigate: Navigate }> = ({ navigate }) => {
  const { t, language, currency, templates, setCurrentView, isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const headlineWords = HEADLINE_ROTATING_WORDS[language];
  const wishWords = HERO_WISH_WORDS[language];
  const activeTemplates = templates
    .filter((template) => template.isActive)
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const heroTemplate = activeTemplates[0];
  const sideTemplates = activeTemplates.slice(1, 3);
  // Ряд из 3 фото-плиток со стикерами над большой картинкой — как в референсе.
  const topTemplates = [activeTemplates[3] || activeTemplates[0], activeTemplates[4] || activeTemplates[1], activeTemplates[5] || activeTemplates[2]].filter(Boolean);
  const topTileStyles = ['rotate(-8deg) translateY(0px)', 'rotate(4deg) translateY(12px)', 'rotate(-3deg) translateY(4px)'];

  const openApp = () => navigate('/app');
  const goToCatalog = () => {
    setCurrentView('explore');
    openApp();
  };

  const steps = [
    { number: '01', title: t.landingStep1Title, body: t.landingStep1Body, icon: <WandSparkles className="h-5 w-5" /> },
    { number: '02', title: t.landingStep2Title, body: t.landingStep2Body, icon: <ImagePlus className="h-5 w-5" /> },
    { number: '03', title: t.landingStep3Title, body: t.landingStep3Body, icon: <Sparkles className="h-5 w-5" /> }
  ];

  const photoPackages = [
    { title: t.landingPackagePortrait, image: heroTemplate?.previewImage },
    { title: t.landingPackageCouple, image: sideTemplates[0]?.previewImage },
    { title: t.landingPackageEditorial, image: sideTemplates[1]?.previewImage }
  ];

  const faqItems = [
    [t.landingFaqExpiryQ, t.landingFaqExpiryA],
    [t.landingFaqPaymentQ, t.landingFaqPaymentA],
    [t.landingFaqResultQ, t.landingFaqResultA],
    [t.landingFaqWatermarkQ, t.landingFaqWatermarkA],
    [t.landingFaqCommercialQ, t.landingFaqCommercialA],
    [t.landingFaqPhotoQ, t.landingFaqPhotoA]
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#18203b] dark:bg-[#090a0f] dark:text-slate-100">
      <Header variant="marketing" onNavigateApp={goToCatalog} onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-48 top-12 h-[420px] w-[420px] rounded-full bg-[#e7eaff]/70 blur-3xl dark:bg-[#536dfe]/[.08]" />
          <div className="pointer-events-none absolute -right-48 top-24 h-[420px] w-[420px] rounded-full bg-[#f2e8ff]/70 blur-3xl dark:bg-[#a855f7]/[.07]" />
          <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-8 px-4 py-9 sm:px-7 sm:py-14 lg:grid-cols-[.94fr_1.06fr] lg:gap-10 lg:px-10 lg:py-16 xl:py-20">
            <div className="mx-auto max-w-[650px] text-center lg:mx-0">
              <h1 className="max-w-[660px] font-display text-[40px] font-extrabold leading-[1.05] tracking-[-.05em] text-[#181d32] sm:text-5xl lg:text-[58px] xl:text-[66px] dark:text-white">
                <span className="block">
                  {t.landingHeadlineLead} <RotatingHeadlineWord words={headlineWords} />
                </span>
                <span className="block">{t.landingHeadlineTail}</span>
              </h1>

              {/* Овал с текстом — под заголовком, как в референсе */}
              <div className="mx-auto mt-6 inline-flex max-w-[560px] items-center justify-center gap-2.5 rounded-full bg-[#e8eeff] px-5 py-3 text-center shadow-[0_8px_24px_rgba(76,99,237,.10)] sm:px-6 dark:bg-white/[.06]">
                <Sparkles className="h-4 w-4 shrink-0 text-[#4c63ed] dark:text-[#8ba0ff]" />
                <span className="text-[13px] font-bold leading-snug text-[#3b56f5] sm:text-sm dark:text-[#a9b9ff]">
                  {t.landingBadge}
                </span>
              </div>

              <p className="mx-auto mt-5 max-w-[540px] text-balance text-[13px] leading-[1.8] text-[#777f92] sm:mt-6 sm:text-[15px] dark:text-slate-400">
                {t.landingSubhead}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
                <button
                  type="button"
                  onClick={goToCatalog}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5368f3] px-6 text-xs font-bold text-white shadow-[0_10px_26px_rgba(83,104,243,.24)] transition hover:-translate-y-0.5 hover:bg-[#455be8] active:translate-y-0 sm:px-7 sm:text-sm"
                >
                  {t.landingCta}<ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mx-auto mt-4 max-w-[430px] text-[10px] leading-relaxed text-[#9a9eaa] sm:text-[11px] dark:text-slate-500">{t.landingHeroNote}</p>
            </div>

            <div className="relative mx-auto w-full max-w-[590px] px-2 pb-7 pt-1 sm:px-5 sm:pb-10 lg:mr-0">
              <div className="pointer-events-none absolute inset-x-[12%] bottom-[8%] top-[4%] rounded-full bg-gradient-to-br from-[#dce2ff] via-[#f4e3ff] to-[#ffe7d8] opacity-80 blur-3xl dark:from-[#536dfe]/20 dark:via-[#9d4edd]/15 dark:to-[#ee80a6]/10" />

              {/* Ряд из 3 фото-плиток со стикерами над большой — как в референсе */}
              <div className="relative z-10 mx-auto mt-3 w-full max-w-[440px] px-2 sm:mt-5 sm:max-w-[520px]">
                <span className="pointer-events-none absolute -top-3 left-[3%] z-30 -rotate-6 rounded-full bg-[#f472b6] px-3 py-1.5 text-[10px] font-display font-bold text-white shadow-[0_8px_20px_rgba(30,35,70,.18)] sm:px-3.5 sm:text-xs">
                  {t.heroStickerReady}
                </span>
                <span className="pointer-events-none absolute right-[5%] top-1 z-30 rotate-3 rounded-full bg-[#a78bfa] px-3 py-1.5 text-[10px] font-display font-bold text-white shadow-[0_8px_20px_rgba(30,35,70,.18)] sm:px-3.5 sm:text-xs">
                  {t.heroStickerFast}
                </span>
                <div className="flex items-end justify-center gap-2 sm:gap-4">
                  {topTemplates.map((template, index) => (
                    <div
                      key={`${template.id}-${index}`}
                      className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-2xl bg-white p-1 pb-3 shadow-[0_12px_28px_rgba(30,35,70,.16)] sm:w-32"
                      style={{ transform: topTileStyles[index] }}
                    >
                      <img
                        src={template.previewImage}
                        alt={template.name[language] || template.name.ro}
                        className="h-full w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Реплика с подменяемым текстом и стрелкой вниз — как в референсе */}
              <div className="relative z-10 mx-auto mt-5 flex w-fit max-w-full flex-col items-center">
                <div className="relative inline-flex max-w-full items-start gap-2 rounded-[24px] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(32,39,75,.14)] sm:px-5 dark:bg-[#171b2d]">
                  <span className="text-xl leading-none">🙋</span>
                  <span className="font-display text-[15px] font-bold leading-snug text-[#1b2340] sm:text-base dark:text-white">
                    {t.heroWishLead} <RotatingHeadlineWord words={wishWords} />
                  </span>
                  <span className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 bg-white dark:bg-[#171b2d]" />
                </div>
                <svg width="50" height="60" viewBox="0 0 50 60" fill="none" className="my-2 sm:my-3" aria-hidden="true">
                  <path d="M24 4 C12 14 38 24 26 37 C23.5 40.5 25 47 25 55" stroke="#4c63ed" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M18.5 48.5 L25 55.5 L31.5 48.5" stroke="#4c63ed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>

              <div className="relative ml-auto aspect-[4/4.7] w-[78%] overflow-hidden rounded-[30px] bg-[#dce0eb] shadow-[0_28px_70px_rgba(30,35,70,.2)] ring-1 ring-white/80 sm:rounded-[38px] dark:ring-white/10">
                {heroTemplate && (
                  <img
                    src={heroTemplate.previewImage}
                    alt={heroTemplate.name[language] || heroTemplate.name.ro}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#10152b]/70 via-transparent to-[#10152b]/5" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#4d5875] shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
                  <Sparkles className="h-3.5 w-3.5 text-[#586df2]" /> {t.landingHeroExample}
                </span>
                {heroTemplate && (
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-14 text-white sm:px-6 sm:pb-6">
                    <p className="text-[10px] font-medium text-white/70">{t.categories[heroTemplate.category] || heroTemplate.category}</p>
                    <p className="mt-1 text-sm font-bold sm:text-lg">{heroTemplate.name[language] || heroTemplate.name.ro}</p>
                  </div>
                )}
              </div>

              {sideTemplates[0] && (
                <div className="absolute bottom-[13%] left-0 z-10 aspect-[.82] w-[35%] -rotate-6 overflow-hidden rounded-[20px] border-[5px] border-white bg-white shadow-[0_18px_40px_rgba(30,35,70,.18)] sm:bottom-[14%] sm:left-1 sm:rounded-[25px] sm:border-[7px]">
                  <img src={sideTemplates[0].previewImage} alt={sideTemplates[0].name[language] || sideTemplates[0].name.ro} className="h-full w-full rounded-[14px] object-cover sm:rounded-[18px]" />
                </div>
              )}
              <div className="absolute bottom-[3%] right-[1%] z-20 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 text-[9px] font-semibold text-[#525d78] shadow-[0_8px_26px_rgba(32,39,75,.16)] sm:bottom-[5%] sm:px-4 sm:py-2.5 sm:text-[10px] dark:border-white/10 dark:bg-[#171b2d] dark:text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#edf0ff] text-[#5269ef] dark:bg-indigo-400/10 dark:text-indigo-300"><Check className="h-3.5 w-3.5" /></span>
                {t.landingHeroBadge}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-y border-[#ececf1] bg-white/70 py-11 sm:py-16 dark:border-white/10 dark:bg-white/[.02]">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-7 lg:px-10">
            <div className="mx-auto max-w-[620px] text-center">
              <span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#737ee0] sm:text-[10px]">{t.landingStepsEyebrow}</span>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-.035em] text-[#1c2541] sm:text-3xl dark:text-white">{t.landingHowTitle}</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-[#8991a3] sm:text-sm dark:text-slate-400">{t.landingHowSub}</p>
            </div>
            <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-3 sm:gap-4">
              {steps.map((step) => (
                <article key={step.number} className="group rounded-[22px] border border-[#e9eaf0] bg-[#fff] p-4 shadow-[0_8px_24px_rgba(35,42,75,.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_34px_rgba(35,42,75,.08)] sm:p-6 dark:border-white/10 dark:bg-[#141724]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eff1ff] text-[#596df0] dark:bg-indigo-400/10 dark:text-indigo-300">{step.icon}</span>
                    <span className="font-display text-sm font-extrabold tracking-widest text-[#c8ccda] dark:text-slate-600">{step.number}</span>
                  </div>
                  <h3 className="mt-5 text-[13px] font-bold text-[#26304c] sm:text-sm dark:text-slate-100">{step.title}</h3>
                  <p className="mt-2 text-[11px] leading-[1.75] text-[#8790a4] sm:text-xs dark:text-slate-400">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="photo-packages" className="scroll-mt-24 px-4 py-11 sm:px-7 sm:py-16 lg:px-10">
          <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] bg-[#11162c] px-5 py-7 text-white shadow-[0_24px_70px_rgba(27,32,66,.12)] sm:rounded-[36px] sm:px-9 sm:py-10 lg:px-11 lg:py-12">
            <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#6954ef]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 left-[28%] h-72 w-72 rounded-full bg-[#a937bb]/15 blur-3xl" />
            <div className="relative">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="max-w-[650px]">
                  <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#aab4ff] sm:text-[10px]">
                    <ImagePlus className="h-3.5 w-3.5" /> {t.landingPackagesEyebrow}
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">{t.landingPackagesTitle}</h2>
                  <p className="mt-2 mx-auto max-w-[600px] text-[11px] leading-relaxed text-white/60 sm:text-sm">{t.landingPackagesSub}</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-[10px] font-semibold text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a9b4ff]" /> {t.landingPackagesStatus}
                </div>
              </div>

              <div className="mx-auto mt-6 grid max-w-[1040px] gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
                {photoPackages.map((photoPackage) => (
                  <article key={photoPackage.title} className="relative overflow-hidden rounded-[22px] border border-white/[.11] bg-white/[.055] p-4 backdrop-blur-sm sm:p-5">
                    {photoPackage.image && (
                      <img src={photoPackage.image} alt="" loading="lazy" className="absolute right-0 top-0 h-32 w-24 object-cover opacity-[.18] [mask-image:linear-gradient(to_left,black,transparent)]" />
                    )}
                    <div className="relative flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#b5bfff]"><Sparkles className="h-4 w-4" /></span>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-white/55">{t.landingPackageDraft}</span>
                    </div>
                    <h3 className="relative mt-4 text-[13px] font-bold text-white sm:text-sm">{photoPackage.title}</h3>
                    <div className="relative mt-4 space-y-2.5 border-t border-white/10 pt-3 text-[10px] sm:text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/55">{t.landingPackagePhotoCount}</span>
                        <span className="text-right font-semibold text-white/85">{t.landingPackagePending}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/55">{t.landingPackagePrice}</span>
                        <span className="text-right font-semibold text-white/85">{t.landingPackagePending} · {currency}</span>
                      </div>
                    </div>
                    <button type="button" disabled className="relative mt-4 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/[.04] px-4 text-[10px] font-bold text-white/40 sm:text-[11px]">
                      {t.landingPackageUnavailable}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 mx-auto w-full max-w-[900px] px-4 pb-11 sm:px-7 sm:pb-16 lg:px-10">
          <div className="mx-auto mb-6 max-w-[560px] text-center">
            <span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#737ee0] sm:text-[10px]">{t.landingFaqEyebrow}</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-.035em] text-[#1d2540] sm:text-3xl dark:text-white">{t.landingFaqTitle}</h2>
          </div>
          <div className="space-y-2.5">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="group rounded-[18px] border border-[#e7e8ee] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(38,43,72,.025)] open:shadow-[0_10px_28px_rgba(38,43,72,.06)] sm:px-5 dark:border-white/10 dark:bg-[#141724]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[11px] font-bold leading-relaxed text-[#303a57] sm:text-xs dark:text-slate-100">
                  {question}<ChevronDown className="h-4 w-4 shrink-0 text-[#8792aa] transition group-open:rotate-180" />
                </summary>
                <p className="max-w-[760px] pt-3 text-[10px] leading-[1.8] text-[#7f889b] sm:text-xs dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-7 sm:pb-16 lg:px-10">
          <div className="relative mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e8ebff] via-[#f0e9ff] to-[#f9eaf1] px-5 py-8 text-center sm:flex-row sm:px-9 sm:py-9 sm:text-left dark:from-[#14182d] dark:via-[#19142c] dark:to-[#211725]">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#8b5cf6]/15 blur-3xl" />
            <div className="relative max-w-[640px]">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-[#1b2340] sm:text-2xl dark:text-white">{t.landingFinalTitle}</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-[#727b91] sm:text-sm dark:text-slate-400">{t.landingFinalBody}</p>
            </div>
            <button type="button" onClick={goToCatalog} className="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#5368f3] px-6 text-xs font-bold text-white shadow-[0_8px_20px_rgba(83,104,243,.2)] transition hover:bg-[#455be8] sm:text-sm">
              {t.landingCta}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e9e9ed] bg-white/55 px-4 py-7 text-center text-[10px] text-[#969dac] sm:py-9 dark:border-white/10 dark:bg-white/[.02] dark:text-slate-400">
        <img src={auraStudioLogo} alt="AuraStudio" className="mx-auto h-auto w-[126px]" />
        <p className="mt-2">{t.landingFooterTagline}</p>
        <p className="mt-1">© {new Date().getFullYear()}. {t.rightsReserved}</p>
      </footer>

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
