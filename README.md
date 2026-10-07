# AuraStudio — AI Photo Shoot Studio

> **AuraStudio** (prod: [studio.labupgrade.ai](https://studio.labupgrade.ai)) — full-stack платформа студийных ИИ-фотосессий на Google Gemini.  
> Компания: **Lab Upgrade S.R.L.** (Молдова). Языки: **RO / RU / EN**. Цены на лендинге и в покупках: **только EUR**.

---

## 📌 Текущая стадия (2026-10-07)

**Стадия:** `v1.1 — Photo economy + Profile (PifPaf-style) + Levels by spend`

| Область | Статус |
|--------|--------|
| Core app (React 19 + Vite + Express + Gemini + Supabase) | ✅ |
| Экономика **фото** (не кредиты) | ✅ БД + API + UI |
| Лендинг, тарифы 5 / 10 / 40 фото, EUR | ✅ |
| Профиль (баланс, галерея, библиотека, история, рефералка, удаление) | ✅ UI + API |
| Уровни по сумме покупок € | ✅ UI + SQL; бонусы при `record_purchase_spend` |
| Оплата checkout → confirm/webhook → grant + level | ✅ код; ⏳ живой шлюз |
| Боевой Stripe / Paynet / MAIB | ⏳ |
| Видео (8 фото / 7 сек) | ⏳ позже |
| Недельный бонус уровня 5 (cron) | ⏳ |
| i18n: остатки слова «credite» в старых строках | ⏳ зачистка |

---

## ✅ Что сделано (кратко)

### Продукт и UX
- Лендинг: hero, пакеты **5 / 2.90€ · 10 / 4.90€ · 40 / 11.60€**, «per pack / per pachet», **только EUR**.
- Мобильный header: бургер (язык, тема, профиль); десктоп — горизонтальный ряд.
- Каталог шаблонов, create modal, Pinterest reference, couple mode.
- **Галерея** генераций, **библиотека** исходников, сравнение до/после.
- **Профиль** в стиле PifPaf: бесплатные/купленные, тарифы, фото/видео (видео = 0), сохранённые, история баланса, уровни, рефералка, удаление аккаунта.
- **История баланса** `/app/history` («Куда делись мои фото?») — не модалка тарифов.
- **Уровни** `/app/levels` — детали как у PifPaf; прогресс от **суммы покупок в €**.
- Юридические страницы (privacy / terms / offer) + единый футер с TG-ботом поддержки.
- Auth: регистрация, email confirm (Site URL + `emailRedirectTo`), баннер/блок пока почта не подтверждена.
- Навигация: из профиля → подстраницы с `←` обратно в профиль (`markFromProfile`).

### Экономика (фото)
| Действие | Стоимость |
|----------|-----------|
| Регистрация | +1 фото |
| Обычная генерация | 1 фото |
| 4K | 2 фото |
| Видео 7с | 8 фото (позже) |

Пакеты: `photo_packages` + fallback `src/data/photoPackages.ts`.  
Списание/возврат: RPC `deduct_photos_for_generation`, `refund_photos_for_failed_job`.  
Покупка: `grant_photos_from_purchase` + `record_purchase_spend` (уровни).

### Уровни (пороги EUR)
| Ур. | Сумма покупок | Разовый бонус |
|-----|---------------|---------------|
| 1 | 0 € | — |
| 2 | ≥ 5 € | +1 фото |
| 3 | ≥ 10 € | +2 фото |
| 4 | ≥ 20 € | +3 фото |
| 5 | ≥ 30 € | +5 фото (+ UI: 1 фото/неделя — cron ещё нет) |

### Backend (`server.ts`)
- `/api/generations` — Gemini, атомарное списание фото, refund при ошибке.
- `/api/photos`, `/api/me`, `/api/photo-packages`, `/api/photo-transactions` (если подключено).
- `/api/payments/checkout` | `confirm` | `webhook` — `fulfillPhotoPurchase` (идемпотентно по `external_id`).
- `/api/me/referral`, `/api/me/levels`, `/api/account/delete`.
- Admin: users, adjust photos, templates, jobs.

### База (Supabase)
Применённые / подготовленные миграции (имена в репо/SQL Editor могут отличаться):

| Файл | Суть |
|------|------|
| Базовая схема (FULL_SETUP / 001–002, актуализированная) | profiles, templates, jobs, storage, RLS |
| `003_photos_system` (или эквивалент в проде) | photo_balance, photo_packages, photo_transactions, RPC |
| `004_account_referral_levels` | referral_code, referrals, delete_user_account |
| `005_levels_by_spend` | total_spent_eur, level, level_rewards_claimed, record_purchase_spend, payment_transactions |

**Важно:** экономика — **фото**, не `credit_*`. Старые README/комменты про «кредиты» — устарели.

### Рефералка
- Код в профиле, ссылка `/?ref=CODE`.
- При применении: +1 фото другу и +1 пригласившему (`apply_referral`).
- Бонус % с покупок друга — **ещё не в коде**.

---

## ⏳ Висяки (не забыть)

### Критично для коммерции
1. **Живой платёжный шлюз** (Stripe / Paynet / MAIB)  
   - Сейчас: абстракция `src/services/payments/`, checkout stub без `PAYMENT_GATEWAY_KEY`.  
   - Уже есть: `fulfillPhotoPurchase` → grant + level. Нужно только подключить реальный provider + подпись webhook.
2. **Supabase Auth Site URL / Redirect URLs** = `https://studio.labupgrade.ai` (не localhost) — иначе confirm-письма ломаются.
3. **Проверить, что в проде применены SQL 003–005** (и нет старых credit-only RPC без photo-аналогов).

### Продукт / UX
4. **Видео** — счётчик в профиле есть, генерации нет (8 фото / 7с).  
5. **Уровень 5: «1 фото каждую неделю»** — только текст в UI; нужен cron/Edge Function.  
6. **Перки уровней 3–5** (бесплатный повтор кадра, подсветка аватара, early access, корона) — в UI описаны, логика прав почти не завязана.  
7. **Реферал: бонус с покупок друга** — в тексте профиля обещано, в `grant`/`record_purchase_spend` не начисляется.  
8. **i18n-зачистка** — в переводах/галерее могут остаться «credite» / `creditCost` в редких местах.  
9. **AdminDashboard** — убедиться, что везде «фото», не «кредиты».

### Техдолг
10. **README / docs в репо** долго описывали credit model — этот файл обновлён.  
11. **Оплата после return URL** — фронт должен вызывать `POST /api/payments/confirm` с `externalId` из query (если ещё не сделано в AppContext).  
12. **PAYMENT_TEST_MODE=1** — только стейджинг, не прод.  
13. **PWA / email «фото готово» / LoRA лица** — roadmap, не начато.

### Известные операционные моменты
- Запись в GitHub web editor иногда даёт `File could not be edited` (stale SHA) — refresh или Upload file.  
- Правки без write-access в коннектор: файлы отдаём артефактами, коммит вручную.

---

## 🗺 Roadmap (после висяков)

1. Боевой биллинг EUR + чеки.  
2. Видео-генерация.  
3. Cron недельного бонуса L5 + реальные перки уровней.  
4. Реферал % с покупки друга.  
5. Email: готовая генерация, чек.  
6. PWA.  
7. Опционально: Face LoRA / batch 4–8 кадров.

---

## 🛠 Структура (актуальная)

```
├── server.ts                 # Express + Gemini + payments fulfill + account APIs
├── src/
│   ├── App.tsx               # views: landing, explore, gallery, library, profile, history, levels, legal, admin
│   ├── components/
│   │   ├── LandingView.tsx
│   │   ├── Header.tsx / BottomNav.tsx
│   │   ├── ProfileView.tsx / HistoryView.tsx / LevelsView.tsx
│   │   ├── GalleryView.tsx / PhotoLibraryView.tsx
│   │   ├── CreditPurchaseModal.tsx   # UI покупки фото-пакетов (имя историческое)
│   │   ├── CreatePhotoModal.tsx / AuthModal.tsx / EmailConfirmBanner.tsx
│   │   ├── LegalView.tsx / AdminDashboard.tsx
│   ├── context/AppContext.tsx
│   ├── data/photoPackages.ts
│   ├── lib/
│   │   ├── navigation.ts     # paths + fromProfile
│   │   ├── levels.ts         # пороги и названия уровней
│   │   ├── supabase.ts / supabase-server.ts
│   │   └── legalContent.ts
│   ├── services/payments/    # gateway abstraction (нужен боевой provider)
│   └── i18n/translations.ts
└── supabase/                 # migrations / seed (сверять с тем, что реально в SQL Editor)
```

Маршруты app: `/` · `/app` · `/app/profile` · `/app/history` · `/app/levels` · `/app/gallery` · `/app/library` · `/privacy` · `/terms` · `/offer`

---

## ⚡ Запуск

```bash
npm install
npm run dev          # Express + Vite, порт 3000
npm run build
curl http://localhost:3000/api/health
```

### Env

| Переменная | Назначение |
|------------|------------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Клиент |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | Сервер |
| `GEMINI_API_KEY` | Генерация |
| `APP_URL` | Return URL оплат / redirects (`https://studio.labupgrade.ai`) |
| `PAYMENT_GATEWAY_KEY` | Когда появится боевой шлюз |
| `PAYMENT_TEST_MODE` | `1` только для тестового confirm без провайдера |
| `PORT` | по умолчанию 3000 |

**Supabase Dashboard → Authentication → URL Configuration:** Site URL и Redirect URLs на прод-домен.

---

## 📝 Памятка для продолжения работ

1. Любая фича баланса — только **фото** (`photo_balance`, `photo_transactions`).  
2. После успешной оплаты всегда путь через **`fulfillPhotoPurchase`** (grant + `record_purchase_spend`).  
3. Новые экраны из профиля — `markFromProfile()` + `←` на профиль.  
4. SQL в репо может отставать от того, что уже накатили в SQL Editor — перед правками **сверять живую БД**.  
5. Не урезать файлы при правках: полный файл или явный diff; **новые** файлы помечать явно.

---

## Каталог /app (2026-10-07, вечер)

- `ExploreCatalog`: вкладки, 3 плитки (Pinterest / 4K / Telegram), карусель «в тренде» с бейджем «N СЕГОДНЯ», подпись «листай вправо».
- Клик по синей плитке открывает шит «Подпишись на Telegram». Кнопка ведёт на **https://t.me/aurastudio_help_bot** (потом заменим).
- **НЕ ЗАБЫТЬ:** бонус +1 фото за подписку на Telegram **не начисляется**. Сейчас только ссылка. Нужна проверка подписки (бот / webhook) и идемпотентный grant один раз на аккаунт.
- Бейджи «сегодня» — псевдосчёт от id шаблона, не реальная аналитика.
- 

*AuraStudio · Lab Upgrade S.R.L. · studio.labupgrade.ai*  
*README обновлён: 2026-10-07 — photo economy, profile, levels, payments fulfill path.*
