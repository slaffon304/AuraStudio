import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPhotoFileValidationError, readPhotoFileAsDataUrl } from '../lib/photo-files';
import { Upload, Trash2, Sparkles, FolderHeart, ShieldCheck, LogIn, ArrowRight, AlertCircle } from 'lucide-react';

export const PhotoLibraryView: React.FC = () => {
  const { userPhotos, uploadPhoto, deletePhoto, currentUser, setIsAuthModalOpen, t, setIsCreateModalOpen, isLocalPreviewMode } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = getPhotoFileValidationError(file);
    if (validationError) {
      setUploadError(validationError === 'too-large' ? t.photoTooLarge : t.photoUnsupported);
      input.value = '';
      return;
    }

    if (!currentUser) {
      setIsAuthModalOpen(true);
      input.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const dataUrl = await readPhotoFileAsDataUrl(file);
      await uploadPhoto(dataUrl, file.name);
    } catch (error: any) {
      setUploadError(error.message || t.photoUploadFailed);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 mx-auto">
          <FolderHeart className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">
          Biblioteca Ta Privată de Fotografii
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Conectează-te pentru a încărca și gestiona fotografiile tale în siguranță pe Supabase Storage.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95"
        >
          <LogIn className="h-4 w-4" />
          <span>Autentifică-te pentru a accesa biblioteca</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.libraryTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {t.librarySub}
          </p>
        </div>

        {/* Upload Action */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? t.photoUploading : t.uploadNewPhoto}</span>
          </button>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs text-emerald-300">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
        <span>{isLocalPreviewMode ? t.localPreviewPhotoNote : t.privacyNote}</span>
      </div>

      {uploadError && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Photo Grid */}
      {userPhotos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] p-16 text-center cursor-pointer hover:border-amber-400/40 transition-colors"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 mb-3">
            <FolderHeart className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-semibold text-white">{t.noPhotosInLibrary}</h3>
          <p className="mt-1 text-xs text-slate-400">{t.dropPhotoHere}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141c] hover:border-amber-500/40 transition-all shadow-md"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Ambient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Delete Button */}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all"
                  title={t.deletePhoto}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Use for Generation CTA */}
                <div className="absolute inset-x-2 bottom-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2 px-3 text-[11px] font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t.useForGeneration}</span>
                  </button>
                </div>
              </div>

              {/* Photo filename */}
              <div className="p-2.5">
                <p className="text-[11px] font-medium text-slate-300 truncate">
                  {photo.filename}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
