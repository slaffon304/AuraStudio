import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate, AspectRatio } from '../types';
import {
  X,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  FolderHeart,
  ArrowRight,
  LogIn,
  Image as ImageIcon,
  ShieldCheck,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CreatePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: PhotoTemplate | null;
}

const ASPECT_OPTIONS: { value: AspectRatio; labelRo: string; labelRu: string; labelEn: string }[] = [
  { value: '1:1', labelRo: 'pătrat', labelRu: 'квадрат', labelEn: 'square' },
  { value: '9:16', labelRo: 'vertical', labelRu: 'вертикаль', labelEn: 'vertical' },
  { value: '3:4', labelRo: 'portret', labelRu: 'портрет', labelEn: 'portrait' },
  { value: '4:3', labelRo: 'orizontal', labelRu: 'горизонталь', labelEn: 'landscape' }
];

export const CreatePhotoModal: React.FC<CreatePhotoModalProps> = ({
  isOpen,
  onClose,
  initialTemplate
}) => {
  const {
    language,
    t,
    templates,
    userPhotos,
    uploadPhoto,
    currentUser,
    createGenerationJob,
    setIsPhotoModalOpen,
    setIsAuthModalOpen,
    setCurrentView,
    studioMode,
    setStudioMode
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(
    () => initialTemplate || templates[0] || null
  );

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(() => userPhotos[0]?.url || '');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(() => userPhotos[0]?.id || '');

  const [customReferenceUrl, setCustomReferenceUrl] = useState<string>('');
  const [partnerPhotoUrl, setPartnerPhotoUrl] = useState<string>('');
  const [partnerPhotoId, setPartnerPhotoId] = useState<string>('');

  const [isPhotoPack, setIsPhotoPack] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('3:4');
  const [showWatermarkPreview, setShowWatermarkPreview] = useState(false);
  /** Template demo: false = before, true = after */
  const [showAfterDemo, setShowAfterDemo] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'selfie' | 'pinterest' | 'partner'>('selfie');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [generatedResultUrl, setGeneratedResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      setSelectedAspectRatio(initialTemplate.aspectRatio || '3:4');
      setShowAfterDemo(true);
      if (initialTemplate.category === 'Couple' || initialTemplate.gender === 'couple') {
        setStudioMode('couple');
      } else {
        setStudioMode('template');
      }
    }
  }, [initialTemplate, setStudioMode]);

  useEffect(() => {
    if (!selectedPhotoUrl && userPhotos.length > 0) {
      setSelectedPhotoUrl(userPhotos[0].url);
      setSelectedPhotoId(userPhotos[0].id);
    }
  }, [userPhotos, selectedPhotoUrl]);

  if (!isOpen) return null;

  const currentTemplate = selectedTemplate || templates[0];
  const baseCost =
    studioMode === 'pinterest' ? 2 : currentTemplate?.photoCost ?? 1;
  const totalCost = isPhotoPack ? Math.max(3, baseCost + 2) : baseCost;
  const photoBalance = currentUser?.photoBalance ?? 0;
  const hasEnoughPhotos = photoBalance >= totalCost;

  const name =
    currentTemplate?.name?.[language] ||
    currentTemplate?.name?.ro ||
    currentTemplate?.name?.en ||
    '';
  const description =
    currentTemplate?.description?.[language] ||
    currentTemplate?.description?.ro ||
    '';

  const beforeUrl = currentTemplate?.beforeImage || '';
  const afterUrl = currentTemplate?.previewImage || '';

  const copy = {
    ro: {
      disclaimer:
        'Rezultatul poate diferi ușor de referință. Încarcă un selfie clar pentru cel mai bun rezultat.',
      tipTitle: 'Cum obții fotografia ideală?',
      tipBody: 'Apasă aici — de fotografiile de start depinde rezultatul',
      uploadLabel: 'Fotografia ta',
      uploadBtn: 'Încarcă foto',
      uploadHint: 'Cel puțin 1 foto, ideal 2–3 din unghiuri diferite · JPEG, PNG, WEBP, HEIC până la 10MB',
      ratio: 'Format foto',
      balance: 'Disponibil',
      photos: (n: number) => (n === 1 ? '1 foto' : `${n} foto`),
      topUp: 'Completează balanța',
      generate: (n: number) => `Generează (${n === 1 ? '1 foto' : n + ' foto'})`,
      needPhoto: 'Mai întâi încarcă o fotografie',
      welcome: 'Fiecare utilizator nou primește 1 foto cadou la înregistrare.',
      loginTitle: 'Autentifică-te pentru a crea fotografii',
      support:
        'Ceva nu a mers? Scrie în Telegram @aurastudio_help_bot — echipa AuraStudio te ajută.',
      tryMore: 'Încearcă și',
      before: 'Înainte',
      after: 'După',
      packSingle: '1 Fotografie (HD)',
      packSet: 'Photo Pack (4 poze)',
      selectSaved: 'Fața ta salvată:',
      uploadPartner: 'Încarcă poza partenerului/ei',
      uploadPin: 'Încarcă referința Pinterest / Instagram'
    },
    ru: {
      disclaimer:
        'Обратите внимание: итог может немного отличаться от референса. Загрузи чёткое селфи для лучшего результата.',
      tipTitle: 'Как получить идеальное фото?',
      tipBody: 'Нажми сюда — от исходных фото зависит результат',
      uploadLabel: 'Твоё фото',
      uploadBtn: 'Загрузить фото',
      uploadHint: 'Хотя бы 1 фото, лучше 2–3 с разных ракурсов · JPEG, PNG, WEBP, HEIC до 10MB',
      ratio: 'Формат фото',
      balance: 'Доступно',
      photos: (n: number) => {
        const m10 = n % 10;
        const m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return `${n} фото`;
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} фото`;
        return `${n} фото`;
      },
      topUp: 'Пополнить баланс',
      generate: (n: number) => `Сгенерировать (${n} фото)`,
      needPhoto: 'Сначала загрузи фото',
      welcome: 'Каждый новый пользователь получает 1 фото в подарок при регистрации.',
      loginTitle: 'Войдите, чтобы создавать фотосессии',
      support:
        'Что-то сломалось или вышло не так? Пиши в Telegram @aurastudio_help_bot — команда AuraStudio поможет.',
      tryMore: 'Попробуй ещё',
      before: 'До',
      after: 'После',
      packSingle: '1 Фотография (HD)',
      packSet: 'Фотопак (4 фото)',
      selectSaved: 'Сохранённое лицо:',
      uploadPartner: 'Загрузи фото партнёра',
      uploadPin: 'Загрузи референс из Pinterest / Instagram'
    },
    en: {
      disclaimer:
        'Result may differ slightly from the reference. Upload a clear selfie for the best outcome.',
      tipTitle: 'How to get the ideal photo?',
      tipBody: 'Tap here — source photos determine the result',
      uploadLabel: 'Your photo',
      uploadBtn: 'Upload photo',
      uploadHint: 'At least 1 photo, ideally 2–3 angles · JPEG, PNG, WEBP, HEIC up to 10MB',
      ratio: 'Photo format',
      balance: 'Available',
      photos: (n: number) => (n === 1 ? '1 photo' : `${n} photos`),
      topUp: 'Top up balance',
      generate: (n: number) => `Generate (${n === 1 ? '1 photo' : n + ' photos'})`,
      needPhoto: 'Upload a photo first',
      welcome: 'Every new user gets 1 free photo on signup.',
      loginTitle: 'Sign in to create photoshoots',
      support:
        'Something went wrong? Message Telegram @aurastudio_help_bot — the AuraStudio team will help.',
      tryMore: 'Try also',
      before: 'Before',
      after: 'After',
      packSingle: '1 Photo (HD)',
      packSet: 'Photo Pack (4 photos)',
      selectSaved: 'Saved face:',
      uploadPartner: 'Upload partner photo',
      uploadPin: 'Upload Pinterest / Instagram reference'
    }
  }[language];

  const ratioLabel = (opt: (typeof ASPECT_OPTIONS)[0]) =>
    language === 'ru' ? opt.labelRu : language === 'en' ? opt.labelEn : opt.labelRo;

  const triggerUpload = (target: 'selfie' | 'pinterest' | 'partner') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

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
          if (uploadTarget === 'pinterest') {
            setCustomReferenceUrl(dataUrl);
          } else if (uploadTarget === 'partner') {
            const uploaded = await uploadPhoto(dataUrl, `Partner_${file.name}`);
            setPartnerPhotoUrl(uploaded.url);
            setPartnerPhotoId(uploaded.id);
          } else {
            const uploaded = await uploadPhoto(dataUrl, file.name);
            setSelectedPhotoUrl(uploaded.url);
            setSelectedPhotoId(uploaded.id);
          }
        } catch (uploadErr: any) {
          setErrorMessage(uploadErr.message || 'Upload error');
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

  const handleStartGeneration = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedPhotoUrl) {
      setErrorMessage(copy.needPhoto);
      return;
    }

    if (!hasEnoughPhotos) {
      setIsPhotoModalOpen(true);
      return;
    }

    if (studioMode === 'pinterest' && !customReferenceUrl) {
      setErrorMessage(copy.uploadPin);
      return;
    }

    if (studioMode === 'couple' && !partnerPhotoUrl) {
      setErrorMessage(copy.uploadPartner);
      return;
    }

    if (!currentTemplate) return;

    setIsGenerating(true);
    setCurrentStepText(t.progressStepAnalyze);
    setErrorMessage(null);
    setGeneratedResultUrl(null);

    try {
      const step1 = setTimeout(() => setCurrentStepText(t.progressStepLighting), 2000);
      const step2 = setTimeout(() => {
        setCurrentStepText(
          language === 'ru'
            ? 'Финальная цветокоррекция Ultra-HD...'
            : language === 'en'
              ? 'Final Ultra-HD color grading...'
              : 'Colorizare și texturi fotorealiste Ultra-HD...'
        );
      }, 5000);

      const job = await createGenerationJob(
        currentTemplate.id,
        selectedPhotoUrl,
        selectedPhotoId,
        {
          mode: studioMode,
          customReferenceUrl: studioMode === 'pinterest' ? customReferenceUrl : undefined,
          partnerPhotoUrl: studioMode === 'couple' ? partnerPhotoUrl : undefined,
          isPack: isPhotoPack,
          aspectRatio: selectedAspectRatio
        }
      );

      clearTimeout(step1);
      clearTimeout(step2);
      setCurrentStepText(t.completed);
      setGeneratedResultUrl(job.resultImageUrl || null);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(
        err?.message ||
          (language === 'ru'
            ? 'Ошибка генерации. Фото возвращены на баланс.'
            : language === 'en'
              ? 'Generation failed. Photos were refunded.'
              : 'Eroare la generare. Foto au fost returnate.')
      );
    }
  };

  const handleDownload = () => {
    if (!generatedResultUrl) return;
    const a = document.createElement('a');
    a.href = generatedResultUrl;
    a.download = `AuraStudio_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const moreTemplates = templates
    .filter((x) => x.id !== currentTemplate?.id && x.isActive !== false)
    .slice(0, 6);

  const demoSrc = showAfterDemo ? afterUrl : beforeUrl || afterUrl;
  const canToggleDemo = Boolean(beforeUrl && afterUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg sm:max-w-xl my-0 sm:my-auto overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] shadow-2xl text-slate-900 dark:text-white max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#12151e] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold font-display truncate px-2">
            {isGenerating ? t.generating : name || 'AuraStudio'}
          </h2>
          {!isGenerating ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {!currentUser ? (
            <div className="py-12 text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 mx-auto">
                <LogIn className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold font-display">{copy.loginTitle}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{copy.welcome}</p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-7 py-3 text-xs font-bold text-white shadow-lg"
              >
                <span>{language === 'ru' ? 'Войти' : language === 'en' ? 'Sign in' : 'Conectează-te'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center py-4 text-center">
              {generatedResultUrl ? (
                <div className="w-full space-y-5">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>{t.completed}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                      <img src={selectedPhotoUrl} alt="Original" className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-black/70 px-2 py-0.5 rounded-md text-slate-300">
                        {copy.before}
                      </span>
                    </div>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-violet-400/80 bg-slate-900 shadow-xl shadow-violet-500/20">
                      <img src={generatedResultUrl} alt="Result" className="h-full w-full object-cover" />
                      {showWatermarkPreview && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-white/40 font-extrabold text-lg tracking-widest uppercase rotate-[-25deg] border border-white/20 px-3 py-1 bg-black/30">
                            AuraStudio
                          </span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-md">
                        {copy.after}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWatermarkPreview(!showWatermarkPreview)}
                    className="text-[11px] text-slate-400 underline"
                  >
                    {language === 'ru' ? 'Водяной знак' : language === 'en' ? 'Watermark' : 'Filigran'}
                  </button>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-xs font-bold text-white"
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadPhoto}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGenerating(false);
                        setGeneratedResultUrl(null);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {language === 'ru' ? 'Ещё раз' : language === 'en' ? 'Again' : 'Din nou'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setCurrentView('gallery');
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold"
                    >
                      <FolderHeart className="h-4 w-4" />
                      {t.myGallery}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 space-y-6 max-w-sm">
                  <div className="relative mx-auto h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">{currentStepText}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Demo before / after split */}
              {studioMode === 'template' && afterUrl && (
                <div className="relative w-full aspect-[3/4] max-h-[42vh] rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <img
                    src={demoSrc}
                    alt={showAfterDemo ? copy.after : copy.before}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-white">
                    {showAfterDemo ? copy.after : copy.before}
                  </span>
                  {canToggleDemo && (
                    <button
                      type="button"
                      onClick={() => setShowAfterDemo((v) => !v)}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl border border-white/80"
                      aria-label="Toggle before/after"
                    >
                      <span className="flex items-center text-xs font-bold">
                        <ChevronLeft className="h-4 w-4 -mr-0.5" />
                        <ChevronRight className="h-4 w-4 -ml-0.5" />
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Title + description */}
              {studioMode === 'template' && (
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">{name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {copy.disclaimer}
                  </p>
                  {description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Tip banner */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 px-4 py-3 flex gap-3 items-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Camera className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{copy.tipTitle}</p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-200/70 mt-0.5">{copy.tipBody}</p>
                </div>
              </div>

              {/* Upload zone */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  {copy.uploadLabel}
                </p>
                {selectedPhotoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                      <img src={selectedPhotoUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerUpload('selfie')}
                      disabled={isUploading}
                      className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                    >
                      {isUploading ? '…' : language === 'ru' ? 'Заменить' : language === 'en' ? 'Replace' : 'Înlocuiește'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpload('selfie')}
                    disabled={isUploading}
                    className="w-full aspect-square max-h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-violet-400 hover:text-violet-500 transition-colors"
                  >
                    <Upload className="h-7 w-7" />
                    <span className="text-sm font-semibold">{copy.uploadBtn}</span>
                  </button>
                )}
                <p className="mt-2 text-[11px] text-slate-400">{copy.uploadHint}</p>
              </div>

              {/* Saved faces */}
              {userPhotos.length > 1 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">{copy.selectSaved}</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {userPhotos.slice(0, 8).map((ph) => (
                      <button
                        key={ph.id}
                        type="button"
                        onClick={() => {
                          setSelectedPhotoUrl(ph.url);
                          setSelectedPhotoId(ph.id);
                        }}
                        className={`h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 ${
                          selectedPhotoId === ph.id
                            ? 'border-violet-500'
                            : 'border-transparent opacity-80'
                        }`}
                      >
                        <img src={ph.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Couple partner */}
              {studioMode === 'couple' && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    {copy.uploadPartner}
                  </p>
                  {partnerPhotoUrl ? (
                    <div className="h-24 w-24 rounded-2xl overflow-hidden">
                      <img src={partnerPhotoUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerUpload('partner')}
                      className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 flex items-center justify-center gap-2 text-sm text-slate-500"
                    >
                      <ImageIcon className="h-5 w-5" />
                      {copy.uploadPartner}
                    </button>
                  )}
                </div>
              )}

              {/* Pinterest ref */}
              {studioMode === 'pinterest' && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    {copy.uploadPin}
                  </p>
                  {customReferenceUrl ? (
                    <div className="h-24 w-24 rounded-2xl overflow-hidden">
                      <img src={customReferenceUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerUpload('pinterest')}
                      className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 flex items-center justify-center gap-2 text-sm text-slate-500"
                    >
                      <Upload className="h-5 w-5" />
                      {copy.uploadPin}
                    </button>
                  )}
                </div>
              )}

              {/* Aspect ratio */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  {copy.ratio}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {ASPECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedAspectRatio(opt.value)}
                      className={`rounded-xl py-2.5 px-1 text-center border transition-colors ${
                        selectedAspectRatio === opt.value
                          ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                          : 'border-slate-200 dark:border-white/10 text-slate-500'
                      }`}
                    >
                      <div className="text-sm font-bold">{opt.value}</div>
                      <div className="text-[10px] opacity-80">{ratioLabel(opt)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pack toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoPack(false)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-semibold border ${
                    !isPhotoPack
                      ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-500'
                  }`}
                >
                  {copy.packSingle}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhotoPack(true)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-semibold border ${
                    isPhotoPack
                      ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-500'
                  }`}
                >
                  {copy.packSet}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Balance + CTA */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {copy.balance}:{' '}
                    <strong className="text-slate-900 dark:text-violet-300">
                      {copy.photos(photoBalance)}
                    </strong>
                  </span>
                  {!hasEnoughPhotos && (
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="text-violet-600 dark:text-violet-400 font-semibold underline"
                    >
                      {copy.topUp}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={isUploading || !selectedPhotoUrl}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-45 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {!selectedPhotoUrl ? copy.needPhoto : copy.generate(totalCost)}
                </button>
              </div>

              {/* Support */}
              <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {copy.support}
                <a
                  href="https://t.me/aurastudio_help_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white font-semibold py-2.5"
                >
                  Telegram
                </a>
              </div>

              {/* Try more */}
              {moreTemplates.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    {copy.tryMore}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {moreTemplates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(tmpl);
                          setSelectedAspectRatio(tmpl.aspectRatio || '3:4');
                          setShowAfterDemo(true);
                          if (tmpl.category === 'Couple' || tmpl.gender === 'couple') {
                            setStudioMode('couple');
                          } else {
                            setStudioMode('template');
                          }
                        }}
                        className="shrink-0 w-16"
                      >
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={tmpl.previewImage}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pb-2">
                <ShieldCheck className="h-3 w-3" />
                {t.privacyNote}
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};
