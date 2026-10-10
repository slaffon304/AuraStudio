import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, Trash2, Sparkles, FolderHeart, ShieldCheck, LogIn, ArrowLeft } from 'lucide-react';
import { viewToPath, isFromProfile, clearFromProfile } from '../lib/navigation';

export const PhotoLibraryView: React.FC = () => {
  const {
    userPhotos,
    uploadPhoto,
    deletePhoto,
    currentUser,
    setIsAuthModalOpen,
    t,
    setIsCreateModalOpen,
    language,
    setCurrentView
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goBack = () => {
    if (isFromProfile()) {
      clearFromProfile();
      setCurrentView('profile' as any);
      window.history.pushState({}, '', viewToPath('profile'));
    } else {
      setCurrentView('explore');
      window.history.pushState({}, '', viewToPath('explore'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await uploadPhoto(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm(language === 'ru' ? 'Удалить это фото?' : language === 'en' ? 'Delete this photo?' : 'Ștergi această fotografie?')) {
      return;
    }
    await deletePhoto(id);
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mx-auto">
          <FolderHeart className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          {language === 'ru' ? 'Твоя личная библиотека фото' : 'Biblioteca Ta Privată de Fotografii'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {language === 'ru'
            ? 'Войди в аккаунт, чтобы загружать и безопасно хранить свои исходные селфи.'
            : 'Conectează-te pentru a încărca și gestiona fotografiile tale în siguranță pe Supabase Storage.'}
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-400 px-6 py-2.5 text-xs font-bold text-white dark:text-slate-950 shadow-md active:scale-95 transition-all"
        >
          <LogIn className="h-4 w-4" />
          <span>{t.login}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={goBack}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.libraryTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.librarySub}
            </p>
          </div>
        </div>

        {/* Upload Action */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-400 px-5 py-2.5 text-xs font-bold text-white dark:text-slate-950 shadow-md active:scale-95 transition-all"
          >
            <Upload className="h-4 w-4 text-amber-400 dark:text-slate-950" />
            <span>{t.uploadNewPhoto}</span>
          </button>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs text-emerald-700 dark:text-emerald-300">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
        <span>{t.privacyNote}</span>
      </div>

      {/* Photo Grid */}
      {userPhotos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.02] p-16 text-center cursor-pointer hover:border-amber-500 transition-colors shadow-2xs"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-3">
            <FolderHeart className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.noPhotosInLibrary}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.dropPhotoHere}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12141c] hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Ambient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />

                {/* Delete — always visible on mobile, hover on desktop */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(photo.id, e)}
                  className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-500 active:scale-95 transition-all z-10"
                  title={language === 'ru' ? 'Удалить' : language === 'en' ? 'Delete' : 'Șterge'}
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Use In Shoot Button */}
                <div className="absolute inset-x-2 bottom-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 py-2 text-[11px] font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Sparkles className="h-3 w-3 text-amber-400 dark:text-slate-950" />
                    <span>{language === 'ru' ? 'Создать фото' : 'Creează foto'}</span>
                  </button>
                </div>
              </div>

              {/* Caption */}
              <div className="p-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[110px]" title={photo.filename}>
                  {photo.filename}
                </span>
                <span className="shrink-0 text-[10px]">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
