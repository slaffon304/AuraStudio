import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate } from '../types';
import {
  X,
  Upload,
  Sparkles,
  Coins,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  FolderHeart,
  ArrowRight,
  LogIn
} from 'lucide-react';

interface CreatePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: PhotoTemplate | null;
}

export const CreatePhotoModal: React.FC<CreatePhotoModalProps> = ({
  isOpen,
  onClose,
  initialTemplate
}) => {
  const {
    t,
    templates,
    userPhotos,
    uploadPhoto,
    currentUser,
    createGenerationJob,
    setIsCreditModalOpen,
    setIsAuthModalOpen,
    setCurrentView
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(() => {
    return initialTemplate || templates[0] || null;
  });

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(() => {
    return userPhotos[0]?.url || '';
  });
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(() => {
    return userPhotos[0]?.id || '';
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [generatedResultUrl, setGeneratedResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentTemplate = selectedTemplate || templates[0];
  const hasEnoughCredits = (currentUser?.creditBalance || 0) >= (currentTemplate?.creditCost || 1);

  // Handle local file upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result as string;
          const uploaded = await uploadPhoto(dataUrl, file.name);
          setSelectedPhotoUrl(uploaded.url);
          setSelectedPhotoId(uploaded.id);
        } catch (uploadErr: any) {
          setErrorMessage(uploadErr.message || 'Eroare la încărcarea imaginii.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message);
    }
  };

  // Start Real Generation Job
  const handleStartGeneration = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!currentTemplate) return;

    if (!hasEnoughCredits) {
      setIsCreditModalOpen(true);
      return;
    }

    if (!selectedPhotoUrl) {
      setErrorMessage('Te rugăm să selectezi o fotografie din biblioteca ta sau să încarci una nouă.');
      return;
    }

    setIsGenerating(true);
    setCurrentStepText(t.progressStepAnalyze);
    setErrorMessage(null);
    setGeneratedResultUrl(null);

    try {
      // Step feedback
      const progressTimer = setTimeout(() => {
        setCurrentStepText(t.progressStepLighting);
      }, 2000);

      const job = await createGenerationJob(
        currentTemplate.id,
        selectedPhotoUrl,
        selectedPhotoId
      );

      clearTimeout(progressTimer);
      setCurrentStepText(t.completed);
      setGeneratedResultUrl(job.resultImageUrl || null);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err?.message || 'A apărut o problemă la generare. Creditele au fost restituite.');
    }
  };

  // Download high-resolution result
  const handleDownload = () => {
    if (!generatedResultUrl) return;
    const a = document.createElement('a');
    a.href = generatedResultUrl;
    a.download = `AuraStudio_${currentTemplate?.id || 'photo'}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto overflow-hidden rounded-3xl border border-white/10 bg-[#11131c] shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {isGenerating ? t.generating : t.createPhotoAction}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t.heroSubhead}
              </p>
            </div>
          </div>

          {!isGenerating && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* USER NOT LOGGED IN BANNER */}
          {!currentUser ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
                <LogIn className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Autentifică-te pentru a crea fotografii
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fiecare utilizator nou primește 15 credite cadou de bun venit la înregistrare.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95"
              >
                <span>Conectează-te sau Înregistrează-te</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : isGenerating ? (
            /* STATE 1: REAL ASYNCHRONOUS PIPELINE IN PROGRESS OR COMPLETED */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {generatedResultUrl ? (
                // SUCCESS VIEW
                <div className="w-full space-y-5 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>{t.completed}</span>
                  </div>

                  {/* Before / After Split Preview */}
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                      <img
                        src={selectedPhotoUrl}
                        alt="Original"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-black/70 px-2 py-0.5 rounded-md text-slate-300 backdrop-blur-sm">
                        {t.showOriginal}
                      </span>
                    </div>

                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-slate-900 shadow-xl shadow-amber-500/10">
                      <img
                        src={generatedResultUrl}
                        alt="AI Result"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-md">
                        {t.showResult}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t.downloadPhoto}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        setCurrentView('gallery');
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      <span>{t.myGallery}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsGenerating(false);
                        setGeneratedResultUrl(null);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>{t.createVariation}</span>
                    </button>
                  </div>
                </div>
              ) : (
                // REAL PROCESSING SPINNER
                <div className="space-y-6 max-w-sm mx-auto">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-pulse" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"
                      style={{ animationDuration: '1.2s' }}
                    />
                    <Sparkles className="h-7 w-7 text-amber-400 animate-bounce" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {currentStepText || t.processing}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Serverul AuraStudio procesează cererea prin modelul Google Gemini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: STEP-BY-STEP WORKFLOW */
            <div className="space-y-6">
              {/* Step 1: Selected Template Display */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {t.step1Template}
                </label>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentTemplate.previewImage}
                      alt="Template"
                      className="h-14 w-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {currentTemplate.name.ro}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400 font-medium">{currentTemplate.category}</span>
                        <span>·</span>
                        <span>{currentTemplate.aspectRatio}</span>
                        <span>·</span>
                        <span>{currentTemplate.creditCost} {t.credits}</span>
                      </div>
                    </div>
                  </div>

                  <select
                    value={currentTemplate.id}
                    onChange={(e) => {
                      const found = templates.find((tmpl) => tmpl.id === e.target.value);
                      if (found) setSelectedTemplate(found);
                    }}
                    className="rounded-xl border border-white/10 bg-[#161924] px-3 py-2 text-xs text-slate-200 outline-none hover:border-white/20"
                  >
                    {templates.filter(t => t.isActive).map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name.ro} ({tmpl.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Choose Photo from Supabase Storage or Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {t.step2Photo}
                  </label>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:brightness-110 transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-3 w-3" />
                    <span>{isUploading ? 'Se încarcă...' : t.uploadNewPhoto}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {userPhotos.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-white/[0.04] transition-all"
                  >
                    <FolderHeart className="h-8 w-8 text-slate-500 mb-2" />
                    <p className="text-xs font-semibold text-white mb-1">
                      {isUploading ? 'Se încarcă în Storage...' : 'Nu ai încă fotografii în biblioteca ta'}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Apasă aici pentru a încărca prima fotografie privată în Supabase Storage.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-1">
                    {userPhotos.map((photo) => {
                      const isSelected = selectedPhotoUrl === photo.url;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => {
                            setSelectedPhotoUrl(photo.url);
                            setSelectedPhotoId(photo.id);
                          }}
                          className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt="User photo"
                            className="h-full w-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Bottom Cost & Generation Trigger */}
              <div className="border-t border-white/[0.08] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-300">
                    Cost: <strong className="text-white">{currentTemplate.creditCost} {t.credits}</strong>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    Balanță: <strong className="text-amber-300 font-semibold">{currentUser?.creditBalance || 0}</strong>
                  </span>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2.5">
                  {!hasEnoughCredits && (
                    <button
                      onClick={() => setIsCreditModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium hover:bg-amber-500/20"
                    >
                      {t.topUpCredits}
                    </button>
                  )}

                  <button
                    onClick={handleStartGeneration}
                    disabled={!selectedPhotoUrl}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-7 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{t.generateButton}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
