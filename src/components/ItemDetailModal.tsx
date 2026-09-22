import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { X, Plus, Minus, Flame, Clock, Check, Sparkles } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCartWithOptions: (
    item: MenuItem,
    size: string | undefined,
    addons: { id: string; name: string; price: number }[],
    quantity: number,
    instructions: string
  ) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onAddToCartWithOptions,
}) => {
  if (!item) return null;

  const [selectedSize, setSelectedSize] = useState<string>(
    item.sizes && item.sizes.length > 0 ? item.sizes[0].name : ''
  );
  const [selectedAddons, setSelectedAddons] = useState<
    { id: string; name: string; price: number }[]
  >([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  // Price calculations
  const sizeMultiplier =
    item.sizes?.find((s) => s.name === selectedSize)?.priceMultiplier || 1;
  const baseSizePrice = Math.round(item.basePrice * sizeMultiplier);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = baseSizePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: { id: string; name: string; price: number }) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAdd = () => {
    onAddToCartWithOptions(
      item,
      selectedSize || undefined,
      selectedAddons,
      quantity,
      instructions
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#141824] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black/40">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141824] via-[#141824]/20 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              {item.isPopular && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-white" /> Xit Sotuv
                </span>
              )}
              {item.isChefChoice && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" /> Oshpaz Tanlovi
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description & Specs */}
          <div className="space-y-3">
            <p className="text-sm text-zinc-300 leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Tayyorlanish: {item.prepTimeMinutes} daqiqa
              </span>
              <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                Energetik qiymat: {item.calories} kkal
              </span>
              {item.spicyLevel && item.spicyLevel > 0 ? (
                <span className="bg-red-950/60 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/20">
                  Achchiqlik darajasi: {'🌶️'.repeat(item.spicyLevel)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Size Selection */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                O'lchamni tanlang:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {item.sizes.map((s) => {
                  const isSelected = selectedSize === s.name;
                  const price = Math.round(item.basePrice * s.priceMultiplier);
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSize(s.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                          : 'bg-[#181d2c] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-xs text-amber-400 font-semibold mt-1">
                        {formatPrice(price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Addons Selection */}
          {item.allowedAddons && item.allowedAddons.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Qo'shimcha masalliqlar va souslar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.allowedAddons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-[#181d2c] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-black'
                              : 'border-zinc-500 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs text-amber-400 font-bold">
                        +{formatPrice(addon.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Oshpaz uchun maxsus istaklar (ixtiyoriy):
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Masalan: Piyozi kamroq bo'lsin, sousni alohida idishda bering..."
              className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add Button */}
        <div className="p-6 bg-[#0f121a] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-[#181d2c] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-extrabold font-['Outfit'] px-3">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto flex-1 max-w-sm py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-black font-extrabold text-sm sm:text-base flex items-center justify-between shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <span>Savatga qo'shish</span>
            <span className="font-['Outfit'] font-black">
              {formatPrice(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
