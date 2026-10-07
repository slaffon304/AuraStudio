import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEGAL, LegalPageId } from '../data/legalContent';
import { viewToPath } from '../lib/navigation';

interface LegalViewProps {
  page: LegalPageId;
}

export const LegalView: React.FC<LegalViewProps> = ({ page }) => {
  const { language, setCurrentView } = useApp();
  const lang = language === 'ru' || language === 'ro' || language === 'en' ? language : 'en';
  const doc = LEGAL[lang][page];

  const goBack = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', viewToPath('landing'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#1a2035]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a2035] shadow-sm border border-[#e8ecf4] hover:bg-[#f8f9fc]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-[#8b93a7]">{doc.effective}</p>

        <div className="mt-8 space-y-8">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold text-[#1a2035]">{s.heading}</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#4a5568]">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-[#8b93a7]">AuraStudio · [[SERVICE_URL]]</p>
      </div>
    </div>
  );
};
