import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Shield, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t, switchUser, loginUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<'Moldova' | 'Romania'>('Moldova');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    loginUser(email, name, country);
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
            <p className="text-[11px] text-slate-400">Moldova & România</p>
          </div>
        </div>

        {/* Quick 1-Click Demo Profiles */}
        <div className="mt-5 rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Autentificare Rapidă (Demo)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                switchUser('user');
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 text-left text-xs transition-colors"
            >
              <User className="h-4 w-4 text-amber-400" />
              <div>
                <div className="font-semibold text-white">Alexandru</div>
                <div className="text-[10px] text-slate-400">Chișinău · User</div>
              </div>
            </button>

            <button
              onClick={() => {
                switchUser('admin');
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 p-2.5 text-left text-xs transition-colors"
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <div>
                <div className="font-semibold text-amber-300">Elena (Admin)</div>
                <div className="text-[10px] text-slate-400">București · Admin</div>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Login Form */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#12141c] px-2 text-slate-500 font-semibold">Sau creează cont nou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Nume & Prenume
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maria Ionescu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="maria@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Țară & Monedă
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as 'Moldova' | 'Romania')}
              className="w-full rounded-xl border border-white/10 bg-[#161924] px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            >
              <option value="Moldova">🇲🇩 Moldova (MDL - Leu Moldovenesc)</option>
              <option value="Romania">🇷🇴 România (RON - Leu Românesc)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95"
          >
            <span>Intră în Cont & Primește 15 Credite</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
