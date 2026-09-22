import React, { useState } from 'react';
import {
  TELEGRAM_ADMIN_USERNAME,
  TELEGRAM_BOT_USERNAME,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_FORMATTED,
  RESTAURANT_NAME,
  isTelegramWebApp,
  getTelegramUser,
  copyToClipboard,
  openTelegramLink,
} from '../utils/telegram';
import {
  X,
  Send,
  Bot,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Info,
  QrCode,
  Globe,
  Settings,
} from 'lucide-react';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'setup'>('app');

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inTg = isTelegramWebApp();
  const tgUser = getTelegramUser();

  const handleCopyAppUrl = async () => {
    const ok = await copyToClipboard(appUrl);
    if (ok) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const openAdminChat = () => {
    openTelegramLink(`https://t.me/${TELEGRAM_ADMIN_USERNAME}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#111520] border border-[#229ED9]/40 rounded-3xl overflow-hidden shadow-2xl my-6 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#17263d] via-[#101b2c] to-[#0c1422] border-b border-[#229ED9]/20 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#229ED9] flex items-center justify-center text-white shadow-lg shadow-[#229ED9]/30">
              <Send className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-['Outfit'] text-white">
                  Telegram Bot & WebApp
                </h3>
                {inTg ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    Botda Ishlamoqda
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#229ED9]/20 text-[#229ED9] text-[10px] font-bold border border-[#229ED9]/30">
                    Mini App Tayyor
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {RESTAURANT_NAME} sayti to'liq Telegram ichida WebApp (Mini App) bo'lib ishlaydi
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/5 px-6 pt-3 gap-4 bg-[#0d1017]">
          <button
            onClick={() => setActiveTab('app')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'app'
                ? 'text-[#229ED9] border-b-2 border-[#229ED9]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📱 Bot & WebApp Foydalanish
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'setup'
                ? 'text-[#229ED9] border-b-2 border-[#229ED9]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ⚙️ Botga Ulash Qo'llanmasi
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'app' ? (
            <>
              {/* Status banner */}
              {inTg && tgUser ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">
                      Telegram WebApp faollashtirilgan!
                    </h4>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Foydalanuvchi: <b>{tgUser.first_name} {tgUser.last_name || ''}</b> {tgUser.username ? `(@${tgUser.username})` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#141b29] border border-[#229ED9]/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Saytni Telegram ilovasidan chiqmasdan ishlatish
                      </h4>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        Sayt 100% <b>Telegram WebApp (Mini App)</b> formatiga moslashtirilgan. Savatcha, buyurtma, menyu va to'lovlar to'g'ridan-to'g'ri Telegram ichida to'liq ishlaydi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Tezkor Havolalar:
                </h4>

                {/* Admin Telegram Button */}
                <button
                  onClick={openAdminChat}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#1c8ec4] hover:opacity-95 text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-[#229ED9]/20 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 fill-white" />
                    <span>Admin Telegrami: @{TELEGRAM_ADMIN_USERNAME}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </button>

                {/* Copy WebApp URL */}
                <div className="p-3.5 rounded-2xl bg-[#0c1017] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      WebApp (Mini App) URL manzili:
                    </span>
                    <button
                      onClick={handleCopyAppUrl}
                      className="text-[#229ED9] hover:underline font-semibold flex items-center gap-1"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Nusxa olish</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 text-xs font-mono text-amber-300 break-all select-all">
                    {appUrl}
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-1 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Telegram Haptic (titrash) tebranish effektlari ulandi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Telegram foydalanuvchi profilini avtomatik tanish</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Har bir buyurtma matni formatlangan holda @{TELEGRAM_ADMIN_USERNAME} ga yo'naltiriladi</span>
                </div>
              </div>
            </>
          ) : (
            /* Setup Guide */
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-relaxed">
                  Agar o'zingizning shaxsiy Telegram botingiz (masalan, <code>@al_doner_bot</code>) bo'lsa, uni ushbu sayt bilan 2 daqiqada Mini App qilib ulashingiz mumkin:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/5 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Telegramda @BotFather ga kiring</span>
                  </div>
                  <p className="text-zinc-400 pl-6 leading-relaxed">
                    Telegramda rasmiy <b>@BotFather</b> ga o'ting va <code>/mybots</code> buyrug'ini yuboring yoki yangi bot yarating (<code>/newbot</code>).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/5 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Bot Menyusiga Web App tugmasi qo'yish</span>
                  </div>
                  <p className="text-zinc-400 pl-6 leading-relaxed">
                    <b>Bot Settings &gt; Menu Button &gt; Configure menu button</b> ga kiring. Tugma nomiga <b>"🍕 Menyu & Buyurtma"</b> deb yozing va URL ga ushbu sayt manzilini qo'ying:
                  </p>
                  <div className="ml-6 p-2 rounded-lg bg-black/40 text-amber-300 font-mono text-[11px] break-all">
                    {appUrl}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/5 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Tayyor! Botni ochganda to'g'ridan-to'g'ri sayt ochiladi</span>
                  </div>
                  <p className="text-zinc-400 pl-6 leading-relaxed">
                    Mijozlar botingizga kirib <b>"Menyu & Buyurtma"</b> tugmasini bosishi bilanoq saytingiz Telegram ichida tezkor ochiladi va buyurtmalar adminga yetib boradi!
                  </p>
                </div>
              </div>

              {/* Botfather shortcut button */}
              <button
                onClick={() => openTelegramLink('https://t.me/BotFather')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Bot className="w-4 h-4 text-[#229ED9]" />
                <span>@BotFather ga o'tish</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0d14] border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400">
            Admin: <b className="text-white">@{TELEGRAM_ADMIN_USERNAME}</b> | Tel: <b className="text-white">{RESTAURANT_PHONE_FORMATTED}</b>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
