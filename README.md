# AuraStudio — Платформа ИИ-Фотосессий (AI Photo Shoot Studio)

> **AuraStudio** — современная полнофункциональная платформа для создания профессиональных студийных фотосессий с помощью генеративного искусственного интеллекта (Google Gemini). Платформа специально адаптирована для аудитории **Молдовы** и **Румынии**, поддерживает региональные локации, мультиязычность (RO, RU, EN) и мультивалютность (MDL, RON, EUR).

---

## 📌 Текущая стадия проекта (Current Stage)

**Стадия:** `v1.0.0 — Production-Ready Core & Hardened Database Architecture (Готовое ядро)`

- ✅ **Архитектура приложения:** Full-Stack (React 19 + Vite + Express + Google GenAI + Supabase).
- ✅ **Безопасность БД:** Уровень Enterprise (RLS, PostgreSQL-триггеры защиты профилей, защита от накрутки кредитов и самопродвижения в админы).
- ✅ **API-ключи:** Полная миграция на современный стандарт Supabase (`VITE_SUPABASE_PUBLISHABLE_KEY` на клиенте и `SUPABASE_SECRET_KEY` на сервере).
- ✅ **ИИ-генерация:** Серверный пайплайн через Google Gemini (`@google/genai`). Ключи не утекают в браузер.
- ⏳ **Что требуется для запуска в продакшн:** Подключение боевой базы данных Supabase и боевых ключей платёжных шлюзов (Paynet / Stripe).

---

## 🚀 Что уже реализовано (Completed Features)

### 1. Пользовательский интерфейс и UX (Frontend)
- **Каталог готовых стилей и фотосессий:**
  - Региональные образы Молдовы и Румынии: *Старый Орхей, Замок Пелеш, Замок Бран, Крикова, Кишинёв*.
  - Мировые тренды: *Old Money Riviera, Street Style Milan Vogue, Golden Hour Rooftop, Business Executive, Romantic Paris, Specialty Coffee*.
- **Мультиязычность (i18n):**
  - Полная поддержка 3 языков с мгновенным переключением: 🇲🇩/🇷🇴 Румынский, 🇷🇺 Русский, 🇬🇧 Английский.
- **Мультивалютность:**
  - Динамическое отображение цен в леях Молдовы (MDL), леях Румынии (RON) и евро (EUR).
- **Мастер создания фотосессии (Creation Modal):**
  - Загрузка личного селфи/портрета с предпросмотром.
  - Выбор формата и соотношения сторон: `3:4` (Instagram/портрет), `1:1` (квадрат), `4:3` (пейзаж), `9:16` (Stories/Reels), `16:9` (горизонтальное).
  - Отображение стоимости в кредитах и проверка баланса.
- **Галерея и библиотека результатов:**
  - Список всех сгенерированных фотографий пользователя.
  - Полноэкранный просмотр, скачивание в высоком разрешении, просмотр метаданных генерации.
- **Панель администратора (Admin Dashboard):**
  - Просмотр всех зарегистрированных пользователей и их статусов.
  - Безопасное начисление и списание кредитов с обязательным указанием причины (аудиторский след).
  - Управление ролями (назначение и снятие прав администратора через серверную процедуру).
  - Добавление, редактирование и деактивация шаблонов фотосессий.
  - Журнал всех заданий генерации в реальном времени.

---

### 2. Серверная часть и ИИ-пайплайн (Backend & AI)
- **Полноценный Express-сервер (`server.ts`):**
  - Интеграция с Vite middleware в режиме разработки и автономный запуск в продакшене.
  - Проксирование всех приватных операций (`/api/generations`, `/api/photos`, `/api/me`, `/api/admin/*`).
- **Google Gemini Generative AI:**
  - Интеграция с актуальным SDK `@google/genai`.
  - Модель генерации изображений: `gemini-3.1-flash-lite-image` / `imagen-3.0-generate-002`.
  - Мультимодальный синтез: передача исходного лица пользователя, объединение с детальным промптом шаблона, негативными промптами и заданным соотношением сторон.
  - Ключ `GEMINI_API_KEY` хранится **строго на сервере** и никогда не передаётся в браузер.
- **Атомарная кредитная логика:**
  - При запуске генерации кредиты списываются мгновенно с блокировкой строки пользователя (`FOR UPDATE`).
  - В случае ошибки генерации ИИ кредиты **автоматически возвращаются** на счёт пользователя с защитой от повторного возврата (`refund_credits_for_failed_job`).

---

### 3. База данных и Безопасность PostgreSQL (Database & Security)
- **Стандарт API-ключей Supabase:**
  - **Клиент:** `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - **Сервер:** `SUPABASE_URL` и `SUPABASE_SECRET_KEY`.
  - Полностью исключены устаревшие ключи `anon` и `service_role`.
- **Защита профилей на уровне ядра БД (`trg_enforce_profile_security`):**
  - Пользователь **ни при каких условиях не может** повысить свою роль до `admin` через SQL или API.
  - Пользователь **не может** изменить свой баланс `credit_balance` напрямую.
  - Пользователь **не может** изменить email в обход Supabase Auth.
  - Любая прямая попытка вызывает исключение PostgreSQL: `SECURITY_VIOLATION`.
- **Row Level Security (RLS):**
  - Таблицы `profiles`, `user_photos`, `generation_jobs`, `generated_images`, `credit_transactions`, `payment_transactions` закрыты строгими политиками.
  - Запрещена прямая вставка фиктивных заданий генерации из браузера — они создаются только сервером.
- **Ограничение прав на хранимые процедуры (RPC Hardening):**
  - Вызовы `deduct_credits_for_generation`, `refund_credits_for_failed_job`, `admin_adjust_credits`, `admin_set_user_role` отозваны у `PUBLIC`, `anon` и `authenticated`.
  - Выполнение разрешено только роли `service_role` (серверному бэкенду).
- **Автоматический тестовый набор (`supabase/tests/security_tests.sql`):**
  - 9 автоматических тестов, подтверждающих блокировку всех векторов атак (самоповышение, накрутка баланса, кража кредитов, подделка почты).

---

### 4. Режим работы при отсутствии ключей (Graceful Degradation)
- При отсутствии реальных ключей Supabase приложение **не падает с ошибками**:
  - Реализован валидатор `isValidHttpUrl`, предотвращающий фатальный сбой SDK `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`.
  - В интерфейсе выводится чёткое предупреждение: `⚠️ Supabase is not configured`.
  - Система **не создаёт** фиктивных пользователей, фальшивых кредитов или ложных успешных генераций.

---

## 📋 Что ещё предстоит сделать (Roadmap / Next Steps)

Ниже перечислены задачи, необходимые для вывода продукта на коммерческий рынок:

### Этап 1: Подключение боевого Supabase (Production DB)
1. **Создать проект** в [Supabase Dashboard](https://supabase.com).
2. **Применить миграции:**
   - Выполнить в SQL Editor файл `supabase/migrations/001_initial_schema.sql`.
   - Выполнить файл `supabase/migrations/002_security_hardening.sql`.
   - Загрузить каталог шаблонов из `supabase/seed.sql`.
3. **Настроить переменные окружения:**
   - Заполнить в `.env` боевые URL и ключи (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`).
4. **Проверить приватные бакеты Storage:**
   - `user-photos` (приватный)
   - `generated-images` (приватный)
5. **Назначить первого администратора:**
   - После первой регистрации в приложении изменить роль пользователя в таблице `profiles`:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
     ```

---

### Этап 2: Интеграция боевых платёжных систем (Billing Integration)
1. **Подключение молдавского шлюза (Paynet / MAIB / VictoriaBank):**
   - Реализовать генерацию платёжной ссылки в `src/services/payments/` для карт Молдовы (MDL).
   - Создать серверный обработчик вебхуков `/api/payments/webhook/paynet` с проверкой цифровой подписи (HMAC/RSA).
2. **Подключение международного шлюза (Stripe / Netopia MobilPay):**
   - Настроить Stripe Checkout для карт Румынии (RON) и Европы (EUR).
   - Обработка вебхука `checkout.session.completed` с атомарным зачислением пакета кредитов через запись в `payment_transactions` и `credit_transactions`.

---

### Этап 3: Расширение ИИ-возможностей (Advanced AI Models)
1. **Персональное обучение лица (Face Model / LoRA):**
   - Добавление опции «Обучить мою персональную модель» (загрузка 10–15 фотографий пользователя в разных ракурсах).
   - Подключение фонового обучения на базе Replicate (Flux LoRA) или fal.ai с сохранением весов для идеального сходства.
2. **Пакетная генерация (Batch Generation):**
   - Возможность сгенерировать 4–8 вариаций выбранного стиля в один клик.

---

### Этап 4: Коммуникации и транзакционные письма (Notifications)
1. **Email-уведомления (Resend / SendGrid / Postmark):**
   - Письмо с подтверждением регистрации и приветственными 15 бесплатными кредитами.
   - Уведомление «Ваша фотосессия готова!» со ссылкой на скачивание.
   - Электронный чек/квитанция об успешной покупке кредитов.

---

### Этап 5: Мобильная адаптация и PWA (Mobile App)
1. **Progressive Web App (PWA):**
   - Регистрация Service Worker для кэширования статики.
   - Манифест `manifest.json` и иконки для установки приложения на домашний экран iPhone/Android.

---

## 🛠 Структура проекта (Project Structure)

```
├── .env.example                  # Шаблон переменных окружения
├── metadata.json                 # Метаданные AI Studio
├── package.json                  # Зависимости и скрипты сборки
├── server.ts                     # Полнофункциональный Express-сервер с Gemini AI
├── vite.config.ts                # Конфигурация сборщика Vite
│
├── src/
│   ├── main.tsx                  # Точка входа React
│   ├── App.tsx                   # Главный контейнер приложения
│   ├── index.css                 # Стили Tailwind CSS
│   │
│   ├── components/               # UI-компоненты
│   │   ├── Header.tsx            # Навигация, баланс кредитов, выбор языка/валюты
│   │   ├── AuthModal.tsx         # Вход и регистрация через Supabase Auth
│   │   ├── CreatePhotoModal.tsx  # Модальное окно загрузки фото и запуска ИИ
│   │   ├── CreditPurchaseModal.tsx # Покупка пакетов кредитов
│   │   ├── TemplateCard.tsx      # Карточка стиля фотосессии
│   │   ├── AdminDashboard.tsx    # Панель управления администратора
│   │   ├── UserGallery.tsx       # Галерея готовых генераций
│   │   └── UserLibrary.tsx       # Библиотека загруженных фото
│   │
│   ├── context/
│   │   └── AppContext.tsx        # Глобальное состояние (пользователь, кредиты, работы)
│   │
│   ├── i18n/
│   │   └── translations.ts       # Локализация на RO, RU, EN
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Клиентский Supabase SDK (только Publishable Key)
│   │   └── supabase-server.ts    # Серверный Supabase SDK (Secret Key)
│   │
│   ├── services/
│   │   ├── providers/            # Абстракция ИИ-провайдеров (Gemini GenAI)
│   │   └── payments/             # Абстракция платёжных шлюзов (Paynet / Stripe)
│   │
│   └── types/
│       └── index.ts              # Интерфейсы TypeScript
│
└── supabase/
    ├── seed.sql                  # Стартовые шаблоны фотосессий и категории
    ├── migrations/
    │   ├── 001_initial_schema.sql     # Полная базовая схема БД и RLS
    │   └── 002_security_hardening.sql # Инкрементальная миграция безопасности
    └── tests/
        └── security_tests.sql         # Автоматические тесты безопасности PostgreSQL
```

---

## ⚡ Запуск и тестирование (Development & Verification)

### Установка зависимостей:
```bash
npm install
```

### Проверка типов (Typecheck):
```bash
npm run lint
# или npx tsc --noEmit
```

### Продакшн-сборка (Build):
```bash
npm run build
```

### Запуск сервера разработки:
```bash
npm run dev
# Запускает Express + Vite на порту 3000
```

### Проверка статуса бэкенда:
```bash
curl http://localhost:3000/api/health
```
*Ответ при корректной работе:*
```json
{
  "status": "ok",
  "time": "2026-10-05T07:00:00.000Z",
  "geminiConfigured": true,
  "supabaseConfigured": false
}
```

---

## 🔒 Переменные окружения (.env)

| Переменная | Среда | Описание |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Frontend & Backend | URL проекта Supabase (`https://xyz.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Публичный ключ Supabase (Publishable Key) |
| `SUPABASE_URL` | Backend (Node.js) | URL проекта Supabase для сервера |
| `SUPABASE_SECRET_KEY` | Backend (Node.js) | Приватный секретный ключ (Secret Key) |
| `GEMINI_API_KEY` | Backend (Node.js) | Ключ Google AI Studio / Gemini API |
| `PORT` | Backend | Порт Express-сервера (по умолчанию 3000) |

---

*AuraStudio — Created for high-fidelity regional and global AI photo generation.*
