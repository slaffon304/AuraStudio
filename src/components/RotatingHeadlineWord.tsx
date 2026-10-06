import React, { useEffect, useMemo, useState } from 'react';

interface RotatingHeadlineWordProps {
  /** Слова, которые чередуются в заголовке. */
  words: readonly string[];
  /** Пауза между сменами слова, мс. */
  intervalMs?: number;
}

/**
 * Выделенное (синее) слово в заголовке — механика как в референсе:
 * невидимый «размерка» задаёт слоту фиксированную ширину по самому длинному
 * слову, а видимое слово лежит поверх (absolute inset-0), центрируется в слоте
 * и меняется вертикальным сдвигом + фейдом (см. .hero-word-in / .hero-word-out
 * в src/index.css). Благодаря размерке строка заголовка никогда не меняет
 * ширину и высоту, а остальной текст остаётся неподвижным.
 *
 * Слово рендерится с ключом по индексу, чтобы React пересоздал элемент и
 * анимация появления каждый раз запускалась заново.
 */
export const RotatingHeadlineWord: React.FC<RotatingHeadlineWordProps> = ({ words, intervalMs = 2100 }) => {
  const [state, setState] = useState({ current: 0, previous: -1 });

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(() => {
      setState((prev) => ({
        current: (prev.current + 1) % words.length,
        previous: prev.current
      }));
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [words.length, intervalMs]);

  const sizer = useMemo(
    () => words.reduce((widest, word) => (word.length > widest.length ? word : widest), words[0]),
    [words]
  );

  return (
    <span className="relative inline-block align-baseline whitespace-nowrap text-[#4c63ed] dark:text-[#8ba0ff]">
      {/* Невидимый размерка: держит фиксированную ширину слота. */}
      <span aria-hidden="true" className="invisible">{sizer}</span>

      {/* Текущее слово: появление снизу вверх. */}
      <span
        key={`current-${state.current}`}
        aria-hidden="true"
        className="hero-word-in absolute inset-0 inline-block whitespace-nowrap text-center"
      >
        {words[state.current]}
      </span>

      {/* Прежнее слово: уходит вверх с фейдом (исчезает после анимации). */}
      {state.previous >= 0 && (
        <span
          key={`previous-${state.previous}`}
          aria-hidden="true"
          className="hero-word-out absolute inset-0 inline-block whitespace-nowrap text-center"
        >
          {words[state.previous]}
        </span>
      )}

      {/* Для скринридеров: статичное первое слово, чтобы заголовок читался целиком. */}
      <span className="sr-only">{words[0]}</span>
    </span>
  );
};
