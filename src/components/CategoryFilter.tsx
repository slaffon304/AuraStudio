import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_LIST } from '../data/initialTemplates';
import { TemplateCategory } from '../types';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, t, templates } = useApp();

  const allCategories: ('All' | TemplateCategory)[] = ['All', ...CATEGORIES_LIST];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-4 sm:px-0">
        {allCategories.map(cat => {
          const isSelected = selectedCategory === cat;
          const label = cat === 'All' ? t.categories.All : (t.categories[cat] || cat);
          const count = cat === 'All' 
            ? templates.filter(tmpl => tmpl.isActive).length 
            : templates.filter(tmpl => tmpl.category === cat && tmpl.isActive).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md font-bold'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-2xs'
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
