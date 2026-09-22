import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  ShoppingBag,
  Clock,
  ChefHat,
  Pizza,
  PhoneCall,
  User,
  Award,
  Send,
  Box,
  Volume2,
  Mic,
  Shirt,
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { UserProfile } from '../types';
import { AlDonnerLogo } from './AlDonnerLogo';
import {
  TELEGRAM_ADMIN_USERNAME,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_FORMATTED,
  RESTAURANT_NAME,
  triggerTelegramHaptic,
} from '../utils/telegram';
import { playCatDeliverySound } from '../utils/catSound';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAIConsultant: () => void;
  onOpenCustomBuilder: () => void;
  onOpenOrderTracker: () => void;
  currentUser: UserProfile | null;
  onOpenAccountModal: (tab?: 'profile' | 'orders' | 'recommendations') => void;
  deliveryType: 'delivery' | 'takeaway';
  onToggleDeliveryType: (type: 'delivery' | 'takeaway') => void;
  onOpenTelegramModal?: () => void;
  onOpenNewsModal?: () => void;
  onOpen3DStudio?: (itemKey?: string) => void;
  onOpenVoiceOrder?: () => void;
  onOpenUniformModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAIConsultant,
  onOpenCustomBuilder,
  onOpenOrderTracker,
  currentUser,
  onOpenAccountModal,
  deliveryType,
  onToggleDeliveryType,
  onOpenTelegramModal,
  onOpenNewsModal,
  onOpen3DStudio,
  onOpenVoiceOrder,
  onOpenUniformModal,
}) => {
  const [catMeowed, setCatMeowed] = useState(false);

  const handleHeaderCatMeow = () => {
    triggerTelegramHaptic('medium');
    playCatDeliverySound('classic');
    setCatMeowed(true);
    setTimeout(() => setCatMeowed(false), 2200);
  };
  return (
    <header className="sticky top-0 z-40 bg-[#0d0f14]/90 backdrop-blur-md border-b border-white/10 transition-all">
      {/* Top micro bar with contact & opening hours */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-8 py-1.5 text-xs text-zinc-400 border-b border-white/5 bg-black/30">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Clock className="w-3.5 h-3.5" /> 10:00 - 03:00 (Tungi yetkazib berish ochiq)
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300">Farg'ona bo'ylab 30 daqiqada issiq yetkazamiz</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`tel:${RESTAURANT_PHONE}`}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors font-medium"
          >
            <PhoneCall className="w-3 h-3 text-amber-500" />
            {RESTAURANT_PHONE_FORMATTED}
          </a>
          <a
            href={`https://t.me/${TELEGRAM_ADMIN_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#229ED9] hover:text-[#42b7f5] transition-colors font-medium"
          >
            <Send className="w-3 h-3 fill-[#229ED9]" />
            @{TELEGRAM_ADMIN_USERNAME}
          </a>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            100% Halol
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="AL DONNER Rasmiy Bosh Sahifasi"
        >
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#101b33] to-[#070b14] border border-amber-500/40 p-1.5 shadow-lg shadow-amber-500/10 flex items-center justify-center group-hover:border-amber-400 group-hover:scale-105 transition-all">
            <AlDonnerLogo variant="mark" size={32} color="gold" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl sm:text-2xl tracking-[0.15em] text-white font-['Outfit'] group-hover:text-amber-300 transition-colors">
                AL DONNER
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-amber-400/90 uppercase block -mt-0.5 font-['Outfit']">
              Döner & Pizza Restorani
            </span>
          </div>
        </div>

        {/* Delivery / Takeaway toggle */}
        <div className="hidden lg:flex items-center bg-[#181c25] p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => onToggleDeliveryType('delivery')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              deliveryType === 'delivery'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Yetkazib berish</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${deliveryType === 'delivery' ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-400'}`}>
              ~30 daq
            </span>
          </button>
          <button
            onClick={() => onToggleDeliveryType('takeaway')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              deliveryType === 'takeaway'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Olib ketish</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
              -10%
            </span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* New AL DONNER News button */}
          {onOpenNewsModal && (
            <button
              onClick={onOpenNewsModal}
              className="relative px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-orange-500/40 text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
              title="Sayt yangiliklari: AL DONNER"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Yangilik</span>
            </button>
          )}

          {/* Gourmet Food Gallery button */}
          {onOpen3DStudio && (
            <button
              onClick={() => onOpen3DStudio('pizza')}
              className="relative px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/50 to-orange-950/50 hover:from-amber-900/70 hover:to-orange-900/70 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="Gourmet Taomlar Galereyasi"
            >
              <span>✨</span>
              <span className="hidden sm:inline">Gourmet Galereya</span>
              <span className="sm:hidden">Galereya</span>
            </button>
          )}

          {/* Scottish Fold Cat Meow Sound button */}
          <button
            onClick={handleHeaderCatMeow}
            className={`relative px-2.5 sm:px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              catMeowed
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black border-amber-300 scale-105 shadow-amber-500/30'
                : 'bg-gradient-to-r from-amber-950/40 to-yellow-950/40 hover:from-amber-900/60 hover:to-yellow-900/60 border-amber-500/40 text-amber-300 hover:border-amber-400'
            }`}
            title="Mushuk ovozi (Miyovlatish)"
          >
            <span className="text-sm">🐱</span>
            <span className="font-extrabold font-['Outfit']">{catMeowed ? 'Miyav! 🐾' : 'Miyov'}</span>
            {catMeowed && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          {/* AI Gourmet Sommelier button */}
          <button
            onClick={onOpenAIConsultant}
            className="group relative px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-950/60 to-amber-950/60 hover:from-purple-900/80 hover:to-amber-900/80 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-amber-500/5 hover:border-amber-400"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">AI Maslahatchi</span>
            <span className="sm:hidden">AI</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          </button>

          {/* Voice Order Button */}
          {onOpenVoiceOrder && (
            <button
              onClick={onOpenVoiceOrder}
              className="relative px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-red-950/50 via-orange-950/50 to-amber-950/50 hover:from-red-900/70 hover:to-orange-900/70 border border-orange-500/40 hover:border-orange-400 text-orange-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 group"
              title="Ovozli buyurtma berish (Voice-to-Order)"
            >
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                <Mic className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              </div>
              <span className="hidden md:inline">Ovozli Buyurtma</span>
              <span className="md:hidden">Ovozli</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
            </button>
          )}

          {/* Interactive Custom Builder button */}
          <button
            onClick={onOpenCustomBuilder}
            className="hidden md:flex px-3.5 py-2 rounded-xl bg-[#191e29] hover:bg-[#202735] border border-white/10 hover:border-orange-500/40 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium items-center gap-2 transition-all"
          >
            <ChefHat className="w-4 h-4 text-orange-400" />
            <span>O'z Taomingni Yarat</span>
          </button>

          {/* Order Tracker button */}
          <button
            onClick={onOpenOrderTracker}
            className="hidden sm:flex px-3 py-2 rounded-xl bg-[#191e29] hover:bg-[#202735] border border-white/10 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium items-center gap-1.5 transition-all"
            title="Buyurtmalar holati"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Buyurtmalarim</span>
          </button>

          {/* Telegram Bot button */}
          <button
            onClick={onOpenTelegramModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
            title="Telegram Bot & WebApp sozlamalari"
          >
            <Send className="w-3.5 h-3.5 fill-[#229ED9]" />
            <span className="hidden md:inline">Bot</span>
          </button>

          {/* Official Staff Uniform button */}
          {onOpenUniformModal && (
            <button
              onClick={onOpenUniformModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e1626] hover:bg-[#152038] border border-blue-500/30 hover:border-blue-400 text-blue-200 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
              title="AL DONNER rasmiy jamoa va kuryer formasi"
            >
              <Shirt className="w-3.5 h-3.5 text-blue-400" />
              <span>Forma</span>
            </button>
          )}

          {/* User Account / Profile button */}
          <button
            onClick={() => onOpenAccountModal()}
            className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs sm:text-sm font-medium ${
              currentUser
                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                : 'bg-[#191e29] hover:bg-[#202735] border-white/10 text-zinc-300 hover:text-white'
            }`}
            title={currentUser ? `${currentUser.name} (${currentUser.loyaltyTier})` : 'Hisobga kirish'}
          >
            {currentUser ? (
              <>
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-bold">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {currentUser.loyaltyTier}
                </span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-zinc-400" />
                <span className="hidden sm:inline">Kirish</span>
              </>
            )}
          </button>

          {/* Shopping Cart button */}
          <button
            onClick={onOpenCart}
            className="relative px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-black stroke-[2.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-black text-amber-400 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-amber-400">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-extrabold font-['Outfit']">
              {cartTotal > 0 ? formatPrice(cartTotal) : 'Savat'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
