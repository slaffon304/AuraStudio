import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { viewToPath, clearFromProfile } from '../lib/navigation';

export const HistoryView: React.FC = () => {
  const {
    language,
    currentUser,
    photoTransactions,
    setCurrentView,
    setIsPhotoModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const balance = currentUser?.photoBalance ?? 0;
  const photoWord = language === 'ru' ? 'фото' : language === 'en' ? 'photos' : 'foto';

  const title =
    language === 'ru'
      ? 'Куда делись мои фото?'
      : language === 'en'
      ? 'Where did my photos go?'
      : 'Unde au ajuns fotografiile?';
  const sub =
    language === 'ru'
      ? 'Все пополнения, списания и возвраты.'
      : language === 'en'
      ? 'All top-ups, spends and refunds.'
      : 'Toate reîncărcările, debitele și returnările.';
  const available =
    language === 'ru' ? 'Доступно сейчас' : language === 'en' ? 'Available now' : 'Disponibil acum';
  const topUp =
    language === 'ru' ? 'Пополнить баланс' : language === 'en' ? 'Top up balance' : 'Reîncarcă balanța';
  const empty =
    language === 'ru'
      ? 'Здесь появятся операции с балансом фото.'
      : language === 'en'
      ? 'Photo balance operations will appear here.'
      : 'Aici vor apărea operațiile cu balanța de foto.';

  const goBack = () => {
    clearFromProfile();
    setCurrentView('profile');
    window.history.pushState({}, '', viewToPath('profile'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTopUp = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsPhotoModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-4 sm:pb-12">
      {/* Back */}
      <div className="mb-5 flex items-center">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 dark:bg-white/5 dark:border-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sub}</p>

      {/* Balance card */}
      <div className="mt-6 rounded-[24px] bg-gradient-to-br from-[#5b6cf0] to-[#7b5cf0] p-5 text-white shadow-md">
        <p className="text-sm font-medium text-white/85">{available}</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums">
          {balance} {photoWord}
        </p>
        <button
          type="button"
          onClick={openTopUp}
          className="mt-4 text-sm font-semibold underline underline-offset-4 decoration-white/60 hover:decoration-white"
        >
          {topUp}
        </button>
      </div>

      {/* Transactions */}
      <div className="mt-4">
        {photoTransactions.length === 0 ? (
          <div className="rounded-[20px] bg-white dark:bg-[#12141c] border border-slate-100 dark:border-white/5 px-5 py-10 text-center text-sm text-slate-400 shadow-sm">
            {empty}
          </div>
        ) : (
          <ul className="space-y-2">
            {photoTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-[16px] bg-white dark:bg-[#12141c] border border-slate-100 dark:border-white/5 px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {tx.balanceAfter} {photoWord}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
