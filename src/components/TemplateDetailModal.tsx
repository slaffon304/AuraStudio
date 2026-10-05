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

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({ template, isOpen, onClose, onSelect }) => {
  const { language, t } = useApp();

  if (!isOpen || !template) return null;

  const name = template.name[language] || template.name.ro;
  const description = template.description[language] || template.description.ro;
  const category = t.categories[template.category] || template.category;

  const getInputTypeLabel = (type: string) => {
    switch (type) {
      case 'single_portrait': return t.singlePortrait;
      case 'couple_portrait': return t.couplePortrait;
      case 'group_family': return t.groupFamily;
      case 'full_body': return t.fullBody;
      default: return t.anyPhoto;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17203b]/45 dark:bg-black/70 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
      <div className="relative my-auto w-full max-w-[760px] overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_24px_80px_rgba(24,34,66,.25)] dark:border-white/10 dark:bg-[#141724] sm:rounded-[28px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close template details"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#66718b] shadow-md ring-1 ring-[#e4e8f0] transition hover:text-[#263150] dark:bg-[#1d2130] dark:text-slate-300 dark:ring-white/10 dark:hover:text-white sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[.92fr_1.08fr]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#edf0f6] dark:bg-slate-900 md:aspect-auto md:min-h-[490px]">
            <img src={template.previewImage} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11182d]/40 via-transparent to-transparent md:hidden" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#4e5d7b] shadow-sm backdrop-blur dark:bg-black/70 dark:text-slate-200 sm:bottom-4 sm:left-4">
              {category}
            </span>
          </div>

          <div className="flex max-h-[min(74vh,620px)] flex-col overflow-y-auto p-5 sm:p-7 md:max-h-[620px] md:p-8">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8c95a8] dark:text-slate-400">
              <span className="rounded-full bg-[#eef1ff] px-2.5 py-1 text-[#5369e8] dark:bg-indigo-400/10 dark:text-indigo-300">{category}</span>
              <span aria-hidden="true">·</span>
              <span>{template.aspectRatio}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#65718b] dark:text-slate-300"><Coins className="h-3.5 w-3.5 text-[#7181d9]" />{template.creditCost} {t.credits}</span>
            </div>

            <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight text-[#1e2743] sm:text-2xl dark:text-white">{name}</h2>
            <p className="mt-2.5 text-xs leading-relaxed text-[#737e96] sm:text-sm dark:text-slate-400">{description}</p>

            <div className="mt-5 space-y-3 rounded-2xl border border-[#e9ecf3] bg-[#f8f9fc] p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 text-[#818ba0] dark:text-slate-400"><ImageIcon className="h-4 w-4 text-[#7a88d6]" />{t.requiredPhotoType}</span>
                <span className="text-right font-semibold text-[#45516e] dark:text-slate-200 dark:text-slate-200">{getInputTypeLabel(template.requiredInputType)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#e7eaf1] pt-3 dark:border-white/10 text-xs">
                <span className="flex items-center gap-2 text-[#818ba0] dark:text-slate-400"><Layers className="h-4 w-4 text-[#7a88d6]" />{t.aspectRatio}</span>
                <span className="font-semibold text-[#45516e] dark:text-slate-200">{template.aspectRatio}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#e7eaf1] pt-3 dark:border-white/10 text-xs">
                <span className="flex items-center gap-2 text-[#818ba0] dark:text-slate-400"><Coins className="h-4 w-4 text-[#7a88d6]" />{t.creditCost}</span>
                <span className="font-bold text-[#465dcc]">{template.creditCost} {t.credits}</span>
              </div>
            </div>

            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={() => onSelect(template)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#526af4] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(82,106,244,.2)] transition hover:bg-[#405ae8] active:scale-[.99] sm:text-sm"
              >
                <Sparkles className="h-4 w-4" />{t.useTemplate}
              </button>
              <p className="mt-2.5 text-center text-[10px] leading-relaxed text-[#9aa2b2] dark:text-slate-500">{t.privacyNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
