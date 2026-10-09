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
  Send,
  X,
  Plus
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

const MAX_FACE_PHOTOS = 5;

function slotCount(type?: string): number {
  if (type === 'couple_portrait') return 2;
  return 1;
}

type FacePhoto = { url: string; id: string };

export const CreatePhotoModal: React.FC<CreatePhotoModalProps> = ({
  isOpen,
  onClose,
  initialTemplate
}) => {
  const {
    language,
    t,
    templates,
    uploadPhoto,
    currentUser,
    createGenerationJob,
    setIsPhotoModalOpen,
    setIsAuthModalOpen,
    setCurrentView,
    selectedTemplate: ctxSelectedTemplate,
    studioMode
  } = useApp();

  const [template, setTemplate] = useState<PhotoTemplate | null>(null);
  /** Person 1 face angles (1–5) */
  const [photos1, setPhotos1] = useState<FacePhoto[]>([]);
  /** Person 2 (couple) */
  const [photos2, setPhotos2] = useState<FacePhoto[]>([]);
  /** Pinterest reference image (not a face pack) */
  const [refUrl, setRefUrl] = useState('');
  const [pinLink, setPinLink] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  /** enhance: '2k' | '4k' */
  const [enhanceRes, setEnhanceRes] = useState<'2k' | '4k'>('4k');
  const [age1, setAge1] = useState(25);
  const [age2, setAge2] = useState(25);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('3:4');

  const [sliderPct, setSliderPct] = useState(8);
  const [hintVisible, setHintVisible] = useState(true);
  const dragging = useRef(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroWidth, setHeroWidth] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'p1' | 'p2'>('p1');
  const [showTipModal, setShowTipModal] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showPinHelp, setShowPinHelp] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepText, setStepText] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Lock page scroll while modal is open (prevents scroll-through to catalog)
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [isOpen]);


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
    setAge1(25);
    setAge2(25);
    // Do NOT auto-fill previous uploads
    setPhotos1([]);
    setPhotos2([]);
    setRefUrl('');
    setPinLink('');
    setHeightCm('');
    setWeightKg('');
    setEnhanceRes('4k');
    setShowTipModal(false);
    setShowUploadSheet(false);
    setShowPinHelp(false);
  }, [isOpen, initialTemplate, ctxSelectedTemplate, templates]);

  useEffect(() => {
    if (!isOpen || !heroRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setHeroWidth(e.contentRect.width);
    });
    ro.observe(heroRef.current);
    setHeroWidth(heroRef.current.clientWidth);
    return () => ro.disconnect();
  }, [isOpen]);

  const onPointerMove = useCallback((clientX: number) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setSliderPct(pct);
    setHintVisible(false);
  }, []);

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
  const hasRequiredPhotos =
    slots === 1 ? photos1.length >= 1 : photos1.length >= 1 && photos2.length >= 1;

  const name = template?.name?.[language] || template?.name?.ro || template?.name?.en || '';
  const description = template?.description?.[language] || template?.description?.ro || '';
  const beforeUrl = template?.beforeImage || '';
  const afterUrl = template?.previewImage || '';

  const copy = {
    ro: {
      disclaimer: 'Rezultatul poate diferi ușor de referință.',
      tipTitle: 'Cum obții fotografia ideală?',
      tipBody: 'Apasă aici — de fotografiile de start depinde rezultatul',
      photoYou: 'Fotografia ta',
      photoPartner: 'Fotografia partenerului/ei',
      upload: 'Încarcă foto',
      age: 'Vârsta',
      ageYou: 'Vârsta ta',
      agePartner: 'Vârsta partenerului/ei',
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
      ageRequired: 'Indică vârsta',
      tipModalTitle: 'Fă un selfie în același loc și cu aceeași coafură.',
      tipModalBody:
        'Fotografiază-te din față, 3/4 și profil la aceeași lumină. Așa rețeaua reține mai bine trăsăturile și rezultatul e mai precis.',
      better: 'rezultat mai bun',
      worse: 'rezultat mai slab',
      continue: 'Continuă',
      uploadSheetTitle: 'Foto — Prima fotografie',
      uploadSheetTitle2: 'Foto — Partener',
      uploadSheetHint:
        'Încarcă până la 5 foto ale acestei persoane — poți selecta mai multe odată. Ideal din unghiuri diferite (față, 3/4, profil), lumină naturală, fără ochelari și filtre. Minim — 1 foto.',
      loaded: (n: number) => `Încărcate ${n} din ${MAX_FACE_PHOTOS}`,
      pickPhotos: 'Alege fotografiile'
    },
    ru: {
      disclaimer: 'Обратите внимание, итог может немного отличаться от референса.',
      tipTitle: 'Как получить идеальное фото?',
      tipBody: 'Нажми сюда — от исходных фото зависит результат',
      photoYou: 'Твоё фото',
      photoPartner: 'Фото партнёра',
      upload: 'Загрузить фото',
      age: 'Возраст',
      ageYou: 'Твой возраст',
      agePartner: 'Возраст партнёра',
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
      ageRequired: 'Укажи возраст',
      tipModalTitle: 'Сделай селфи в одном месте и с одной причёской.',
      tipModalBody:
        'Сними себя в фас, вполоборота и профиль при одном освещении. Так нейросеть лучше запомнит черты лица и результат получится более точный.',
      better: 'лучше результат',
      worse: 'хуже результат',
      continue: 'Продолжить',
      uploadSheetTitle: 'Фото — Первое фото',
      uploadSheetTitle2: 'Фото — Партнёр',
      uploadSheetHint:
        'Загрузи до 5 фото этого человека — можно выбрать сразу несколько. Лучше с разных ракурсов (фас, вполоборота, профиль), при дневном свете, без очков и фильтров. Чем больше ракурсов, тем точнее нейросеть поймёт черты. Минимум — 1 фото.',
      loaded: (n: number) => `Загружено ${n} из ${MAX_FACE_PHOTOS}`,
      pickPhotos: 'Выбрать мои фото'
    },
    en: {
      disclaimer: 'Note: the result may differ slightly from the reference.',
      tipTitle: 'How to get the ideal photo?',
      tipBody: 'Tap here — source photos determine the result',
      photoYou: 'Your photo',
      photoPartner: 'Partner photo',
      upload: 'Upload photo',
      age: 'Age',
      ageYou: 'Your age',
      agePartner: "Partner's age",
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
      ageRequired: 'Enter age',
      tipModalTitle: 'Take selfies in one place with the same hairstyle.',
      tipModalBody:
        'Shoot front, three-quarter and profile under the same lighting. The model remembers facial features better and the result is more accurate.',
      better: 'better result',
      worse: 'worse result',
      continue: 'Continue',
      uploadSheetTitle: 'Photo — First photo',
      uploadSheetTitle2: 'Photo — Partner',
      uploadSheetHint:
        'Upload up to 5 photos of this person — you can select several at once. Prefer different angles (front, 3/4, profile), daylight, no glasses or filters. Minimum — 1 photo.',
      loaded: (n: number) => `Uploaded ${n} of ${MAX_FACE_PHOTOS}`,
      pickPhotos: 'Choose my photos'
    }
  }[language];

  const ratioLabel = (opt: (typeof ASPECT_OPTIONS)[0]) =>
    language === 'ru' ? opt.labelRu : language === 'en' ? opt.labelEn : opt.labelRo;

  const openUpload = (target: 'p1' | 'p2') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setUploadTarget(target);
    setShowUploadSheet(true);
  };

  const triggerFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !currentUser) return;

    const current = uploadTarget === 'p1' ? photos1 : photos2;
    const room = MAX_FACE_PHOTOS - current.length;
    if (room <= 0) return;
    const toLoad = files.slice(0, room);

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const uploaded: FacePhoto[] = [];
      for (const file of toLoad) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = () => reject(new Error('read failed'));
          r.readAsDataURL(file);
        });
        const res = await uploadPhoto(dataUrl, file.name);
        uploaded.push({ url: res.url, id: res.id });
      }
      if (uploadTarget === 'p1') setPhotos1((prev) => [...prev, ...uploaded].slice(0, MAX_FACE_PHOTOS));
      else setPhotos2((prev) => [...prev, ...uploaded].slice(0, MAX_FACE_PHOTOS));
    } catch (err: any) {
      setErrorMessage(err?.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (target: 'p1' | 'p2', index: number) => {
    if (target === 'p1') setPhotos1((p) => p.filter((_, i) => i !== index));
    else setPhotos2((p) => p.filter((_, i) => i !== index));
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
    if (!age1 || age1 < 1 || age1 > 120) {
      setErrorMessage(copy.ageRequired);
      return;
    }
    if (slots === 2 && (!age2 || age2 < 1 || age2 > 120)) {
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

      const extraUrls = photos1.slice(1).map((p) => p.url);
      const job = await createGenerationJob(template.id, photos1[0].url, photos1[0].id, {
        mode: slots === 2 ? 'couple' : 'template',
        partnerPhotoUrl: slots === 2 ? photos2[0]?.url : undefined,
        aspectRatio: selectedAspectRatio,
        age: age1,
        age2: slots === 2 ? age2 : undefined,
        extraPhotoUrls: extraUrls.length ? extraUrls : undefined,
        partnerExtraPhotoUrls:
          slots === 2 && photos2.length > 1 ? photos2.slice(1).map((p) => p.url) : undefined
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
    setPhotos1([]);
    setPhotos2([]);
  };

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    onPointerMove(e.clientX);
  };

  const sheetPhotos = uploadTarget === 'p1' ? photos1 : photos2;

  // —— RESULT ——
  if (isGenerating && resultUrl) {
    return (
      <div className="fixed inset-0 z-[60] bg-white/85 dark:bg-[#0c0e14]/90 backdrop-blur-md overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {t.completed}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
              <img src={photos1[0]?.url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-violet-400">
              <img src={resultUrl} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <a href={resultUrl} download={`AuraStudio_${Date.now()}.jpg`} className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white">
            <Download className="h-4 w-4" />
            {t.downloadPhoto}
          </a>
          <button type="button" onClick={() => { setIsGenerating(false); setResultUrl(null); }} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold">
            <RefreshCw className="h-4 w-4" />
            {language === 'ru' ? 'Ещё раз' : language === 'en' ? 'Again' : 'Din nou'}
          </button>
          <button type="button" onClick={() => { onClose(); setCurrentView('gallery'); }} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold">
            <FolderHeart className="h-4 w-4" />
            {t.myGallery}
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-[60] bg-white/80 dark:bg-[#0c0e14]/90 backdrop-blur-md flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-500" />
        </div>
        <p className="text-sm font-medium text-slate-600 text-center">{stepText}</p>
      </div>
    );
  }


  // ─── PINTEREST MODE ───────────────────────────────────────────
  if (studioMode === 'pinterest') {
    const canGen = Boolean(refUrl && photos1[0]);
    const cost = 1;
    const handlePinGen = async () => {
      if (!currentUser) { setIsAuthModalOpen(true); return; }
      if (!refUrl) { setErrorMessage(language === 'ru' ? 'Сначала загрузи референс' : 'Upload reference first'); return; }
      if (!photos1[0]) { setErrorMessage(copy.needPhoto); return; }
      if ((currentUser.photoBalance ?? 0) < cost) { setIsPhotoModalOpen(true); return; }
      setIsGenerating(true);
      setStepText(t.progressStepAnalyze);
      setErrorMessage(null);
      try {
        let promptExtra = '';
        if (heightCm) promptExtra += ` Height about ${heightCm} cm.`;
        if (weightKg) promptExtra += ` Weight about ${weightKg} kg.`;
        const job = await createGenerationJob('custom-pinterest', photos1[0].url, photos1[0].id, {
          mode: 'pinterest',
          customReferenceUrl: refUrl,
          aspectRatio: selectedAspectRatio,
          age: age1,
          extraPhotoUrls: photos1.slice(1).map((x) => x.url)
        } as any);
        setResultUrl(job.resultImageUrl || null);
        setStepText(t.completed);
      } catch (err: any) {
        setIsGenerating(false);
        setErrorMessage(err?.message || 'Error');
      }
    };
    const onRefFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !currentUser) { if (!currentUser) setIsAuthModalOpen(true); return; }
      setIsUploading(true);
      try {
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = () => rej(new Error('read'));
          r.readAsDataURL(file);
        });
        // store as data URL / upload
        const up = await uploadPhoto(dataUrl, `ref_${file.name}`);
        setRefUrl(up.url);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Upload error');
      } finally {
        setIsUploading(false);
      }
    };
    return (
      <div className="fixed inset-0 z-[60] bg-white/80 dark:bg-[#0c0e14]/90 backdrop-blur-md overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-28">
          <div className="flex items-center gap-3 mb-4">
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">AuraStudio <span className="text-violet-500">AI</span></span>
            <span className="ml-1 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold px-2.5 py-1">
              {language === 'ru' ? 'повтор' : language === 'en' ? 'replay' : 'replay'}
            </span>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-blue-700 text-white p-5 shadow-lg">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              {language === 'ru' ? 'Повтор по референсу' : language === 'en' ? 'Reference replay' : 'Replay pe referință'}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight">
              {language === 'ru' ? 'Повтори фото с Pinterest' : language === 'en' ? 'Replay a Pinterest photo' : 'Refă o foto din Pinterest'}
            </h1>
            <p className="mt-2 text-sm text-white/90 leading-relaxed">
              {language === 'ru'
                ? 'Понравилось фото? Сделаем тебя в нём — без билетов в Италию и нового гардероба.'
                : language === 'en'
                  ? 'Like a photo? We put you in it — no trip or new wardrobe needed.'
                  : 'Ți-a plăcut o poză? Te punem în ea — fără bilet și garderoba nouă.'}
            </p>
          </div>

          <button type="button" onClick={() => setShowTipModal(true)} className="mt-4 w-full text-left rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 flex gap-3 items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"><Camera className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-900">{copy.tipTitle}</p>
              <p className="text-xs text-amber-800/80 mt-0.5">{copy.tipBody}</p>
            </div>
            <span className="text-amber-600">›</span>
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                {language === 'ru' ? 'Референс' : language === 'en' ? 'Reference' : 'Referință'}{' '}
                <span className="normal-case font-medium text-violet-500">{language === 'ru' ? 'откуда' : language === 'en' ? 'from' : 'de unde'}</span>
              </p>
              <label className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white cursor-pointer overflow-hidden">
                {refUrl ? <img src={refUrl} alt="" className="h-full w-full object-cover" /> : (<><Plus className="h-6 w-6 text-slate-400" /><span className="text-sm font-semibold text-slate-500 mt-1">{language === 'ru' ? 'Загрузить' : 'Upload'}</span></>)}
                <input type="file" accept="image/*" className="hidden" onChange={onRefFile} />
              </label>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                {language === 'ru' ? 'Ты' : language === 'en' ? 'You' : 'Tu'}{' '}
                <span className="normal-case font-medium text-violet-500">{language === 'ru' ? 'кого вставляем' : language === 'en' ? 'who we insert' : 'pe cine inserăm'}</span>
              </p>
              <button type="button" onClick={() => openUpload('p1')} className="flex w-full aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden">
                {photos1[0] ? <img src={photos1[0].url} alt="" className="h-full w-full object-cover" /> : (<><Plus className="h-6 w-6 text-slate-400" /><span className="text-sm font-semibold text-slate-500 mt-1">{language === 'ru' ? 'Загрузить' : 'Upload'}</span></>)}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPinHelp(true)}
            className="mt-5 w-full text-left rounded-2xl bg-white border border-slate-200 px-4 py-3.5 flex gap-3 items-center shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e60023]/10 text-[#e60023] text-lg font-black">
              P
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {language === 'ru'
                  ? 'Как сохранить картинку из Pinterest'
                  : language === 'en'
                    ? 'How to save an image from Pinterest'
                    : 'Cum salvezi o imagine din Pinterest'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ru'
                  ? 'Нажми сюда — два простых шага, затем загрузи файл в «Референс»'
                  : language === 'en'
                    ? 'Tap here — two simple steps, then upload the file as Reference'
                    : 'Apasă aici — doi pași simpli, apoi încarcă fișierul la Referință'}
              </p>
            </div>
            <span className="text-slate-400 text-lg">›</span>
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">{language === 'ru' ? 'Рост · опц.' : 'Height · opt.'}</p>
              <div className="flex items-center rounded-2xl bg-white border border-slate-200 px-3">
                <input value={heightCm} onChange={(e) => setHeightCm(e.target.value.replace(/\D/g, ''))} className="w-full py-3 text-sm outline-none bg-transparent" placeholder="165" />
                <span className="text-xs text-slate-400 font-semibold">CM</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">{language === 'ru' ? 'Вес · опц.' : 'Weight · opt.'}</p>
              <div className="flex items-center rounded-2xl bg-white border border-slate-200 px-3">
                <input value={weightKg} onChange={(e) => setWeightKg(e.target.value.replace(/\D/g, ''))} className="w-full py-3 text-sm outline-none bg-transparent" placeholder="48" />
                <span className="text-xs text-slate-400 font-semibold">KG</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handlePinGen}
            disabled={isUploading || isGenerating}
            className="mt-5 w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-violet-400 disabled:bg-violet-300"
          >
            {!refUrl
              ? (language === 'ru' ? 'Сначала загрузи референс' : 'Upload reference first')
              : !photos1[0]
                ? copy.needPhoto
                : (language === 'ru' ? `Сгенерировать · ${cost} фото` : `Generate · ${cost} photo`)}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            {language === 'ru' ? 'формат наследуется с референса · 1 фото с баланса' : 'format follows reference · 1 photo from balance'}
          </p>
        </div>


        {showPinHelp && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 pb-8 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h2 className="text-xl font-extrabold text-slate-900 leading-snug pr-2">
                  {language === 'ru'
                    ? 'Как сохранить картинку из Pinterest'
                    : language === 'en'
                      ? 'How to save an image from Pinterest'
                      : 'Cum salvezi o imagine din Pinterest'}
                </h2>
                <button type="button" onClick={() => setShowPinHelp(false)} className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {language === 'ru'
                  ? 'Два шага в приложении Pinterest — картинка сохранится в галерею телефона.'
                  : language === 'en'
                    ? 'Two steps in the Pinterest app — the image is saved to your phone gallery.'
                    : 'Doi pași în aplicația Pinterest — imaginea se salvează în galeria telefonului.'}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">1</p>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[9/16]">
                    <img
                      src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/pin-help-1.png"
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-snug font-medium">
                    {language === 'ru'
                      ? 'Открой пин и нажми «⋯» внизу экрана'
                      : language === 'en'
                        ? 'Open the pin and tap “⋯” at the bottom'
                        : 'Deschide pinul și apasă „⋯” jos pe ecran'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">2</p>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[9/16]">
                    <img
                      src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/pin-help-2.png"
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-snug font-medium">
                    {language === 'ru'
                      ? 'Выбери «Download image» / «Скачать изображение»'
                      : language === 'en'
                        ? 'Tap “Download image”'
                        : 'Alege „Download image” / „Descarcă imaginea”'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinHelp(false)}
                className="mt-6 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white"
              >
                {copy.continue}
              </button>
            </div>
          </div>
        )}
{showTipModal && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-end mb-2">
                <button type="button" onClick={() => setShowTipModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug pr-2">{copy.tipModalTitle}</h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">{copy.tipModalBody}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1.5">✓ {copy.better}</p>
                  <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-1.5 grid grid-cols-2 gap-1.5">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-1.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-2.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-3.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-4.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-500 mb-1.5">✕ {copy.worse}</p>
                  <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-1.5 grid grid-cols-2 gap-1.5">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-1.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-2.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-3.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-4.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowTipModal(false)} className="mt-5 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white">
                {copy.continue}
              </button>
            </div>
          </div>
        )}
        {showUploadSheet && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50">
            <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8">
              <div className="flex justify-between"><h2 className="text-xl font-extrabold">{copy.uploadSheetTitle}</h2><button type="button" onClick={() => setShowUploadSheet(false)}><X className="h-5 w-5" /></button></div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Array.from({ length: MAX_FACE_PHOTOS }).map((_, i) => {
                  const ph = photos1[i];
                  return ph ? (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={ph.url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removePhoto('p1', i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <button key={i} type="button" onClick={triggerFilePick} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center"><Plus className="h-6 w-6 text-slate-400" /></button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">{copy.loaded(photos1.length)}</p>
              <button type="button" onClick={() => setShowUploadSheet(false)} className="mt-3 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white">{copy.continue}</button>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>
    );
  }

  // ─── ENHANCE / 4K MODE ────────────────────────────────────────
  if (studioMode === 'enhance') {
    const cost = enhanceRes === '4k' ? 2 : 1;
    const handleEnhance = async () => {
      if (!currentUser) { setIsAuthModalOpen(true); return; }
      if (!photos1[0]) { setErrorMessage(copy.needPhoto); return; }
      if ((currentUser.photoBalance ?? 0) < cost) { setIsPhotoModalOpen(true); return; }
      setIsGenerating(true);
      setStepText(t.progressStepAnalyze);
      setErrorMessage(null);
      try {
        const job = await createGenerationJob('enhance-quality', photos1[0].url, photos1[0].id, {
          mode: 'enhance' as any,
          aspectRatio: selectedAspectRatio,
          quality4k: enhanceRes === '4k'
        } as any);
        setResultUrl(job.resultImageUrl || null);
        setStepText(t.completed);
      } catch (err: any) {
        setIsGenerating(false);
        setErrorMessage(err?.message || 'Error');
      }
    };
    return (
      <div className="fixed inset-0 z-[60] bg-white/80 dark:bg-[#0c0e14]/90 backdrop-blur-md overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-28">
          <div className="flex items-center gap-3 mb-5">
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-extrabold text-slate-900">AuraStudio <span className="text-violet-500">AI</span></span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            {language === 'ru' ? 'Улучшить качество' : language === 'en' ? 'Enhance quality' : 'Îmbunătățește calitatea'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {language === 'ru'
              ? 'Загрузи фото и выбери разрешение — вернём резкий HD-кадр за пару минут.'
              : language === 'en'
                ? 'Upload a photo and pick resolution — get a sharp HD frame in a couple of minutes.'
                : 'Încarcă o poză și alege rezoluția — primești un cadru HD clar în câteva minute.'}
          </p>

          <button
            type="button"
            onClick={() => openUpload('p1')}
            className="mt-6 w-full aspect-[4/5] max-h-[320px] rounded-3xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center gap-2 overflow-hidden"
          >
            {photos1[0] ? (
              <img src={photos1[0].url} alt="" className="h-full w-full object-cover" />
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Plus className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold text-slate-700">{language === 'ru' ? 'Загрузить фото' : 'Upload photo'}</span>
                <span className="text-xs text-slate-400">jpg, png или webp</span>
              </>
            )}
          </button>

          <p className="mt-6 text-sm font-semibold text-slate-700">
            {language === 'ru' ? 'Разрешение' : language === 'en' ? 'Resolution' : 'Rezoluție'}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEnhanceRes('2k')}
              className={`rounded-2xl border-2 p-4 text-left transition-colors ${enhanceRes === '2k' ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold">2K</span>
                <Sparkles className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                {language === 'ru' ? 'Резче и крупнее — для сторис и печати.' : 'Sharper — for stories and print.'}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">✦ 1 {language === 'en' ? 'photo' : 'фото'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEnhanceRes('4k')}
              className={`rounded-2xl border-2 p-4 text-left transition-colors ${enhanceRes === '4k' ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold">4K</span>
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                {language === 'ru' ? 'Максимум чёткости для большого экрана.' : 'Max clarity for large screens.'}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">✦ 2 {language === 'en' ? 'photos' : 'фото'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleEnhance}
            disabled={isUploading || isGenerating}
            className="mt-5 w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-violet-400 disabled:bg-violet-300 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {!photos1[0]
              ? copy.needPhoto
              : language === 'ru'
                ? `Улучшить за ${cost} фото`
                : language === 'en'
                  ? `Enhance for ${cost} photo${cost > 1 ? 's' : ''}`
                  : `Îmbunătățește · ${cost} foto`}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            {language === 'ru' ? '≈ 2 минуты · без водяного знака · вернём фото при сбое' : '≈ 2 min · no watermark · refund on failure'}
          </p>
        </div>
        {showUploadSheet && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50">
            <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8">
              <div className="flex justify-between"><h2 className="text-xl font-extrabold">{copy.uploadSheetTitle}</h2><button type="button" onClick={() => setShowUploadSheet(false)}><X className="h-5 w-5" /></button></div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Array.from({ length: MAX_FACE_PHOTOS }).map((_, i) => {
                  const ph = photos1[i];
                  return ph ? (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={ph.url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removePhoto('p1', i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <button key={i} type="button" onClick={triggerFilePick} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center"><Plus className="h-6 w-6 text-slate-400" /></button>
                  );
                })}
              </div>
              <button type="button" onClick={() => setShowUploadSheet(false)} className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white">{copy.continue}</button>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-transparent">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col bg-white/85 dark:bg-[#0c0e14]/90 backdrop-blur-md shadow-2xl">
      {/* HERO */}
      <div ref={heroRef} className="relative w-full aspect-[3/4] max-h-[58vh] bg-slate-200 select-none touch-none overflow-hidden shrink-0">
        {afterUrl && (
          <img src={afterUrl} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover pointer-events-none" draggable={false} />
        )}
        {beforeUrl && (
          <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none" style={{ width: `${sliderPct}%` }}>
            <img src={beforeUrl} alt="" referrerPolicy="no-referrer" className="h-full object-cover max-w-none" style={{ width: heroWidth || '100vw' }} draggable={false} />
          </div>
        )}
        {beforeUrl && (
          <div className="absolute inset-y-0 z-10" style={{ left: `${sliderPct}%`, transform: 'translateX(-50%)' }}>
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/90 shadow" />
            <button type="button" onPointerDown={startDrag} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 cursor-ew-resize" aria-label="Compare">
              <span className="text-sm font-bold tracking-tighter select-none">↔</span>
            </button>
          </div>
        )}
        <button type="button" onClick={onClose} className="absolute top-3 left-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow">
          <ChevronLeft className="h-5 w-5" />
        </button>
        {hintVisible && beforeUrl && (
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
            <div className="rounded-full bg-slate-900/80 text-white text-xs font-medium px-4 py-2 whitespace-nowrap">↔ {copy.hint}</div>
          </div>
        )}
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-white dark:bg-[#0c0e14] px-4 pt-3 pb-28 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />

        {moreTemplates.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.tryMore}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {moreTemplates.map((tmpl) => (
                <button key={tmpl.id} type="button" onClick={() => selectOther(tmpl)} className="shrink-0 h-[4.5rem] w-[4.5rem] rounded-2xl overflow-hidden border border-slate-100">
                  <img src={tmpl.previewImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{name}</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {copy.disclaimer}
          {description ? ` ${description}` : ''}
        </p>

        {/* Tip → modal */}
        <button
          type="button"
          onClick={() => setShowTipModal(true)}
          className="mt-4 w-full text-left rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 flex gap-3 items-center"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Camera className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">{copy.tipTitle}</p>
            <p className="text-xs text-amber-800/80 mt-0.5">{copy.tipBody}</p>
          </div>
          <span className="text-amber-600 text-lg">›</span>
        </button>

        {/* Upload slots (preview of first face only) */}
        <div className={`mt-6 grid gap-4 ${slots === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
          <FaceSlot
            label={copy.photoYou}
            photos={photos1}
            uploadLabel={copy.upload}
            onClick={() => openUpload('p1')}
          />
          {slots === 2 && (
            <FaceSlot
              label={copy.photoPartner}
              photos={photos2}
              uploadLabel={copy.upload}
              onClick={() => openUpload('p2')}
            />
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">{copy.uploadHint}</p>

        {/* Age — one or two */}
        {slots === 2 ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.ageYou}</p>
              <input type="number" min={1} max={120} value={age1} onChange={(e) => setAge1(Number(e.target.value) || 0)} className="w-full rounded-2xl bg-slate-100 border-0 px-4 py-3.5 text-base font-medium outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.agePartner}</p>
              <input type="number" min={1} max={120} value={age2} onChange={(e) => setAge2(Number(e.target.value) || 0)} className="w-full rounded-2xl bg-slate-100 border-0 px-4 py-3.5 text-base font-medium outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.age}</p>
            <input type="number" min={1} max={120} value={age1} onChange={(e) => setAge1(Number(e.target.value) || 0)} className="w-full rounded-2xl bg-slate-100 border-0 px-4 py-3.5 text-base font-medium outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{copy.ratio}</p>
          <div className="grid grid-cols-4 gap-2">
            {ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedAspectRatio(opt.value)}
                className={`rounded-2xl py-3 text-center ${
                  selectedAspectRatio === opt.value
                    ? 'bg-violet-50 ring-2 ring-violet-500 text-violet-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <div className="text-sm font-bold">{opt.value}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{ratioLabel(opt)}</div>
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="mt-5 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {copy.balance}: <strong className="text-slate-800">{balance} {language === 'en' ? 'photo' : 'фото'}</strong>
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
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-violet-400 hover:bg-violet-500 disabled:bg-violet-300 disabled:cursor-not-allowed"
            >
              {!hasRequiredPhotos ? copy.needPhoto : copy.generate(photoCost)}
            </button>
          )}
        </div>

        <div className="mt-6 space-y-3 pb-2">
          <div className="-rotate-[1.5deg] origin-left rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm text-slate-600 leading-relaxed shadow-sm">
            {language === 'ru' ? (
              <>
                Что-то сломалось или вышло не так, как хотелось? Пиши в Telegram{' '}
                <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline underline-offset-2">
                  @aurastudio_help_bot
                </a>{' '}
                — команда AuraStudio поможет тебе.
              </>
            ) : language === 'en' ? (
              <>
                Something went wrong? Message Telegram{' '}
                <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline underline-offset-2">
                  @aurastudio_help_bot
                </a>{' '}
                — the AuraStudio team will help.
              </>
            ) : (
              <>
                Ceva nu a mers? Scrie în Telegram{' '}
                <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline underline-offset-2">
                  @aurastudio_help_bot
                </a>{' '}
                — echipa AuraStudio te ajută.
              </>
            )}
          </div>
          <div className="rotate-[1.5deg] origin-left rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm text-slate-600 shadow-sm">
            {copy.honest} ❤️
          </div>
          <a href="https://t.me/aurastudio_help_bot" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 text-white font-semibold py-3.5 text-sm shadow-lg shadow-blue-600/20">
            <Send className="h-4 w-4" />
            {copy.tgBtn}
          </a>
        </div>
      </div>

      {/* TIP MODAL */}
      {showTipModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <div className="mx-auto sm:mx-0 h-1 w-10 rounded-full bg-slate-200 sm:hidden absolute left-1/2 -translate-x-1/2 top-2" />
              <button type="button" onClick={() => setShowTipModal(false)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug pr-6">{copy.tipModalTitle}</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">{copy.tipModalBody}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-1.5">✓ {copy.better}</p>
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-1.5 grid grid-cols-2 gap-1.5">
                                    <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-1.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-2.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-3.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-good-4.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-500 mb-1.5">✕ {copy.worse}</p>
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-1.5 grid grid-cols-2 gap-1.5">
                                    <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-1.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-2.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-3.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src="https://zjshigepycaaqbqyuztk.supabase.co/storage/v1/object/public/template-previews/tip-bad-4.jpeg" alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" /></div>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setShowTipModal(false)} className="mt-5 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white">
              {copy.continue}
            </button>
          </div>
        </div>
      )}

      {/* MULTI-UPLOAD SHEET */}
      {showUploadSheet && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 pb-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-extrabold text-slate-900 pr-8">
                {uploadTarget === 'p1' ? copy.uploadSheetTitle : copy.uploadSheetTitle2}
              </h2>
              <button type="button" onClick={() => setShowUploadSheet(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 leading-relaxed">
              {copy.uploadSheetHint}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: MAX_FACE_PHOTOS }).map((_, i) => {
                const ph = sheetPhotos[i];
                return ph ? (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={ph.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(uploadTarget, i)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={triggerFilePick}
                    disabled={isUploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">{copy.loaded(sheetPhotos.length)}</p>
            <button
              type="button"
              onClick={triggerFilePick}
              disabled={isUploading || sheetPhotos.length >= MAX_FACE_PHOTOS}
              className="mt-3 w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-800 disabled:opacity-50"
            >
              {isUploading ? '…' : copy.pickPhotos}
            </button>
            <button
              type="button"
              onClick={() => setShowUploadSheet(false)}
              className="mt-2 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white"
            >
              {copy.continue}
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      </div>
    </div>
  );
};

function FaceSlot({
  label,
  photos,
  uploadLabel,
  onClick
}: {
  label: string;
  photos: FacePhoto[];
  uploadLabel: string;
  onClick: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 text-center">{label}</p>
      {photos[0] ? (
        <button type="button" onClick={onClick} className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200">
          <img src={photos[0].url} alt="" className="h-full w-full object-cover" />
          {photos.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/70 text-white text-[10px] font-bold px-2 py-0.5">
              +{photos.length - 1}
            </span>
          )}
        </button>
      ) : (
        <button type="button" onClick={onClick} className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Upload className="h-6 w-6" />
          <span className="text-sm font-semibold">{uploadLabel}</span>
        </button>
      )}
    </div>
  );
}
