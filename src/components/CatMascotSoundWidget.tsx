import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, X, ChevronUp, Music, Heart, Shirt } from 'lucide-react';
import { playRealisticMeow, playCatPurrSound, playCatDeliverySound, CatSoundStyle } from '../utils/catSound';
import { triggerTelegramHaptic } from '../utils/telegram';
import catAvatarImg from '../assets/images/cat_delivery_donner_1790068811302.jpg';

export const CatMascotSoundWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<CatSoundStyle>('classic');

  const meowPhrases: Record<CatSoundStyle, string[]> = {
    classic: [
      'Miyavvv! Qo\'limdagi qaynoq AL DONNER o\'ramini ko\'rdingizmi? 🌯🐾',
      'Miyav! Dastafkachi Skotish Fold buyurtmangizni issiq yetkazadi! 🛵✨',
      'Miyav-miyav! Barcha taomlar 100% Halol va olovli ta\'m kafolati! 🍕',
    ],
    cute: [
      'Miyovvv~ Qo\'limda issiq doner bilan sizni kutmoqdaman! 🐱🌯',
      'Miyav! AL DONNER ga xush kelibsiz! Olovli doner tayyor! 🌯',
      'Purr-mew! Dastafkachi mushugingiz xizmatingizda! ✨',
    ],
    kitten: [
      'Miyov! Kichkina Skotish Fold dastafkachisining ovozi! 🐱🛵',
      'Miyav-chiq! Eng mazali AL DONNER doneri qo\'limda! 🌯',
      'Chirp-miyav! Sevimli taomingizni tanlang! 💖',
    ],
    purr: [
      'Mrrrr-xirrr... Qo\'limdagi doner hidi juda yoqimli! 😻🌯',
      'Purrrr-purrr... Yangi olovli doner tayyor bo\'ldi! 🌯',
      'Xirrr-miyav... Yoqimli ishtaha tilaymiz! ✨',
    ],
    food: [
      'Miyav-vaaa! Qornim ochdi, qo\'limdagi donerni yeb qo\'ymay deb kuryerlik qilyapman! 😋🌯',
      'Miyav! Kuryerlarimiz kabi men ham formadaman va doner ushlab turibman! 🛵👕',
      'Miyav-ovv! AL DONNER dan buyurtma yetkazishga tayyor! 🌯💨',
    ],
  };

  const handlePlaySound = (style: CatSoundStyle = activeStyle) => {
    triggerTelegramHaptic('medium');
    setIsPlaying(true);
    setActiveStyle(style);

    if (style === 'purr') {
      playCatPurrSound(0.95);
    } else if (style === 'classic') {
      playCatDeliverySound('classic');
    } else {
      playRealisticMeow(style, 0.95);
    }

    // Pick random phrase for this style
    const phrases = meowPhrases[style] || meowPhrases.classic;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCurrentSpeech(phrase);

    setTimeout(() => {
      setIsPlaying(false);
    }, 1200);

    setTimeout(() => {
      setCurrentSpeech(null);
    }, 4000);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 select-none">
      {/* Speech bubble */}
      <AnimatePresence>
        {currentSpeech && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="mb-2 max-w-[240px] sm:max-w-[280px] p-2.5 sm:p-3 rounded-2xl bg-zinc-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 text-amber-200 text-xs font-semibold backdrop-blur-xl relative"
          >
            <div className="flex items-center gap-1.5 mb-1 text-amber-400 font-extrabold text-[11px]">
              <span className="animate-pulse">🐾</span>
              <span>Skotish Fold Mushuk:</span>
            </div>
            <p className="text-zinc-100 text-[11px] sm:text-xs leading-relaxed">
              {currentSpeech}
            </p>
            {/* Speech bubble pointer */}
            <div className="absolute -bottom-2 left-6 w-3 h-3 bg-zinc-900/95 border-b border-r border-amber-500/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Sound Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            className="mb-3 w-72 sm:w-80 p-3.5 rounded-2xl bg-[#121620]/95 border border-amber-500/40 shadow-2xl shadow-black/80 backdrop-blur-xl text-white"
          >
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-400/60 shadow-sm">
                  <img
                    src={catAvatarImg}
                    alt="Scottish Fold"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-['Syne'] font-extrabold text-xs text-amber-300">
                      Skotish Fold Mushuk Ovozlari
                    </h4>
                    <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/30">
                      Rasmiy Formada
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">AL DONNER navy polo libosidagi sevimli maskot</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => handlePlaySound('classic')}
                className={`px-2.5 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all active:scale-95 ${
                  activeStyle === 'classic'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold">🐱 Skotish Fold</div>
                  <div className="text-[10px] text-zinc-400">Haqiqiy miyavvv~</div>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePlaySound('cute')}
                className={`px-2.5 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all active:scale-95 ${
                  activeStyle === 'cute'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold">😻 Mayin Miyov</div>
                  <div className="text-[10px] text-zinc-400">Erkalanish</div>
                </div>
                <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePlaySound('kitten')}
                className={`px-2.5 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all active:scale-95 ${
                  activeStyle === 'kitten'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold">🐾 Kichkintoy</div>
                  <div className="text-[10px] text-zinc-400">Miyav-chiq!</div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePlaySound('food')}
                className={`px-2.5 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all active:scale-95 ${
                  activeStyle === 'food'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold">🔥 Och Qolgan</div>
                  <div className="text-[10px] text-zinc-400">Doner so'rash!</div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePlaySound('purr')}
                className={`col-span-2 px-2.5 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all active:scale-95 ${
                  activeStyle === 'purr'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold">💖 Xirillash & Purr</div>
                  <div className="text-[10px] text-zinc-400">Qorni to'q mushukning xirillashi</div>
                </div>
                <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </button>
            </div>

            <button
              onClick={() => handlePlaySound(activeStyle)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Ovozni Yangratish (Miyov!)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePlaySound(activeStyle)}
          className={`group relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 active:scale-95 ${
            isPlaying
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300 scale-105 shadow-amber-500/40'
              : 'bg-[#10141d]/90 hover:bg-[#161c28] text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-black/60'
          }`}
          title="Mushuk ovozini yangratish (Miyov!)"
        >
          {/* Scottish fold avatar icon */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-amber-400/70 shadow-md shrink-0">
            <img
              src={catAvatarImg}
              alt="Skotish Fold Mushuk"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isPlaying ? 'scale-125 rotate-6' : 'group-hover:scale-110'
              }`}
            />
            {isPlaying && (
              <span className="absolute inset-0 bg-amber-400/20 animate-ping" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1 font-bold text-xs font-['Outfit'] leading-none mb-0.5">
              <span>Dastafkachi Mushuk</span>
              <span className="text-[10px]">🐾</span>
            </div>
            <span
              className={`text-[10px] font-medium block leading-none ${
                isPlaying ? 'text-black font-bold' : 'text-zinc-400 group-hover:text-amber-300'
              }`}
            >
              {isPlaying ? 'Miyavvv! 🌯' : 'Qo\'lida AL DONNER'}
            </span>
          </div>

          {/* Sound waves indicator */}
          <div className="flex items-end gap-0.5 h-3 ml-1">
            <span
              className={`w-0.5 rounded-full transition-all duration-200 ${
                isPlaying
                  ? 'h-3 bg-black animate-pulse'
                  : 'h-1.5 bg-amber-400/50 group-hover:h-2.5'
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all duration-200 delay-75 ${
                isPlaying
                  ? 'h-4 bg-black animate-pulse'
                  : 'h-2 bg-amber-400/70 group-hover:h-3'
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all duration-200 delay-150 ${
                isPlaying
                  ? 'h-2.5 bg-black animate-pulse'
                  : 'h-1 bg-amber-400/50 group-hover:h-2'
              }`}
            />
          </div>
        </button>

        {/* Expand / Sound Style toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#10141d]/90 hover:bg-[#161c28] border border-amber-500/30 hover:border-amber-400 text-amber-300 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Mushuk ovoz turlarini ochish"
        >
          <ChevronUp
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-amber-400' : 'text-zinc-400'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
