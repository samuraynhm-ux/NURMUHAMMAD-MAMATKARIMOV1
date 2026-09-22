import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Flame,
  ShoppingBag,
  Check,
  Pizza,
  Clock,
  ShieldCheck,
  ChefHat,
} from 'lucide-react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { triggerTelegramHaptic } from '../utils/telegram';
import { playCatDeliverySound } from '../utils/catSound';

import catDeliveryDonnerImg from '../assets/images/cat_delivery_donner_1790068811302.jpg';
import catPizzaImg from '../assets/images/cat_uniform_pizza_1790068471575.jpg';
import donnerRealImg from '../assets/images/realistic_al_donner_1789977233409.jpg';
import burgerRealImg from '../assets/images/realistic_craft_burger_1789979137151.jpg';
import artisanPizzaRealImg from '../assets/images/realistic_artisan_pizza_1789979158922.jpg';

export type StudioItemType = 'pizza' | 'burger' | 'doner' | 'cat_pizza';

interface ThreeDStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
  defaultModel?: string;
  menuItems: MenuItem[];
  onOpenCart?: () => void;
}

export const ThreeDStudioModal: React.FC<ThreeDStudioModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  defaultModel = 'pizza',
  menuItems,
  onOpenCart,
}) => {
  const [activeItem, setActiveItem] = useState<StudioItemType>('pizza');
  const [isAdded, setIsAdded] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [catToast, setCatToast] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (defaultModel === 'burger') {
      setActiveItem('burger');
    } else if (defaultModel === 'doner' || defaultModel === 'donner') {
      setActiveItem('doner');
    } else if (defaultModel === 'cat_welcome' || defaultModel === 'cat_pizza') {
      setActiveItem('cat_pizza');
    } else {
      setActiveItem('pizza');
    }
  }, [defaultModel, isOpen]);

  if (!isOpen) return null;

  // Find corresponding MenuItem from catalog
  const getCurrentMenuItem = (): MenuItem => {
    if (activeItem === 'burger') {
      return (
        menuItems.find((m) => m.id === 'gourmet-craft-burger' || m.category === 'burger') ||
        menuItems[0]
      );
    }
    if (activeItem === 'pizza') {
      return (
        menuItems.find((m) => m.category === 'pizza' || m.id.includes('pizza')) ||
        menuItems[2]
      );
    }
    return (
      menuItems.find((m) => m.id === 'al-donner-original') ||
      menuItems[0]
    );
  };

  const currentMenuItem = getCurrentMenuItem();

  const handleAddToCart = () => {
    triggerTelegramHaptic('medium');
    if (currentMenuItem) {
      onAddToCart(currentMenuItem);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleCatClick = () => {
    triggerTelegramHaptic('medium');
    playCatDeliverySound();

    setIsFlying(true);
    setCatToast(true);
    if (currentMenuItem) {
      onAddToCart(currentMenuItem);
    }
    setIsAdded(true);

    setTimeout(() => setIsFlying(false), 1200);
    setTimeout(() => {
      setIsAdded(false);
      setCatToast(false);
    }, 3500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 12, y: -y * 12 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#11141c] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#171b26] to-[#12151e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-[2px] flex items-center justify-center shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-[#131720] rounded-[14px] flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                  Gourmet Taomlar Galereyasi
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">
                  Ultra-HD
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pitsa, Burger va Dönerlarning haqiqiy ta'mi, ingredientlari va retsepti
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Food Item Tabs */}
        <div className="px-4 py-2 bg-[#0c0f16] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveItem('pizza');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeItem === 'pizza'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Pizza className="w-3.5 h-3.5" />
            <span>Artisan Pitsa</span>
          </button>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveItem('burger');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeItem === 'burger'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <span>🍔</span>
            <span>Gourmet Burger</span>
          </button>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveItem('doner');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeItem === 'doner'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <span>🥙</span>
            <span>AL DONNER</span>
          </button>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveItem('cat_pizza');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeItem === 'cat_pizza'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <span>🛵</span>
            <span>Dastafkachi Mushuk 🌯</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[440px]">
          {/* Left: High-Definition Food Photo Viewport */}
          <div className="lg:col-span-8 relative bg-gradient-to-b from-[#181d2b] via-[#11141e] to-[#0a0d13] flex items-center justify-center p-4 overflow-hidden select-none">
            <div
              className="relative w-full h-full min-h-[340px] flex items-center justify-center cursor-pointer overflow-hidden rounded-2xl group"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
              onClick={activeItem === 'cat_pizza' ? handleCatClick : handleAddToCart}
            >
              <img
                src={
                  activeItem === 'pizza'
                    ? artisanPizzaRealImg
                    : activeItem === 'burger'
                    ? burgerRealImg
                    : activeItem === 'cat_pizza'
                    ? catDeliveryDonnerImg
                    : donnerRealImg
                }
                alt="Realistik Taom"
                className="w-full h-full object-cover max-h-[460px] rounded-2xl transition-transform duration-200"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none rounded-2xl" />

              {/* Badges */}
              <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg font-['Syne']">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    {activeItem === 'pizza'
                      ? '450°C Tosh Pechda'
                      : activeItem === 'burger'
                      ? 'Grilda Qovurilgan'
                      : activeItem === 'cat_pizza'
                      ? 'Qo\'lida AL DONNER ushlagan 🌯🐾'
                      : 'Tandirda Yopilgan'}
                  </span>
                </span>
              </div>

              <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md font-['Space_Grotesk']">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Halol</span>
                </span>
              </div>

              {activeItem === 'cat_pizza' && (
                <div className="absolute bottom-4 left-4 pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/85 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xl font-['Syne']">
                    <span>🐾</span>
                    <span>Mushukchaga bosing — AL DONNER yuboradi!</span>
                  </span>
                </div>
              )}

              {/* Flying Cat delivery animation */}
              <AnimatePresence>
                {isFlying && (
                  <motion.div
                    initial={{ scale: 0.2, y: 40, opacity: 0 }}
                    animate={{ scale: 2.4, y: -40, opacity: 1 }}
                    exit={{ scale: 3.5, y: -120, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                  >
                    <div className="text-center">
                      <span className="text-7xl drop-shadow-[0_10px_20px_rgba(245,158,11,0.8)]">
                        🌯
                      </span>
                      <p className="text-xs font-black text-amber-300 mt-2 bg-black/85 px-3 py-1 rounded-full border border-amber-500/40 font-['Syne']">
                        Miyav! Issiq AL DONNER savatingizga yo'llandi! 🐾
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel: Recipe, Ingredients & Order */}
          <div className="lg:col-span-4 bg-[#11141d] border-t lg:border-t-0 lg:border-l border-white/10 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400 block mb-1 font-['Space_Grotesk']">
                  {activeItem === 'burger'
                    ? '🍔 Realistik Gourmet Burger'
                    : activeItem === 'pizza'
                    ? '🍕 Realistik FireCrust Pitsa'
                    : activeItem === 'cat_pizza'
                    ? '🛵 Dastafkachi Skotish Fold & AL DONNER'
                    : '🥙 Afsonaviy AL DONNER'}
                </span>
                <h3 className="text-xl font-black text-white font-['Syne']">
                  {activeItem === 'burger'
                    ? 'Gourmet Double Cheddar Burger'
                    : activeItem === 'pizza'
                    ? 'FireCrust Artisan Stone Pizza'
                    : activeItem === 'cat_pizza'
                    ? 'AL DONNER (Dastafkachi Mushuk Tavsiyasi)'
                    : 'AL DONNER (Tombik Kebab)'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {activeItem === 'burger'
                    ? 'Yumshoq oltin brioche bulochka, sara mol go\'shtidan juft qalin kotlet, erigan cheddor pishlog\'i, qarsildoq salat va mualliflik sousi.'
                    : activeItem === 'pizza'
                    ? 'Olovli tosh pechda 450°C da pishgan leopard qirrali yupqa xamir, cho\'ziluvchan motsarella, yaltiroq achchiq pepperoni va barra rayhon.'
                    : activeItem === 'cat_pizza'
                    ? 'Kuryerlik qilayotgan sevimli Skotish Fold mushugimiz rasmiy polo formasida va qo\'lida issiqgina sershira AL DONNER bilan xizmatingizda!'
                    : 'Tandirda yangi yopilgan yumshoq tombik nonda marinadlangan sara mol go\'shti, erigan pishloq va sarimsoqli olovli sous.'}
                </p>
              </div>

              {/* Recipe & Ingredients Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 block font-['Space_Grotesk']">
                  Ingredientlar & Tarkibi:
                </span>
                <div className="space-y-1.5 text-xs">
                  {activeItem === 'burger' ? (
                    <>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-amber-300 font-medium">🍞 Oltin Brioche Bulochka</span>
                        <span className="text-zinc-400 text-[11px]">Kunjutli</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-orange-400 font-medium">🥩 2x Qalin Mol Go'shti Kotleti</span>
                        <span className="text-zinc-400 text-[11px]">Grilda pishgan</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-yellow-400 font-medium">🧀 Erigan Aged Cheddor</span>
                        <span className="text-zinc-400 text-[11px]">Dripping melt</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-emerald-400 font-medium">🥗 Yangi Salat, Pomidor & Piyoz</span>
                        <span className="text-zinc-400 text-[11px]">Barra sabzavot</span>
                      </div>
                    </>
                  ) : activeItem === 'pizza' || activeItem === 'cat_pizza' ? (
                    <>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-amber-300 font-medium">🍕 Oltin Qarsildoq Tosh Pech Xamiri</span>
                        <span className="text-zinc-400 text-[11px]">450°C pechda</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-yellow-400 font-medium">🧀 Cho'ziluvchan Motsarella</span>
                        <span className="text-zinc-400 text-[11px]">Krem pishloq</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-red-400 font-medium">🥩 O'tkir Pepperoni & Zaytun</span>
                        <span className="text-zinc-400 text-[11px]">Sara kolbasa</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-emerald-400 font-medium">🌿 Yangi Rayhon & Pomidor Sousi</span>
                        <span className="text-zinc-400 text-[11px]">San Marzano</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-amber-400 font-medium">🍞 Yangi Tombik Non</span>
                        <span className="text-zinc-400 text-[11px]">Kunjutli</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-orange-400 font-medium">🥩 Marinadlangan Go'sht</span>
                        <span className="text-zinc-400 text-[11px]">100% sara mol</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-yellow-400 font-medium">🧀 Cheddor Pishlog'i</span>
                        <span className="text-zinc-400 text-[11px]">Eritilgan</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-emerald-400 font-medium">🥗 Yangi Sabzavotlar</span>
                        <span className="text-zinc-400 text-[11px]">Qarsildoq</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Narx:</span>
                  <span className="text-xl font-black text-amber-400 font-['Syne']">
                    {formatPrice(currentMenuItem.basePrice)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>10-15 daqiqada tayyor</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg font-['Syne'] ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-orange-500/25'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Qo'shildi!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Savatga Qo'shish</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    triggerTelegramHaptic('light');
                    if (onOpenCart) {
                      onClose();
                      onOpenCart();
                    }
                  }}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 font-['Syne']"
                >
                  <span>Savatni Ko'rish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
