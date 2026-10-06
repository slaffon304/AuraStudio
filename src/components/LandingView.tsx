import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Zap,
  Upload,
  CheckCircle2,
  ChevronDown,
  Camera,
  Star
} from 'lucide-react';
import logoImg from '../assets/images/aurastudio-logo.png';
import heroFaceBeforeImg from '../assets/images/hero_face_before_1791279356294.jpg';
import heroEditorialAfterImg from '../assets/images/hero_editorial_after_1791279364462.jpg';
import refWoman2FaceImg from '../assets/images/ref_face_woman2_1791279674470.jpg';
import resultWoman2EditorialImg from '../assets/images/result_vogue_woman2_1791279688635.jpg';

// Headline rotating words
const HEADLINE_ROTATING_WORDS = {
  ro: ['portrete', 'avatare', 'cadre', 'trenduri'],
  ru: ['портреты', 'аватарки', 'кадры', 'тренды'],
  en: ['portraits', 'avatars', 'shots', 'trends']
};

// Wish bubble rotating phrases of uniform character length
const WISH_ROTATING_PHRASES = {
  ru: [
    'тренд из Reels',
    'фото с парнем',
    'новую аватарку',
    'образ из кино'
  ],
  ro: [
    'trend din Reels',
    'foto cu iubitul',
    'un avatar modern',
    'un cadru de film'
  ],
  en: [
    'trend from Reels',
    'photo with crush',
    'brand new avatar',
    'cinematic portrait'
  ]
};

export const RotatingWord: React.FC<{ words: string[]; intervalMs?: number }> = ({
  words,
  intervalMs = 2200
}) => {
  const [state, setState] = useState({ current: 0, previous: -1 });

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(() => {
      setState((prev) => ({
        current: (prev.current + 1) % words.length,
        previous: prev.current
      }));
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [words.length, intervalMs]);

  const longest = useMemo(
    () => words.reduce((a, b) => (b.length > a.length ? b : a), words[0]),
    [words]
  );

  return (
    <span className="relative inline-block align-baseline whitespace-nowrap text-[#4c63ed] dark:text-[#8ba0ff]">
      <span aria-hidden="true" className="invisible">
        {longest}
      </span>
      <span
        key={`current-${state.current}`}
        aria-hidden="true"
        className="hero-word-in absolute inset-0 inline-block whitespace-nowrap text-center"
      >
        {words[state.current]}
      </span>
      {state.previous >= 0 && (
        <span
          key={`prev-${state.previous}`}
          aria-hidden="true"
          className="hero-word-out absolute inset-0 inline-block whitespace-nowrap text-center"
        >
          {words[state.previous]}
        </span>
      )}
    </span>
  );
};

interface LandingViewProps {
  onGoToApp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGoToApp }) => {
  const {
    t,
    language,
    currency,
    templates,
    setCurrentView,
    setIsAuthModalOpen
  } = useApp();

  const headlineWords = HEADLINE_ROTATING_WORDS[language] || HEADLINE_ROTATING_WORDS.ru;
  const wishPhrases = WISH_ROTATING_PHRASES[language] || WISH_ROTATING_PHRASES.ru;

  const activeTemplates = templates.filter((tpl) => tpl.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  // 3 tilted cards at top — always use real photos (local assets as reliable fallback)
  const fallbackHeroImgs = [
    resultWoman2EditorialImg,
    heroEditorialAfterImg,
    refWoman2FaceImg
  ];
  const topPreviewCards = [
    activeTemplates[3] || activeTemplates[0],
    activeTemplates[4] || activeTemplates[1],
    activeTemplates[2] || activeTemplates[0]
  ];
  const topCardImages = topPreviewCards.map((card, i) =>
    card?.previewImage || fallbackHeroImgs[i] || fallbackHeroImgs[0]
  );

  const tiltedTransforms = [
    'rotate(-8deg) translateY(0px)',
    'rotate(4deg) translateY(12px)',
    'rotate(-3deg) translateY(4px)'
  ];

  // How it works steps
  const steps = [
    {
      number: '01',
      title: t.landingStep1Title,
      body: t.landingStep1Body,
      icon: <Camera className="h-5 w-5" />
    },
    {
      number: '02',
      title: t.landingStep2Title,
      body: t.landingStep2Body,
      icon: <Upload className="h-5 w-5" />
    },
    {
      number: '03',
      title: t.landingStep3Title,
      body: t.landingStep3Body,
      icon: <Sparkles className="h-5 w-5" />
    }
  ];

  // Photo packages (EUR placeholders — user will adjust prices)
  const packages = [
    {
      id: 'single',
      title: t.landingPkg1Title,
      priceMain: '4.90',
      priceNote: t.landingPkg1Note,
      description: t.landingPkg1Desc,
      isPopular: false,
      photos: 1
    },
    {
      id: 'studio',
      title: t.landingPkg2Title,
      priceMain: '1.90',
      priceNote: t.landingPkg2Note,
      description: t.landingPkg2Desc,
      isPopular: true,
      photos: 10
    },
    {
      id: 'session',
      title: t.landingPkg3Title,
      priceMain: '1.20',
      priceNote: t.landingPkg3Note,
      description: t.landingPkg3Desc,
      isPopular: false,
      photos: 40
    }
  ];

  // FAQ items
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
      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="pointer-events-none absolute -left-48 top-12 h-[420px] w-[420px] rounded-full bg-[#e7eaff]/70 blur-3xl dark:bg-[#536dfe]/[0.08]" />
          <div className="pointer-events-none absolute -right-48 top-24 h-[420px] w-[420px] rounded-full bg-[#f2e8ff]/70 blur-3xl dark:bg-[#a855f7]/[0.07]" />

          <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-8 px-4 py-8 sm:px-7 sm:py-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 lg:px-10 lg:py-16 xl:py-20">
            {/* LEFT COLUMN: HEADLINE, BADGE, SUBTITLE, CTA */}
            <div className="mx-auto max-w-[650px] text-center lg:mx-0">
              {/* MOBILE: ONE WORD PER ROW (Prompt 2 requirement) */}
              <div className="sm:hidden flex flex-col items-center justify-center font-display text-4xl min-[380px]:text-[44px] font-extrabold leading-[1.12] tracking-tight text-[#181d32] dark:text-white">
                <span>{t.landingHeadlineLead}</span>
                <span className="my-0.5">
                  <RotatingWord words={headlineWords} />
                </span>
                <span>{language === 'ru' ? 'одной' : language === 'ro' ? 'cu un' : 'in one'}</span>
                <span>{language === 'ru' ? 'кнопкой' : language === 'ro' ? 'click' : 'click'}</span>
              </div>

              {/* DESKTOP / TABLET: LARGER TYPOGRAPHY (Prompt 2 requirement) */}
              <h1 className="hidden sm:block max-w-[680px] font-display text-5xl sm:text-6xl lg:text-[68px] xl:text-[76px] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#181d32] dark:text-white">
                <span className="block">
                  {t.landingHeadlineLead} <RotatingWord words={headlineWords} />
                </span>
                <span className="block">{t.landingHeadlineTail}</span>
              </h1>

              {/* Blue Pill Badge */}
              <div className="mx-auto mt-6 inline-flex max-w-[560px] items-center justify-center gap-2.5 rounded-full bg-[#e8eeff] px-5 py-3 text-center shadow-[0_8px_24px_rgba(76,99,237,0.10)] sm:px-6 dark:bg-white/[0.06]">
                <Sparkles className="h-4 w-4 shrink-0 text-[#4c63ed] dark:text-[#8ba0ff]" />
                <span className="text-[13px] font-bold leading-snug text-[#3b56f5] sm:text-sm dark:text-[#a9b9ff]">
                  {t.landingBadge}
                </span>
              </div>

              {/* Subhead */}
              <p className="mx-auto mt-5 max-w-[540px] text-balance text-[13px] leading-[1.8] text-[#777f92] sm:mt-6 sm:text-[15px] dark:text-slate-400">
                {t.landingSubhead}
              </p>

              {/* CTA Action */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
                <button
                  type="button"
                  onClick={onGoToApp}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5368f3] px-7 text-xs font-bold text-white shadow-[0_10px_26px_rgba(83,104,243,0.24)] transition hover:-translate-y-0.5 hover:bg-[#455be8] active:translate-y-0 sm:px-8 sm:text-sm cursor-pointer"
                >
                  <span>{t.landingCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Small note */}
              <p className="mx-auto mt-4 max-w-[430px] text-[10px] leading-relaxed text-[#9a9eaa] sm:text-[11px] dark:text-slate-500">
                {t.landingHeroNote}
              </p>
            </div>

            {/* RIGHT COLUMN: SHOWCASE CARDS, SPEECH BUBBLE, BEFORE & AFTER PAIR */}
            <div className="relative mx-auto w-full max-w-[590px] px-2 pb-7 pt-1 sm:px-5 sm:pb-10 lg:mr-0">
              {/* Ambient Glow */}
              <div className="pointer-events-none absolute inset-x-[12%] bottom-[8%] top-[4%] rounded-full bg-gradient-to-br from-[#dce2ff] via-[#f4e3ff] to-[#ffe7d8] opacity-80 blur-3xl dark:from-[#536dfe]/20 dark:via-[#9d4edd]/15 dark:to-[#ee80a6]/10" />

              {/* TOP: 3 TILTED CARDS WITH STICKERS */}
              <div className="relative z-10 mx-auto mt-3 w-full max-w-[440px] px-2 sm:mt-5 sm:max-w-[520px]">
                {/* Sticker: ❤️ готово */}
                <span className="pointer-events-none absolute -top-3 left-[3%] z-30 -rotate-6 rounded-full bg-[#f472b6] px-3 py-1.5 text-[10px] font-display font-bold text-white shadow-[0_8px_20px_rgba(30,35,70,0.18)] sm:px-3.5 sm:text-xs">
                  {t.heroStickerReady}
                </span>

                {/* Sticker: ⚡ 10 секунд */}
                <span className="pointer-events-none absolute right-[5%] top-1 z-30 rotate-3 rounded-full bg-[#a78bfa] px-3 py-1.5 text-[10px] font-display font-bold text-white shadow-[0_8px_20px_rgba(30,35,70,0.18)] sm:px-3.5 sm:text-xs">
                  {t.heroStickerFast}
                </span>

                {/* 3 tilted cards */}
                <div className="flex items-end justify-center gap-2 sm:gap-4">
                  {topCardImages.map((imgSrc, idx) => (
                    <div
                      key={`preview-${idx}`}
                      className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-2xl bg-white p-1 pb-3 shadow-[0_12px_28px_rgba(30,35,70,0.16)] sm:w-32 transition-transform duration-300"
                      style={{ transform: tiltedTransforms[idx] }}
                    >
                      <img
                        src={imgSrc}
                        alt=""
                        className="h-full w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* MIDDLE: SPEECH BUBBLE WITH ROTATING PHRASES OF EQUAL LENGTH & ARROW */}
              <div className="relative z-10 mx-auto mt-5 flex w-fit max-w-full flex-col items-center">
                <div className="relative inline-flex max-w-full items-start gap-2 rounded-[24px] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(32,39,75,0.14)] sm:px-5 dark:bg-[#171b2d]">
                  <span className="text-xl leading-none">🙋</span>
                  <span className="font-display text-[15px] font-bold leading-snug text-[#1b2340] sm:text-base dark:text-white">
                    {t.heroWishLead} <RotatingWord words={wishPhrases} />
                  </span>
                  <span className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 bg-white dark:bg-[#171b2d]" />
                </div>

                {/* Blue wavy arrow pointing down */}
                <svg
                  width="50"
                  height="60"
                  viewBox="0 0 50 60"
                  fill="none"
                  className="my-2 sm:my-3"
                  aria-hidden="true"
                >
                  <path
                    d="M24 4 C12 14 38 24 26 37 C23.5 40.5 25 47 25 55"
                    stroke="#4c63ed"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M18.5 48.5 L25 55.5 L31.5 48.5"
                    stroke="#4c63ed"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>

              {/* SHOWCASE CARDS:
                  БОЛЬШОЕ ФОТО (ПОСЛЕ): ОДИН ЧЕЛОВЕК в студийном эдиториале
                  МАЛЕНЬКОЕ ФОТО (ДО): ТОЛЬКО ЛИЦО С ПОМЕТКОЙ "ДО" (референс)
                  (Prompt 2 requirement) */}
              <div className="relative ml-auto aspect-[4/4.7] w-[82%] sm:w-[78%] overflow-hidden rounded-[30px] bg-[#dce0eb] shadow-[0_28px_70px_rgba(30,35,70,0.2)] ring-1 ring-white/80 sm:rounded-[38px] dark:ring-white/10 group cursor-pointer"
                   onClick={onGoToApp}
              >
                {/* Большое фото ПОСЛЕ (Один человек!) */}
                <img
                  src={resultWoman2EditorialImg}
                  alt="Результат ПОСЛЕ"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10152b]/70 via-transparent to-[#10152b]/5" />

                {/* Бейдж: ПРИМЕР СТИЛЯ */}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#4d5875] shadow-xs backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
                  <Sparkles className="h-3.5 w-3.5 text-[#586df2]" />
                  <span>{t.landingHeroExample}</span>
                </span>

                {/* Бейдж: сделано ИИ */}
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#4d5875] shadow-xs backdrop-blur-md sm:right-4 sm:top-4 sm:px-3 sm:text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{language === 'ru' ? 'сделано ИИ' : language === 'ro' ? 'generat de AI' : 'made by AI'}</span>
                </span>

                {/* Нижняя подпись стиля */}
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-14 text-white sm:px-6 sm:pb-6">
                  <p className="text-[10px] font-medium text-white/70">
                    {language === 'ru' ? 'High Fashion & Editorial' : 'High Fashion & Editorial'}
                  </p>
                  <p className="mt-1 text-sm font-bold sm:text-lg">
                    {language === 'ru' ? 'Студийный портрет Vogue' : 'Portret de Studio Vogue'}
                  </p>
                </div>
              </div>

              {/* МАЛЕНЬКОЕ ФОТО В УГЛУ: ТОЛЬКО ЛИЦО С ПОМЕТКОЙ "ДО" (референс) */}
              <div className="absolute bottom-[10%] left-0 z-20 aspect-[0.82] w-[36%] sm:w-[34%] -rotate-6 overflow-hidden rounded-[20px] border-[5px] border-white bg-white shadow-[0_18px_40px_rgba(30,35,70,0.22)] sm:bottom-[12%] sm:left-1 sm:rounded-[26px] sm:border-[7px]">
                <img
                  src={refWoman2FaceImg}
                  alt="До (референс)"
                  className="h-full w-full rounded-[14px] object-cover sm:rounded-[18px]"
                />
                {/* Бейдж "до" */}
                <div className="absolute bottom-1.5 left-1.5 z-30">
                  <span className="inline-block rounded-full bg-slate-950/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                    {language === 'ru' ? 'до' : language === 'ro' ? 'înainte' : 'before'}
                  </span>
                </div>
              </div>

              {/* Пилл внизу справа: Выбери подходящий образ */}
              <div className="absolute bottom-[1%] right-[1%] z-20 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 text-[9px] font-semibold text-[#525d78] shadow-[0_8px_26px_rgba(32,39,75,0.16)] sm:bottom-[3%] sm:px-4 sm:py-2.5 sm:text-[10px] dark:border-white/10 dark:bg-[#171b2d] dark:text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#edf0ff] text-[#5269ef] dark:bg-indigo-400/10 dark:text-indigo-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <span>{t.landingHeroBadge}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-y border-[#ececf1] bg-white/70 py-12 sm:py-16 dark:border-white/10 dark:bg-white/[0.02]"
        >
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-7 lg:px-10">
            <div className="mx-auto max-w-[620px] text-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#737ee0] sm:text-[10px]">
                {t.landingStepsEyebrow}
              </span>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.035em] text-[#1c2541] sm:text-3xl dark:text-white">
                {t.landingHowTitle}
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-[#8991a3] sm:text-sm dark:text-slate-400">
                {t.landingHowSub}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="group rounded-[22px] border border-[#e9eaf0] bg-white p-5 shadow-[0_8px_24px_rgba(35,42,75,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_34px_rgba(35,42,75,0.08)] sm:p-6 dark:border-white/10 dark:bg-[#141724]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eff1ff] text-[#596df0] dark:bg-indigo-400/10 dark:text-indigo-300">
                      {step.icon}
                    </span>
                    <span className="font-display text-sm font-extrabold tracking-widest text-[#c8ccda] dark:text-slate-600">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[13px] font-bold text-[#26304c] sm:text-sm dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-[1.75] text-[#8790a4] sm:text-xs dark:text-slate-400">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: PHOTO PACKAGES / ТАРИФЫ */}
        <section
          id="photo-packages"
          className="scroll-mt-24 px-4 py-12 sm:px-7 sm:py-16 lg:px-10"
        >
          <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[28px] bg-[#0b1220] px-5 py-12 text-white sm:rounded-[36px] sm:px-10 sm:py-16 lg:px-14">
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#6366f1]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 left-[20%] h-72 w-72 rounded-full bg-[#ec4899]/10 blur-3xl" />

            <div className="relative text-center">
              <h2 className="font-display text-[32px] font-extrabold tracking-tight sm:text-[40px]">
                {t.landingPackagesTitle}
              </h2>
              {/* AI-generated content star marker (like reference) */}
              <div className="mt-3 flex justify-center" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#8b9cff]">
                  <path
                    d="M12 2.5l1.6 5.1L19 9l-5.1 1.6L12 15.8l-1.9-5.2L5 9l5.1-1.4L12 2.5zM18.5 14.2l.9 2.7 2.8.9-2.8.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7zM5.8 15.5l.6 1.8 1.9.6-1.9.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <p className="mx-auto mt-3 max-w-[420px] text-[13px] leading-relaxed text-white/50 sm:text-[14px]">
                {t.landingPackagesSub}
              </p>
            </div>

            <div className="relative mx-auto mt-10 grid max-w-[980px] gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5 items-stretch">
              {packages.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`relative flex flex-col rounded-[20px] bg-white p-5 text-[#1a2035] sm:p-6 ${
                    pkg.isPopular
                      ? 'ring-2 ring-[#5b6ef5] sm:scale-[1.02] z-10 shadow-[0_12px_40px_rgba(91,110,245,0.25)]'
                      : 'shadow-lg'
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-[#5b6ef5] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                      <Sparkles className="h-3 w-3" />
                      {t.popularBadge}
                    </span>
                  )}

                  <h3 className="text-[20px] font-bold leading-[1.25] tracking-tight text-[#1a2035] sm:text-[22px]">
                    {pkg.title}
                  </h3>

                  <div className="mt-6">
                    <div className="flex items-end gap-1">
                      <span className="font-display text-[42px] font-extrabold leading-none tracking-tight text-[#1a2035] sm:text-[46px]">
                        {pkg.priceMain}
                      </span>
                      <span className="mb-1 text-[18px] font-bold text-[#1a2035]">
                        €{pkg.photos === 1 ? '' : t.landingPkgPerPhoto}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] font-medium text-[#8b93a7]">
                      {pkg.priceNote}
                    </p>
                  </div>

                  <div className="my-5 border-t border-[#eceef4]" />

                  <p className="flex-1 text-[13.5px] leading-[1.65] text-[#8b93a7]">
                    {pkg.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#f472b6] px-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(244,114,182,0.35)] transition hover:bg-[#ec4899] active:scale-[0.98] cursor-pointer"
                  >
                    {t.landingPkgBuy}
                  </button>
                </article>
              ))}
            </div>

            <p className="relative mt-8 text-center text-[12px] text-white/35 sm:text-[13px]">
              {t.landingPackagesFooter}
            </p>
          </div>
        </section>

        {/* SECTION 4: FAQ */}
        <section
          id="faq"
          className="scroll-mt-24 px-4 py-12 sm:px-7 sm:py-16 lg:px-10"
        >
          <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-[28px] bg-[#0f1629] px-5 py-10 text-white sm:rounded-[36px] sm:px-10 sm:py-12">
            <div className="mx-auto mb-8 max-w-[560px] text-center">
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t.landingFaqTitle}
              </h2>
              <p className="mt-2 text-[12px] text-white/45 sm:text-sm">
                {t.landingFaqSub}
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map(([question, answer], idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl bg-white/[0.06] px-5 py-4 open:bg-white/[0.09] transition-colors sm:px-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-semibold leading-relaxed text-white sm:text-[14px]">
                    <span>{question}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 group-open:bg-white/15">
                      <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                    </span>
                  </summary>
                  <p className="pt-3 text-[12px] leading-[1.75] text-white/55 sm:text-[13px]">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: FINAL CTA — Поехали, это бесплатно */}
        <section className="px-4 pb-8 sm:px-7 sm:pb-10 lg:px-10">
          <div className="relative mx-auto flex max-w-[520px] flex-col items-center overflow-hidden rounded-[28px] bg-[#0b1220] px-6 py-11 text-center sm:rounded-[32px] sm:px-10 sm:py-12">
            {/* Decorative stars */}
            <div className="pointer-events-none absolute -left-6 top-8 h-24 w-24 opacity-40" aria-hidden="true">
              <svg viewBox="0 0 100 100" fill="none" className="h-full w-full text-[#4c5fd5]">
                <path d="M50 5 L55 40 L90 50 L55 60 L50 95 L45 60 L10 50 L45 40 Z" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            <div className="pointer-events-none absolute -right-4 bottom-6 h-28 w-28 opacity-35" aria-hidden="true">
              <svg viewBox="0 0 100 100" fill="none" className="h-full w-full text-[#5b4fc7]">
                <path d="M50 8 L54 38 L88 50 L54 62 L50 92 L46 62 L12 50 L46 38 Z" fill="currentColor" opacity="0.55"/>
              </svg>
            </div>

            <h2 className="relative font-display text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
              {t.landingFinalTitle}
            </h2>
            <p className="relative mt-3 max-w-[380px] text-[13px] leading-relaxed text-white/50 sm:text-[14px]">
              {t.landingFinalBody}
            </p>
            <button
              type="button"
              onClick={onGoToApp}
              className="relative mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#4f63f0] px-8 text-[14px] font-bold text-white shadow-[0_10px_28px_rgba(79,99,240,0.35)] transition hover:bg-[#3f53e0] active:scale-[0.98] cursor-pointer"
            >
              <span>{t.landingFinalCta}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e9e9ed] bg-[#faf9f6] px-4 pb-10 pt-8 dark:border-white/10 dark:bg-[#090a0f]">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 text-center">
          {/* Telegram support pill */}
          <a
            href="https://t.me/aurastudio_help_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#e2e4ec] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#3a4560] shadow-sm transition hover:border-[#c8cce0] hover:bg-[#f7f8fc] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21.5 3.5L2.7 11.1c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .9-.3 1.2-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2.1-.9l3.7-17.4c.4-1.6-.6-2.3-1.7-1.8z" fill="#2AABEE"/>
            </svg>
            <span>{t.landingTelegramSupport}</span>
          </a>

          {/* Policy links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-[#8a92a6] dark:text-slate-500">
            <a href="#photo-packages" className="hover:text-[#4f63f0] transition-colors">{t.landingPackagesTitle}</a>
            <span className="text-[#d0d4de]">·</span>
            <a href="/privacy" className="hover:text-[#4f63f0] transition-colors">{t.landingPrivacy}</a>
            <span className="text-[#d0d4de]">·</span>
            <a href="/terms" className="hover:text-[#4f63f0] transition-colors">{t.landingTerms}</a>
            <span className="text-[#d0d4de]">·</span>
            <a href="/offer" className="hover:text-[#4f63f0] transition-colors">{t.landingOffer}</a>
          </nav>

          <p className="max-w-[520px] text-[11px] leading-relaxed text-[#a0a6b5] dark:text-slate-600">
            {t.landingFooterLegal}
          </p>
          <p className="text-[11px] text-[#b0b5c2] dark:text-slate-600">
            © {new Date().getFullYear()} AuraStudio. {t.rightsReserved}
          </p>
        </div>
      </footer>
    </div>
  );
};
