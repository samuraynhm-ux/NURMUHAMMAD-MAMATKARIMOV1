import React from 'react';
import { Shirt, ShieldCheck, Sparkles, UserCheck, ArrowRight, Award } from 'lucide-react';
import { AlDonnerLogo } from './AlDonnerLogo';
import uniformShowcaseImg from '../assets/images/al_donner_uniform_1790067710380.jpg';
import staffPoloImg from '../assets/images/al_donner_staff_polo_1790067727595.jpg';
import catDeliveryDonnerImg from '../assets/images/cat_delivery_donner_1790068811302.jpg';

interface BrandUniformSectionProps {
  onOpenUniformModal: () => void;
  onScrollToMenu: () => void;
}

export const BrandUniformSection: React.FC<BrandUniformSectionProps> = ({
  onOpenUniformModal,
  onScrollToMenu,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#101b30] to-[#0a0f1a] border border-amber-500/30 shadow-2xl p-6 sm:p-10">
        {/* Subtle Ambient Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand Story & Uniform Highlights */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold font-['Outfit']">
              <Shirt className="w-4 h-4 text-blue-400" />
              <span>AL DONNER Rasmiy Korporativ Standarti</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-amber-500/40 p-2 flex items-center justify-center">
                <AlDonnerLogo variant="mark" size={32} color="gold" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                  Rasmiy Brend & Jamoa Formasi
                </h3>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
                  Navy Blue Polo • Embroidered AD Monogram
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              AL DONNER restorani nafaqat eng mazali taomlar, balki yuqori darajadagi xizmat ko'rsatish madaniyatini taqdim etadi. 
              Barcha kuryerlarimiz va oshxona jamoamiz maxsus tikilgan <b>to'q ko'k (navy) polo</b>, qo'shaloq oq yoqa chiziqlari 
              hamda ko'kragidagi original <b>AD AL DONNER</b> kashtasi bilan xizmat ko'rsatadi.
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Rasmiy Servis</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Buyurtmangizni faqat brend formadagi kuryerlarimiz yetkazadi.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tozalik & Gigiyena</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Sanitariya qoidalariga to'liq javob beruvchi maxsus libos.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Premium Sifat</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Har bir detalda mukammallik va original AD dizayni.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenUniformModal}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Shirt className="w-4 h-4" />
                <span>Forma & Brend Tafsilotlari</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onScrollToMenu}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <span>Menyuni Ko'rish</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Uniform & Staff Photo Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl bg-black/50 group">
              <img
                src={uniformShowcaseImg}
                alt="AL DONNER Rasmiy Forma"
                className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Inset Badge */}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-2">
                <AlDonnerLogo variant="mark" size={18} color="gold" />
                <span className="text-[11px] font-black text-amber-300 font-['Outfit']">
                  ORIGINAL UNIFORM
                </span>
              </div>

              {/* Bottom Inset with Staff Member and Cat Mascot */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#0d1422]/95 backdrop-blur-md p-3 rounded-xl border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex -space-x-3 shrink-0">
                    <img
                      src={staffPoloImg}
                      alt="AL DONNER Xodimi"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-amber-400/80 shadow-md z-10"
                    />
                    <img
                      src={catDeliveryDonnerImg}
                      alt="Dastafkachi Skotish Fold qo'lida AL DONNER ushlab turibdi"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-blue-400/80 shadow-md z-20"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>Jamoamiz & Dastafkachi Mushuk</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">Qo'lida Doner 🌯</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 truncate">
                      Kuryer mushugimiz qo'lida qaynoq AL DONNER bilan yetkazadi! 🛵🐾
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
