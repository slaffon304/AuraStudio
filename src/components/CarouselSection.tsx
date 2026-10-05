import React, { useRef, useState, useCallback } from 'react';
import { PhotoTemplate } from '../types';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles, Eye, ArrowRight } from 'lucide-react';

interface CarouselSectionProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  templates: PhotoTemplate[];
  onSelect: (template: PhotoTemplate) => void;
  onPreview: (template: PhotoTemplate) => void;
  badge?: string;
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({
  icon,
  title,
  subtitle,
  templates,
  onSelect,
  onPreview,
  badge
}) => {
  const { language, t } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!templates || templates.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header with Carousel Navigation Controls */}
      <div className="flex items-end justify-between mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-amber-500">{icon}</span>}
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {badge && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {badge}
              </span>
            )}
            <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400 dark:text-slate-500">
              ({templates.length} {language === 'ru' ? 'образов' : language === 'en' ? 'looks' : 'stiluri'})
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-amber-500/40 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-amber-500/40 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track with Drag and Swipe Support */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar select-none cursor-grab active:cursor-grabbing ${
          isMouseDown ? 'cursor-grabbing' : ''
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {templates.map((template) => {
          const name = template.name[language] || template.name.ro;
          const description = template.description[language] || template.description.ro;

          return (
            <div
              key={template.id}
              onClick={() => {
                if (!isDragging) {
                  onSelect(template);
                }
              }}
              className="flex-shrink-0 w-[240px] sm:w-[270px] md:w-[290px] snap-start group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-white/[0.08] shadow-xs hover:shadow-xl hover:border-amber-500/50 dark:hover:border-amber-400/50 transition-all duration-300 cursor-pointer"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={template.previewImage}
                  alt={name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
                />

                {/* Subtle dark gradient on bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Quick Preview Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(template);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 text-white backdrop-blur-md hover:bg-black/85 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Quick Action Button on Image Hover */}
                <div className="absolute inset-x-3 bottom-3 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(template);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-amber-400 dark:via-amber-500 dark:to-amber-500 dark:text-slate-950 hover:brightness-110 shadow-lg shadow-black/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                    <span>{t.useTemplate}</span>
                  </button>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {template.aspectRatio}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{language === 'ru' ? 'Примерить' : language === 'en' ? 'Try this' : 'Alege'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
