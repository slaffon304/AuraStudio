import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import auraStudioLogo from '../assets/images/aurastudio-logo.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUTH_COPY = {
  ro: {
    signIn: 'Autentificare',
    signUp: 'Înregistrare',
    name: 'Nume și prenume',
    email: 'Email',
    password: 'Parolă',
    country: 'Țară',
    namePlaceholder: 'ex. Maria Popescu',
    emailPlaceholder: 'nume@exemplu.com',
    passwordPlaceholder: 'Minimum 6 caractere',
    submitting: 'Se procesează…',
    submitSignIn: 'Conectează-te',
    submitSignUp: 'Creează un cont',
    noAccount: 'Nu ai un cont?',
    createAccount: 'Înregistrează-te',
    hasAccount: 'Ai deja un cont?',
    backToSignIn: 'Conectează-te',
    nameRequired: 'Te rugăm să introduci numele tău.',
    signInFailed: 'Autentificarea nu a reușit. Verifică datele introduse.',
    signUpFailed: 'Crearea contului nu a reușit.',
    success: 'Contul a fost creat. Verifică emailul pentru confirmare, dacă este necesar.',
    close: 'Închide'
  },
  ru: {
    signIn: 'Вход',
    signUp: 'Регистрация',
    name: 'Имя и фамилия',
    email: 'Электронная почта',
    password: 'Пароль',
    country: 'Страна',
    namePlaceholder: 'например, Анна Попова',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: 'Не менее 6 символов',
    submitting: 'Обработка…',
    submitSignIn: 'Войти',
    submitSignUp: 'Создать аккаунт',
    noAccount: 'Нет аккаунта?',
    createAccount: 'Зарегистрироваться',
    hasAccount: 'Уже есть аккаунт?',
    backToSignIn: 'Войти',
    nameRequired: 'Введите имя.',
    signInFailed: 'Не удалось войти. Проверьте введённые данные.',
    signUpFailed: 'Не удалось создать аккаунт.',
    success: 'Аккаунт создан. При необходимости подтвердите адрес электронной почты.',
    close: 'Закрыть'
  },
  en: {
    signIn: 'Sign in',
    signUp: 'Create account',
    name: 'Full name',
    email: 'Email',
    password: 'Password',
    country: 'Country',
    namePlaceholder: 'e.g. Maria Popescu',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: 'At least 6 characters',
    submitting: 'Processing…',
    submitSignIn: 'Sign in',
    submitSignUp: 'Create account',
    noAccount: 'New to AuraStudio?',
    createAccount: 'Create an account',
    hasAccount: 'Already have an account?',
    backToSignIn: 'Sign in',
    nameRequired: 'Please enter your name.',
    signInFailed: 'Sign in failed. Check the details and try again.',
    signUpFailed: 'Could not create your account.',
    success: 'Account created. Check your email for confirmation if needed.',
    close: 'Close'
  }
} as const;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, language, t } = useApp();
  const copy = AUTH_COPY[language];
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'Moldova' | 'Romania'>('Moldova');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (!result.success) {
          setErrorMsg(result.error || copy.signInFailed);
        } else {
          onClose();
        }
      } else {
        if (!name.trim()) {
          setErrorMsg(copy.nameRequired);
          return;
        }

        const result = await signUp(email, password, name, country);
        if (!result.success) {
          setErrorMsg(result.error || copy.signUpFailed);
        } else {
          setSuccessMsg(copy.success);
          window.setTimeout(onClose, 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-start gap-1">
          <img src={auraStudioLogo} alt="AuraStudio" className="h-auto w-[150px]" />
          <p className="pl-1 text-[11px] text-slate-400">{t.appTagline}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-white/5 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${mode === 'signin' ? 'bg-[#f4c95d] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            {copy.signIn}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${mode === 'signup' ? 'bg-[#f4c95d] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            {copy.signUp}
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="mb-1 block text-[11px] font-medium text-slate-300">{copy.name}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder={copy.namePlaceholder}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#f4c95d]"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-1 block text-[11px] font-medium text-slate-300">{copy.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#f4c95d]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1 block text-[11px] font-medium text-slate-300">{copy.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#f4c95d]"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-country" className="mb-1 block text-[11px] font-medium text-slate-300">{copy.country}</label>
              <select
                id="auth-country"
                value={country}
                onChange={(event) => setCountry(event.target.value as 'Moldova' | 'Romania')}
                className="w-full rounded-xl border border-white/10 bg-[#161924] px-3 py-2.5 text-xs text-white outline-none focus:border-[#f4c95d]"
              >
                <option value="Moldova">{language === 'ro' ? 'Moldova' : language === 'ru' ? 'Молдова' : 'Moldova'} · MDL</option>
                <option value="Romania">{language === 'ro' ? 'România' : language === 'ru' ? 'Румыния' : 'Romania'} · RON</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f4c95d] to-[#f6db88] py-3 text-xs font-bold text-slate-950 shadow-md transition hover:brightness-110 active:scale-[.99] disabled:opacity-50"
          >
            <span>{loading ? copy.submitting : mode === 'signin' ? copy.submitSignIn : copy.submitSignUp}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          {mode === 'signin' ? (
            <span>
              {copy.noAccount}{' '}
              <button type="button" onClick={() => { setMode('signup'); setErrorMsg(null); }} className="font-semibold text-[#f4c95d] hover:underline">
                {copy.createAccount}
              </button>
            </span>
          ) : (
            <span>
              {copy.hasAccount}{' '}
              <button type="button" onClick={() => { setMode('signin'); setErrorMsg(null); }} className="font-semibold text-[#f4c95d] hover:underline">
                {copy.backToSignIn}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
