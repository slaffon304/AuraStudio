import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import { consumeAfterAuthRedirect, viewToPath } from '../lib/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, setCurrentView } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'Moldova' | 'Romania'>('Moldova');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Autentificare eșuată. Verifică datele introduse.');
        } else {
          finishAuth();
        }
      } else {
        if (!name.trim()) {
          setErrorMsg('Te rugăm să introduci numele tău.');
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, name, country);
        if (!res.success) {
          setErrorMsg(res.error || 'Crearea contului a eșuat.');
        } else {
          setSuccessMsg('Cont creat cu succes!');
          setTimeout(() => finishAuth(), 800);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">AuraStudio</h2>
            <p className="text-[11px] text-slate-400">Cont Studio AI</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'signin' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Autentificare
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'signup' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Înregistrare
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Nume & Prenume</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Popescu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="nume@exemplu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">Parolă</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minim 6 caractere"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Monedă Cont</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as 'Moldova' | 'Romania')}
                className="w-full rounded-xl border border-white/10 bg-[#161924] px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="Moldova">MDL (Leu)</option>
                <option value="Romania">RON (Leu)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Se procesează...'
                : mode === 'signin'
                ? 'Conectează-te'
                : 'Creează Contul & Primește 15 Credite'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          {mode === 'signin' ? (
            <span>
              Nu ai un cont?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-amber-400 hover:underline font-semibold">
                Înregistrează-te gratuit
              </button>
            </span>
          ) : (
            <span>
              Ai deja un cont?{' '}
              <button type="button" onClick={() => setMode('signin')} className="text-amber-400 hover:underline font-semibold">
                Conectează-te
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
