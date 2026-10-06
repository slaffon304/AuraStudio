import { CreditPackage } from '../types';

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pack-starter',
    name: {
      ro: 'Pachet Start',
      ru: 'Стартовый пакет',
      en: 'Starter Pack'
    },
    credits: 25,
    bonusCredits: 0,
    priceMDL: 99,
    priceRON: 25,
    priceEUR: 5,
    isPopular: false,
    isBestValue: false
  },
  {
    id: 'pack-creator',
    name: {
      ro: 'Pachet Creator',
      ru: 'Пакет Создатель',
      en: 'Creator Pack'
    },
    credits: 80,
    bonusCredits: 15,
    priceMDL: 249,
    priceRON: 65,
    priceEUR: 13,
    isPopular: true,
    isBestValue: false
  },
  {
    id: 'pack-vip',
    name: {
      ro: 'VIP Studio Pro',
      ru: 'VIP Студия Pro',
      en: 'VIP Studio Pro'
    },
    credits: 220,
    bonusCredits: 50,
    priceMDL: 499,
    priceRON: 130,
    priceEUR: 26,
    isPopular: false,
    isBestValue: true
  }
];
