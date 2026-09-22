import React from 'react';
import { CATEGORIES } from '../data/menuData';
import { CategoryId } from '../types';
import { Search, Sparkles, Flame, Pizza, Layers, Sandwich, Coffee, X } from 'lucide-react';

interface CategoryNavProps {
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: 'all' | 'spicy' | 'cheese' | 'popular' | 'vegetarian' | 'new';
  onFilterChange: (filter: 'all' | 'spicy' | 'cheese' | 'popular' | 'vegetarian' | 'new') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'doner':
        return <Flame className="w-4 h-4" />;
      case 'pizza':
        return <Pizza className="w-4 h-4" />;
      case 'combos':
        return <Layers className="w-4 h-4" />;
      case 'snacks':
        return <Sandwich className="w-4 h-4" />;
      case 'drinks':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="sticky top-20 z-30 bg-[#0d0f14]/95 backdrop-blur-md border-b border-white/10 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Search bar & filter chips row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pizza, Döner, Sous yoki masalliqlar bo'yicha qidirish..."
              className="w-full bg-[#181d28] border border-white/10 focus:border-amber-500 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                activeFilter === 'all'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => onFilterChange('new')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-bold flex items-center gap-1.5 ${
                activeFilter === 'new'
                  ? 'bg-gradient-to-r from-orange-600/30 to-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-gradient-to-r from-orange-600/10 to-amber-500/10 text-amber-400 hover:text-white border border-amber-500/20'
              }`}
            >
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Yangi: AL DONNER</span>
            </button>
            <button
              onClick={() => onFilterChange('popular')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-1 ${
                activeFilter === 'popular'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>⭐ Xit Sotuv</span>
            </button>
            <button
              onClick={() => onFilterChange('spicy')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-1 ${
                activeFilter === 'spicy'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🌶️ O'tkir/Achchiq</span>
            </button>
            <button
              onClick={() => onFilterChange('cheese')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-1 ${
                activeFilter === 'cheese'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🧀 Pishloqli</span>
            </button>
            <button
              onClick={() => onFilterChange('vegetarian')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-1 ${
                activeFilter === 'vegetarian'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🌱 Vegetariancha</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as CategoryId)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-[#151922] hover:bg-[#1e2430] text-zinc-300 hover:text-white border border-white/5'
                }`}
              >
                <span className={isActive ? 'text-black' : 'text-amber-400'}>
                  {getCategoryIcon(cat.id)}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
