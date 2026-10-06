import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Image as ImageIcon,
  Play,
  FolderHeart,
  ArrowUpDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import logoImg from '../assets/images/aurastudio-logo.png';

export const ProfileView: React.FC = () => {
  const {
    t,
    language,
    currentUser,
    signOut,
    setCurrentView,
    setIsCreditModalOpen,
    setIsAuthModalOpen,
    jobs,
    userPhotos,
    creditTransactions
  } = useApp();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-slate-500 mb-4">
          {language === 'ru'
            ? 'Войдите, чтобы открыть профиль'
            : language === 'en'
            ? 'Sign in to open your profile'
            : 'Autentifică-te pentru a deschide profilul'}
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#4f63f0] px-6 text-sm font-bold text-white"
        >
          {t.login}
        </button>
      </div>
    );
  }

  const completedPhotos = jobs.filter((j) => j.status === 'completed').length;
  const freeCredits = Math.min(1, currentUser.creditBalance); // welcome free slot display
  const paidCredits = Math.max(0, currentUser.creditBalance - freeCredits);

  const labels = {
    account: language === 'ru' ? 'АККАУНТ' : language === 'en' ? 'ACCOUNT' : 'CONT',
    free: language === 'ru' ? 'бесплатных' : language === 'en' ? 'free' : 'gratuite',
    paid: language === 'ru' ? 'купленных' : language === 'en' ? 'purchased' : 'cumpărate',
    allTariffs: language === 'ru' ? 'Все тарифы и докупка →' : language === 'en' ? 'All plans & top-up →' : 'Toate tarifele și reîncărcare →',
    yourPhotos: language === 'ru' ? 'твои фото' : language === 'en' ? 'your photos' : 'fotografiile tale',
    yourVideos: language === 'ru' ? 'твои видео' : language === 'en' ? 'your videos' : 'videoclipurile tale',
    saved: language === 'ru' ? 'Сохранённые фото' : language === 'en' ? 'Saved photos' : 'Fotografii salvate',
    savedSub:
      language === 'ru'
        ? 'Папки с твоими исходными снимками'
        : language === 'en'
        ? 'Folders with your source shots'
        : 'Dosare cu fotografiile tale sursă',
    history: language === 'ru' ? 'Куда делись мои фото?' : language === 'en' ? 'Where did my photos go?' : 'Unde au ajuns fotografiile?',
    historySub:
      language === 'ru'
        ? 'Списания, пополнения и возвраты'
        : language === 'en'
        ? 'Spends, top-ups and refunds'
        : 'Debite, reîncărcări și returnări',
    logout: language === 'ru' ? 'Выйти' : language === 'en' ? 'Log out' : 'Ieși',
    deleteTitle: language === 'ru' ? 'Удалить аккаунт' : language === 'en' ? 'Delete account' : 'Șterge contul',
    deleteBody:
      language === 'ru'
        ? 'Удалим твои фото, цифровые копии и вход. Оплаченные фото сгорят, деньги за них не возвращаем. Чеки об оплате останутся у нас — этого требует закон.'
        : language === 'en'
        ? 'We will delete your photos, digital copies and access. Purchased photos will be lost; payments are non-refundable. Payment receipts are retained as required by law.'
        : 'Vom șterge fotografiile, copiile digitale și accesul. Fotografiile plătite se pierd; plățile nu se returnează. Chitanțele rămân la noi conform legii.'
  };

  const goBack = () => {
    setCurrentView('explore');
    window.history.pushState({}, '', '/app');
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-4 sm:pb-12">
      {/* Top bar */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 dark:bg-white/5 dark:border-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <img src={logoImg} alt="AuraStudio" className="h-7 object-contain" />
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-slate-100 dark:bg-white/5 dark:text-slate-200 dark:border-white/10"
        >
          {labels.logout}
        </button>
      </div>

      {/* Account card */}
      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(30,40,80,0.06)] dark:bg-[#12141c] dark:shadow-none border border-slate-100/80 dark:border-white/5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{labels.account}</p>
        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white break-all">{currentUser.email}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#eef2ff] dark:bg-blue-500/10 px-3 py-4 text-center">
            <p className="text-2xl font-extrabold text-[#4f63f0]">{freeCredits}</p>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{labels.free}</p>
          </div>
          <div className="rounded-2xl bg-[#eef2ff] dark:bg-blue-500/10 px-3 py-4 text-center">
            <p className="text-2xl font-extrabold text-[#4f63f0]">{paidCredits}</p>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{labels.paid}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreditModalOpen(true)}
          className="mt-4 flex w-full min-h-[48px] items-center justify-center rounded-full bg-[#4f63f0] text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(79,99,240,0.3)] active:scale-[0.98] transition"
        >
          {labels.allTariffs}
        </button>
      </section>

      {/* Quick links */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setCurrentView('gallery');
            window.history.pushState({}, '', '/app/gallery');
          }}
          className="rounded-[20px] bg-white p-4 text-left shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
            <ImageIcon className="h-4 w-4 text-[#4f63f0]" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">{completedPhotos}</p>
          <p className="text-[12px] text-slate-500">
            {labels.yourPhotos} <span className="text-slate-300">→</span>
          </p>
        </button>
        <button
          type="button"
          className="rounded-[20px] bg-white p-4 text-left shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5 opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
            <Play className="h-4 w-4 text-[#4f63f0]" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">0</p>
          <p className="text-[12px] text-slate-500">
            {labels.yourVideos} <span className="text-slate-300">→</span>
          </p>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setCurrentView('library');
          window.history.pushState({}, '', '/app/library');
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
          <FolderHeart className="h-4 w-4 text-[#4f63f0]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{labels.saved}</p>
          <p className="text-[12px] text-slate-400 truncate">{labels.savedSub}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </button>

      <button
        type="button"
        className="mt-3 flex w-full items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
          <ArrowUpDown className="h-4 w-4 text-[#4f63f0]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{labels.history}</p>
          <p className="text-[12px] text-slate-400 truncate">
            {labels.historySub}
            {creditTransactions.length > 0 ? ` · ${creditTransactions.length}` : ''}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </button>

      {/* Delete account notice */}
      <section className="mt-6 rounded-[20px] bg-white p-5 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{labels.deleteTitle}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{labels.deleteBody}</p>
      </section>
    </div>
  );
};
