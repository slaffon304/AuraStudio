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

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mx-auto">
          <FolderHeart className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          {language === 'ru' ? 'Твоя личная библиотека фото' : 'Biblioteca Ta Privată de Fotografii'}
        </h2>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-amber-400 px-6 py-2.5 text-xs font-bold text-white dark:text-slate-950"
        >
          <LogIn className="h-4 w-4" />
          <span>{t.login}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.librarySub}</p>
          </div>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-amber-400 px-5 py-2.5 text-xs font-bold text-white dark:text-slate-950"
          >
            <Upload className="h-4 w-4" />
            <span>{t.uploadNewPhoto}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs text-emerald-700 dark:text-emerald-300">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
        <span>{t.privacyNote}</span>
      </div>

      {userPhotos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 p-16 text-center cursor-pointer"
        >
          <FolderHeart className="h-7 w-7 text-amber-500 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.noPhotosInLibrary}</h3>
          <p className="mt-1 text-xs text-slate-500">{t.dropPhotoHere}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12141c]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img src={photo.url} alt={photo.filename} className="h-full w-full object-cover" />
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-amber-400 py-2 text-[11px] font-bold text-white dark:text-slate-950"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{language === 'ru' ? 'Создать фото' : 'Creează foto'}</span>
                  </button>
                </div>
              </div>
              <div className="p-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[110px]">{photo.filename}</span>
                <span className="text-[10px]">{new Date(photo.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
