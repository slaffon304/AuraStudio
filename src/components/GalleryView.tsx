import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Download, LogIn, Trash2, X } from 'lucide-react';
import { viewToPath } from '../lib/navigation';

type Tab = 'photos' | 'videos';

export const GalleryView: React.FC = () => {
  const {
    jobs,
    currentUser,
    language,
    setIsAuthModalOpen,
    setCurrentView,
    authToken
  } = useApp() as any;

  const [tab, setTab] = useState<Tab>('photos');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useState(jobs || []);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setLocalJobs(jobs || []);
  }, [jobs]);

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
      language === 'ru' ? 'Удалить это фото из галереи?' : language === 'en' ? 'Delete this photo from gallery?' : 'Ștergi această foto din galerie?'
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
        // optimistic local remove even if API missing
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
          className="fixed inset-0 z-[200] flex flex-col bg-black overscroll-none"
          onClick={() => {
            setPreviewUrl(null);
            setPreviewJobId(null);
          }}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(previewJobId);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-2 text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(previewUrl);
                }}
              >
                <Download className="h-4 w-4" />
                {copy.download}
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 min-h-0">
            <img
              src={previewUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
