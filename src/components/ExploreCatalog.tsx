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

/** Pink flame — tongue of fire, not a drop */
function FlameIcon({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="6 2 12 20" fill="none" aria-hidden="true" className="block">
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
    case 'forYou':
      return active;
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

/** Stable tilt degrees −7…+7 */
function badgeTilt(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return (h % 15) - 7;
}

interface ExploreCatalogProps {
  onPreview: (t: PhotoTemplate) => void;
  onSelect: (t: PhotoTemplate) => void;
  onPinterest: () => void;
  onCouple: () => void;
}

export const ExploreCatalog: React.FC<ExploreCatalogProps> = ({
  onPreview,
  onSelect,
  onPinterest
}) => {
  const { language, templates } = useApp();
  const [tab, setTab] = useState<TabId>('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  const [tgOpen, setTgOpen] = useState(false);

  const lang = language === 'ru' || language === 'en' ? language : 'ro';

  const baseList = useMemo(() => filterByTab(templates, tab), [templates, tab]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return baseList;
    const q = searchQuery.toLowerCase();
    return baseList.filter((t) => {
      const name = (t.name[lang] || t.name.ro || '').toLowerCase();
      const desc = (t.description[lang] || t.description.ro || '').toLowerCase();
      const tags = (t.tags || []).join(' ').toLowerCase();
      return name.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [baseList, searchQuery, lang]);

  const trending = useMemo(() => {
    return [...templates]
      .filter((t) => t.isActive)
      .sort((a, b) => todayCount(b.id) - todayCount(a.id))
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
    <div className="bg-[#f3f5fa] dark:bg-[#090a0f] min-h-[60vh] pb-28">
      {/* Content column — never full-bleed stretch on desktop */}
      <div className="mx-auto w-full max-w-[720px] px-4 pt-3 sm:px-5">
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

        {/* Tabs */}
        <div className="mt-5 -mx-4 overflow-x-auto px-4 no-scrollbar">
          <div className="flex min-w-max items-end gap-5 pb-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative whitespace-nowrap pb-2.5 text-[17px] font-extrabold tracking-tight transition-colors ${
                    active ? 'text-[#12152a] dark:text-white' : 'text-[#a8b0c0] dark:text-slate-500'
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

        {/* 3 action tiles — equal, compact, not stretched */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={onPinterest}
            className="flex h-[118px] flex-col justify-between rounded-[22px] bg-[#e60023] px-3 py-3 text-left text-white transition-transform active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
              <PinterestMark />
            </span>
            <span className="text-[13px] font-bold leading-[1.15]">
              {language === 'ru' ? (
                <>
                  Повтор фото
                  <span className="block text-[11px] font-semibold text-white/90">из Pinterest</span>
                </>
              ) : language === 'en' ? (
                <>
                  Replay photo
                  <span className="block text-[11px] font-semibold text-white/90">from Pinterest</span>
                </>
              ) : (
                <>
                  Refă foto
                  <span className="block text-[11px] font-semibold text-white/90">din Pinterest</span>
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filtered[0]) onSelect(filtered[0]);
            }}
            className="flex h-[118px] flex-col justify-between rounded-[22px] bg-white px-3 py-3 text-left shadow-sm transition-transform active:scale-[0.98] dark:bg-[#161924]"
          >
            <span className="flex items-center justify-between">
              <span className="text-[19px] font-black tracking-tight text-[#12152a] dark:text-white">4K</span>
              <ChevronRight className="h-4 w-4 -rotate-45 text-slate-300" />
            </span>
            <span className="text-[13px] font-bold leading-[1.15] text-[#12152a] dark:text-white">
              {language === 'ru' ? (
                <>
                  Улучшить
                  <span className="block text-[11px] font-semibold text-slate-400">качество</span>
                </>
              ) : language === 'en' ? (
                <>
                  Enhance
                  <span className="block text-[11px] font-semibold text-slate-400">quality</span>
                </>
              ) : (
                <>
                  Îmbunătățește
                  <span className="block text-[11px] font-semibold text-slate-400">calitatea</span>
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTgOpen(true)}
            className="flex h-[118px] flex-col justify-between rounded-[22px] bg-[#3b9eff] px-3 py-3 text-left text-white transition-transform active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.5 4.5 2.8 11.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5z"
                />
              </svg>
            </span>
            <span className="text-[13px] font-bold leading-[1.15]">
              {language === 'ru' ? (
                <>
                  Наш Telegram
                  <span className="block text-[11px] font-semibold text-white/90">подписка +1 фото</span>
                </>
              ) : language === 'en' ? (
                <>
                  Our Telegram
                  <span className="block text-[11px] font-semibold text-white/90">subscribe +1 photo</span>
                </>
              ) : (
                <>
                  Telegramul nostru
                  <span className="block text-[11px] font-semibold text-white/90">abonare +1 foto</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* ===== В ТРЕНДЕ ===== */}
        <section className="mt-7">
          <h2 className="text-[22px] font-extrabold tracking-tight text-[#12152a] dark:text-white">
            {language === 'ru' ? 'в тренде' : language === 'en' ? 'trending' : 'în trend'}
          </h2>

          {/*
            Card fixed size so ~2.75 fit in max-w ~480–560.
            Badge sits on top edge (top negative), pink flame + text, tight padding.
          */}
          <div className="mt-3 -mx-4 overflow-x-auto overflow-y-visible no-scrollbar">
            <div className="flex w-max items-start gap-2.5 px-4 pb-1 pt-3">
              {trending.map((tmpl) => {
                const name = tmpl.name[lang] || tmpl.name.ro;
                const count = todayCount(tmpl.id);
                const tilt = badgeTilt(tmpl.id);
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onPreview(tmpl)}
                    className="relative shrink-0 text-left"
                    style={{
                      /* 4 full cards: (row - 3 gaps) / 4 ; gap = 10px */
                      width: 'calc((100vw - 2rem - 30px) / 4)',
                      maxWidth: 'calc((720px - 2rem - 30px) / 4)',
                      aspectRatio: '3 / 4'
                    }}
                  >
                    {/* Photo only — overflow hidden */}
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
                      <span className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 text-left text-[13px] font-bold leading-[1.15] text-white line-clamp-2">
                        {name}
                      </span>
                    </span>

                    {/* Badge sticker on top edge */}
                    <span
                      className="absolute z-20 inline-flex items-center gap-[3px] whitespace-nowrap rounded-full bg-white shadow-md"
                      style={{
                        top: '-7px',
                        left: '50%',
                        padding: '2px 6px 2px 4px',
                        transform: `translateX(-50%) rotate(${tilt}deg)`,
                        gap: '2px'
                      }}
                    >
                      <FlameIcon size={9} />
                      <span
                        style={{
                          color: '#ff2d8b',
                          fontSize: '8px',
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                          textTransform: 'uppercase',
                          lineHeight: 1
                        }}
                      >
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

        {/* ===== СТОИТ ПОПРОБОВАТЬ — ровно 2 колонки ===== */}
        <section className="mt-8">
          <h2 className="text-[20px] font-extrabold text-[#12152a] dark:text-white">
            {language === 'ru'
              ? 'стоит попробовать'
              : language === 'en'
              ? 'worth trying'
              : 'merită încercat'}
          </h2>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {language === 'ru'
                ? 'Пока нет шаблонов в этой категории'
                : language === 'en'
                ? 'No templates in this category yet'
                : 'Încă nu sunt șabloane în această categorie'}
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {filtered.map((tmpl) => {
                const name = tmpl.name[lang] || tmpl.name.ro;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onPreview(tmpl)}
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

      {/* Telegram bottom sheet */}
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
