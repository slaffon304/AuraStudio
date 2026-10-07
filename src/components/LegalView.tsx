import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEGAL, LegalPageId } from '../data/legalContent';
import { viewToPath } from '../lib/navigation';

interface LegalViewProps {
  page: LegalPageId;
}

export const LegalView: React.FC<LegalViewProps> = ({ page }) => {
  const { language, setCurrentView, t } = useApp();
  const lang = language === 'ru' || language === 'ro' || language === 'en' ? language : 'en';
  const doc = LEGAL[lang][page];

  const goBack = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', viewToPath('landing'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToLegal = (id: LegalPageId) => {
    setCurrentView(id);
    window.history.pushState({}, '', viewToPath(id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#1a2035] flex flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8 pt-6 sm:px-6">
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
      </div>

      {/* Same footer as landing page */}
      <footer className="border-t border-[#e9e9ed] bg-[#faf9f6] px-4 pb-10 pt-8">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 text-center">
          {/* Telegram support pill */}
          <a
            href="https://t.me/aurastudio_help_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#e2e4ec] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#3a4560] shadow-sm transition hover:border-[#c8cce0] hover:bg-[#f7f8fc]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21.5 3.5L2.7 11.1c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .9-.3 1.2-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2.1-.9l3.7-17.4c.4-1.6-.6-2.3-1.7-1.8z"
                fill="#2AABEE"
              />
            </svg>
            <span>{t.landingTelegramSupport}</span>
          </a>

          {/* Policy links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-[#8a92a6]">
            <button
              type="button"
              onClick={() => {
                setCurrentView('landing');
                window.history.pushState({}, '', viewToPath('landing'));
                window.setTimeout(() => {
                  document.getElementById('photo-packages')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="hover:text-[#4f63f0] transition-colors"
            >
              {t.landingPackagesTitle}
            </button>
            <span className="text-[#d0d4de]">·</span>
            <button
              type="button"
              onClick={() => goToLegal('privacy')}
              className="hover:text-[#4f63f0] transition-colors"
            >
              {t.landingPrivacy}
            </button>
            <span className="text-[#d0d4de]">·</span>
            <button
              type="button"
              onClick={() => goToLegal('terms')}
              className="hover:text-[#4f63f0] transition-colors"
            >
              {t.landingTerms}
            </button>
            <span className="text-[#d0d4de]">·</span>
            <button
              type="button"
              onClick={() => goToLegal('offer')}
              className="hover:text-[#4f63f0] transition-colors"
            >
              {t.landingOffer}
            </button>
          </nav>

          <p className="max-w-[520px] text-[11px] leading-relaxed text-[#a0a6b5]">
            {t.landingFooterLegal}
          </p>
          <p className="text-[11px] text-[#b0b5c2]">
            © {new Date().getFullYear()} AuraStudio. {t.rightsReserved}
          </p>
        </div>
      </footer>
    </div>
  );
};
