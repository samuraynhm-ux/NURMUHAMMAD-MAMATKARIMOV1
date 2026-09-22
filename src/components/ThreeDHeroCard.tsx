import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { triggerTelegramHaptic } from '../utils/telegram';
import { playCatDeliverySound } from '../utils/catSound';

import catPizzaImg from '../assets/images/cat_uniform_pizza_1790068471575.jpg';
import donnerRealImg from '../assets/images/realistic_al_donner_1789977233409.jpg';
import catUniformPoloImg from '../assets/images/cat_uniform_polo_1790068457413.jpg';
import burgerRealImg from '../assets/images/realistic_craft_burger_1789979137151.jpg';
import artisanPizzaRealImg from '../assets/images/realistic_artisan_pizza_1789979158922.jpg';

export type RealisticItemKey = 'pizza' | 'burger' | 'donner' | 'cat_welcome';

interface ThreeDHeroCardProps {
  featuredItem?: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onOpen3DStudio: (itemKey?: string) => void;
}

export const ThreeDHeroCard: React.FC<ThreeDHeroCardProps> = ({
  featuredItem,
  onAddToCart,
  onOpen3DStudio,
}) => {
  const [selectedItem, setSelectedItem] = useState<RealisticItemKey>('pizza');
  const [isAdded, setIsAdded] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [catWelcomeText, setCatWelcomeText] = useState('Hush kelibsz!');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleAdd = () => {
    triggerTelegramHaptic('medium');
    if (featuredItem) {
      onAddToCart(featuredItem);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1800);
    }
  };

  const handleCatClick = () => {
    triggerTelegramHaptic('medium');
    playCatDeliverySound();

    setIsFlying(true);
    setCatWelcomeText('Miyav! Hush kelibsz! 🐾');
    if (featuredItem) {
      onAddToCart(featuredItem);
    }
    setIsAdded(true);

    setTimeout(() => {
      setIsFlying(false);
    }, 1100);

    setTimeout(() => {
      setIsAdded(false);
      setCatWelcomeText('Hush kelibsz!');
    }, 3000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const getItemDetails = () => {
    switch (selectedItem) {
      case 'pizza':
        return {
          tag: '🍕 REALISTIK ARTISAN PITSA',
          title: 'FireCrust Stone-Baked Pizza',
          desc: 'Olovli tosh pechda 450°C da pishirilgan qarsildoq leopard qirrali pitsa, qaynoq motsarella va yaltiroq achchiq pepperoni bo\'laklari.',
          price: 85000,
          oldPrice: 95000,
          emoji: '🍕',
          badge: 'Tosh Pechda',
        };
      case 'burger':
        return {
          tag: '🍔 REALISTIK GOURMET BURGER',
          title: 'Double Smash Cheddar Burger',
          desc: 'Oltin kunjutli brioche bulochka, grilda qovurilgan shirali juft qalin go\'sht, tomayotgan cheddor pishlog\'i va barra qizil pomidor.',
          price: 46000,
          oldPrice: 52000,
          emoji: '🍔',
          badge: 'Double Beef',
        };
      case 'cat_welcome':
        return {
          tag: '🐱 RASMIY FORMA • 2026',
          title: 'AL DONNER & Skotish Fold',
          desc: 'Kulrang Skotish Fold mushugimiz rasmiy to\'q ko\'k AL DONNER formasida (kashta AD logotipi va oq chiziqli yoqa bilan) sizni kutib olmoqda! Bosib miyovlatish mumkin 🐾',
          price: 44000,
          oldPrice: 50000,
          emoji: '🐾',
          badge: 'Rasmiy Forma 👕',
        };
      case 'donner':
      default:
        return {
          tag: '🥙 REALISTIK AL DONNER',
          title: 'AL DONNER (Maxsus Yangilik)',
          desc: 'Sara mol go\'shti, erigan pishloq, maxsus sarimsoqli sous va qizartirilgan qarsildoq tombik non uyg\'unligi.',
          price: 44000,
          oldPrice: 50000,
          emoji: '🥙',
          badge: 'Top Brend',
        };
    }
  };

  const details = getItemDetails();

  return (
    <div className="relative group mx-auto max-w-md lg:max-w-none">
      {/* Back glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-red-500/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

      <div className="relative bg-[#141822] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Item Selector Tabs */}
        <div className="px-4 py-2.5 bg-[#0e1117] border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={() => {
                triggerTelegramHaptic('light');
                setSelectedItem('pizza');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1 font-['Syne'] ${
                selectedItem === 'pizza'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🍕</span>
              <span>Pitsa</span>
            </button>

            <button
              onClick={() => {
                triggerTelegramHaptic('light');
                setSelectedItem('burger');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1 font-['Syne'] ${
                selectedItem === 'burger'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🍔</span>
              <span>Burger</span>
            </button>

            <button
              onClick={() => {
                triggerTelegramHaptic('light');
                setSelectedItem('donner');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1 font-['Syne'] ${
                selectedItem === 'donner'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🥙</span>
              <span>Döner</span>
            </button>

            <button
              onClick={() => {
                triggerTelegramHaptic('light');
                setSelectedItem('cat_welcome');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1 font-['Syne'] ${
                selectedItem === 'cat_welcome'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🐱</span>
              <span>Mushukcha</span>
            </button>
          </div>
        </div>

        {/* Visual Viewport with Parallax Tilt */}
        <div
          className="relative h-64 sm:h-72 bg-gradient-to-b from-[#181d29] via-[#10131c] to-[#0d0f15] overflow-hidden select-none cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={selectedItem === 'cat_welcome' ? handleCatClick : handleAdd}
        >
          <div
            className="relative w-full h-full transition-transform duration-150"
            style={{
              transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            }}
          >
            <img
              src={
                selectedItem === 'pizza'
                  ? artisanPizzaRealImg
                  : selectedItem === 'burger'
                  ? burgerRealImg
                  : selectedItem === 'donner'
                  ? donnerRealImg
                  : catUniformPoloImg
              }
              alt={details.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-black/25 pointer-events-none" />

            {/* Floating Badges */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg font-['Syne']">
                <span>{details.emoji}</span>
                <span>{details.tag}</span>
              </span>
            </div>

            <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-['Space_Grotesk'] border border-amber-500/30 font-bold">
                {details.badge}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-zinc-300 text-[10px] font-['Space_Grotesk'] border border-white/10 font-bold">
                100% Halol
              </span>
            </div>

            {/* Flying Animation for Cat */}
            <AnimatePresence>
              {isFlying && (
                <motion.div
                  initial={{ scale: 0.2, y: 30, opacity: 0 }}
                  animate={{ scale: 2.2, y: -40, opacity: 1 }}
                  exit={{ scale: 3.5, y: -120, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                >
                  <div className="text-center">
                    <span className="text-6xl drop-shadow-[0_10px_20px_rgba(245,158,11,0.8)]">
                      🍕
                    </span>
                    <p className="text-xs font-black text-amber-300 mt-2 bg-black/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-['Syne']">
                      {catWelcomeText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom right: Open in Gourmet Showcase */}
          <div className="absolute bottom-2 right-3 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerTelegramHaptic('light');
                onOpen3DStudio(selectedItem);
              }}
              className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md font-['Space_Grotesk'] backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Batafsil & Tarkibi</span>
            </button>
          </div>
        </div>

        {/* Card Details & Price */}
        <div className="p-4 sm:p-5 space-y-3 bg-[#131722]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400 block font-['Space_Grotesk']">
                {details.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white font-['Syne']">
                {details.title}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
              Ultra-HD
            </span>
          </div>

          <p className="text-xs text-zinc-300 line-clamp-2">
            {details.desc}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium font-['Space_Grotesk']">
                Narxi
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Syne']">
                  {formatPrice(details.price)}
                </span>
                <span className="text-xs text-zinc-500 line-through font-['Space_Grotesk']">
                  {formatPrice(details.oldPrice)}
                </span>
              </div>
            </div>

            <button
              onClick={selectedItem === 'cat_welcome' ? handleCatClick : handleAdd}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-lg font-['Syne'] ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-orange-500/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Qabul qilindi!</span>
                </>
              ) : selectedItem === 'cat_welcome' ? (
                <>
                  <span>🐾</span>
                  <span>Hush Kelibsz!</span>
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
