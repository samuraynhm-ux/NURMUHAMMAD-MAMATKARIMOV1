import React, { useState, useEffect } from 'react';
import { UserProfile, MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { formatPrice } from '../utils/formatters';
import {
  Sparkles,
  Flame,
  Pizza,
  ShoppingBag,
  Percent,
  Layers,
  ChevronRight,
  RotateCw,
  Award,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface PersonalizedRecommendationsSectionProps {
  currentUser: UserProfile | null;
  onAddToCart: (item: MenuItem, selectedSize?: string) => void;
  onOpenAccountModal: () => void;
  onApplyPromoCode: (code: string) => void;
  onOpenItemDetail: (item: MenuItem) => void;
}

export const PersonalizedRecommendationsSection: React.FC<PersonalizedRecommendationsSectionProps> = ({
  currentUser,
  onAddToCart,
  onOpenAccountModal,
  onApplyPromoCode,
  onOpenItemDetail,
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const fetchPersonalizedData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        setCustomerProfile(data.customerProfile);
      }
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalizedData();
  }, [currentUser]);

  // Helper to find MenuItem by ID
  const getItem = (id: string): MenuItem | undefined => {
    return MENU_ITEMS.find((it) => it.id === id);
  };

  const handleAddRecItem = (rec: any) => {
    if (rec.itemIds && rec.itemIds.length > 0) {
      rec.itemIds.forEach((id: string) => {
        const found = getItem(id);
        if (found) {
          onAddToCart(found);
        }
      });
      setAddedItemIds((prev) => ({ ...prev, [rec.id]: true }));
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [rec.id]: false }));
      }, 2500);
    }
  };

  const handleApplyPromo = (code: string) => {
    onApplyPromoCode(code);
    setAppliedPromo(code);
    setTimeout(() => setAppliedPromo(null), 3500);
  };

  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Section Header */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181224] via-[#1a141b] to-[#121622] border border-amber-500/25 shadow-2xl overflow-hidden">
        {/* Glow ambient background light */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Ta'm Sommelieri & Shaxsiy Tahlil</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit'] tracking-tight">
              Siz Uchun Shaxsiy Tavsiyalar & Takliflar
            </h2>

            <p className="text-sm text-zinc-400 mt-1.5 max-w-2xl">
              {currentUser ? (
                <>
                  <span className="text-amber-400 font-semibold">{currentUser.name}</span>, sizning xaridlar tarixingiz ({customerProfile?.ordersCount || 0} ta buyurtma) va restoran xitlari asosida Usta Farhod AI tomonidan tuzildi.
                </>
              ) : (
                "Xaridorlarimizning eng sevimli xit taomlari va ta'm tahlili asosida tayyorlangan maxsus saralash."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={onOpenAccountModal}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all border border-white/10"
              >
                <span>Xaridlar Tarixim</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={fetchPersonalizedData}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-900/50 to-amber-900/50 hover:from-purple-800/70 hover:to-amber-800/70 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              title="Qayta tahlil qilish"
            >
              <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Tahlil qilinmoqda...' : 'Tahlilni Yangilash'}</span>
            </button>
          </div>
        </div>

        {/* 3 Interactive Recommendation Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((rec) => {
            const primaryItem = rec.itemIds && rec.itemIds[0] ? getItem(rec.itemIds[0]) : null;
            const isAdded = addedItemIds[rec.id];

            return (
              <div
                key={rec.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#0e111a]/90 backdrop-blur-md border border-white/10 hover:border-amber-500/50 transition-all duration-300 p-5 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10"
              >
                {/* Badge top */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold border border-amber-500/30 flex items-center gap-1">
                      {rec.type === 'pizza' && <Pizza className="w-3 h-3 text-amber-400" />}
                      {rec.type === 'combo' && <Layers className="w-3 h-3 text-orange-400" />}
                      {rec.type === 'offer' && <Tag className="w-3 h-3 text-emerald-400" />}
                      <span>{rec.badge}</span>
                    </span>

                    {rec.discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-black border border-red-500/30">
                        -{rec.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Visual Image / Preview */}
                  {primaryItem && (
                    <div
                      className="relative h-36 w-full rounded-xl overflow-hidden mb-4 cursor-pointer group-hover:scale-[1.02] transition-transform"
                      onClick={() => onOpenItemDetail(primaryItem)}
                    >
                      <img
                        src={primaryItem.image}
                        alt={primaryItem.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {primaryItem.name}
                      </span>
                    </div>
                  )}

                  {/* Title & Reason */}
                  <h3 className="text-lg font-bold text-white font-['Outfit'] group-hover:text-amber-400 transition-colors leading-snug">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    {rec.reason}
                  </p>

                  {/* Sommelier Pairing Tip */}
                  {rec.pairingAdvice && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-normal flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rec.pairingAdvice}</span>
                    </div>
                  )}

                  {/* Promo code badge if offer */}
                  {rec.promoCode && (
                    <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-dashed border-amber-500/40">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                          Eksklyuziv Promokod:
                        </span>
                        <span className="text-sm font-mono font-black text-amber-400">
                          {rec.promoCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleApplyPromo(rec.promoCode)}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                      >
                        {appliedPromo === rec.promoCode ? 'Qo\'llandi!' : 'Qo\'llash'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Price & Action */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    {rec.originalPrice > rec.discountedPrice && (
                      <span className="text-xs text-zinc-500 line-through block">
                        {formatPrice(rec.originalPrice)}
                      </span>
                    )}
                    <span className="text-lg font-black text-white font-['Outfit']">
                      {formatPrice(rec.discountedPrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddRecItem(rec)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-orange-500/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Qo'shildi!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Savatga</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
