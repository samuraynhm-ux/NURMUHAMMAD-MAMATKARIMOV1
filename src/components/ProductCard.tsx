import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { Plus, Flame, Clock, Sparkles, Check, SlidersHorizontal } from 'lucide-react';

interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, selectedSize?: string) => void;
  onOpenDetails: (item: MenuItem) => void;
  quantityInCart: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onAddToCart,
  onOpenDetails,
  quantityInCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    item.sizes && item.sizes.length > 0 ? item.sizes[0].name : ''
  );
  const [justAdded, setJustAdded] = useState(false);

  // Calculate current price based on size
  const currentMultiplier =
    item.sizes?.find((s) => s.name === selectedSize)?.priceMultiplier || 1;
  const currentPrice = Math.round(item.basePrice * currentMultiplier);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item, selectedSize || undefined);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className="group relative bg-[#131722] hover:bg-[#181d2a] border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Image Section */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/40">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-80" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.isPopular && (
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 fill-white" /> Xit
            </span>
          )}
          {item.isChefChoice && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-black text-[11px] font-extrabold flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> Tavsiya
            </span>
          )}
          {item.isNew && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-black text-[11px] font-black shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-black" /> Yangilik
            </span>
          )}
        </div>

        {/* Info Badges bottom image */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300 font-medium">
          <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{item.prepTimeMinutes} daq</span>
          </div>

          <div className="flex items-center gap-2">
            {item.spicyLevel && item.spicyLevel > 0 && (
              <span className="bg-red-950/80 text-red-300 px-2 py-0.5 rounded-md border border-red-500/30">
                {'🌶️'.repeat(item.spicyLevel)}
              </span>
            )}
            <span className="bg-black/60 text-zinc-300 px-2 py-0.5 rounded-md border border-white/5">
              {item.calories} kkal
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-bold text-base sm:text-lg text-white font-['Outfit'] group-hover:text-amber-400 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Sizes Tabs if available */}
        {item.sizes && item.sizes.length > 0 && (
          <div
            className="flex items-center gap-1 bg-[#1a1f2c] p-1 rounded-xl border border-white/5 text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            {item.sizes.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSize(s.name)}
                className={`flex-1 py-1 rounded-lg font-medium transition-all text-center truncate ${
                  selectedSize === s.name
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s.label.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Price & Add to Cart button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Narxi</span>
            <span className="text-base sm:text-lg font-extrabold text-white font-['Outfit']">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onOpenDetails(item)}
              title="Masalliqlarni tanlash"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={handleAdd}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                justAdded
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-orange-500/20'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Qo'shildi</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>
                    {quantityInCart > 0 ? `Savatda (${quantityInCart})` : 'Qo\'shish'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
