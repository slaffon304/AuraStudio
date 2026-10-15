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
-- Creates/upgrades the generation_prompts table, configures RLS, and seeds
-- all 13 exhaustive production prompts for Single, Couple, Pinterest,
-- Enhance, Refine, and Avoid pipelines with full parity.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.generation_prompts (
  key text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  description text,
  category text NOT NULL DEFAULT 'general',
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_prompts ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.generation_prompts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.generation_prompts ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';
ALTER TABLE public.generation_prompts ADD COLUMN IF NOT EXISTS variables jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.generation_prompts ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.generation_prompts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_generation_prompts_category ON public.generation_prompts (category);

ALTER TABLE public.generation_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on generation_prompts" ON public.generation_prompts;
DROP POLICY IF EXISTS "Allow read access to prompts" ON public.generation_prompts;
CREATE POLICY "Allow read access to prompts"
  ON public.generation_prompts
  FOR SELECT
  TO authenticated, anon, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow service role full access on generation_prompts" ON public.generation_prompts;
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

-- SEED / UPSERT ALL 13 PROMPTS WITH EXHAUSTIVE DIRECTIVES

INSERT INTO public.generation_prompts (key, name, description, category, body, variables)
VALUES
  (
    'avoid_default',
    'Глобальный негативный промпт по умолчанию',
    'Защита от восковой кожи Мадам Тюссо, большой головы, потери шеи, седины и искажений селфи',
    'general',
    'Avoid: wax figure face, Madame Tussauds wax look, silicone skin, plastic mannequin skin, airbrushed blur, beauty filter smoothing, porcelain doll face, oversized head, bobblehead proportions, enlarged head filling the entire mask, missing neck, chin resting directly on collar, wide-angle selfie distortion, flat front-facing selfie paste on angled body, sleepy half-closed eyelids, sullen frowned expression, premature aging, unrequested gray hair, gray beard, salt-and-pepper stubble instead of full beard, altered beard shape, shaved beard, unrequested facial stubble, exaggerated wrinkles, deep nasolabial folds, double chin, tired eyes, dark circles under eyes, heavy eye bags, skin tone mismatch between face and hands, distorted anatomy, extra fingers, unnatural hands, watermarks, logos, text overlays, and any face that does not match the IDENTITY photos.',
    '{}'::text[]
  ),
  (
    'mask_pinterest',
    'Pinterest Одиночный: Маска головы/волос на референсе',
    'Подготовка точной серой маски (#C0C0C0) для бесшовного встраивания',
    'pinterest',
    'РОЛЬ: Технический специалист по маскированию для прецизионного фотомонтажа (Inpainting Masking Specialist).
ЗАДАЧА: Сгенерируй точную изолирующую маску для оригинального изображения Pinterest [ORIGINAL_REFERENCE], подготовив кадр к безупречному бесшовному композитингу в Pass 2.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К СОХРАНЕНИЮ И МАСКЕ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОГО КАДРА [ORIGINAL_REFERENCE]:
- Верни ТО ЖЕ САМОЕ изображение, что на входе, БЕЗ каких-либо изменений композиции, позы, тела, одежды, фона, освещения, геометрии и пропорций.
- Все детали одежды (пиджак, рубашка, пальто, воротник, лацканы, пуговицы, фактура ткани), руки, пальцы, часы, браслеты, кольца на руках, интерьер и фон должны остаться кристально четкими, резкими и нетронутыми.
- ВНИМАНИЕ ПО АКСЕССУАРАМ: любые аксессуары на лице, голове или ушах модели с референса (очки, солнцезащитные очки, серьги, пирсинг, головные уборы) закрашиваются маской вместе с лицом и ушами для чистого переноса лица пользователя. Украшения на одежде и теле вне зоны шеи сохраняются нетронутыми.

2. ЗОНА МАСКИРОВАНИЯ:
- Аккуратно, плотно и сплошной нейтральной светло-серой заливкой (#C0C0C0) закрась ИСКЛЮЧИТЕЛЬНО лицо, уши, открытую часть шеи и всю прическу/волосы человека на кадре.

3. ГРАНИЦЫ МАСКИ (PRECISION EDGES):
- Граница маски по воротнику одежды должна быть идеально точной — маска доходит ровно до края ткани воротника, не заходя на саму ткань и не оставляя неокрашенных зазоров между шеей и одеждой.
- Граница маски по волосам аккуратно охватывает контур прически без повреждения фоновых объектов.
- Результат: тот же самый исходный кадр с ровной серой зоной (#C0C0C0) для последующего встраивания лица пользователя.',
    '{}'::text[]
  ),
  (
    'mask_pinterest_couple',
    'Pinterest Пара: Маска лиц/волос обоих людей',
    'Изоляция двух голов на парном референсе нейтральным серым цветом (#C0C0C0)',
    'pinterest',
    'РОЛЬ: Технический специалист по маскированию для фотомонтажа парных сцен (Inpainting Masking Specialist).
ЗАДАЧА: Сгенерируй точную изолирующую маску для оригинального парного изображения Pinterest [ORIGINAL_REFERENCE], подготовив кадр к безупречному бесшовному композитингу в Pass 2.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К СОХРАНЕНИЮ И МАСКЕ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОГО КАДРА [ORIGINAL_REFERENCE]:
- Верни ТО ЖЕ САМОЕ изображение, что на входе, БЕЗ каких-либо изменений композиции, поз тел обоих персонажей, одежды, фона, освещения, геометрии и пропорций.
- Все детали одежды обоих персонажей (костюмы, платья, рубашки, воротники, лацканы, пуговицы, текстуры ткани), объятия, руки, переплетенные пальцы, часы, браслеты, кольца на руках, интерьер и фон должны остаться кристально четкими, резкими и нетронутыми.
- ВНИМАНИЕ ПО АКСЕССУАРАМ: любые аксессуары на лицах, головах или ушах моделей с референса (очки, солнцезащитные очки, серьги, пирсинг, головные уборы) закрашиваются маской вместе с лицами и ушами для чистого переноса лиц пользователей. Украшения на одежде и телах вне зоны шеи сохраняются нетронутыми.

2. ЗОНА МАСКИРОВАНИЯ:
- Аккуратно, плотно и сплошной нейтральной светло-серой заливкой (#C0C0C0) закрась лица, уши, открытые части шеи и все волосы ОБОИХ людей на кадре (Персонажа А и Персонажа Б).

3. ГРАНИЦЫ МАСКИ (PRECISION EDGES):
- Границы маски по воротникам и декольте одежды обоих персонажей должны быть идеально точными — маска доходит ровно до края ткани, не заходя на саму ткань и не оставляя незакрашенных зазоров.
- Границы маски по прическам аккуратно охватывают контуры волос без повреждения фона и окружения.
- Результат: тот же самый исходный парный кадр с ровными серыми зонами (#C0C0C0) для последующего встраивания голов двух пользователей.',
    '{}'::text[]
  ),
  (
    'pass1_couple',
    'Парный шаблон: Проход 1 (Фокус на обоих лицах и 3D-посадке)',
    'Генерация парного кадра 1K с приоритетом 95% на обязательную замену ОБОИХ лиц, их масштаб и 3D-поворот',
    'couple',
    'РОЛЬ: Всемирно признанный портретный фотограф романтических парных съемок (уровня Vogue и Vanity Fair).
ЗАДАЧА: Сгенерируй фотореалистичный кадр ДВУХ людей вместе в позах и свете шаблона [POSE_AND_LIGHTING_REFERENCE].
АБСОЛЮТНЫЙ ПРИОРИТЕТ PASS 1 (95% ВНИМАНИЯ — НА ОБА ЛИЦА И ПОСАДКУ ГОЛОВ): Фоновая архитектура и окружение в этом проходе вторичны. Твоя главная обязанность — на 100% заменить ОБА лица (и Персонажа А слева, и Персонажа Б справа) на реальные лица из [IDENTITY_A_PHOTOS] и [IDENTITY_B_PHOTOS] в правильном 3D-повороте и масштабе. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО оставлять лицо актера или актрисы с шаблона [POSE_AND_LIGHTING_REFERENCE] даже на дальнем ростовом плане!

1. СТРОЖАЙШАЯ ИЗОЛЯЦИЯ, 3D-АНАТОМИЯ ОБОИХ ЛИЦ И КОРРЕКЦИЯ ОПТИКИ СЕЛФИ:
- ПЕРСОНАЖ А (СЛЕВА): воссоздай точную 3D-анатомию лица исключительно по [IDENTITY_A_PHOTOS] (межзрачковое расстояние, разрез и цвет глаз, форма век и бровей, спинка и кончик носа, губы, скулы, челюсть и подбородок).
- ПЕРСОНАЖ Б (СПРАВА): воссоздай точную 3D-анатомию лица исключительно по [IDENTITY_B_PHOTOS] (межзрачковое расстояние, разрез и цвет глаз, форма век и бровей, спинка и кончик носа, губы, скулы, челюсть и подбородок).
- КОРРЕКЦИЯ ОПТИКИ СЕЛФИ (24mm -> 85mm): скорректируй широкоугольные искажения телефонных селфи (убери раздутую вблизи нижнюю челюсть, большой нос и ракурс снизу с открытыми ноздрями), приведя оба лица к естественной портретной оптике 85mm.
- СТРОЖАЙШИЙ ЗАПРЕТ: запрещено оставлять черты лица моделей с шаблона, смешивать черты Персонажа А и Персонажа Б или менять их местами.

2. ВОЛОСЫ И РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А: стрижка, линия роста волос, пробор, объем и натуральный цвет волос берутся строго из [IDENTITY_A_PHOTOS].
- ПЕРСОНАЖ Б: стрижка, линия роста волос, пробор, объем и натуральный цвет волос берутся строго из [IDENTITY_B_PHOTOS].
- РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ (БОРОДА, УСЫ, ЩЕТИНА): для каждого персонажа сохрани точную форму, контур, длину, густоту и натуральный цвет бороды и усов из его фото (без добавления седины и без превращения плотной бороды в редкую щетину). Если персонаж гладко выбрит — оставь гладко выбритым. Прически и бороды моделей с шаблона полностью игнорировать.

3. 3D-ПОСАДКА ГОЛОВ, МАСШТАБ И ВЗАИМОДЕЙСТВИЕ [POSE_AND_LIGHTING_REFERENCE]:
- ТОЧНЫЙ 3D-ПОВОРОТ И НАКЛОН: поверни и наклони головы и шеи обоих персонажей в 3D точно так, как повернуты их плечи и тела на [POSE_AND_LIGHTING_REFERENCE] (сохраняя романтичный наклон голов друг к другу). Запрещено вставлять плоский вертикальный анфас с селфи на повернутое вполоборота тело!
- СООТНОШЕНИЕ И МАСШТАБ ГОЛОВ: головы мужчины и женщины должны быть анатомически соразмерны друг другу и своим телам (на ростовом кадре — строго ~1/8 от высоты тела, без эффекта большой головы). Обязательно сохраняй естественную видимую длину шеи над воротником рубашки/платья.

4. ЖИВАЯ МИМИКА И ЕДИНЫЙ СВЕТ СЦЕНЫ:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Не переноси с домашних селфи сонные полуприкрытые веки, хмурое межбровье или плотно сжатые губы. Оба персонажа должны иметь живой, открытый взгляд и теплую, естественную полуулыбку/улыбку.
- Освети оба лица единым светом из [POSE_AND_LIGHTING_REFERENCE] (например, теплым контровым закатным светом и мягкими рефлексами), убрав плоскую засветку с селфи.

5. НАСТОЯЩАЯ ЖИВАЯ КОЖА (RAW UNRETOUCHED SKIN — БЕЗ ВОСКА):
- Сохраняй живую, необработанную фототекстуру кожи обоих персонажей с естественными порами и микрорельефом. Полностью исключить эффект восковых фигур (Madame Tussauds wax look), силиконовый блюр и кукольное мыло. Не добавлять искусственных возрастных морщин или седины.

КОНТЕКСТ СЦЕНЫ:
{{scene}}
{{age1}}
{{age2}}
{{body}}
{{avoid}}',
    ARRAY['expression', 'scene', 'age1', 'age2', 'body', 'avoid']::text[]
  ),
  (
    'pass1_enhance',
    'Улучшение фото (Enhance / Upscale)',
    'Восстановление микродеталей, резкости взгляда и живой текстуры кожи без эффекта воска',
    'enhance',
    'РОЛЬ: Ведущий специалист по оптической реконструкции и цифровой проявке фотографий (High-End Optical Restoration Specialist).
ЗАДАЧА: Выполни бескомпромиссное восстановление резкости, микродетализации и премиальный апскейл загруженной фотографии [IMAGE_TO_ENHANCE] без малейшего искажения личности, пропорций и композиции.

1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ИСХОДНИКА [IMAGE_TO_ENHANCE]:
- Строго сохрани: геометрию и черты лица, форму и цвет глаз, носа, губ, овал лица, оригинальную прическу, цвет волос, точную форму, густоту и цвет бороды/усов (при наличии), позу, масштаб головы, одежду, украшения, фоновые объекты и геометрию кадра.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО: менять возраст человека, добавлять седину, превращать в другое лицо, накладывать чужие черты, менять пропорции головы/тела или переделывать сцену.

2. ТЕХНИЧЕСКИЙ АПСКЕЙЛ И ЖИВАЯ ТЕКСТУРА КОЖИ (БЕЗ ВОСКА):
- Устрани цифровой шум, артефакты JPEG-компрессии, смаз и размытие.
- Восстанови кристальную оптическую резкость радужки глаз, ресниц, бровей, текстуры губ, отдельных прядей волос, волосков бороды и волокон ткани одежды.
- Сохрани настоящую живую необработанную текстуру кожи (Raw unretouched skin) с естественными микропорами и рельефом эпидермиса. КАТЕГОРИЧЕСКИ ИСКЛЮЧИ эффект восковой фигуры (Madame Tussauds wax look), пластикового мыла, силиконовой маски или бьюти-блюра.

3. ЦВЕТОКОРРЕКЦИЯ И ОСВЕЩЕНИЕ:
- Выровняй чистый баланс белого, естественный живой тон кожи (skintone), глубокий динамический диапазон теней и деликатные света.
{{quality}}
{{avoid}}',
    ARRAY['quality', 'avoid']::text[]
  ),
  (
    'pass1_pinterest',
    'Pinterest Одиночный: Проход 1 (Фокус на лице и 3D-посадке)',
    'Генерация кадра 1K по референсу Pinterest с приоритетом 95% на 3D-анатомию лица, масштаб головы и живую кожу',
    'pinterest',
    'РОЛЬ: Всемирно известный портретный и эдиториал-фотограф в эстетике Pinterest и Vogue.
ЗАДАЧА: Сгенерируй фотореалистичный кадр человека из [USER_IDENTITY_PHOTOS] в позе и свете референса Pinterest [POSE_AND_LIGHTING_REFERENCE].
АБСОЛЮТНЫЙ ПРИОРИТЕТ PASS 1 (95% ВНИМАНИЯ — НА ЛИЦО И ПОСАДКУ ГОЛОВЫ): Детали дальнего фона в этом проходе вторичны. Направь весь вычислительный ресурс на точную 3D-реконструкцию лица пользователя, правильный анатомический масштаб головы относительно плеч, точный поворот шеи и живую необработанную текстуру кожи.

1. ИДЕНТИЧНОСТЬ, 3D-РЕКОНСТРУКЦИЯ И КОРРЕКЦИЯ ОПТИКИ СЕЛФИ [USER_IDENTITY_PHOTOS]:
- Сопоставь все предоставленные фото в [USER_IDENTITY_PHOTOS] для точного воссоздания разреза, посадки и цвета глаз, формы век и бровей, спинки и кончика носа, губ, скул, челюсти и подбородка.
- КОРРЕКЦИЯ ОПТИКИ СЕЛФИ (24mm -> 85mm): убери широкоугольные искажения телефонной фронталки (раздутую вблизи челюсть и ракурс снизу), пересчитав лицо под портретный объектив 85mm.
- ВОЛОСЫ И РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ: стрижка, пробор, объем и цвет волос, а также точная форма, контур, длина, густота и цвет бороды/усов/щетины берутся ИСКЛЮЧИТЕЛЬНО из [USER_IDENTITY_PHOTOS] (без добавления седины и без превращения бороды в щетину; если гладко выбрит — без щетины).
- Лицо, прическу и бороду модели с референса Pinterest копировать категорически запрещено.

2. ПРОСТРАНСТВЕННАЯ ПОСАДКА ГОЛОВЫ, ШЕЯ И МАСШТАБ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори 3D-поворот головы, наклон шеи и направление взгляда из [POSE_AND_LIGHTING_REFERENCE]. Запрещено приклеивать плоское селфи анфас на повернутое тело.
- Размер головы должен быть строго пропорционален плечам и телу (~1/8 от роста на ростовых кадрах), с естественной видимой длиной шеи над воротником.
- Воспроизведи направление и температуру света из референса Pinterest, убрав плоский свет с селфи.

3. ЖИВАЯ МИМИКА И НАСТОЯЩАЯ ТЕКСТУРА КОЖИ (БЕЗ ВОСКА):
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Взгляд открытый и живой (без сонных век и зажатых губ с селфи), мимика естественная и мягкая.
- Кожа на 100% живая и фотографичная (Raw unretouched skin): с реальными микропорами и естественным рельефом, без эффекта восковой куклы (Madame Tussauds wax look), силикона или пластикового блюра. Не старить и не добавлять седины.

КОНТЕКСТ СЦЕНЫ:
{{scene}}
{{age1}}
{{body}}
{{avoid}}',
    ARRAY['expression', 'scene', 'age1', 'body', 'avoid']::text[]
  ),
  (
    'pass1_pinterest_couple',
    'Pinterest Пара: Проход 1 (Фокус на обоих лицах и 3D-посадке)',
    'Генерация парного кадра 1K по Pinterest с приоритетом 95% на обязательную замену ОБОИХ лиц, их масштаб и 3D-поворот',
    'pinterest',
    'РОЛЬ: Топовый портретный фотограф романтических парных съемок в эстетике Pinterest и Vogue.
ЗАДАЧА: Сгенерируй фотореалистичный кадр ДВУХ людей вместе в позах и свете референса Pinterest [POSE_AND_LIGHTING_REFERENCE].
АБСОЛЮТНЫЙ ПРИОРИТЕТ PASS 1 (95% ВНИМАНИЯ — НА ОБА ЛИЦА И ПОСАДКУ ГОЛОВ): Детали дальнего фона в этом проходе вторичны. Твоя главная обязанность — на 100% заменить ОБА лица (Персонажа А слева и Персонажа Б справа) на реальные лица из [IDENTITY_A_PHOTOS] и [IDENTITY_B_PHOTOS] в правильном 3D-повороте и масштабе. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО оставлять лица моделей с референса Pinterest даже на ростовом кадре!

1. СТРОЖАЙШАЯ ИЗОЛЯЦИЯ, 3D-АНАТОМИЯ ОБОИХ ЛИЦ И КОРРЕКЦИЯ ОПТИКИ СЕЛФИ:
- ПЕРСОНАЖ А (СЛЕВА): воссоздай точную 3D-анатомию лица исключительно по [IDENTITY_A_PHOTOS] (межзрачковое расстояние, разрез и цвет глаз, веки, брови, нос, губы, скулы, челюсть и подбородок).
- ПЕРСОНАЖ Б (СПРАВА): воссоздай точную 3D-анатомию лица исключительно по [IDENTITY_B_PHOTOS] (межзрачковое расстояние, разрез и цвет глаз, веки, брови, нос, губы, скулы, челюсть и подбородок).
- КОРРЕКЦИЯ ОПТИКИ СЕЛФИ (24mm -> 85mm): убери широкоугольные искажения телефонных селфи (раздутую челюсть, крупный нос и ракурс снизу), приведя оба лица к портретной оптике 85mm.
- Запрещено смешивать черты двух людей, менять их местами или копировать лица моделей с Pinterest.

2. ВОЛОСЫ И РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ ОБОИХ ПЕРСОНАЖЕЙ:
- Стрижка, пробор, объем и натуральный цвет волос, а также точная форма, контур, длина, густота и цвет бороды/усов каждого персонажа берутся строго из его фото ([IDENTITY_A_PHOTOS] и [IDENTITY_B_PHOTOS]) без седины и без превращения бороды в щетину. Прически и растительность моделей с Pinterest полностью игнорировать.

3. 3D-ПОСАДКА ГОЛОВ, МАСШТАБ И СВЕТ [POSE_AND_LIGHTING_REFERENCE]:
- Поверни и наклони головы и шеи обоих персонажей в 3D строго в соответствии с разворотом их плеч и тел на [POSE_AND_LIGHTING_REFERENCE]. Не приклеивай плоский анфас с селфи!
- Головы обоих партнеров должны быть соразмерны друг другу и пропорциональны телам (~1/8 от роста на ростовых кадрах), с видимой естественной шеей над воротником.
- Воспроизведи единую световую схему референса Pinterest на обоих лицах.

4. ЖИВАЯ МИМИКА И НАСТОЯЩАЯ ТЕКСТУРА КОЖИ (БЕЗ ВОСКА):
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Открытый живой взгляд и теплая естественная полуулыбка/улыбка у обоих (без сонных век и хмуро сжатых губ с селфи).
- Настоящая живая фототекстура кожи (Raw unretouched skin) с естественными порами без эффекта восковых фигур (Madame Tussauds wax look), силикона и мыльного блюра.

КОНТЕКСТ СЦЕНЫ:
{{scene}}
{{age1}}
{{age2}}
{{body}}
{{avoid}}',
    ARRAY['expression', 'scene', 'age1', 'age2', 'body', 'avoid']::text[]
  ),
  (
    'pass1_template',
    'Одиночный шаблон: Проход 1 (Фокус на лице и 3D-посадке)',
    'Генерация базового портрета 1K с приоритетом 95% на 3D-анатомию лица, масштаб головы и живую кожу',
    'template',
    'РОЛЬ: Ты — всемирно признанный портретный фотограф высшего эшелона (уровня Vogue, Vanity Fair и Leica Master).
ЗАДАЧА: Сгенерируй фотореалистичный кадр человека из [USER_IDENTITY_PHOTOS] в позе и свете шаблона [POSE_AND_LIGHTING_REFERENCE].
АБСОЛЮТНЫЙ ПРИОРИТЕТ PASS 1 (95% ВНИМАНИЯ — НА ЛИЦО И ПОСАДКУ ГОЛОВЫ): Окружение и фон сцены в этом проходе вторичны. Направь весь вычислительный ресурс на безупречную 3D-реконструкцию лица пользователя, правильный анатомический масштаб головы относительно плеч, точный поворот шеи и живую необработанную текстуру кожи. Даже если кадр ростовой (в полный рост) — лицо обязано быть проработано с максимальной четкостью и 100% сходством.

1. ИДЕНТИЧНОСТЬ, 3D-РЕКОНСТРУКЦИЯ И КОРРЕКЦИЯ ОПТИКИ СЕЛФИ [USER_IDENTITY_PHOTOS]:
- В [USER_IDENTITY_PHOTOS] предоставлены основное селфи и дополнительные ракурсы лица пользователя.
- СИНТЕЗИРУЙ ТОЧНУЮ 3D-АНАТОМИЮ: воссоздай уникальное межзрачковое расстояние, разрез, глубину посадки и точный цвет глаз, форму век и бровей, ширину спинки и форму кончика носа, контур и объем губ, скуловые дуги, линию челюсти и подбородка.
- КОРРЕКЦИЯ ОПТИКИ СЕЛФИ (24mm -> 85mm): учитывай, что телефонное селфи снято с близкого расстояния (и часто чуть снизу), что оптически укрупняет нос и челюсть и открывает ноздри. Пересчитай лицо под благородное портретное фокусное расстояние 85mm: сохрани 100% узнаваемость черт, но убери бочкообразное искажение фронтальной камеры и ракурс снизу.
- ВОЛОСЫ И РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ: стрижка, длина прядей, линия роста волос, пробор, объем и натуральный цвет волос, а также точная форма, контур, длина, густота и цвет бороды/усов/щетины берутся ИСКЛЮЧИТЕЛЬНО из [USER_IDENTITY_PHOTOS]. Категорически запрещено сбривать бороду, превращать плотную бороду в редкую щетину или добавлять седину. Если пользователь гладко выбрит — оставь лицо гладко выбритым.
- СТРОГИЙ ЗАПРЕТ: категорически запрещено оставлять или копировать черты лица, прическу или щетину актера из [POSE_AND_LIGHTING_REFERENCE].

2. ПРОСТРАНСТВЕННАЯ ПОСАДКА ГОЛОВЫ, ШЕЯ И МАСШТАБ [POSE_AND_LIGHTING_REFERENCE]:
- ТОЧНЫЙ 3D-ПОВОРОТ И НАКЛОН: голова и шея должны быть повернуты и наклонены в 3D-пространстве строго в соответствии с разворотом плеч и корпуса на [POSE_AND_LIGHTING_REFERENCE]. Категорически запрещено приклеивать плоское лицо анфас с селфи на повернутый вполоборота корпус.
- АНАТОМИЧЕСКИЙ МАСШТАБ ГОЛОВЫ И ВИДИМАЯ ШЕЯ: размер головы должен быть строго пропорционален ширине плеч и росту тела (на ростовом кадре — строго ~1/8 от высоты тела). Обязательно сохраняй естественную длину и изгиб открытой шеи над воротником одежды; подбородок не должен лежать прямо на воротнике.
- СВЕТ СЦЕНЫ: воспроизведи направление, контраст и цветовую температуру света из [POSE_AND_LIGHTING_REFERENCE] (включая контровой свет и мягкие тени на лице), полностью убрав плоскую фронтальную засветку и паразитные оттенки с домашнего селфи.

3. ЖИВАЯ МИМИКА (БЕЗ ЗАЖАТОСТИ СЕЛФИ):
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Не переноси с домашнего селфи тяжелые сонные/полуприкрытые веки, угрюмую межбровную складку или зажатые в прямую линию губы. Взгляд должен быть открытым, ясным и живым, а мимика — легкой, приветливой и естественной для анатомии пользователя (без карикатурных оскалов и гримас).

4. НАСТОЯЩАЯ ЖИВАЯ ТЕКСТУРА КОЖИ (RAW UNRETOUCHED PHOTOGRAPHY — БЕЗ ЭФФЕКТА ВОСКА):
- Кожа должна выглядеть на 100% живой и настоящей, как на необработанном снимке с профессиональной камеры: с реальными микропорами, естественным рельефом эпидермиса и живым рассеиванием света.
- КАТЕГОРИЧЕСКИЙ ЗАПРЕТ на эффект восковой фигуры (Madame Tussauds wax look), силиконовое размытие, бьюти-фильтры и пластиковую гладкость манекена. В то же время не старить лицо и не добавлять искусственных глубоких морщин или темных мешков под глазами.

КОНТЕКСТ СЦЕНЫ:
{{scene}}
{{age1}}
{{body}}
{{avoid}}',
    ARRAY['expression', 'scene', 'age1', 'body', 'avoid']::text[]
  ),
  (
    'pass2_couple',
    'Парный шаблон: Проход 2 (Бесшовный парный композитинг без воска и большеголовости)',
    'Финальное встраивание двух голов в парную сцену с жестким контролем масштаба голов, 3D-поворота и Raw-текстуры кожи',
    'couple',
    'РОЛЬ: Ведущий мастер бесшовного фотомонтажа парных портретов мирового класса (High-End Master Editorial Compositor).
ЗАДАЧА: Выполни безупречное, физически достоверное встраивание (Pass 2) голов, лиц и шеи двух персонажей в маскированные области оригинальной сцены парного шаблона [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И АНАТОМИИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ СЦЕНЫ [SCENE_IMAGE]:
- Все позы тел, объятия, вся одежда (пиджаки, платья, рубашки, воротники, лацканы, фактура тканей, пуговицы), обувь и весь фон сохраняются на 100% нетронутыми из [SCENE_IMAGE].

2. СТРОЖАЙШИЙ КОНТРОЛЬ МАСШТАБА ГОЛОВ И ШЕИ (ЗАПРЕТ ЭФФЕКТА БОЛЬШОЙ ГОЛОВЫ!):
- КРИТИЧЕСКИ ВАЖНО: Серые маски на [SCENE_IMAGE] закрывают головы и пышные прически с большим запасом. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО растягивать лица или головы персонажей до краев серой маски!
- Голова Персонажа А (слева) и голова Персонажа Б (справа) должны быть строго соразмерны друг другу (мужская голова лишь минимально крупнее женской, никаких 1.5-кратных перекосов!) и строго пропорциональны ширине их плеч и росту тела (на ростовом кадре — ровно ~1/8 от высоты тела).
- ОБЯЗАТЕЛЬНО СОХРАНИ ВИДИМУЮ ШЕЮ: у мужчины между нижним краем бороды/подбородка и воротником белой рубашки должна быть четко видна естественная стройная шея. Подбородок и борода НЕ должны лежать на воротнике или распирать лацканы пиджака! Избыток серой маски вокруг голов и шеи аккуратно заполни фоном сцены (небом/архитектурой из [SCENE_IMAGE]).

3. 3D-ПОВОРОТ, НАКЛОН И МИМИКА (КОРРЕКЦИЯ СЕЛФИ):
- Ориентируясь на разворот плеч в [SCENE_IMAGE] и посадку в [POSE_GUIDE_IMAGE], разверни и наклони головы обоих персонажей в 3D-пространстве (если корпус мужчины повернут вполоборота к девушке — его голова и взгляд должны иметь естественный трехмерный поворот и легкий наклон к ней, с нормальной высотой подбородка на уровне глаз).
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО вклеивать сырой плоский вырез с телефонного селфи строго анфас с задранным подбородком, сонными полуприкрытыми веками или хмуро сжатыми губами! Лица обоих партнеров должны быть живыми, приветливыми, с открытым ясным взглядом и мягкой теплой полуулыбкой.

4. СТОПРОЦЕНТНАЯ ИДЕНТИЧНОСТЬ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ СЛЕВА: 100% узнаваемое лицо из [IDENTITY_A_PHOTOS] (точный разрез и цвет глаз, брови, нос, скулы, стрижка, цвет волос и точная форма/цвет бороды и усов без седины).
- ПЕРСОНАЖ СПРАВА: 100% узнаваемое лицо из [IDENTITY_B_PHOTOS] (точный разрез и цвет глаз, брови, нос, губы, скулы, прическа и цвет волос).
- Восстанавливать лица актеров с шаблона или смешивать черты двух людей категорически запрещено.

5. ЖИВАЯ НЕОБРАБОТАННАЯ КОЖА (RAW UNRETOUCHED SKIN — ПРОТИВ ЭФФЕКТА МАДАМ ТЮССО) И ЕДИНЫЙ СВЕТ:
- Кожа обоих персонажей обязана иметь настоящую, живую фотографическую микротекстуру (естественные поры, живой микрорельеф кожи, четкие отдельные волоски бровей и бороды).
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕН эффект восковой куклы (Madame Tussauds wax figure), силиконовая заливка, пластиковое сглаживание (airbrushing / skin smoothing) и плоские белесые блики!
- Полностью подчини освещение обоих лиц световой схеме сцены [SCENE_IMAGE] (если солнце светит сзади в контровом закате — лица должны быть в мягком теплом тоне с золотистым контровым рефлексом по контуру, без плоской фронтальной вспышки с селфи) и согласуй тон кожи лиц с открытыми участками тела (шея, декольте, руки, ноги).
{{avoid}}',
    ARRAY['avoid']::text[]
  ),
  (
    'pass2_pinterest',
    'Pinterest Одиночный: Проход 2 (Бесшовный композитинг и Raw-текстура)',
    'Финальное встраивание лица/головы в замаскированный референс Pinterest с контролем масштаба и без воска',
    'pinterest',
    'РОЛЬ: Мастер бесшовного эдиториал-композитинга мирового класса (High-End Master Compositor).
ЗАДАЧА: Выполни безупречное, физически достоверное встраивание (Pass 2) головы, лица и шеи пользователя в маскированную область оригинальной сцены Pinterest [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ФОТОРЕАЛИЗМА:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ СЦЕНЫ PINTEREST [SCENE_IMAGE]:
- Тело, поза, плечи, вся одежда (пиджак, платье, свитер, пальто, воротник, лацканы, пуговицы, текстура материала), руки, пальцы, аксессуары, окружение и весь фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].

2. СТРОГИЙ КОНТРОЛЬ МАСШТАБА ГОЛОВЫ И ДЛИНЫ ШЕИ (НЕ РАСТЯГИВАТЬ ПО МАСКЕ!):
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО растягивать или увеличивать голову пользователя на всю ширину и высоту серой маски!
- Размер головы должен быть строго пропорционален плечам, телу и воротнику одежды на [SCENE_IMAGE] (~1/8 от роста на ростовых кадрах, без эффекта большой головы).
- Обязательно сохрани естественную видимую длину и изгиб шеи над воротником; подбородок и борода не должны лежать прямо на ткани воротника. Лишнюю площадь серой маски вокруг головы и шеи заполни фоном из [SCENE_IMAGE].

3. 3D-ПОСАДКА И РАКУРС ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй [POSE_GUIDE_IMAGE] как основу правильного 3D-поворота и наклона головы, согласованного с разворотом плеч на [SCENE_IMAGE], и естественной живой мимики.

4. 100% ИДЕНТИЧНОСТЬ ПО [USER_IDENTITY_PHOTOS]:
- Лицо на финальном результате — 100% узнаваемый пользователь из [USER_IDENTITY_PHOTOS]: точная форма носа, разрез и цвет глаз, брови, скулы, подбородок, текстура и натуральный цвет волос, а также точная форма, густота и цвет бороды/усов (без седины и без превращения бороды в щетину). Восстанавливать лицо модели с Pinterest запрещено.

5. ЖИВАЯ НЕОБРАБОТАННАЯ КОЖА (RAW UNRETOUCHED SKIN — БЕЗ ВОСКА) И СВЕТ:
- Текстура кожи должна быть на 100% живой и настоящей: с реальными порами, естественным микрорельефом и четкими волосками бровей, ресниц и бороды.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕН эффект восковой фигуры (Madame Tussauds wax look), силиконового блюра или пластиковой маски!
- Полностью согласуй направление света, тени и тон кожи лица с освещением сцены и цветом кожи открытых участков тела (шея, руки) на [SCENE_IMAGE].
{{avoid}}',
    ARRAY['avoid']::text[]
  ),
  (
    'pass2_pinterest_couple',
    'Pinterest Пара: Проход 2 (Бесшовный композитинг без воска и большеголовости)',
    'Финальное встраивание двух голов в замаскированный референс Pinterest с контролем масштаба и Raw-кожей',
    'pinterest',
    'РОЛЬ: Мастер бесшовного эдиториал-композитинга мирового класса (High-End Master Compositor).
ЗАДАЧА: Выполни безупречное, физически достоверное встраивание (Pass 2) двух голов и шеи пользователей в соответствующие маскированные области парного референса Pinterest [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И АНАТОМИИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ СЦЕНЫ PINTEREST [SCENE_IMAGE]:
- Все позы тел, объятия, руки, переплетенные пальцы, вся одежда (костюмы, платья, свитера, пальто, воротники, лацканы, пуговицы, текстура материала), аксессуары, окружение и фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].

2. СТРОЖАЙШИЙ КОНТРОЛЬ МАСШТАБА ГОЛОВ И ШЕИ (ЗАПРЕТ ЭФФЕКТА БОЛЬШОЙ ГОЛОВЫ!):
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО растягивать лица или головы персонажей на всю площадь серой маски до краев!
- Голова Персонажа А (слева) и голова Персонажа Б (справа) должны быть строго соразмерны друг другу и пропорциональны ширине их плеч и росту тела (на ростовом кадре — ровно ~1/8 от высоты тела).
- ОБЯЗАТЕЛЬНО СОХРАНИ ВИДИМУЮ ШЕЮ над воротником рубашки/одежды у обоих персонажей (подбородок и борода не должны лежать прямо на ткани воротника). Избыток серой маски вокруг голов и шеи аккуратно заполни фоном из [SCENE_IMAGE].

3. 3D-ПОВОРОТ, НАКЛОН И МИМИКА:
- Ориентируясь на разворот плеч в [SCENE_IMAGE] и посадку в [POSE_GUIDE_IMAGE], разверни и наклони головы обоих персонажей в 3D-пространстве соответственно их телам. Не вклеивай плоский вырез анфас с селфи с задранным подбородком, сонными веками или сжатыми губами.

4. СТОПРОЦЕНТНАЯ ИДЕНТИЧНОСТЬ ОБОИХ ПЕРСОНАЖЕЙ:
- Левая область — 100% узнаваемый Персонаж А по [IDENTITY_A_PHOTOS]; правая область — 100% узнаваемый Персонаж Б по [IDENTITY_B_PHOTOS] (включая точный разрез и цвет глаз, нос, губы, стрижку, цвет волос и точную форму/цвет бороды и усов без седины). Восстанавливать лица с референса или смешивать черты запрещено.

5. ЖИВАЯ НЕОБРАБОТАННАЯ КОЖА (RAW UNRETOUCHED SKIN — БЕЗ ВОСКА) И СВЕТ:
- Кожа обоих персонажей обязана иметь настоящую живую фототекстуру с естественными порами, микрорельефом и четкими волосками бровей и бороды.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕН эффект восковых фигур (Madame Tussauds wax figure), силиконовой кожи и мыльного блюра!
- Полностью согласуй светотеневой рисунок, контровой или дневной свет и оттенок кожи лиц с освещением сцены и тоном открытых участков тела (шея, декольте, руки, ноги) на [SCENE_IMAGE].
{{avoid}}',
    ARRAY['avoid']::text[]
  ),
  (
    'pass2_template',
    'Одиночный шаблон: Проход 2 (Бесшовный композитинг и Raw-текстура)',
    'Финальное встраивание головы в маску сцены с контролем масштаба головы и живой текстурой кожи без воска',
    'template',
    'РОЛЬ: Ведущий мастер бесшовного фотомонтажа мирового класса (High-End Master Compositor).
ЗАДАЧА: Выполни безупречное, физически достоверное встраивание (Pass 2) головы, лица и шеи пользователя в маскированную серым область оригинальной сцены шаблона [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ИНТЕГРАЦИИ И ФОТОРЕАЛИЗМА:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ СЦЕНЫ [SCENE_IMAGE]:
- Тело, плечи, поза, весь костюм (пиджак, рубашка, воротник, лацканы, галстук, складки и текстура ткани), руки, пальцы, аксессуары и весь фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].

2. СТРОГИЙ КОНТРОЛЬ МАСШТАБА ГОЛОВЫ И ДЛИНЫ ШЕИ (НЕ РАСТЯГИВАТЬ ПО МАСКЕ!):
- КРИТИЧЕСКИ ВАЖНО: Серая маска на [SCENE_IMAGE] сделана с запасом по ширине и высоте. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО растягивать или увеличивать голову пользователя так, чтобы она заполняла всю серую маску от края до края!
- Размер головы должен быть строго пропорционален ширине плеч, грудной клетке и размеру воротника на [SCENE_IMAGE] (на ростовых кадрах — ровно ~1/8 от высоты тела, без эффекта большой головы / bobblehead).
- Обязательно сохрани естественную видимую высоту и стройность шеи между линией челюсти/бороды и воротником рубашки. Челюсть и борода НЕ должны лежать прямо на воротнике или распирать его. Лишнюю площадь серой маски вокруг контура головы, шеи и прически аккуратно восстанови деталями фона сцены [SCENE_IMAGE].

3. РАКУРС, ПОВОРОТ И СВЕТ ИЗ [POSE_GUIDE_IMAGE] (РЕЗУЛЬТАТ PASS 1):
- Возьми из [POSE_GUIDE_IMAGE] правильный 3D-поворот и наклон головы, соответствующий развороту корпуса и плеч на [SCENE_IMAGE], а также естественную живую мимику и открытый взгляд. Не приклеивай плоский анфас с селфи поверх повернутого тела.

4. 100% ИДЕНТИЧНОСТЬ ПО [USER_IDENTITY_PHOTOS]:
- Лицо на финальном кадре должно на 100% принадлежать человеку из [USER_IDENTITY_PHOTOS]: точный разрез и цвет глаз, форма бровей, носа, губ, скул, индивидуальная стрижка и цвет волос, а также точная форма, густота и натуральный цвет бороды/усов (без седины и без превращения бороды в щетину).
- Восстанавливать лицо актера из исходного шаблона или усреднять черты категорически запрещено.

5. ЖИВАЯ НЕОБРАБОТАННАЯ КОЖА (RAW UNRETOUCHED SKIN — ЗАПРЕТ ЭФФЕКТА МАДАМ ТЮССО) И СВЕДЕНИЕ СВЕТА:
- Текстура кожи должна быть на 100% настоящей, живой и фотографичной: с четкими естественными порами, микрорельефом кожи, детальными волосками бровей, ресниц и бороды.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО замыливать или разглаживать кожу в гладкий воск (Madame Tussauds wax figure), силикон или пластиковую маску! Никакого искусственного блюра (airbrushing / beauty filter).
- Полностью согласуй направление света, тени (включая контровой закатный или интерьерный свет) и оттенок кожи лица с освещением сцены и цветом кожи рук на [SCENE_IMAGE].
{{avoid}}',
    ARRAY['avoid']::text[]
  ),
  (
    'refine',
    'Правка фото (Refine / Edit)',
    'Изолированное точечное редактирование деталей кадра по текстовой инструкции',
    'refine',
    'РОЛЬ: Профессиональный фотограф и мастер точечного фотомонтажа (High-End Photo Editor).
ЗАДАЧА: Точечно и аккуратно внеси изменения в исходную фотографию [IMAGE_TO_EDIT] в строгом соответствии с пользовательской инструкцией.

ПРАВИЛА ИЗМЕНЕНИЯ И СОХРАНЕНИЯ:
1. ИЗОЛИРОВАННОЕ ВМЕШАТЕЛЬСТВО:
- Меняй ИСКЛЮЧИТЕЛЬНО то, о чём прямо сказано в инструкции пользователя.
- Все остальные части кадра (одежда, фон, поза, масштаб головы, освещение, окружение) должны остаться нетронутыми, если инструкция их не затрагивает.

2. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ЛИЧНОСТИ И ЖИВОЙ ТЕКСТУРЫ КОЖИ:
- Если инструкция не требует изменения внешности — черты лица, анатомия, разрез и цвет глаз, улыбка, индивидуальные особенности, стрижка, цвет волос и точная форма/цвет бороды и усов человека ДОЛЖНЫ быть сохранены на 100% без добавления седины, старения или воскового замыливания кожи.

3. ОРГАНИЧНОСТЬ И ОПТИЧЕСКИЙ ФОТОРЕАЛИЗМ:
- Любое добавление или модификация элементов должны физически и оптически соответствовать схеме освещения, резкости и глубине резкости (DoF) исходного снимка [IMAGE_TO_EDIT].

ИНСТРУКЦИЯ ПОЛЬЗОВАТЕЛЯ:
{{edit}}
{{avoid}}',
    ARRAY['edit', 'avoid']::text[]
  ),
  (
    'scene_analyze',
    '',
    '',
    'general',
    'Ты — фотодиректор. Разбери референсное фото и напиши бриф сцены для нейросети-генератора.

Формат ответа: один плотный связный текст (можно короткие блоки по пунктам ниже). Язык: английский. Без вступлений, без markdown-заголовков, без списков «на всякий случай».

Опиши сцену так, чтобы по тексту можно было повторить кадр. Заполни все пункты, которые видны на фото; чего нет — не выдумывай.

1) HERO (герой)
- Кто в кадре: one woman / one man / couple / family / group of friends / no people
- Сколько человек: точное число
- Позиции: left / center / right (для каждого, если их больше одного)

2) APPEARANCE (внешность) — только то, что видно; не превращай в паспортные данные
- Общий тип внешности с референса (без копирования «чьё это лицо» как id)
- Волосы: цвет, длина, укладка (если видно)
- Макияж: есть/нет, характер (если видно)
- Возраст: приблизительно, если читается
- Особенности, заметные в кадре (очки, борода и т.п.) — только факты с фото

3) WARDROBE (одежда)
- Цвет, материал, фасон, слойность
- Аксессуары, обувь — если видно
- Для пары/группы — одежда каждого кратко

4) ACTION (действие)
- Что делает: walks / sits / looks at camera / laughs / holds object и т.д.
- Руки, взгляд, взаимодействие между людьми (если двое+)

5) LOCATION (локация)
- Место: studio / city / forest / sea / cafe / car / other — конкретно по кадру
- Что слева / справа / сзади от героя

6) LIGHT (свет)
- Тип: morning / evening / soft studio / rim / window light и т.д.
- Направление, жёсткость, тени, отражения

7) COMPOSITION (композиция)
- Крупность: close-up / waist-up / hips-up / full body
- Где герой в кадре, насколько заполняет кадр

8) ANGLE (ракурс)
- frontal / three-quarter / profile / high angle / slight low angle
- Ощущение фокусного (35mm / 50mm / 85mm и т.п.), если угадывается
- Глубина резкости: сильное размытие фона / умеренное / всё резко

9) REALISM (реализм)
- Кожа/ткани/тени: natural skin texture, real shadows, depth of field — как на референсе
- COLOR MODE (обязательно): full color / black and white / monochrome
  Если референс ч/б или монохром — явно напиши black and white / monochrome photography.
  Запрещено описывать цветную палитру, если кадр не цветной.

10) CONSTRAINTS (ограничения для следующей генерации)
- do not copy the reference face as identity
- no text, no logos, no watermarks
- no deformed hands/anatomy
- no plastic skin smoothing
- keep the same number of people and their left/right positions
- keep the same color mode (color vs B&W)

Жёсткие правила:
- Не выдумывай объекты, людей и цвета, которых нет на фото.
- Число людей и их позиции — обязательны.
- Color mode — обязателен.
- Пиши конкретно, не общими словами вроде beautiful / nice lighting.',
    '{}'::text[]
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
  'Финальное встраивание головы и журнальная шлифовка в оригинальную сцену шаблона',
  'template',
  'РОЛЬ: Ведущий эксперт пост-продакшна и бесшовного фотомонтажа высочайшего уровня (Vogue / Harper''s Bazaar Master Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и финальную журнальную шлифовку (Pass 2) головы и лица пользователя в маскированную область оригинальной сцены шаблона [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ИНТЕГРАЦИИ И РЕТУШИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ СЦЕНЫ [SCENE_IMAGE]:
- Тело, плечи, поза, весь костюм (пиджак, рубашка, воротник, лацканы, галстук, складки ткани, пуговицы, текстура материала), руки, пальцы, мебель, передний план и фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].
- Закрашена маской ИСКЛЮЧИТЕЛЬНО область головы и шеи. Все остальные пиксели кадра должны быть идеально сохранены без сдвигов и искажений.

2. ПОСАДКА, РАКУРС И ЭМОЦИЯ ИЗ [POSE_GUIDE_IMAGE] (РЕЗУЛЬТАТ PASS 1):
- Используй [POSE_GUIDE_IMAGE] (результат Pass 1) как точную основу правильного угла посадки головы, наклона шеи, ракурса, прически и аккуратной органичной мимики/улыбки.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей до журнального совершенства.

3. ИДЕНТИЧНОСТЬ ПО ВСЕМ ФОТО [USER_IDENTITY_PHOTOS]:
- Лицо на финальном результате — это на 100% узнаваемый человек из [USER_IDENTITY_PHOTOS].
- Сверяй черты лица со всеми приложенными ракурсами (анфас, профиль, три четверти). Сохраняй индивидуальную форму носа, разрез и цвет глаз, очертания скул и подбородка, текстуру и натуральный цвет волос, а также точную форму, контур, густоту и натуральный цвет бороды/усов (при наличии) без добавления седины и без превращения бороды в редкую щетину.
- СТРОГИЙ ЗАПРЕТ: Восстанавливать лицо модели из исходной сцены [SCENE_IMAGE] категорически запрещено, заменять черты лица на усредненные лица из датасетов запрещено.

4. БЕСШОВНЫЙ СТЫК ВОРОТНИКА И ШЕИ (SEAMLESS COLLAR INTEGRATION):
- Безупречно состыковать шею с линией воротника одежды из [SCENE_IMAGE]. Никаких швов, зазоров, размытых пятен, ореолов или несоответствий толщины и наклона шеи.
- Сформируй естественные анатомические тени от подбородка на шею и от воротника на ключицы.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Идеально согласуй тона кожи (skintone), цветовую температуру (кельвины), направление бликов и контрастность лица под световую схему оригинальной сцены [SCENE_IMAGE], обеспечив безупречный баланс оттенка кожи лица с открытыми участками тела (шея, кисти рук) на [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: свежая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, седины, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд.
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
  'Парный шаблон: Проход 1 (Базовый портрет пары)',
  'Генерация базового парного кадра 1K со строгой изоляцией лиц А и Б и парной мимикой',
  'couple',
  'РОЛЬ: Всемирно признанный эдиториал-фотограф романтических парных фотосессий высшего эшелона (уровня Vogue Love, Vanity Fair Couples и Harper''s Bazaar).
ЗАДАЧА: Сгенерируй один высокохудожественный, бескомпромиссно фотореалистичный кадр ДВУХ людей вместе в СЦЕНЕ шаблона с идеальной посадкой голов, гармоничным романтическим взаимодействием, искренней мимикой и кинематографичным светом.

1. СТРОЖАЙШАЯ ИЗОЛЯЦИЯ И ПОЛНАЯ 3D-АНАТОМИЯ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А (СЛЕВА): синтезируй точную 3D-анатомию лица по [IDENTITY_A_PHOTOS]. Межзрачковое расстояние, форма и разрез глаз, оттенок и глубина радужки, форма век и бровей, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скуловых дуг, угол нижней челюсти и очертания подбородка берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_A_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- ПЕРСОНАЖ Б (СПРАВА): синтезируй точную 3D-анатомию лица по [IDENTITY_B_PHOTOS]. Межзрачковое расстояние, форма и разрез глаз, оттенок и глубина радужки, форма век и бровей, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скуловых дуг, угол нижней челюсти и очертания подбородка берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_B_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- СТРОЖАЙШИЙ ЗАПРЕТ: категорически запрещено смешивать черты лица между персонажами, переносить анатомию одного человека на другого, усреднять их внешность, менять местами левого и правого персонажей или копировать лица моделей из шаблона.

2. ВОЛОСЫ И РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А: стрижка, длина прядей, естественная линия роста, пробор, объем, фактура и оттенок/цвет волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_A_PHOTOS].
- ПЕРСОНАЖ Б: стрижка, длина прядей, естественная линия роста, пробор, объем, фактура и оттенок/цвет волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_B_PHOTOS].
- РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ (БОРОДА, УСЫ, ЩЕТИНА):
  * Для Персонажа А: если на фото есть борода, усы или щетина — в точности сохрани их форму, контур, длину, густоту, естественную фактуру и цвет из фото; если гладко выбрит — оставь гладко выбритым, без щетины. Категорически запрещено сбривать растительность, изменять её форму, превращать бороду в щетину или добавлять седину.
  * Для Персонажа Б: если на фото есть борода, усы или щетина — в точности сохрани их форму, контур, длину, густоту, естественную фактуру и цвет из фото; если гладко выбрит — оставь гладко выбритым, без щетины. Категорически запрещено сбривать растительность, изменять её форму, превращать бороду в щетину или добавлять седину.
- Описания причесок, цвета волос, возраста и растительности на лице из текста шаблона полностью игнорировать — генерировать только реальные волосы и растительность пользователей.

3. ВЫРАЖЕНИЯ ЛИЦ, ЭМОЦИИ И ОРГАНИЧНАЯ МИМИКА ПАРЫ:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Перенеси настроение шаблона (романтика, нежность, искренняя радость, доверие) тонко, мягко и органично индивидуальной анатомии лица каждого персонажа.
- Улыбки должны быть живыми, непринужденными, естественно приподнимающими уголки губ и скулы, с сияющим взглядом. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ грубые натянутые оскалы, неестественно растянутые челюсти, напряженные жевательные мышцы, карикатурные гримасы, перекосы мимических мышц, глубокие искусственные носогубные заломы или второй подбородок.
- Если персонажи смотрят друг на друга или в объектив — взгляд должен быть теплым, сфокусированным и живым.

4. ПОСАДКА ГОЛОВ, ВЗАИМОДЕЙСТВИЕ И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори парную композицию референса: взаимный наклон голов, поворот плеч, ракурсы шеи и направление взглядов.
- Воспроизведи единую световую схему: ключевой, заполняющий и контурный свет, согласующийся между обоими персонажами, мягкие гармоничные тени и естественные блики.

5. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть и упругость кожи для ОБОИХ персонажей. Не добавлять искусственных морщин, седины, кругов под глазами или следов усталости.
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
  'couple',
  'РОЛЬ: Эксперт по композитингу парных портретов и журнальной ретуши высшей категории (High-End Master Editorial Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и финальную журнальную шлифовку (Pass 2) лиц и голов двух персонажей в маскированные области оригинальной сцены парного шаблона [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ШЛИФОВКИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ СЦЕНЫ [SCENE_IMAGE]:
- Все позы тел, объятия, руки, переплетенные пальцы, вся одежда (пиджаки, платья, рубашки, воротники, лацканы, кружево, фактура тканей, пуговицы), аксессуары, глубина резкости и фон сохраняются на 100% нетронутыми из [SCENE_IMAGE].
- Закрашены маской ИСКЛЮЧИТЕЛЬНО области голов и шеи обоих персонажей. Все остальные пиксели кадра должны остаться в оригинальном неизменном виде.

2. РАЗДЕЛЬНОЕ ВСТРАИВАНИЕ ЛИЧНОСТЕЙ:
- ПЕРСОНАЖ СЛЕВА: замещается головой и лицом Персонажа А строго по [IDENTITY_A_PHOTOS] (сверка со всеми ракурсами). Сохраняй индивидуальную форму носа, разрез и цвет глаз, очертания скул и подбородка, текстуру и натуральный цвет волос, а также точную форму, контур, густоту и натуральный цвет бороды/усов (при наличии) без добавления седины и без превращения бороды в щетину.
- ПЕРСОНАЖ СПРАВА: замещается головой и лицом Персонажа Б строго по [IDENTITY_B_PHOTOS] (сверка со всеми ракурсами). Сохраняй индивидуальную форму носа, разрез и цвет глаз, очертания скул и подбородка, текстуру и натуральный цвет волос, а также точную форму, контур, густоту и натуральный цвет бороды/усов (при наличии) без добавления седины и без превращения бороды в щетину.
- СТРОГИЙ ЗАПРЕТ: Восстанавливать лица моделей из исходной сцены [SCENE_IMAGE] категорически запрещено, смешивать черты персонажей между собой, менять их местами или заменять на усредненные лица из датасетов запрещено.

3. ПОСАДКА, РАКУРСЫ И ЭМОЦИИ ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй результат Pass 1 [POSE_GUIDE_IMAGE] как точный ориентир правильной посадки голов, наклона шеи, ракурсов, причесок и аккуратных естественных выражений лиц.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей обоих персонажей до журнального совершенства.

4. БЕСШОВНЫЕ СТЫКИ ВОРОТНИКОВ И ШЕИ (SEAMLESS COLLAR INTEGRATION ДЛЯ ОБОИХ):
- Идеальное анатомическое сведение шеи Персонажа А с его линией воротника/одежды и шеи Персонажа Б с его линией воротника/декольте. Полное отсутствие швов, зазоров, ореолов, мыльных пятен или анатомических расхождений.
- Сформируй реалистичные контактные тени от подбородков на шеи и от одежды на ключицы в соответствии с направлением света.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Идеально сбалансируй тона кожи (skintone), цветовую температуру (кельвины), направление бликов и контраст лиц обоих персонажей под световую схему оригинальной сцены [SCENE_IMAGE], обеспечив безупречный баланс оттенка кожи лиц с открытыми участками тела (шея, декольте, кисти рук) на [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: гладкая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, седины, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд обоим персонажам.
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
  'Pinterest Одиночный: Проход 1 (Базовый кадр по референсу)',
  'Генерация кадра 1K по кинематографическому описанию Pinterest с сохранением лица',
  'pinterest',
  'РОЛЬ: Всемирно известный эдиториал-фотограф в эстетике Pinterest и Vogue.
ЗАДАЧА: Сгенерируй один высокохудожественный, фотореалистичный кадр человека из [USER_IDENTITY_PHOTOS] в СЦЕНЕ референса Pinterest с полной анатомической верностью лицу пользователя, естественной мимикой и кинематографичным светом.

1. ИДЕНТИЧНОСТЬ И ПОЛНАЯ 3D-РЕКОНСТРУКЦИЯ ЛИЦА ПО ФОТО [USER_IDENTITY_PHOTOS]:
- В [USER_IDENTITY_PHOTOS] предоставлены главное селфи и дополнительные ракурсы лица пользователя (анфас, три четверти, профиль).
- СИНТЕЗИРУЙ ТОЧНУЮ 3D-АНАТОМИЮ ЛИЦА: сопоставь все предоставленные фотографии для реконструкции реальных уникальных черт конкретного человека.
- ТОЧНЕЙШЕЕ ВОССОЗДАНИЕ ЧЕРТ: межзрачковое расстояние, форма и разрез глаз, оттенок и глубина радужки, форма век и бровей, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скуловых дуг, угол нижней челюсти и очертания подбородка.
- ВОЛОСЫ: стрижка, длина прядей, естественная линия роста, объем, пробор, фактура и оттенок/цвет волос берутся ИСКЛЮЧИТЕЛЬНО из фото пользователя.
- РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ (БОРОДА, УСЫ, ЩЕТИНА): если у пользователя на фото есть борода, усы или щетина — в точности сохрани их форму, контур, длину, густоту, естественную фактуру и цвет из фото пользователя. Категорически запрещено сбривать растительность, изменять её форму, превращать плотную бороду в редкую щетину или добавлять седину. Если пользователь гладко выбрит — оставь лицо гладко выбритым, не добавляя щетины.
- Прическу, цвет волос, возраст и растительность на лице модели с референса Pinterest полностью игнорировать — генерировать только реальные волосы и растительность пользователя.
- СТРОГИЙ ЗАПРЕТ: категорически запрещено заменять лицо пользователя лицом модели из Pinterest, усреднять черты лица или генерировать типовое чужое лицо из датасетов.

2. ВЫРАЖЕНИЕ ЛИЦА И ОРГАНИЧНАЯ МИМИКА РЕФЕРЕНСА:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- ВНИМАНИЕ: Эмоция референса переносится на лицо пользователя ОЧЕНЬ АККУРАТНО, мягко и органично индивидуальной анатомии лица.
- Если на референсе легкая улыбка — она должна быть искренней, естественной и живой, плавно приподнимающей скулы и уголки губ, с мягким блеском в глазах. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ грубые натянутые оскалы, неестественно растянутые челюсти, напряженные жевательные мышцы, карикатурные гримасы, перекосы мимических мышц, глубокие искусственные носогубные заломы или второй подбородок.
- Если на референсе задумчивый или расслабленный взгляд — передай спокойствие, мягкие губы и естественный фокус взгляда.

3. ПОСАДКА ГОЛОВЫ, РАКУРС И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори ракурс головы: угол поворота, наклон шеи и корпуса, высоту подбородка и направление взгляда из референса Pinterest.
- Световая схема: воспроизведи эстетику освещения референса (мягкий рассеянный дневной свет, золотой час, контровые блики на волосах и деликатные полутени).

4. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть взгляда и упругость кожи. Не добавлять искусственных морщин, седины, темных кругов, мешков под глазами или уставшего оттенка.
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
  'Pinterest Одиночный: Маска головы/волос на референсе',
  'Подготовка точной серой маски (#C0C0C0) для бесшовного встраивания',
  'pinterest',
  'РОЛЬ: Технический специалист по маскированию для прецизионного фотомонтажа (Inpainting Masking Specialist).
ЗАДАЧА: Сгенерируй точную изолирующую маску для оригинального изображения Pinterest [ORIGINAL_REFERENCE], подготовив кадр к безупречному бесшовному композитингу в Pass 2.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К СОХРАНЕНИЮ И МАСКЕ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОГО КАДРА [ORIGINAL_REFERENCE]:
- Верни ТО ЖЕ САМОЕ изображение, что на входе, БЕЗ каких-либо изменений композиции, позы, тела, одежды, фона, освещения, геометрии и пропорций.
- Все детали одежды (пиджак, рубашка, пальто, воротник, лацканы, пуговицы, фактура ткани), руки, пальцы, часы, браслеты, кольца на руках, интерьер и фон должны остаться кристально четкими, резкими и нетронутыми.
- ВНИМАНИЕ ПО АКСЕССУАРАМ: любые аксессуары на лице, голове или ушах модели с референса (очки, солнцезащитные очки, серьги, пирсинг, головные уборы) закрашиваются маской вместе с лицом и ушами для чистого переноса лица пользователя. Украшения на одежде и теле вне зоны шеи сохраняются нетронутыми.

2. ЗОНА МАСКИРОВАНИЯ:
- Аккуратно, плотно и сплошной нейтральной светло-серой заливкой (#C0C0C0) закрась ИСКЛЮЧИТЕЛЬНО лицо, уши, открытую часть шеи и всю прическу/волосы человека на кадре.

3. ГРАНИЦЫ МАСКИ (PRECISION EDGES):
- Граница маски по воротнику одежды должна быть идеально точной — маска доходит ровно до края ткани воротника, не заходя на саму ткань и не оставляя неокрашенных зазоров между шеей и одеждой.
- Граница маски по волосам аккуратно охватывает контур прически без повреждения фоновых объектов.
- Результат: тот же самый исходный кадр с ровной серой зоной (#C0C0C0) для последующего встраивания лица пользователя.',
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
  'Pinterest Одиночный: Проход 2 (Бесшовный композитинг в референс)',
  'Финальное встраивание лица/головы в замаскированный референс Pinterest',
  'pinterest',
  'РОЛЬ: Мастер бесшовного эдиториал-композитинга мирового класса (Vogue / Harper''s Bazaar Master Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и журнальную шлифовку (Pass 2) головы и лица пользователя в маскированную область оригинальной сцены Pinterest [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ШЛИФОВКИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ СЦЕНЫ PINTEREST [SCENE_IMAGE]:
- Тело, поза, плечи, вся одежда (пиджак, платье, свитер, пальто, воротник, лацканы, пуговицы, текстура материала), руки, пальцы, аксессуары, окружение и весь фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].
- Закрашена серой маской исключительно область головы и шеи. Все остальные пиксели кадра должны быть идеально сохранены.

2. ПОСАДКА, РАКУРС И ЭМОЦИЯ ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй [POSE_GUIDE_IMAGE] (результат Pass 1) как точную основу угла посадки головы, наклона шеи, ракурса, прически и аккуратной естественной мимики/улыбки.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей до журнального совершенства.

3. ИДЕНТИЧНОСТЬ ПО ВСЕМ ФОТО [USER_IDENTITY_PHOTOS]:
- Лицо на финальном результате — это на 100% узнаваемый человек из [USER_IDENTITY_PHOTOS].
- Сверяй черты лица со всеми приложенными ракурсами (анфас, профиль, три четверти). Сохраняй индивидуальную форму носа, разрез и цвет глаз, очертания скул и подбородка, текстуру и натуральный цвет волос, а также точную форму, контур, густоту и натуральный цвет бороды/усов (при наличии) без добавления седины и без превращения бороды в щетину.
- СТРОГИЙ ЗАПРЕТ: Восстанавливать лицо модели с Pinterest категорически запрещено, заменять черты лица на усредненные лица из датасетов запрещено.

4. БЕСШОВНЫЙ СТЫК ВОРОТНИКА И ШЕИ (SEAMLESS COLLAR INTEGRATION):
- Безупречно состыковать шею с линией воротника одежды из [SCENE_IMAGE]. Никаких швов, зазоров, размытых пятен, ореолов или несоответствий толщины и наклона шеи.
- Сформируй естественные анатомические тени от подбородка на шею и от воротника на ключицы.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Выровняй цветовую температуру кожи (skintone), направление бликов и контрастность лица под эстетику освещения оригинального кадра [SCENE_IMAGE], обеспечив безупречный баланс оттенка кожи лица с открытыми участками тела (шея, кисти рук) на [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: свежая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, седины, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд.
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
  'Pinterest Пара: Проход 1 (Базовый парный кадр по референсу)',
  'Генерация парного кадра 1K по анализу Pinterest с раздельной фиксацией лиц А и Б',
  'pinterest',
  'РОЛЬ: Топовый фотограф эдиториал-съемок и романтических парных лавстори в эстетике Pinterest мирового уровня.
ЗАДАЧА: Сгенерируй один высокохудожественный, фотореалистичный кадр ДВУХ людей вместе в СЦЕНЕ референса Pinterest с полной анатомической верностью лицам пользователей, точной посадкой и искренней мимикой.

1. СТРОЖАЙШАЯ ИЗОЛЯЦИЯ И ПОЛНАЯ 3D-АНАТОМИЯ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А (СЛЕВА): синтезируй точную 3D-анатомию лица по [IDENTITY_A_PHOTOS]. Межзрачковое расстояние, форма и разрез глаз, оттенок и глубина радужки, форма век и бровей, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скуловых дуг, угол нижней челюсти и очертания подбородка берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_A_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- ПЕРСОНАЖ Б (СПРАВА): синтезируй точную 3D-анатомию лица по [IDENTITY_B_PHOTOS]. Межзрачковое расстояние, форма и разрез глаз, оттенок и глубина радужки, форма век и бровей, ширина и линия спинки носа, форма кончика носа и ноздрей, фильтрум, арка купидона, контур и объем губ, форма скуловых дуг, угол нижней челюсти и очертания подбородка берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_B_PHOTOS] (учитывать главное селфи и все дополнительные ракурсы).
- СТРОЖАЙШИЙ ЗАПРЕТ: категорически запрещено смешивать черты лица между персонажами, переносить внешность одного на другого, усреднять черты, менять местами левого и правого персонажей, копировать лица людей с референса Pinterest или добавлять посторонних людей.

2. ВОЛОСЫ И РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ ОБОИХ ПЕРСОНАЖЕЙ:
- ПЕРСОНАЖ А: стрижка, длина прядей, естественная линия роста, пробор, объем, фактура и оттенок/цвет волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_A_PHOTOS].
- ПЕРСОНАЖ Б: стрижка, длина прядей, естественная линия роста, пробор, объем, фактура и оттенок/цвет волос берутся ИСКЛЮЧИТЕЛЬНО из [IDENTITY_B_PHOTOS].
- РАСТИТЕЛЬНОСТЬ НА ЛИЦЕ (БОРОДА, УСЫ, ЩЕТИНА):
  * Для Персонажа А: если на фото есть борода, усы или щетина — в точности сохрани их форму, контур, длину, густоту, естественную фактуру и цвет из фото; если гладко выбрит — оставь гладко выбритым, без щетины. Категорически запрещено сбривать растительность, изменять её форму, превращать бороду в щетину или добавлять седину.
  * Для Персонажа Б: если на фото есть борода, усы или щетина — в точности сохрани их форму, контур, длину, густоту, естественную фактуру и цвет из фото; если гладко выбрит — оставь гладко выбритым, без щетины. Категорически запрещено сбривать растительность, изменять её форму, превращать бороду в щетину или добавлять седину.
- Прически, цвет волос, возраст и растительность на лице моделей с Pinterest полностью игнорировать — генерировать только реальные волосы и растительность пользователей.

3. ВЫРАЖЕНИЯ ЛИЦ, ЭМОЦИИ И ОРГАНИЧНАЯ МИМИКА ПАРЫ:
- ЭМОЦИЯ СЦЕНЫ: {{expression}}.
- Перенеси настроение Pinterest (непринужденность, нежность, романтичный взгляд, уют) мягко и гармонично анатомии лиц пользователей.
- Улыбки должны быть живыми, непринужденными, естественно приподнимающими уголки губ и скулы, с сияющим взглядом. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ грубые натянутые оскалы, неестественно растянутые челюсти, напряженные жевательные мышцы, карикатурные гримасы, перекосы мимических мышц, глубокие искусственные носогубные заломы или второй подбородок. Живой блеск глаз и искренний контакт.

4. ПОСАДКА ГОЛОВ, ВЗАИМОДЕЙСТВИЕ И ОСВЕЩЕНИЕ [POSE_AND_LIGHTING_REFERENCE]:
- Точно повтори парную композицию референса Pinterest: взаимный угол поворота голов, наклон плеч, ракурсы шеи, объятия и направление взглядов.
- Воспроизведи световую схему Pinterest (мягкий кинематографичный свет, золотой час, естественные светотени).

5. СВЕЖЕСТЬ, МОЛОДОСТЬ И МИКРОТЕКСТУРА КОЖИ:
- Сохраняй естественную молодость, свежесть и упругость кожи для ОБОИХ персонажей. Не добавлять искусственных морщин, седины, кругов под глазами или следов усталости.
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
  'Pinterest Пара: Маска лиц/волос обоих людей',
  'Изоляция двух голов на парном референсе нейтральным серым цветом (#C0C0C0)',
  'pinterest',
  'РОЛЬ: Технический специалист по маскированию для фотомонтажа парных сцен (Inpainting Masking Specialist).
ЗАДАЧА: Сгенерируй точную изолирующую маску для оригинального парного изображения Pinterest [ORIGINAL_REFERENCE], подготовив кадр к безупречному бесшовному композитингу в Pass 2.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К СОХРАНЕНИЮ И МАСКЕ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ОРИГИНАЛЬНОГО КАДРА [ORIGINAL_REFERENCE]:
- Верни ТО ЖЕ САМОЕ изображение, что на входе, БЕЗ каких-либо изменений композиции, поз тел обоих персонажей, одежды, фона, освещения, геометрии и пропорций.
- Все детали одежды обоих персонажей (костюмы, платья, рубашки, воротники, лацканы, пуговицы, текстуры ткани), объятия, руки, переплетенные пальцы, часы, браслеты, кольца на руках, интерьер и фон должны остаться кристально четкими, резкими и нетронутыми.
- ВНИМАНИЕ ПО АКСЕССУАРАМ: любые аксессуары на лицах, головах или ушах моделей с референса (очки, солнцезащитные очки, серьги, пирсинг, головные уборы) закрашиваются маской вместе с лицами и ушами для чистого переноса лиц пользователей. Украшения на одежде и телах вне зоны шеи сохраняются нетронутыми.

2. ЗОНА МАСКИРОВАНИЯ:
- Аккуратно, плотно и сплошной нейтральной светло-серой заливкой (#C0C0C0) закрась лица, уши, открытые части шеи и все волосы ОБОИХ людей на кадре (Персонажа А и Персонажа Б).

3. ГРАНИЦЫ МАСКИ (PRECISION EDGES):
- Границы маски по воротникам и декольте одежды обоих персонажей должны быть идеально точными — маска доходит ровно до края ткани, не заходя на саму ткань и не оставляя незакрашенных зазоров.
- Границы маски по прическам аккуратно охватывают контуры волос без повреждения фона и окружения.
- Результат: тот же самый исходный парный кадр с ровными серыми зонами (#C0C0C0) для последующего встраивания голов двух пользователей.',
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
  'Pinterest Пара: Проход 2 (Бесшовный композитинг двух голов)',
  'Финальное встраивание двух голов в замаскированный референс Pinterest',
  'pinterest',
  'РОЛЬ: Мастер бесшовного эдиториал-композитинга мирового класса (Vogue / Harper''s Bazaar Master Compositor).
ЗАДАЧА: Выполни безупречное бесшовное встраивание и журнальную шлифовку (Pass 2) двух голов с [POSE_GUIDE_IMAGE] в соответствующие маскированные области парного референса Pinterest [SCENE_IMAGE].

КРИТИЧЕСКИЕ ПРАВИЛА ВСТРАИВАНИЯ И ШЛИФОВКИ:
1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ СЦЕНЫ PINTEREST [SCENE_IMAGE]:
- Все позы тел, объятия, руки, переплетенные пальцы, вся одежда (костюмы, платья, свитера, пальто, воротники, лацканы, пуговицы, текстура материала), аксессуары, окружение и фон берутся СТРОГО и БЕЗ ИЗМЕНЕНИЙ из [SCENE_IMAGE].
- Закрашены серой маской исключительно области голов и шеи обоих персонажей. Все остальные пиксели кадра должны остаться в оригинальном неизменном виде.

2. РАЗДЕЛЬНОЕ ВСТРАИВАНИЕ ДВУХ ЛИЧНОСТЕЙ:
- Левая маскированная область замещается головой и лицом Персонажа А строго по [IDENTITY_A_PHOTOS] (сверка со всеми ракурсами). Сохраняй индивидуальную форму носа, разрез и цвет глаз, очертания скул и подбородка, текстуру и натуральный цвет волос, а также точную форму, контур, густоту и натуральный цвет бороды/усов (при наличии) без добавления седины и без превращения бороды в щетину.
- Правая маскированная область замещается головой и лицом Персонажа Б строго по [IDENTITY_B_PHOTOS] (сверка со всеми ракурсами). Сохраняй индивидуальную форму носа, разрез и цвет глаз, очертания скул и подбородка, текстуру и натуральный цвет волос, а также точную форму, контур, густоту и натуральный цвет бороды/усов (при наличии) без добавления седины и без превращения бороды в щетину.
- СТРОГИЙ ЗАПРЕТ: Восстанавливать лица моделей из оригинального кадра Pinterest категорически запрещено, смешивать черты персонажей между собой, менять их местами или заменять на усредненные лица из датасетов запрещено.

3. ПОСАДКА, РАКУРСЫ И ЭМОЦИИ ИЗ [POSE_GUIDE_IMAGE] (PASS 1):
- Используй результат Pass 1 [POSE_GUIDE_IMAGE] как основу правильной посадки голов, наклона шеи, ракурсов, причесок и аккуратных выражений лиц.
- Отшлифуй геометрию: доведи линии губ, век, глаз и бровей обоих персонажей до журнального совершенства.

4. БЕСШОВНЫЕ СТЫКИ ВОРОТНИКОВ И ШЕИ (SEAMLESS COLLAR INTEGRATION ДЛЯ ОБОИХ):
- Идеальное анатомическое сведение шеи Персонажа А с линией его воротника/одежды и шеи Персонажа Б с линией его воротника/декольте. Полное отсутствие швов, зазоров, ореолов, мыльных пятен или анатомических расхождений.
- Сформируй реалистичные контактные тени от подбородков на шеи и от одежды на ключицы в соответствии с направлением света.

5. ГАРМОНИЗАЦИЯ СВЕТА И ЦВЕТОКОРРЕКЦИЯ:
- Идеально согласуй тона кожи (skintone), цветовую температуру (кельвины), направление бликов и контрастность лиц обоих персонажей под световую схему оригинального референса [SCENE_IMAGE], обеспечив безупречный баланс оттенка кожи лиц с открытыми участками тела (шея, декольте, кисти рук) на [SCENE_IMAGE].

6. ПРЕМИАЛЬНАЯ РЕТУШЬ И МОЛОДОСТЬ:
- Журнальная ретушь высшего класса: гладкая, здоровая, отдохнувшая кожа с сохранением натурального микрорельефа пор (без искусственного размытия).
- Категорически не добавлять возрастных морщин, седины, глубоких заломов, темных кругов или мешков под глазами. Сохранять сияющий и естественный взгляд обоим персонажам.
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
  'Улучшение фото (Enhance / Upscale)',
  'Восстановление микродеталей, резкости взгляда и текстуры кожи без искажения лица',
  'enhance',
  'РОЛЬ: Ведущий цифровой ретушер и колорист эдиториал-глянца высшей категории (High-End Retouch Specialist).
ЗАДАЧА: Выполни бескомпромиссное восстановление, увеличение микродетализации и премиальный апскейл загруженной фотографии [IMAGE_TO_ENHANCE] без малейшего искажения личности и композиции.

1. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ИСХОДНИКА [IMAGE_TO_ENHANCE]:
- Строго сохрани: геометрию и черты лица, форму и цвет глаз, носа, губ, овал лица, оригинальную прическу, цвет волос, точную форму, густоту и цвет бороды/усов (при наличии), позу, одежду, украшения, фоновые объекты и геометрию кадра.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО: менять возраст человека, добавлять седину, превращать в другое лицо, накладывать чужие черты, менять пропорции тела или переделывать сцену.

2. ТЕХНИЧЕСКИЙ АПСКЕЙЛ И ОПТИЧЕСКАЯ ЧИСТОТА:
- Устрани цифровой шум, артефакты JPEG-компрессии, смаз и размытие.
- Восстанови естественную резкость радужки глаз, ресниц, бровей, текстуры губ, отдельных прядей волос, волосков бороды и волокон ткани одежды.
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
  'Правка фото (Refine / Edit)',
  'Изолированное точечное редактирование деталей кадра по текстовой инструкции',
  'refine',
  'РОЛЬ: Профессиональный журнальный фотограф и мастер эдиториал-редактирования (High-End Editorial Photo Editor).
ЗАДАЧА: Точечно и аккуратно внеси изменения в исходную фотографию [IMAGE_TO_EDIT] в строгом соответствии с пользовательской инструкцией.

ПРАВИЛА ИЗМЕНЕНИЯ И СОХРАНЕНИЯ:
1. ИЗОЛИРОВАННОЕ ВМЕШАТЕЛЬСТВО:
- Меняй ИСКЛЮЧИТЕЛЬНО то, о чём прямо сказано в инструкции пользователя.
- Все остальные части кадра (одежда, фон, поза, освещение, окружение) должны остаться нетронутыми, если инструкция их не затрагивает.

2. СТОПРОЦЕНТНОЕ СОХРАНЕНИЕ ЛИЧНОСТИ:
- Если инструкция не требует изменения внешности — черты лица, анатомия, разрез и цвет глаз, улыбка, индивидуальные особенности, стрижка, цвет волос и точная форма/цвет бороды и усов человека ДОЛЖНЫ быть сохранены на 100% без добавления седины или старения.

3. ОРГАНИЧНОСТЬ И ОПТИЧЕСКИЙ ФОТОРЕАЛИЗМ:
- Любое добавление или модификация элементов должны физически и оптически соответствовать схеме освещения, резкости и глубине резкости (DoF) исходного снимка [IMAGE_TO_EDIT].

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
  'Глобальный негативный промпт по умолчанию',
  'Базовый список нежелательных артефактов, защиты бороды/волос и антивозрастной защиты',
  'general',
  'Avoid: premature aging, unrequested gray hair, gray beard, salt-and-pepper stubble instead of full beard, altered beard shape, shaved beard, unrequested facial stubble, exaggerated wrinkles, deep nasolabial folds, double chin, tired eyes, dark circles under eyes, heavy eye bags, weathered haggard skin, coarse skin relief, plastic mannequin skin, artificial blur, stiff unnatural neck angle, floating or pasted head effect, skin tone mismatch between face and hands, distorted anatomy, extra fingers, unnatural hands, watermarks, logos, text overlays, and any face that does not match the IDENTITY photos.',
  '[]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();
