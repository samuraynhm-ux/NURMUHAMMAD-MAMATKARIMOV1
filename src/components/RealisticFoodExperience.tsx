import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Heart, ShoppingBag, Send, Volume2, Info, Check } from 'lucide-react';
import { triggerTelegramHaptic } from '../utils/telegram';
import { playCatDeliverySound } from '../utils/catSound';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/formatters';

import catPizzaImg from '../assets/images/cat_uniform_pizza_1790068471575.jpg';
import donnerRealImg from '../assets/images/realistic_al_donner_1789977233409.jpg';
import catUniformPoloImg from '../assets/images/cat_uniform_polo_1790068457413.jpg';

interface RealisticFoodExperienceProps {
  onSendPizza: (item: MenuItem) => void;
  menuItems: MenuItem[];
  onOpenCart?: () => void;
  compact?: boolean;
}

export const RealisticFoodExperience: React.FC<RealisticFoodExperienceProps> = ({
  onSendPizza,
  menuItems,
  onOpenCart,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'cat' | 'doner'>('welcome');
  const [isFlying, setIsFlying] = useState(false);
  const [flyingCount, setFlyingCount] = useState(0);
  const [showCatMessage, setShowCatMessage] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Target pizza item
  const pizzaItem =
    menuItems.find((it) => it.id === 'doner-pizza' || it.category === 'pizza') ||
    menuItems.find((it) => it.name.toLowerCase().includes('pizza')) ||
    menuItems[0];

  const donerItem =
    menuItems.find((it) => it.id === 'al-donner-original') || menuItems[0];

  // Mouse tilt effect for 3D realism
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Click on Scottish Fold cat to send pizza or welcoming gift
  const handleCatClick = () => {
    triggerTelegramHaptic('medium');
    playCatDeliverySound();

    setIsFlying(true);
    setFlyingCount((prev) => prev + 1);
    setShowCatMessage(true);

    if (activeTab === 'welcome') {
      if (donerItem) {
        onSendPizza(donerItem);
      }
    } else if (pizzaItem) {
      onSendPizza(pizzaItem);
    }

    setTimeout(() => {
      setIsFlying(false);
    }, 1200);

    setTimeout(() => {
      setShowCatMessage(false);
    }, 4500);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#131722] via-[#0d1017] to-[#090b10] border border-amber-500/30 shadow-2xl">
      {/* Top Header Switcher */}
      <div className="px-4 py-3 bg-[#0c0f16]/90 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/5 overflow-x-auto">
          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveTab('welcome');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeTab === 'welcome'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🐱</span>
            <span>Hush Kelibsz! (AL DONNER & Mushuk)</span>
          </button>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveTab('cat');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeTab === 'cat'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🍕</span>
            <span>Skotish Fold & Pitssa</span>
          </button>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              setActiveTab('doner');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all font-['Syne'] ${
              activeTab === 'doner'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Realistik AL DONNER</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-['Space_Grotesk']">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            2026 Ultra-HD Realistik
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className={`relative ${
          compact ? 'h-72 sm:h-80' : 'h-80 sm:h-96 md:h-[440px]'
        } flex items-center justify-center overflow-hidden cursor-pointer select-none`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={activeTab !== 'doner' ? handleCatClick : undefined}
      >
        {/* Dynamic 3D Parallax Image Wrapper */}
        <div
          className="relative w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${
              isHovered ? 1.02 : 1
            })`,
          }}
        >
          {activeTab === 'welcome' ? (
            <div className="relative w-full h-full">
              <img
                src={catUniformPoloImg}
                alt="Skotish Fold mushuk rasmiy AL DONNER formasida"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-black/35 pointer-events-none" />

              {/* Pulsing "Hush kelibsz" Callout */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="px-3.5 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/50 text-white shadow-2xl flex items-center gap-2.5 animate-bounce">
                  <span className="text-xl">🐱</span>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-amber-300 font-['Syne']">
                      HUSH KELIBSZ!
                    </p>
                    <p className="text-[10px] text-zinc-300">
                      Skotish Fold rasmiy AL DONNER formasida sizni kutmoqda! 👕🐾
                    </p>
                  </div>
                </div>
              </div>

              {/* Cat breed tag */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className="px-2.5 py-1 rounded-xl bg-blue-950/80 backdrop-blur-md border border-blue-400/40 text-blue-200 text-[11px] font-semibold flex items-center gap-1 font-['Space_Grotesk']">
                  <span>👕</span> Rasmiy AL DONNER Formasi
                </span>
              </div>
            </div>
          ) : activeTab === 'cat' ? (
            <div className="relative w-full h-full">
              <img
                src={catPizzaImg}
                alt="Kulrang Skotish Fold mushuk pitsa bilan"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-black/30 pointer-events-none" />

              {/* Pulsing "Click Me" Callout */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="px-3 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-500/40 text-white shadow-xl flex items-center gap-2 animate-bounce">
                  <span className="text-base">🐾</span>
                  <div>
                    <p className="text-xs font-black text-amber-300 font-['Syne']">
                      Mushukchani bosing!
                    </p>
                    <p className="text-[10px] text-zinc-300">
                      Sizga issiq pitssa yuboradi
                    </p>
                  </div>
                </div>
              </div>

              {/* Cat breed tag */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 font-['Space_Grotesk']">
                  <span>🐈</span> Skotish Fold (Kulrang)
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={donnerRealImg}
                alt="Haqiqiy AL DONNER Tombik Kebab"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black shadow-lg flex items-center gap-1.5 font-['Syne']">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  Maxsus Yangilik: AL DONNER
                </span>
              </div>
            </div>
          )}

          {/* Flying Food Animation toward user */}
          <AnimatePresence>
            {isFlying && (
              <motion.div
                initial={{ scale: 0.3, y: 40, opacity: 0 }}
                animate={{ scale: 2.2, y: -60, opacity: 1 }}
                exit={{ scale: 3.5, y: -160, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <div className="relative flex flex-col items-center">
                  <span className="text-7xl filter drop-shadow-[0_15px_25px_rgba(245,158,11,0.7)] animate-spin">
                    {activeTab === 'welcome' ? '🥙' : '🍕'}
                  </span>
                  <span className="mt-3 px-3 py-1 rounded-full bg-amber-500 text-black font-black text-xs shadow-2xl font-['Syne']">
                    {activeTab === 'welcome'
                      ? 'Hush kelibsz! AL DONNER savatga kirdi!'
                      : '+1 FireCrust Pitssa yuborildi!'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cat purr / meow message toast */}
        <AnimatePresence>
          {showCatMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none"
            >
              <div className="p-3.5 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/50 shadow-2xl flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
                    🐱
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-300 font-['Syne']">
                      {activeTab === 'welcome'
                        ? 'Skotish Fold: "Hush kelibsz! AL DONNER lazzatini tatib ko\'ring!"'
                        : 'Skotish Fold: "Miyav! Issiq pitssangiz tayyor!"'}
                    </h4>
                    <p className="text-[11px] text-zinc-300">
                      {activeTab === 'welcome'
                        ? "AL DONNER maxsus taomi savatingizga joylandi. Xush kelibsiz! 🐾✨"
                        : "FireCrust pitssasi savatingizga joylandi. Yoqimli ishtaha! 🍕✨"}
                    </p>
                  </div>
                </div>

                {onOpenCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCart();
                    }}
                    className="pointer-events-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs shadow-md active:scale-95 whitespace-nowrap font-['Syne']"
                  >
                    Savatni ko'rish
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Description & Actions Bar */}
      <div className="p-4 sm:p-5 bg-[#0f131d] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white font-['Syne']">
              {activeTab === 'welcome'
                ? 'AL DONNER & Skotish Fold (Hush Kelibsz!)'
                : activeTab === 'cat'
                ? 'Skotish Fold & FireCrust Döner Pitssa'
                : 'AL DONNER (Maxsus Yangilik)'}
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold font-['Space_Grotesk']">
              2026 Style
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            {activeTab === 'welcome'
              ? 'Kulrang Skotish Fold mushukchasi AL DONNER yonida turib sizni qutlamoqda: "Hush kelibsz!". Mushukka bosing va maxsus taomni savatga oling!'
              : activeTab === 'cat'
              ? 'Kulrang Skotish Fold mushukchasi sizga tandirdan yangi chiqqan issiq pitssani ushlab turibdi. Mushukka teging va pitssani savatga qabul qilib oling!'
              : 'Qarsildoq tombik nonda sara marinadlangan mol go\'shti, erigan cheddor pishlog\'i va maxsus olovli sous.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-medium font-['Space_Grotesk']">
              Narxi:
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-400 font-['Syne']">
              {formatPrice(
                activeTab === 'cat'
                  ? pizzaItem?.basePrice || 85000
                  : donerItem?.basePrice || 44000
              )}
            </span>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'cat' || activeTab === 'welcome') {
                handleCatClick();
              } else if (donerItem) {
                triggerTelegramHaptic('medium');
                onSendPizza(donerItem);
                setIsFlying(true);
                setTimeout(() => setIsFlying(false), 1200);
              }
            }}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all font-['Syne']"
          >
            {activeTab === 'welcome' ? (
              <>
                <Send className="w-4 h-4" />
                <span>Hush Kelibsz! Menga Yubor 🥙</span>
              </>
            ) : activeTab === 'cat' ? (
              <>
                <Send className="w-4 h-4" />
                <span>Menga Yuborish 🍕</span>
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
  );
};
