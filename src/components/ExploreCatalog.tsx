import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate } from '../types';
import { Search, ChevronRight, X, Gift, Sparkles, Bell, MessageCircle } from 'lucide-react';

type TabId = 'forYou' | 'video' | 'effects' | 'holidays' | 'together' | 'pets' | 'covered';

const TABS: { id: TabId; ru: string; ro: string; en: string }[] = [
  { id: 'forYou', ru: 'для тебя', ro: 'pentru tine', en: 'for you' },
  { id: 'video', ru: 'видеошаблоны', ro: 'video', en: 'video' },
  { id: 'effects', ru: 'эффекты', ro: 'efecte', en: 'effects' },
  { id: 'holidays', ru: 'праздники', ro: 'sărbători', en: 'holidays' },
  { id: 'together', ru: 'вместе', ro: 'împreună', en: 'together' },
  { id: 'pets', ru: 'с питомцами', ro: 'cu animale', en: 'with pets' },
  { id: 'covered', ru: 'для покрытых', ro: 'cu hijab', en: 'modest' }
];

const TELEGRAM_URL = 'https://t.me/aurastudio_help_bot';

/** Pink flame icon — tight viewBox, no empty padding */
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="7 2 10 20" fill="none" aria-hidden="true" className={className}>
      <path
        fill="#ff2d8b"
        d="M12.1 2.1c.15 2.4-.55 3.9-1.55 5.2-.95 1.25-1.95 2.45-1.95 4.35 0 2.55 1.95 4.55 4.4 4.55s4.4-2 4.4-4.55c0-1.7-.7-2.95-1.65-4.25C14.65 5.8 13.7 4.3 12.1 2.1z"
      />
    </svg>
  );
}

function PinterestMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.43 7.63 11.17-.1-.95-.2-2.4.04-3.44.22-.94 1.4-5.96 1.4-5.96s-.36-.72-.36-1.78c0-1.67.97-2.91 2.17-2.91 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-.99 4-.28 1.2.6 2.17 1.78 2.17 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.06-4.88-5.01-4.88-3.41 0-5.41 2.56-5.41 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.44-2.89-2.44-4.65 0-3.78 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.61 7.46-6.23 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"
      />
    </svg>
  );
}

function tabLabel(id: TabId, language: string) {
  const t = TABS.find((x) => x.id === id)!;
  return language === 'ru' ? t.ru : language === 'en' ? t.en : t.ro;
}

function filterByTab(templates: PhotoTemplate[], tab: TabId): PhotoTemplate[] {
  const active = templates.filter((t) => t.isActive);
  switch (tab) {
    case 'forYou': {
  const list = [...active];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
    case 'video':
      return active.filter(
        (t) =>
          (t.tags || []).some((x) => /video|clip|reel/i.test(x)) ||
          /video/i.test(`${t.name.ru}${t.name.en}${t.name.ro}`)
      );
    case 'effects':
      return active.filter((t) =>
        (t.tags || []).some((x) => /effect|filter|style|bw|glam/i.test(x))
      );
    case 'holidays':
      return active.filter(
        (t) =>
          t.category === 'Birthday' ||
          (t.tags || []).some((x) => /birthday|holiday|party|halloween|new.?year/i.test(x))
      );
    case 'together':
      return active.filter(
        (t) =>
          t.category === 'Couple' ||
          t.category === 'Family' ||
          t.requiredInputType === 'couple_portrait' ||
          t.requiredInputType === 'group_family'
      );
    case 'pets':
      return active.filter((t) => (t.tags || []).some((x) => /pet|dog|cat|animal/i.test(x)));
    case 'covered':
      return active.filter((t) => {
        const blob = [
          ...(t.tags || []),
          t.name.ru,
          t.name.en,
          t.name.ro,
          t.description?.ru || '',
          t.description?.en || '',
          t.description?.ro || ''
        ]
          .join(' ')
          .toLowerCase();
        return /hijab|modest|covered|scarf|хиджаб|покрыт|платок|abaya|niqab|headscarf|мусульм/i.test(
          blob
        );
      });
    default:
      return active;
  }
}

function todayCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 400 + (h % 4600);
}

function badgeTilt(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return (h % 15) - 7;
}

interface ExploreCatalogProps {
  onPreview: (t: PhotoTemplate) => void;
  onSelect: (t: PhotoTemplate) => void;
  onPinterest: () => void;
  onEnhance: () => void;
}

export const ExploreCatalog: React.FC<ExploreCatalogProps> = ({
  onPreview,
  onSelect,
  onPinterest,
  onEnhance
}) => {
  const { language, templates } = useApp();
  const [tab, setTab] = useState<TabId>('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  const [tgOpen, setTgOpen] = useState(false);

  const lang = language === 'ru' || language === 'en' ? language : 'ro';

  const baseList = useMemo(() => filterByTab(templates, tab), [templates, tab]);

  const isSearching = searchQuery.trim().length > 0;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseList;
    // Search across ALL active templates, not only current tab
    const pool = templates.filter((t) => t.isActive);
    return pool.filter((t) => {
      const name = (t.name[lang] || t.name.ro || '').toLowerCase();
      const desc = (t.description[lang] || t.description.ro || '').toLowerCase();
      const tags = (t.tags || []).join(' ').toLowerCase();
      return name.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [baseList, searchQuery, lang, templates]);

  const trending = useMemo(() => {
  return [...templates]
    .filter((t) => t.isActive && (
      t.category === 'Trending' ||
      (t.tags || []).includes('trending')
    ))
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 24);
}, [templates]);

  const searchPh =
    language === 'ru'
      ? 'Найди шаблон или эффект, просто клик…'
      : language === 'en'
      ? 'Find a template or effect…'
      : 'Caută un șablon sau efect…';

  const todayWord =
    language === 'ru' ? 'СЕГОДНЯ' : language === 'en' ? 'TODAY' : 'AZI';
  const swipeHint =
    language === 'ru' ? 'листай вправо →' : language === 'en' ? 'swipe right →' : 'glisează la dreapta →';

  const perks =
    language === 'ru'
      ? [
          'Конкурсы и розыгрыши для подписчиков',
          'Новые шаблоны раньше всех',
          'Новости обновлений',
          'Слушаем твою обратную связь'
        ]
      : language === 'en'
      ? [
          'Giveaways for subscribers',
          'New templates before everyone',
          'Update news',
          'We read your feedback'
        ]
      : [
          'Concursuri pentru abonați',
          'Șabloane noi înaintea tuturor',
          'Noutăți despre update-uri',
          'Ascultăm feedback-ul tău'
        ];

  return (
    <div className="min-h-[60vh] bg-transparent pb-28">
      {/*
        Mobile: full width + px-4 (reference phone layout).
        Desktop (md+): centered column max-w-[720px] — not full 1920, not a 480 stub.
      */}
      <div className="mx-auto w-full px-4 pt-3 md:max-w-[720px] md:px-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPh}
            className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-4 text-[14px] text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-white/[0.06] dark:text-slate-100"
          />
        </div>

        {!isSearching && (
          <>
        {/* Tabs */}
        <div className="-mx-4 mt-5 overflow-x-auto px-4 no-scrollbar">
          <div className="flex min-w-max items-end gap-5 pb-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative whitespace-nowrap pb-2.5 text-[17px] font-extrabold tracking-tight transition-colors md:text-[18px] ${
                    active ? 'text-slate-900 dark:text-white' : 'text-[#a8b0c0] dark:text-slate-500'
                  }`}
                >
                  {tabLabel(t.id, language)}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#3b82f6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

                  </>
        )}

        {/* 3 action tiles — square, not stretched full width */}
        <div className="relative z-10 mt-4 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={onPinterest}
            className="relative z-10 flex aspect-square w-[31%] max-w-[120px] flex-col justify-between rounded-[20px] px-2.5 py-2.5 text-left text-white transition-transform active:scale-[0.98] md:rounded-[22px] md:px-3 md:py-3" style={{ backgroundColor: "#e60023" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 md:h-9 md:w-9">
              <PinterestMark />
            </span>
            <span className="text-[12px] font-bold leading-[1.15] md:text-[13px]">
              {language === 'ru' ? (
                <>
                  Повтор фото
                  <span className="block text-[10px] font-semibold text-white/90 md:text-[11px]">
                    из Pinterest
                  </span>
                </>
              ) : language === 'en' ? (
                <>
                  Replay photo
                  <span className="block text-[10px] font-semibold text-white/90 md:text-[11px]">
                    from Pinterest
                  </span>
                </>
              ) : (
                <>
                  Refă foto
                  <span className="block text-[10px] font-semibold text-white/90 md:text-[11px]">
                    din Pinterest
                  </span>
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={onEnhance}
            className="relative z-10 flex aspect-square w-[31%] max-w-[120px] flex-col justify-between rounded-[20px] bg-white px-2.5 py-2.5 text-left shadow-md transition-transform active:scale-[0.98] dark:bg-[#1a1d2a] md:rounded-[22px] md:px-3 md:py-3"
          >
            <span className="flex items-center justify-between">
              <span className="text-[18px] font-black tracking-tight text-slate-900 dark:text-white md:text-[19px]">
                4K
              </span>
              <ChevronRight className="h-4 w-4 -rotate-45 text-slate-300" />
            </span>
            <span className="text-[12px] font-bold leading-[1.15] text-slate-900 dark:text-white md:text-[13px]">
              {language === 'ru' ? (
                <>
                  Улучшить
                  <span className="block text-[10px] font-semibold text-slate-400 md:text-[11px]">
                    качество
                  </span>
                </>
              ) : language === 'en' ? (
                <>
                  Enhance
                  <span className="block text-[10px] font-semibold text-slate-400 md:text-[11px]">
                    quality
                  </span>
                </>
              ) : (
                <>
                  Îmbunătățește
                  <span className="block text-[10px] font-semibold text-slate-400 md:text-[11px]">
                    calitatea
                  </span>
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTgOpen(true)}
            className="relative z-10 flex aspect-square w-[31%] max-w-[120px] flex-col justify-between rounded-[20px] px-2.5 py-2.5 text-left text-white transition-transform active:scale-[0.98] md:rounded-[22px] md:px-3 md:py-3" style={{ backgroundColor: "#3b9eff" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 md:h-9 md:w-9">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.5 4.5 2.8 11.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5z"
                />
              </svg>
            </span>
            <span className="text-[12px] font-bold leading-[1.15] md:text-[13px]">
              {language === 'ru' ? (
                <>
                  Наш Telegram
                  <span className="block text-[10px] font-semibold text-white/90 md:text-[11px]">
                    подписка +1 фото
                  </span>
                </>
              ) : language === 'en' ? (
                <>
                  Our Telegram
                  <span className="block text-[10px] font-semibold text-white/90 md:text-[11px]">
                    subscribe +1 photo
                  </span>
                </>
              ) : (
                <>
                  Telegramul nostru
                  <span className="block text-[10px] font-semibold text-white/90 md:text-[11px]">
                    abonare +1 foto
                  </span>
                </>
              )}
            </span>
          </button>
        </div>

                        {!isSearching && (
          <>
        {/* ===== В ТРЕНДЕ =====
            Mobile:  ~2.75 cards  → width ≈ 34.5vw
            Desktop (md+): exactly 4 full cards in the 720px column
              (720 - 40 padding - 30 gaps) / 4 ≈ 162.5px
        */}
        <section className="mt-7">
          <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            {language === 'ru' ? 'в тренде' : language === 'en' ? 'trending' : 'în trend'}
          </h2>

          <div className="-mx-4 mt-3 overflow-x-auto overflow-y-visible no-scrollbar md:mx-0">
            <div className="flex w-max items-start gap-2.5 px-4 pb-1 pt-4 md:w-full md:px-0">
              {trending.map((tmpl) => {
                const name = tmpl.name[lang] || tmpl.name.ro;
                const count = todayCount(tmpl.id);
                const tilt = badgeTilt(tmpl.id);
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onSelect(tmpl)}
                    className={[
                      'relative shrink-0 text-left',
                      /* mobile: ~2.75 visible */
                      'w-[34.5vw] max-w-[148px] aspect-[3/4]',
                      /* desktop: 4 full cards in row (3 gaps × 10px = 30px) */
                      'md:w-[calc((100%-30px)/4)] md:max-w-none'
                    ].join(' ')}
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-[16px] bg-slate-200 dark:bg-slate-800">
                      {tmpl.previewImage ? (
                        <img
                          src={tmpl.previewImage}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <span className="absolute bottom-0 left-0 right-0 px-2 pb-2 text-left text-[12px] font-bold leading-[1.15] text-white line-clamp-2 md:px-2.5 md:pb-2.5 md:text-[13px]">
                        {name}
                      </span>
                    </span>

                    {/* Badge: mobile compact, desktop slightly larger (was too tiny) */}
                    <span
                      className="absolute z-20 inline-flex items-center gap-[2px] whitespace-nowrap rounded-full bg-white shadow-md md:gap-[3px]"
                      style={{
                        top: '-6px',
                        left: '50%',
                        transform: `translateX(-50%) rotate(${tilt}deg)`,
                        padding: '2px 5px 2px 4px'
                      }}
                    >
                      <FlameIcon className="block h-[9px] w-[9px] md:h-[11px] md:w-[11px]" />
                      <span className="text-[8px] font-extrabold uppercase leading-none tracking-tight text-[#ff2d8b] md:text-[10px]">
                        {count.toLocaleString('ru-RU')} {todayWord}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-1.5 text-[13px] text-slate-400">{swipeHint}</p>
        </section>

                              </>
        )}

{/* ===== RESULTS / СТОИТ ПОПРОБОВАТЬ ===== */}
        <section className="mt-8">
          <h2 className="text-[20px] font-extrabold text-slate-900 dark:text-white">
            {isSearching
              ? language === 'ru'
                ? 'Результаты поиска'
                : language === 'en'
                ? 'Search results'
                : 'Rezultatele căutării'
              : language === 'ru'
              ? 'стоит попробовать'
              : language === 'en'
              ? 'worth trying'
              : 'merită încercat'}
          </h2>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white/90 dark:bg-white/5 px-5 py-10 text-center shadow-sm">
              <p className="text-[16px] font-bold text-slate-900 dark:text-white">
                {isSearching
                  ? language === 'ru'
                    ? `Ничего не нашлось по запросу «${searchQuery.trim()}».`
                    : language === 'en'
                    ? `Nothing found for “${searchQuery.trim()}”.`
                    : `Nimic găsit pentru «${searchQuery.trim()}».`
                  : language === 'ru'
                  ? 'Пока нет шаблонов в этой категории'
                  : language === 'en'
                  ? 'No templates in this category yet'
                  : 'Încă nu sunt șabloane în această categorie'}
              </p>
              {isSearching && (
                <p className="mt-2 text-[13px] text-slate-500">
                  {language === 'ru'
                    ? 'Проверь слово или посмотри все шаблоны.'
                    : language === 'en'
                    ? 'Check the word or browse all templates.'
                    : 'Verifică cuvântul sau vezi toate șabloanele.'}
                </p>
              )}
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#3b82f6] px-5 text-[14px] font-bold text-white"
                >
                  {language === 'ru'
                    ? 'Показать все шаблоны'
                    : language === 'en'
                    ? 'Show all templates'
                    : 'Arată toate șabloanele'}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {filtered.map((tmpl) => {
                const name = tmpl.name[lang] || tmpl.name.ro;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onSelect(tmpl)}
                    className="relative aspect-[3/4] overflow-hidden rounded-[16px] bg-slate-200 text-left dark:bg-slate-800"
                  >
                    {tmpl.previewImage ? (
                      <img
                        src={tmpl.previewImage}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 text-[13px] font-bold leading-snug text-white line-clamp-2">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Telegram sheet */}
      {tgOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close"
            onClick={() => setTgOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-t-[28px] bg-white px-5 pb-6 pt-4 shadow-2xl sm:rounded-[28px]">
            <button
              type="button"
              onClick={() => setTgOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3b9eff] text-white">
              <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.5 4.5 2.8 11.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-[22px] font-extrabold leading-tight text-[#12152a]">
              {language === 'ru'
                ? 'Подпишись на Telegram — получи +1 фото'
                : language === 'en'
                ? 'Subscribe on Telegram — get +1 photo'
                : 'Abonează-te pe Telegram — primești +1 foto'}
            </h3>
            <p className="mt-2 text-center text-[14px] leading-snug text-slate-500">
              {language === 'ru'
                ? 'Бонус за подписку на бота поддержки. Автоначисление подключим отдельно — сейчас кнопка открывает Telegram.'
                : language === 'en'
                ? 'Bonus for the support bot. Auto-grant comes later — the button opens Telegram for now.'
                : 'Bonus pentru botul de suport. Acordarea automată vine mai târziu — butonul deschide Telegram.'}
            </p>
            <ul className="mt-4 space-y-2.5 rounded-2xl bg-[#f4f6fb] px-4 py-3 text-[14px] text-[#12152a]">
              {perks.map((line, i) => {
                const Icon = [Gift, Sparkles, Bell, MessageCircle][i];
                return (
                  <li key={line} className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{line}</span>
                  </li>
                );
              })}
            </ul>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3b9eff] text-[16px] font-bold text-white"
            >
              <span aria-hidden="true">✈</span>
              {language === 'ru' ? 'Получить 1 фото' : language === 'en' ? 'Get 1 photo' : 'Primește 1 foto'}
            </a>
            <p className="mt-3 text-center text-[12px] text-slate-400">
              {language === 'ru'
                ? 'Бонус один раз на аккаунт · @aurastudio_help_bot'
                : language === 'en'
                ? 'One bonus per account · @aurastudio_help_bot'
                : 'Bonus o dată pe cont · @aurastudio_help_bot'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
