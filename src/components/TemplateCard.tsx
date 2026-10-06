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

  const aspectClass =
    template.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : template.aspectRatio === '4:3'
      ? 'aspect-[4/3]'
      : template.aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : 'aspect-[3/4]';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#12141c] transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl shadow-xs">
      {/* Visual Image Container */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer`} onClick={() => onPreview(template)}>
        <img
          src={template.previewImage}
          alt={name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Quick Preview Icon in top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90"
          title="Preview"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Hover / Tap CTA Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-400 py-2.5 px-4 text-xs font-bold text-white dark:text-slate-950 shadow-lg active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-400 dark:text-slate-950" />
            <span>{t.useTemplate}</span>
          </button>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400">{template.category}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span>{template.aspectRatio}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Coins className="h-3 w-3 text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">{template.creditCost}</span> {t.credits.toLowerCase()}
            </span>
          </div>

          <h3 className="mt-1 font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
