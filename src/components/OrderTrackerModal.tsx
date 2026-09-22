import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  getTelegramOrderUrl,
  TELEGRAM_ADMIN_USERNAME,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_FORMATTED,
} from '../utils/telegram';
import {
  X,
  CheckCircle,
  Flame,
  Bike,
  PackageCheck,
  PhoneCall,
  Clock,
  MapPin,
  ChevronRight,
  Send,
  ExternalLink,
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  onNewOrder: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  onNewOrder,
}) => {
  if (!isOpen) return null;

  // Local simulated status state
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    activeOrder?.status || 'cooking'
  );
  const [minutesLeft, setMinutesLeft] = useState(
    activeOrder?.estimatedDeliveryMinutes || 24
  );

  useEffect(() => {
    if (activeOrder) {
      setCurrentStatus(activeOrder.status);
      setMinutesLeft(activeOrder.estimatedDeliveryMinutes || 24);
    }
  }, [activeOrder]);

  // Status steps configuration
  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'received',
      label: 'Qabul qilindi',
      desc: 'Buyurtmangiz tizimga kiritildi',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      key: 'cooking',
      label: 'Pishirilmoqda',
      desc: 'Olovli pechda maxsus retsept asosida tayyorlanmoqda',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      key: 'delivering',
      label: 'Kuryer yo\'lda',
      desc: 'Termo-sumkada qaynoq holda manzilga olib ketilmoqda',
      icon: <Bike className="w-5 h-5" />,
    },
    {
      key: 'delivered',
      label: 'Yetkazib berildi',
      desc: 'Yoqimli ishtaha! Dasturxoningizga fayz tilaymiz',
      icon: <PackageCheck className="w-5 h-5" />,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'cooking':
        return 1;
      case 'delivering':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 1;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  // Advance simulation step helper
  const advanceStep = () => {
    if (currentStatus === 'received') {
      setCurrentStatus('cooking');
      setMinutesLeft(18);
    } else if (currentStatus === 'cooking') {
      setCurrentStatus('delivering');
      setMinutesLeft(9);
    } else if (currentStatus === 'delivering') {
      setCurrentStatus('delivered');
      setMinutesLeft(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#131724] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#0f121d] border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black">
                {activeOrder ? activeOrder.id : '#FC-4821'}
              </span>
              <h3 className="text-xl font-bold font-['Outfit'] text-white">
                Jonli Buyurtma Holati
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Buyurtmangiz tayyorlanish jarayonini real vaqtda kuzatib boring
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracker Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Estimated ETA Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-black flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-zinc-400 font-medium">Taxminiy yetib borish vaqti:</span>
                <div className="text-lg sm:text-xl font-black text-amber-400 font-['Outfit']">
                  {minutesLeft > 0 ? `~${minutesLeft} daqiqa` : 'Buyurtma yetkazildi!'}
                </div>
              </div>
            </div>

            {/* Test Simulation Button */}
            {currentStatus !== 'delivered' && (
              <button
                onClick={advanceStep}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-zinc-200 font-medium border border-white/10 transition-all"
                title="Holatni simulyatsiya qilish"
              >
                Keyingi bosqich &rarr;
              </button>
            )}
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-4 py-2">
            {steps.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-10 transition-colors ${
                        idx < activeIndex ? 'bg-orange-500' : 'bg-white/10'
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-black shadow-lg shadow-orange-500/30 scale-105 animate-pulse'
                        : 'bg-[#181d2a] text-zinc-500 border border-white/5'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold font-['Outfit'] ${
                          isCurrent
                            ? 'text-amber-400'
                            : isPast
                            ? 'text-white'
                            : 'text-zinc-500'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Hozirgi holat
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Telegram Dispatch & Status Notification Card */}
          {activeOrder && (
            <div className="p-4 rounded-2xl bg-[#172032] border border-[#229ED9]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center">
                    <Send className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Telegram xabar: @{TELEGRAM_ADMIN_USERNAME}
                    </h5>
                    <p className="text-[11px] text-zinc-300">
                      Buyurtmani adminga yuborish yoki savol berish
                    </p>
                  </div>
                </div>

                <a
                  href={
                    activeOrder.telegramUrl ||
                    getTelegramOrderUrl(activeOrder, TELEGRAM_ADMIN_USERNAME)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Send className="w-3 h-3 fill-white" />
                  <span>Telegramga yuborish</span>
                </a>
              </div>
            </div>
          )}

          {/* Restaurant & Courier Info Card */}
          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-black text-sm">
                  KD
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">
                    KEBAB Döner Pizza
                  </h5>
                  <span className="text-xs text-zinc-400">
                    Oshxona & Kuryer xizmati
                  </span>
                </div>
              </div>

              <a
                href={`tel:${RESTAURANT_PHONE}`}
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{RESTAURANT_PHONE_FORMATTED}</span>
              </a>
            </div>

            {/* Address */}
            <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-300">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="truncate">
                {activeOrder?.address || "Farg'ona sh., Al-Farg'oniy shoh ko'chasi 45"}
              </span>
            </div>
          </div>

          {/* Order items preview */}
          {activeOrder && activeOrder.items.length > 0 && (
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-400">
                Buyurtma qilingan taomlar:
              </span>
              <div className="space-y-1 bg-[#10131d] p-3 rounded-xl border border-white/5">
                {activeOrder.items.map((it, i) => {
                  const itemName = it.menuItem?.name || it.name || 'Taom';
                  const itemPrice = it.price || it.unitPrice || 0;
                  return (
                    <div key={i} className="flex justify-between text-zinc-300">
                      <span>
                        {it.quantity}x {itemName} {it.size ? `(${it.size})` : ''}
                      </span>
                      <span className="font-semibold text-white">
                        {formatPrice(itemPrice * it.quantity)}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 mt-1 border-t border-white/10 flex justify-between font-bold text-white">
                  <span>Jami:</span>
                  <span className="text-amber-400 font-['Outfit']">
                    {formatPrice(activeOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0f121d] border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all"
          >
            Yopish
          </button>

          <button
            onClick={() => {
              onClose();
              onNewOrder();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Yangi Taom Buyurtma Berish</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
