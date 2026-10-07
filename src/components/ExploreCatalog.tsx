import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoTemplate } from '../types';
import { Search, Image as ImageIcon, Sparkles, Send, ChevronRight } from 'lucide-react';

type TabId = 'forYou' | 'video' | 'effects' | 'holidays' | 'together' | 'pets' | 'guys';

const TABS: { id: TabId; ru: string; ro: string; en: string }[] = [
  { id: 'forYou', ru: 'для тебя', ro: 'pentru tine', en: 'for you' },
  { id: 'video', ru: 'видеошаблоны', ro: 'video', en: 'video' },
  { id: 'effects', ru: 'эффекты', ro: 'efecte', en: 'effects' },
  { id: 'holidays', ru: 'праздники', ro: 'sărbători', en: 'holidays' },
  { id: 'together', ru: 'вместе', ro: 'împreună', en: 'together' },
  { id: 'pets', ru: 'с питомцами', ro: 'cu animale', en: 'with pets' },
  { id: 'guys', ru: 'для парней', ro: 'pentru băieți', en: 'for guys' }
];

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
          /video/i.test(t.name.ru + t.name.en + t.name.ro)
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
      return active.filter((t) =>
        (t.tags || []).some((x) => /pet|dog|cat|animal/i.test(x))
      );
    case 'guys':
      return active.filter(
        (t) =>
          t.gender === 'male' ||
          (t.tags || []).some((x) => /male|men|guy|boy/i.test(x))
      );
    default:
      return active;
  }
}

/** Pseudo «сегодня» count for trend badges (stable per template id). */
function todayCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 400 + (h % 4600);
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
  onPinterest,
  onCouple
}) => {
  const { language, templates, openCustomPinterest } = useApp();
  const [tab, setTab] = useState<TabId>('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  const trendRef = useRef<HTMLDivElement>(null);

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
    language === 'ru' ? 'сегодня' : language === 'en' ? 'today' : 'azi';

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-28 pt-3 sm:pt-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPh}
          className="w-full rounded-full border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
        />
      </div>

      {/* Category tabs — horizontal scroll */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex items-end gap-5 min-w-max pb-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative pb-2 text-[15px] sm:text-base font-bold capitalize transition-colors ${
                  active
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                {tabLabel(t.id, language)}
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action tiles: Pinterest · 4K · Telegram */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            onPinterest();
            openCustomPinterest();
          }}
          className="flex flex-col justify-between rounded-[20px] bg-[#e11d2e] p-3.5 sm:p-4 text-left text-white min-h-[108px] shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-black">
            P
          </span>
          <span className="mt-3 text-[13px] sm:text-sm font-bold leading-tight">
            {language === 'ru' ? (
              <>
                Повтор
                <br />
                фото
                <span className="block text-[11px] font-medium opacity-90">из Pinterest</span>
              </>
            ) : language === 'en' ? (
              <>
                Replay
                <br />
                photo
                <span className="block text-[11px] font-medium opacity-90">from Pinterest</span>
              </>
            ) : (
              <>
                Refă
                <br />
                foto
                <span className="block text-[11px] font-medium opacity-90">din Pinterest</span>
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            /* 4K upscale — later; for now open create with first template */
            if (filtered[0]) onSelect(filtered[0]);
          }}
          className="flex flex-col justify-between rounded-[20px] bg-white dark:bg-[#161924] border border-slate-100 dark:border-white/10 p-3.5 sm:p-4 text-left min-h-[108px] shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="flex items-center justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">4K</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </span>
          <span className="mt-3 text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {language === 'ru' ? (
              <>
                Улучшить
                <span className="block text-[11px] font-medium text-slate-400">качество</span>
              </>
            ) : language === 'en' ? (
              <>
                Enhance
                <span className="block text-[11px] font-medium text-slate-400">quality</span>
              </>
            ) : (
              <>
                Îmbunătățește
                <span className="block text-[11px] font-medium text-slate-400">calitatea</span>
              </>
            )}
          </span>
        </button>

        <a
          href="https://t.me/aurastudio_help_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col justify-between rounded-[20px] bg-[#3b9eff] p-3.5 sm:p-4 text-left text-white min-h-[108px] shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
            <Send className="h-4 w-4" />
          </span>
          <span className="mt-3 text-[13px] sm:text-sm font-bold leading-tight">
            {language === 'ru' ? (
              <>
                Наш
                <br />
                Telegram
                <span className="block text-[11px] font-medium opacity-90">подписка +1 фото</span>
              </>
            ) : language === 'en' ? (
              <>
                Our
                <br />
                Telegram
                <span className="block text-[11px] font-medium opacity-90">subscribe +1 photo</span>
              </>
            ) : (
              <>
                Telegram
                <br />
                nostru
                <span className="block text-[11px] font-medium opacity-90">abonare +1 foto</span>
              </>
            )}
          </span>
        </a>
      </div>

      {/* Trending carousel */}
      <section>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
          {language === 'ru' ? 'в тренде' : language === 'en' ? 'trending' : 'în trend'}
        </h2>
        <div
          ref={trendRef}
          className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1"
        >
          {trending.map((tmpl) => {
            const name = tmpl.name[lang] || tmpl.name.ro;
            const count = todayCount(tmpl.id);
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onPreview(tmpl)}
                className="relative shrink-0 w-[42vw] max-w-[180px] sm:w-[160px] snap-start overflow-hidden rounded-[18px] bg-slate-200 dark:bg-slate-800 aspect-[3/4] shadow-sm active:scale-[0.98] transition-transform"
              >
                <img
                  src={tmpl.previewImage}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm tabular-nums">
                  🔥 {count.toLocaleString('ru-RU')} {todayWord}
                </span>
                <span className="absolute bottom-0 left-0 right-0 p-2.5 text-left text-[13px] font-bold text-white leading-snug line-clamp-2">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid for current tab */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 capitalize">
          {tabLabel(tab, language)}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((tmpl) => {
              const name = tmpl.name[lang] || tmpl.name.ro;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => onPreview(tmpl)}
                  className="group relative overflow-hidden rounded-[18px] aspect-[3/4] bg-slate-100 dark:bg-slate-800 text-left shadow-sm"
                >
                  <img
                    src={tmpl.previewImage}
                    alt={name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-0 left-0 right-0 p-2.5 text-[13px] font-bold text-white leading-snug line-clamp-2">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
