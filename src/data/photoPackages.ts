import { PhotoPackage } from '../types';

/** Landing packages — EUR only, matches DB photo_packages */
export const PHOTO_PACKAGES: PhotoPackage[] = [
  {
    id: 'pack5',
    name: {
      ro: 'Pachet 5 foto',
      ru: 'Пакет 5 фото',
      en: '5 photos pack'
    },
    photos: 5,
    priceEUR: 2.9,
    isPopular: false,
    isBestValue: false
  },
  {
    id: 'pack10',
    name: {
      ro: 'Pachet 10 foto',
      ru: 'Пакет 10 фото',
      en: '10 photos pack'
    },
    photos: 10,
    priceEUR: 4.9,
    isPopular: true,
    isBestValue: false
  },
  {
    id: 'pack40',
    name: {
      ro: 'Pachet 40 foto',
      ru: 'Пакет 40 фото',
      en: '40 photos pack'
    },
    photos: 40,
    priceEUR: 11.6,
    isPopular: false,
    isBestValue: true
  }
];

/** @deprecated */
export const CREDIT_PACKAGES = PHOTO_PACKAGES;
