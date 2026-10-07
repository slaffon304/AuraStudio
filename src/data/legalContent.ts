export type LegalPageId = 'privacy' | 'terms' | 'offer';

export type LegalDoc = {
  title: string;
  effective: string;
  sections: { heading: string; body: string }[];
};

/**
 * AuraStudio legal texts (RO / RU / EN).
 * Operator: Lab Upgrade S.R.L, Republic of Moldova.
 */
export const LEGAL: Record<'ro' | 'ru' | 'en', Record<LegalPageId, LegalDoc>> = {
  ru: {
    privacy: {
      title: 'Политика конфиденциальности',
      effective: 'Дата вступления в силу: 01.10.2026',
      sections: [
        {
          heading: '1. Оператор персональных данных',
          body: `Lab Upgrade S.R.L. (далее — «Оператор»).
Адрес: ул. Друмул Виилор 14, MD-2009, мун. Кишинэу, Республика Молдова.
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
          body: `Предоставление доступа к Сервису AuraStudio; генерация визуальных материалов; обработка платежей; поддержка пользователей; безопасность и предотвращение злоупотреблений; исполнение требований законодательства Республики Молдова, в том числе Закона № 133/2011 «О защите персональных данных».`
        },
        {
          heading: '5. Правовые основания',
          body: `Согласие пользователя при регистрации и использовании Сервиса; исполнение договора (Публичной оферты); требования Закона № 133/2011 «О защите персональных данных» и иных применимых норм права Республики Молдова.`
        },
        {
          heading: '6. Кому мы передаём данные',
          body: `Только в объёме, необходимом для работы Сервиса:
• провайдерам ИИ-генерации (включая Google Gemini и связанные API);
• хостингу и серверной инфраструктуре (серверы и платформа развёртывания, управляемые Оператором);
• платёжным провайдерам (MICB, Stripe);
• сервисам аналитики — только при их подключении.
Часть провайдеров может находиться за пределами Республики Молдова; объём передачи ограничивается минимально необходимым для оказания услуг.`
        },
        {
          heading: '7. Сроки хранения',
          body: `7.1. Исходные изображения пользователя и результаты генераций хранятся в течение срока существования Учётной записи (пока аккаунт активен), поскольку они необходимы для работы галереи, библиотеки и повторного доступа к результатам.
7.2. После удаления Учётной записи файлы пользователя (исходные фото, результаты генераций) и связанные персональные данные удаляются в срок до 30 календарных дней, за исключением данных, которые Оператор обязан хранить по закону (в том числе платёжные и бухгалтерские сведения).
7.3. Метаданные генераций (промпт, шаблон, статус) могут храниться дольше в обезличенном виде для улучшения качества Сервиса.
7.4. Платёжные данные у Оператора — в объёме и сроки, установленные законодательством Республики Молдова и правилами платёжных провайдеров.
7.5. Удаление аккаунта — кнопкой в разделе «Профиль» или запросом на info@labupgrade.ai / @aurastudio_help_bot.`
        },
        {
          heading: '8. Cookies и аналитика',
          body: `Используются строго необходимые cookies для сессии и безопасности. Аналитика (если подключена) обрабатывает обезличенные данные о посещениях. Cookies можно ограничить в настройках браузера.`
        },
        {
          heading: '9. Права пользователя',
          body: `В соответствии с законодательством Республики Молдова Пользователь вправе: получать сведения об обработке своих персональных данных; требовать уточнения, блокирования или удаления данных в предусмотренных законом случаях; отзывать согласие на обработку. Запросы направляются на info@labupgrade.ai с указанием email аккаунта.`
        },
        {
          heading: '10. Безопасность',
          body: `Оператор применяет организационные и технические меры: шифрование передачи данных (HTTPS/TLS), разграничение доступа, изоляцию среды выполнения, ограничение доступа к сырым данным.`
        },
        {
          heading: '11. Изменения',
          body: `Актуальная редакция публикуется по адресу /privacy на сайте Сервиса с указанием даты. Существенные изменения могут доводиться через интерфейс Сервиса.`
        },
        {
          heading: '12. Связанные документы',
          body: `Условия использования (/terms) и Публичная оферта (/offer) являются неотъемлемой частью отношений между Оператором и Пользователем.`
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
          body: `3.1. Авторизация — по email и паролю или иным способом, указанным в интерфейсе.
3.2. Использование Сервиса разрешено лицам, достигшим 18 лет.
3.3. Пользователь обязан хранить данные доступа в тайне; действия под его Учётной записью считаются совершёнными Пользователем.`
        },
        {
          heading: '4. Оплата и возвраты',
          body: `Платный доступ регулируется Публичной офертой (/offer).`
        },
        {
          heading: '5. Права на Контент',
          body: `5.1. Права на загружаемый Контент сохраняются за Пользователем. Пользователь подтверждает право на загрузку и предоставляет Оператору неисключительную лицензию только для оказания услуг (генерация, передача ИИ-провайдерам, отображение в аккаунте).
5.2. Результаты генерации Пользователь использует на свой риск; Оператор не претендует на исключительные права на результат.
5.3. Код, дизайн и бренд Сервиса — собственность Оператора.`
        },
        {
          heading: '6. Запрещённый Контент',
          body: `Запрещено: любой сексуальный контент с участием несовершеннолетних; дипфейки и изображения конкретных лиц без согласия с целью вреда или обмана; экстремизм и призывы к насилию; нарушение прав интеллектуальной собственности; обход ограничений Сервиса и атаки на инфраструктуру. Оператор вправе ограничить или прекратить доступ при нарушении.`
        },
        {
          heading: '7. Особенности генеративных технологий',
          body: `Результат носит вероятностный характер; возможны артефакты и сходство с существующими лицами или произведениями. Пользователь обязан самостоятельно проверять результат перед публичным или коммерческим использованием.`
        },
        {
          heading: '8. Отказ от гарантий',
          body: `Сервис предоставляется «как есть» (as is). Не гарантируются бесперебойная работа, отсутствие ошибок и пригодность результата для конкретных целей.`
        },
        {
          heading: '9. Ответственность',
          body: `Оператор не несёт ответственности за упущенную выгоду, косвенные или случайные убытки. Совокупный предел ответственности Оператора ограничен суммой, фактически уплаченной Пользователем за услуги Сервиса за последние 12 месяцев.`
        },
        {
          heading: '10. Удаление аккаунта',
          body: `Удаление — через раздел «Профиль» или запросом на info@labupgrade.ai / @aurastudio_help_bot. Неиспользованные «фото» (генерации) при удалении аккаунта сгорают; денежные средства за них не возвращаются, если иное прямо не предусмотрено офертой.`
        },
        {
          heading: '11. Изменения и применимое право',
          body: `Актуальная редакция публикуется по адресу /terms.
К настоящим Условиям применяется право Республики Молдова. Споры разрешаются в претензионном порядке (срок ответа — 30 календарных дней). При недостижении согласия — в компетентном суде по месту нахождения Оператора (мун. Кишинэу, Республика Молдова), если иное не предусмотрено императивными нормами закона.`
        },
        {
          heading: '12. Контакты',
          body: `Lab Upgrade S.R.L.
Адрес: ул. Друмул Виилор 14, MD-2009, мун. Кишинэу, Республика Молдова.
Email: info@labupgrade.ai. Telegram: @aurastudio_help_bot.`
        }
      ]
    },
    offer: {
      title: 'Публичная оферта',
      effective: 'Редакция от 01.10.2026, действует с 01.10.2026.',
      sections: [
        {
          heading: '1. Общие положения',
          body: `1.1. Настоящий документ является публичной офертой Lab Upgrade S.R.L. о заключении лицензионного договора на использование Сервиса «AuraStudio» (https://studio.labupgrade.ai).
1.2. Акцептом оферты считается регистрация/авторизация в Сервисе или оплата тарифа.
1.3. При несогласии с условиями Пользователь обязан прекратить использование Сервиса.
1.4. К Соглашению применяется право Республики Молдова.`
        },
        {
          heading: '2. Термины',
          body: `«Сервис» — AuraStudio (https://studio.labupgrade.ai), генерация и обработка фото с помощью ИИ.
«Тариф» — пакет «фото» / доступа за фиксированную плату; актуальные цены — в интерфейсе Сервиса.
«Фото» — единица объёма функционала в рамках тарифа.
«Генерация» — создание изображения по шаблону или референсу.`
        },
        {
          heading: '3. Предмет',
          body: `Правообладатель предоставляет удалённый доступ к Сервису на условиях простой неисключительной лицензии. Платный функционал доступен до израсходования начисленных «фото» по тарифу.`
        },
        {
          heading: '4. Учётная запись',
          body: `Регистрация создаёт Учётную запись. Персональные данные обрабатываются согласно Политике конфиденциальности (/privacy). Удаление — через профиль или info@labupgrade.ai / @aurastudio_help_bot; исполнение — в срок до 30 календарных дней.`
        },
        {
          heading: '5. Тарифы и оплата',
          body: `5.1. Оплата — 100% авансом через платёжного провайдера (MICB, Stripe).
5.2. Цены и состав пакетов определяются интерфейсом Сервиса на дату оплаты.
5.3. Автоматическое продление не предусмотрено, если иное не указано явно.
5.4. Подтверждение оплаты направляется на email пользователя при наличии технической возможности.`
        },
        {
          heading: '6. Возвраты',
          body: `Возврат возможен при: списании средств без активации «фото»; недоступности Сервиса по вине Оператора более 1 календарных суток; иных объективных основаниях по решению Оператора.
Субъективное недовольство качеством результата при соответствии описанию Сервиса не является основанием для возврата.
Срок рассмотрения запроса — до 10 календарных дней.`
        },
        {
          heading: '7. Использование «фото»',
          body: `«Фото» не являются денежными средствами и не подлежат обмену, продаже или передаче третьим лицам. Каждая генерация списывает объём согласно тарифу и выбранному режиму. Неиспользованные «фото» при покупке нового пакета, как правило, сохраняются.`
        },
        {
          heading: '8. Контент и ответственность',
          body: `Пользователь несёт ответственность за загружаемый контент и права третьих лиц. Результаты генерации в пределах, допускаемых законом, принадлежат Пользователю; использование — на свой риск. Сервис предоставляется «как есть».`
        },
        {
          heading: '9. Контакты',
          body: `Lab Upgrade S.R.L.
ул. Друмул Виилор 14, MD-2009, мун. Кишинэу, Республика Молдова.
Email: info@labupgrade.ai. Telegram: @aurastudio_help_bot.`
        }
      ]
    }
  },

  ro: {
    privacy: {
      title: 'Politica de confidențialitate',
      effective: 'Data intrării în vigoare: 01.10.2026',
      sections: [
        {
          heading: '1. Operatorul de date',
          body: `Lab Upgrade S.R.L. (denumit „Operatorul”).
Adresa: str. Drumul Viilor 14, MD-2009, mun. Chișinău, Republica Moldova.
Contacte: email info@labupgrade.ai, Telegram @aurastudio_help_bot.`
        },
        {
          heading: '2. Ce date colectăm',
          body: `2.1. Cont: email, nume, țară, preferințe.
2.2. Date tehnice: IP, dispozitiv, browser, sesiune, cookies.
2.3. Imagini încărcate și prompturi.
2.4. Istoricul generărilor și metadate.
2.5. Plăți: sumă, status, ID tranzacție (fără datele cardului bancar).`
        },
        {
          heading: '3. Imagini cu persoane',
          body: `Procesate doar pentru generarea solicitată. Fără identificare biometrică și fără antrenarea modelelor proprii. Transmitere către provideri AI doar în măsura necesară.`
        },
        {
          heading: '4. Scopuri',
          body: `Furnizarea AuraStudio; generare; plăți; suport; securitate; conformitate cu legislația Republicii Moldova, inclusiv Legea nr. 133/2011 privind protecția datelor cu caracter personal.`
        },
        {
          heading: '5. Temei juridic',
          body: `Consimțământ; executarea contractului (oferta publică); Legea nr. 133/2011 și alte norme aplicabile ale Republicii Moldova.`
        },
        {
          heading: '6. Destinatari',
          body: `Provideri AI (inclusiv Google Gemini); infrastructură de hosting administrată de Operator; plăți (MICB, Stripe); analiză — doar dacă este activată.
Unii provideri pot fi situați în afara Republicii Moldova; volumul transferului este minim necesar.`
        },
        {
          heading: '7. Păstrare',
          body: `7.1. Imaginile sursă și rezultatele generărilor sunt păstrate pe durata existenței Contului (cât timp contul este activ).
7.2. După ștergerea Contului, fișierele și datele personale aferente sunt eliminate în cel mult 30 de zile calendaristice, cu excepția datelor pe care Operatorul este obligat să le păstreze conform legii.
7.3. Metadatele pot fi păstrate mai mult timp în formă anonimizată.
7.4. Ștergerea contului: din Profil sau la info@labupgrade.ai / @aurastudio_help_bot.`
        },
        {
          heading: '8. Cookies',
          body: `Cookies strict necesare pentru sesiune și securitate. Analitica, dacă este activă, poate fi limitată din browser.`
        },
        {
          heading: '9. Drepturile utilizatorului',
          body: `Conform legislației Republicii Moldova: acces, rectificare, ștergere, retragerea consimțământului. Cereri: info@labupgrade.ai.`
        },
        {
          heading: '10. Securitate',
          body: `HTTPS/TLS, control al accesului, izolarea mediului de execuție.`
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
      effective: 'Data intrării în vigoare: 01.10.2026',
      sections: [
        {
          heading: '1. Termeni',
          body: `Operator: Lab Upgrade S.R.L.
Serviciu: AuraStudio (https://studio.labupgrade.ai).`
        },
        {
          heading: '2. Descriere',
          body: `Generare de imagini pe baza fotografiilor utilizatorului și a șabloanelor, inclusiv modele AI terțe.`
        },
        {
          heading: '3. Cont',
          body: `Autentificare prin email/parolă. Vârsta minimă: 18 ani. Utilizatorul răspunde de confidențialitatea accesului.`
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
          body: `Conținut sexual cu minori; deepfake abuziv; extremism; încălcarea drepturilor de proprietate intelectuală; atacuri asupra infrastructurii.`
        },
        {
          heading: '7. Tehnologii generative',
          body: `Rezultat probabilistic. Verificați înainte de publicare sau uz comercial.`
        },
        {
          heading: '8. Garanții',
          body: `Serviciul este furnizat „ca atare” (as is).`
        },
        {
          heading: '9. Răspundere',
          body: `Limitată la sumele plătite în ultimele 12 luni.`
        },
        {
          heading: '10. Ștergere cont',
          body: `Din Profil sau info@labupgrade.ai / @aurastudio_help_bot. Generările nefolosite expiră fără rambursare, dacă oferta nu prevede altfel.`
        },
        {
          heading: '11. Drept aplicabil',
          body: `Se aplică dreptul Republicii Moldova. Litigii: procedură prealabilă (30 de zile), apoi instanța competentă de la sediul Operatorului (mun. Chișinău), dacă legea nu prevede altfel.`
        },
        {
          heading: '12. Contact',
          body: `Lab Upgrade S.R.L., str. Drumul Viilor 14, MD-2009, mun. Chișinău, Republica Moldova.
info@labupgrade.ai · @aurastudio_help_bot`
        }
      ]
    },
    offer: {
      title: 'Ofertă publică',
      effective: 'Ediție 01.10.2026, în vigoare de la 01.10.2026.',
      sections: [
        {
          heading: '1. Dispoziții generale',
          body: `Ofertă publică a Lab Upgrade S.R.L. pentru AuraStudio (https://studio.labupgrade.ai). Acceptare: înregistrare sau plată. Drept aplicabil: Republica Moldova.`
        },
        {
          heading: '2. Obiect',
          body: `Licență neexclusivă de acces la Serviciu. Pachetele de „foto” conform tarifelor din interfață.`
        },
        {
          heading: '3. Plată',
          body: `Avans 100% prin MICB, Stripe. Fără reînnoire automată, dacă nu este specificat altfel.`
        },
        {
          heading: '4. Returnări',
          body: `Dacă funcționalitatea nu a fost activată; indisponibilitate > 1 zi din culpa Operatorului; alte motive obiective. Termen de analiză: până la 10 zile calendaristice.`
        },
        {
          heading: '5. Contact',
          body: `Lab Upgrade S.R.L., str. Drumul Viilor 14, MD-2009, Chișinău.
info@labupgrade.ai · @aurastudio_help_bot`
        }
      ]
    }
  },

  en: {
    privacy: {
      title: 'Privacy Policy',
      effective: 'Effective date: 01.10.2026',
      sections: [
        {
          heading: '1. Data controller',
          body: `Lab Upgrade S.R.L. (“Operator”).
Address: 14 Drumul Viilor St., MD-2009, Chișinău, Republic of Moldova.
Contact: info@labupgrade.ai, Telegram @aurastudio_help_bot.`
        },
        {
          heading: '2. Data we collect',
          body: `Account data (email, name, country, preferences); technical data (IP, device, browser, session, cookies); uploaded images and prompts; generation history; payment metadata (no full card numbers).`
        },
        {
          heading: '3. Images of people',
          body: `Processed only to fulfil generation requests. Not used for biometric identification or training our own models. Shared with AI providers only as needed.`
        },
        {
          heading: '4. Purposes',
          body: `Provide AuraStudio; generate content; payments; support; security; compliance with the laws of the Republic of Moldova, including Law No. 133/2011 on personal data protection.`
        },
        {
          heading: '5. Legal bases',
          body: `Consent; performance of the contract (Public Offer); Law No. 133/2011 and other applicable Moldovan law.`
        },
        {
          heading: '6. Recipients',
          body: `AI providers (including Google Gemini); hosting infrastructure operated by the Operator; payment providers (MICB, Stripe); analytics if enabled.
Some providers may be outside Moldova; transfers are limited to what is necessary.`
        },
        {
          heading: '7. Retention',
          body: `7.1. Source images and generation results are stored for the life of the Account (while the account remains active).
7.2. After account deletion, user files and related personal data are removed within 30 calendar days, except records the Operator must keep by law.
7.3. Metadata may be retained longer in anonymised form.
7.4. Delete account via Profile or info@labupgrade.ai / @aurastudio_help_bot.`
        },
        {
          heading: '8. Cookies',
          body: `Essential cookies for session and security.`
        },
        {
          heading: '9. Your rights',
          body: `Under Moldovan law: access, rectification, erasure, withdraw consent. Contact info@labupgrade.ai.`
        },
        {
          heading: '10. Security',
          body: `HTTPS/TLS, access control, isolated runtime.`
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
      effective: 'Effective date: 01.10.2026',
      sections: [
        {
          heading: '1. Definitions',
          body: `Operator: Lab Upgrade S.R.L.
Service: AuraStudio (https://studio.labupgrade.ai).`
        },
        {
          heading: '2. Service',
          body: `AI-assisted image generation from user photos and templates.`
        },
        {
          heading: '3. Account',
          body: `Email/password sign-in. Minimum age: 18. Keep credentials confidential.`
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
          heading: '7. Generative technology',
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
          body: `Via Profile or info@labupgrade.ai / @aurastudio_help_bot. Unused photo credits expire without refund unless the Offer states otherwise.`
        },
        {
          heading: '11. Governing law',
          body: `Laws of the Republic of Moldova. Disputes: 30-day complaint procedure, then competent court at the Operator’s seat (Chișinău), unless mandatory law requires otherwise.`
        },
        {
          heading: '12. Contact',
          body: `Lab Upgrade S.R.L., 14 Drumul Viilor St., MD-2009, Chișinău, Republic of Moldova.
info@labupgrade.ai · @aurastudio_help_bot`
        }
      ]
    },
    offer: {
      title: 'Public Offer',
      effective: 'Revision 01.10.2026, effective 01.10.2026.',
      sections: [
        {
          heading: '1. General',
          body: `Public offer by Lab Upgrade S.R.L. for AuraStudio (https://studio.labupgrade.ai). Acceptance: sign-up or payment. Governing law: Republic of Moldova.`
        },
        {
          heading: '2. Subject',
          body: `Non-exclusive remote access licence. Photo packs per on-site pricing.`
        },
        {
          heading: '3. Payment',
          body: `100% prepayment via MICB, Stripe. No auto-renewal unless stated.`
        },
        {
          heading: '4. Refunds',
          body: `If credits were not activated; Service downtime > 1 day caused by the Operator; other objective grounds. Review within 10 calendar days.`
        },
        {
          heading: '5. Contact',
          body: `Lab Upgrade S.R.L., 14 Drumul Viilor St., MD-2009, Chișinău.
info@labupgrade.ai · @aurastudio_help_bot`
        }
      ]
    }
  }
};
