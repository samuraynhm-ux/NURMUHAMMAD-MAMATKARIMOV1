import React from 'react';
import { MenuItem } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, selectedSize?: string) => void;
  onOpenDetails: (item: MenuItem) => void;
  getCartQuantity: (itemId: string) => number;
  categoryTitle: string;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  onAddToCart,
  onOpenDetails,
  getCartQuantity,
  categoryTitle,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white font-['Outfit']">
          Taom topilmadi
        </h3>
        <p className="text-sm text-zinc-400">
          Boshqa qidiruv so'zini sinab ko'ring yoki filtrlarni tozalang.
        </p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
            {categoryTitle}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
            {items.length} ta taom
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            onOpenDetails={onOpenDetails}
            quantityInCart={getCartQuantity(item.id)}
          />
        ))}
      </div>
    </section>
  );
};
