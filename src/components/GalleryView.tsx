import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, LogIn, X } from 'lucide-react';
import { viewToPath } from '../lib/navigation';

type Tab = 'photos' | 'videos';

export const GalleryView: React.FC = () => {
  const {
    jobs,
    currentUser,
    language,
    setIsAuthModalOpen,
    setCurrentView
  } = useApp();

  const [tab, setTab] = useState<Tab>('photos');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const completedPhotos = (jobs || []).filter(
    (j) => j.status === 'completed' && j.resultImageUrl
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
    loginBtn: language === 'ru' ? 'Войти' : language === 'en' ? 'Sign in' : 'Autentificare'
  };

  const goHome = () => {
    setCurrentView('explore');
    window.history.pushState({}, '', viewToPath('explore'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraStudio_${Date.now()}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {copy.title}
        </h1>
        <span className="text-sm font-semibold text-slate-400">{count}</span>
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
          {completedPhotos.map((job) => (
            <div
              key={job.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/10"
            >
              <button
                type="button"
                className="absolute inset-0"
                onClick={() => setPreviewUrl(job.resultImageUrl || null)}
              >
                <img
                  src={job.resultImageUrl!}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
              <button
                type="button"
                onClick={() => handleDownload(job.resultImageUrl!)}
                className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                aria-label="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={previewUrl}
            alt=""
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
