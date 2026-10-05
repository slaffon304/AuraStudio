import React from 'react';
import { PhotoTemplate } from '../types';
import { useApp } from '../context/AppContext';
import { ArrowUpRight } from 'lucide-react';

interface TemplateCardProps {
  template: PhotoTemplate;
  onPreview: (template: PhotoTemplate) => void;
  variant?: 'grid' | 'carousel';
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview, variant = 'grid' }) => {
  const { language, t } = useApp();
  const name = template.name[language] || template.name.ro;
  const category = t.categories[template.category] || template.category;
  const compact = variant === 'carousel';

  return (
    <button
      type="button"
      onClick={() => onPreview(template)}
      aria-label={`${name} — ${t.useTemplate}`}
      className={`group relative block w-full snap-start overflow-hidden bg-[#dfe4ee] text-left outline-none ring-[#5971f4] transition focus-visible:ring-2 ${
        compact ? 'aspect-[4/5] rounded-[18px]' : 'aspect-[4/5] rounded-[20px]'
      }`}
    >
      <img
        src={template.previewImage}
        alt={name}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#11182d]/80 via-[#11182d]/10 to-transparent" />

      <span className={`absolute left-2.5 top-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold leading-none text-[#4d5b79] shadow-sm backdrop-blur ${compact ? 'sm:text-[10px]' : 'text-[10px]'}`}>
        {category}
      </span>

      <span className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 text-white ${compact ? 'p-2.5' : 'p-3 sm:p-3.5'}`}>
        <span className={`line-clamp-2 font-semibold leading-tight ${compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
          {name}
        </span>
        {!compact && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#536dfe] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        )}
      </span>
    </button>
  );
};
