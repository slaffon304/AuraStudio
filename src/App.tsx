import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CategoryFilter } from './components/CategoryFilter';
import { TemplateCard } from './components/TemplateCard';
import { TemplateDetailModal } from './components/TemplateDetailModal';
import { CreatePhotoModal } from './components/CreatePhotoModal';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { CarouselSection } from './components/CarouselSection';
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
  Image as ImageIcon,
  Flame,
  Briefcase,
  Shirt,
  Coffee,
  Castle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  LayoutGrid,
  Columns3,
  Coins
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    language,
    t,
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
    quickSelectTemplate,
    openCustomPinterest,
    openCoupleStudio,
    genderFilter,
    setGenderFilter,
    currency,
    isBackendConnected,
    creditPackages
  } = useApp();

  const [previewTemplate, setPreviewTemplate] = useState<PhotoTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'carousels' | 'grid'>('carousels');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Filter templates by gender and search query
  const applyFilters = (list: PhotoTemplate[]) => {
    return list.filter((tmpl) => {
      if (!tmpl.isActive) return false;
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
        tmpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tmpl.tags && tmpl.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesGender && matchesSearch;
    });
  };

  const activeTemplates = templates.filter((t) => t.isActive);

  // Carousel 1: Trending & Pinterest Aesthetics
  const trendingTemplates = applyFilters(
    activeTemplates.filter(
      (t) =>
        t.category === 'Trending' ||
        t.category === 'Instagram' ||
        t.tags?.includes('trending') ||
        t.tags?.includes('oldmoney')
    )
  );

  // Carousel 2: Business & Executive Studio
  const businessTemplates = applyFilters(
    activeTemplates.filter(
      (t) =>
        t.category === 'Business' ||
        t.tags?.includes('business') ||
        t.tags?.includes('studio') ||
        t.id === 'studio-minimalist-bw'
    )
  );

  // Carousel 3: High Fashion & Street Style
  const fashionTemplates = applyFilters(
    activeTemplates.filter(
      (t) =>
        t.category === 'Fashion' ||
        t.tags?.includes('fashion') ||
        t.tags?.includes('vogue') ||
        t.category === 'Editorial'
    )
  );

  // Carousel 4: Couple & Romance
  const coupleTemplates = applyFilters(
    activeTemplates.filter(
      (t) =>
        t.category === 'Couple' ||
        t.gender === 'couple' ||
        t.tags?.includes('couple') ||
        t.tags?.includes('romance')
    )
  );

  // Carousel 5: Lifestyle & Parisian Cafe
  const lifestyleTemplates = applyFilters(
    activeTemplates.filter(
      (t) =>
        t.category === 'Lifestyle' ||
        t.category === 'Travel' ||
        t.tags?.includes('cafe') ||
        t.tags?.includes('coffee')
    )
  );

  // Carousel 6: Castles, Gala & Heritage
  const heritageTemplates = applyFilters(
    activeTemplates.filter(
      (t) =>
        t.category === 'Heritage' ||
        t.tags?.includes('castle') ||
        t.tags?.includes('gala') ||
        t.tags?.includes('luxury')
    )
  );

  const isSearching = searchQuery.trim().length > 0;
  const isFilteringSpecificCategory = selectedCategory !== 'All';

  const currentCategoryTemplates = applyFilters(
    activeTemplates.filter((t) =>
      isFilteringSpecificCategory ? t.category === selectedCategory : true
    )
  );

  // Localized texts
  const heroCopy = {
    ro: {
      headline: 'Ședințe Foto de Revistă ca pe Pinterest în 10 Secunde',
      subhead: 'Fără fotografi, make-up sau setări complicate. Încarcă un selfie și obține instant cadre de studio cu iluminare impecabilă.',
      trendingTitle: '🔥 Tendențe Pinterest & Instagram',
      trendingSub: 'Cele mai căutate stiluri estetice și virale ale momentului',
      businessTitle: '💼 Business & Portret Profesional',
      businessSub: 'Portrete curate pentru LinkedIn, CV, site personal și presă',
      fashionTitle: '👗 High Fashion & Street Style',
      fashionSub: 'Estetică editorială inspirată din marile reviste de modă',
      coupleTitle: '🤍 Ședințe de Cuplu & Romance',
      coupleSub: 'Fotografii calde de poveste pentru tine și persoana iubită',
      lifestyleTitle: '☕ Lifestyle & Cafenele Chic',
      lifestyleSub: 'Cadre naturale din cafenele, terase însorite și călătorii',
      heritageTitle: '🏰 Castele & Evenimente de Gală',
      heritageSub: 'Locații aristocratice, palate istorice și ținute black-tie',
      customBtn: 'Pinterest Reference',
      coupleBtn: 'Pentru Cuplu',
      howTitle: 'Cum Funcționează',
      howSub: 'Trei pași simpli până la noua ta fotografie de profil',
      step1Title: 'Încarcă 1 Selfie',
      step1Desc: 'Orice fotografie clară de pe telefon, făcută la lumină naturală.',
      step2Title: 'Alege Stilul sau Referința',
      step2Desc: 'Alege un șablon din studio sau încarcă orice poză de pe Pinterest/Instagram.',
      step3Title: 'Descarcă în 10 Secunde',
      step3Desc: 'Inteligența artificială păstrează 100% trăsăturile feței tale în rezoluție Ultra-HD.',
      packTitle: 'Pachete Foto (Photo Packs)',
      packSub: 'Creează o serie completă de 4 fotografii în același stil cu unghiuri și ipostaze diferite.',
      pricingTitle: 'Tarife Transparente',
      pricingSub: 'Plătești doar când generezi. Fără abonamente ascunse.',
      faqTitle: 'Întrebări Frecvente',
      carouselsMode: 'Карусели',
      gridMode: 'Сетка'
    },
    ru: {
      headline: 'Студийные фотосессии как из Pinterest за 10 секунд',
      subhead: 'Без фотографов, визажистов и сложных промптов. Загрузи своё фото и примерь десятки студийных образов в 1 клик.',
      trendingTitle: '🔥 Тренды Pinterest и Instagram',
      trendingSub: 'Самые популярные и вирусные образы этой недели',
      businessTitle: '💼 Бизнес, резюме и LinkedIn',
      businessSub: 'Безупречные студийные портреты для карьеры, резюме и экспертного блога',
      fashionTitle: '👗 High Fashion и Street Style',
      fashionSub: 'Высокая мода, стильный глянец и миланский стритстайл',
      coupleTitle: '🤍 Парные и романтические фотосессии',
      coupleSub: 'Романтичные истории любви для двоих на закате',
      lifestyleTitle: '☕ Уютный лайфстайл и кофе',
      lifestyleSub: 'Атмосферные террасы парижских бистро, утро с кофе и путешествия',
      heritageTitle: '🏰 Замки, дворцы и вечерний шик',
      heritageSub: 'Королевская эстетика, старинные замки и вечерние гала-приёмы',
      customBtn: 'Свой референс из Pinterest',
      coupleBtn: 'Для пары',
      howTitle: 'Как это работает',
      howSub: 'Три простых шага до идеальной фотосессии',
      step1Title: '1. Загрузи 1 фото',
      step1Desc: 'Подойдет обычное селфи с телефона при дневном свете. Без обработки.',
      step2Title: '2. Выбери стиль или референс',
      step2Desc: 'Выбери готовый образ из карусели или вставь картинку из Pinterest/Instagram.',
      step3Title: '3. Получи фото за 10 секунд',
      step3Desc: 'ИИ создаст реалистичный кадр с идеальным светом и 100% сохранением твоих черт.',
      packTitle: 'Фотопаки (серия из 4 кадров)',
      packSub: 'Хотите разнообразие ракурсов? Выберите фотопак: 4 гармоничных снимка в едином стиле.',
      pricingTitle: 'Честные тарифы без подписок',
      pricingSub: 'Покупайте кредиты когда удобно. 2 первые генерации бесплатно.',
      faqTitle: 'Часто задаваемые вопросы',
      carouselsMode: 'Карусели',
      gridMode: 'Сетка'
    },
    en: {
      headline: 'Studio-Quality Photoshoots Like Pinterest in 10 Seconds',
      subhead: 'No photographers, makeup artists or complex prompts needed. Upload your selfie and get magazine-grade portraits in seconds.',
      trendingTitle: '🔥 Trending on Pinterest & Instagram',
      trendingSub: 'The most popular and viral aesthetic looks of the week',
      businessTitle: '💼 Executive, Resume & LinkedIn',
      businessSub: 'Clean and confident studio headshots for LinkedIn and personal websites',
      fashionTitle: '👗 High Fashion & Street Style',
      fashionSub: 'High-fashion editorial looks inspired by world fashion capitals',
      coupleTitle: '🤍 Couples & Romance',
      coupleSub: 'Dreamy romantic photoshoot for you and your partner',
      lifestyleTitle: '☕ Cozy Lifestyle & Artisan Coffee',
      lifestyleSub: 'Natural candid moments from European bistros and travels',
      heritageTitle: '🏰 Castles, Palaces & Royal Gala',
      heritageSub: 'Aristocratic palaces and timeless historic locations',
      customBtn: 'Pinterest Reference',
      coupleBtn: 'Couple Shoot',
      howTitle: 'How It Works',
      howSub: 'Three simple steps to your magazine-grade portraits',
      step1Title: '1. Upload 1 Selfie',
      step1Desc: 'Any clear smartphone selfie in natural lighting will do.',
      step2Title: '2. Pick Style or Reference',
      step2Desc: 'Choose from curated styles or upload any inspiration from Pinterest.',
      step3Title: '3. Get Photos in 10 Seconds',
      step3Desc: 'Studio lighting and 100% facial likeness preserved in 4K Ultra-HD.',
      packTitle: 'Photo Packs (4-Photo Series)',
      packSub: 'Want multiple angles? Generate a series of 4 matching photos in one style.',
      pricingTitle: 'Simple Transparent Pricing',
      pricingSub: 'Pay only when you generate. No recurring monthly subscriptions.',
      faqTitle: 'Frequently Asked Questions',
      carouselsMode: 'Carousels',
      gridMode: 'Grid'
    }
  }[language];

  // FAQ Items
  const faqItems = {
    ro: [
      {
        q: 'Cât de mult va semăna fotografia generată cu mine?',
        a: 'Modelul nostru AI analizează cu precizie structura feței tale (ochi, buze, pomeți, privire) și o integrează perfect în stilul ales. Rezultatul arată natural, fără efect de plastic sau deformări.'
      },
      {
        q: 'Sunt fotografiile mele private și în siguranță?',
        a: 'Da, 100%. Imaginile încărcate și generate sunt stocate exclusiv în contul tău privat securizat și nu sunt niciodată făcute publice sau utilizate pentru antrenarea modelelor publice.'
      },
      {
        q: 'Pot încărca propria mea poză de pe Pinterest sau Instagram?',
        a: 'Absolut! Folosește modul „Pinterest Reference”. Încarcă poza ta și fotografia stilului dorit de pe Pinterest sau Instagram, iar AI-ul va transfera compoziția și iluminarea pe fața ta.'
      },
      {
        q: 'Ce înseamnă versiunea gratuită?',
        a: 'Primești 2 generări gratuite pentru a testa calitatea. Imaginile gratuite includ un subtil marcaj de apă. La activarea pachetelor de credite, fotografiile se descarcă în Ultra-HD 4K fără watermark.'
      },
      {
        q: 'Cum pot plăti?',
        a: 'Acceptăm carduri bancare (Visa, Mastercard), transferuri locale și Apple Pay în MDL, RON sau EUR.'
      }
    ],
    ru: [
      {
        q: 'Насколько сгенерированное фото будет похоже на меня?',
        a: 'Наш ИИ детально анализирует черты лица, форму глаз, скулы и улыбку, органично встраивая вашу внешность в выбранный стиль. Результат выглядит как настоящая фотосессия с профессиональным светом.'
      },
      {
        q: 'Безопасны ли загруженные фотографии?',
        a: 'Полностью безопасны. Ваши исходные селфи и готовые результаты доступны только в вашем личном кабинете. Мы не передаем файлы третьим лицам и не обучаем на них открытые модели.'
      },
      {
        q: 'Можно ли использовать референс из Pinterest или Instagram?',
        a: 'Да! Для этого есть режим «Свой референс из Pinterest». Загрузите своё фото и картинку-образец, и ИИ перенесет композицию, одежду и свет на ваш портрет.'
      },
      {
        q: 'Как работает бесплатный пробный период?',
        a: 'Каждому новому пользователю доступны первые 2 фотосессии бесплатно с легким водяным знаком. С пакетами кредитов вы получаете Ultra-HD качество без водяных знаков.'
      },
      {
        q: 'Какие способы оплаты поддерживаются?',
        a: 'Банковские карты (Visa, Mastercard), Apple Pay и прямые банковские переводы в MDL, RON или EUR.'
      }
    ],
    en: [
      {
        q: 'How realistic will the generated photo look like me?',
        a: 'Our AI model carefully maps your facial geometry, eye shape, and proportions, blending them naturally into the chosen aesthetic with authentic studio lighting.'
      },
      {
        q: 'Are my uploaded photos safe and private?',
        a: '100% private. Your uploaded photos and results belong strictly to your account and are never shared or used to train public AI models.'
      },
      {
        q: 'Can I upload a custom inspiration photo from Pinterest?',
        a: 'Yes! Use the "Pinterest Reference" mode. Upload your selfie and any reference picture, and the AI will replicate the lighting and pose.'
      },
      {
        q: 'Is there a free trial?',
        a: 'You get 2 trial generations with a subtle watermark to see the quality for yourself. Credit packages unlock crystal-clear 4K downloads with no watermark.'
      },
      {
        q: 'What payment methods are supported?',
        a: 'All major credit and debit cards, Apple Pay, and local bank transfers in MDL, RON, or EUR.'
      }
    ]
  }[language];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#090a0f] dark:text-slate-100 flex flex-col pb-20 md:pb-10 transition-colors">
      {/* Top Header */}
      <Header />

      {/* Supabase Notice Banner (If env vars pending) */}
      {!isBackendConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-300">
          <span>⚠️ Supabase is not configured. Configurează <code>VITE_SUPABASE_URL</code> și <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> pentru a activa salvarea utilizatorilor.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: EXPLORE & BROWSE */}
        {currentView === 'explore' && (
          <div>
            {/* HERO SECTION (Clean, White / Light Aesthetic, High-Conversion) */}
            <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/[0.06] bg-[#fafafa] dark:bg-gradient-to-b dark:from-[#11131c] dark:via-[#0b0c12] dark:to-[#090a0f] pt-12 pb-14 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
              {/* Subtle ambient gradient */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-400/[0.07] dark:bg-amber-500/[0.05] rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-4xl mx-auto text-center space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 shadow-2xs text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {language === 'ru' && 'Студийные фотосессии нового поколения'}
                    {language === 'ro' && 'Studio foto AI de generație nouă'}
                    {language === 'en' && 'Next-Generation AI Photo Studio'}
                  </span>
                </div>

                {/* Primary Headline */}
                <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-[1.12]">
                  {heroCopy.headline}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {heroCopy.subhead}
                </p>

                {/* Primary CTA and Fast Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-amber-400 dark:via-amber-500 dark:to-amber-500 px-7 py-3.5 text-xs font-bold text-white dark:text-slate-950 shadow-xl shadow-slate-900/10 dark:shadow-amber-500/25 active:scale-95 transition-all"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400 dark:text-slate-950" />
                    <span>{t.createPhotoAction}</span>
                  </button>

                  <button
                    onClick={openCustomPinterest}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 dark:border-amber-500/40 bg-white dark:bg-amber-500/10 hover:bg-slate-50 dark:hover:bg-amber-500/20 px-5 py-3.5 text-xs font-bold text-slate-800 dark:text-amber-300 active:scale-95 transition-all shadow-xs"
                  >
                    <ImageIcon className="h-4 w-4 text-amber-500" />
                    <span>{heroCopy.customBtn}</span>
                  </button>

                  <button
                    onClick={openCoupleStudio}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 dark:border-rose-500/40 bg-white dark:bg-rose-500/10 hover:bg-slate-50 dark:hover:bg-rose-500/20 px-5 py-3.5 text-xs font-bold text-slate-800 dark:text-rose-300 active:scale-95 transition-all shadow-xs"
                  >
                    <Users className="h-4 w-4 text-rose-500" />
                    <span>{heroCopy.coupleBtn}</span>
                  </button>
                </div>

                {/* 4 Value Pillars */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>10 секунд</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-slate-700 dark:text-amber-300" />
                    <span>100+ образов</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>100% конфиденциально</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>2 фото бесплатно</span>
                  </div>
                </div>
              </div>
            </section>

            {/* INTERACTIVE BEFORE/AFTER SLIDER (CENTERPIECE SHOWCASE) */}
            <div id="before-after-showcase">
              <BeforeAfterSlider
                language={language}
                onSelectTemplate={(tmplId) => {
                  const found = templates.find((t) => t.id === tmplId);
                  if (found) quickSelectTemplate(found);
                  else setIsCreateModalOpen(true);
                }}
                onOpenCustomPinterest={openCustomPinterest}
              />
            </div>

            {/* HOW IT WORKS: 3 INTERACTIVE STEPS */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-white/5">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                  {heroCopy.howTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {heroCopy.howSub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="relative rounded-2xl bg-white dark:bg-[#12141c] p-6 border border-slate-200/80 dark:border-white/5 shadow-2xs hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                    1
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    {heroCopy.step1Title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {heroCopy.step1Desc}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative rounded-2xl bg-white dark:bg-[#12141c] p-6 border border-slate-200/80 dark:border-white/5 shadow-2xs hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm mb-4">
                    2
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    {heroCopy.step2Title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {heroCopy.step2Desc}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative rounded-2xl bg-white dark:bg-[#12141c] p-6 border border-slate-200/80 dark:border-white/5 shadow-2xs hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                    3
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    {heroCopy.step3Title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {heroCopy.step3Desc}
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK FILTERS, AUDIENCE SELECTOR & VIEW MODE TOGGLE */}
            <div id="templates-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                {/* Gender / Audience Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                  {[
                    { id: 'all', ro: 'Toate', ru: '✨ Все', en: 'All' },
                    { id: 'women', ro: 'Pentru Ea', ru: '👩 Для неё', en: 'Women' },
                    { id: 'men', ro: 'Pentru El', ru: '👨 Для него', en: 'Men' },
                    { id: 'couples', ro: 'Cupluri', ru: '👩‍❤️‍👨 Пары', en: 'Couples' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setGenderFilter(filter.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        genderFilter === filter.id
                          ? 'bg-white text-slate-950 dark:bg-amber-500 dark:text-black shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filter[language]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* View Mode Toggle: Carousels vs Grid */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                    <button
                      onClick={() => setViewMode('carousels')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        viewMode === 'carousels'
                          ? 'bg-white text-slate-950 dark:bg-amber-500 dark:text-black shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={heroCopy.carouselsMode}
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                      <span>{heroCopy.carouselsMode}</span>
                    </button>

                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-slate-950 dark:bg-amber-500 dark:text-black shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={heroCopy.gridMode}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{heroCopy.gridMode}</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="flex-1 sm:w-64 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={language === 'ru' ? 'Поиск стиля...' : 'Caută stil...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.04] pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 shadow-2xs transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Horizontal Category Switcher Chips */}
              <CategoryFilter />
            </div>

            {/* MAIN CONTENT: HORIZONTAL CAROUSELS VS FILTERED GRID */}
            {isSearching || (isFilteringSpecificCategory && viewMode === 'grid') || viewMode === 'grid' ? (
              /* GRID VIEW (When user chooses grid or searches) */
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                      {isSearching
                        ? `${language === 'ru' ? 'Результаты поиска' : 'Rezultatele căutării'}: "${searchQuery}"`
                        : (t.categories[selectedCategory as keyof typeof t.categories] || selectedCategory)}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {currentCategoryTemplates.length} {language === 'ru' ? 'образов доступно' : 'stiluri disponibile'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setViewMode('carousels');
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setGenderFilter('all');
                    }}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {language === 'ru' ? '← Вернуться к каруселям' : '← Înapoi la carusele'}
                  </button>
                </div>

                {currentCategoryTemplates.length === 0 ? (
                  <div className="text-center py-20 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01]">
                    <p className="text-xs text-slate-400">
                      {language === 'ru' ? 'Ничего не найдено по данному запросу.' : 'Nu am găsit șabloane pentru selecția curentă.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      {language === 'ru' ? 'Показать все стили' : 'Resetează filtrele'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {currentCategoryTemplates.map((template) => (
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
            ) : (
              /* THEMATIC HORIZONTAL CAROUSELS (PIFPAF STYLE) */
              <div className="space-y-4 sm:space-y-6 pb-12">
                {/* 1. Trending Now Carousel */}
                <CarouselSection
                  icon={<Flame className="w-5 h-5 text-amber-500" />}
                  title={heroCopy.trendingTitle}
                  subtitle={heroCopy.trendingSub}
                  badge="Хит"
                  templates={trendingTemplates}
                  onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                />

                {/* 2. Business & LinkedIn Carousel */}
                <CarouselSection
                  icon={<Briefcase className="w-5 h-5 text-blue-500" />}
                  title={heroCopy.businessTitle}
                  subtitle={heroCopy.businessSub}
                  templates={businessTemplates}
                  onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                />

                {/* 3. High Fashion & Street Style Carousel */}
                <CarouselSection
                  icon={<Shirt className="w-5 h-5 text-violet-500" />}
                  title={heroCopy.fashionTitle}
                  subtitle={heroCopy.fashionSub}
                  templates={fashionTemplates}
                  onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                />

                {/* 4. Couple & Romance Carousel */}
                <CarouselSection
                  icon={<Heart className="w-5 h-5 text-rose-500" />}
                  title={heroCopy.coupleTitle}
                  subtitle={heroCopy.coupleSub}
                  badge="Love"
                  templates={coupleTemplates}
                  onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                />

                {/* 5. Lifestyle & Artisan Coffee Carousel */}
                <CarouselSection
                  icon={<Coffee className="w-5 h-5 text-amber-600" />}
                  title={heroCopy.lifestyleTitle}
                  subtitle={heroCopy.lifestyleSub}
                  templates={lifestyleTemplates}
                  onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                />

                {/* 6. Castles & Gala Heritage Carousel */}
                <CarouselSection
                  icon={<Castle className="w-5 h-5 text-emerald-500" />}
                  title={heroCopy.heritageTitle}
                  subtitle={heroCopy.heritageSub}
                  templates={heritageTemplates}
                  onSelect={(tmpl) => quickSelectTemplate(tmpl)}
                  onPreview={(tmpl) => setPreviewTemplate(tmpl)}
                />
              </div>
            )}

            {/* PHOTO PACKS SHOWCASE BANNER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-100 dark:from-amber-500/15 dark:via-purple-500/10 dark:to-[#12141c] border border-amber-500/20 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{heroCopy.packTitle}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                    {language === 'ru' && 'Хотите полноценную фотосессию?'}
                    {language === 'ro' && 'Vrei o ședință foto completă?'}
                    {language === 'en' && 'Want a full photoshoot series?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {heroCopy.packSub}
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black dark:bg-amber-400 dark:text-black text-white text-xs font-bold shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 dark:text-black" />
                    <span>
                      {language === 'ru' && 'Создать фотопак'}
                      {language === 'ro' && 'Creează pachet foto'}
                      {language === 'en' && 'Create photo pack'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* PRICING & CREDIT SHOP */}
            <section id="pricing-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100 dark:border-white/5">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                  {heroCopy.pricingTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {heroCopy.pricingSub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {creditPackages.map((pkg) => {
                  const isPopular = pkg.isPopular;
                  return (
                    <div
                      key={pkg.id}
                      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                        isPopular
                          ? 'bg-slate-900 text-white dark:bg-gradient-to-b dark:from-[#1b1c28] dark:to-[#12141c] border-2 border-amber-500 shadow-xl dark:shadow-amber-500/10'
                          : 'bg-white dark:bg-[#12141c] text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/10 shadow-xs'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          {t.popularBadge}
                        </div>
                      )}

                      <div>
                        <h3 className="font-display text-lg font-bold">
                          {pkg.name[language] || pkg.name.ro}
                        </h3>
                        <p className={`text-xs mt-1 ${isPopular ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {pkg.credits + pkg.bonusCredits} {language === 'ru' ? 'студийных фотосессий' : language === 'en' ? 'studio photoshoot credits' : 'credite foto de studio'}
                        </p>

                        <div className="mt-6 flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums">
                            {pkg.credits}
                          </span>
                          <span className="text-xs font-semibold uppercase opacity-75">
                            {t.credits}
                          </span>
                          {pkg.bonusCredits > 0 && (
                            <span className="text-xs font-bold text-amber-400">
                              +{pkg.bonusCredits} bonus
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-2xl font-bold font-display tabular-nums">
                          {currency === 'MDL' ? pkg.priceMDL : currency === 'RON' ? pkg.priceRON : pkg.priceEUR} {currency}
                        </div>

                        <div className="mt-6 space-y-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${isPopular ? 'text-amber-400' : 'text-emerald-500'}`} />
                            <span>{pkg.credits} студийных генераций</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${isPopular ? 'text-amber-400' : 'text-emerald-500'}`} />
                            <span>Ultra-HD 4K без водяного знака</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${isPopular ? 'text-amber-400' : 'text-emerald-500'}`} />
                            <span>Доступ ко всем шаблонам и Pinterest</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCreditModalOpen(true)}
                        className={`mt-8 w-full py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                          isPopular
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md font-extrabold'
                            : 'bg-slate-900 hover:bg-black text-white dark:bg-white/10 dark:hover:bg-white/20'
                        }`}
                      >
                        {t.buyCredits}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* INTERACTIVE FAQ ACCORDION */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>FAQ</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                  {heroCopy.faqTitle}
                </h2>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#12141c] overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-amber-500' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3 animate-in fade-in duration-150">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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

      {/* FOOTER (Clean, Quiet, Anti-Slop, No Countries Plastered) */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#07080b] py-8 text-center text-xs text-slate-500 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900 dark:text-white text-sm">AuraStudio</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[11px] text-slate-400">AI Photo Studio</span>
          </div>

          <div className="text-[11px] text-slate-400">
            {t.footerTagline}
          </div>

          <div className="text-[11px] text-slate-400">
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
