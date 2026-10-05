import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate, StudioMode, AspectRatio } from '../types';
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
  LogIn,
  Layers,
  Users,
  Image as ImageIcon,
  Wand2,
  Check,
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
    language,
    t,
    templates,
    userPhotos,
    uploadPhoto,
    currentUser,
    createGenerationJob,
    setIsCreditModalOpen,
    setIsAuthModalOpen,
    setCurrentView,
    studioMode,
    setStudioMode
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(() => {
    return initialTemplate || templates[0] || null;
  });

  // Primary user selfie
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(() => {
    return userPhotos[0]?.url || '';
  });
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(() => {
    return userPhotos[0]?.id || '';
  });

  // Secondary inputs for PifPaf features
  const [customReferenceUrl, setCustomReferenceUrl] = useState<string>('');
  const [partnerPhotoUrl, setPartnerPhotoUrl] = useState<string>('');
  const [partnerPhotoId, setPartnerPhotoId] = useState<string>('');

  // Generation pack & aspect ratio
  const [isPhotoPack, setIsPhotoPack] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('3:4');
  const [showWatermarkPreview, setShowWatermarkPreview] = useState(false);

  // Loading & Step states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'selfie' | 'pinterest' | 'partner'>('selfie');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [generatedResultUrl, setGeneratedResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial template when opened
  useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      if (initialTemplate.category === 'Couple' || initialTemplate.gender === 'couple') {
        setStudioMode('couple');
      }
    }
  }, [initialTemplate, setStudioMode]);

  // Sync userPhotos when available
  useEffect(() => {
    if (!selectedPhotoUrl && userPhotos.length > 0) {
      setSelectedPhotoUrl(userPhotos[0].url);
      setSelectedPhotoId(userPhotos[0].id);
    }
  }, [userPhotos, selectedPhotoUrl]);

  if (!isOpen) return null;

  const currentTemplate = selectedTemplate || templates[0];
  const baseCost = studioMode === 'pinterest' ? 2 : (currentTemplate?.creditCost || 2);
  const totalCost = isPhotoPack ? Math.max(3, baseCost + 2) : baseCost;
  const hasEnoughCredits = (currentUser?.creditBalance || 0) >= totalCost;

  // Localized copy
  const labels = {
    ro: {
      studioTab: 'Șabloane Studio',
      pinterestTab: 'Referință Pinterest',
      coupleTab: 'Ședință de Cuplu',
      packSingle: '1 Fotografie (HD)',
      packSet: 'Photo Pack (4 Poze)',
      packDiscount: 'Economisești 25%',
      selectSavedFace: 'Fața ta salvată:',
      uploadSelfie: 'Încarcă un selfie clar',
      uploadPinterest: 'Încarcă poza din Pinterest / Instagram',
      uploadPartner: 'Încarcă poza partenerului/ei',
      partnerFace: 'Partener:',
      ratio: 'Format imagine:',
      generateBtn: isPhotoPack ? `Generează Photo Pack (${totalCost} credite)` : `Generează Fotografia (${totalCost} credite)`,
      watermarkPreview: 'Comută filigran',
      downloadClean: 'Descarcă Ultra-HD (Fără filigran)'
    },
    ru: {
      studioTab: 'Каталог студии',
      pinterestTab: 'Свой Pinterest референс',
      coupleTab: 'Парная фотосессия',
      packSingle: '1 Фотография (HD)',
      packSet: 'Фотопак (4 Фото)',
      packDiscount: 'Выгода 25%',
      selectSavedFace: 'Выбери сохранённое лицо:',
      uploadSelfie: 'Загрузи чёткое селфи',
      uploadPinterest: 'Загрузи фото из Pinterest / Instagram',
      uploadPartner: 'Загрузи фото партнёра',
      partnerFace: 'Партнёр:',
      ratio: 'Формат фото:',
      generateBtn: isPhotoPack ? `Сгенерировать Фотопак (${totalCost} кредита)` : `Сгенерировать Фото (${totalCost} кредита)`,
      watermarkPreview: 'Показать водяной знак',
      downloadClean: 'Скачать Ultra-HD (Без водяного знака)'
    },
    en: {
      studioTab: 'Studio Styles',
      pinterestTab: 'Pinterest Reference',
      coupleTab: 'Couple Studio',
      packSingle: '1 Photo (HD)',
      packSet: 'Photo Pack (4 Photos)',
      packDiscount: 'Save 25%',
      selectSavedFace: 'Select saved face:',
      uploadSelfie: 'Upload clean selfie',
      uploadPinterest: 'Upload Pinterest / Instagram reference',
      uploadPartner: 'Upload partner photo',
      partnerFace: 'Partner:',
      ratio: 'Aspect ratio:',
      generateBtn: isPhotoPack ? `Generate Photo Pack (${totalCost} credits)` : `Generate Photo (${totalCost} credits)`,
      watermarkPreview: 'Toggle watermark',
      downloadClean: 'Download Ultra-HD (Watermark-free)'
    }
  }[language];

  // File upload trigger
  const triggerUpload = (target: 'selfie' | 'pinterest' | 'partner') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

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

  // Start Generation
  const handleStartGeneration = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!hasEnoughCredits) {
      setIsCreditModalOpen(true);
      return;
    }

    if (!selectedPhotoUrl) {
      setErrorMessage(language === 'ru' ? 'Загрузи или выбери своё селфи.' : 'Te rugăm să încarci un selfie clar.');
      return;
    }

    if (studioMode === 'pinterest' && !customReferenceUrl) {
      setErrorMessage(language === 'ru' ? 'Загрузи картинку-референс из Pinterest.' : 'Încarcă imaginea de referință din Pinterest.');
      return;
    }

    if (studioMode === 'couple' && !partnerPhotoUrl) {
      setErrorMessage(language === 'ru' ? 'Загрузи фото второго человека для пары.' : 'Încarcă fotografia partenerului/ei.');
      return;
    }

    setIsGenerating(true);
    setCurrentStepText(t.progressStepAnalyze);
    setErrorMessage(null);
    setGeneratedResultUrl(null);

    try {
      const step1 = setTimeout(() => setCurrentStepText(t.progressStepLighting), 2000);
      const step2 = setTimeout(() => {
        setCurrentStepText(
          language === 'ru'
            ? 'Финальная цветокоррекция в стиле Pinterest Ultra-HD...'
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
      setErrorMessage(err?.message || 'A apărut o problemă la generare. Creditele au fost restituite.');
    }
  };

  const handleDownload = () => {
    if (!generatedResultUrl) return;
    const a = document.createElement('a');
    a.href = generatedResultUrl;
    a.download = `AuraStudio_${studioMode}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-auto overflow-hidden rounded-3xl border border-white/10 bg-[#10121a] shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#141724]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>{isGenerating ? t.generating : 'AuraStudio AI Creator'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {studioMode === 'pinterest' ? 'Pinterest AI' : studioMode === 'couple' ? 'Couple Studio' : 'Studio Shoot'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {t.heroSubhead}
              </p>
            </div>
          </div>

          {!isGenerating && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {!currentUser ? (
            /* USER NOT LOGGED IN */
            <div className="py-10 text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
                <LogIn className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                {language === 'ru' ? 'Войдите для создания фотосессий' : 'Autentifică-te pentru a crea fotografii'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'ru'
                  ? 'Каждый новый пользователь получает 15 бесплатных кредитов в подарок при регистрации.'
                  : 'Fiecare utilizator nou primește 15 credite cadou de bun venit la înregistrare.'}
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-7 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>{language === 'ru' ? 'Войти или Зарегистрироваться' : 'Conectează-te sau Înregistrează-te'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : isGenerating ? (
            /* STATE: IN PROGRESS OR COMPLETED */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {generatedResultUrl ? (
                /* SUCCESS VIEW */
                <div className="w-full space-y-5 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>{t.completed}</span>
                  </div>

                  {/* Before / After Preview */}
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-md">
                      <img
                        src={selectedPhotoUrl}
                        alt="Original"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-black/70 px-2 py-0.5 rounded-md text-slate-300 backdrop-blur-sm">
                        {t.showOriginal}
                      </span>
                    </div>

                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-slate-900 shadow-xl shadow-amber-500/20">
                      <img
                        src={generatedResultUrl}
                        alt="AI Result"
                        className="h-full w-full object-cover"
                      />
                      {showWatermarkPreview && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-white/40 font-extrabold text-lg tracking-widest uppercase rotate-[-25deg] border border-white/20 px-3 py-1 bg-black/30 backdrop-blur-xs">
                            AuraStudio
                          </span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-md">
                        {t.showResult}
                      </span>
                    </div>
                  </div>

                  {/* Watermark toggle */}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <button
                      onClick={() => setShowWatermarkPreview(!showWatermarkPreview)}
                      className="hover:text-amber-300 transition-colors text-[11px] underline underline-offset-2"
                    >
                      {labels.watermarkPreview}
                    </button>
                    <span>•</span>
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {labels.downloadClean}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t.downloadPhoto}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsGenerating(false);
                        setGeneratedResultUrl(null);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>{language === 'ru' ? 'Создать ещё' : language === 'en' ? 'Create another' : 'Generează din nou'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        setCurrentView('gallery');
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      <FolderHeart className="h-4 w-4" />
                      <span>{t.myGallery}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* LOADING ANIMATION */
                <div className="py-12 space-y-6 max-w-sm">
                  <div className="relative mx-auto h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-orange-500/10 border-b-orange-400 animate-spin [animation-duration:1.5s]" />
                    <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                      <Sparkles className="h-7 w-7 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white font-display">
                      {currentStepText || t.progressStepAnalyze}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {language === 'ru'
                        ? 'Модель Gemini синтезирует фотосессию в разрешении 4K (~10 секунд)...'
                        : 'Sinteză neuronală foto în rezoluție 4K (~10 secunde)...'}
                    </p>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 animate-pulse w-3/4 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* CONFIGURATION VIEW (PIFPAF STYLE) */
            <div className="space-y-6">
              {/* 1. Mode Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setStudioMode('template')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    studioMode === 'template'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{labels.studioTab}</span>
                  <span className="sm:hidden">Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioMode('pinterest')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    studioMode === 'pinterest'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{labels.pinterestTab}</span>
                  <span className="sm:hidden">Pinterest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioMode('couple')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    studioMode === 'couple'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">{labels.coupleTab}</span>
                  <span className="sm:hidden">Cuplu</span>
                </button>
              </div>

              {/* 2. Mode-Specific Target Settings */}
              {studioMode === 'template' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>{language === 'ru' ? 'Выбранный стиль фотосессии:' : 'Stilul ales:'}</span>
                    <span className="text-[11px] text-amber-400 font-bold">{currentTemplate.name[language]}</span>
                  </label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {templates.map((tmpl) => {
                      const isSelected = tmpl.id === currentTemplate.id;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplate(tmpl)}
                          className={`relative flex-shrink-0 w-24 rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/30 scale-102'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="aspect-[3/4]">
                            <img src={tmpl.previewImage} alt={tmpl.name[language]} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-1 text-[10px] font-semibold text-white bg-slate-900/90 truncate text-center">
                            {tmpl.name[language]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {studioMode === 'pinterest' && (
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <ImageIcon className="w-4 h-4" />
                    <span>{language === 'ru' ? 'Референс вдохновения из Pinterest / Instagram' : 'Imagine de referință din Pinterest'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {language === 'ru'
                      ? 'Загрузи любое фото лука, позы или локации. ИИ скопирует атмосферу, одежду и свет, вставив твоё лицо.'
                      : 'Încarcă orice poză de ținută, unghi sau fundal. AI va prelua compoziția și va transfera fața ta.'}
                  </p>

                  <div className="flex items-center gap-4">
                    {customReferenceUrl ? (
                      <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
                        <img src={customReferenceUrl} alt="Pinterest Reference" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCustomReferenceUrl('')}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerUpload('pinterest')}
                        className="w-full py-6 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 flex flex-col items-center justify-center gap-1.5 transition-all"
                      >
                        <Upload className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-semibold">{labels.uploadPinterest}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {studioMode === 'couple' && (
                <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Users className="w-4 h-4" />
                    <span>{language === 'ru' ? 'Парная фотосессия для двоих' : 'Fotografie pentru Cuplu'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {language === 'ru'
                      ? 'Загрузите селфи первого человека (слева) и второго человека (справа).'
                      : 'Încarcă selfie-ul pentru prima persoană (stânga) și a doua persoană (dreapta).'}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Face 1 */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-300 mb-1">
                        {language === 'ru' ? 'Лицо 1 (Ты)' : 'Persoana 1 (Tu)'}
                      </div>
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                        {selectedPhotoUrl ? (
                          <img src={selectedPhotoUrl} alt="Person 1" className="w-full h-full object-cover" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerUpload('selfie')}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white"
                          >
                            <Upload className="w-5 h-5" />
                            <span className="text-[10px]">Încarcă</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Face 2 (Partner) */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-300 mb-1">
                        {language === 'ru' ? 'Лицо 2 (Партнёр)' : 'Persoana 2 (Partener)'}
                      </div>
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-rose-500/40 bg-slate-900">
                        {partnerPhotoUrl ? (
                          <>
                            <img src={partnerPhotoUrl} alt="Person 2" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPartnerPhotoUrl('')}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerUpload('partner')}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 text-rose-300 hover:text-white"
                          >
                            <Upload className="w-5 h-5" />
                            <span className="text-[10px]">{labels.uploadPartner}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Primary User Selfie / Saved Faces Selector */}
              {studioMode !== 'couple' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>{labels.selectSavedFace}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => triggerUpload('selfie')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{labels.uploadSelfie}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {/* Upload new box */}
                    <button
                      type="button"
                      onClick={() => triggerUpload('selfie')}
                      className="flex-shrink-0 w-16 h-16 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-900 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[9px] font-bold">New</span>
                    </button>

                    {/* Saved faces list */}
                    {userPhotos.map((photo) => {
                      const isSelected = photo.url === selectedPhotoUrl;
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            setSelectedPhotoUrl(photo.url);
                            setSelectedPhotoId(photo.id);
                          }}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={photo.url} alt="Saved Face" className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Generation Options: Single vs Photo Pack (PifPaf Feature) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPhotoPack(false)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    !isPhotoPack
                      ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/30'
                      : 'border-white/10 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{labels.packSingle}</span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {baseCost} credite
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'ru' ? '1 идеальный портрет в максимальном качестве' : '1 portret editorial în calitate maximă'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPhotoPack(true)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isPhotoPack
                      ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/30'
                      : 'border-white/10 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black shadow-md">
                    {labels.packDiscount}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      {labels.packSet}
                    </span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {Math.max(3, baseCost + 2)} credite
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'ru' ? 'Сет из 4 ракурсов в едином стиле' : 'Set complet din 4 cadre din diverse unghiuri'}
                  </p>
                </button>
              </div>

              {/* 5. Aspect Ratio Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  {labels.ratio}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['3:4', '1:1', '9:16', '4:3', '16:9'] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setSelectedAspectRatio(ratio)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedAspectRatio === ratio
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Sold:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {currentUser.creditBalance} credite
                  </span>
                  {!hasEnoughCredits && (
                    <button
                      type="button"
                      onClick={() => setIsCreditModalOpen(true)}
                      className="text-xs text-amber-300 underline font-semibold ml-2 hover:text-white"
                    >
                      Încarcă contul
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={isUploading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{labels.generateBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};
