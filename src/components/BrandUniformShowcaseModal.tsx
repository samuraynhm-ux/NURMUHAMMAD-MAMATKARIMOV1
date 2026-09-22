import React from 'react';
import { X, ShieldCheck, Award, Sparkles, CheckCircle2, UserCheck, Shirt, MapPin, Phone } from 'lucide-react';
import { AlDonnerLogo } from './AlDonnerLogo';
import uniformShowcaseImg from '../assets/images/al_donner_uniform_1790067710380.jpg';
import staffPoloImg from '../assets/images/al_donner_staff_polo_1790067727595.jpg';
import catDeliveryDonnerImg from '../assets/images/cat_delivery_donner_1790068811302.jpg';
import { RESTAURANT_PHONE_FORMATTED, RESTAURANT_ADDRESS_FULL } from '../utils/telegram';

interface BrandUniformShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderNow?: () => void;
}

export const BrandUniformShowcaseModal: React.FC<BrandUniformShowcaseModalProps> = ({
  isOpen,
  onClose,
  onOrderNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0f131c] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#141924]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0b101b] border border-amber-500/30 flex items-center justify-center p-1">
              <AlDonnerLogo variant="mark" size={28} color="gold" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>AL DONNER</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  Rasmiy Brend & Forma
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Xodimlarimiz va kuryerlarimizning rasmiy kiyimi & korporativ standarti
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Uniform Showcase Hero Card */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/25 bg-black/40">
            <img
              src={uniformShowcaseImg}
              alt="AL DONNER Rasmiy Kiyim & Polo Formasi"
              className="w-full h-56 sm:h-72 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f131c] via-[#0f131c]/40 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
                  <Shirt className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rasmiy Korporativ Polo Formasi</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white font-['Outfit']">
                  AL DONNER Premium Navy Polo
                </h3>
              </div>

              <div className="shrink-0 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-right">
                <span className="text-[10px] text-zinc-400 block">Brend Belgisi</span>
                <span className="text-xs font-bold text-amber-400 font-mono">Kashta AD Monogram</span>
              </div>
            </div>
          </div>

          {/* 3 Key Brand Features of the Uniform */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Shirt className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">To'q Ko'k (Navy) & Oq Chiziqlar</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klassik yoqa va yenglardagi qo'shaloq oq chiziqlar (twin stripes) orqali xodimlarimiz darhol ajralib turadi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Embroidered AD Logo</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ko'krak qismida oq ipak ip bilan nozik tikilgan original geometrik <b>AD AL DONNER</b> emblemasi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Tozalik & Servis Kafolati</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Har bir yetkazuvchi kuryer va oshpazimiz sanitariya qoidalariga muvofiq toza va dazmollangan formali xizmat ko'rsatadi.
              </p>
            </div>
          </div>

          {/* Staff in Action Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#181e2c] to-[#151924] border border-amber-500/30 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={staffPoloImg}
              alt="AL DONNER Kuryer va Xodimi"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-amber-400/40 shrink-0 shadow-lg"
            />
            <div className="text-left space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  Mijozlarga Ishonchli Xizmat
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                «Eshigingizga kelgan kuryerimiz rasmiy AL DONNER formasida bo'ladi»
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Shaxsiy brend formasi orqali buyurtmangiz haqiqiy AL DONNER restoranidan kelganiga 100% amin bo'lishingiz mumkin.
              </p>
            </div>
          </div>

          {/* Scottish Fold Delivery Cat Mascot Card (Kichikroq va qo'lida AL DONNER) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#131b2e] to-[#0f1422] border border-blue-500/40 flex flex-col sm:flex-row items-center gap-3.5 shadow-xl">
            <div className="relative shrink-0">
              <img
                src={catDeliveryDonnerImg}
                alt="Dastafkachi Skotish Fold Mushuk qo'lida AL DONNER bilan"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-amber-400/80 shadow-lg"
              />
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow">
                KURYER
              </span>
            </div>
            <div className="text-left space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <span>🐾</span> Dastafkachi Skotish Fold
                </span>
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Qo'lida AL DONNER 🌯
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                «Kuryer mushugimiz rasmiy formamizda va qo'lida qaynoq AL DONNER bilan!»
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Bizning sevimli Skotish Fold kuryerimiz xodimlarimiz bilan bir xil to'q ko'k polo formasida, 
                qo'llarida yangi pishgan sershira AL DONNER o'ramini tutgan holda buyurtmangizni kutmoqda.
              </p>
            </div>
          </div>

          {/* Restaurant Details Badge */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{RESTAURANT_ADDRESS_FULL}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-white">{RESTAURANT_PHONE_FORMATTED}</span>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                if (onOrderNow) onOrderNow();
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all font-['Outfit']"
            >
              <Sparkles className="w-4 h-4" />
              <span>AL DONNER Taomlariga Buyurtma Berish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
