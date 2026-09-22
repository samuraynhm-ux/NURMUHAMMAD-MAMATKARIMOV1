import React, { useState } from 'react';
import { Flame, Sparkles, ChefHat, ArrowRight, ShieldCheck, Timer, Award, Send, Box, Heart, Mic, Shirt } from 'lucide-react';
import { MenuItem } from '../types';
import { ThreeDHeroCard } from './ThreeDHeroCard';
import { triggerTelegramHaptic } from '../utils/telegram';
import { playCatDeliverySound } from '../utils/catSound';
import catDeliveryDonnerImg from '../assets/images/cat_delivery_donner_1790068811302.jpg';
import { AlDonnerLogo } from './AlDonnerLogo';

interface HeroBannerProps {
  onScrollToMenu: () => void;
  onOpenAIConsultant: () => void;
  onOpenCustomBuilder: () => void;
  featuredItem?: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onOpenTelegramModal?: () => void;
  onOpenNewsModal?: () => void;
  onOpen3DStudio?: (itemKey?: string) => void;
  onOpenVoiceOrder?: () => void;
  onOpenUniformModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToMenu,
  onOpenAIConsultant,
  onOpenCustomBuilder,
  featuredItem,
  onAddToCart,
  onOpenTelegramModal,
  onOpenNewsModal,
  onOpen3DStudio,
  onOpenVoiceOrder,
  onOpenUniformModal,
}) => {
  const [catMeowed, setCatMeowed] = useState(false);

  const handleWelcomeCatClick = () => {
    triggerTelegramHaptic('medium');
    playCatDeliverySound();
    setCatMeowed(true);
    setTimeout(() => setCatMeowed(false), 3000);
  };

  return (
    <div className="relative overflow-hidden bg-[#0a0d14] border-b border-white/5 py-8 md:py-14">
      {/* Cinematic dark gradients & lighting accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0d131f] to-[#0a0d14] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-[#0a0d14]/80 pointer-events-none" />

      {/* Ambient glow spheres */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Delivery Mascot Bar: Scottish Fold Cat holding AL DONNER */}
        <div className="mb-6">
          <div
            onClick={handleWelcomeCatClick}
            className="cursor-pointer inline-flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-[#111723]/80 backdrop-blur-xl border border-amber-500/30 hover:border-amber-400 shadow-xl shadow-amber-500/5 transition-all hover:scale-[1.01] active:scale-95 group"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400/80 shadow-md shrink-0">
              <img
                src={catDeliveryDonnerImg}
                alt="Dastafkachi Skotish Fold qo'lida AL DONNER ushlab turibdi"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
            </div>

            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-['Syne'] font-extrabold text-amber-300 text-xs sm:text-sm tracking-wide">
                  🐱 DASTAFKACHI MUSHUK
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  AL DONNER BILAN 🌯
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-300 font-medium truncate max-w-[290px] sm:max-w-none">
                Qo'lida qaynoq <b className="text-amber-300">AL DONNER</b> ushlagan Skotish Fold dastafkachimiz sizni kutmoqda! <span className="text-amber-400 font-bold group-hover:underline">Miyovlatish 🐾</span>
              </p>
            </div>

            {catMeowed && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40 animate-bounce">
                Miyavvv! Qo'limdagi AL DONNER juda mazali! 🌯✨
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {/* Special AL DONNER News Callout */}
              {onOpenNewsModal && (
                <button
                  onClick={onOpenNewsModal}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600/30 via-orange-600/30 to-amber-500/30 border border-orange-500/50 text-amber-300 hover:text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/10 hover:border-amber-400 transition-all group active:scale-95"
                >
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-['Space_Grotesk'] font-bold">YANGILIK: AL DONNER</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs sm:text-sm font-semibold font-['Space_Grotesk']">
                <span className="text-amber-400 font-bold">100% Halol</span>
                <span className="text-zinc-600">|</span>
                <span>Tandir Olovida</span>
              </div>

              {onOpenUniformModal && (
                <button
                  onClick={onOpenUniformModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0e1627] hover:bg-[#16223b] border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 group"
                  title="Rasmiy AL DONNER formasi va brendi"
                >
                  <Shirt className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Rasmiy Forma & Logo</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                </button>
              )}

              {onOpenTelegramModal && (
                <button
                  onClick={onOpenTelegramModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold transition-all shadow-sm active:scale-95 font-['Space_Grotesk']"
                >
                  <Send className="w-3 h-3 fill-[#229ED9]" />
                  <span>Telegram Bot</span>
                </button>
              )}
            </div>

            {/* 2026 New Style Typography */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white font-['Syne'] leading-[1.05] tracking-[-0.04em]">
              AL DONNER: <br className="hidden sm:inline" />
              Olovda Döner va <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
                Italiyan Pizzasi
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              O'zgacha ta'm: maxsus marinadlangan mol go'shti, qarsildoq tombik non, 
              cho'ziluvchan motsarella va oshpazimizning sirli oq sarimsoqli sousi bilan.
            </p>

            {/* Quality Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-zinc-300 font-['Space_Grotesk']">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>30 daqiqada issiq</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>450°C Olovli pech</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sertifikatlangan go'sht</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onScrollToMenu}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all font-['Syne']"
              >
                <span>Menyuni Ko'rish</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </button>

              {onOpen3DStudio && (
                <button
                  onClick={() => onOpen3DStudio('pizza')}
                  className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-md active:scale-95 font-['Syne']"
                >
                  <span className="text-lg">✨</span>
                  <span>Gourmet Galereya</span>
                </button>
              )}

              <button
                onClick={onOpenAIConsultant}
                className="px-5 py-3.5 rounded-xl bg-[#191e2b] hover:bg-[#222a3d] border border-amber-500/30 text-amber-300 font-semibold text-sm sm:text-base flex items-center gap-2 transition-all hover:border-amber-400 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Maslahatchi</span>
              </button>

              {onOpenVoiceOrder && (
                <button
                  onClick={onOpenVoiceOrder}
                  className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-950/60 via-orange-950/60 to-amber-950/60 hover:from-red-900/80 hover:to-orange-900/80 border border-orange-500/40 text-orange-300 font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-md active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <Mic className="w-4 h-4 text-orange-400 animate-pulse" />
                  </div>
                  <span>🎙️ Ovozli Buyurtma</span>
                </button>
              )}

              <button
                onClick={onOpenCustomBuilder}
                className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium text-sm sm:text-base flex items-center gap-2 transition-all"
              >
                <ChefHat className="w-4 h-4 text-orange-400" />
                <span>O'z Taomingni Yarat</span>
              </button>
            </div>
          </div>

          {/* Right Column: Gourmet Food Showcase Card */}
          <div className="lg:col-span-5">
            <ThreeDHeroCard
              featuredItem={featuredItem}
              onAddToCart={onAddToCart}
              onOpen3DStudio={onOpen3DStudio || (() => {})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
