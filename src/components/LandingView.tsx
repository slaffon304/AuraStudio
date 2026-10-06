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

  // 3 tilted cards at top
  const topPreviewCards = [
    activeTemplates[3] || activeTemplates[0],
    activeTemplates[4] || activeTemplates[1],
    activeTemplates[2] || activeTemplates[0]
  ].filter(Boolean);

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

  // Photo packages
  const packages = [
    {
      title: t.landingPackagePortrait,
      image: resultWoman2EditorialImg
    },
    {
      title: t.landingPackageCouple,
      image: activeTemplates.find((tpl) => tpl.category === 'Couple')?.previewImage || activeTemplates[1]?.previewImage
    },
    {
      title: t.landingPackageEditorial,
      image: activeTemplates.find((tpl) => tpl.category === 'Fashion')?.previewImage || activeTemplates[2]?.previewImage
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
                  {topPreviewCards.map((card, idx) => (
                    <div
                      key={`preview-${idx}`}
                      className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-2xl bg-white p-1 pb-3 shadow-[0_12px_28px_rgba(30,35,70,0.16)] sm:w-32 transition-transform duration-300"
                      style={{ transform: tiltedTransforms[idx] }}
                    >
                      <img
                        src={card.previewImage}
                        alt={card.name[language] || card.name.ro}
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

        {/* SECTION 3: PHOTO PACKAGES */}
        <section
          id="photo-packages"
          className="scroll-mt-24 px-4 py-12 sm:px-7 sm:py-16 lg:px-10"
        >
          <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] bg-[#11162c] px-5 py-8 text-white shadow-[0_24px_70px_rgba(27,32,66,0.12)] sm:rounded-[36px] sm:px-9 sm:py-10 lg:px-11 lg:py-12">
            <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#6954ef]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 left-[28%] h-72 w-72 rounded-full bg-[#a937bb]/15 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="max-w-[650px]">
                  <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#aab4ff] sm:text-[10px]">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{t.landingPackagesEyebrow}</span>
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl">
                    {t.landingPackagesTitle}
                  </h2>
                  <p className="mx-auto mt-2 max-w-[600px] text-[11px] leading-relaxed text-white/60 sm:text-sm">
                    {t.landingPackagesSub}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-semibold text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a9b4ff]" />
                  <span>{t.landingPackagesStatus}</span>
                </div>
              </div>

              <div className="mx-auto mt-6 grid max-w-[1040px] gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
                {packages.map((pkg, idx) => (
                  <article
                    key={idx}
                    className="relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-white/[0.055] p-4 backdrop-blur-sm sm:p-5"
                  >
                    {pkg.image && (
                      <img
                        src={pkg.image}
                        alt=""
                        loading="lazy"
                        className="absolute right-0 top-0 h-32 w-24 object-cover opacity-[0.18] [mask-image:linear-gradient(to_left,black,transparent)]"
                      />
                    )}
                    <div className="relative flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#b5bfff]">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/55">
                        {t.landingPackageDraft}
                      </span>
                    </div>

                    <h3 className="relative mt-4 text-[13px] font-bold text-white sm:text-sm">
                      {pkg.title}
                    </h3>

                    <div className="relative mt-4 space-y-2.5 border-t border-white/10 pt-3 text-[10px] sm:text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/55">{t.landingPackagePhotoCount}</span>
                        <span className="text-right font-semibold text-white/85">
                          {t.landingPackagePending}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/55">{t.landingPackagePrice}</span>
                        <span className="text-right font-semibold text-white/85">
                          {t.landingPackagePending} · {currency}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="relative mt-4 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-[10px] font-bold text-white/40 sm:text-[11px]"
                    >
                      {t.landingPackageUnavailable}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FAQ */}
        <section
          id="faq"
          className="scroll-mt-24 mx-auto w-full max-w-[900px] px-4 pb-12 sm:px-7 sm:pb-16 lg:px-10"
        >
          <div className="mx-auto mb-8 max-w-[560px] text-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#737ee0] sm:text-[10px]">
              {t.landingFaqEyebrow}
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.035em] text-[#1d2540] sm:text-3xl dark:text-white">
              {t.landingFaqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map(([question, answer], idx) => (
              <details
                key={idx}
                className="group rounded-[18px] border border-[#e7e8ee] bg-white px-5 py-4 shadow-[0_4px_18px_rgba(38,43,72,0.025)] open:shadow-[0_10px_28px_rgba(38,43,72,0.06)] sm:px-6 dark:border-white/10 dark:bg-[#141724]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] sm:text-[13px] font-bold leading-relaxed text-[#303a57] dark:text-slate-100">
                  <span>{question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#8792aa] transition group-open:rotate-180" />
                </summary>
                <p className="max-w-[760px] pt-3 text-[11px] leading-[1.8] text-[#7f889b] sm:text-xs dark:text-slate-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* SECTION 5: FINAL CTA BANNER */}
        <section className="px-4 pb-12 sm:px-7 sm:pb-16 lg:px-10">
          <div className="relative mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e8ebff] via-[#f0e9ff] to-[#f9eaf1] px-6 py-8 text-center sm:flex-row sm:px-10 sm:py-9 sm:text-left dark:from-[#14182d] dark:via-[#19142c] dark:to-[#211725]">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#8b5cf6]/15 blur-3xl" />
            <div className="relative max-w-[640px]">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-[#1b2340] sm:text-2xl dark:text-white">
                {t.landingFinalTitle}
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-[#727b91] sm:text-sm dark:text-slate-400">
                {t.landingFinalBody}
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToApp}
              className="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#5368f3] px-7 text-xs font-bold text-white shadow-[0_8px_20px_rgba(83,104,243,0.2)] transition hover:bg-[#455be8] sm:text-sm cursor-pointer"
            >
              <span>{t.landingCta}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e9e9ed] bg-white/55 px-4 py-8 text-center text-[11px] text-[#969dac] sm:py-10 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-400">
        <img
          src={logoImg}
          alt="AuraStudio"
          className="mx-auto h-8 sm:h-9 w-auto object-contain dark:brightness-110"
        />
        <p className="mt-3">{t.landingFooterTagline}</p>
        <p className="mt-1">
          © {new Date().getFullYear()}. {t.rightsReserved}
        </p>
      </footer>
    </div>
  );
};
