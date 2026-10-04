import { PhotoTemplate } from '../types';

import orheiImg from '../assets/images/template_moldova_orhei_1791140775565.jpg';
import pelesImg from '../assets/images/template_romania_peles_1791140786996.jpg';
import execImg from '../assets/images/template_business_exec_1791140798767.jpg';
import fashionImg from '../assets/images/template_fashion_milan_1791140809021.jpg';
import goldenImg from '../assets/images/template_insta_golden_1791140819273.jpg';

export const INITIAL_TEMPLATES: PhotoTemplate[] = [
  // 1. Moldova Category (Featured)
  {
    id: 'moldova-orheiul-vechi',
    name: {
      ro: 'Apus de Aur la Orheiul Vechi',
      ru: 'Золотой закат в Старом Орхее',
      en: 'Golden Sunset at Old Orhei'
    },
    description: {
      ro: 'Portret editorial elegant pe fundalul canionului Răut și al bisericii rupestre din Orheiul Vechi.',
      ru: 'Элегантный эдиториал портрет на фоне каньона реки Реут и скального монастыря Старого Орхея.',
      en: 'Elegant editorial portrait against the dramatic limestone cliffs and canyon of Orheiul Vechi, Moldova.'
    },
    category: 'Moldova',
    previewImage: orheiImg,
    prompt: 'High-end editorial fashion portrait at sunset overlooking the panoramic limestone cliffs and river bend of Orheiul Vechi in Moldova, golden hour lighting, 85mm lens, authentic travel vogue styling.',
    negativePrompt: 'blurry, bad anatomy, overexposed, low quality, oversaturated cartoon',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 1,
    tags: ['moldova', 'travel', 'sunset', 'heritage', 'editorial']
  },

  // 2. Romania Category (Featured)
  {
    id: 'romania-peles-castle',
    name: {
      ro: 'Eleganță Regală la Castelul Peleș',
      ru: 'Королевская элегантность в Замке Пелеш',
      en: 'Royal Elegance at Peleș Castle'
    },
    description: {
      ro: 'Portret aristocratic de colecție în fața palatului regal din Sinaia, învăluit în aerul carpatin.',
      ru: 'Аристократичный портрет перед неоренессансным королевским замком Пелеш в Синае.',
      en: 'Aristocratic regal portrait in front of the fairytale neo-renaissance Peleș Castle in Sinaia, Romania.'
    },
    category: 'Romania',
    previewImage: pelesImg,
    prompt: 'Aristocratic cinematic portrait in front of the neo-renaissance timbered Peleș Castle in Sinaia Romania, tailored dark luxury coat, soft misty mountain lighting, Vogue fashion editorial.',
    negativePrompt: 'deformed, low quality, plastic face, blurry background noise',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 2,
    tags: ['romania', 'royalty', 'castle', 'luxury', 'carpathians']
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
      ro: 'Street Style Milan Vogue',
      ru: 'Миланский Street Style Vogue',
      en: 'Milan Street Style Vogue'
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
    previewImage: fashionImg,
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
    previewImage: fashionImg,
    prompt: 'Cozy candid lifestyle portrait inside a modern minimalist specialty cafe, holding a ceramic latte cup, large window with soft morning light, stylish oversized sweater, authentic editorial portrait.',
    negativePrompt: 'artificial studio look, cluttered, stiff pose',
    aspectRatio: '3:4',
    creditCost: 1,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 11,
    tags: ['lifestyle', 'coffee', 'cozy', 'minimal', 'morning']
  },

  // 12. Romania: Castelul Bran Transylvania
  {
    id: 'romania-bran-twilight',
    name: {
      ro: 'Mister la Castelul Bran',
      ru: 'Мистика Замка Бран',
      en: 'Transylvanian Mystery at Bran'
    },
    description: {
      ro: 'Atmosferă gotică sofisticată și romantică pe creasta stâncoasă din Transilvania.',
      ru: 'Изысканная готическая романтика на фоне легендарного замка Бран в Трансильвании.',
      en: 'Sophisticated gothic romance portrait near the historic Bran Castle perched atop the craggy Transylvanian rocks.'
    },
    category: 'Romania',
    previewImage: pelesImg,
    prompt: 'Cinematic moody portrait near Bran Castle in Transylvania at twilight, dramatic mist weaving through pine trees, dark wool tailored coat, subtle rim lighting, mysterious and enchanting.',
    negativePrompt: 'cheesy halloween props, cartoon bats, horror face, lowres',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 12,
    tags: ['romania', 'bran', 'transylvania', 'gothic', 'cinematic']
  },

  // 13. Moldova: Cricova Wine Cellar Gala
  {
    id: 'moldova-cricova-gala',
    name: {
      ro: 'Gala Beciurilor Cricova',
      ru: 'Гала-вечер в подвалах Крикова',
      en: 'Cricova Royal Cellar Gala'
    },
    description: {
      ro: 'Eleganță de seară în faimoasele galerii subterane din piatră de var din Cricova, cu lumânări și vin nobil.',
      ru: 'Вечерняя роскошь в знаменитых известняковых подземных галереях Крикова при мерцании свечей.',
      en: 'Black-tie gala portrait within the famous limestone underground subterranean wine city of Cricova, Moldova.'
    },
    category: 'Moldova',
    previewImage: orheiImg,
    prompt: 'Opulent evening gala portrait inside the historic vaulted limestone cellars of Cricova in Moldova, warm candle chandelier lighting, black-tie formal attire, fine wine glass, prestige atmosphere.',
    negativePrompt: 'dusty, dark murky shadows, amateur camera flash',
    aspectRatio: '3:4',
    creditCost: 2,
    requiredInputType: 'single_portrait',
    isActive: true,
    displayOrder: 13,
    tags: ['moldova', 'cricova', 'wine', 'luxury', 'gala']
  }
];

export const CATEGORIES_LIST = [
  'Trending',
  'Fashion',
  'Business',
  'Instagram',
  'Couple',
  'Family',
  'Birthday',
  'Travel',
  'Lifestyle',
  'Moldova',
  'Romania'
] as const;
