import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, AlertTriangle } from 'lucide-react';

/** Sticky banner when session exists but email not confirmed — blocks awareness */
export const EmailConfirmBanner: React.FC = () => {
  const { session, isEmailConfirmed, language } = useApp();

  if (!session || isEmailConfirmed) return null;

  const text =
    language === 'ru'
      ? 'Подтверди email, чтобы генерировать фото. Открой ссылку из письма Supabase Auth.'
      : language === 'en'
      ? 'Confirm your email to unlock generation. Open the link from the Supabase Auth message.'
      : 'Confirmă emailul pentru a debloca generarea. Deschide linkul din mesajul Supabase Auth.';

  return (
    <div className="w-full border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <Mail className="h-4 w-4 shrink-0 hidden sm:block" />
        <span>{text}</span>
      </div>
    </div>
  );
};
