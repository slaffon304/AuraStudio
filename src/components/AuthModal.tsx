import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { consumeAfterAuthRedirect, viewToPath } from '../lib/navigation';
import logoImg from '../assets/images/aurastudio-logo.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Prefer sign-in tab (e.g. after email confirmation) */
  initialMode?: 'signin' | 'signup';
  /** Banner text after email confirmation */
  notice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin', notice = null }) => {
  const { signIn, signUp, setCurrentView, setCurrency, language } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'Moldova' | 'Romania' | 'Other'>('Moldova');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (notice) setSuccessMsg(notice);
    }
  }, [isOpen, initialMode, notice]);

  if (!isOpen) return null;

  const L = {
    studio: language === 'ru' ? 'Аккаунт Studio AI' : language === 'en' ? 'Studio AI account' : 'Cont Studio AI',
    signin: language === 'ru' ? 'Вход' : language === 'en' ? 'Sign in' : 'Autentificare',
    signup: language === 'ru' ? 'Регистрация' : language === 'en' ? 'Sign up' : 'Înregistrare',
    name: language === 'ru' ? 'Имя и фамилия' : language === 'en' ? 'Full name' : 'Nume & Prenume',
    namePh: language === 'ru' ? 'например, Мария Попеску' : language === 'en' ? 'e.g. Maria Popescu' : 'e.g. Maria Popescu',
    country: language === 'ru' ? 'Страна' : language === 'en' ? 'Country' : 'Țara',
    email: 'Email',
    emailPh: language === 'ru' ? 'name@example.com' : language === 'en' ? 'name@example.com' : 'nume@exemplu.com',
    password: language === 'ru' ? 'Пароль' : language === 'en' ? 'Password' : 'Parolă',
    passwordPh: language === 'ru' ? 'Минимум 6 символов' : language === 'en' ? 'At least 6 characters' : 'Minim 6 caractere',
    processing: language === 'ru' ? 'Обработка…' : language === 'en' ? 'Processing…' : 'Se procesează...',
    connect: language === 'ru' ? 'Войти' : language === 'en' ? 'Sign in' : 'Conectează-te',
    create: language === 'ru' ? 'Создать аккаунт' : language === 'en' ? 'Create account' : 'Creează Contul',
    noAccount: language === 'ru' ? 'Нет аккаунта?' : language === 'en' ? "Don't have an account?" : 'Nu ai un cont?',
    registerFree: language === 'ru' ? 'Зарегистрируйся бесплатно' : language === 'en' ? 'Sign up free' : 'Înregistrează-te gratuit',
    hasAccount: language === 'ru' ? 'Уже есть аккаунт?' : language === 'en' ? 'Already have an account?' : 'Ai deja un cont?',
    signInLink: language === 'ru' ? 'Войти' : language === 'en' ? 'Sign in' : 'Conectează-te',
    needName: language === 'ru' ? 'Укажи имя.' : language === 'en' ? 'Please enter your name.' : 'Te rugăm să introduci numele tău.',
    signInFail: language === 'ru' ? 'Вход не удался. Проверь данные.' : language === 'en' ? 'Sign-in failed. Check your details.' : 'Autentificare eșuată. Verifică datele introduse.',
    signUpFail: language === 'ru' ? 'Не удалось создать аккаунт.' : language === 'en' ? 'Could not create account.' : 'Crearea contului a eșuat.',
    createdOk: language === 'ru' ? 'Аккаунт создан!' : language === 'en' ? 'Account created!' : 'Cont creat cu succes!',
    confirmTitle: language === 'ru' ? 'Подтверди почту' : language === 'en' ? 'Confirm your email' : 'Confirmă emailul',
    moldova: language === 'ru' ? 'Молдова (MDL)' : language === 'en' ? 'Moldova (MDL)' : 'Moldova (MDL)',
    romania: language === 'ru' ? 'Румыния (RON)' : language === 'en' ? 'Romania (RON)' : 'România (RON)',
    other: language === 'ru' ? 'Другая (EUR)' : language === 'en' ? 'Other (EUR)' : 'Other (EUR)',
  };

  const currencyForCountry = (c: 'Moldova' | 'Romania' | 'Other') => {
    if (c === 'Moldova') return 'MDL' as const;
    if (c === 'Romania') return 'RON' as const;
    return 'EUR' as const;
  };

  const finishAuth = () => {
    const next = consumeAfterAuthRedirect();
    if (next) {
      setCurrentView(next as any);
      window.history.pushState({}, '', viewToPath(next));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setAwaitingEmail(false);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || L.signInFail);
        } else {
          finishAuth();
        }
      } else {
        if (!name.trim()) {
          setErrorMsg(L.needName);
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, name, country);
        if (!res.success) {
          setErrorMsg(res.error || L.signUpFail);
        } else if (res.needsEmailConfirmation) {
          setCurrency(currencyForCountry(country));
          setAwaitingEmail(true);
          setSuccessMsg(
            language === 'ru'
              ? 'Аккаунт создан. Подтверди email — мы отправили ссылку. Без подтверждения генерация недоступна.'
              : language === 'en'
              ? 'Account created. Confirm your email — we sent a link. Generation is locked until you confirm.'
              : 'Cont creat. Confirmă emailul — am trimis linkul. Fără confirmare generarea este blocată.'
          );
        } else {
          setCurrency(currencyForCountry(country));
          setSuccessMsg(L.createdOk);
          setTimeout(() => finishAuth(), 800);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <img
            src={logoImg}
            alt="AuraStudio"
            className="h-10 w-auto max-w-[160px] object-contain brightness-110"
          />
          <p className="text-[11px] text-slate-400">{L.studio}</p>
        </div>

        {!awaitingEmail && (
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(notice);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signin' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {L.signin}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {L.signup}
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {awaitingEmail ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100 leading-relaxed">
              <p className="font-bold text-amber-300 mb-2">{L.confirmTitle}</p>
              <p>
                {language === 'ru'
                  ? `Письмо отправлено на ${email}. Открой ссылку в письме. Пока почта не подтверждена, генерация и загрузка фото заблокированы.`
                  : language === 'en'
                  ? `We sent a link to ${email}. Open it to unlock generation and uploads.`
                  : `Am trimis linkul la ${email}. Deschide-l din inbox. Până la confirmare, generarea și încărcarea foto sunt blocate.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/15"
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">{L.name}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder={L.namePh}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">{L.country}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value as 'Moldova' | 'Romania' | 'Other')}
                      className="w-full rounded-xl border border-white/10 bg-[#161924] pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400 appearance-none"
                    >
                      <option value="Moldova">{L.moldova}</option>
                      <option value="Romania">{L.romania}</option>
                      <option value="Other">{L.other}</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">{L.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder={L.emailPh}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">{L.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={L.passwordPh}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <span>
                {loading ? L.processing : mode === 'signin' ? L.connect : L.create}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {!awaitingEmail && (
          <div className="mt-4 text-center text-[11px] text-slate-500">
            {mode === 'signin' ? (
              <span>
                {L.noAccount}{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-amber-400 hover:underline font-semibold">
                  {L.registerFree}
                </button>
              </span>
            ) : (
              <span>
                {L.hasAccount}{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-amber-400 hover:underline font-semibold">
                  {L.signInLink}
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
