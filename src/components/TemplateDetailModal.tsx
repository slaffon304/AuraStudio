import React, { useState } from 'react';
import { PhotoTemplate } from '../types';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Layers, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface TemplateDetailModalProps {
  template: PhotoTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: PhotoTemplate) => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelect
}) => {
  const { language, t } = useApp();
  const [showAfter, setShowAfter] = useState(true);

  if (!isOpen || !template) return null;

  const name = template.name[language] || template.name.ro;
  const description = template.description[language] || template.description.ro;
  const photoCost = template.photoCost ?? 1;
  const beforeUrl = template.beforeImage || '';
  const afterUrl = template.previewImage || '';
  const canToggle = Boolean(beforeUrl && afterUrl);
  const src = showAfter ? afterUrl : beforeUrl || afterUrl;

  const photoWord =
    language === 'ru'
      ? photoCost === 1
        ? 'фото'
        : 'фото'
      : language === 'en'
        ? photoCost === 1
          ? 'photo'
          : 'photos'
        : photoCost === 1
          ? 'foto'
          : 'foto';

  const getInputTypeLabel = (type: string) => {
    switch (type) {
      case 'single_portrait':
        return t.singlePortrait;
      case 'couple_portrait':
        return t.couplePortrait;
      case 'group_family':
        return t.groupFamily;
      case 'full_body':
        return t.fullBody;
      default:
        return t.anyPhoto;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-md hover:bg-black/90 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[420px] w-full overflow-hidden bg-slate-950">
            <img
              src={src}
              alt={name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-white">
              {showAfter
                ? language === 'ru'
                  ? 'После'
                  : language === 'en'
                    ? 'After'
                    : 'După'
                : language === 'ru'
                  ? 'До'
                  : language === 'en'
                    ? 'Before'
                    : 'Înainte'}
            </span>
            {canToggle && (
              <button
                type="button"
                onClick={() => setShowAfter((v) => !v)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl"
                aria-label="Toggle before/after"
              >
                <span className="flex items-center">
                  <ChevronLeft className="h-4 w-4 -mr-0.5" />
                  <ChevronRight className="h-4 w-4 -ml-0.5" />
                </span>
              </button>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-transparent md:hidden pointer-events-none" />
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-violet-400">{template.category}</span>
                <span className="text-slate-600">·</span>
                <span>{template.aspectRatio}</span>
                <span className="text-slate-600">·</span>
                <span className="font-medium text-white">
                  {photoCost} {photoWord}
                </span>
              </div>

              <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {name}
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">{description}</p>

              <div className="mt-6 space-y-3 rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-400">
                    <ImageIcon className="h-4 w-4 text-violet-400/80" />
                    <span>{t.requiredPhotoType}</span>
                  </span>
                  <span className="font-medium text-slate-200">
                    {getInputTypeLabel(template.requiredInputType)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2.5">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Layers className="h-4 w-4 text-violet-400/80" />
                    <span>{t.aspectRatio}</span>
                  </span>
                  <span className="font-medium text-slate-200">{template.aspectRatio}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2.5">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Sparkles className="h-4 w-4 text-violet-400/80" />
                    <span>
                      {language === 'ru' ? 'Стоимость' : language === 'en' ? 'Cost' : 'Cost'}
                    </span>
                  </span>
                  <span className="font-semibold text-violet-300">
                    {photoCost} {photoWord}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-violet-600/25 active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t.useTemplate}</span>
              </button>

              <p className="text-center text-[11px] text-slate-500">{t.privacyNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
