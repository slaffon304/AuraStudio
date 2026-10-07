import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Image as ImageIcon,
  Play,
  FolderHeart,
  ArrowUpDown,
  ChevronRight,
  Gift,
  Copy,
  Share2,
  Trophy
} from 'lucide-react';
import logoImg from '../assets/images/aurastudio-logo.png';
import { viewToPath, markFromProfile } from '../lib/navigation';

export const ProfileView: React.FC = () => {
  const {
    t,
    language,
    currentUser,
    session,
    signOut,
    setCurrentView,
    setIsPhotoModalOpen,
    setIsAuthModalOpen,
    jobs,
    userPhotos,
    photoTransactions
  } = useApp();

  const [deleteBusy, setDeleteBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(0);
  const [refEarned, setRefEarned] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedGens, setCompletedGens] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    fetch('/api/me/referral', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setInvited(data.invited || 0);
        setRefEarned(data.photosEarned || 0);
        setLevel(data.level || 1);
        setCompletedGens(data.completedGenerations || 0);
        if (data.referralCode) setReferralCode(data.referralCode);
      })
      .catch(() => {});
  }, [session?.access_token]);

  if (!currentUser && !session) {
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

  const balance = currentUser?.photoBalance ?? 0;
  // Welcome = 1 free photo; rest treated as purchased (display only)
  const freePhotos = balance > 0 ? Math.min(1, balance) : 0;
  const paidPhotos = Math.max(0, balance - freePhotos);
  const completedPhotos = jobs.filter((j) => j.status === 'completed').length;
  const email = currentUser?.email || session?.user?.email || '';

  const referralLink = useMemo(() => {
    const code = referralCode || (currentUser?.id || session?.user?.id || '').replace(/-/g, '').slice(0, 8);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://studio.labupgrade.ai';
    return `${origin}/?ref=${code}`;
  }, [referralCode, currentUser?.id, session?.user?.id]);

  const L = {
    account: language === 'ru' ? 'АККАУНТ' : language === 'en' ? 'ACCOUNT' : 'CONT',
    free: language === 'ru' ? 'бесплатных' : language === 'en' ? 'free' : 'gratuite',
    paid: language === 'ru' ? 'купленных' : language === 'en' ? 'purchased' : 'cumpărate',
    allTariffs:
      language === 'ru'
        ? 'Все тарифы и докупка →'
        : language === 'en'
        ? 'All plans & top-up →'
        : 'Toate tarifele și reîncărcare →',
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
    levelTitle: language === 'ru' ? 'МОЙ УРОВЕНЬ' : language === 'en' ? 'MY LEVEL' : 'NIVELUL MEU',
    levelName: language === 'ru' ? 'Снимаю на телефон' : language === 'en' ? 'Phone shooter' : 'Fotograf pe telefon',
    levelBadge: language === 'ru' ? 'Ур. 1' : language === 'en' ? 'Lv. 1' : 'Niv. 1',
    levelNext:
      language === 'ru'
        ? 'до «Начинающий фотограф»'
        : language === 'en'
        ? 'to “Beginner photographer”'
        : 'până la «Fotograf începător»',
    levelReward:
      language === 'ru'
        ? 'на уровне «Начинающий фотограф» получишь:'
        : language === 'en'
        ? 'at “Beginner photographer” you get:'
        : 'la «Fotograf începător» primești:',
    levelR1: language === 'ru' ? '+1 фото сразу' : language === 'en' ? '+1 photo now' : '+1 foto imediat',
    levelR2: language === 'ru' ? 'Свой бейдж в профиле' : language === 'en' ? 'Profile badge' : 'Badge în profil',
    levelMore: language === 'ru' ? 'Подробнее →' : language === 'en' ? 'Details →' : 'Detalii →',
    refTitle: language === 'ru' ? 'Приведи друга' : language === 'en' ? 'Invite a friend' : 'Invită un prieten',
    refBody:
      language === 'ru'
        ? 'Другу — 1 фото за регистрацию. Тебе — 1 за друга и ещё по его покупкам.'
        : language === 'en'
        ? 'Friend gets 1 photo on signup. You get 1 per friend plus bonuses from their purchases.'
        : 'Prietenul — 1 foto la înregistrare. Tu — 1 per prieten și bonus din cumpărăturile lui.',
    copy: language === 'ru' ? 'Копировать' : language === 'en' ? 'Copy' : 'Copiază',
    invited: language === 'ru' ? 'приглашено' : language === 'en' ? 'invited' : 'invitați',
    refEarned: language === 'ru' ? 'получено фото' : language === 'en' ? 'photos earned' : 'foto primite',
    deleteTitle: language === 'ru' ? 'Удалить аккаунт' : language === 'en' ? 'Delete account' : 'Șterge contul',
    deleteBody:
      language === 'ru'
        ? 'Удалим твои фото, цифровые копии и вход. Оплаченные фото сгорят, деньги за них не возвращаем. Чеки об оплате останутся у нас — этого требует закон.'
        : language === 'en'
        ? 'We will delete your photos, digital copies and access. Purchased photos will be lost; payments are non-refundable. Payment receipts are retained as required by law.'
        : 'Vom șterge fotografiile, copiile digitale și accesul. Fotografiile plătite se pierd; plățile nu se returnează. Chitanțele rămân la noi conform legii.',
    deleteBtn: language === 'ru' ? 'Удалить аккаунт' : language === 'en' ? 'Delete account' : 'Șterge contul',
    deleteConfirm:
      language === 'ru'
        ? 'Точно удалить аккаунт? Это необратимо.'
        : language === 'en'
        ? 'Delete account permanently? This cannot be undone.'
        : 'Ștergi contul definitiv? Acțiunea este ireversibilă.'
  };

  const goBack = () => {
    setCurrentView('explore');
    window.history.pushState({}, '', viewToPath('explore'));
  };

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(L.deleteConfirm)) return;
    setDeleteBusy(true);
    try {
      const token = session?.access_token;
      if (token) {
        const res = await fetch('/api/account/delete', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        // If endpoint missing, still sign out locally
        if (!res.ok && res.status !== 404) {
          console.warn('Delete account response', res.status);
        }
      }
      await signOut();
      setCurrentView('landing');
      window.history.pushState({}, '', '/');
    } finally {
      setDeleteBusy(false);
    }
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
          {L.logout}
        </button>
      </div>

      {/* Account card */}
      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(30,40,80,0.06)] dark:bg-[#12141c] dark:shadow-none border border-slate-100/80 dark:border-white/5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{L.account}</p>
        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white break-all">{email}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#eef2ff] dark:bg-blue-500/10 px-3 py-4 text-center">
            <p className="text-2xl font-extrabold text-[#4f63f0]">{freePhotos}</p>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{L.free}</p>
          </div>
          <div className="rounded-2xl bg-[#eef2ff] dark:bg-blue-500/10 px-3 py-4 text-center">
            <p className="text-2xl font-extrabold text-[#4f63f0]">{paidPhotos}</p>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{L.paid}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPhotoModalOpen(true)}
          className="mt-4 flex w-full min-h-[48px] items-center justify-center rounded-full bg-[#4f63f0] text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(79,99,240,0.3)] active:scale-[0.98] transition"
        >
          {L.allTariffs}
        </button>
      </section>

      {/* Photos / Videos */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            markFromProfile();
            setCurrentView('gallery');
            window.history.pushState({}, '', viewToPath('gallery'));
          }}
          className="rounded-[20px] bg-white p-4 text-left shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
            <ImageIcon className="h-4 w-4 text-[#4f63f0]" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">{completedPhotos}</p>
          <p className="text-[12px] text-slate-500">
            {L.yourPhotos} <span className="text-slate-300">→</span>
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
            {L.yourVideos} <span className="text-slate-300">→</span>
          </p>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          markFromProfile();
          setCurrentView('library');
          window.history.pushState({}, '', viewToPath('library'));
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
          <FolderHeart className="h-4 w-4 text-[#4f63f0]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{L.saved}</p>
          <p className="text-[12px] text-slate-400 truncate">
            {L.savedSub}
            {userPhotos.length > 0 ? ` · ${userPhotos.length}` : ''}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </button>

      <button
        type="button"
        onClick={() => {
          markFromProfile();
          setCurrentView('history' as any);
          window.history.pushState({}, '', viewToPath('history' as any));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-blue-500/15">
          <ArrowUpDown className="h-4 w-4 text-[#4f63f0]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{L.history}</p>
          <p className="text-[12px] text-slate-400 truncate">
            {L.historySub}
            {photoTransactions.length > 0 ? ` · ${photoTransactions.length}` : ''}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </button>

      {/* Level (UI structure; rewards later) */}
      <section className="mt-4 rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{L.levelTitle}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="h-5 w-5 text-[#4f63f0] shrink-0" />
            <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {level <= 1 ? L.levelName : level === 2 ? (language === 'ru' ? 'Начинающий фотограф' : language === 'en' ? 'Beginner photographer' : 'Fotograf începător') : level === 3 ? 'Studio' : 'Pro'}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {language === 'ru' ? `Ур. ${level}` : language === 'en' ? `Lv. ${level}` : `Niv. ${level}`}
          </span>
        </div>
        <p className="mt-3 text-[12px] text-slate-500">
          {L.levelNext} · {completedGens} / {level < 2 ? 1 : level < 3 ? 10 : level < 4 ? 40 : completedGens}
        </p>
        <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#4f63f0] transition-all"
            style={{
              width: `${Math.min(100, level < 2 ? completedGens * 100 : level < 3 ? (completedGens / 10) * 100 : level < 4 ? (completedGens / 40) * 100 : 100)}%`
            }}
          />
        </div>
        <div className="mt-4 rounded-2xl bg-[#f4f6ff] dark:bg-blue-500/10 p-3 text-[13px] text-slate-600 dark:text-slate-300">
          <p className="font-medium mb-2">{L.levelReward}</p>
          <p>🎁 {L.levelR1}</p>
          <p className="mt-1">✨ {L.levelR2}</p>
        </div>
        <button type="button" className="mt-3 text-sm font-semibold text-[#4f63f0]">
          {L.levelMore}
        </button>
      </section>

      {/* Referral */}
      <section className="mt-4 rounded-[24px] bg-gradient-to-br from-[#5b6cf0] to-[#7b5cf0] p-5 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          <h3 className="text-lg font-bold">{L.refTitle}</h3>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-white/90">{L.refBody}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[140px] rounded-full bg-white/20 px-3 py-2 text-xs font-medium truncate">
            {referralLink.replace(/^https?:\/\//, '').slice(0, 22)}…
          </div>
          <button
            type="button"
            onClick={copyRef}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#4f63f0]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'OK' : L.copy}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#2AABEE] px-3 py-1.5 text-[11px] font-bold"
          >
            Telegram
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-bold text-slate-900"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={copyRef}
            className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold"
          >
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 px-3 py-3 text-center">
            <p className="text-xl font-extrabold">{invited}</p>
            <p className="text-[11px] text-white/80">{L.invited}</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-3 text-center">
            <p className="text-xl font-extrabold">{refEarned}</p>
            <p className="text-[11px] text-white/80">{L.refEarned}</p>
          </div>
        </div>
      </section>

      {/* Delete account */}
      <section className="mt-6 rounded-[20px] bg-white p-5 shadow-sm border border-slate-100 dark:bg-[#12141c] dark:border-white/5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{L.deleteTitle}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{L.deleteBody}</p>
        <button
          type="button"
          disabled={deleteBusy}
          onClick={handleDelete}
          className="mt-4 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30 px-5 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 disabled:opacity-50"
        >
          {deleteBusy ? '…' : L.deleteBtn}
        </button>
      </section>
    </div>
  );
};
