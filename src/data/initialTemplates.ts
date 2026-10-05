import { PhotoTemplate } from '../types';

import orheiImg from '../assets/images/template_moldova_orhei_1791140775565.jpg';
import pelesImg from '../assets/images/template_romania_peles_1791140786996.jpg';
import execImg from '../assets/images/template_business_exec_1791140798767.jpg';
import fashionImg from '../assets/images/template_fashion_milan_1791140809021.jpg';
import goldenImg from '../assets/images/template_insta_golden_1791140819273.jpg';
import coupleImg from '../assets/images/couple_editorial_sunset_1791210833350.jpg';
import studioBwImg from '../assets/images/studio_bw_portrait_1791214266378.jpg';
import cafeImg from '../assets/images/cafe_parisian_candid_1791214280164.jpg';
import vogueImg from '../assets/images/vogue_editorial_glam_1791214294002.jpg';
import oldMoneyImg from '../assets/images/old_money_aesthetic_1791214304391.jpg';

export const INITIAL_TEMPLATES: PhotoTemplate[] = [
  // Couple Featured Template
  {
    id: 'couple-chișinău-sunset',
    name: {
      ro: 'Romantism de Cuplu Editorial',
      ru: 'Романтичный парный портрет',
      en: 'Romantic Couple Editorial'
    },
    description: {
      ro: 'Ședință foto de poveste pentru cupluri la apus de soare, iluminare caldă de cinema și ținută elegantă.',
      ru: 'Атмосферная фотосессия для двоих на закате, тёплый кинематографичный свет и элегантный стиль.',
      en: 'Dreamy sunset editorial photoshoot for two, warm cinematic golden hour light, high-fashion styling.'
    },
    category: 'Couple',
    gender: 'couple',
    previewImage: coupleImg,
    prompt: 'Cinematic romantic couple editorial photoshoot at sunset, stylish couple embracing warmly, soft golden hour rim light, 85mm f/1.4 lens, European city terrace background, luxury editorial romance.',
    negativePrompt: 'blurry, bad anatomy, deformed hands, awkward poses',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'couple_portrait',
    isActive: true,
    displayOrder: 0,
    tags: ['couple', 'romance', 'sunset', 'wedding', 'love']
  },

  // 1. Limestone Canyon Editorial (Featured)
  {
    id: 'moldova-orheiul-vechi',
    name: {
      ro: 'Apus de Aur pe Canion',
      ru: 'Золотой закат на каньоне',
      en: 'Golden Sunset at Limestone Canyon'
    },
    description: {
      ro: 'Portret editorial elegant pe fundalul unui canion maiestuos scăldat în lumina apusului.',
      ru: 'Элегантный эдиториал портрет на фоне живописного каньона в лучах заходящего солнца.',
      en: 'Elegant editorial portrait overlooking a dramatic sunlit limestone canyon.'
    },
    category: 'Editorial',
    gender: 'unisex',
    previewImage: orheiImg,
    prompt: 'High-end editorial fashion portrait at sunset overlooking panoramic limestone cliffs and river bend, golden hour lighting, 85mm lens, authentic travel vogue styling.',
    negativePrompt: 'blurry, bad anatomy, overexposed, low quality, oversaturated cartoon',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 1,
    tags: ['travel', 'sunset', 'heritage', 'editorial', 'nature']
  },

  // 2. Royal Castle Elegance (Featured)
  {
    id: 'romania-peles-castle',
    name: {
      ro: 'Eleganță Regală la Castel',
      ru: 'Королевская элегантность в замке',
      en: 'Fairytale Royal Castle Elegance'
    },
    description: {
      ro: 'Portret aristocratic de colecție în fața unui palat regal de basm, învăluit în aer de munte.',
      ru: 'Аристократичный портрет перед сказочным королевским дворцом в окружении хвойных гор.',
      en: 'Aristocratic regal portrait in front of a fairytale neo-renaissance mountain palace.'
    },
    category: 'Heritage',
    previewImage: pelesImg,
    prompt: 'Aristocratic cinematic portrait in front of a neo-renaissance fairytale castle in the mountains, tailored dark luxury coat, soft misty mountain lighting, high-fashion editorial.',
    negativePrompt: 'deformed, low quality, plastic face, blurry background noise',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 2,
    tags: ['royalty', 'castle', 'luxury', 'palace']
  },

  // 3. Business Category (Featured)
  {
    id: 'business-executive-skyline',
    name: {
      ro: 'Headshot Executiv LinkedIn',
      ru: 'Executive Headshot для LinkedIn',
      en: 'Modern Executive LinkedIn Headshot'
    },
    description: {
      ro: 'Portret profesional premium pentru directori, fondatori și lideri corporate, cu fundal zgârie-nori.',
      ru: 'Премиальный деловой портрет для руководителей и лидеров компаний с видом на современный мегаполис.',
      en: 'High-status executive portrait for CEOs, founders and corporate leaders in a modern skyline boardroom.'
    },
    category: 'Business',
    previewImage: execImg,
    prompt: 'Polished modern executive business portrait in a glass boardroom overlooking European skyline, confident warm smile, crisp tailored blazer, studio softbox lighting, Forbes 30 under 30 editorial.',
    negativePrompt: 'amateur, bad lighting, passport photo, stiff posture, overprocessed skin',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 3,
    tags: ['business', 'linkedin', 'executive', 'career', 'corporate']
  },

  // 4. Fashion Category (Featured)
  {
    id: 'fashion-milan-streetwear',
    name: {
      ro: 'Street Style Milan Editorial',
      ru: 'Миланский Street Style',
      en: 'Milan Street Style Editorial'
    },
    description: {
      ro: 'Stil cosmopolit pe străzile pavate din Milano, palton camel de lux și ochelari de soare iconici.',
      ru: 'Космополитичный уличный стиль на брусчатке Милана, роскошное пальто и трендовые аксессуары.',
      en: 'Cosmopolitan high-fashion street portrait on European cobblestone avenues, camel trench coat, effortless chic.'
    },
    category: 'Fashion',
    previewImage: fashionImg,
    prompt: 'Contemporary luxury streetwear fashion portrait on a European cobblestone street, stylish designer sunglasses, cashmere trench coat, diffused soft daylight, editorial magazine quality.',
    negativePrompt: 'oversaturated, unnatural skin, cartoonish, low resolution',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 4,
    tags: ['fashion', 'streetwear', 'vogue', 'model', 'editorial']
  },

  // 5. Instagram Category (Featured)
  {
    id: 'insta-golden-rooftop',
    name: {
      ro: 'Apus Golden Hour pe Acoperiș',
      ru: 'Golden Hour на крыше города',
      en: 'Golden Hour City Rooftop'
    },
    description: {
      ro: 'Lumină caldă de apus peste o terasă panoramică, reflexii aurii și atmosferă relaxată de vacanță.',
      ru: 'Теплый закатный свет на открытой крыше с панорамой европейского города, естественная эстетика.',
      en: 'Dreamy golden hour rooftop portrait with European skyline, cinematic lens flare, effortlessly aesthetic.'
    },
    category: 'Instagram',
    previewImage: goldenImg,
    prompt: 'Dreamy golden hour rooftop portrait of an attractive person with European city skyline at dusk, warm sun flares, effortless casual luxury clothing, authentic aesthetic lifestyle photography, cinematic 35mm warmth.',
    negativePrompt: 'harsh shadows, fake plastic glow, bad hands, low resolution',
    aspectRatio: '3:4',
    creditCost: 1,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 5,
    tags: ['instagram', 'goldenhour', 'rooftop', 'aesthetic', 'trending']
  },

  // 6. Trending: Old Money Glamour
  {
    id: 'trending-old-money',
    name: {
      ro: 'Estetică Old Money Riviera',
      ru: 'Эстетика Old Money Ривьера',
      en: 'Old Money Riviera Glamour'
    },
    description: {
      ro: 'Costum din in fin, ochelari vintage și atmosferă exclusivă de club privat la Mediterana.',
      ru: 'Льняной костюм, винтажные солнцезащитные очки и атмосфера закрытого клуба на Ривьере.',
      en: 'Refined quiet luxury portrait in crisp linen garments at an exclusive Mediterranean seaside club.'
    },
    category: 'Trending',
    previewImage: oldMoneyImg,
    prompt: 'Old money quiet luxury aesthetic portrait on the terrace of a historic Riviera villa, ivory linen shirt, Mediterranean cypress trees, gentle sea breeze, muted film tones, timeless elegance.',
    negativePrompt: 'garish logos, neon, fast fashion, plastic sheen, lowres',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 6,
    tags: ['trending', 'oldmoney', 'quietluxury', 'vintage', 'elegance']
  },

  // 7. Couple: Paris Promenade
  {
    id: 'couple-paris-promenade',
    name: {
      ro: 'Plimbare Romantică la Paris',
      ru: 'Романтическая прогулка в Париже',
      en: 'Romantic Paris Promenade'
    },
    description: {
      ro: 'Atmosferă cinematografică pe malul Senei la apus, cu Turnul Eiffel în ceață caldă.',
      ru: 'Кинематографичная атмосфера на набережной Сены в Париже на закате.',
      en: 'Cinematic romantic couple moment strolling along the Seine in Paris with the Eiffel Tower in the mist.'
    },
    category: 'Couple',
    previewImage: goldenImg,
    prompt: 'Cinematic romantic couple photography in Paris by the Seine River at dusk, warm Parisian streetlamps, soft ambient glow, natural laughter, timeless film still aesthetic, 50mm f/1.4.',
    negativePrompt: 'awkward poses, unnatural hands, overbaked contrast, low quality',
    aspectRatio: '3:4',
    creditCost: 3,
    requiredInputType: 'couple_portrait',
    isActive: true,
    displayOrder: 7,
    tags: ['couple', 'love', 'paris', 'romance', 'cinematic']
  },

  // 8. Family: Warm Autumn Sunlit
  {
    id: 'family-golden-autumn',
    name: {
      ro: 'Armonie de Toamnă în Familie',
      ru: 'Теплая осенняя семейная гармония',
      en: 'Golden Autumn Family Harmony'
    },
    description: {
      ro: 'Zâmbete sincere și lumini calde într-o pădure aurie cu frunze ruginii.',
      ru: 'Искренние улыбки и теплое осеннее солнце в парке с золотыми листьями.',
      en: 'Heartwarming family portrait outdoors surrounded by glowing golden autumn foliage and soft afternoon light.'
    },
    category: 'Family',
    previewImage: orheiImg,
    prompt: 'Warm candid family portrait in a picturesque sun-dappled autumn park, golden leaves, cozy knitted sweaters, genuine joyful smiles, natural gentle depth of field, tender lifestyle photography.',
    negativePrompt: 'distorted faces, creepy smiles, missing limbs, dark mood',
    aspectRatio: '4:3',
    creditCost: 3,
    requiredInputType: 'group_family',
    isActive: true,
    displayOrder: 8,
    tags: ['family', 'autumn', 'cozy', 'warmth', 'harmony']
  },

  // 9. Birthday: Midnight Champagne
  {
    id: 'birthday-sparklers-gala',
    name: {
      ro: 'Sărbătoare Midnight Champagne',
      ru: 'Праздник Midnight Champagne',
      en: 'Midnight Champagne Celebration'
    },
    description: {
      ro: 'Lumânări scânteietoare, cupă de șampanie și ținută de gală pentru o aniversare memorabilă.',
      ru: 'Бенгальские огни, бокал шампанского и праздничный вечерний наряд на день рождения.',
      en: 'Glittering sparklers, crystal champagne glass and chic celebration attire for an unforgettable birthday.'
    },
    category: 'Birthday',
    previewImage: execImg,
    prompt: 'Celebratory glamorous birthday portrait at night with sparkling golden fire sparklers in hand, elegant velvet evening dress, bokeh lights in background, joyful toast, cinematic luxury lighting.',
    negativePrompt: 'flat lighting, blurry eyes, messy background, lowres',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 9,
    tags: ['birthday', 'celebration', 'party', 'champagne', 'glamour']
  },

  // 10. Travel: Amalfi Yacht Day
  {
    id: 'travel-amalfi-yacht',
    name: {
      ro: 'Croazieră pe Coasta Amalfi',
      ru: 'Круиз на яхте по Амальфи',
      en: 'Amalfi Coast Yacht Day'
    },
    description: {
      ro: 'Briză mediteraneană pe puntea unui yacht alb din lemn de tec, cu falezele din Positano în spate.',
      ru: 'Морской бриз на палубе белой яхты с видом на красочные скалы и виллы Позитано.',
      en: 'Luxury yacht day along the dramatic Amalfi Coast, turquoise waters, Positano colorful cliff houses.'
    },
    category: 'Travel',
    previewImage: goldenImg,
    prompt: 'Sun-drenched luxury travel photography on a classic wooden yacht deck off the coast of Positano Amalfi, turquoise water, white linen shirt, Italian summer vibes, high fashion editorial.',
    negativePrompt: 'overexposed sky, bad perspective, washed out colors',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 10,
    tags: ['travel', 'amalfi', 'yacht', 'summer', 'vacation']
  },

  // 11. Lifestyle: Specialty Coffee Morning
  {
    id: 'lifestyle-artisan-coffee',
    name: {
      ro: 'Dimineață la Cafenea de Specialitate',
      ru: 'Утро в спешелти кофейне',
      en: 'Specialty Coffee Morning'
    },
    description: {
      ro: 'Lumină naturală de dimineață, ceașcă de cappuccino ceramică și atmosferă minimalistă nordică.',
      ru: 'Утренний мягкий свет, керамическая чашка капучино и уютный интерьер авторской кофейни.',
      en: 'Cozy morning in an aesthetic Scandinavian coffee shop, warm ceramic latte cup, gentle natural window light.'
    },
    category: 'Lifestyle',
    previewImage: cafeImg,
    prompt: 'Cozy candid lifestyle portrait inside a modern minimalist specialty cafe, holding a ceramic latte cup, large window with soft morning light, stylish oversized sweater, authentic editorial portrait.',
    negativePrompt: 'artificial studio look, cluttered, stiff pose',
    aspectRatio: '3:4',
    creditCost: 1,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 11,
    tags: ['lifestyle', 'coffee', 'cozy', 'minimal', 'morning']
  },

  // 12. Ancient Castle Twilight
  {
    id: 'romania-bran-twilight',
    name: {
      ro: 'Mister la Castelul din Pădure',
      ru: 'Мистика старинного замка',
      en: 'Ancient Castle Twilight'
    },
    description: {
      ro: 'Atmosferă gotică sofisticată și romantică pe creasta stâncoasă înconjurată de cețuri.',
      ru: 'Изысканная готическая романтика на фоне старинного замка на скалистом утёсе.',
      en: 'Sophisticated gothic romance portrait near an ancient fortress perched atop misty crags.'
    },
    category: 'Heritage',
    previewImage: pelesImg,
    prompt: 'Cinematic moody portrait near an ancient stone castle at twilight, dramatic mist weaving through pine trees, dark wool tailored coat, subtle rim lighting, mysterious and enchanting.',
    negativePrompt: 'cheesy halloween props, cartoon bats, horror face, lowres',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 12,
    tags: ['castle', 'gothic', 'cinematic', 'mystery']
  },

  // 13. Subterranean Royal Gala
  {
    id: 'moldova-cricova-gala',
    name: {
      ro: 'Gala Beciurilor Regale',
      ru: 'Вечерний королевский гала-приём',
      en: 'Subterranean Royal Gala'
    },
    description: {
      ro: 'Eleganță de seară în galerii subterane din piatră nobilă, cu candelabre și ținută black-tie.',
      ru: 'Вечерняя роскошь в старинных подземных галереях при мерцании хрустальных люстр и свечей.',
      en: 'Black-tie gala portrait within historic vaulted subterranean halls, warm candle chandelier lighting.'
    },
    category: 'Heritage',
    previewImage: orheiImg,
    prompt: 'Opulent evening gala portrait inside historic vaulted limestone cellars, warm candle chandelier lighting, black-tie formal attire, fine wine glass, prestige atmosphere.',
    negativePrompt: 'dusty, dark murky shadows, amateur camera flash',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 13,
    tags: ['wine', 'luxury', 'gala', 'evening']
  },

  // 14. Minimalist Studio B&W (Rembrandt Lighting)
  {
    id: 'studio-minimalist-bw',
    name: {
      ro: 'Portret Studio Alb-Negru Minimalist',
      ru: 'Студийный черно-белый минимализм',
      en: 'Minimalist B&W Studio Portrait'
    },
    description: {
      ro: 'Iluminare dramatică sculpturală Rembrandt, contrast fin și textură autentică Leica de 50mm.',
      ru: 'Скульптурный драматичный свет Рембрандта, глубокие тени и плёночная текстура Leica.',
      en: 'Sculptural dramatic Rembrandt lighting, high-contrast B&W film grain and Leica 50mm depth.'
    },
    category: 'Business',
    gender: 'unisex',
    previewImage: studioBwImg,
    prompt: 'Minimalist high-fashion black and white studio portrait, sculptural dramatic Rembrandt shadow and rim lighting, authentic film grain texture, Leica 50mm f/1.4 aesthetic, timeless editorial simplicity.',
    negativePrompt: 'flat lighting, blurry, distorted features, cartoon look',
    aspectRatio: '3:4',
    creditCost: 1,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 14,
    tags: ['studio', 'bw', 'blackandwhite', 'minimalist', 'rembrandt', 'business']
  },

  // 15. Vogue High Fashion Editorial
  {
    id: 'vogue-editorial-glam',
    name: {
      ro: 'Copertă Editorială Vogue Glam',
      ru: 'Обложка глянца Vogue Glamour',
      en: 'Vogue Glamour Magazine Cover'
    },
    description: {
      ro: 'Estetică strălucitoare de modă înaltă, lumină directă de blitz și costum structurat din mătase.',
      ru: 'Глянцевый студийный свет со вспышкой, шёлковый блейзер и уверенный взгляд супермодели.',
      en: 'High-fashion luxury magazine cover portrait, glossy studio flash illumination and silk structured blazer.'
    },
    category: 'Fashion',
    gender: 'women',
    previewImage: vogueImg,
    prompt: 'High-fashion luxury magazine cover editorial portrait, glossy studio flash illumination, silk structured blazer, clean neutral studio backdrop, Vogue Harper\'s Bazaar aesthetic, 4k ultra-detailed.',
    negativePrompt: 'casual clothing, bad makeup, plastic doll face',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 15,
    tags: ['fashion', 'vogue', 'glamour', 'editorial', 'model']
  },

  // 16. Parisian Terrace Candid
  {
    id: 'lifestyle-parisian-candid',
    name: {
      ro: 'Terasă Parisiană Soare de Dimineață',
      ru: 'Парижская терраса в утреннем свете',
      en: 'Parisian Morning Cafe Terrace'
    },
    description: {
      ro: 'Momente spontane la o cafenea cochetă din Paris, masă rotundă de marmură și lumină caldă de soare.',
      ru: 'Непринуждённый лайфстайл-кадр за круглым мраморным столиком бистро в золотых лучах утра.',
      en: 'Aesthetic candid lifestyle portrait at a Parisian artisan cafe terrace in morning golden light.'
    },
    category: 'Lifestyle',
    gender: 'unisex',
    previewImage: cafeImg,
    prompt: 'Aesthetic candid lifestyle portrait at a Parisian artisan cafe terrace in morning golden light, sipping espresso at round marble bistro table, relaxed natural smile, warm linen tones, Pinterest lifestyle photography.',
    negativePrompt: 'stiff posing, unnatural smile, dark shadows',
    aspectRatio: '3:4',
    creditCost: 1,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 16,
    tags: ['lifestyle', 'paris', 'cafe', 'candid', 'morning']
  },

  // 17. Old Money Country Club
  {
    id: 'trending-country-club',
    name: {
      ro: 'Eleganță Clasică Country Club',
      ru: 'Классика Old Money Country Club',
      en: 'Classic Country Club Elegance'
    },
    description: {
      ro: 'Polo din cașmir crem, parc aristocrat privat și lumină difuză naturală de după-amiază.',
      ru: 'Свитер из кремового кашемира, зелень загородного клуба и утончённая эстетика тихой роскоши.',
      en: 'Classic Old Money aesthetic portrait outdoors, cream knit cashmere polo, manicured estate garden.'
    },
    category: 'Trending',
    gender: 'unisex',
    previewImage: oldMoneyImg,
    prompt: 'Classic Old Money aesthetic portrait outdoors, cream knit cashmere polo, manicured estate garden background, soft diffused natural daylight, timeless quiet luxury Ralph Lauren style.',
    negativePrompt: 'cheap clothing, logos, saturated colors',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 17,
    tags: ['trending', 'oldmoney', 'quietluxury', 'countryclub', 'classic']
  }
];

export const CATEGORIES_LIST = [
  'Trending',
  'Fashion',
  'Business',
  'Instagram',
  'Couple',
  'Heritage',
  'Lifestyle',
  'Editorial',
  'Travel',
  'Family',
  'Birthday'
] as const;
