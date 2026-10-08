import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate, AspectRatio } from '../types';
import {
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  FolderHeart,
  LogIn,
  ChevronLeft,
  Camera,
  Send
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

function slotCount(type?: string): number {
  if (type === 'couple_portrait') return 2;
  return 1;
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
    setIsPhotoModalOpen,
    setIsAuthModalOpen,
    setCurrentView,
    selectedTemplate: ctxSelectedTemplate
  } = useApp();

  const [template, setTemplate] = useState<PhotoTemplate | null>(null);
  const [photo1Url, setPhoto1Url] = useState('');
  const [photo1Id, setPhoto1Id] = useState('');
  const [photo2Url, setPhoto2Url] = useState('');
  const [photo2Id, setPhoto2Id] = useState('');
  const [age, setAge] = useState(25);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('3:4');
  const [sliderPct, setSliderPct] = useState(8);
  const [hintVisible, setHintVisible] = useState(true);
  const dragging = useRef(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroWidth, setHeroWidth] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSlot, setUploadSlot] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepText, setStepText] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const tmpl = initialTemplate || ctxSelectedTemplate || templates[0] || null;
    setTemplate(tmpl);
    if (tmpl?.aspectRatio) setSelectedAspectRatio(tmpl.aspectRatio);
    setSliderPct(8);
    setHintVisible(true);
    setResultUrl(null);
    setIsGenerating(false);
    setErrorMessage(null);
    setAge(25);
  }, [isOpen, initialTemplate, ctxSelectedTemplate, templates]);

  useEffect(() => {
    if (isOpen && !photo1Url && userPhotos[0]) {
      setPhoto1Url(userPhotos[0].url);
      setPhoto1Id(userPhotos[0].id);
    }
  }, [isOpen, userPhotos, photo1Url]);

  useEffect(() => {
    if (!isOpen || !heroRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setHeroWidth(e.contentRect.width);
    });
    ro.observe(heroRef.current);
    setHeroWidth(heroRef.current.clientWidth);
    return () => ro.disconnect();
  }, [isOpen]);

  const onPointerMove = useCallback(
    (clientX: number) => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
      setSliderPct(pct);
      setHintVisible(false);
    },
    []
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      onPointerMove(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [onPointerMove]);

  if (!isOpen) return null;

  const slots = slotCount(template?.requiredInputType);
  const photoCost = template?.photoCost ?? 1;
  const balance = currentUser?.photoBalance ?? 0;
  const hasEnough = balance >= photoCost;
  const hasRequiredPhotos = slots === 1 ? Boolean(photo1Url) : Boolean(photo1Url && photo2Url);

  const name = template?.name?.[language] || template?.name?.ro || template?.name?.en || '';
  const description = template?.description?.[language] || template?.description?.ro || '';
  const beforeUrl = template?.beforeImage || '';
  const afterUrl = template?.previewImage || '';

  const copy = {
    ro: {
      disclaimer: 'Rezultatul poate diferi ușor de referință.',
      tipTitle: 'Cum obții fotografia ideală?',
      tipBody: 'Apasă aici — de fotografiile de start depinde rezultatul',
      photoGirl: 'Fotografia fetei',
      photoBoy: 'Fotografia băiatului',
      photoYou: 'Fotografia ta',
      photoPartner: 'Fotografia partenerului/ei',
      upload: 'Încarcă foto',
      age: 'Vârsta',
      ratio: 'Format foto',
      needPhoto: 'Mai întâi încarcă o fotografie',
      generate: (n: number) => `Generează · ${n} foto`,
      hint: 'Trage ca să vezi „înainte”',
      tryMore: 'Încearcă și',
      support:
        'Ceva nu a mers cum trebuia? Scrie în Telegram @aurastudio_help_bot — echipa AuraStudio te ajută.',
      honest: 'Vrem un produs bun și onest — echipa AuraStudio',
      tgBtn: 'Scrie în Telegram-suport',
      uploadHint: 'Cel puțin 1 foto, ideal 2–3 din unghiuri diferite · JPEG, PNG, WEBP, HEIC până la 10MB',
      loginTitle: 'Autentifică-te pentru a crea fotografii',
      balance: 'Disponibil',
      topUp: 'Completează balanța',
      ageRequired: 'Indică vârsta'
    },
    ru: {
      disclaimer: 'Обратите внимание, итог может немного отличаться от референса.',
      tipTitle: 'Как получить идеальное фото?',
      tipBody: 'Нажми сюда — от исходных фото зависит результат',
      photoGirl: 'Фото девушки',
      photoBoy: 'Фото парня',
      photoYou: 'Твоё фото',
      photoPartner: 'Фото партнёра',
      upload: 'Загрузить фото',
      age: 'Возраст',
      ratio: 'Формат фото',
      needPhoto: 'Сначала загрузи фото',
      generate: (n: number) => `Сгенерировать · ${n} фото`,
      hint: 'Потяни, чтобы увидеть «до»',
      tryMore: 'Попробуй ещё',
      support:
        'Что-то сломалось или вышло не так, как хотелось? Пиши в Telegram @aurastudio_help_bot — команда AuraStudio поможет тебе.',
      honest: 'Мы хотим создавать классный и честный продукт — команда AuraStudio',
      tgBtn: 'Написать в Telegram-поддержку',
      uploadHint: 'Хотя бы 1 фото, лучше 2–3 с разных ракурсов · JPEG, PNG, WEBP, HEIC до 10MB',
      loginTitle: 'Войдите, чтобы создавать фотосессии',
      balance: 'Доступно',
      topUp: 'Пополнить баланс',
      ageRequired: 'Укажи возраст'
    },
    en: {
      disclaimer: 'Note: the result may differ slightly from the reference.',
      tipTitle: 'How to get the ideal photo?',
      tipBody: 'Tap here — source photos determine the result',
      photoGirl: "Girl's photo",
      photoBoy: "Guy's photo",
      photoYou: 'Your photo',
      photoPartner: 'Partner photo',
      upload: 'Upload photo',
      age: 'Age',
      ratio: 'Photo format',
      needPhoto: 'Upload a photo first',
      generate: (n: number) => `Generate · ${n} photo${n === 1 ? '' : 's'}`,
      hint: 'Drag to see “before”',
      tryMore: 'Try also',
      support:
        'Something went wrong? Message Telegram @aurastudio_help_bot — the AuraStudio team will help.',
      honest: 'We want a great and honest product — AuraStudio team',
      tgBtn: 'Message Telegram support',
      uploadHint: 'At least 1 photo, ideally 2–3 angles · JPEG, PNG, WEBP, HEIC up to 10MB',
      loginTitle: 'Sign in to create photoshoots',
      balance: 'Available',
      topUp: 'Top up',
      ageRequired: 'Enter age'
    }
  }[language];

  const ratioLabel = (opt: (typeof ASPECT_OPTIONS)[0]) =>
    language === 'ru' ? opt.labelRu : language === 'en' ? opt.labelEn : opt.labelRo;

  const labelSlot1 = () => {
    if (slots === 2) return copy.photoYou;
    const g = template?.gender;
    if (g === 'women') return copy.photoGirl;
    if (g === 'men') return copy.photoBoy;
    return copy.photoYou;
  };

  const triggerUpload = (slot: 1 | 2) => {
    setUploadSlot(slot);
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error('read failed'));
        r.readAsDataURL(file);
      });
      const uploaded = await uploadPhoto(dataUrl, file.name);
      if (uploadSlot === 2) {
        setPhoto2Url(uploaded.url);
        setPhoto2Id(uploaded.id);
      } else {
        setPhoto1Url(uploaded.url);
        setPhoto1Id(uploaded.id);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!hasRequiredPhotos) {
      setErrorMessage(copy.needPhoto);
      return;
    }
    if (!age || age < 1 || age > 120) {
      setErrorMessage(copy.ageRequired);
      return;
    }
    if (!hasEnough) {
      setIsPhotoModalOpen(true);
      return;
    }
    if (!template) return;

    setIsGenerating(true);
    setStepText(t.progressStepAnalyze);
    setErrorMessage(null);
    setResultUrl(null);

    try {
      const t1 = setTimeout(() => setStepText(t.progressStepLighting), 2000);
      const t2 = setTimeout(() => {
        setStepText(
          language === 'ru' ? 'Финальная обработка…' : language === 'en' ? 'Final processing…' : 'Procesare finală…'
        );
      }, 5000);

      const job = await createGenerationJob(template.id, photo1Url, photo1Id, {
        mode: slots === 2 ? 'couple' : 'template',
        partnerPhotoUrl: slots === 2 ? photo2Url : undefined,
        aspectRatio: selectedAspectRatio,
        age
      } as any);

      clearTimeout(t1);
      clearTimeout(t2);
      setStepText(t.completed);
      setResultUrl(job.resultImageUrl || null);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err?.message || 'Error');
    }
  };

  const moreTemplates = templates
    .filter((x) => x.id !== template?.id && x.isActive !== false)
    .slice(0, 8);

  const selectOther = (tmpl: PhotoTemplate) => {
    setTemplate(tmpl);
    setSelectedAspectRatio(tmpl.aspectRatio || '3:4');
    setSliderPct(8);
    setHintVisible(true);
    setResultUrl(null);
    setIsGenerating(false);
  };

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    onPointerMove(e.clientX);
  };

  if (isGenerating && resultUrl) {
    return (
      <div className="fixed inset-0 z-[60] bg-white dark:bg-[#0c0e14] overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {t.completed}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
              <img src={photo1Url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-violet-400">
              <img src={resultUrl} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a href={resultUrl} download={`AuraStudio_${Date.now()}.jpg`} className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white">
              <Download className="h-4 w-4" />
              {t.downloadPhoto}
            </a>
            <button type="button" onClick={() => { setIsGenerating(false); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 py-3 text-sm font-semibold">
              <RefreshCw className="h-4 w-4" />
              {language === 'ru' ? 'Ещё раз' : language === 'en' ? 'Again' : 'Din nou'}
            </button>
            <button type="button" onClick={() => { onClose(); setCurrentView('gallery'); }} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 py-3 text-sm font-semibold">
              <FolderHeart className="h-4 w-4" />
              {t.myGallery}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-[60] bg-white dark:bg-[#0c0e14] flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-500" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">{stepText}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-[#0c0e14] overflow-y-auto">
      <div ref={heroRef} className="relative w-full aspect-[3/4] max-h-[58vh] bg-slate-200 select-none touch-none overflow-hidden">
        {afterUrl && (
          <img src={afterUrl} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover pointer-events-none" draggable={false} />
        )}
        {beforeUrl && (
          <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none" style={{ width: `${sliderPct}%` }}>
            <img
              src={beforeUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full object-cover max-w-none"
              style={{ width: heroWidth || '100vw' }}
              draggable={false}
            />
          </div>
        )}
        {beforeUrl && (
          <div className="absolute inset-y-0 z-10" style={{ left: `${sliderPct}%`, transform: 'translateX(-50%)' }}>
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/90 shadow" />
            <button
              type="button"
              onPointerDown={startDrag}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 cursor-ew-resize"
              aria-label="Compare"
            >
              <span className="text-sm font-bold tracking-tighter select-none">↔</span>
            </button>
          </div>
        )}
        <button type="button" onClick={onClose} className="absolute top-3 left-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow">
          <ChevronLeft className="h-5 w-5" />
        </button>
        {hintVisible && beforeUrl && (
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
            <div className="rounded-full bg-slate-900/80 text-white text-xs font-medium px-4 py-2 whitespace-nowrap backdrop-blur-sm">
              ↔ {copy.hint}
            </div>
          </div>
        )}
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-white dark:bg-[#0c0e14] px-4 pt-3 pb-28 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 dark:bg-white/15" />

        {moreTemplates.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.tryMore}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {moreTemplates.map((tmpl) => (
                <button key={tmpl.id} type="button" onClick={() => selectOther(tmpl)} className="shrink-0 h-[4.5rem] w-[4.5rem] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10">
                  <img src={tmpl.previewImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{name}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {copy.disclaimer}
          {description ? ` ${description}` : ''}
        </p>

        <button type="button" className="mt-4 w-full text-left rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-3 flex gap-3 items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700">
            <Camera className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{copy.tipTitle}</p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/70 mt-0.5">{copy.tipBody}</p>
          </div>
          <span className="text-amber-600 text-lg">›</span>
        </button>

        <div className={`mt-6 grid gap-4 ${slots === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
          <UploadSlot label={labelSlot1()} url={photo1Url} uploadLabel={copy.upload} loading={isUploading && uploadSlot === 1} onClick={() => triggerUpload(1)} />
          {slots === 2 && (
            <UploadSlot label={copy.photoPartner} url={photo2Url} uploadLabel={copy.upload} loading={isUploading && uploadSlot === 2} onClick={() => triggerUpload(2)} />
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">{copy.uploadHint}</p>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.age}</p>
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(Number(e.target.value) || 0)}
            className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border-0 px-4 py-3.5 text-base font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.ratio}</p>
          <div className="grid grid-cols-4 gap-2">
            {ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedAspectRatio(opt.value)}
                className={`rounded-2xl py-3 text-center transition-colors ${
                  selectedAspectRatio === opt.value
                    ? 'bg-violet-50 dark:bg-violet-500/15 ring-2 ring-violet-500 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                }`}
              >
                <div className="text-sm font-bold">{opt.value}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{ratioLabel(opt)}</div>
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="mt-5 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {copy.balance}:{' '}
                <strong className="text-slate-800 dark:text-violet-300">
                  {balance} {language === 'en' ? 'photo' : 'фото'}
                </strong>
              </span>
              {!hasEnough && (
                <button type="button" onClick={() => setIsPhotoModalOpen(true)} className="text-violet-600 font-semibold underline">
                  {copy.topUp}
                </button>
              )}
            </div>
          )}

          {!currentUser ? (
            <button type="button" onClick={() => setIsAuthModalOpen(true)} className="w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-violet-500 flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              {copy.loginTitle}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isUploading || !hasRequiredPhotos}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-violet-400 hover:bg-violet-500 disabled:bg-violet-300 disabled:cursor-not-allowed transition-colors"
            >
              {!hasRequiredPhotos ? copy.needPhoto : copy.generate(photoCost)}
            </button>
          )}
        </div>

        <div className="mt-6 space-y-3 pb-2">
          <div className="-rotate-[1.5deg] origin-left rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm">
            {language === 'ru' ? (
              <>
                Что-то сломалось или вышло не так, как хотелось? Пиши в Telegram{' '}
                <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline underline-offset-2">
                  @aurastudio_help_bot
                </a>
                {' '}— команда AuraStudio поможет тебе.
              </>
            ) : language === 'en' ? (
              <>
                Something went wrong? Message Telegram{' '}
                <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline underline-offset-2">
                  @aurastudio_help_bot
                </a>
                {' '}— the AuraStudio team will help.
              </>
            ) : (
              <>
                Ceva nu a mers cum trebuia? Scrie în Telegram{' '}
                <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline underline-offset-2">
                  @aurastudio_help_bot
                </a>
                {' '}— echipa AuraStudio te ajută.
              </>
            )}
          </div>
          <div className="-rotate-[1.5deg] origin-left rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400 shadow-sm">
            {copy.honest} ❤️
          </div>
          <a
            href="https://t.me/aurastudio_help_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 text-sm shadow-lg shadow-blue-600/20"
          >
            <Send className="h-4 w-4" />
            {copy.tgBtn}
          </a>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={handleFile} />
    </div>
  );
};

function UploadSlot({
  label,
  url,
  uploadLabel,
  loading,
  onClick
}: {
  label: string;
  url: string;
  uploadLabel: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 text-center">{label}</p>
      {url ? (
        <button type="button" onClick={onClick} className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
          <img src={url} alt="" className="h-full w-full object-cover" />
          {loading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">…</div>}
        </button>
      ) : (
        <button type="button" onClick={onClick} disabled={loading} className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] flex flex-col items-center justify-center gap-2 text-slate-500">
          <Upload className="h-6 w-6" />
          <span className="text-sm font-semibold">{loading ? '…' : uploadLabel}</span>
        </button>
      )}
    </div>
  );
}
