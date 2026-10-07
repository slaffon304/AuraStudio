export type LegalPageId = 'privacy' | 'terms' | 'offer';

export type LegalDoc = {
  title: string;
  effective: string;
  sections: { heading: string; body: string }[];
};

/**
 * AuraStudio legal texts (RO / RU / EN).
 * Operator: Lab Upgrade S.R.L, Republic of Moldova.
 * Structure adapted from reference policies; company data replaced for AuraStudio.
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
          body: `2.1. Идентификаторы аккаунта: email, имя, страна и предпочтения, указанные при регистрации или авторизации.
2.2. Технические данные: IP-адрес, сведения об устройстве и браузере (User-Agent), идентификаторы сессии и cookies, время и параметры обращений.
2.3. Загружаемые пользователем изображения и текстовые подсказки (промпты).
2.4. История генераций и связанные метаданные (выбранный шаблон, параметры, статус).
2.5. Данные о платежах: сумма, статус, идентификатор транзакции платёжного провайдера. Реквизиты банковской карты Оператор не получает и не хранит — оплата проводится на стороне платёжного провайдера.`
        },
        {
          heading: '3. Обработка изображений с лицами',
          body: `Загруженные изображения обрабатываются исключительно с целью выполнения запрошенной пользователем генерации. Оператор не использует изображения для биометрической идентификации, распознавания личности или обучения собственных моделей. Для генерации изображения передаются провайдерам ИИ-инфраструктуры (см. раздел 6) в объёме, необходимом для выполнения запроса. Сроки хранения — см. раздел 7.`
        },
        {
          heading: '4. Цели обработки',
          body: `Предоставление доступа к Сервису AuraStudio и его функциям; выполнение генерации визуальных материалов; обработка платежей; коммуникация с пользователем по вопросам поддержки; обеспечение безопасности Сервиса и предотвращение злоупотреблений; исполнение требований законодательства Республики Молдова, в том числе Закона № 195/2024 «О защите персональных данных».`
        },
        {
          heading: '5. Правовые основания',
          body: `Согласие пользователя, выраженное при регистрации и использовании Сервиса; исполнение договора (Публичной оферты), стороной которого является пользователь; требования Закона № 195/2024 «О защите персональных данных» и иных применимых нормативных актов Республики Молдова.`
        },
        {
          heading: '6. Кому мы передаём данные',
          body: `Данные передаются третьим лицам только в объёме, необходимом для предоставления Сервиса:
• провайдерам ИИ-генерации (включая Google Gemini и связанные API);
• хостингу и серверной инфраструктуре;
• платёжным провайдерам (MICB, Stripe и иным, указанным в интерфейсе);
• сервисам аналитики — только при их подключении.
Некоторые из провайдеров могут находиться за пределами Республики Молдова; объём передачи ограничивается минимально необходимым для оказания услуг.`
        },
        {
          heading: '7. Сроки хранения',
          body: `7.1. Исходные изображения пользователя и результаты генераций хранятся в течение срока существования Учётной записи (пока аккаунт активен), поскольку они необходимы для работы галереи, библиотеки и повторного доступа к результатам.
7.2. После удаления Учётной записи файлы пользователя (исходные фото, результаты генераций) и связанные персональные данные удаляются в срок до 30 календарных дней, за исключением данных, которые Оператор обязан хранить по закону (в том числе платёжные и бухгалтерские сведения).
7.3. Метаданные генераций (промпт, шаблон, статус) могут храниться дольше в обезличенном виде для улучшения качества Сервиса.
7.4. Платёжные и бухгалтерские данные хранятся в объёме и сроки, установленные законодательством Республики Молдова и правилами платёжных провайдеров.
7.5. Пользователь удаляет Учётную запись самостоятельно — кнопкой в разделе «Профиль» или запросом на info@labupgrade.ai / @aurastudio_help_bot. При удалении неиспользованные оплаченные и бесплатные генерации («фото») сгорают; денежные средства за них не возвращаются, если иное прямо не предусмотрено офертой.`
        },
        {
          heading: '8. Cookies и аналитика',
          body: `8.1. Оператор использует строго необходимые cookies для поддержания сессии и обеспечения безопасности Сервиса.
8.2. Для оценки качества Сервиса и диагностики ошибок может использоваться веб-аналитика (обезличенные данные о посещениях: IP, устройство, браузер, действия на страницах).
8.3. Пользователь вправе ограничить cookies в настройках браузера; при этом отдельные функции Сервиса могут стать недоступны.`
        },
        {
          heading: '9. Права пользователя',
          body: `В соответствии с законодательством Республики Молдова Пользователь вправе: получать сведения об обработке своих персональных данных; требовать уточнения, блокирования или удаления данных в предусмотренных законом случаях; отзывать согласие на обработку; обжаловать действия Оператора в компетентном органе или в судебном порядке. Запросы направляются на info@labupgrade.ai с указанием email аккаунта.`
        },
        {
          heading: '10. Безопасность',
          body: `Оператор применяет организационные и технические меры защиты: шифрование передачи данных (HTTPS/TLS), разграничение доступа, изоляцию среды выполнения, регулярное обновление зависимостей, ограничение хранения сырых данных сроком, необходимым для оказания услуги.`
        },
        {
          heading: '11. Изменения',
          body: `Оператор вправе изменять настоящую Политику. Актуальная редакция публикуется по адресу /privacy на сайте Сервиса с указанием даты вступления в силу. Существенные изменения дополнительно могут доводиться до пользователей через интерфейс Сервиса.`
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
          heading: '1. Термины и определения',
          body: `«Оператор» — Lab Upgrade S.R.L.
«Сервис» — программно-аппаратный комплекс AuraStudio, доступный по адресу https://studio.labupgrade.ai и через сопутствующие интерфейсы.
«Пользователь» — физическое лицо, использующее Сервис.
«Учётная запись» — совокупность данных, идентифицирующих Пользователя в Сервисе.
«Контент» — изображения, тексты, промпты и иные материалы, загружаемые Пользователем или формируемые Сервисом.`
        },
        {
          heading: '2. Описание Сервиса',
          body: `Сервис представляет собой инструмент для генерации визуальных материалов (изображений) на основе пользовательских фотографий, текстовых описаний и шаблонов с использованием технологий машинного обучения, включая модели сторонних провайдеров.`
        },
        {
          heading: '3. Доступ и Учётная запись',
          body: `3.1. Авторизация в Сервисе осуществляется по email и паролю или иным способом, указанным в интерфейсе.
3.2. Использование Сервиса разрешено лицам, достигшим 18 лет. Создавая Учётную запись, Пользователь подтверждает соответствие возрастному ограничению.
3.3. Пользователь обязан обеспечивать конфиденциальность данных доступа к своей Учётной записи. Действия, совершённые с использованием его учётных данных, считаются совершёнными Пользователем.`
        },
        {
          heading: '4. Оплата и возвраты',
          body: `Платный доступ к функциям Сервиса предоставляется в порядке, установленном Публичной офертой (/offer), которая является неотъемлемой частью настоящих Условий.`
        },
        {
          heading: '5. Права на Контент',
          body: `5.1. Исключительные права на загружаемый Пользователем Контент сохраняются за Пользователем. Пользователь подтверждает, что является правообладателем загружаемых изображений и/или изображённым на них лицом либо обладает всеми необходимыми согласиями. Пользователь предоставляет Оператору безвозмездную, неисключительную лицензию на воспроизведение и переработку такого Контента исключительно в целях оказания услуг (выполнение генерации, передача провайдерам ИИ-инфраструктуры, отображение в Учётной записи) на срок хранения соответствующих данных.
5.2. Правовой статус изображений, созданных средствами искусственного интеллекта, может быть не до конца урегулирован применимым правом. Оператор не претендует на какие-либо права в отношении результата генерации; права, которые могут возникнуть на результат в силу творческого вклада Пользователя, принадлежат Пользователю. Пользователь вправе использовать результат любым не запрещённым законом способом, включая коммерческое использование, на свой риск. Оператор не гарантирует возникновение исключительного права на результат и не несёт ответственности за претензии третьих лиц.
5.3. Программный код, дизайн, бренд, торговые обозначения и иные элементы Сервиса являются собственностью Оператора и охраняются законодательством об интеллектуальной собственности.`
        },
        {
          heading: '6. Запрещённый Контент и действия',
          body: `Запрещается использование Сервиса для: создания материалов сексуального характера с участием несовершеннолетних; создания дипфейков и иных изображений конкретных физических лиц без их согласия с целью введения в заблуждение, причинения вреда репутации или совершения мошеннических действий; распространения экстремистских материалов, призывов к насилию, разжиганию ненависти; нарушения прав интеллектуальной собственности третьих лиц; обхода технических ограничений Сервиса, реверс-инжиниринга, автоматизированного съёма контента, попыток нарушить работоспособность инфраструктуры. Оператор вправе ограничить или прекратить доступ к Сервису в случае нарушения.`
        },
        {
          heading: '7. Особенности генеративных технологий',
          body: `Результат работы Сервиса носит вероятностный характер и может содержать неточности, артефакты, а также непреднамеренное сходство с существующими произведениями или реальными лицами. Оператор не гарантирует уникальность результата и не несёт ответственности за последствия его публикации. Пользователь обязан самостоятельно проверять результат перед использованием в публичных или коммерческих целях.`
        },
        {
          heading: '8. Отказ от гарантий',
          body: `Сервис предоставляется по принципу «как есть» (as is). Оператор не гарантирует бесперебойную работу Сервиса, отсутствие ошибок, соответствие конкретным ожиданиям Пользователя и пригодность результата для конкретных целей.`
        },
        {
          heading: '9. Ответственность',
          body: `Оператор не несёт ответственности за упущенную выгоду, косвенные или случайные убытки. Совокупный предел ответственности Оператора ограничен суммой, фактически уплаченной Пользователем за соответствующие услуги в течение последних 12 месяцев, предшествующих дате возникновения требования.`
        },
        {
          heading: '10. Прекращение доступа',
          body: `Оператор вправе приостановить или прекратить доступ Пользователя к Сервису в случае нарушения настоящих Условий, Публичной оферты или требований законодательства, а также в случае возникновения угрозы безопасности Сервиса или иных пользователей.`
        },
        {
          heading: '11. Удаление учётной записи',
          body: `11.1. Пользователь удаляет Учётную запись самостоятельно — кнопкой в разделе «Профиль» или запросом на info@labupgrade.ai / Telegram @aurastudio_help_bot.
11.2. При удалении неиспользованные оплаченные и бесплатные генерации («фото») сгорают, денежные средства за них не возвращаются, если иное прямо не предусмотрено офертой.
11.3. Срок исполнения запроса на удаление — до 30 календарных дней. Платёжные и бухгалтерские документы хранятся в сроки, установленные законом.`
        },
        {
          heading: '12. Изменение условий',
          body: `Оператор вправе вносить изменения в настоящие Условия. Актуальная редакция публикуется по адресу /terms с указанием даты вступления в силу. Продолжение использования Сервиса после публикации новой редакции означает согласие Пользователя с её условиями.`
        },
        {
          heading: '13. Применимое право и споры',
          body: `К настоящим Условиям применяется право Республики Молдова. Споры разрешаются в претензионном порядке (срок ответа — 30 календарных дней с момента получения претензии). При недостижении согласия — в компетентном суде по месту нахождения Оператора (мун. Кишинэу, Республика Молдова), если иное не предусмотрено императивными нормами закона.`
        },
        {
          heading: '14. Контакты Оператора',
          body: `Lab Upgrade S.R.L.
Адрес: ул. Друмул Виилор 14, MD-2009, мун. Кишинэу, Республика Молдова.
Email: info@labupgrade.ai. Telegram-поддержка: @aurastudio_help_bot.`
        }
      ]
    },
    offer: {
      title: 'Публичная оферта',
      effective: 'Редакция от 01.10.2026, действует с 01.10.2026.',
      sections: [
        {
          heading: '1. Общие положения',
          body: `1.1. Настоящий документ является предложением (публичной офертой) Lab Upgrade S.R.L. о заключении лицензионного договора о предоставлении права использования Сервиса «AuraStudio» (https://studio.labupgrade.ai) любому дееспособному лицу, которое начнёт использование Сервиса на условиях настоящей оферты (далее — Соглашение).
1.2. Пользователь считается принявшим Соглашение в полном объёме без оговорок с момента регистрации/авторизации в Сервисе или оплаты тарифа.
1.3. При несогласии с условиями Пользователь обязан прекратить использование Сервиса; Соглашение не заключается.
1.4. К Соглашению применяется право Республики Молдова.`
        },
        {
          heading: '2. Термины',
          body: `«Сервис» — AuraStudio (https://studio.labupgrade.ai), генерация и обработка фото с помощью ИИ.
«Правообладатель» / «Оператор» — Lab Upgrade S.R.L.
«Тариф» — пакет «фото» / доступа за фиксированную плату; актуальные цены — в интерфейсе Сервиса.
«Фото» — условная единица объёма функционала в рамках тарифа.
«Генерация» — создание изображения по шаблону или референсу с использованием ИИ.
«Учётная запись» — данные Пользователя, необходимые для идентификации и доступа к Сервису.`
        },
        {
          heading: '3. Предмет',
          body: `3.1. Правообладатель предоставляет Пользователю удалённый доступ к Сервису на условиях простой неисключительной лицензии, без права сублицензирования, без ограничения по территории.
3.2. Акцепт: авторизация в Сервисе или оплата лицензионного вознаграждения по выбранному тарифу.
3.3. Платный функционал доступен до израсходования начисленных «фото» по тарифу. Срок использования платного функционала не ограничен при наличии неиспользованных «фото».
3.4. Правообладатель вправе изменять условия пробного (бесплатного) функционала без предварительного уведомления.`
        },
        {
          heading: '4. Учётная запись',
          body: `4.1. Регистрация создаёт Учётную запись. Персональные данные обрабатываются согласно Политике конфиденциальности (/privacy).
4.2. Пользователь несёт ответственность за сохранность данных доступа и за действия под своей Учётной записью.
4.3. Удаление — через профиль или запрос на info@labupgrade.ai / @aurastudio_help_bot; исполнение — в срок до 30 календарных дней.
4.4. При удалении неиспользованные «фото» сгорают без денежного возврата, если иное не предусмотрено офертой.`
        },
        {
          heading: '5. Тарифы и оплата',
          body: `5.1. Оплата — 100% авансом через платёжного провайдера (MICB, Stripe или иной, указанный в интерфейсе).
5.2. Цены и состав пакетов определяются интерфейсом Сервиса на дату оплаты.
5.3. Автоматическое продление и автосписание не предусмотрены, если иное не указано явно.
5.4. Подтверждение оплаты (чек/квитанция) направляется на email пользователя при наличии технической возможности.
5.5. Удаление Учётной записи само по себе не прекращает оплаченный тариф и не является основанием для возврата средств.`
        },
        {
          heading: '6. Возвраты',
          body: `6.1. Возврат возможен при: списании средств без активации «фото»; недоступности Сервиса по вине Оператора более 1 календарных суток; иных объективных основаниях по решению Оператора (в т.ч. несанкционированное списание).
6.2. Субъективное недовольство качеством результата при соответствии описанию Сервиса не является основанием для возврата.
6.3. При техническом сбое генерации на стороне Оператора Пользователь вправе запросить начисление «фото» за несостоявшуюся операцию.
6.4. Срок рассмотрения запроса на возврат — до 10 календарных дней.`
        },
        {
          heading: '7. Порядок использования',
          body: `7.1. Единицей учёта объёма функционала является «фото». Количество определяется тарифом.
7.2. «Фото» не являются денежными средствами, электронными деньгами или криптовалютой, не подлежат обмену, продаже или передаче третьим лицам.
7.3. Каждая генерация списывает определённое количество «фото» в зависимости от шаблона.
7.4. При оформлении нового тарифа ранее начисленные и неиспользованные «фото» сохраняются.`
        },
        {
          heading: '8. Права на контент и ограничение ответственности',
          body: `8.1. Права на загружаемые Пользователем изображения сохраняются за Пользователем; Оператор использует их на праве простой неисключительной лицензии только для исполнения Соглашения.
8.2. Результаты генерации принадлежат Пользователю; он использует их на свой риск.
8.3. Оператор не модерирует загружаемый контент заранее и не гарантирует уникальность или соответствие результата ожиданиям.
8.4. Сервис предоставляется «как есть». Оператор не несёт ответственности за убытки от использования или невозможности использования Сервиса, за сбои инфраструктуры третьих лиц и за претензии третьих лиц в связи с результатами генерации.`
        },
        {
          heading: '9. Ограничения использования',
          body: `Запрещается: воспроизводить, модифицировать или создавать производные продукты на базе Сервиса; обходить технические ограничения; извлекать исходный код; регистрироваться от имени другого лица; использовать автоматические средства массового сбора данных; нарушать работоспособность инфраструктуры; перепродавать доступ к Сервису третьим лицам.`
        },
        {
          heading: '10. Споры и форс-мажор',
          body: `Споры разрешаются путём переговоров, затем в претензионном порядке (ответ — 30 календарных дней). При недостижении согласия — в компетентном суде по месту нахождения Оператора (мун. Кишинэу). Стороны освобождаются от ответственности при обстоятельствах непреодолимой силы.`
        },
        {
          heading: '11. Изменение и расторжение',
          body: `Оператор вправе изменять условия Соглашения путём публикации новой редакции по адресу /offer (кроме условий уже оплаченного и не полностью использованного тарифа). Продолжение использования означает согласие. При нарушении Пользователем условий Оператор вправе расторгнуть Соглашение и заблокировать доступ.`
        },
        {
          heading: '12. Контакты',
          body: `Lab Upgrade S.R.L.
Адрес: ул. Друмул Виилор 14, MD-2009, мун. Кишинэу, Республика Молдова.
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
          heading: '1. Operatorul de date cu caracter personal',
          body: `Lab Upgrade S.R.L. (denumit în continuare „Operatorul”).
Adresa: str. Drumul Viilor 14, MD-2009, mun. Chișinău, Republica Moldova.
Contacte pentru date personale: email info@labupgrade.ai, suport Telegram @aurastudio_help_bot.`
        },
        {
          heading: '2. Ce date colectăm',
          body: `2.1. Identificatori de cont: email, nume, țară și preferințe indicate la înregistrare sau autentificare.
2.2. Date tehnice: adresă IP, informații despre dispozitiv și browser (User-Agent), identificatori de sesiune și cookies, timpul și parametrii cererilor.
2.3. Imagini încărcate de utilizator și prompturi text.
2.4. Istoricul generărilor și metadatele asociate (șablon, parametri, status).
2.5. Date de plată: sumă, status, identificatorul tranzacției furnizorului de plăți. Datele cardului bancar nu sunt primite și nu sunt stocate de Operator — plata se face la furnizorul de plăți.`
        },
        {
          heading: '3. Prelucrarea imaginilor cu fețe',
          body: `Imaginile încărcate sunt prelucrate exclusiv pentru executarea generării solicitate. Operatorul nu folosește imaginile pentru identificare biometrică, recunoaștere a persoanei sau antrenarea propriilor modele. Pentru generare, imaginile pot fi transmise furnizorilor de infrastructură AI (secțiunea 6) în volumul necesar. Termenele de stocare — secțiunea 7.`
        },
        {
          heading: '4. Scopurile prelucrării',
          body: `Furnizarea accesului la Serviciul AuraStudio; generarea materialelor vizuale; procesarea plăților; suportul utilizatorilor; securitatea Serviciului și prevenirea abuzurilor; respectarea legislației Republicii Moldova, inclusiv Legea nr. 195/2024 privind protecția datelor cu caracter personal.`
        },
        {
          heading: '5. Temeiuri juridice',
          body: `Consimțământul utilizatorului la înregistrare și utilizare; executarea contractului (Oferta publică); Legea nr. 195/2024 și alte norme aplicabile ale Republicii Moldova.`
        },
        {
          heading: '6. Cui transmitem datele',
          body: `Doar în volumul necesar pentru Serviciu:
• furnizorilor de generare AI (inclusiv Google Gemini);
• hosting și infrastructură server;
• furnizorilor de plăți (MICB, Stripe etc.);
• servicii de analiză — doar dacă sunt activate.
Unii furnizori pot fi situați în afara Republicii Moldova; volumul transmiterii este minim necesar.`
        },
        {
          heading: '7. Termene de stocare',
          body: `7.1. Imaginile sursă și rezultatele generărilor sunt stocate pe durata existenței Contului (cât timp contul este activ), pentru galerie, bibliotecă și reutilizare.
7.2. După ștergerea Contului, fișierele utilizatorului și datele personale asociate se șterg în cel mult 30 de zile calendaristice, cu excepția datelor pe care Operatorul este obligat să le păstreze legal (inclusiv plăți și contabilitate).
7.3. Metadatele generărilor pot fi păstrate mai mult timp în formă anonimizată pentru îmbunătățirea Serviciului.
7.4. Datele de plată — conform legislației Republicii Moldova și regulilor furnizorilor de plăți.
7.5. Ștergerea contului — din secțiunea „Profil” sau prin cerere la info@labupgrade.ai / @aurastudio_help_bot. Generările neutilizate („foto”) se pierd; sumele plătite nu se returnează, dacă Oferta nu prevede altfel.`
        },
        {
          heading: '8. Cookies și analiză',
          body: `Se folosesc cookies strict necesare pentru sesiune și securitate. Analitica (dacă este activată) prelucrează date anonimizate despre vizite. Cookies pot fi limitate din setările browserului.`
        },
        {
          heading: '9. Drepturile utilizatorului',
          body: `Conform legislației Republicii Moldova, utilizatorul poate: obține informații despre prelucrarea datelor; solicita rectificarea, blocarea sau ștergerea; retrage consimțământul; contesta acțiunile Operatorului. Cererile se trimit la info@labupgrade.ai cu indicarea email-ului contului.`
        },
        {
          heading: '10. Securitate',
          body: `Măsuri organizatorice și tehnice: criptare HTTPS/TLS, controlul accesului, izolarea mediului de execuție, actualizarea dependențelor, limitarea stocării datelor brute la perioada necesară serviciului.`
        },
        {
          heading: '11. Modificări',
          body: `Versiunea actuală este publicată la /privacy cu data intrării în vigoare. Modificările esențiale pot fi comunicate prin interfața Serviciului.`
        },
        {
          heading: '12. Documente conexe',
          body: `Termenii de utilizare (/terms) și Oferta publică (/offer) fac parte integrantă din relația dintre Operator și Utilizator.`
        }
      ]
    },
    terms: {
      title: 'Termeni de utilizare',
      effective: 'Data intrării în vigoare: 01.10.2026',
      sections: [
        {
          heading: '1. Termeni și definiții',
          body: `„Operator” — Lab Upgrade S.R.L.
„Serviciu” — complexul software-hardware AuraStudio, disponibil la https://studio.labupgrade.ai.
„Utilizator” — persoană fizică care folosește Serviciul.
„Cont” — datele care identifică Utilizatorul în Serviciu.
„Conținut” — imagini, texte, prompturi și materiale încărcate sau generate în Serviciu.`
        },
        {
          heading: '2. Descrierea Serviciului',
          body: `Instrument de generare a materialelor vizuale pe baza fotografiilor utilizatorului, a șabloanelor și a tehnologiilor de învățare automată, inclusiv modele ale unor furnizori terți.`
        },
        {
          heading: '3. Acces și Cont',
          body: `3.1. Autentificarea se face prin email și parolă sau alt mod indicat în interfață.
3.2. Utilizarea este permisă persoanelor care au împlinit 18 ani.
3.3. Utilizatorul trebuie să păstreze confidențialitatea datelor de acces; acțiunile sub Contul său se consideră făcute de el.`
        },
        {
          heading: '4. Plată și returnări',
          body: `Accesul plătit este reglementat de Oferta publică (/offer).`
        },
        {
          heading: '5. Drepturi asupra Conținutului',
          body: `5.1. Drepturile asupra Conținutului încărcat rămân la Utilizator. Utilizatorul confirmă dreptul de a încărca și acordă Operatorului o licență neexclusivă, gratuită, doar pentru prestarea serviciilor (generare, transmitere către furnizorii AI, afișare în cont).
5.2. Rezultatele generării sunt folosite de Utilizator pe propriul risc; Operatorul nu pretinde drepturi exclusive asupra rezultatului.
5.3. Codul, designul și brandul Serviciului aparțin Operatorului.`
        },
        {
          heading: '6. Conținut și acțiuni interzise',
          body: `Este interzis: orice conținut sexual cu minori; deepfake-uri și imagini ale unor persoane concrete fără consimțământ, în scop de înșelăciune sau prejudiciu; extremism și îndemnuri la violență; încălcarea drepturilor de proprietate intelectuală; ocolirea limitărilor tehnice, reverse engineering, scraping automat, atacuri asupra infrastructurii. Operatorul poate restricționa sau închide accesul în caz de încălcare.`
        },
        {
          heading: '7. Particularitățile tehnologiilor generative',
          body: `Rezultatul are caracter probabilistic; pot apărea artefacte și similitudini cu persoane sau opere existente. Utilizatorul trebuie să verifice rezultatul înainte de utilizare publică sau comercială.`
        },
        {
          heading: '8. Excluderea garanțiilor',
          body: `Serviciul este furnizat „ca atare” (as is). Nu se garantează funcționarea neîntreruptă, absența erorilor sau potrivirea rezultatului cu așteptările concrete.`
        },
        {
          heading: '9. Răspundere',
          body: `Operatorul nu răspunde pentru profitul nerealizat, daune indirecte sau accidentale. Limita totală a răspunderii este suma efectiv plătită de Utilizator pentru servicii în ultimele 12 luni.`
        },
        {
          heading: '10. Încetarea accesului',
          body: `Operatorul poate suspenda sau închide accesul în caz de încălcare a Termenilor, Ofertei sau legii, ori în caz de amenințare la securitatea Serviciului sau a altor utilizatori.`
        },
        {
          heading: '11. Ștergerea contului',
          body: `11.1. Ștergerea se face din „Profil” sau prin cerere la info@labupgrade.ai / @aurastudio_help_bot.
11.2. Generările („foto”) neutilizate se pierd; sumele nu se returnează dacă Oferta nu prevede altfel.
11.3. Termen de executare a cererii — până la 30 de zile calendaristice.`
        },
        {
          heading: '12. Modificarea termenilor',
          body: `Versiunea actuală se publică la /terms. Continuarea utilizării după publicare înseamnă acceptarea noii redacții.`
        },
        {
          heading: '13. Legea aplicabilă și litigii',
          body: `Se aplică dreptul Republicii Moldova. Litigiile se soluționează pe cale de reclamație (răspuns în 30 de zile calendaristice). În lipsă de acord — la instanța competentă de la sediul Operatorului (mun. Chișinău), dacă legea imperativă nu prevede altfel.`
        },
        {
          heading: '14. Contacte',
          body: `Lab Upgrade S.R.L.
Adresa: str. Drumul Viilor 14, MD-2009, mun. Chișinău, Republica Moldova.
Email: info@labupgrade.ai. Telegram: @aurastudio_help_bot.`
        }
      ]
    },
    offer: {
      title: 'Ofertă publică',
      effective: 'Redacție 01.10.2026, în vigoare de la 01.10.2026.',
      sections: [
        {
          heading: '1. Dispoziții generale',
          body: `1.1. Prezentul document este oferta publică a Lab Upgrade S.R.L. pentru încheierea contractului de licență privind utilizarea Serviciului „AuraStudio” (https://studio.labupgrade.ai).
1.2. Acceptarea: înregistrare/autentificare sau plata tarifului.
1.3. La dezacord, Utilizatorul trebuie să înceteze utilizarea.
1.4. Legea aplicabilă: Republica Moldova.`
        },
        {
          heading: '2. Termeni',
          body: `„Serviciu” — AuraStudio; „Tarif” — pachet de „foto” / acces la preț fix; „Foto” — unitate de volum funcțional; „Generare” — creare de imagine pe șablon sau referință cu AI.`
        },
        {
          heading: '3. Obiect',
          body: `Licență simplă neexclusivă de acces la distanță. Funcționalul plătit este disponibil până la consumarea „foto” din tarif.`
        },
        {
          heading: '4. Cont',
          body: `Datele personale — conform Politicii de confidențialitate (/privacy). Ștergerea — din profil sau info@labupgrade.ai / @aurastudio_help_bot, în cel mult 30 de zile. „Foto” neutilizate se pierd fără returnare bănească, dacă Oferta nu prevede altfel.`
        },
        {
          heading: '5. Tarife și plată',
          body: `Plată 100% în avans prin MICB, Stripe sau alt furnizor din interfață. Fără reînnoire automată, dacă nu este indicat explicit. Prețurile din interfață la data plății prevalează.`
        },
        {
          heading: '6. Returnări',
          body: `Posibile dacă: banii au fost retrași fără activarea „foto”; Serviciul a fost indisponibil din vina Operatorului peste 1 zi calendaristică; alte motive obiective. Examinare în cel mult 10 zile calendaristice. Nemulțumirea subiectivă față de rezultat nu justifică returnarea.`
        },
        {
          heading: '7. Utilizare',
          body: `„Foto” nu sunt bani electronici și nu pot fi vândute sau transferate. Fiecare generare consumă un număr de „foto”. La un tarif nou, „foto” neutilizate se păstrează.`
        },
        {
          heading: '8. Conținut și răspundere',
          body: `Drepturile asupra imaginilor încărcate rămân la Utilizator. Rezultatele generării îi aparțin Utilizatorului, pe propriul risc. Serviciul este „ca atare”. Operatorul nu răspunde pentru daune din utilizare sau indisponibilitate, nici pentru pretențiile terților legate de rezultate.`
        },
        {
          heading: '9. Restricții',
          body: `Interzis: copierea/modificarea Serviciului, ocolirea limitărilor, extragerea codului, înregistrarea pe numele altuia, scraping automat, atacuri, revânzarea accesului.`
        },
        {
          heading: '10. Litigii',
          body: `Negocieri, apoi reclamație (30 de zile). Apoi instanța de la sediul Operatorului (Chișinău). Forță majoră exonerează părțile.`
        },
        {
          heading: '11. Modificare și reziliere',
          body: `Operatorul poate modifica Oferta prin publicare la /offer (cu excepția tarifului deja plătit și neconsumat integral). Continuarea utilizării = acceptare. La încălcare, Operatorul poate bloca accesul.`
        },
        {
          heading: '12. Contact',
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
          heading: '1. Personal data controller',
          body: `Lab Upgrade S.R.L. (the “Operator”).
Address: 14 Drumul Viilor St., MD-2009, Chișinău, Republic of Moldova.
Data protection contacts: email info@labupgrade.ai, Telegram support @aurastudio_help_bot.`
        },
        {
          heading: '2. Data we collect',
          body: `2.1. Account identifiers: email, name, country and preferences provided at registration or sign-in.
2.2. Technical data: IP address, device and browser information (User-Agent), session IDs and cookies, time and request parameters.
2.3. User-uploaded images and text prompts.
2.4. Generation history and related metadata (template, parameters, status).
2.5. Payment data: amount, status, payment-provider transaction ID. Card details are not received or stored by the Operator — payment is processed by the payment provider.`
        },
        {
          heading: '3. Processing of images containing faces',
          body: `Uploaded images are processed solely to perform the requested generation. The Operator does not use images for biometric identification, person recognition or training its own models. Images may be sent to AI infrastructure providers (section 6) to the extent necessary. Retention — section 7.`
        },
        {
          heading: '4. Purposes of processing',
          body: `Providing access to AuraStudio; generating visual materials; processing payments; user support; security and abuse prevention; compliance with the laws of the Republic of Moldova, including Law No. 195/2024 on personal data protection.`
        },
        {
          heading: '5. Legal bases',
          body: `User consent at registration and use; performance of the contract (Public Offer); Law No. 195/2024 and other applicable rules of the Republic of Moldova.`
        },
        {
          heading: '6. Who we share data with',
          body: `Only as needed for the Service:
• AI generation providers (including Google Gemini);
• hosting and server infrastructure;
• payment providers (MICB, Stripe, etc.);
• analytics services — only if enabled.
Some providers may be outside the Republic of Moldova; transfer is limited to what is strictly necessary.`
        },
        {
          heading: '7. Retention',
          body: `7.1. Source images and generation results are kept for the life of the Account (while the account is active) for gallery, library and reuse.
7.2. After account deletion, user files and related personal data are deleted within 30 calendar days, except data the Operator must keep by law (including payment and accounting records).
7.3. Generation metadata may be retained longer in anonymised form to improve the Service.
7.4. Payment data — as required by Moldova law and payment-provider rules.
7.5. Account deletion via Profile or request to info@labupgrade.ai / @aurastudio_help_bot. Unused paid and free generations (“photos”) are forfeited; no cash refund unless the Offer expressly provides otherwise.`
        },
        {
          heading: '8. Cookies and analytics',
          body: `Strictly necessary cookies for session and security. Analytics (if enabled) process anonymised visit data. Cookies may be limited in browser settings.`
        },
        {
          heading: '9. User rights',
          body: `Under Moldova law the user may: obtain information about processing; request rectification, blocking or deletion where the law allows; withdraw consent; challenge the Operator’s actions. Requests: info@labupgrade.ai with account email.`
        },
        {
          heading: '10. Security',
          body: `Organisational and technical measures: HTTPS/TLS encryption, access control, execution isolation, dependency updates, limiting raw-data retention to the period needed for the service.`
        },
        {
          heading: '11. Changes',
          body: `Current version is published at /privacy with the effective date. Material changes may be communicated via the Service interface.`
        },
        {
          heading: '12. Related documents',
          body: `Terms of Use (/terms) and Public Offer (/offer) form an integral part of the relationship between the Operator and the User.`
        }
      ]
    },
    terms: {
      title: 'Terms of Use',
      effective: 'Effective date: 01.10.2026',
      sections: [
        {
          heading: '1. Definitions',
          body: `“Operator” — Lab Upgrade S.R.L.
“Service” — the AuraStudio software/hardware complex at https://studio.labupgrade.ai.
“User” — a natural person using the Service.
“Account” — data identifying the User in the Service.
“Content” — images, texts, prompts and materials uploaded or generated in the Service.`
        },
        {
          heading: '2. Description of the Service',
          body: `A tool for generating visual materials from user photos, templates and machine-learning technologies, including third-party models.`
        },
        {
          heading: '3. Access and Account',
          body: `3.1. Sign-in via email and password or another method shown in the interface.
3.2. Use is allowed for persons aged 18 or over.
3.3. The User must keep access credentials confidential; actions under the Account are deemed the User’s.`
        },
        {
          heading: '4. Payment and refunds',
          body: `Paid access is governed by the Public Offer (/offer).`
        },
        {
          heading: '5. Rights in Content',
          body: `5.1. Rights in uploaded Content remain with the User. The User confirms authority to upload and grants the Operator a free non-exclusive licence solely to provide the services (generation, transfer to AI providers, display in the account).
5.2. Generation results are used by the User at their own risk; the Operator claims no exclusive rights in the result.
5.3. Code, design and brand of the Service belong to the Operator.`
        },
        {
          heading: '6. Prohibited content and conduct',
          body: `Prohibited: any sexual content involving minors; deepfakes and images of specific persons without consent for deception or harm; extremism and incitement to violence; infringement of third-party IP; bypassing technical limits, reverse engineering, automated scraping, attacks on infrastructure. The Operator may restrict or terminate access upon breach.`
        },
        {
          heading: '7. Generative technology',
          body: `Results are probabilistic and may contain artefacts or unintended resemblance to existing works or real persons. The User must review results before public or commercial use.`
        },
        {
          heading: '8. Disclaimer of warranties',
          body: `The Service is provided “as is”. No warranty of uninterrupted operation, freedom from errors, or fitness for a particular purpose.`
        },
        {
          heading: '9. Liability',
          body: `The Operator is not liable for lost profits or indirect or incidental damages. Aggregate liability is capped at amounts actually paid by the User for the Service in the preceding 12 months.`
        },
        {
          heading: '10. Suspension of access',
          body: `The Operator may suspend or terminate access for breach of these Terms, the Offer or applicable law, or where the security of the Service or other users is threatened.`
        },
        {
          heading: '11. Account deletion',
          body: `11.1. Via Profile or request to info@labupgrade.ai / @aurastudio_help_bot.
11.2. Unused paid and free generations (“photos”) are forfeited; no cash refund unless the Offer expressly provides otherwise.
11.3. Deletion requests are completed within 30 calendar days.`
        },
        {
          heading: '12. Changes to the Terms',
          body: `The current version is published at /terms. Continued use after publication means acceptance of the new version.`
        },
        {
          heading: '13. Governing law and disputes',
          body: `Laws of the Republic of Moldova. Disputes: 30-day complaint procedure, then competent court at the Operator’s seat (Chișinău), unless mandatory law requires otherwise.`
        },
        {
          heading: '14. Contact',
          body: `Lab Upgrade S.R.L.
14 Drumul Viilor St., MD-2009, Chișinău, Republic of Moldova.
Email: info@labupgrade.ai. Telegram: @aurastudio_help_bot.`
        }
      ]
    },
    offer: {
      title: 'Public Offer',
      effective: 'Revision 01.10.2026, effective 01.10.2026.',
      sections: [
        {
          heading: '1. General',
          body: `1.1. This document is a public offer by Lab Upgrade S.R.L. to enter into a licence agreement for the AuraStudio Service (https://studio.labupgrade.ai).
1.2. Acceptance: registration/sign-in or payment of a plan.
1.3. If the User disagrees, they must stop using the Service.
1.4. Governing law: Republic of Moldova.`
        },
        {
          heading: '2. Definitions',
          body: `“Service” — AuraStudio; “Plan” — a fixed-price “photo” / access package; “Photo” — a unit of functional volume; “Generation” — creating an image from a template or reference using AI.`
        },
        {
          heading: '3. Subject',
          body: `Simple non-exclusive remote-access licence. Paid features remain available until the allocated “photos” under the plan are used up.`
        },
        {
          heading: '4. Account',
          body: `Personal data — under the Privacy Policy (/privacy). Deletion via Profile or info@labupgrade.ai / @aurastudio_help_bot within 30 calendar days. Unused “photos” are forfeited without cash refund unless the Offer states otherwise.`
        },
        {
          heading: '5. Plans and payment',
          body: `100% prepayment via MICB, Stripe or another provider shown in the interface. No auto-renewal unless expressly stated. Interface prices on the payment date prevail.`
        },
        {
          heading: '6. Refunds',
          body: `Available if: funds were charged but “photos” were not activated; Service downtime caused by the Operator exceeds 1 calendar day; other objective grounds. Review within 10 calendar days. Subjective dissatisfaction with quality does not justify a refund.`
        },
        {
          heading: '7. Use',
          body: `“Photos” are not electronic money and cannot be sold or transferred. Each generation consumes a number of “photos”. Unused “photos” remain when a new plan is purchased.`
        },
        {
          heading: '8. Content and liability',
          body: `Rights in uploaded images remain with the User. Generation results belong to the User at their own risk. Service is “as is”. The Operator is not liable for losses from use or unavailability, or for third-party claims related to results.`
        },
        {
          heading: '9. Restrictions',
          body: `Prohibited: copying/modifying the Service, bypassing limits, extracting source code, registering as another person, automated scraping, attacks, reselling access.`
        },
        {
          heading: '10. Disputes',
          body: `Negotiations, then a 30-day complaint procedure, then the competent court at the Operator’s seat (Chișinău). Force majeure excuses the parties.`
        },
        {
          heading: '11. Changes and termination',
          body: `The Operator may amend the Offer by publishing a new version at /offer (except for a plan already paid and not fully used). Continued use means acceptance. Upon breach, the Operator may block access.`
        },
        {
          heading: '12. Contact',
          body: `Lab Upgrade S.R.L., 14 Drumul Viilor St., MD-2009, Chișinău.
info@labupgrade.ai · @aurastudio_help_bot`
        }
      ]
    }
  }
};
