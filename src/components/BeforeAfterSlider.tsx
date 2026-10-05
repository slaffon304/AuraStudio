import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, MoveHorizontal, ArrowRight, Wand2 } from 'lucide-react';
import beforeSelfieImg from '../assets/images/before_selfie_casual_1791210820221.jpg';
import afterGoldenImg from '../assets/images/template_insta_golden_1791140819273.jpg';
import afterMilanImg from '../assets/images/template_fashion_milan_1791140809021.jpg';
import afterOrheiImg from '../assets/images/template_moldova_orhei_1791140775565.jpg';
import afterCoupleImg from '../assets/images/couple_editorial_sunset_1791210833350.jpg';

interface BeforeAfterPreset {
  id: string;
  name: { ro: string; ru: string; en: string };
  category: string;
  before: string;
  after: string;
  templateId: string;
}

const PRESETS: BeforeAfterPreset[] = [
  {
    id: 'golden-hour',
    name: {
      ro: 'Golden Hour Rooftop',
      ru: 'Золотой закат на крыше',
      en: 'Golden Hour Rooftop'
    },
    category: 'Pinterest Trend',
    before: beforeSelfieImg,
    after: afterGoldenImg,
    templateId: 'insta-golden-hour'
  },
  {
    id: 'milan-vogue',
    name: {
      ro: 'Street Style Milan Editorial',
      ru: 'Миланский эдиториал',
      en: 'Street Style Milan Editorial'
    },
    category: 'Fashion',
    before: beforeSelfieImg,
    after: afterMilanImg,
    templateId: 'fashion-milan-street'
  },
  {
    id: 'orhei-sunset',
    name: {
      ro: 'Apus de Aur Orheiul Vechi',
      ru: 'Закат в Старом Орхее',
      en: 'Sunset at Old Orhei'
    },
    category: 'Moldova',
    before: beforeSelfieImg,
    after: afterOrheiImg,
    templateId: 'moldova-orheiul-vechi'
  },
  {
    id: 'couple-paris',
    name: {
      ro: 'Romantism de Cuplu Editorial',
      ru: 'Романтичный парный портрет',
      en: 'Romantic Couple Editorial'
    },
    category: 'Couple',
    before: beforeSelfieImg,
    after: afterCoupleImg,
    templateId: 'couple-chișinău-sunset'
  }
];

interface BeforeAfterSliderProps {
  language: 'ro' | 'ru' | 'en';
  onSelectTemplate: (templateId: string) => void;
  onOpenCustomPinterest?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  language,
  onSelectTemplate,
  onOpenCustomPinterest
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePreset = PRESETS[activePresetIndex];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min((x / rect.width) * 100, 95));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const labels = {
    ro: {
      title: 'Transformare în 10 secunde',
      subtitle: 'Vezi cum un selfie obișnuit de pe telefon se transformă într-o ședință foto editorială ca pe Pinterest.',
      before: 'ÎNAINTE (Selfie)',
      after: 'DUPĂ (AuraStudio AI)',
      tryThis: 'Încearcă acest stil',
      customUpload: 'Sau încarcă propriul stil Pinterest',
      dragHint: 'Trage glisorul pentru comparație'
    },
    ru: {
      title: 'Трансформация за 10 секунд',
      subtitle: 'Посмотри, как обычное селфи с телефона превращается в глянцевую фотосессию как из Pinterest.',
      before: 'ДО (Селфи)',
      after: 'ПОСЛЕ (AuraStudio AI)',
      tryThis: 'Попробовать этот стиль',
      customUpload: 'Или загрузи свой референс из Pinterest',
      dragHint: 'Перетаскивай бегунок для сравнения'
    },
    en: {
      title: '10-Second Transformation',
      subtitle: 'See how an everyday smartphone selfie transforms into a luxury Pinterest-worthy studio photoshoot.',
      before: 'BEFORE (Raw Selfie)',
      after: 'AFTER (AuraStudio AI)',
      tryThis: 'Try This Style',
      customUpload: 'Or upload your own Pinterest reference',
      dragHint: 'Drag slider to compare'
    }
  }[language];

  return (
    <div className="relative w-full max-w-5xl mx-auto my-8 px-4">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{labels.title}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {language === 'ro' && 'Rezultate Reale: De la Selfie la Artă'}
          {language === 'ru' && 'Реальный результат: Из селфи в глянец'}
          {language === 'en' && 'Real Results: From Casual Selfie to Art'}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          {labels.subtitle}
        </p>

        {/* Preset Style Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {PRESETS.map((preset, index) => {
            const isActive = index === activePresetIndex;
            return (
              <button
                key={preset.id}
                onClick={() => setActivePresetIndex(index)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                {preset.name[language]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Slider Showcase */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl select-none">
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] cursor-ew-resize overflow-hidden"
        >
          {/* Base Layer: AFTER (AI Studio Shoot) */}
          <img
            src={activePreset.after}
            alt="After AI Studio"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Top Layer: BEFORE (Casual Selfie) with Clip Path */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={activePreset.before}
              alt="Before Casual Selfie"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none filter brightness-95"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md text-slate-300 border border-white/10 shadow-lg">
              {labels.before}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/90 text-black shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-black" />
              {labels.after}
            </span>
          </div>

          {/* Draggable Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-amber-500 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <MoveHorizontal className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Bottom Drag Helper */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-black/60 backdrop-blur-sm text-slate-300 text-[11px] px-3 py-1 rounded-full border border-white/10">
            {labels.dragHint}
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>{activePreset.name[language]}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {activePreset.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ro' && 'Gata în ~10 secunde • Păstrează trăsăturile feței tale 100%'}
              {language === 'ru' && 'Готово за ~10 секунд • 100% сохранение черт твоего лица'}
              {language === 'en' && 'Ready in ~10 seconds • 100% facial identity preservation'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onOpenCustomPinterest && (
              <button
                onClick={onOpenCustomPinterest}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{labels.customUpload}</span>
              </button>
            )}

            <button
              onClick={() => onSelectTemplate(activePreset.templateId)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group"
            >
              <span>{labels.tryThis}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
