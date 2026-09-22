import React, { useState } from 'react';
import { Sparkles, Send, X, Plus, Utensils, Check, Wine, AlertCircle, ChefHat } from 'lucide-react';
import { AIRecommendationResponse, MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { formatPrice } from '../utils/formatters';

interface AIConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export const AIConsultantModal: React.FC<AIConsultantModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [dietary, setDietary] = useState<'all' | 'spicy' | 'cheese' | 'meat' | 'light'>('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const quickPrompts = [
    { title: '2 kishi uchun romantik kechki ovqat', query: '2 kishi uchun romantik va mazali kechki ovqat tanlab bering' },
    { title: '60 000 so\'mga to\'yimli tushlik', query: '60 000 so\'m byudjetga to\'yimli va tezkor tushlik' },
    { title: 'Haqiqiy o\'tkir va olovli doner', query: 'Haqiqiy achchiq va shirali taom xohlayman' },
    { title: 'Katta do\'stlar davrasi (3-4 kishi)', query: '3-4 kishi futbol ko\'ryapmiz, to\'yimli kombo kerak' },
    { title: 'Ko\'p erigan pishloqli taomlar', query: 'Juda ko\'p pishloqli va cho\'ziluvchan pizza yoki doner' },
  ];

  const handleConsult = async (customQuery?: string) => {
    const activeQuery = customQuery !== undefined ? customQuery : query;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          partySize,
          budget,
          dietaryPreference: dietary,
        }),
      });

      if (!response.ok) {
        throw new Error('Server javob bermadi');
      }

      const data: AIRecommendationResponse = await response.json();
      setResult(data);
    } catch (err) {
      console.error('AI consult error:', err);
      setErrorMsg('AI maslahatchi xizmati bilan bog\'lanishda xatolik yuz berdi. Iltimos qayta urining.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: MenuItem) => {
    onAddToCart(item);
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  // Resolve recommended item objects from IDs
  const recommendedItems = result?.recommendedItemIds
    ? MENU_ITEMS.filter((item) => result.recommendedItemIds.includes(item.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#131725] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950/80 via-[#181c2c] to-amber-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-md">
              <Sparkles className="w-5 h-5 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-['Outfit'] text-white">
                  AI Taom Maslahatchi & Sommelier
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Oshpaz Farhod sizning didingiz, byudjetingiz va kayfiyatingizga mos taom tanlaydi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Quick Prompts */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
              Tezkor So'rovlar:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p.query);
                    handleConsult(p.query);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 text-xs text-zinc-300 hover:text-white transition-all text-left"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#171c2b] rounded-2xl border border-white/5 text-xs">
            {/* Party Size */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Necha kishi?</label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full bg-[#11141e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
              >
                <option value={1}>1 kishi (Yakkaxon)</option>
                <option value={2}>2 kishi (Juftlik)</option>
                <option value={3}>3-4 kishi (Do'stlar)</option>
                <option value={6}>5+ kishi (Katta davra)</option>
              </select>
            </div>

            {/* Preference */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Afzallik:</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as any)}
                className="w-full bg-[#11141e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
              >
                <option value="all">Barchasi (Klassik)</option>
                <option value="spicy">🌶️ O'tkir va achchiq</option>
                <option value="cheese">🧀 Pishloqli / Cheesy</option>
                <option value="meat">🥩 Go'shtli va to'yimli</option>
                <option value="light">🌱 Yengil taomlar</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Byudjet (so'm):</label>
              <select
                value={budget || ''}
                onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-[#11141e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
              >
                <option value="">Cheklanmagan</option>
                <option value={50000}>50 000 so'mgacha</option>
                <option value={80000}>80 000 so'mgacha</option>
                <option value={120000}>120 000 so'mgacha</option>
                <option value={200000}>200 000 so'mgacha</option>
              </select>
            </div>
          </div>

          {/* User Custom Query Input */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                placeholder="O'zingiz xohlagan ta'm yoki savolni yozing (masalan: Iskender doner bilan qaysi ichimlik ketadi?)..."
                className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner"
              />
              <button
                onClick={() => handleConsult()}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-10 text-center space-y-3 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <ChefHat className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Oshpaz Farhod retseptlar va menyuni tahlil qilmoqda...
              </h4>
              <p className="text-xs text-zinc-400">
                Siz uchun eng mukammal ta'm va ichimlik kombinatsiyasi tanlanmoqda.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Box */}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Oshpaz Tavsiyasi</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                  {result.recommendationTitle}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {result.message}
                </p>
              </div>

              {/* Recommended Items Cards */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Tavsiya etilgan taomlar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#181d2c] border border-white/10 hover:border-amber-500/40 flex items-center gap-3 transition-all"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-white truncate font-['Outfit']">
                          {item.name}
                        </h5>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="text-xs font-bold text-amber-400 mt-1">
                          {formatPrice(item.basePrice)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddItem(item)}
                        className={`p-2 rounded-xl shrink-0 font-bold transition-all ${
                          addedItems[item.id]
                            ? 'bg-emerald-500 text-black'
                            : 'bg-amber-500 hover:bg-amber-400 text-black'
                        }`}
                        title="Savatga qo'shish"
                      >
                        {addedItems[item.id] ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sommelier & Secret Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {result.pairingAdvice && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                      <Wine className="w-3.5 h-3.5" />
                      <span>Ichimlik & Sous Maslahati:</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      {result.pairingAdvice}
                    </p>
                  </div>
                )}

                {result.specialTip && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Oshpaz Sirlari:</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      {result.specialTip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0f121b] border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Oshpazimiz yangi issiq taomlarni 30 daqiqada yetkazadi</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
