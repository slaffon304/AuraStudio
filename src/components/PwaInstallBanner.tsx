import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  canNativeInstall,
  hasSeenInstallPrompt,
  isIos,
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
      if (!isStandalone() && !hasSeenInstallPrompt()) {
        setOpen(true);
      }
    };

    // ждём немного + если придёт native prompt — тоже откроем
    const t = window.setTimeout(tryOpen, 2000);
    const unsub = subscribePwaInstall(tryOpen);
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  if (!open) return null;

  const ru = language === 'ru';
  const en = language === 'en';

  const title = ru
    ? 'Установить AuraStudio'
    : en
    ? 'Install AuraStudio'
    : 'Instalează AuraStudio';

  const body = ru
    ? 'Добавь иконку на экран — открывай в один клик.'
    : en
    ? 'Add the icon to your home screen — open in one tap.'
    : 'Adaugă iconița pe ecran — deschide dintr-un singur tap.';

  const hint = ru
    ? 'Это можно сделать в любой момент из меню ☰.'
    : en
    ? 'You can do this anytime from the ☰ menu.'
    : 'Poți face asta oricând din meniul ☰.';

  const iosHint = ru
    ? 'На iPhone: кнопка «Поделиться» → «На экран «Домой»».'
    : en
    ? 'On iPhone: Share → Add to Home Screen.'
    : 'Pe iPhone: Partajează → Pe ecranul principal.';

  const androidHint = ru
    ? 'В Chrome: меню ⋮ → «Установить приложение».'
    : en
    ? 'In Chrome: menu ⋮ → Install app.'
    : 'În Chrome: meniu ⋮ → Instalează aplicația.';

  const install = ru ? 'Установить' : en ? 'Install' : 'Instalează';
  const later = ru ? 'Позже' : en ? 'Later' : 'Mai târziu';
  const gotIt = ru ? 'Понятно' : en ? 'Got it' : 'Am înțeles';

  const close = () => {
    markInstallPromptSeen();
    setOpen(false);
  };

  const onInstall = async () => {
    if (!canNativeInstall()) {
      close();
      return;
    }
    setBusy(true);
    await promptInstall();
    setBusy(false);
    markInstallPromptSeen();
    setOpen(false);
  };

  const native = canNativeInstall();

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#12141c] p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
            {isIos() ? <Share className="h-6 w-6" /> : <Download className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">{hint}</p>
            {!native && (
              <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {isIos() ? iosHint : androidHint}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {native ? (
            <button
              type="button"
              disabled={busy}
              onClick={onInstall}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 py-3 text-sm font-bold text-white"
            >
              {install}
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white"
            >
              {gotIt}
            </button>
          )}
          <button
            type="button"
            onClick={close}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400"
          >
            {later}
          </button>
        </div>
      </div>
    </div>
  );
};
