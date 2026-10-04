import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate, UserPhoto } from '../types';
import { SAMPLE_USER_PORTRAITS } from '../data/samplePhotos';
import {
  X,
  Upload,
  Sparkles,
  Coins,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Image as ImageIcon,
  FolderHeart,
  ArrowRight,
  ShieldCheck
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
    setCurrentView
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(() => {
    return initialTemplate || templates[0] || null;
  });

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(() => {
    return userPhotos[0]?.url || SAMPLE_USER_PORTRAITS[0].url;
  });
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(() => {
    return userPhotos[0]?.id || SAMPLE_USER_PORTRAITS[0].id;
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'samples'>('samples');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [generatedResultUrl, setGeneratedResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentTemplate = selectedTemplate || templates[0];
  const hasEnoughCredits = currentUser.creditBalance >= (currentTemplate?.creditCost || 1);

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const uploaded = await uploadPhoto(dataUrl, file.name);
        setSelectedPhotoUrl(uploaded.url);
        setSelectedPhotoId(uploaded.id);
        setActiveTab('library');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
    }
  };

  // Start Generation Job
  const handleStartGeneration = async () => {
    if (!currentTemplate) return;

    if (!hasEnoughCredits) {
      setIsCreditModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setCurrentStepText(t.queued);
    setErrorMessage(null);
    setGeneratedResultUrl(null);

    try {
      const job = await createGenerationJob(
        currentTemplate.id,
        selectedPhotoUrl,
        selectedPhotoId
      );

      // Listen for progress updates via local simulation or provider
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          if (prev < 30) setCurrentStepText(t.progressStepAnalyze);
          else if (prev < 65) setCurrentStepText(t.progressStepLighting);
          else if (prev < 85) setCurrentStepText(t.progressStepLikeness);
          else setCurrentStepText(t.progressStepRefine);

          return prev + 12;
        });
      }, 500);

      // Wait for job completion in memory
      setTimeout(() => {
        clearInterval(interval);
        setGenerationProgress(100);
        setCurrentStepText(t.completed);
        // The job result is available
        setGeneratedResultUrl(job.resultImageUrl || currentTemplate.previewImage);
      }, 3500);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err?.message || 'A apărut o problemă la inițierea generării');
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
          {/* STATE 1: GENERATION IN PROGRESS OR COMPLETED */}
          {isGenerating ? (
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
                // LOADING SPINNER & PROGRESS
                <div className="space-y-6 max-w-sm mx-auto">
                  {/* Circular Ambient Loader */}
                  <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-pulse" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"
                      style={{ animationDuration: '1.2s' }}
                    />
                    <div className="flex flex-col items-center">
                      <Sparkles className="h-6 w-6 text-amber-400 animate-bounce" />
                      <span className="text-sm font-bold text-white tabular-nums mt-1">
                        {generationProgress}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {currentStepText || t.processing}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Motorul AuraStudio sintetizează iluminarea europeană și trăsăturile tale.
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // STATE 2: STEP-BY-STEP CREATION WORKFLOW
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

              {/* Step 2: Choose or Upload User Photo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {t.step2Photo}
                  </label>

                  {/* Tabs: Test Samples | My Library | Upload New */}
                  <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
                    <button
                      onClick={() => setActiveTab('samples')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        activeTab === 'samples'
                          ? 'bg-amber-400 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.quickSamplePhotos.split(' ')[0]}
                    </button>
                    <button
                      onClick={() => setActiveTab('library')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        activeTab === 'library'
                          ? 'bg-amber-400 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.photoLibrary.split(' ')[0]} ({userPhotos.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('upload');
                        fileInputRef.current?.click();
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        activeTab === 'upload'
                          ? 'bg-amber-400 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="h-3 w-3" />
                      <span>{t.uploadNewPhoto.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>

                {/* Hidden input for local upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Tab Content: Quick Samples */}
                {activeTab === 'samples' && (
                  <div className="grid grid-cols-3 gap-3">
                    {SAMPLE_USER_PORTRAITS.map((sample) => {
                      const isSelected = selectedPhotoUrl === sample.url;
                      return (
                        <div
                          key={sample.id}
                          onClick={() => {
                            setSelectedPhotoUrl(sample.url);
                            setSelectedPhotoId(sample.id);
                          }}
                          className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
                            <span className="text-[11px] font-medium text-white truncate block">
                              {sample.name}
                            </span>
                          </div>
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

                {/* Tab Content: User Photo Library */}
                {activeTab === 'library' && (
                  <div>
                    {userPhotos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-6 text-center">
                        <FolderHeart className="h-8 w-8 text-slate-500 mb-2" />
                        <p className="text-xs text-slate-400 mb-3">{t.noPhotosInLibrary}</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>{t.uploadNewPhoto}</span>
                        </button>
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
                )}

                {/* Tab Content: Upload Drop Area */}
                {activeTab === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.03] p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-500/[0.06] transition-all"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {isUploading ? 'Se încarcă...' : t.dropPhotoHere}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      JPG, PNG, HEIC până la 20MB. Salvare automată în biblioteca privată.
                    </span>
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
                {/* Cost and Balance Note */}
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-300">
                    Cost: <strong className="text-white">{currentTemplate.creditCost} {t.credits}</strong>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    Balanță: <strong className="text-amber-300 font-semibold">{currentUser.creditBalance}</strong>
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
