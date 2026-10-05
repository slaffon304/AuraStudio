import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPhotoFileValidationError, readPhotoFileAsDataUrl } from '../lib/photo-files';
import { AspectRatio, PhotoTemplate } from '../types';
import {
  AlertCircle,
  CheckCircle,
  Coins,
  Download,
  FolderHeart,
  ImagePlus,
  LoaderCircle,
  LogIn,
  RefreshCw,
  Sparkles,
  Upload,
  X
} from 'lucide-react';

interface CreatePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: PhotoTemplate | null;
}

export const CreatePhotoModal: React.FC<CreatePhotoModalProps> = ({ isOpen, onClose, initialTemplate }) => {
  const {
    t,
    language,
    templates,
    userPhotos,
    uploadPhoto,
    currentUser,
    isLocalPreviewMode,
    createGenerationJob,
    setIsCreditModalOpen,
    setIsAuthModalOpen,
    setCurrentView,
    selectedTemplate: contextSelectedTemplate,
    setSelectedTemplate: setContextSelectedTemplate
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(() => initialTemplate || contextSelectedTemplate || templates[0] || null);
  const [aspectRatioOverride, setAspectRatioOverride] = useState<AspectRatio | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(() => userPhotos[0]?.url || '');
  const [selectedPhotoId, setSelectedPhotoId] = useState(() => userPhotos[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [generatedResultUrl, setGeneratedResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedTemplate(initialTemplate || contextSelectedTemplate || templates[0] || null);
    setAspectRatioOverride(null);
    setGeneratedResultUrl(null);
    setIsGenerating(false);
    setErrorMessage(null);
    if (!selectedPhotoId && userPhotos[0]) {
      setSelectedPhotoUrl(userPhotos[0].url);
      setSelectedPhotoId(userPhotos[0].id);
    }
  }, [isOpen, initialTemplate, contextSelectedTemplate, templates, userPhotos, selectedPhotoId]);

  if (!isOpen) return null;

  const currentTemplate = selectedTemplate || templates[0] || null;
  if (!currentTemplate) return null;

  const selectedAspectRatio = aspectRatioOverride || currentTemplate.aspectRatio;
  const hasEnoughCredits = (currentUser?.creditBalance || 0) >= currentTemplate.creditCost;
  const aspectRatioOptions: { value: AspectRatio; label: string }[] = [
    { value: '1:1', label: t.ratioSquare },
    { value: '9:16', label: t.ratioVertical },
    { value: '3:4', label: t.ratioPortrait },
    { value: '4:3', label: t.ratioLandscape },
    { value: '16:9', label: t.ratioWidescreen }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = getPhotoFileValidationError(file);
    if (validationError) {
      setErrorMessage(validationError === 'too-large' ? t.photoTooLarge : t.photoUnsupported);
      input.value = '';
      return;
    }
    if (!currentUser) {
      setIsAuthModalOpen(true);
      input.value = '';
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const dataUrl = await readPhotoFileAsDataUrl(file);
      const uploaded = await uploadPhoto(dataUrl, file.name);
      setSelectedPhotoUrl(uploaded.url);
      setSelectedPhotoId(uploaded.id);
    } catch (error: any) {
      setErrorMessage(error?.message || t.photoUploadFailed);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  const handleStartGeneration = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!hasEnoughCredits) {
      setIsCreditModalOpen(true);
      return;
    }
    if (!selectedPhotoUrl || !selectedPhotoId) {
      setErrorMessage(t.selectPhotoBeforeGenerate);
      return;
    }
    if (isLocalPreviewMode) {
      setErrorMessage(t.localPreviewGenerationUnavailable);
      return;
    }

    setIsGenerating(true);
    setCurrentStepText(t.progressStepAnalyze);
    setErrorMessage(null);
    setGeneratedResultUrl(null);
    const progressTimer = window.setTimeout(() => setCurrentStepText(t.progressStepLighting), 2000);

    try {
      const job = await createGenerationJob(currentTemplate.id, selectedPhotoUrl, selectedPhotoId, selectedAspectRatio);
      setCurrentStepText(t.completed);
      setGeneratedResultUrl(job.resultImageUrl || null);
    } catch (error: any) {
      setIsGenerating(false);
      setErrorMessage(error?.message || t.failed);
    } finally {
      window.clearTimeout(progressTimer);
    }
  };

  const handleDownload = () => {
    if (!generatedResultUrl) return;
    const link = document.createElement('a');
    link.href = generatedResultUrl;
    link.download = `AuraStudio_${currentTemplate.id}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17203b]/45 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
      <div className="my-auto max-h-[94vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] border border-white bg-white shadow-[0_24px_80px_rgba(24,34,66,.25)] sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0f5] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf0ff] text-[#536af1]"><Sparkles className="h-4 w-4" /></span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-[#202844] sm:text-base">{isGenerating ? t.generating : t.createPhotoAction}</h2>
              <p className="truncate text-[10px] text-[#8992a5] sm:text-[11px]">{t.heroSubhead}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#7c879e] transition hover:bg-[#f3f5fa] hover:text-[#303b59]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {isLocalPreviewMode && (
            <div className="mb-4 rounded-2xl border border-[#dfe5f4] bg-[#f5f7ff] px-3.5 py-3 text-[10px] leading-relaxed text-[#697694] sm:text-xs">
              {t.localPreviewPhotoNote} {t.localPreviewGenerationUnavailable}
            </div>
          )}

          {!currentUser ? (
            <div className="mx-auto max-w-sm py-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf0ff] text-[#536af1]"><LogIn className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-extrabold text-[#27314f]">{t.login}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#858ea2]">{t.landingFreeNote}</p>
              <button onClick={() => setIsAuthModalOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#536af1] px-6 text-xs font-bold text-white transition hover:bg-[#405ae8]">
                {t.login}<Sparkles className="h-4 w-4" />
              </button>
            </div>
          ) : isGenerating ? (
            generatedResultUrl ? (
              <div className="mx-auto max-w-lg py-3 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ebf8f0] px-3 py-1.5 text-[11px] font-bold text-[#298354]"><CheckCircle className="h-4 w-4" />{t.completed}</div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[{ url: selectedPhotoUrl, label: t.showOriginal }, { url: generatedResultUrl, label: t.showResult }].map((item) => (
                    <div key={item.label} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#edf0f6]">
                      <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold text-[#4c5875] shadow-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                  <button onClick={handleDownload} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#536af1] px-5 text-xs font-bold text-white"><Download className="h-4 w-4" />{t.downloadPhoto}</button>
                  <button onClick={() => { onClose(); setCurrentView('gallery'); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#e4e8f0] px-5 text-xs font-semibold text-[#53617f] hover:bg-[#f7f8fb]">{t.myGallery}</button>
                  <button onClick={() => { setIsGenerating(false); setGeneratedResultUrl(null); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold text-[#75809a] hover:bg-[#f7f8fb]"><RefreshCw className="h-3.5 w-3.5" />{t.createVariation}</button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <LoaderCircle className="h-10 w-10 animate-spin text-[#536af1]" />
                <h3 className="mt-4 text-sm font-bold text-[#303b59]">{currentStepText || t.processing}</h3>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#8a94a8]">{t.progressStepRefine}</p>
              </div>
            )
          ) : (
            <div className="space-y-5">
              <section>
                <label htmlFor="template-select" className="mb-2 block text-[10px] font-bold uppercase tracking-[.12em] text-[#8892a7]">{t.step1Template}</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#e6e9f1] bg-[#fafbfe] p-2.5">
                  <img src={currentTemplate.previewImage} alt="" className="h-14 w-12 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#303b59]">{currentTemplate.name[language] || currentTemplate.name.ro}</p>
                    <p className="mt-1 truncate text-[10px] text-[#8992a5]">{t.categories[currentTemplate.category] || currentTemplate.category} · {selectedAspectRatio} · {currentTemplate.creditCost} {t.credits}</p>
                  </div>
                  <select
                    id="template-select"
                    value={currentTemplate.id}
                    onChange={(event) => {
                      const found = templates.find((template) => template.id === event.target.value);
                      if (found) {
                        setSelectedTemplate(found);
                        setContextSelectedTemplate(found);
                        setAspectRatioOverride(null);
                      }
                    }}
                    className="max-w-[128px] rounded-xl border border-[#e2e6ef] bg-white px-2.5 py-2 text-[10px] font-semibold text-[#5e6983] outline-none focus:border-[#9eaaf8] sm:max-w-[190px] sm:text-xs"
                  >
                    {templates.filter((template) => template.isActive).map((template) => (
                      <option key={template.id} value={template.id}>{template.name[language] || template.name.ro}</option>
                    ))}
                  </select>
                </div>
              </section>

              <section>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#8892a7]">{t.photoFormat}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {aspectRatioOptions.map((option) => {
                    const selected = selectedAspectRatio === option.value;
                    return (
                      <button key={option.value} type="button" aria-pressed={selected} onClick={() => setAspectRatioOverride(option.value)} className={`rounded-xl border px-2.5 py-2 text-left transition ${selected ? 'border-[#8798fb] bg-[#f0f2ff] text-[#4f65e8]' : 'border-[#e6e9f0] bg-white text-[#6f7a93] hover:border-[#c9d0e3]'}`}>
                        <span className="block text-[11px] font-bold">{option.value}</span>
                        <span className="mt-0.5 block truncate text-[9px]">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8892a7]">{t.step2Photo}</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#edf0ff] px-3 text-[10px] font-bold text-[#5369e8] transition hover:bg-[#e2e7ff] disabled:opacity-60">
                    {isUploading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isUploading ? t.photoUploading : t.uploadNewPhoto}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={handleFileUpload} className="hidden" />
                </div>

                {userPhotos.length === 0 ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8deeb] bg-[#fafbfe] px-5 py-6 text-center transition hover:border-[#9faaf3] hover:bg-[#f5f7ff]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7181d8] shadow-sm"><ImagePlus className="h-4 w-4" /></span>
                    <span className="mt-2 text-xs font-bold text-[#53607d]">{isUploading ? t.photoUploading : t.noPhotosInLibrary}</span>
                    <span className="mt-1 max-w-md text-[10px] leading-relaxed text-[#9199aa]">{isLocalPreviewMode ? t.localPreviewPhotoNote : t.dropPhotoHere}</span>
                  </button>
                ) : (
                  <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                    {userPhotos.map((photo) => {
                      const selected = selectedPhotoId === photo.id;
                      return (
                        <button key={photo.id} type="button" onClick={() => { setSelectedPhotoUrl(photo.url); setSelectedPhotoId(photo.id); setErrorMessage(null); }} aria-pressed={selected} className={`relative h-[108px] w-[82px] shrink-0 overflow-hidden rounded-xl border-2 transition ${selected ? 'border-[#6379f2] shadow-[0_0_0_2px_rgba(99,121,242,.13)]' : 'border-transparent'}`}>
                          <img src={photo.url} alt={photo.filename} className="h-full w-full object-cover" />
                          {selected && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#536af1] text-white"><CheckCircle className="h-3.5 w-3.5" /></span>}
                        </button>
                      );
                    })}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-[108px] w-[82px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#d8deeb] bg-[#fafbfe] text-[#8490aa] hover:bg-[#f4f6ff]">
                      <Upload className="h-4 w-4" /><span className="text-[9px] font-semibold">{t.uploadNewPhoto}</span>
                    </button>
                  </div>
                )}
              </section>

              {errorMessage && <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#f0d9dc] bg-[#fff6f6] p-3 text-[11px] leading-relaxed text-[#b65b68]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}

              <div className="flex flex-col gap-3 border-t border-[#edf0f5] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#77829a]">
                  <span className="inline-flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-[#6d7fda]" />{t.creditCost}: <strong className="text-[#34405f]">{currentTemplate.creditCost} {t.credits}</strong></span>
                  <span>{t.currentBalance}: <strong className="text-[#5369e8]">{currentUser.creditBalance}</strong></span>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  {!hasEnoughCredits && <button type="button" onClick={() => setIsCreditModalOpen(true)} className="min-h-11 flex-1 rounded-full border border-[#dfe4f3] px-4 text-[10px] font-bold text-[#5369e8] sm:flex-none">{t.topUpCredits}</button>}
                  <button type="button" onClick={handleStartGeneration} disabled={!selectedPhotoUrl || isUploading} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#536af1] px-6 text-[11px] font-bold text-white shadow-[0_6px_16px_rgba(83,106,241,.2)] transition hover:bg-[#415ce8] disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none sm:text-xs">
                    <Sparkles className="h-4 w-4" />{t.generateButton}
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
