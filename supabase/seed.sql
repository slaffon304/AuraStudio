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
  ('gemini-genai', 'Google Gemini Image', 'image', 'Server-side Google GenAI model for high-fidelity photo generation and editing.', false, true, 'gemini-3.1-flash-lite-image', 6),
  ('replicate-flux', 'Replicate FLUX.1 Dev (FaceID)', 'image', 'Open-weights FLUX.1 Dev model with InstantID facial preservation adapter.', false, false, 'black-forest-labs/flux-1-dev', 9),
  ('fal-ai-pulid', 'Fal.ai PuLID Flux Studio', 'image', 'Ultra-low latency GPU cloud running PuLID facial identity conditioning.', false, false, 'fal-ai/flux-pulid', 3),
  ('veo-video', 'Google Veo Video', 'video', 'Generates dynamic 4-second cinematic portrait loops with subtle motion and breathing.', false, false, 'veo-3.1-lite-generate-preview', 24)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_configured = EXCLUDED.is_configured,
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
    'Aristocratic cinematic portrait in front of the neo-renaissance timbered Peleș Castle in Sinaia Romania, tailored dark luxury coat, soft misty mountain lighting, Vogue fashion editorial.',
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
    'Street Style Milan Vogue', 'Миланский Street Style Vogue', 'Milan Street Style Vogue',
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
