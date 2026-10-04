import React from 'react';
import { PhotoTemplate } from '../types';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Coins, Layers, Image as ImageIcon } from 'lucide-react';

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

  if (!isOpen || !template) return null;

  const name = template.name[language] || template.name.ro;
  const description = template.description[language] || template.description.ro;

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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-md hover:bg-black/90 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Big Preview Image */}
          <div className="relative aspect-[3/4] md:aspect-auto w-full overflow-hidden bg-slate-950">
            <img
              src={template.previewImage}
              alt={name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-transparent md:hidden" />
          </div>

          {/* Right: Details & Action */}
          <div className="flex flex-col justify-between p-6 sm:p-7">
            <div>
              {/* Unboxed Metadata Line */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-amber-400">{template.category}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{template.aspectRatio}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1 font-medium text-white">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  {template.creditCost} {t.credits}
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {name}
              </h2>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {description}
              </p>

              {/* Specifications Block */}
              <div className="mt-6 space-y-3 rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-400">
                    <ImageIcon className="h-4 w-4 text-amber-400/80" />
                    <span>{t.requiredPhotoType}</span>
                  </span>
                  <span className="font-medium text-slate-200">{getInputTypeLabel(template.requiredInputType)}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2.5">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Layers className="h-4 w-4 text-amber-400/80" />
                    <span>{t.aspectRatio}</span>
                  </span>
                  <span className="font-medium text-slate-200">{template.aspectRatio}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2.5">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Coins className="h-4 w-4 text-amber-400/80" />
                    <span>{t.creditCost}</span>
                  </span>
                  <span className="font-semibold text-amber-300">{template.creditCost} {t.credits}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2">
              <button
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 px-6 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t.useTemplate}</span>
              </button>

              <p className="text-center text-[11px] text-slate-500">
                {t.privacyNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
