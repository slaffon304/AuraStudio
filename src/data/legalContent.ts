export type LegalPageId = 'privacy' | 'terms' | 'offer';

export type LegalDoc = {
  title: string;
  effective: string;
  sections: { heading: string; body: string }[];
};

/** Replace all [[PLACEHOLDER]] values before production. */
export const LEGAL: Record<'ro' | 'ru' | 'en', Record<LegalPageId, LegalDoc>> = {
  ru: {
    privacy: {
      title: 'Политика конфиденциальности',
      effective: 'Дата вступления в силу: 01.10.2026',
      sections: [
        {
          heading: '1. Оператор персональных данных',
          body: `Lab Upgrade S.R.L (далее — «Оператор»).
Адрес: ул. Друмул Виилор 14, MD-2009, мун. Кишинэк, Ресрублика Молдова.
Контакты по персональным данным: email info@labupgrade.ai, Telegram-поддержка @aurastudio_help_bot.`
        },
        {
          heading: '2. Какие данные мы собираем',
          body: `2.1. Идентификаторы аккаунта: email, имя, страна и предпочтения, указанные при регистрации.
2.2. Технические данные: IP-адрес, сведения об устройстве и браузере (User-Agent), идентификаторы сессии и cookies, время и параметры обращений.
2.3. Загружаемые пользователем изображения и текстовые подсказки (промпты).
2.4. История генераций и связанные метаданные (шаблон, параметры, статус).
2.5. Данные о платежах: сумма, статус, идентификатор транзакции платёжного провайдера. Реквизиты банковской карты Оператор не получает и не хранит — оплата проходит на стороне платёжного провайдера.`
        },
        {
          heading: '3. Обработка изображений с лицами',
          body: `Загруженные изображения обрабатываются исключительно для выполнения запрошенной генерации. Оператор не использует изображения для биометрической идентификации, распознавания личности или обучения собственных моделей. Изображения могут передаваться провайдерам ИИ-инфраструктуры (см. раздел 6) в объёме, необходимом для запроса.`
        },
        {
          heading: '4. Цели обработки',
          body: `Предоставление доступа к Сервису AuraStudio; генерация визуальных материалов; обработка платежей; поддержка пользователей; безопасность и предотвращение злоупотреблений; исполнение требований применимого законодательства.`
        },
        {
          heading: '5. Правовые основания',
          body: `Согласие пользователя при регистрации и использовании Сервиса; исполнение договора (Публичной оферты); требования применимого законодательства о персональных данных.`
        },
        {
          heading: '6. Кому мы передаём данные',
          body: `Только в объёме, необходимом для работы Сервиса: провайдерам ИИ-генерации (включая Google Gemini / Fall.ai); хостингу и инфраструктуре ([[HOSTING_PROVIDER]]); платёжным провайдерам (MICB,Stripe); сервисам аналитики при их подключении.
Часть провайдеров может находиться за пределами страны Оператора; объём передачи минимально необходимый.`
        },
        {
          heading: '7. Сроки хранения',
          body: `7.1. Исходные изображения пользователя — не дольше [[RETENTION_SOURCE_DAYS]] календарных дней с последней связанной генерации, затем удаляются.
7.2. Результаты генераций — не дольше [[RETENTION_RESULT_DAYS]] календарных дней с создания, затем удаляются. Метаданные (промпт, шаблон, статус) могут храниться дольше в обезличенном виде.
7.3. Данные Учётной записи хранятся, пока аккаунт существует; после удаления — в срок до 30 календарных дней.
7.4. Платёжные данные — в сроки, установленные законом и платёжным провайдером.
7.5. Удаление аккаунта — кнопкой в разделе «Профиль» или запросом на info@labupgrade.ai / @aurastudio_help_bot.`
        },
        {
          heading: '8. Cookies и аналитика',
          body: `Используются строго необходимые cookies для сессии и безопасности. Аналитика (если подключена) обрабатывает обезличенные данные о посещениях. Cookies можно ограничить в настройках браузера.`
        },
        {
          heading: '9. Права пользователя',
          body: `Право получать сведения об обработке данных; требовать уточнения, блокирования или удаления в случаях, предусмотренных законом; отзывать согласие. Запросы: info@labupgrade.ai, с указанием email аккаунта.`
        },
        {
          heading: '10. Безопасность',
          body: `HTTPS/TLS, разграничение доступа, изоляция среды, ограничение сроков хранения сырых данных.`
        },
        {
          heading: '11. Изменения',
          body: `Актуальная редакция публикуется по адресу /privacy на сайте Сервиса с указанием даты. Существенные изменения могут доводиться через интерфейс Сервиса.`
        },
        {
          heading: '12. Связанные документы',
          body: `Условия использования (/terms) и Публичная оферта (/offer) — неотъемлемая часть отношений с пользователем.`
        }
      ]
    },
    terms: {
      title: 'Условия использования',
      effective: 'Дата вступления в силу: 01.10.2026',
      sections: [
        {
          heading: '1. Термины',
          body: `«Оператор» — Lab Upgrade S.R.L.
«Сервис» — AuraStudio, доступный по адресу https://studio.labupgrade.ai.
«Пользователь» — физическое лицо, использующее Сервис.
«Учётная запись» — данные, идентифицирующие Пользователя.
«Контент» — изображения, тексты, промпты и материалы, загружаемые или создаваемые в Сервисе.`
        },
        {
          heading: '2. Описание Сервиса',
          body: `Инструмент генерации визуальных материалов на основе фотографий пользователя, шаблонов и технологий машинного обучения, включая модели сторонних провайдеров.`
        },
        {
          heading: '3. Доступ и Учётная запись',
          body: `3.1. Авторизация — по email и паролю (Supabase Auth) или иным способом, указанным в интерфейсе.
3.2. Использование разрешено лицам, достигшим 18 лет (или с согласия законного представителя, где требуется).
3.3. Пользователь обязан хранить данные доступа в тайне; действия под его аккаунтом считаются его действиями.`
        },
        {
          heading: '4. Оплата и возвраты',
          body: `Платный доступ регулируется Публичной офертой (/offer).`
        },
        {
          heading: '5. Права на Контент',
          body: `5.1. Права на загружаемый Контент сохраняются за Пользователем. Пользователь подтверждает право на загрузку и предоставляет Оператору неисключительную лицензию только для оказания услуг (генерация, передача ИИ-провайдерам, отображение в аккаунте).
5.2. Результаты генерации ИИ Пользователь использует на свой риск; Оператор не претендует на исключительные права на результат.
5.3. Код, дизайн и бренд Сервиса — собственность Оператора.`
        },
        {
          heading: '6. Запрещённый Контент',
          body: `Запрещено: CSAM и любой сексуальный контент с несовершеннолетними; дипфейки без согласия с целью вреда; экстремизм и призывы к насилию; нарушение чужой ИС; обход ограничений, атаки на инфраструктуру. Оператор вправе ограничить доступ при нарушении.`
        },
        {
          heading: '7. Особенности генеративных технологий',
          body: `Результат вероятностный, возможны артефакты и сходство с существующими лицами/работами. Пользователь обязан проверять результат перед публичным или коммерческим использованием.`
        },
        {
          heading: '8. Отказ от гарантий',
          body: `Сервис предоставляется «как есть». Не гарантируется бесперебойность, отсутствие ошибок и пригодность для конкретных целей.`
        },
        {
          heading: '9. Ответственность',
          body: `Оператор не отвечает за упущенную выгоду и косвенные убытки. Совокупный предел — сумма, уплаченная Пользователем за услуги за последние 12 месяцев.`
        },
        {
          heading: '10. Удаление аккаунта',
          body: `Через профиль или запрос на info@labupgrade.ai / @aurastudio_help_bot. Неиспользованные генерации при удалении сгорают без возврата денег, если иное не указано в оферте.`
        },
        {
          heading: '11. Изменения и право',
          body: `Актуальная редакция — /terms. Применимое право: [[GOVERNING_LAW]]. Споры — претензионный порядок, затем суд по месту регистрации Оператора, если иное не требует закон.`
        },
        {
          heading: '12. Контакты',
          body: `[[LEGAL_ENTITY_FULL]]. Адрес: [[LEGAL_ADDRESS]]. Email: info@labupgrade.ai. Telegram: @aurastudio_help_bot.`
        }
      ]
    },
    offer: {
      title: 'Публичная оферта',
      effective: 'Редакция от 01.10.2026, действует с 01.10.2026.',
      sections: [
        {
          heading: '1. Общие положения',
          body: `1.1. Настоящий документ — публичная оферта Lab Upgrade S.R.L о заключении лицензионного договора на использование Сервиса «AuraStudio» (https://studio.labupgrade.ai).
1.2. Акцепт — регистрация/авторизация или оплата тарифа.
1.3. При несогласии с условиями Пользователь обязан прекратить использование Сервиса.`
        },
        {
          heading: '2. Термины',
          body: `«Сервис» — AuraStudio (https://studio.labupgrade.ai), генерация и обработка фото с помощью ИИ.
«Тариф» — пакет фото/доступа за фиксированную плату; актуальные цены в интерфейсе.
«Фото» — единица объёма функционала в рамках тарифа.
«Генерация» — создание изображения по шаблону или референсу.`
        },
        {
          heading: '3. Предмет',
          body: `Правообладатель предоставляет удалённый доступ к Сервису на условиях простой неисключительной лицензии. Платный функционал доступен до израсходования начисленных «фото» по тарифу.`
        },
        {
          heading: '4. Учётная запись',
          body: `Регистрация создаёт Учётную запись. Персональные данные обрабатываются по Политике конфиденциальности (/privacy). Удаление — через профиль или info@labupgrade.ai / @aurastudio_help_bot, срок до 30 календарных дней.`
        },
        {
          heading: '5. Тарифы и оплата',
          body: `5.1. Оплата — 100% авансом через платёжного провайдера (MICB,Stripe).
5.2. Цены и состав пакетов — в интерфейсе на дату оплаты.
5.3. Автопродление не предусмотрено, если не указано иное.
5.4. Чек/подтверждение — на email пользователя при наличии технической возможности.`
        },
        {
          heading: '6. Возвраты',
          body: `Возможны при: списании без активации фото; недоступности Сервиса по вине Оператора более 1 суток; иных объективных основаниях по решению Оператора. Субъективное недовольство качеством результата при соответствии описанию — не основание для возврата. Срок рассмотрения — до 10 календарных дней.`
        },
        {
          heading: '7. Использование «фото»',
          body: `«Фото» не являются деньгами и не подлежат обмену/передаче. Каждая генерация списывает объём согласно тарифу и выбранному режиму. Неиспользованные «фото» при новой покупке обычно сохраняются.`
        },
        {
          heading: '8. Контент и ответственность',
          body: `Пользователь отвечает за загружаемый контент и права третьих лиц. Результаты генерации принадлежат Пользователю в пределах, допускаемых законом; использование — на свой риск. Сервис «как есть».`
        },
        {
          heading: '9. Контакты',
          body: `Lab Upgrade S.R.L. ул. Друмул Виидор 14, MD-2009, мун. Кишинэу, Республика Молдова. info@labupgrade.ai. @aurastudio_help_bot.`
        }
      ]
    }
  },
  ro: {
    privacy: {
      title: 'Politica de confidențialitate',
      effective: 'Data intrării în vigoare: [[EFFECTIVE_DATE]]',
      sections: [
        {
          heading: '1. Operatorul de date',
          body: `[[LEGAL_ENTITY_FULL]] (denumit „Operatorul”).
Adresa: [[LEGAL_ADDRESS]].
Contacte: email [[LEGAL_EMAIL]], Telegram [[SUPPORT_TELEGRAM]].`
        },
        {
          heading: '2. Ce date colectăm',
          body: `2.1. Cont: email, nume, țară, preferințe.
2.2. Date tehnice: IP, dispozitiv, browser, sesiune, cookies.
2.3. Imagini încărcate și prompturi.
2.4. Istoricul generărilor și metadate.
2.5. Plăți: sumă, status, ID tranzacție (fără datele cardului).`
        },
        {
          heading: '3. Imagini cu persoane',
          body: `Doar pentru generarea solicitată. Fără identificare biometrică și fără antrenarea modelelor proprii. Transmitere către provideri AI doar cât este necesar.`
        },
        {
          heading: '4. Scopuri',
          body: `Furnizarea AuraStudio; generare; plăți; suport; securitate; conformitate legală.`
        },
        {
          heading: '5. Temei juridic',
          body: `Consimțământ; executarea contractului (oferta publică); legislația aplicabilă privind datele personale.`
        },
        {
          heading: '6. Destinatari',
          body: `Provideri AI ([[AI_PROVIDERS]]); hosting ([[HOSTING_PROVIDER]]); plăți ([[PAYMENT_PROVIDERS]]); analiză (dacă este activă).`
        },
        {
          heading: '7. Păstrare',
          body: `Imagini sursă: max. [[RETENTION_SOURCE_DAYS]] zile. Rezultate: max. [[RETENTION_RESULT_DAYS]] zile. Cont: pe durata existenței; după ștergere — până la 30 de zile. Ștergere cont: Profil sau [[LEGAL_EMAIL]].`
        },
        {
          heading: '8. Cookies',
          body: `Cookies necesare pentru sesiune. Analitica, dacă e activă, poate fi limitată din browser.`
        },
        {
          heading: '9. Drepturile utilizatorului',
          body: `Acces, rectificare, ștergere, retragerea consimțământului. Cereri: [[LEGAL_EMAIL]].`
        },
        {
          heading: '10. Securitate',
          body: `HTTPS/TLS, control acces, limitarea stocării.`
        },
        {
          heading: '11. Modificări',
          body: `Versiunea actuală: /privacy.`
        },
        {
          heading: '12. Documente conexe',
          body: `/terms și /offer.`
        }
      ]
    },
    terms: {
      title: 'Termeni de utilizare',
      effective: 'Data intrării în vigoare: [[EFFECTIVE_DATE]]',
      sections: [
        {
          heading: '1. Termeni',
          body: `Operator: [[LEGAL_ENTITY_FULL]]. Serviciu: AuraStudio ([[SERVICE_URL]]).`
        },
        {
          heading: '2. Descriere',
          body: `Generare de imagini pe baza fotografiilor utilizatorului și a șabloanelor, inclusiv modele AI terțe.`
        },
        {
          heading: '3. Cont',
          body: `Autentificare email/parolă. Vârsta minimă: [[MIN_AGE]]. Utilizatorul răspunde de confidențialitatea accesului.`
        },
        {
          heading: '4. Plăți',
          body: `Conform ofertei publice (/offer).`
        },
        {
          heading: '5. Conținut',
          body: `Drepturile asupra conținutului încărcat rămân ale utilizatorului. Rezultatele AI se folosesc pe propria răspundere.`
        },
        {
          heading: '6. Interdicții',
          body: `CSAM; deepfake abuziv; extremism; încălcarea IP; atacuri asupra infrastructurii.`
        },
        {
          heading: '7. Tehnologii generative',
          body: `Rezultat probabilistic. Verificați înainte de publicare.`
        },
        {
          heading: '8. Garanții',
          body: `Serviciul „ca atare” (as is).`
        },
        {
          heading: '9. Răspundere',
          body: `Limitată la sumele plătite în ultimele 12 luni.`
        },
        {
          heading: '10. Ștergere cont',
          body: `Din Profil sau [[LEGAL_EMAIL]] / [[SUPPORT_TELEGRAM]].`
        },
        {
          heading: '11. Drept aplicabil',
          body: `[[GOVERNING_LAW]].`
        },
        {
          heading: '12. Contact',
          body: `[[LEGAL_ENTITY_FULL]]. [[LEGAL_EMAIL]]. [[SUPPORT_TELEGRAM]].`
        }
      ]
    },
    offer: {
      title: 'Ofertă publică',
      effective: 'Ediție [[OFFER_REVISION_DATE]], în vigoare de la [[OFFER_START_DATE]].',
      sections: [
        {
          heading: '1. Dispoziții generale',
          body: `Ofertă publică a [[LEGAL_ENTITY_FULL]] pentru AuraStudio ([[SERVICE_URL]]). Acceptare: înregistrare sau plată.`
        },
        {
          heading: '2. Obiect',
          body: `Licență neexclusivă de acces la Serviciu. Pachetele de „foto” conform tarifelor din interfață.`
        },
        {
          heading: '3. Plată',
          body: `Avans 100% prin [[PAYMENT_PROVIDERS]]. Fără reînnoire automată, dacă nu este specificat altfel.`
        },
        {
          heading: '4. Returnări',
          body: `Dacă funcționalitatea nu a fost activată; indisponibilitate > 1 zi din culpa Operatorului; alte motive obiective.`
        },
        {
          heading: '5. Contact',
          body: `[[LEGAL_EMAIL]]. [[SUPPORT_TELEGRAM]].`
        }
      ]
    }
  },
  en: {
    privacy: {
      title: 'Privacy Policy',
      effective: 'Effective date: [[EFFECTIVE_DATE]]',
      sections: [
        {
          heading: '1. Data controller',
          body: `[[LEGAL_ENTITY_FULL]] (“Operator”).
Address: [[LEGAL_ADDRESS]].
Contact: [[LEGAL_EMAIL]], Telegram [[SUPPORT_TELEGRAM]].`
        },
        {
          heading: '2. Data we collect',
          body: `Account identifiers (email, name, country, preferences); technical data (IP, device, cookies); uploaded images and prompts; generation history; payment metadata (no full card numbers).`
        },
        {
          heading: '3. Images of people',
          body: `Processed only to fulfil generation requests. Not used for biometric identification or training our own models. Shared with AI providers only as needed.`
        },
        {
          heading: '4. Purposes',
          body: `Provide AuraStudio; generate content; payments; support; security; legal compliance.`
        },
        {
          heading: '5. Legal bases',
          body: `Consent; performance of the contract (Public Offer); applicable data-protection law.`
        },
        {
          heading: '6. Recipients',
          body: `AI providers ([[AI_PROVIDERS]]); hosting ([[HOSTING_PROVIDER]]); payments ([[PAYMENT_PROVIDERS]]); analytics if enabled.`
        },
        {
          heading: '7. Retention',
          body: `Source images: up to [[RETENTION_SOURCE_DAYS]] days. Results: up to [[RETENTION_RESULT_DAYS]] days. Account data while the account exists; deletion requests via Profile or [[LEGAL_EMAIL]].`
        },
        {
          heading: '8. Cookies',
          body: `Essential cookies for session and security.`
        },
        {
          heading: '9. Your rights',
          body: `Access, rectification, erasure, withdraw consent. Contact [[LEGAL_EMAIL]].`
        },
        {
          heading: '10. Security',
          body: `HTTPS/TLS, access control, limited retention.`
        },
        {
          heading: '11. Changes',
          body: `Current version at /privacy.`
        },
        {
          heading: '12. Related documents',
          body: `/terms and /offer.`
        }
      ]
    },
    terms: {
      title: 'Terms of Use',
      effective: 'Effective date: [[EFFECTIVE_DATE]]',
      sections: [
        {
          heading: '1. Definitions',
          body: `Operator: [[LEGAL_ENTITY_FULL]]. Service: AuraStudio ([[SERVICE_URL]]).`
        },
        {
          heading: '2. Service',
          body: `AI-assisted image generation from user photos and templates.`
        },
        {
          heading: '3. Account',
          body: `Email/password sign-in. Minimum age: [[MIN_AGE]]. Keep credentials confidential.`
        },
        {
          heading: '4. Payments',
          body: `Governed by the Public Offer (/offer).`
        },
        {
          heading: '5. Content',
          body: `You retain rights in uploads; grant us a limited licence to provide the Service. AI outputs are used at your own risk.`
        },
        {
          heading: '6. Prohibited use',
          body: `CSAM; harmful deepfakes; extremism; IP infringement; infrastructure abuse.`
        },
        {
          heading: '7. Generative tech',
          body: `Outputs are probabilistic. Review before public or commercial use.`
        },
        {
          heading: '8. Disclaimer',
          body: `Service provided “as is”.`
        },
        {
          heading: '9. Liability',
          body: `Capped at amounts paid in the last 12 months.`
        },
        {
          heading: '10. Account deletion',
          body: `Via Profile or [[LEGAL_EMAIL]] / [[SUPPORT_TELEGRAM]].`
        },
        {
          heading: '11. Governing law',
          body: `[[GOVERNING_LAW]].`
        },
        {
          heading: '12. Contact',
          body: `[[LEGAL_ENTITY_FULL]]. [[LEGAL_EMAIL]]. [[SUPPORT_TELEGRAM]].`
        }
      ]
    },
    offer: {
      title: 'Public Offer',
      effective: 'Revision [[OFFER_REVISION_DATE]], effective [[OFFER_START_DATE]].',
      sections: [
        {
          heading: '1. General',
          body: `Public offer by [[LEGAL_ENTITY_FULL]] for AuraStudio ([[SERVICE_URL]]). Acceptance: sign-up or payment.`
        },
        {
          heading: '2. Subject',
          body: `Non-exclusive remote access licence. Photo packs per on-site pricing.`
        },
        {
          heading: '3. Payment',
          body: `100% prepayment via [[PAYMENT_PROVIDERS]]. No auto-renewal unless stated.`
        },
        {
          heading: '4. Refunds',
          body: `If credits were not activated; Service downtime > 1 day caused by Operator; other objective grounds.`
        },
        {
          heading: '5. Contact',
          body: `[[LEGAL_EMAIL]]. [[SUPPORT_TELEGRAM]].`
        }
      ]
    }
  }
};
