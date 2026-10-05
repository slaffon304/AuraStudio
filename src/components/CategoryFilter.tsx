import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_LIST } from '../data/initialTemplates';
import { TemplateCategory } from '../types';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, t } = useApp();
  const allCategories: ('All' | TemplateCategory)[] = ['All', ...CATEGORIES_LIST];

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-[#e2e6ef] px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max items-center gap-6 sm:gap-7">
        {allCategories.map((category) => {
          const selected = selectedCategory === category;
          const label = category === 'All' ? t.appForYou : t.categories[category];
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selected}
              className={`relative flex min-h-11 items-center whitespace-nowrap text-[12px] font-semibold transition-colors sm:text-[13px] ${
                selected ? 'text-[#202947]' : 'text-[#9098aa] hover:text-[#4d5873]'
              }`}
            >
              {label}
              {selected && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#536dfe]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
