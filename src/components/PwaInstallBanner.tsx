import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  canNativeInstall,
  hasSeenInstallPrompt,
  isStandalone,
  markInstallPromptSeen,
  promptInstall,
  subscribePwaInstall
} from '../lib/pwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { language } = useApp();
  const [open, setOpen] = useState(false);
  const [native, setNative] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const sync = () => {
      setNative(canNativeInstall());
      if (canNativeInstall() && !hasSeenInstallPrompt()) {
        setOpen(true);
      }
    };

    sync();
    const t = window.setTimeout(sync, 1500);
    const unsub = subscribePwaInstall(sync);

    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  if (!open || isStandalone()) return null;

  const ru = language === 'ru';
  const en = language === 'en';

  const title = ru ? 'На главный экран' : en ? 'Add to Home screen' : 'Pe ecranul principal';
  const body = ru
    ? 'Ярлык на экране — открытие в один тап.'
    : en
    ? 'Home screen icon — open in one tap.'
    : 'Iconiță pe ecran — un singur tap.';
  const install = ru ? 'Добавить' : en ? 'Add' : 'Adaugă';
  const later = ru ? 'Позже' : en ? 'Later' : 'Mai târziu';
  const wait = ru
    ? 'Подготовка… нажми ещё раз через секунду'
    : en
    ? 'Preparing… tap again in a second'
    : 'Se pregătește… apasă din nou';

  const close = () => {
    markInstallPromptSeen();
    setOpen(false);
  };

  const onInstall = () => {
    // без await до prompt — жест пользователя
    if (!canNativeInstall()) {
      setNative(false);
      return;
    }
    setBusy(true);
    promptInstall().finally(() => {
      setBusy(false);
      close();
    });
  };

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
            <Download className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
            {!native && (
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{wait}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy || !native}
            onClick={onInstall}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 py-3 text-sm font-bold text-white"
          >
            {install}
          </button>
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
