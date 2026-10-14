-- ====================================================================
-- AuraStudio - Seed Data (Categories, Templates, Packages, Providers)
-- ====================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name_ro, name_ru, name_en, display_order, is_active)
VALUES
  ('Trending', 'Trending', 'Тренды', 'Trending', 1, true),
  ('Fashion', 'Fashion', 'Мода', 'Fashion', 2, true),
  ('Business', 'Business', 'Бизнес', 'Business', 3, true),
  ('Instagram', 'Instagram', 'Инстаграм', 'Instagram', 4, true),
  ('Couple', 'Cuplu', 'Пара', 'Couple', 5, true),
  ('Family', 'Familie', 'Семья', 'Family', 6, true),
  ('Birthday', 'Zile de Naștere', 'День Рождения', 'Birthday', 7, true),
  ('Travel', 'Călătorii', 'Путешествия', 'Travel', 8, true),
  ('Lifestyle', 'Lifestyle', 'Лайфстайл', 'Lifestyle', 9, true),
  ('Moldova', 'Moldova', 'Молдова', 'Moldova', 10, true),
  ('Romania', 'România', 'Румыния', 'Romania', 11, true)
ON CONFLICT (id) DO UPDATE SET
  name_ro = EXCLUDED.name_ro,
  name_ru = EXCLUDED.name_ru,
  name_en = EXCLUDED.name_en,
  display_order = EXCLUDED.display_order;

-- 2. SEED CREDIT PACKAGES
INSERT INTO public.credit_packages (id, name_ro, name_ru, name_en, credits, bonus_credits, price_mdl, price_ron, price_eur, is_popular, is_best_value, is_active)
VALUES
  ('pack-starter', 'Pachet Start', 'Стартовый пакет', 'Starter Pack', 25, 0, 99.00, 25.00, 5.00, false, false, true),
  ('pack-creator', 'Pachet Creator', 'Пакет Создатель', 'Creator Pack', 80, 15, 249.00, 65.00, 13.00, true, false, true),
  ('pack-vip', 'VIP Studio Pro', 'VIP Студия Pro', 'VIP Studio Pro', 220, 50, 499.00, 130.00, 26.00, false, true, true)
ON CONFLICT (id) DO UPDATE SET
  credits = EXCLUDED.credits,
  bonus_credits = EXCLUDED.bonus_credits,
  price_mdl = EXCLUDED.price_mdl,
  price_ron = EXCLUDED.price_ron,
  price_eur = EXCLUDED.price_eur,
  is_popular = EXCLUDED.is_popular,
  is_best_value = EXCLUDED.is_best_value;

-- 3. SEED AI PROVIDERS
INSERT INTO public.ai_providers (id, name, type, description, is_configured, is_default, model_identifier, average_latency_seconds)
VALUES
  ('gemini-genai', 'Google Gemini Image', 'image', 'Server-side Google GenAI model for high-fidelity photo generation and editing.', true, true, 'gemini-3.1-flash-lite-image', 6),
  ('replicate-flux', 'Replicate FLUX.1 Dev (FaceID)', 'image', 'Open-weights FLUX.1 Dev model with InstantID facial preservation adapter.', false, false, 'black-forest-labs/flux-1-dev', 9),
  ('fal-ai-pulid', 'Fal.ai PuLID Flux Studio', 'image', 'Ultra-low latency GPU cloud running PuLID facial identity conditioning.', false, false, 'fal-ai/flux-pulid', 3),
  ('veo-video', 'Google Veo Video', 'video', 'Generates dynamic 4-second cinematic portrait loops with subtle motion and breathing.', false, false, 'veo-3.1-lite-generate-preview', 24)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default;

-- 4. SEED AURA STUDIO TEMPLATES
INSERT INTO public.templates (
  id, category_id, name_ro, name_ru, name_en,
  description_ro, description_ru, description_en,
  preview_image_url, prompt, negative_prompt,
  aspect_ratio, credit_cost, required_input_type,
  provider_hint, tags, is_active, display_order
)
VALUES
  (
    'moldova-orheiul-vechi', 'Moldova',
    'Apus de Aur la Orheiul Vechi', 'Золотой закат в Старом Орхее', 'Golden Sunset at Old Orhei',
    'Portret editorial elegant pe fundalul canionului Răut și al bisericii rupestre din Orheiul Vechi.',
    'Элегантный эдиториал портрет на фоне каньона реки Реут и скального монастыря Старого Орхея.',
    'Elegant editorial portrait against the dramatic limestone cliffs and canyon of Orheiul Vechi, Moldova.',
    '/src/assets/images/template_moldova_orhei_1791140775565.jpg',
    'High-end editorial fashion portrait at sunset overlooking the panoramic limestone cliffs and river bend of Orheiul Vechi in Moldova, golden hour lighting, 85mm lens, authentic travel vogue styling.',
    'blurry, bad anatomy, overexposed, low quality, oversaturated cartoon',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['moldova', 'travel', 'sunset', 'heritage', 'editorial'],
    true, 1
  ),
  (
    'romania-peles-castle', 'Romania',
    'Eleganță Regală la Castelul Peleș', 'Королевская элегантность в Замке Пелеш', 'Royal Elegance at Peleș Castle',
    'Portret aristocratic de colecție în fața palatului regal din Sinaia, învăluit în aerul carpatin.',
    'Аристократичный портрет перед неоренессансным королевским замком Пелеш в Синае.',
    'Aristocratic regal portrait in front of the fairytale neo-renaissance Peleș Castle in Sinaia, Romania.',
    '/src/assets/images/template_romania_peles_1791140786996.jpg',
    'Aristocratic cinematic portrait in front of the neo-renaissance timbered Peleș Castle in Sinaia Romania, tailored dark luxury coat, soft misty mountain lighting, high-fashion editorial.',
    'deformed, low quality, plastic face, blurry background noise',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['romania', 'royalty', 'castle', 'luxury', 'carpathians'],
    true, 2
  ),
  (
    'business-executive-skyline', 'Business',
    'Headshot Executiv LinkedIn', 'Executive Headshot для LinkedIn', 'Modern Executive LinkedIn Headshot',
    'Portret profesional premium pentru directori, fondatori și lideri corporate, cu fundal zgârie-nori.',
    'Премиальный деловой портрет для руководителей и лидеров компаний с видом на современный мегаполис.',
    'High-status executive portrait for CEOs, founders and corporate leaders in a modern skyline boardroom.',
    '/src/assets/images/template_business_exec_1791140798767.jpg',
    'Polished modern executive business portrait in a glass boardroom overlooking European skyline, confident warm smile, crisp tailored blazer, studio softbox lighting, Forbes 30 under 30 editorial.',
    'amateur, bad lighting, passport photo, stiff posture, overprocessed skin',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['business', 'linkedin', 'executive', 'career', 'corporate'],
    true, 3
  ),
  (
    'fashion-milan-streetwear', 'Fashion',
    'Street Style Milan Editorial', 'Миланский Street Style', 'Milan Street Style Editorial',
    'Stil cosmopolit pe străzile pavate din Milano, palton camel de lux și ochelari de soare iconici.',
    'Космополитичный уличный стиль на брусчатке Милана, роскошное пальто и трендовые аксессуары.',
    'Cosmopolitan high-fashion street portrait on European cobblestone avenues, camel trench coat, effortless chic.',
    '/src/assets/images/template_fashion_milan_1791140809021.jpg',
    'Contemporary luxury streetwear fashion portrait on a European cobblestone street, stylish designer sunglasses, cashmere trench coat, diffused soft daylight, editorial magazine quality.',
    'oversaturated, unnatural skin, cartoonish, low resolution',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['fashion', 'streetwear', 'vogue', 'model', 'editorial'],
    true, 4
  ),
  (
    'insta-golden-rooftop', 'Instagram',
    'Apus Golden Hour pe Acoperiș', 'Golden Hour на крыше города', 'Golden Hour City Rooftop',
    'Lumină caldă de apus peste o terasă panoramică, reflexii aurii și atmosferă relaxată de vacanță.',
    'Теплый закатный свет на открытой крыше с панорамой европейского города, естественная эстетика.',
    'Dreamy golden hour rooftop portrait with European skyline, cinematic lens flare, effortlessly aesthetic.',
    '/src/assets/images/template_insta_golden_1791140819273.jpg',
    'Dreamy golden hour rooftop portrait of an attractive person with European city skyline at dusk, warm sun flares, effortless casual luxury clothing, authentic aesthetic lifestyle photography, cinematic 35mm warmth.',
    'harsh shadows, fake plastic glow, bad hands, low resolution',
    '3:4', 1, 'single_portrait', 'gemini-genai',
    ARRAY['instagram', 'goldenhour', 'rooftop', 'aesthetic', 'trending'],
    true, 5
  ),
  (
    'trending-old-money', 'Trending',
    'Estetică Old Money Riviera', 'Эстетика Old Money Ривьера', 'Old Money Riviera Glamour',
    'Costum din in fin, ochelari vintage și atmosferă exclusivă de club privat la Mediterana.',
    'Льняной костюм, винтажные солнцезащитные очки и атмосфера закрытого клуба на Ривьере.',
    'Refined quiet luxury portrait in crisp linen garments at an exclusive Mediterranean seaside club.',
    '/src/assets/images/template_fashion_milan_1791140809021.jpg',
    'Old money quiet luxury aesthetic portrait on the terrace of a historic Riviera villa, ivory linen shirt, Mediterranean cypress trees, gentle sea breeze, muted film tones, timeless elegance.',
    'garish logos, neon, fast fashion, plastic sheen, lowres',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['trending', 'oldmoney', 'quietluxury', 'vintage', 'elegance'],
    true, 6
  ),
  (
    'couple-paris-promenade', 'Couple',
    'Plimbare Romantică la Paris', 'Романтическая прогулка в Париже', 'Romantic Paris Promenade',
    'Atmosferă cinematografică pe malul Senei la apus, cu Turnul Eiffel în ceață caldă.',
    'Кинематографичная атмосфера на набережной Сены в Париже на закате.',
    'Cinematic romantic couple moment strolling along the Seine in Paris with the Eiffel Tower in the mist.',
    '/src/assets/images/template_insta_golden_1791140819273.jpg',
    'Cinematic romantic couple photography in Paris by the Seine River at dusk, warm Parisian streetlamps, soft ambient glow, natural laughter, timeless film still aesthetic, 50mm f/1.4.',
    'awkward poses, unnatural hands, overbaked contrast, low quality',
    '3:4', 3, 'couple_portrait', 'gemini-genai',
    ARRAY['couple', 'love', 'paris', 'romance', 'cinematic'],
    true, 7
  ),
  (
    'family-golden-autumn', 'Family',
    'Armonie de Toamnă în Familie', 'Теплая осенняя семейная гармония', 'Golden Autumn Family Harmony',
    'Zâmbete sincere și lumini calde într-o pădure aurie cu frunze ruginii.',
    'Искренние улыбки и теплое осеннее солнце в парке с золотыми листьями.',
    'Heartwarming family portrait outdoors surrounded by glowing golden autumn foliage and soft afternoon light.',
    '/src/assets/images/template_moldova_orhei_1791140775565.jpg',
    'Warm candid family portrait in a picturesque sun-dappled autumn park, golden leaves, cozy knitted sweaters, genuine joyful smiles, natural gentle depth of field, tender lifestyle photography.',
    'distorted faces, creepy smiles, missing limbs, dark mood',
    '4:3', 3, 'group_family', 'gemini-genai',
    ARRAY['family', 'autumn', 'cozy', 'warmth', 'harmony'],
    true, 8
  ),
  (
    'birthday-sparklers-gala', 'Birthday',
    'Sărbătoare Midnight Champagne', 'Праздник Midnight Champagne', 'Midnight Champagne Celebration',
    'Lumânări scânteietoare, cupă de șampanie și ținută de gală pentru o aniversare memorabilă.',
    'Бенгальские огни, бокал шампанского и праздничный вечерний наряд на день рождения.',
    'Glittering sparklers, crystal champagne glass and chic celebration attire for an unforgettable birthday.',
    '/src/assets/images/template_business_exec_1791140798767.jpg',
    'Celebratory glamorous birthday portrait at night with sparkling golden fire sparklers in hand, elegant velvet evening dress, bokeh lights in background, joyful toast, cinematic luxury lighting.',
    'flat lighting, blurry eyes, messy background, lowres',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['birthday', 'celebration', 'party', 'champagne', 'glamour'],
    true, 9
  ),
  (
    'travel-amalfi-yacht', 'Travel',
    'Croazieră pe Coasta Amalfi', 'Круиз на яхте по Амальфи', 'Amalfi Coast Yacht Day',
    'Briză mediteraneană pe puntea unui yacht alb din lemn de tec, cu falezele din Positano în spate.',
    'Морской бриз на палубе белой яхты с видом на красочные скалы и виллы Позитано.',
    'Luxury yacht day along the dramatic Amalfi Coast, turquoise waters, Positano colorful cliff houses.',
    '/src/assets/images/template_insta_golden_1791140819273.jpg',
    'Sun-drenched luxury travel photography on a classic wooden yacht deck off the coast of Positano Amalfi, turquoise water, white linen shirt, Italian summer vibes, high fashion editorial.',
    'overexposed sky, bad perspective, washed out colors',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['travel', 'amalfi', 'yacht', 'summer', 'vacation'],
    true, 10
  ),
  (
    'lifestyle-artisan-coffee', 'Lifestyle',
    'Dimineață la Cafenea de Specialitate', 'Утро в спешелти кофейне', 'Specialty Coffee Morning',
    'Lumină naturală de dimineață, ceașcă de cappuccino ceramică și atmosferă minimalistă nordică.',
    'Утренний мягкий свет, керамическая чашка капучино и уютный интерьер авторской кофейни.',
    'Cozy morning in an aesthetic Scandinavian coffee shop, warm ceramic latte cup, gentle natural window light.',
    '/src/assets/images/template_fashion_milan_1791140809021.jpg',
    'Cozy candid lifestyle portrait inside a modern minimalist specialty cafe, holding a ceramic latte cup, large window with soft morning light, stylish oversized sweater, authentic editorial portrait.',
    'artificial studio look, cluttered, stiff pose',
    '3:4', 1, 'single_portrait', 'gemini-genai',
    ARRAY['lifestyle', 'coffee', 'cozy', 'minimal', 'morning'],
    true, 11
  ),
  (
    'romania-bran-twilight', 'Romania',
    'Mister la Castelul Bran', 'Мистика Замка Бран', 'Transylvanian Mystery at Bran',
    'Atmosferă gotică sofisticată și romantică pe creasta stâncoasă din Transilvania.',
    'Изысканная готическая романтика на фоне легендарного замка Бран в Трансильвании.',
    'Sophisticated gothic romance portrait near the historic Bran Castle perched atop the craggy Transylvanian rocks.',
    '/src/assets/images/template_romania_peles_1791140786996.jpg',
    'Cinematic moody portrait near Bran Castle in Transylvania at twilight, dramatic mist weaving through pine trees, dark wool tailored coat, subtle rim lighting, mysterious and enchanting.',
    'cheesy halloween props, cartoon bats, horror face, lowres',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['romania', 'bran', 'transylvania', 'gothic', 'cinematic'],
    true, 12
  ),
  (
    'moldova-cricova-gala', 'Moldova',
    'Gala Beciurilor Cricova', 'Гала-вечер в подвалах Крикова', 'Cricova Royal Cellar Gala',
    'Eleganță de seară în faimoasele galerii subterane din piatră de var din Cricova, cu lumânări și vin nobil.',
    'Вечерняя роскошь в знаменитых известняковых подземных галереях Крикова при мерцании свечей.',
    'Black-tie gala portrait within the famous limestone underground subterranean wine city of Cricova, Moldova.',
    '/src/assets/images/template_moldova_orhei_1791140775565.jpg',
    'Opulent evening gala portrait inside the historic vaulted limestone cellars of Cricova in Moldova, warm candle chandelier lighting, black-tie formal attire, fine wine glass, prestige atmosphere.',
    'dusty, dark murky shadows, amateur camera flash',
    '3:4', 2, 'single_portrait', 'gemini-genai',
    ARRAY['moldova', 'cricova', 'wine', 'luxury', 'gala'],
    true, 13
  )
ON CONFLICT (id) DO UPDATE SET
  name_ro = EXCLUDED.name_ro,
  name_ru = EXCLUDED.name_ru,
  name_en = EXCLUDED.name_en,
  prompt = EXCLUDED.prompt,
  credit_cost = EXCLUDED.credit_cost,
  preview_image_url = EXCLUDED.preview_image_url;


-- ====================================================================
-- AuraStudio - Generation Prompts Migration (004)
-- Creates the generation_prompts table, configures RLS, and seeds
-- all 13 exhaustive production prompts for Single, Couple, Pinterest,
-- Enhance, Refine, and Avoid pipelines with full parity.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.generation_prompts (
  key text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generation_prompts_category ON public.generation_prompts (category);

ALTER TABLE public.generation_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to prompts" ON public.generation_prompts;
CREATE POLICY "Allow read access to prompts"
  ON public.generation_prompts
  FOR SELECT
  TO authenticated, anon, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow service_role full access to prompts" ON public.generation_prompts;
CREATE POLICY "Allow service_role full access to prompts"
  ON public.generation_prompts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generation_prompts_updated_at ON public.generation_prompts;
CREATE TRIGGER trg_generation_prompts_updated_at
  BEFORE UPDATE ON public.generation_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_prompts_updated_at();

-- SEED ALL 13 PROMPTS WITH EXHAUSTIVE DIRECTIVES

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass1_template',
  'Одиночный шаблон: Проход 1 (Базовый портрет)',
  'Генерация базового портрета 1K с сохранением 3D-анатомии лица и мимики шаблона',
  'single_template',
  'РОЛЬ: Ты — всемирно признанный фэшн-фотограф и эксперт портретной съемки высшего эшелона (уровня обложек Vogue, Vanity Fair и Harper''s Bazaar).
ЗАДАЧА: Сгенерируй один высокохудожественный, бескомпромиссно фотореалистичный портрет человека из [USER_IDENTITY_PHOTOS] в СЦЕНЕ шаблона с безупречной анатомической точностью лица, естественной мимикой и кинематографичным студийным светом.

1. ИДЕНТИЧНОСТЬ И ПОЛНАЯ 3D-РЕКОНСТРУКЦИЯ ЛИЦА ПО ФОТО [USER_IDENTITY_PHOTOS]:
- В [USER_IDENTITY_PHOTOS] предоставлены основное селфи и дополнительные ракурсы лица пользователя (анфас, три четверти, профиль).
- СИНТЕЗИРУЙ ТОЧНУЮ 3D-АНАТОМИЮ ЛИЦА: сопоставь все предоставленные фотографии для пространственной реконструкции уникального костного и хрящевого каркаса конкретного человека.
- ТОЧНЕЙШЕЕ СОХРАНЕНИЕ ГЕОМЕТРИИ: межзрачковое расстояние, форма и разрез глаз, оттенок и глубина радужки, форма век, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скуловых дуг, угол нижней челюсти и очертания подбородка.
- ВОЛОСЫ И ПРИЧЕСКА: стрижка, длина прядей, естественная линия роста волос, пробор, объем, фактура и оттенок волос берутся ИСКЛЮЧИТЕЛЬНО из фото пользователя. Описания причесок или цвета волос из шаблона полностью игнорировать.
- СТРОГИЙ ЗАПРЕТ: категорически запрещено заменять лицо пользователя лицом модели из шаблона, усреднять черты лица или генерировать типовое чужое лицо из датасетов.

2. ВЫРАЖЕНИЕ ЛИЦА И ОРГАНИЧНАЯ МИМИКА ШАБЛОНА:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- ВНИМАНИЕ: Выражение лица шаблона — это ключевая часть художественного замысла, передай его точно, но МЯГКО и ОРГАНИЧНО индивидуальной анатомии лица пользователя.
- Если на шаблоне улыбка — она должна быть естественной, теплой и живой, плавно приподнимающей скулы и уголки губ, с мягким живым блеском в глазах. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ грубые натянутые оскалы, неестественно растянутые челюсти, напряженные жевательные мышцы, карикатурные гримасы, глубокие искусственные носогубные заломы или второй подбородок.
- Если на шаблоне нейтральный, задумчивый или уверенный взгляд — передай спокойствие, расслабленные губы и сфокусированный прямой взгляд без напряжения.

3. ПОСАДКА ГОЛОВЫ, РАКУРС И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори ракурс головы: угол поворота, наклон шеи и направление взгляда из референса шаблона, чтобы голова идеально подходила под позу тела и линию воротника одежды.
- Световая схема: воспроизведи направление и характер освещения из шаблона (мягкий студийный софтбокс, ключевой свет, заполняющий свет, контровые блики на волосах и рельефе скул).

4. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть взгляда и упругость кожи. Не добавлять искусственных морщин, темных кругов, мешков под глазами или уставшего землистого оттенка.
- Текстура кожи: микропоры, естественное подкожное рассеивание света (subsurface scattering), живой блеск глаз. Полностью исключить пластиковое замыливание, эффект фарфоровой куклы или восковой маски.

СЦЕНА И ОКРУЖЕНИЕ:
{{scene}}
{{age1}}
{{body}}
{{avoid}}',
  '["expression", "scene", "age1", "body", "avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass2_template',
  'Одиночный шаблон: Проход 2 (Бесшовный композитинг)',
  'Финальное встраивание головы и журнальная шлифовка в оригинальную сцену',
  'single_template',
  'РОЛЬ: Ведущий эксперт пост-продакшна и бесшовного фотомонтажа высочайшего уровня (Vogue / Harper''s Bazaar Master Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и финальную журнальную шлифовку (Pass 2) головы и лица пользователя в маскированную область оригинальной сцены шаблона [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ИНТЕГРАЦИИ И РЕТУШИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ СЦЕНЫ [SCENE_IMAGE]:
- Тело, плечи, поза, весь костюм (пиджак, рубашка, воротник, лацканы, галстук, складки ткани, пуговицы, текстура материала), руки, пальцы, мебель, передний план и фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].
- Закрашена маской ИСКЛЮЧИТЕЛЬНО область головы и шеи. Все остальные пиксели кадра должны быть идеально сохранены без сдвигов и искажений.

2. ПОСАДКА, РАКУРС И ЭМОЦИЯ ИЗ [POSE_GUIDE_IMAGE] (РЕЗУЛЬТАТ PASS 1):
- Используй [POSE_GUIDE_IMAGE] (результат Pass 1) как точную основу правильного угла посадки головы, ракурса, прически и аккуратной органичной мимики/улыбки.
- Отшлифуй геометрию: сгладь артефакты, сделай линии губ, век и глаз кристально четкими, живыми и естественными.

3. ИДЕНТИЧНОСТЬ ПО ВСЕМ ФОТО [USER_IDENTITY_PHOTOS]:
- Лицо на финальном результате — это на 100% узнаваемый человек из [USER_IDENTITY_PHOTOS].
- Сверяй черты лица со всеми приложенными ракурсами (анфас, профиль, три четверти). Сохраняй индивидуальную форму носа, разрез глаз, очертания подбородка, текстуру и цвет волос.

4. БЕСШОВНЫЙ СТЫК ВОРОТНИКА И ШЕИ (SEAMLESS COLLAR INTEGRATION):
- Безупречно состыковать шею с линией воротника одежды из [SCENE_IMAGE]. Никаких швов, зазоров, размытых пятен, ореолов или несоответствий толщины шеи.
- Сформируй естественные анатомические тени от подбородка на шею и от воротника на ключицы. Световая схема, цветовая температура и контрастность лица должны полностью гармонировать со сценой.

5. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: свежая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд.
{{avoid}}',
  '["avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass1_couple',
  'Парный шаблон: Проход 1 (Два персонажа)',
  'Генерация двух людей 1K с раздельной 3D-анатомией, романтическим взаимодействием и мимикой',
  'couple_template',
  'РОЛЬ: Всемирно признанный эдиториал-фотограф романтических парных фотосессий высшего эшелона (уровня Vogue Love, Vanity Fair Couples и Harper''s Bazaar).
ЗАДАЧА: Сгенерируй один высокохудожественный, бескомпромиссно фотореалистичный кадр ДВУХ людей вместе в СЦЕНЕ шаблона с идеальной посадкой голов, гармоничным романтическим взаимодействием, искренней мимикой и кинематографичным светом.

1. СТРОЖАЙШАЯ ИЗОЛЯЦИЯ И ПОЛНАЯ 3D-АНАТОМИЯ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А (СЛЕВА): черты лица, костная структура черепа, форма глазниц, разрез и цвет глаз, линия век, форма носа, контур губ, скуловые дуги, форма подбородка, стрижка, пробор и текстура волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_A_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- ПЕРСОНАЖ Б (СПРАВА): черты лица, костная структура черепа, форма глазниц, разрез и цвет глаз, линия век, форма носа, контур губ, скуловые дуги, форма подбородка, стрижка, пробор и текстура волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_B_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- СТРОЖАЙШИЙ ЗАПРЕТ: категорически запрещено смешивать черты лица между персонажами, переносить анатомию одного человека на другого, усреднять их внешность, менять местами левого и правого персонажей или копировать лица моделей из шаблона.

2. ВОЛОСЫ И ПРИЧЕСКИ ОБОИХ ПЕРСОНАЖЕЙ:
- Стрижка, длина прядей, фактура, естественная линия роста и объем волос Персонажа А берутся строго из [IDENTITY_A_PHOTOS].
- Стрижка, длина прядей, фактура, естественная линия роста и объем волос Персонажа Б берутся строго из [IDENTITY_B_PHOTOS].
- Описания причесок из шаблона игнорировать — генерировать только реальные прически пользователей.

3. ВЫРАЖЕНИЯ ЛИЦ, ЭМОЦИИ И ОРГАНИЧНАЯ МИМИКА ПАРЫ:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Перенеси настроение шаблона (романтика, нежность, искренняя радость, доверие) тонко, мягко и органично индивидуальной анатомии лица каждого персонажа.
- Улыбки должны быть живыми, непринужденными, естественно приподнимающими уголки губ и скулы, с сияющим взглядом. Категорически запрещены напряженные челюсти, оскалы, гримасы, перекосы мимических мышц и глубокие искусственные носогубные заломы.
- Если персонажи смотрят друг на друга или в объектив — взгляд должен быть теплым, сфокусированным и живым.

4. ПОСАДКА ГОЛОВ, ВЗАИМОДЕЙСТВИЕ И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори парную композицию референса: взаимный наклон голов, поворот плеч, ракурсы шеи и направление взглядов.
- Воспроизведи единую световую схему: ключевой, заполняющий и контурный свет, согласующийся между обоими персонажами, мягкие гармоничные тени и естественные блики.

5. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть и упругость кожи для ОБОИХ персонажей. Не добавлять искусственных морщин, кругов под глазами или следов усталости.
- Натуральный микрорельеф кожи с порами, деликатное подповерхностное рассеивание света (subsurface scattering), отсутствие эффекта восковой маски или кукольного мыла.

СЦЕНА:
{{scene}}
{{age1}}
{{age2}}
{{body}}
{{avoid}}',
  '["expression", "scene", "age1", "age2", "body", "avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass2_couple',
  'Парный шаблон: Проход 2 (Бесшовный парный композитинг)',
  'Финальное встраивание двух голов и журнальная шлифовка в парную сцену шаблона',
  'couple_template',
  'РОЛЬ: Эксперт по композитингу парных портретов и журнальной ретуши высшей категории (High-End Master Editorial Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и финальную журнальную шлифовку (Pass 2) лиц и голов двух персонажей в маскированные области оригинальной сцены парного шаблона [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ШЛИФОВКИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ СЦЕНЫ [SCENE_IMAGE]:
- Все позы тел, объятия, руки, переплетенные пальцы, вся одежда (пиджаки, платья, рубашки, воротники, лацканы, кружево, фактура тканей, пуговицы), аксессуары, глубина резкости и фон сохраняются на 100% нетронутыми из [SCENE_IMAGE].
- Закрашены маской ИСКЛЮЧИТЕЛЬНО области голов и шеи обоих персонажей. Все остальные пиксели кадра должны остаться в оригинальном неизменном виде.

2. РАЗДЕЛЬНОЕ ВСТРАИВАНИЕ ЛИЧНОСТЕЙ:
- ПЕРСОНАЖ СЛЕВА: замещается головой и лицом Персонажа А строго по [IDENTITY_A_PHOTOS] (сверка со всеми ракурсами).
- ПЕРСОНАЖ СПРАВА: замещается головой и лицом Персонажа Б строго по [IDENTITY_B_PHOTOS] (сверка со всеми ракурсами).
- СТРОГИЙ ЗАПРЕТ: запрещено восстанавливать лица моделей из исходной сцены [SCENE_IMAGE], смешивать черты персонажей между собой или менять их местами.

3. ПОСАДКА, РАКУРСЫ И ЭМОЦИИ ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй результат Pass 1 [POSE_GUIDE_IMAGE] как точный ориентир правильной посадки голов, ракурсов, причесок и аккуратных естественных выражений лиц.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей обоих персонажей до журнального совершенства.

4. БЕСШОВНЫЕ СТЫКИ ВОРОТНИКОВ И ШЕИ (SEAMLESS COLLAR INTEGRATION ДЛЯ ОБОИХ):
- Идеальное анатомическое сведение шеи Персонажа А с его линией воротника/одежды и шеи Персонажа Б с его линией воротника/декольте. Полное отсутствие швов, зазоров, ореолов, мыльных пятен или анатомических расхождений.
- Сформируй реалистичные контактные тени от подбородков на шеи и от одежды на ключицы в соответствии с направлением света.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Идеально сбалансируй тона кожи (skintone), цветовую температуру (кельвины) и контраст лиц обоих персонажей под световую схему оригинальной сцены [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: гладкая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд обоим персонажам.
{{avoid}}',
  '["avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass1_pinterest',
  'Pinterest Одиночный: Проход 1 (Базовый кадр)',
  'Генерация человека в эстетике Pinterest по детальному разбору сцены',
  'pinterest',
  'РОЛЬ: Всемирно известный эдиториал-фотограф в эстетике Pinterest и Vogue.
ЗАДАЧА: Сгенерируй один высокохудожественный, фотореалистичный кадр человека из [USER_IDENTITY_PHOTOS] в СЦЕНЕ референса Pinterest с полной анатомической верностью лицу пользователя, естественной мимикой и кинематографичным светом.

1. ИДЕНТИЧНОСТЬ И ПОЛНАЯ 3D-РЕКОНСТРУКЦИЯ ЛИЦА ПО ФОТО [USER_IDENTITY_PHOTOS]:
- В [USER_IDENTITY_PHOTOS] предоставлены главное селфи и дополнительные ракурсы лица пользователя (анфас, три четверти, профиль).
- СИНТЕЗИРУЙ ТОЧНУЮ 3D-АНАТОМИЮ ЛИЦА: сопоставь все предоставленные фотографии для реконструкции реальных уникальных черт конкретного человека.
- ТОЧНЕЙШЕЕ ВОССОЗДАНИЕ ЧЕРТ: межзрачковое расстояние, форма и разрез глаз, оттенок радужки, форма век, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скул, угол нижней челюсти и подбородка.
- ВОЛОСЫ: стрижка, длина прядей, естественная линия роста, объем, фактура и оттенок волос берутся ИСКЛЮЧИТЕЛЬНО из фото пользователя. Лицо и волосы модели с референса Pinterest категорически запрещено копировать.

2. ВЫРАЖЕНИЕ ЛИЦА И ОРГАНИЧНАЯ МИМИКА РЕФЕРЕНСА:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- ВНИМАНИЕ: Эмоция референса переносится на лицо пользователя ОЧЕНЬ АККУРАТНО, мягко и органично индивидуальной анатомии лица.
- Если на референсе легкая улыбка — она должна быть искренней, естественной и живой, плавно приподнимающей скулы и уголки губ, с мягким блеском в глазах. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ грубые натянутые оскалы, гримасы, напряженные челюсти и глубокие искусственные носогубные заломы.
- Если на референсе задумчивый или расслабленный взгляд — передай спокойствие, мягкие губы и естественный фокус взгляда.

3. ПОСАДКА ГОЛОВЫ, РАКУРС И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори ракурс головы: наклон шеи, поворот лица и направление взгляда из референса Pinterest.
- Световая схема: воспроизведи эстетику освещения референса (мягкий рассеянный дневной свет, золотой час, контровые блики на волосах и деликатные полутени).

4. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть взгляда и упругость кожи. Не добавлять искусственных морщин, темных кругов, мешков под глазами или уставшего оттенка.
- Текстура кожи: микропоры, подповерхностное рассеивание света (subsurface scattering), живой блеск глаз. Исключить пластиковое замыливание и эффект куклы.

СЦЕНА (кинематографический анализ референса):
{{scene}}
{{age1}}
{{body}}
{{avoid}}',
  '["expression", "scene", "age1", "body", "avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'mask_pinterest',
  'Pinterest Одиночный: Маскирование (Лицо и волосы)',
  'Прецизионное маскирование лица и волос серой заливкой с сохранением одежды и фона',
  'pinterest',
  'РОЛЬ: Технический специалист по маскированию для прецизионного фотомонтажа (Inpainting Masking Specialist).
ЗАДАЧА: Сгенерируй точную изолирующую маску для оригинального изображения Pinterest, подготовив кадр к безупречному бесшовному композитингу в Pass 2.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К СОХРАНЕНИЮ И МАСКЕ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОГО КАДРА:
- Верни ТО ЖЕ САМОЕ изображение, что на входе, БЕЗ каких-либо изменений композиции, позы, тела, одежды, фона, освещения, геометрии и пропорций.
- Все детали одежды (пиджак, рубашка, пальто, воротник, лацканы, пуговицы, фактура ткани), руки, пальцы, аксессуары, украшения, интерьер и фон должны остаться кристально четкими, резкими и нетронутыми.

2. ЗОНА МАСКИРОВАНИЯ:
- Аккуратно, плотно и сплошной нейтральной светло-серой заливкой (#C0C0C0) закрась ИСКЛЮЧИТЕЛЬНО лицо, уши, шею и всю прическу/волосы человека на кадре.

3. ГРАНИЦЫ МАСКИ (PRECISION EDGES):
- Граница маски по воротнику одежды должна быть идеально точной — маска доходит ровно до края ткани воротника, не заходя на саму ткань и не оставляя неокрашенных зазоров между шеей и одеждой.
- Граница маски по волосам аккуратно охватывает контур прически без повреждения фоновых объектов.
- Результат: тот же самый исходный кадр с ровной серой зоной для последующего встраивания лица пользователя.',
  '[]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass2_pinterest',
  'Pinterest Одиночный: Проход 2 (Бесшовный композитинг)',
  'Финальное встраивание головы из Pass 1 в маскированный референс Pinterest',
  'pinterest',
  'РОЛЬ: Мастер бесшовного эдиториал-композитинга мирового класса (Vogue / Harper''s Bazaar Master Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и журнальную шлифовку (Pass 2) головы и лица пользователя в маскированную область оригинальной сцены Pinterest [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ШЛИФОВКИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ СЦЕНЫ PINTEREST [SCENE_IMAGE]:
- Тело, поза, плечи, вся одежда (пиджак, платье, свитер, пальто, воротник, лацканы, пуговицы, текстура материала), руки, пальцы, аксессуары, окружение и весь фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].
- Закрашена серой маской исключительно область головы и шеи. Все остальные пиксели кадра должны быть идеально сохранены.

2. ПОСАДКА, РАКУРС И ЭМОЦИЯ ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй [POSE_GUIDE_IMAGE] (результат Pass 1) как точную основу угла посадки головы, ракурса, прически и аккуратной естественной мимики/улыбки.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей до журнального совершенства.

3. ИДЕНТИЧНОСТЬ ПО ВСЕМ ФОТО [USER_IDENTITY_PHOTOS]:
- Лицо на финальном результате — это на 100% узнаваемый человек из [USER_IDENTITY_PHOTOS].
- Сверяй черты лица со всеми приложенными ракурсами (анфас, профиль, три четверти). Сохраняй индивидуальную форму носа, разрез глаз, очертания подбородка, текстуру и цвет волос. Восстанавливать лицо модели с Pinterest категорически запрещено.

4. БЕСШОВНЫЙ СТЫК ВОРОТНИКА И ШЕИ (SEAMLESS COLLAR INTEGRATION):
- Безупречно состыковать шею с линией воротника одежды из [SCENE_IMAGE]. Никаких швов, зазоров, размытых пятен, ореолов или несоответствий толщины шеи.
- Сформируй естественные анатомические тени от подбородка на шею и от воротника на ключицы.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Выровняй цветовую температуру кожи (skintone), направление бликов и контрастность лица под эстетику освещения оригинального кадра [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: свежая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд.
{{avoid}}',
  '["avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass1_pinterest_couple',
  'Pinterest Парный: Проход 1 (Два персонажа)',
  'Генерация двух людей по разбору референса Pinterest с раздельной анатомией А и Б',
  'pinterest',
  'РОЛЬ: Топовый фотограф эдиториал-съемок и романтических парных лавстори в эстетике Pinterest мирового уровня.
ЗАДАЧА: Сгенерируй один высокохудожественный, фотореалистичный кадр ДВУХ людей вместе в СЦЕНЕ референса Pinterest с полной анатомической верностью лицам пользователей, точной посадкой и искренней мимикой.

1. СТРОЖАЙШАЯ ИЗОЛЯЦИЯ И ПОЛНАЯ 3D-АНАТОМИЯ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А (СЛЕВА): черты лица, костная структура черепа, форма глазниц, разрез и цвет глаз, линия век, форма носа, контур губ, скуловые дуги, форма подбородка, стрижка, пробор и текстура волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_A_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- ПЕРСОНАЖ Б (СПРАВА): черты лица, костная структура черепа, форма глазниц, разрез и цвет глаз, линия век, форма носа, контур губ, скуловые дуги, форма подбородка, стрижка, пробор и текстура волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_B_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- СТРОЖАЙШИЙ ЗАПРЕТ: категорически запрещено смешивать черты лица между персонажами, переносить внешность одного на другого, усреднять черты, менять местами левого и правого персонажей, копировать лица людей с референса Pinterest или добавлять посторонних людей.

2. ВОЛОСЫ И ПРИЧЕСКИ ОБОИХ ПЕРСОНАЖЕЙ:
- Стрижка, длина прядей, фактура, естественная линия роста и объем волос Персонажа А берутся строго из [IDENTITY_A_PHOTOS].
- Стрижка, длина прядей, фактура, естественная линия роста и объем волос Персонажа Б берутся строго из [IDENTITY_B_PHOTOS].
- Прически моделей с Pinterest полностью игнорировать.

3. ВЫРАЖЕНИЯ ЛИЦ, ЭМОЦИИ И ОРГАНИЧНАЯ МИМИКА ПАРЫ:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Перенеси настроение Pinterest (непринужденность, нежность, романтичный взгляд, уют) мягко и гармонично анатомии лиц пользователей.
- Естественные, теплые улыбки без напряжения жевательных мышц, оскалов, гримас и без глубоких носогубных заломов. Живой блеск глаз и искренний контакт.

4. ПОСАДКА ГОЛОВ, ВЗАИМОДЕЙСТВИЕ И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори парную композицию референса Pinterest: угол поворота голов, наклон плеч, объятия и ракурсы взглядов.
- Воспроизведи световую схему Pinterest (мягкий кинематографичный свет, золотой час, естественные светотени).

5. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть и упругость кожи для ОБОИХ персонажей. Не добавлять искусственных морщин, кругов под глазами или следов усталости.
- Натуральный микрорельеф кожи с порами, деликатное подповерхностное рассеивание света (subsurface scattering), исключить эффект мыла и пластика.

СЦЕНА (глубокий анализ референса Pinterest):
{{scene}}
{{age1}}
{{age2}}
{{body}}
{{avoid}}',
  '["expression", "scene", "age1", "age2", "body", "avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'mask_pinterest_couple',
  'Pinterest Парный: Маскирование (Оба персонажа)',
  'Прецизионное маскирование обоих лиц и волос серой заливкой с сохранением поз и фона',
  'pinterest',
  'РОЛЬ: Технический специалист по маскированию для фотомонтажа парных сцен (Inpainting Masking Specialist).
ЗАДАЧА: Сгенерируй точную изолирующую маску для оригинального парного изображения Pinterest, подготовив кадр к безупречному бесшовному композитингу в Pass 2.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К СОХРАНЕНИЮ И МАСКЕ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОГО КАДРА:
- Верни ТО ЖЕ САМОЕ изображение, что на входе, БЕЗ каких-либо изменений композиции, поз тел обоих персонажей, одежды, фона, освещения, геометрии и пропорций.
- Все детали одежды обоих персонажей (костюмы, платья, рубашки, воротники, лацканы, пуговицы, текстуры ткани), объятия, руки, переплетенные пальцы, аксессуары, украшения, интерьер и фон должны остаться кристально четкими, резкими и нетронутыми.

2. ЗОНА МАСКИРОВАНИЯ:
- Аккуратно, плотно и сплошной нейтральной светло-серой заливкой (#C0C0C0) закрась лица, уши, шеи и все волосы ОБОИХ людей на кадре (Персонажа А и Персонажа Б).

3. ГРАНИЦЫ МАСКИ (PRECISION EDGES):
- Границы маски по воротникам и декольте одежды обоих персонажей должны быть идеально точными — маска доходит ровно до края ткани, не заходя на саму ткань и не оставляя незакрашенных зазоров.
- Границы маски по прическам аккуратно охватывают контуры волос без повреждения фона и окружения.
- Результат: тот же самый исходный парный кадр с ровными серыми зонами для последующего встраивания голов двух пользователей.',
  '[]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass2_pinterest_couple',
  'Pinterest Парный: Проход 2 (Бесшовный композитинг пары)',
  'Финальное встраивание двух голов из Pass 1 в маскированный парный референс Pinterest',
  'pinterest',
  'РОЛЬ: Мастер бесшовного эдиториал-композитинга мирового класса (Vogue / Harper''s Bazaar Master Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и журнальную шлифовку (Pass 2) двух голов с [POSE_GUIDE_IMAGE] в соответствующие маскированные области парного референса Pinterest [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ШЛИФОВКИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ СЦЕНЫ PINTEREST [SCENE_IMAGE]:
- Все позы тел, объятия, руки, переплетенные пальцы, вся одежда (костюмы, платья, свитера, пальто, воротники, лацканы, пуговицы, текстура материала), аксессуары, окружение и фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].
- Закрашены серой маской исключительно области голов и шеи обоих персонажей. Все остальные пиксели кадра должны остаться в оригинальном неизменном виде.

2. РАЗДЕЛЬНОЕ ВСТРАИВАНИЕ ДВУХ ЛИЧНОСТЕЙ:
- Левая маскированная область замещается головой и лицом Персонажа А строго по [IDENTITY_A_PHOTOS] (сверка со всеми ракурсами).
- Правая маскированная область замещается головой и лицом Персонажа Б строго по [IDENTITY_B_PHOTOS] (сверка со всеми ракурсами).
- СТРОГИЙ ЗАПРЕТ: запрещено восстанавливать лица моделей из оригинального кадра Pinterest, смешивать черты персонажей между собой или менять их местами.

3. ПОСАДКА, РАКУРСЫ И ЭМОЦИИ ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй результат Pass 1 [POSE_GUIDE_IMAGE] как основу правильной посадки голов, ракурсов, причесок и аккуратных выражений лиц.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей обоих персонажей до журнального совершенства.

4. БЕСШОВНЫЕ СТЫКИ ВОРОТНИКОВ И ШЕИ (SEAMLESS COLLAR INTEGRATION ДЛЯ ОБОИХ):
- Идеальное анатомическое сведение шеи Персонажа А с линией его воротника/одежды и шеи Персонажа Б с линией его воротника/декольте. Полное отсутствие швов, зазоров, ореолов, мыльных пятен или анатомических расхождений.
- Сформируй реалистичные контактные тени от подбородков на шеи и от одежды на ключицы в соответствии с направлением света.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Идеально согласуй тона кожи (skintone), цветовую температуру (кельвины) и контрастность лиц обоих персонажей под световую схему оригинального референса [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: гладкая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд обоим персонажам.
{{avoid}}',
  '["avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'pass1_enhance',
  'Режим Улучшения (High-End апскейл и реставрация)',
  'Премиальный апскейл, восстановление микродетализации и текстуры кожи без мыла',
  'utility',
  'РОЛЬ: Ведущий цифровой ретушер и колорист эдиториал-глянца высшей категории (High-End Retouch Specialist).
ЗАДАЧА: Выполни бескомпромиссное восстановление, увеличение микродетализации и премиальный апскейл загруженной фотографии без малейшего искажения личности и композиции.

1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ИСХОДНИКА:
- Строго сохрани: геометрию и черты лица, форму глаз, носа, губ, овал лица, оригинальную прическу, цвет волос, позу, одежду, украшения, фоновые объекты и геометрию кадра.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО: менять возраст человека, превращать в другое лицо, накладывать чужие черты, менять пропорции тела или переделывать сцену.

2. ТЕХНИЧЕСКИЙ АПСКЕЙЛ И ОПТИЧЕСКАЯ ЧИСТОТА:
- Устрани цифровой шум, артефакты JPEG-компрессии, смаз и размытие.
- Восстанови естественную резкость радужки глаз, ресниц, текстуры губ, отдельных прядей волос и волокон ткани одежды.
- Сохрани естественный микрорельеф здоровой кожи с порами, исключи эффект пластикового мыла, восковой маски или искусственной размытости.

3. ЦВЕТОКОРРЕКЦИЯ И ОСВЕЩЕНИЕ:
- Выровняй баланс белого, натуральный теплый тон кожи (skintone), глубокий динамический диапазон теней и деликатные света.
{{quality}}
{{avoid}}',
  '["quality", "avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'refine',
  'Интерактивное редактирование (Точечный ретуш)',
  'Точечное внесение изменений по текстовой инструкции пользователя с сохранением лица',
  'utility',
  'РОЛЬ: Профессиональный журнальный фотограф и мастер эдиториал-редактирования (High-End Editorial Photo Editor).
ЗАДАЧА: Точечно и аккуратно внеси изменения в исходную фотографию в строгом соответствии с пользовательской инструкцией.

ПРАВИЛА ИЗМЕНЕНИЯ И СОХРАНЕНИЯ:
1. ИЗОЛИРОВАННОЕ ВМЕШАТЕЛЬСТВО:
- Меняй ИСКЛЮЧИТЕЛЬНО то, о чём прямо сказано в инструкции пользователя.
- Все остальные части кадра (одежда, фон, поза, освещение, окружение) должны остаться нетронутыми, если инструкция их не затрагивает.

2. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ЛИЧНОСТИ:
- Если инструкция не требует изменения внешности — черты лица, анатомия, разрез глаз, улыбка, индивидуальные особенности и стрижка человека ДОЛЖНЫ быть сохранены на 100%.

3. ОРГАНИЧНОСТЬ И ОПТИЧЕСКИЙ ФОТОРЕАЛИЗМ:
- Любое добавление или модификация элементов должны физически и оптически соответствовать схеме освещения, резкости и глубине резкости (DoF) исходного снимка.

ИНСТРУКЦИЯ ПОЛЬЗОВАТЕЛЯ:
{{edit}}
{{avoid}}',
  '["edit", "avoid"]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES (
  'avoid_default',
  'Базовый список ограничений (Avoid / Negative Prompt)',
  'Глобальные негативные токены для предотвращения старения, пластика, лишних пальцев и дефектов анатомии',
  'utility',
  'Avoid: premature aging, exaggerated wrinkles, deep nasolabial folds, tired eyes, dark circles under eyes, heavy eye bags, weathered haggard skin, coarse skin relief, plastic mannequin skin, artificial blur, distorted anatomy, extra fingers, unnatural hands, watermarks, logos, text overlays, and any face that does not match the IDENTITY photos.',
  '[]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();
