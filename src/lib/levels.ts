/** Level system: progress by total purchase amount in EUR (same idea as PifPaf ₽ spend). */

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface LevelDef {
  id: LevelId;
  /** Minimum total spent EUR to reach this level */
  minSpentEur: number;
  /** One-time photo bonus when first reaching this level */
  photoBonus: number;
  name: { ro: string; ru: string; en: string };
  /** Short tag under name for level 1 */
  tag?: { ro: string; ru: string; en: string };
  perks: { ro: string; ru: string; en: string }[];
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    minSpentEur: 0,
    photoBonus: 0,
    name: {
      ro: 'Fotografiez pe telefon',
      ru: 'Снимаю на телефон',
      en: 'Phone shooter'
    },
    tag: { ro: 'start', ru: 'старт', en: 'start' },
    perks: []
  },
  {
    id: 2,
    minSpentEur: 5,
    photoBonus: 1,
    name: {
      ro: 'Fotograf începător',
      ru: 'Начинающий фотограф',
      en: 'Beginner photographer'
    },
    perks: [
      { ro: '+1 foto o singură dată', ru: '+1 фото разово', en: '+1 photo once' },
      { ro: 'Badge în profil', ru: 'Свой бейдж в профиле', en: 'Profile badge' }
    ]
  },
  {
    id: 3,
    minSpentEur: 10,
    photoBonus: 2,
    name: {
      ro: 'Fotograf cu experiență',
      ru: 'Фотограф со стажем',
      en: 'Experienced photographer'
    },
    perks: [
      { ro: '+2 foto o singură dată', ru: '+2 фото разово', en: '+2 photos once' },
      { ro: 'Reîncercare cadru gratuită', ru: 'Бесплатный повтор кадра', en: 'Free frame retry' },
      { ro: 'Avatar evidențiat', ru: 'Подсветка аватара', en: 'Avatar highlight' }
    ]
  },
  {
    id: 4,
    minSpentEur: 20,
    photoBonus: 3,
    name: {
      ro: 'Geniu al fotografiei',
      ru: 'Гений фотографии',
      en: 'Photography genius'
    },
    perks: [
      { ro: '+3 foto o singură dată', ru: '+3 фото разово', en: '+3 photos once' },
      {
        ro: 'Acces early la șabloane noi',
        ru: 'Ранний доступ к новым шаблонам',
        en: 'Early access to new templates'
      }
    ]
  },
  {
    id: 5,
    minSpentEur: 30,
    photoBonus: 5,
    name: {
      ro: 'Zeul ședinței foto',
      ru: 'Бог фотосессии',
      en: 'Photoshoot god'
    },
    perks: [
      { ro: '+5 foto o singură dată', ru: '+5 фото разово', en: '+5 photos once' },
      { ro: '1 foto în fiecare săptămână', ru: '1 фото каждую неделю', en: '1 photo every week' },
      { ro: 'Coroană la avatar', ru: 'Корона у аватара', en: 'Crown on avatar' },
      { ro: 'Tot din nivelurile anterioare', ru: 'Всё из предыдущих уровней', en: 'Everything from previous levels' }
    ]
  }
];

export function levelForSpent(spentEur: number): LevelId {
  let lvl: LevelId = 1;
  for (const L of LEVELS) {
    if (spentEur >= L.minSpentEur) lvl = L.id;
  }
  return lvl;
}

export function nextLevel(current: LevelId): LevelDef | null {
  return LEVELS.find((l) => l.id === current + 1) || null;
}

export function progressToNext(spentEur: number, current: LevelId): { current: number; target: number; pct: number } {
  const next = nextLevel(current);
  if (!next) {
    return { current: spentEur, target: spentEur, pct: 100 };
  }
  const prevMin = LEVELS.find((l) => l.id === current)!.minSpentEur;
  const span = next.minSpentEur - prevMin;
  const done = Math.max(0, spentEur - prevMin);
  const pct = span <= 0 ? 100 : Math.min(100, Math.round((done / span) * 100));
  return { current: spentEur, target: next.minSpentEur, pct };
}
