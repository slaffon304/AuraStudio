import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { viewToPath, clearFromProfile } from '../lib/navigation';
import { LEVELS, LevelId, progressToNext } from '../lib/levels';

export const LevelsView: React.FC = () => {
  const { language, session, setCurrentView } = useApp();
  const [level, setLevel] = useState<LevelId>(1);
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    fetch('/api/me/levels', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setLevel((d.level || 1) as LevelId);
        setSpent(Number(d.totalSpentEur) || 0);
      })
      .catch(() => {});
  }, [session?.access_token]);

  const goBack = () => {
    clearFromProfile();
    setCurrentView('profile' as any);
    window.history.pushState({}, '', viewToPath('profile'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title =
    language === 'ru' ? 'Мой уровень' : language === 'en' ? 'My level' : 'Nivelul meu';
  const sub =
    language === 'ru'
      ? 'Растёт от суммы всех покупок'
      : language === 'en'
      ? 'Grows with total purchases'
      : 'Crește odată cu suma cumpărăturilor';
  const youAreHere =
    language === 'ru' ? 'ты здесь' : language === 'en' ? 'you are here' : 'ești aici';
  const from =
    language === 'ru' ? 'от' : language === 'en' ? 'from' : 'de la';

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-4 sm:pb-12">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 dark:bg-white/5 dark:border-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-[13px] text-slate-500">{sub}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {LEVELS.map((L) => {
          const isCurrent = L.id === level;
          const isPast = L.id < level;
          const name = L.name[language] || L.name.ro;
          const tag = L.tag ? L.tag[language] || L.tag.ro : null;

          return (
            <li
              key={L.id}
              className={`rounded-[20px] bg-white dark:bg-[#12141c] border p-4 shadow-sm ${
                isCurrent
                  ? 'border-[#4f63f0] ring-1 ring-[#4f63f0]/30'
                  : 'border-slate-100 dark:border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    isCurrent || isPast ? 'bg-[#eef2ff] dark:bg-blue-500/15' : 'bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  {L.id === 1 ? '📱' : L.id === 2 ? '📷' : L.id === 3 ? '🖼️' : L.id === 4 ? '🎬' : '🏆'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-[15px] font-bold leading-snug ${
                          isCurrent || isPast
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {name}
                      </p>
                      {L.id === 1 && tag ? (
                        <p className="text-[12px] text-slate-400 mt-0.5">{tag}</p>
                      ) : (
                        <p className="text-[12px] text-slate-400 mt-0.5">
                          {from} {L.minSpentEur} €
                        </p>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-[#4f63f0] px-2.5 py-1 text-[11px] font-bold text-white">
                        {youAreHere}
                      </span>
                    )}
                  </div>

                  {L.perks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {L.perks.map((p, i) => {
                        const text = p[language] || p.ro;
                        const isBonus = text.startsWith('+');
                        return (
                          <span
                            key={i}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              isBonus
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                            }`}
                          >
                            {text}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
