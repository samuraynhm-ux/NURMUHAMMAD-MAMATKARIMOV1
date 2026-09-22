import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, ShieldCheck, Shirt } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedPromo?: { code: string; discountAmount: number }) => void;
  deliveryType: 'delivery' | 'takeaway';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  deliveryType,
}) => {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (deliveryType === 'delivery') {
    deliveryFee = subtotal >= 120000 || subtotal === 0 ? 0 : 15000;
  }

  // Takeaway discount (10%)
  const takeawayDiscount = deliveryType === 'takeaway' ? Math.round(subtotal * 0.1) : 0;

  // Promo discount calculation
  const promoAmount = promoDiscount ? promoDiscount.amount : 0;
  const totalDiscount = takeawayDiscount + promoAmount;
  const grandTotal = Math.max(0, subtotal + deliveryFee - totalDiscount);

  const handleApplyPromo = () => {
    setPromoError(null);
    const cleaned = promoInput.trim().toUpperCase();

    if (!cleaned) return;

    if (cleaned === 'ALDONNER' || cleaned === 'ALDONER') {
      const discount = Math.round(subtotal * 0.15); // 15% AL DONNER launch promotion
      setPromoDiscount({ code: 'ALDONNER', amount: discount });
    } else if (cleaned === 'FIRE10') {
      const discount = Math.round(subtotal * 0.1);
      setPromoDiscount({ code: cleaned, amount: discount });
    } else if (cleaned === 'DOSTLAR') {
      setPromoDiscount({ code: cleaned, amount: 15000 });
    } else if (cleaned === 'YANGI2026') {
      if (subtotal < 100000) {
        setPromoError("Ushbu promokod 100 000 so'mdan yuqori buyurtmalar uchun amal qiladi");
        return;
      }
      setPromoDiscount({ code: cleaned, amount: 20000 });
    } else {
      setPromoError("Yaroqsiz promokod. Yangilik kodi: 'ALDONNER' yoki 'FIRE10' kodini sinab ko'ring.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#121622] border-l border-white/10 shadow-2xl flex flex-col text-white">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 bg-[#0e111a] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-black shadow-md">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-['Outfit'] text-white">
                  Savatchangiz
                </h3>
                <span className="text-xs text-zinc-400">
                  {items.length} xil taom tanlandi
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery banner */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-orange-950/40 to-amber-950/40 border-b border-orange-500/20 text-xs flex items-center justify-between">
            <span className="text-orange-200 font-medium">
              {deliveryType === 'delivery'
                ? subtotal >= 120000
                  ? '🎉 Bepul yetkazib berish faollashtirildi!'
                  : `Bepul yetkazish uchun yana ${formatPrice(120000 - subtotal)} kerak`
                : "🛍️ Olib ketish: 10% chegirma taqdim etildi"}
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white font-['Outfit']">
                  Savatingiz bo'sh
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Menyudan o'zingiz yoqtirgan mazali Döner yoki Pizzani tanlab qo'shing.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-[#171c2a] border border-white/5 flex gap-3 relative group"
                >
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] truncate">
                        {item.menuItem.name}
                      </h5>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Size and custom tags */}
                    <div className="text-[11px] text-zinc-400 space-y-0.5">
                      {item.selectedSize && (
                        <div>
                          O'lcham:{' '}
                          <span className="text-zinc-200 font-medium">
                            {item.selectedSize}
                          </span>
                        </div>
                      )}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-orange-300">
                          + {item.selectedAddons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                      {item.customIngredients && item.customIngredients.length > 0 && (
                        <div className="text-amber-300/80 truncate">
                          Tarkib: {item.customIngredients.slice(0, 3).join(', ')}...
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="italic text-zinc-400 truncate">
                          Izoh: "{item.specialInstructions}"
                        </div>
                      )}
                    </div>

                    {/* Price & Quantity stepper */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs sm:text-sm font-black text-amber-400 font-['Outfit']">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>

                      <div className="flex items-center gap-2 bg-[#10131d] px-2 py-0.5 rounded-lg border border-white/5">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.cartItemId, item.quantity - 1)
                          }
                          className="text-zinc-400 hover:text-white p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.cartItemId, item.quantity + 1)
                          }
                          className="text-zinc-400 hover:text-white p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-[#0d1017] border-t border-white/10 space-y-4">
              {/* Promo code box */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promokod (masalan: FIRE10)"
                      className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white uppercase placeholder-zinc-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                  >
                    Qo'llash
                  </button>
                </div>
                {promoDiscount && (
                  <div className="text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>Promokod {promoDiscount.code} faollashdi:</span>
                    <span>-{formatPrice(promoDiscount.amount)}</span>
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] text-red-400">
                    {promoError}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-white/5 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Mahsulotlar summasi:</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Yetkazib berish xizmati:</span>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">Bepul</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                {takeawayDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Olib ketish chegirmasi (-10%):</span>
                    <span>-{formatPrice(takeawayDiscount)}</span>
                  </div>
                )}

                {promoDiscount && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promokod chegirmasi:</span>
                    <span>-{formatPrice(promoDiscount.amount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                  <span className="font-['Outfit']">Jami to'lov:</span>
                  <span className="font-black text-amber-400 font-['Outfit'] text-lg">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Uniform Delivery Service Assurance */}
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-[11px] text-blue-300">
                <Shirt className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Buyurtmangiz rasmiy AL DONNER jamoa formasidagi kuryerimiz tomonidan issiq yetkaziladi.</span>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() =>
                  onProceedToCheckout(
                    promoDiscount
                      ? { code: promoDiscount.code, discountAmount: totalDiscount }
                      : undefined
                  )
                }
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-black font-black text-sm flex items-center justify-between shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
              >
                <span>Buyurtmani Rasmiylashtirish</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Xavfsiz onlayn to'lov yoki kuryerga naqd to'lash</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
