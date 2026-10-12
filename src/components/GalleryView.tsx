import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Download, LogIn, Trash2, X, Sparkles } from 'lucide-react';
import { viewToPath } from '../lib/navigation';

type Tab = 'photos' | 'videos';

export const GalleryView: React.FC = () => {
  const {
    jobs,
    currentUser,
    language,
    setIsAuthModalOpen,
    setCurrentView,
    authToken,
    createGenerationJob
  } = useApp() as any;

  const [tab, setTab] = useState<Tab>('photos');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useState(jobs || []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    setLocalJobs(jobs || []);
  }, [jobs]);

  // Reset refine UI when switching preview
  useEffect(() => {
    setRating(null);
    setEditText('');
    setIsRefining(false);
    setRefineError(null);
  }, [previewJobId]);

  // Lock body scroll while preview is open
  useEffect(() => {
    if (!previewUrl) return;
    const prevOverflow = document.body.style.overflow;
    const prevPos = document.body.style.position;
    const prevTop = document.body.style.top;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPos;
      document.body.style.top = prevTop;
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [previewUrl]);

  const completedPhotos = (localJobs || []).filter(
    (j: any) => j.status === 'completed' && (j.resultImageUrl || j.result_image_url)
  );
  const photoCount = completedPhotos.length;
  const videoCount = 0;

  const copy = {
    title: language === 'ru' ? 'Моя галерея' : language === 'en' ? 'My gallery' : 'Galeria mea',
    photos: language === 'ru' ? 'Фото' : language === 'en' ? 'Photos' : 'Foto',
    videos: language === 'ru' ? 'Видео' : language === 'en' ? 'Videos' : 'Video',
    empty: language === 'ru' ? 'Пока пусто' : language === 'en' ? 'Nothing here yet' : 'Încă e gol',
    emptySub:
      language === 'ru'
        ? 'Сделай первое фото на '
        : language === 'en'
          ? 'Create your first photo on the '
          : 'Fă prima foto pe ',
    homeLink: language === 'ru' ? 'главной' : language === 'en' ? 'home page' : 'pagina principală',
    emptyVideos:
      language === 'ru'
        ? 'Видео пока нет — скоро появятся'
        : language === 'en'
          ? 'No videos yet — coming soon'
          : 'Încă nu sunt video — în curând',
    loginTitle:
      language === 'ru' ? 'Войдите, чтобы увидеть галерею' : language === 'en' ? 'Sign in to see your gallery' : 'Autentifică-te pentru galerie',
    loginBtn: language === 'ru' ? 'Войти' : language === 'en' ? 'Sign in' : 'Autentificare',
    download: language === 'ru' ? 'Скачать фото' : language === 'en' ? 'Download photo' : 'Descarcă foto',
    delete: language === 'ru' ? 'Удалить' : language === 'en' ? 'Delete' : 'Șterge',
    confirmDelete:
      language === 'ru' ? 'Удалить это фото из галереи?' : language === 'en' ? 'Delete this photo from gallery?' : 'Ștergi această foto din galerie?',
    rateTitle: language === 'ru' ? 'Оцени полученное фото' : language === 'en' ? 'Rate this photo' : 'Evaluează foto',
    rateLabels:
      language === 'ru'
        ? ['Совсем плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
        : language === 'en'
          ? ['Terrible', 'Bad', 'OK', 'Good', 'Excellent']
          : ['Foarte rău', 'Rău', 'OK', 'Bine', 'Excelent'],
    editTitle: language === 'ru' ? 'Хочешь что-то изменить?' : language === 'en' ? 'Want to change something?' : 'Vrei să schimbi ceva?',
    editHint:
      language === 'ru'
        ? 'Опиши что поправить — изменим только это, остальное сохраним как есть.'
        : language === 'en'
          ? 'Describe what to fix — we change only that, keep the rest.'
          : 'Descrie ce să corectăm — schimbăm doar asta.',
    editPlaceholder:
      language === 'ru'
        ? 'Например: сделай улыбку шире, добавь очки, поменяй фон на закат...'
        : language === 'en'
          ? 'E.g. wider smile, add glasses, change background to sunset...'
          : 'Ex: zâmbet mai larg, adaugă ochelari...',
    fixBtn: language === 'ru' ? 'Поправить' : language === 'en' ? 'Fix' : 'Corectează',
    costNote: language === 'ru' ? 'потратит 1 фото с баланса' : language === 'en' ? 'uses 1 photo from balance' : 'folosește 1 foto din balanță',
    save: language === 'ru' ? 'Сохранить фото' : language === 'en' ? 'Save photo' : 'Salvează foto',
    makeMore: language === 'ru' ? 'Сделать ещё' : language === 'en' ? 'Create more' : 'Mai departe',
    deletePhoto: language === 'ru' ? 'Удалить фото' : language === 'en' ? 'Delete photo' : 'Șterge foto',
    support:
      language === 'ru'
        ? 'Что-то сломалось или вышло не так, как хотелось? Пиши в Telegram'
        : language === 'en'
          ? 'Something went wrong? Message us on Telegram'
          : 'Ceva nu a mers cum trebuia? Scrie pe Telegram',
    supportTeam:
      language === 'ru'
        ? '— команда AuraStudio поможет тебе.'
        : language === 'en'
          ? '— the AuraStudio team will help.'
          : '— echipa AuraStudio te ajută.',
    honest:
      language === 'ru'
        ? 'Мы хотим создавать классный и честный продукт — команда AuraStudio ❤️'
        : language === 'en'
          ? 'We want to build a great, honest product — AuraStudio team ❤️'
          : 'Vrem un produs bun și onest — echipa AuraStudio ❤️',
    tgBtn: language === 'ru' ? 'Написать в Telegram-поддержку' : language === 'en' ? 'Message Telegram support' : 'Scrie în Telegram-suport'
  };

  const goHome = () => {
    setCurrentView('explore');
    window.history.pushState({}, '', viewToPath('explore'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      goHome();
    }
  };

  const jobUrl = (job: any) => job.resultImageUrl || job.result_image_url || '';

  const handleDownload = async (url: string) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `AuraStudio_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!jobId) return;
    if (!window.confirm(copy.confirmDelete)) return;
    setBusyId(jobId);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/generations/${jobId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok || res.status === 404) {
        setLocalJobs((prev: any[]) => prev.filter((j) => j.id !== jobId));
        if (previewJobId === jobId) {
          setPreviewUrl(null);
          setPreviewJobId(null);
        }
      } else {
        setLocalJobs((prev: any[]) => prev.filter((j) => j.id !== jobId));
        if (previewJobId === jobId) {
          setPreviewUrl(null);
          setPreviewJobId(null);
        }
      }
    } catch {
      setLocalJobs((prev: any[]) => prev.filter((j) => j.id !== jobId));
      if (previewJobId === jobId) {
        setPreviewUrl(null);
        setPreviewJobId(null);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleRefine = async () => {
    if (!previewUrl || !editText.trim() || isRefining) return;
    setIsRefining(true);
    setRefineError(null);
    try {
      // Re-generate from current result as user photo with enhance mode + edit instruction
      // Prefer a dedicated refine endpoint later; for now use enhance path if available
      if (typeof createGenerationJob === 'function') {
        const job = await createGenerationJob(
          'refine-edit',
          previewUrl,
          undefined,
          {
            mode: 'refine' as any,
            editInstruction: editText.trim(),
            quality: '2K'
          } as any
        );
        const newUrl = job?.resultImageUrl || job?.result_image_url;
        if (newUrl) {
          setPreviewUrl(newUrl);
          if (job?.id) {
            setLocalJobs((prev: any[]) => [job, ...prev.filter((j) => j.id !== job.id)]);
            setPreviewJobId(job.id);
          }
          setEditText('');
        } else {
          setRefineError(language === 'ru' ? 'Не удалось обновить фото' : 'Could not update photo');
        }
      } else {
        // Fallback: POST enhance with instruction in body
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const res = await fetch('/api/generations', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            mode: 'refine',
            userPhotoUrl: previewUrl,
            quality: '2K',
            editInstruction: editText.trim()
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Error');
        if (data.resultImageUrl) {
          setPreviewUrl(data.resultImageUrl);
          setEditText('');
          if (data.jobId) setPreviewJobId(data.jobId);
        }
      }
    } catch (err: any) {
      setRefineError(err?.message || 'Error');
    } finally {
      setIsRefining(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{copy.title}</h1>
        <p className="mt-3 text-sm text-slate-500">{copy.loginTitle}</p>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-5 py-3 text-sm font-bold text-white dark:text-slate-900"
        >
          <LogIn className="h-4 w-4" />
          {copy.loginBtn}
        </button>
      </div>
    );
  }

  const count = tab === 'photos' ? photoCount : videoCount;

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 dark:bg-white/5 dark:border-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="flex-1 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {copy.title}
        </h1>
        <span className="text-sm font-semibold text-slate-400 tabular-nums">{count}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('photos')}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            tab === 'photos'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white/80 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10'
          }`}
        >
          {copy.photos} {photoCount}
        </button>
        <button
          type="button"
          onClick={() => setTab('videos')}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            tab === 'videos'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white/80 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10'
          }`}
        >
          {copy.videos} {videoCount}
        </button>
      </div>

      {tab === 'videos' ? (
        <div className="mt-6 rounded-3xl bg-white/90 dark:bg-[#12141c]/90 border border-slate-100 dark:border-white/10 px-6 py-14 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{copy.empty}</p>
          <p className="mt-2 text-sm text-slate-500">{copy.emptyVideos}</p>
        </div>
      ) : photoCount === 0 ? (
        <div className="mt-6 rounded-3xl bg-white/90 dark:bg-[#12141c]/90 border border-slate-100 dark:border-white/10 px-6 py-14 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{copy.empty}</p>
          <p className="mt-2 text-sm text-slate-500">
            {copy.emptySub}
            <button type="button" onClick={goHome} className="font-semibold text-blue-600 underline-offset-2 hover:underline">
              {copy.homeLink}
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {completedPhotos.map((job: any) => {
            const url = jobUrl(job);
            return (
              <div
                key={job.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/10"
              >
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => {
                    setPreviewUrl(url);
                    setPreviewJobId(job.id);
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div className="absolute bottom-2 inset-x-2 flex justify-between gap-2 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(job.id);
                    }}
                    disabled={busyId === job.id}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white active:scale-95"
                    aria-label={copy.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(url);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white active:scale-95"
                    aria-label={copy.download}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-[300] flex flex-col bg-slate-50 dark:bg-[#0b0d12] overscroll-none overflow-y-auto"
          onClick={() => {
            setPreviewUrl(null);
            setPreviewJobId(null);
          }}
        >
          <div
            className="mx-auto w-full max-w-lg flex flex-col min-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-3 pb-2 pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sticky top-0 z-10 bg-slate-50/95 dark:bg-[#0b0d12]/95 backdrop-blur">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/10 dark:bg-white/15 text-slate-800 dark:text-white"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewJobId(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {previewJobId && (
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white"
                    onClick={() => handleDelete(previewJobId)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="px-3 flex justify-center">
              <img
                src={previewUrl}
                alt=""
                className="max-h-[55vh] w-full object-contain rounded-2xl shadow-lg"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </div>

            {/* Actions panel — same as post-generation result screen */}
            <div className="px-4 pt-4 pb-28 space-y-4">
              <button
                type="button"
                onClick={() => handleDownload(previewUrl)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm active:scale-[0.99]"
              >
                <Download className="h-4 w-4" />
                {copy.save}
              </button>

              {/* Rating */}
              <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4">
                <p className="text-center text-sm font-bold text-slate-900 dark:text-white mb-3">{copy.rateTitle}</p>
                <div className="flex justify-between gap-1">
                  {(['😢', '🙁', '😐', '🙂', '😍'] as const).map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition ${
                        rating === i + 1
                          ? 'bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 scale-105'
                          : 'text-slate-500'
                      }`}
                    >
                      <span className="text-2xl leading-none">{emoji}</span>
                      <span className="leading-tight text-center">{copy.rateLabels[i]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit / refine */}
              <div className="rounded-2xl bg-violet-50/80 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{copy.editTitle}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{copy.editHint}</p>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder={copy.editPlaceholder}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                {refineError && <p className="text-xs text-red-500">{refineError}</p>}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">{copy.costNote}</span>
                  <button
                    type="button"
                    disabled={!editText.trim() || isRefining}
                    onClick={handleRefine}
                    className="inline-flex items-center gap-1.5 rounded-full bg-violet-500 disabled:bg-violet-300 px-4 py-2 text-xs font-bold text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isRefining
                      ? language === 'ru'
                        ? 'Генерация…'
                        : language === 'en'
                          ? 'Generating…'
                          : 'Se generează…'
                      : copy.fixBtn}
                  </button>
                </div>
              </div>

              {/* Make more / Delete */}
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewJobId(null);
                  setCurrentView('explore');
                  window.history.pushState({}, '', '/app');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                <Sparkles className="h-4 w-4" />
                {copy.makeMore}
              </button>
              {previewJobId && (
                <button
                  type="button"
                  onClick={() => handleDelete(previewJobId)}
                  disabled={busyId === previewJobId}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500"
                >
                  <Trash2 className="h-4 w-4" />
                  {copy.deletePhoto}
                </button>
              )}

              {/* Support block */}
              <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.support}{' '}
                <a
                  href="https://t.me/aurastudio_help_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 underline-offset-2 hover:underline"
                >
                  @aurastudio_help_bot
                </a>{' '}
                {copy.supportTeam}
              </div>
              <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.honest}
              </div>
              <a
                href="https://t.me/aurastudio_help_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-700 py-3.5 text-sm font-bold text-white shadow-sm"
              >
                {copy.tgBtn}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
