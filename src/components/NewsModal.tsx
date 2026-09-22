import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  X,
  ShoppingBag,
  Send,
  Check,
  Tag,
  Clock,
  ShieldCheck,
  ArrowRight,
  Gift,
  Award,
} from 'lucide-react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  TELEGRAM_ADMIN_USERNAME,
  RESTAURANT_PHONE_FORMATTED,
  triggerTelegramHaptic,
} from '../utils/telegram';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedSize?: string) => void;
  alDonnerItem?: MenuItem;
  onOpenCart: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  alDonnerItem,
  onOpenCart,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const promoCode = 'ALDONNER';

  const handleCopyCode = () => {
    triggerTelegramHaptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(promoCode).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAddAlDonner = () => {
    triggerTelegramHaptic('medium');
    if (alDonnerItem) {
      onAddToCart(alDonnerItem);
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        onClose();
        onOpenCart();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#181d2a] to-[#10131c] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl z-10 my-4 max-h-[92vh] flex flex-col text-white">
        {/* Header with image & badge */}
        <div className="relative h-48 sm:h-64 overflow-hidden bg-black/60 shrink-0">
          <img
            src={
              alDonnerItem?.image ||
              'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1200&q=80'
            }
            alt="AL DONNER Yangilik"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181d2a] via-[#181d2a]/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md transition-all z-20 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on banner */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black tracking-wide flex items-center gap-1.5 shadow-lg shadow-red-600/30">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>YANGILIK: AL DONNER</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/90 text-black text-xs font-extrabold flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yangi Retsept 2026</span>
            </span>
          </div>

          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Restoranimizning Yangi Bosh Taomi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] drop-shadow-md">
              AL DONNER Taqdimoti!
            </h2>
          </div>
        </div>

        {/* Scrollable body content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
          {/* Announcement lead */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-sm sm:text-base font-['Outfit']">
                Saytimizga yangilik kiritildi: "AL DONNER"
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Mijozlarimizning ko'p sonli taklif va istaklariga binoan, bosh oshpazimiz Farhod usta tomonidan
                yaratilgan yangi avlod turkcha döneri — <b>"AL DONNER"</b> rasman menyuga qo'shildi!
              </p>
            </div>
          </div>

          {/* Dish highlights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              AL DONNER ning o'ziga xos sirlari:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">100% Saralangan Mol Go'shti</span>
                  <span className="text-zinc-400">
                    Olovli vertikal grilda sekin pishirilgan shirali marinadlangan go'sht.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Maxsus AL DONNER Sousi</span>
                  <span className="text-zinc-400">
                    Tabiiy sarimsoqli smetana va o'tkir qizil qalampirli olovli sous balansi.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Eritilgan Qo'shaloq Pishloq</span>
                  <span className="text-zinc-400">
                    Cho'ziluvchan motsarella va xushbo'y cheddor pishlog'i uyg'unligi.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Tandirda Yangi Yopilgan Non</span>
                  <span className="text-zinc-400">
                    Har bir buyurtma uchun issiq, qarsildoq va yumshoq tombik nonda tayyorlanadi.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Special launch promo offer */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#142024] to-teal-950/40 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-300 text-sm font-['Outfit']">
                  Yangilik Sovg'asi: 15% Chegirma!
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30">
                -15% AKSIYA
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Yangi <b>"AL DONNER"</b> taomini birinchilardan bo'lib tatib ko'ring! Savatda quyidagi promokodni
              kiriting va <b>15% chegirma</b>ga ega bo'ling:
            </p>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono font-black text-emerald-400 tracking-wider text-sm sm:text-base">
                  <Tag className="w-4 h-4" />
                  <span>{promoCode}</span>
                </div>
                <span className="text-[11px] text-zinc-400">15% chegirma</span>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <span>Nusxalash</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#0d1017] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <span className="text-zinc-400 text-xs block">AL DONNER Boshlang'ich Narxi:</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit']">
              {formatPrice(alDonnerItem?.basePrice || 44000)}
            </span>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
            >
              Yopish
            </button>

            <button
              onClick={handleAddAlDonner}
              disabled={addedSuccess}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Savatga Qo'shildi!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Savatga Qo'shish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
