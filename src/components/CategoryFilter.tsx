import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_LIST } from '../data/initialTemplates';
import { TemplateCategory } from '../types';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, t, templates } = useApp();

  const allCategories: ('All' | TemplateCategory)[] = ['All', ...CATEGORIES_LIST];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-1.5 min-w-max px-4 sm:px-0">
        {allCategories.map(cat => {
          const isSelected = selectedCategory === cat;
          const label = cat === 'All' ? t.categories.All : t.categories[cat];
          const count = cat === 'All' 
            ? templates.filter(tmpl => tmpl.isActive).length 
            : templates.filter(tmpl => tmpl.category === cat && tmpl.isActive).length;

          // Special highlight styling for regional categories Moldova and Romania
          const isRegional = cat === 'Moldova' || cat === 'Romania';

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : isRegional
                  ? 'bg-white/[0.06] text-amber-300 border border-amber-500/25 hover:bg-white/[0.1] hover:text-white'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] tabular-nums font-semibold ${
                    isSelected ? 'text-slate-800' : 'text-slate-500'
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
