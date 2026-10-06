import { Language } from '../types';

/**
 * Слова, которые по очереди появляются в синей части заголовка на главной.
 * Структура строки: `landingHeadlineLead` + [слот] + `landingHeadlineTail`,
 * например ru: «Создавай [портреты] одной кнопкой».
 *
 * Замените значения в массивах ниже — порядок показа совпадает с порядком
 * в массиве, после последнего слова цикл начинается заново.
 *
 * Ширина слота считается по самому длинному слову, поэтому подбирайте слова
 * примерно одной длины, иначе строка заголовка станет шире.
 */
export const HEADLINE_ROTATING_WORDS: Record<Language, readonly string[]> = {
  ro: ['portrete', 'avatare', 'cadre', 'trenduri'],
  ru: ['портреты', 'аватарки', 'кадры', 'тренды'],
  en: ['portraits', 'avatars', 'shots', 'trends']
};

/**
 * Вторая подмена — в реплике над большой картинкой («🙋 Хочу …»),
 * структура как в референсе: `heroWishLead` + [слот].
 * Тот же принцип: подбирайте фразы похожей длины.
 */
export const HERO_WISH_WORDS: Record<Language, readonly string[]> = {
  ro: ['un portret', 'o avatară', 'o ținută', 'un cadou'],
  ru: ['новый портрет', 'аватарку', 'образ', 'кадр'],
  en: ['a portrait', 'an avatar', 'a new look', 'a shot']
};
