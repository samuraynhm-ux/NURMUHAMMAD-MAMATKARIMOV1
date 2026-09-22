import React, { useState, useEffect } from 'react';
import { CartItem, Order, UserProfile, UserAddress } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  getTelegramOrderUrl,
  formatOrderForTelegramPlain,
  copyToClipboard,
  openTelegramLink,
  sendTelegramData,
  isTelegramWebApp,
  TELEGRAM_ADMIN_USERNAME,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_FORMATTED,
  RESTAURANT_NAME,
} from '../utils/telegram';
import {
  X,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  ShieldCheck,
  Loader2,
  Home,
  Building,
  Award,
  Plus,
  Send,
  Copy,
  Check,
  ExternalLink,
  PhoneCall,
  Clock,
  Car,
  Navigation,
  Shirt,
} from 'lucide-react';
import { YandexGpsPicker, GpsLocation } from './YandexGpsPicker';
import { AlDonnerLogo } from './AlDonnerLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryType: 'delivery' | 'takeaway';
  appliedPromo?: { code: string; discountAmount: number };
  currentUser?: UserProfile | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryType,
  appliedPromo,
  currentUser,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+998 ');
  const [address, setAddress] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('Uy');
  const [branch, setBranch] = useState("AL DONER Markaziy filiali, Al-Farg'oniy shoh ko'chasi 45");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'click' | 'payme' | 'card'>('cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Set default address if user has saved addresses
  useEffect(() => {
    if (currentUser && currentUser.addresses && currentUser.addresses.length > 0) {
      const defaultAddr = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      const full = defaultAddr.apartment
        ? `${defaultAddr.fullAddress}, ${defaultAddr.apartment}`
        : defaultAddr.fullAddress;
      setAddress(full);
      if (defaultAddr.gpsCoordinates) {
        setGpsCoords(defaultAddr.gpsCoordinates);
      }
    }
  }, [currentUser]);

  // Handle choosing a saved address
  const handleSelectSavedAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    const full = addr.apartment ? `${addr.fullAddress}, ${addr.apartment}` : addr.fullAddress;
    setAddress(full);
    if (addr.gpsCoordinates) {
      setGpsCoords(addr.gpsCoordinates);
    }
  };

  const handleSelectCustomAddress = () => {
    setSelectedAddressId('custom');
    setAddress('');
  };

  // Subtotal & Fee calculations
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee = deliveryType === 'delivery' ? (subtotal >= 120000 || subtotal === 0 ? 0 : 15000) : 0;
  const takeawayDiscount = deliveryType === 'takeaway' ? Math.round(subtotal * 0.1) : 0;
  const promoDiscount = appliedPromo?.discountAmount || 0;
  const totalDiscount = takeawayDiscount + promoDiscount;
  const grandTotal = Math.max(0, subtotal + deliveryFee - totalDiscount);
  const earnedPoints = Math.round(grandTotal * 0.05);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Iltimos, ismingizni kiriting');
      return;
    }

    if (phone.trim().length < 13) {
      setError('Iltimos, to\'liq telefon raqamingizni kiriting (+998...)');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      setError('Iltimos, yetkazib berish manzilini kiriting');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user is logged in and chose to save a custom address
      if (currentUser && saveNewAddress && selectedAddressId === 'custom' && address.trim()) {
        try {
          await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              address: {
                label: newAddressLabel,
                fullAddress: address.trim(),
                isDefault: false,
              },
            }),
          });
        } catch (addrErr) {
          console.warn('Address saving in checkout failed:', addrErr);
        }
      }

      const yandexNaviUrl = gpsCoords
        ? `https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~${gpsCoords.lat}%2C${gpsCoords.lng}&rtt=auto&ruri=~&z=16`
        : 'https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~40.376488%2C71.808105&rtt=auto&ruri=~&z=16';
      const yandexMapsUrl = gpsCoords
        ? `https://yandex.uz/maps/10336/fergana/?ll=${gpsCoords.lng}%2C${gpsCoords.lat}&z=16&pt=${gpsCoords.lng},${gpsCoords.lat},pm2rdm`
        : 'https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~40.376488%2C71.808105&rtt=auto&ruri=~&z=16';

      const orderPayload = {
        userId: currentUser?.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: deliveryType === 'delivery' ? address.trim() : branch,
        deliveryType,
        paymentMethod,
        items: items.map((it) => ({
          name: it.menuItem.name,
          quantity: it.quantity,
          price: it.unitPrice,
          size: it.selectedSize,
          menuItemId: it.menuItem.id,
        })),
        subtotal,
        discount: totalDiscount,
        deliveryFee,
        total: grandTotal,
        promoCode: appliedPromo?.code,
        notes: notes.trim(),
        gpsCoordinates: gpsCoords || undefined,
        yandexNaviUrl,
        yandexMapsUrl,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      const createdOrder: Order = {
        id: data.order?.id || `FC-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: currentUser?.id,
        createdAt: new Date().toISOString(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: deliveryType === 'delivery' ? address.trim() : branch,
        deliveryType,
        paymentMethod,
        items,
        subtotal,
        discount: totalDiscount,
        deliveryFee,
        total: grandTotal,
        status: 'received',
        estimatedDeliveryMinutes: deliveryType === 'takeaway' ? 15 : 30,
        promoCode: appliedPromo?.code,
        notes: notes.trim(),
        telegramUrl: data.telegram?.directUrl,
        telegramAdmin: `@${TELEGRAM_ADMIN_USERNAME}`,
        gpsCoordinates: data.order?.gpsCoordinates || (gpsCoords || undefined),
        yandexNaviUrl: data.order?.yandexNaviUrl || yandexNaviUrl,
        yandexMapsUrl: data.order?.yandexMapsUrl || yandexMapsUrl,
      };

      setSubmittedOrder(createdOrder);
    } catch (err) {
      console.error('Order submit error:', err);
      setError('Buyurtmani rasmiylashtirishda xatolik yuz berdi. Iltimos qayta urining.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is submitted, display the Telegram dispatch confirmation screen
  if (submittedOrder) {
    const tgUrl =
      submittedOrder.telegramUrl ||
      getTelegramOrderUrl(submittedOrder, TELEGRAM_ADMIN_USERNAME);
    const plainText = formatOrderForTelegramPlain(submittedOrder);

    const handleCopy = async () => {
      const ok = await copyToClipboard(plainText);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div
          className="relative w-full max-w-lg bg-[#131724] border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl my-6 text-white animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-b from-[#0e1728] via-[#0f1422] to-[#0a0d16] border-b border-white/10 text-center relative">
            <button
              onClick={() => {
                onOrderSuccess(submittedOrder);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official AL DONNER Monogram and Checkmark */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-black/60 border border-amber-500/40 p-1 flex items-center justify-center shadow-lg">
                <AlDonnerLogo variant="mark" size={32} color="gold" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            <div className="text-xs font-bold tracking-widest text-amber-400 uppercase font-['Outfit'] mb-0.5">
              AL DONNER RESTORANI
            </div>
            <h3 className="text-2xl font-black font-['Outfit'] text-white">
              Buyurtmangiz Qabul Qilindi!
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Buyurtma ID: #{submittedOrder.id}
            </p>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Courier Uniform Service Guarantee */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Shirt className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-white">
                  Rasmiy AL DONNER jamoa formasi
                </div>
                <div className="text-zinc-400 text-[11px]">
                  Kuryerimiz to'q ko'k (navy polo) formali va maxsus termobokslarda yetkazib keladi.
                </div>
              </div>
            </div>
            {/* Telegram highlight card */}
            <div className="p-4 rounded-2xl bg-[#172032] border border-[#229ED9]/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#229ED9] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Send className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Admin Telegrami:</span>
                    <span className="text-[#229ED9]">@{TELEGRAM_ADMIN_USERNAME}</span>
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    Buyurtmani darhol tayyorlashni boshlashimiz uchun, buyurtma tafsilotlarini Telegram orqali adminga yuboring:
                  </p>
                </div>
              </div>

              {/* Primary Telegram Action Button */}
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (isTelegramWebApp()) {
                    sendTelegramData(submittedOrder);
                    openTelegramLink(tgUrl);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/30 transition-all active:scale-95"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>Telegram orqali @{TELEGRAM_ADMIN_USERNAME} ga yuborish</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* Copy plain text button */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">
                      Buyurtma matni nusxalandi!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Buyurtma matnidan nusxa olish</span>
                  </>
                )}
              </button>
            </div>

            {/* Yandex Navigator Route Card for courier & customer */}
            {submittedOrder.gpsCoordinates && (
              <div className="p-4 rounded-2xl bg-[#171c26] border border-red-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-['Syne']">
                        Yandex Navigator Marshruti
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-bold font-['Space_Grotesk']">
                        Botga tushdi
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      GPS: {submittedOrder.gpsCoordinates.lat.toFixed(5)}, {submittedOrder.gpsCoordinates.lng.toFixed(5)}
                    </p>
                  </div>
                </div>

                <a
                  href={
                    submittedOrder.yandexNaviUrl ||
                    `https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~${submittedOrder.gpsCoordinates.lat}%2C${submittedOrder.gpsCoordinates.lng}&rtt=auto&ruri=~&z=16`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 font-['Syne'] active:scale-95 transition-all shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Xaritada ochish</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            )}

            {/* Restaurant Direct Hotline */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Restoran Telefoni:</div>
                  <a
                    href={`tel:${RESTAURANT_PHONE}`}
                    className="text-sm font-bold text-amber-300 hover:underline font-['Outfit']"
                  >
                    {RESTAURANT_PHONE_FORMATTED}
                  </a>
                </div>
              </div>

              <a
                href={`tel:${RESTAURANT_PHONE}`}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
              >
                Qo'ng'iroq
              </a>
            </div>

            {/* Order Brief Summary */}
            <div className="p-4 rounded-xl bg-[#0f121d] border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400 border-b border-white/5 pb-2">
                <span>Yetkazish turi:</span>
                <span className="font-semibold text-white">
                  {submittedOrder.deliveryType === 'delivery'
                    ? 'Yetkazib berish (30 daq)'
                    : 'Restorandan olib ketish'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 border-b border-white/5 pb-2">
                <span>Manzil:</span>
                <span className="font-semibold text-white max-w-[240px] truncate text-right">
                  {submittedOrder.address}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 border-b border-white/5 pb-2">
                <span>Taomlar soni:</span>
                <span className="font-semibold text-white">
                  {submittedOrder.items.reduce((s, it) => s + it.quantity, 0)} ta taom
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 text-white">
                <span>Jami To'lov:</span>
                <span className="text-amber-400 font-extrabold text-base font-['Outfit']">
                  {formatPrice(submittedOrder.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer proceed to tracker */}
          <div className="p-4 bg-[#0f121d] border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onOrderSuccess(submittedOrder);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>Buyurtma Holatini Kuzatish</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#131724] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#0f121d] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-black font-bold">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-white">
                Buyurtmani Rasmiylashtirish
              </h3>
              <p className="text-xs text-zinc-400">
                {deliveryType === 'delivery'
                  ? '30 daqiqada issiq yetkazib beramiz'
                  : 'Restorandan olib ketish (-10% chegirma)'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Ismingiz
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masalan: Sardor"
                className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Telefon raqamingiz
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Delivery or Branch Details */}
          {deliveryType === 'delivery' ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Yetkazib berish manzili
                </span>
                {currentUser && currentUser.addresses.length > 0 && (
                  <span className="text-[11px] text-amber-400 font-normal">
                    Saqlangan manzillar ({currentUser.addresses.length})
                  </span>
                )}
              </label>

              {/* Saved Address Pills if Logged In */}
              {currentUser && currentUser.addresses.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {currentUser.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        selectedAddressId === addr.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                          : 'bg-[#181d2c] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {addr.label === 'Ishxona' ? (
                        <Building className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Home className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] text-amber-400/80">(Asosiy)</span>
                      )}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleSelectCustomAddress}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                      selectedAddressId === 'custom'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-[#181d2c] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Boshqa manzil</span>
                  </button>
                </div>
              )}

              <input
                type="text"
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setSelectedAddressId('custom');
                }}
                placeholder="Farg'ona sh., Al-Farg'oniy ko'chasi, 24-uy, 15-xonadon..."
                className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />

              {/* Yandex Navigator GPS Picker */}
              <div className="pt-2">
                <YandexGpsPicker
                  currentAddress={address}
                  initialCoords={gpsCoords || undefined}
                  onLocationSelected={(loc: GpsLocation) => {
                    if (loc.addressText) {
                      setAddress(loc.addressText);
                    }
                    setGpsCoords({ lat: loc.lat, lng: loc.lng });
                    setSelectedAddressId('custom');
                  }}
                />
              </div>

              {/* Option to save new address to profile if logged in and using custom address */}
              {currentUser && selectedAddressId === 'custom' && address.trim().length > 5 && (
                <div className="flex items-center justify-between pt-1 text-xs text-zinc-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-amber-500 focus:ring-0"
                    />
                    <span>Ushbu manzilni profilimda saqlab qolish</span>
                  </label>

                  {saveNewAddress && (
                    <div className="flex items-center gap-1.5">
                      {['Uy', 'Ishxona', 'Boshqa'].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setNewAddressLabel(l)}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            newAddressLabel === l
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                              : 'bg-white/5 text-zinc-400'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Qaysi filialdan olib ketasiz?
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
              >
                <option value="AL DONER Markaziy filiali, Al-Farg'oniy shoh ko'chasi 45">
                  Farg'ona Markaziy filiali (Al-Farg'oniy shoh ko'chasi 45, Sayilgoh)
                </option>
                <option value="Qirguli filiali, Mustaqillik ko'chasi 12">
                  Qirguli filiali (Mustaqillik ko'chasi 12)
                </option>
                <option value="FDU filiali, B. Marg'inoniy ko'chasi 18">
                  FDU filiali (B. Marg'inoniy ko'chasi 18)
                </option>
              </select>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              To'lov usulini tanlang:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-[#181d2c] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold">Naqd pul</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('click')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'click'
                    ? 'bg-blue-500/15 border-blue-500 text-white'
                    : 'bg-[#181d2c] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-black text-blue-400">CLICK</span>
                <span className="text-xs font-semibold">Click ilova</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('payme')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'payme'
                    ? 'bg-cyan-500/15 border-cyan-500 text-white'
                    : 'bg-[#181d2c] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-black text-cyan-400">PAYME</span>
                <span className="text-xs font-semibold">Payme ilova</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-[#181d2c] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold">Terminal</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Kuryer yoki oshpaz uchun izoh (ixtiyoriy):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Domofon kodi 38, eshik oldida qoldiring..."
              className="w-full bg-[#181d2c] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Order Summary box */}
          <div className="p-4 rounded-2xl bg-[#0f121d] border border-white/5 space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Taomlar soni:</span>
              <span className="text-white font-medium">{items.length} xil</span>
            </div>
            <div className="flex justify-between">
              <span>Yetkazib berish:</span>
              <span className="text-white font-medium">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-400">Bepul</span>
                ) : (
                  formatPrice(deliveryFee)
                )}
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Jami chegirma:</span>
                <span>-{formatPrice(totalDiscount)}</span>
              </div>
            )}
            {currentUser && earnedPoints > 0 && (
              <div className="flex justify-between text-amber-400 font-medium">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Keshbek ballari:</span>
                </span>
                <span>+{earnedPoints} FireBall (5%)</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>Jami:</span>
              <span className="text-amber-400 font-extrabold text-base font-['Outfit']">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Buyurtma yuborilmoqda...</span>
              </>
            ) : (
              <span>Buyurtmani Tasdiqlash ({formatPrice(grandTotal)})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
