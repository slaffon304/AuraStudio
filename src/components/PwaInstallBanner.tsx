import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  canPromptInstall,
  hasSeenInstallPrompt,
  isStandalone,
  markInstallPromptSeen,
  promptInstall,
  subscribePwaInstall
} from '../lib/pwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { language } = useApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone() || hasSeenInstallPrompt()) return;

    const tryOpen = () => {
      if (canPromptInstall() && !hasSeenInstallPrompt() && !isStandalone()) {
        setOpen(true);
      }
    };

    const t = window.setTimeout(tryOpen, 1800);
    const unsub = subscribePwaInstall(tryOpen);
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  if (!open) return null;

  const copy =
    language === 'ru'
      ? {
          title: 'Установить AuraStudio',
          body: 'Добавь иконку на экран — заходи в один клик, как в обычном приложении.',
          hint: 'Это можно сделать в любой момент из меню ☰ сверху.',
          install: 'Установить',
          later: 'Позже'
        }
      : language === 'en'
      ? {
          title: 'Install AuraStudio',
          body: 'Add the icon to your home screen — open the app in one tap.',
          hint: 'You can do this anytime from the ☰ menu.',
          install: 'Install',
          later: 'Later'
        }
      : {
          title: 'Instalează AuraStudio',
          body: 'Adaugă iconița pe ecran — deschide aplicația dintr-un singur tap.',
          hint: 'Poți face asta oricând din meniul ☰.',
          install: 'Instalează',
          later: 'Mai târziu'
        };

  const close = () => {
    markInstallPromptSeen();
    setOpen(false);
  };

  const onInstall = async () => {
    setBusy(true);
    await promptInstall();
    setBusy(false);
    markInstallPromptSeen();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className="relative w-full max-w-sm rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#12141c] p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <h2
              id="pwa-install-title"
              className="text-base font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {copy.title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {copy.body}
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              {copy.hint}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onInstall}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
            {copy.install}
          </button>
          <button
            type="button"
            onClick={close}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            {copy.later}
          </button>
        </div>
      </div>
    </div>
  );
};
