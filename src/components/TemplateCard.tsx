import React from 'react';
import { PhotoTemplate } from '../types';
import { useApp } from '../context/AppContext';
import { Sparkles, Coins, Eye } from 'lucide-react';

interface TemplateCardProps {
  template: PhotoTemplate;
  onSelect: (template: PhotoTemplate) => void;
  onPreview: (template: PhotoTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onPreview }) => {
  const { language, t } = useApp();
  const name = template.name[language] || template.name.ro;
  const description = template.description[language] || template.description.ro;

  // Aspect ratio styling
  const aspectClass =
    template.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : template.aspectRatio === '4:3'
      ? 'aspect-[4/3]'
      : template.aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : 'aspect-[3/4]';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141c] transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/60">
      {/* Visual Image Container */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-900 cursor-pointer`} onClick={() => onPreview(template)}>
        <img
          src={template.previewImage}
          alt={name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Dark Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-transparent to-black/30 pointer-events-none" />

        {/* Quick Preview Icon in top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-md transition-all hover:bg-black/90 hover:text-white"
          title="Previzualizează detaliat"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Hover / Tap CTA Overlay (Desktop & Mobile accessible) */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-2.5 px-4 text-xs font-semibold text-slate-950 shadow-lg shadow-black/80 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.useTemplate}</span>
          </button>
        </div>
      </div>

      {/* Card Metadata (Zero-Pill Discipline: Unboxed Text with Separators) */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          {/* Subtle Clean Metadata Row */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="font-medium text-amber-400/90">{template.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{template.aspectRatio}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Coins className="h-3 w-3 text-amber-400" />
              <span className="font-semibold text-white">{template.creditCost}</span> {t.credits.toLowerCase()}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-1 font-display text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
            {name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
