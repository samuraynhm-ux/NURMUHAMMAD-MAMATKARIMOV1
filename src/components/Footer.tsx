import React from 'react';
import { Flame, Pizza, PhoneCall, MapPin, Clock, ShieldCheck, Heart, Send, Shirt } from 'lucide-react';
import { AlDonnerLogo } from './AlDonnerLogo';
import {
  TELEGRAM_ADMIN_USERNAME,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_FORMATTED,
  RESTAURANT_NAME,
} from '../utils/telegram';

interface FooterProps {
  onOpenUniformModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenUniformModal }) => {
  return (
    <footer className="bg-[#0a0c10] border-t border-white/10 text-zinc-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c1424] via-[#101b33] to-[#070b14] border border-amber-500/40 p-1 flex items-center justify-center">
                <AlDonnerLogo variant="mark" size={26} color="gold" />
              </div>
              <div>
                <span className="font-black text-xl tracking-[0.14em] text-white font-['Outfit'] block">
                  AL DONNER
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block -mt-0.5">
                  Döner & Pizza Restorani
                </span>
              </div>
            </div>

            <p className="text-zinc-400 leading-relaxed text-xs">
              Haqiqiy olovda pishirilgan nozik xamirli Italiyan pizzalari, 
              turkcha yumshoq tombik dönerlar va oshpazimizning sirli souslari.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Halol Go'sht
              </span>

              {onOpenUniformModal && (
                <button
                  onClick={onOpenUniformModal}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Shirt className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rasmiy Forma & Brend</span>
                </button>
              )}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm font-['Outfit'] uppercase tracking-wider text-amber-400">
              Ish Vaqti
            </h4>
            <div className="space-y-2 text-zinc-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Dushanba - Yakshanba:</div>
                  <div className="text-zinc-400">10:00 dan 03:00 gacha</div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1">
                * Tungi 03:00 gacha barcha tumanlarga tezkor yetkazib berish xizmati mavjud.
              </p>
            </div>
          </div>

          {/* Branches */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm font-['Outfit'] uppercase tracking-wider text-amber-400">
              Restoran Filiallari
            </h4>
            <ul className="space-y-2 text-zinc-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>AL DONER PIZZA:</strong> Farg'ona shahar (Asosiy filial)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Farg'ona Markaz:</strong> Al-Farg'oniy shoh ko'chasi 45 (Sayilgoh)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Qirguli filiali:</strong> Mustaqillik ko'chasi 12</span>
              </li>
            </ul>
            <div className="pt-2">
              <a
                href="https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~40.376488%2C71.808105&rtt=auto&ruri=~&z=16"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-[11px] font-bold transition-all"
              >
                <span>🚗 Yandex Navigatorda ochish</span>
              </a>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm font-['Outfit'] uppercase tracking-wider text-amber-400">
              Aloqa & Buyurtma
            </h4>
            <div className="space-y-3">
              <a
                href={`tel:${RESTAURANT_PHONE}`}
                className="flex items-center gap-2 text-white font-extrabold text-base hover:text-amber-400 transition-colors font-['Outfit']"
              >
                <PhoneCall className="w-4 h-4 text-amber-500" />
                {RESTAURANT_PHONE_FORMATTED}
              </a>

              <a
                href={`https://t.me/${TELEGRAM_ADMIN_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 transition-all font-semibold text-xs"
              >
                <Send className="w-3.5 h-3.5 fill-[#229ED9]" />
                <span>Telegram: @{TELEGRAM_ADMIN_USERNAME}</span>
              </a>

              <p className="text-zinc-400 text-xs leading-relaxed">
                Buyurtmalar to'g'ridan-to'g'ri Telegram yoki telefon orqali qabul qilinadi.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} FireCrust Döner & Pizza. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-1">
            <span>Dizayn va ta'm uyg'unligi bilan yaratildi</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
