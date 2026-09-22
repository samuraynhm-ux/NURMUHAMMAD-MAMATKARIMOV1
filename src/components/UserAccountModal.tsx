import React, { useState, useEffect } from 'react';
import { UserProfile, UserAddress, Order, CartItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { getTelegramOrderUrl, TELEGRAM_ADMIN_USERNAME } from '../utils/telegram';
import {
  X,
  User,
  MapPin,
  Clock,
  Sparkles,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Repeat,
  ShieldCheck,
  Award,
  ChevronRight,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  Building,
  Home,
  Check,
  Tag,
  Flame,
  ArrowRight,
  ShoppingBag,
  Send,
} from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onReorder: (order: Order) => void;
  onOpenOrderTracker: (order: Order) => void;
  onApplyPromoCode?: (code: string) => void;
  onAddToCartById?: (itemId: string) => void;
  initialTab?: 'profile' | 'orders' | 'recommendations';
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onReorder,
  onOpenOrderTracker,
  onApplyPromoCode,
  onAddToCartById,
  initialTab = 'profile',
}) => {
  if (!isOpen) return null;

  // Active view tab: 'profile' | 'orders' | 'recommendations'
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'recommendations'>(initialTab);

  // Auth form state (when not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('alisher@firecrust.uz');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+998 9');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // User orders state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // New address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Uy');
  const [newAddrFull, setNewAddrFull] = useState('');
  const [newAddrApartment, setNewAddrApartment] = useState('');
  const [newAddrFloor, setNewAddrFloor] = useState('');
  const [newAddrComment, setNewAddrComment] = useState('');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  // AI Personalized recommendations state inside modal
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recTasteProfile, setRecTasteProfile] = useState<any>(null);

  // Fetch orders when logged in
  const fetchUserOrders = async (userId: string) => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/user/orders?userId=${userId}`);
      const data = await res.json();
      if (data.orders) {
        setUserOrders(data.orders);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch AI personalized recommendations
  const fetchRecommendations = async (userId?: string) => {
    setIsLoadingRecs(true);
    try {
      const res = await fetch('/api/ai/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        setRecTasteProfile(data.customerProfile);
      }
    } catch (err) {
      console.error('Fetch recommendations error:', err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders(currentUser.id);
      fetchRecommendations(currentUser.id);
    }
  }, [currentUser]);

  // Quick Demo Login Handler
  const handleQuickDemoLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: 'alisher@firecrust.uz',
          password: 'password123',
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        setAuthError(data.error || 'Kirishda xatolik yuz berdi');
      }
    } catch {
      setAuthError('Server bilan ulanishda xatolik yuz berdi');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Form Submit Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: loginEmailOrPhone.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        setAuthError(data.error || 'Telefon raqam yoki parol noto\'g\'ri');
      }
    } catch {
      setAuthError('Server bilan aloqa uzildi. Iltimos qayta urining.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim()) {
      setAuthError('Iltimos, ismingizni kiriting');
      return;
    }
    if (regPhone.trim().length < 9 && !regEmail.trim()) {
      setAuthError('Telefon raqamingiz yoki emailingizni kiriting');
      return;
    }
    if (regPassword.length < 6) {
      setAuthError('Parol kamida 6 belgidan iborat bo\'lishi kerak');
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(),
          password: regPassword,
          address: regAddress.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        setAuthError(data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    } catch {
      setAuthError('Server bilan aloqa uzildi');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Add Address Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newAddrFull.trim()) return;

    setIsSubmittingAddress(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          address: {
            label: newAddrLabel,
            fullAddress: newAddrFull.trim(),
            apartment: newAddrApartment.trim(),
            floor: newAddrFloor.trim(),
            comment: newAddrComment.trim(),
            isDefault: newAddrIsDefault,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        onLogin({
          ...currentUser,
          addresses: data.addresses,
        });
        setIsAddingAddress(false);
        setNewAddrFull('');
        setNewAddrApartment('');
        setNewAddrFloor('');
        setNewAddrComment('');
      }
    } catch (err) {
      console.error('Error adding address:', err);
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/user/addresses/${addressId}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        onLogin({
          ...currentUser,
          addresses: data.addresses,
        });
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  // Set Default Address Handler
  const handleSetDefaultAddress = async (addressId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        onLogin({
          ...currentUser,
          addresses: data.addresses,
        });
      }
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  // Reorder click
  const handleReorderClick = (order: Order) => {
    onReorder(order);
    setReorderSuccessMsg(`Buyurtma taomlari (${order.items.length} ta) savatga qo'shildi!`);
    setTimeout(() => {
      setReorderSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#131724] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-[#0f121d] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold shadow-md shadow-orange-500/20">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-white">
                {currentUser ? currentUser.name : 'Mijoz Kabineti'}
              </h3>
              <p className="text-xs text-zinc-400">
                {currentUser
                  ? `${currentUser.phone} • ${currentUser.loyaltyTier} Mijoz`
                  : 'FireCrust shaxsiy kabinetiga xush kelibsiz'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!currentUser ? (
          /* NOT LOGGED IN: Auth Screen */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick Demo Login Pill Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  AQ
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>1-bosishda Demo Mijoz sifatida kiring</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                      Tavsiya
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Alisher Qodirov (Tarixda 3 ta buyurtma, 2 ta saqlangan manzil, shaxsiy AI tavsiyalar)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isAuthLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <span>Demo Kirish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auth Tabs */}
            <div className="flex bg-[#0f121d] p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-[#1e2333] text-amber-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Kirish (Login)
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  authMode === 'register'
                    ? 'bg-[#1e2333] text-amber-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ro'yxatdan o'tish
              </button>
            </div>

            {/* Error banner */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Telefon raqam yoki Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginEmailOrPhone}
                      onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                      placeholder="+998 90 123 45 67 yoki alisher@firecrust.uz"
                      className="w-full px-4 py-3 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                    <Phone className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Parol
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                    <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <span>{isAuthLoading ? 'Kirilmoqda...' : 'Hisobga Kirish'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    To'liq ismingiz
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Masalan: Sardor Rustamov"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Telefon raqamingiz
                    </label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+998 90 000 00 00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Email (ixtiyoriy)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="sardor@mail.uz"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Parol
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Kamida 6 belgi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Asosiy yetkazib berish manzilingiz (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Farg'ona sh., Al-Farg'oniy 15, 23-uy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f121d] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <span>{isAuthLoading ? 'Yaratilmoqda...' : 'Ro\'yxatdan O\'tish & 100 Ball Olish'}</span>
                  <Award className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* LOGGED IN: Dashboard View */
          <div>
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-[#0f121d] px-4 pt-2 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profil & Manzillar</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                  {currentUser.addresses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Buyurtmalar Tarixi</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {userOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'recommendations'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Siz uchun AI Tavsiyalar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            {/* Reorder Success Flash Notification */}
            {reorderSuccessMsg && (
              <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{reorderSuccessMsg}</span>
                </div>
                <span className="font-bold underline cursor-pointer" onClick={onClose}>
                  Savatni ochish
                </span>
              </div>
            )}

            <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-6">
              {/* TAB 1: PROFILE & SAVED ADDRESSES */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Loyalty Points & VIP status card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-red-600/5 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-xs uppercase tracking-wider text-amber-400 font-extrabold">
                          {currentUser.loyaltyTier} Gurman
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white font-['Outfit'] mt-1">
                        {currentUser.loyaltyPoints} FireBall Jamg'arma
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Har bir buyurtmangizdan 5% keshbek avtomatik to'planadi. 1 FireBall = 1 so'm.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onLogout}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 border border-white/10 text-xs font-semibold text-zinc-400 transition-all flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Chiqish</span>
                      </button>
                    </div>
                  </div>

                  {/* Profile info cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#0f121d] border border-white/5 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-zinc-500 block">Telefon:</span>
                        <span className="font-semibold text-white">{currentUser.phone}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0f121d] border border-white/5 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-zinc-500 block">Email:</span>
                        <span className="font-semibold text-white">{currentUser.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Saved Delivery Addresses Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <h4 className="text-sm font-bold text-white">
                          Saqlangan Yetkazib Berish Manzillari
                        </h4>
                      </div>

                      {!isAddingAddress && (
                        <button
                          onClick={() => setIsAddingAddress(true)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Yangi Manzil</span>
                        </button>
                      )}
                    </div>

                    {/* New Address Form */}
                    {isAddingAddress && (
                      <form
                        onSubmit={handleAddAddress}
                        className="p-4 rounded-2xl bg-[#0f121d] border border-amber-500/30 space-y-3 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-xs font-bold text-white">
                            Yangi Manzil Qo'shish
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="text-zinc-400 hover:text-white text-xs"
                          >
                            Bekor qilish
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {['Uy', 'Ishxona', 'Ota-onam'].map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setNewAddrLabel(lbl)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                                newAddrLabel === lbl
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-white/5 border-white/10 text-zinc-400'
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                            To'liq ko'cha va uy raqami *
                          </label>
                          <input
                            type="text"
                            value={newAddrFull}
                            onChange={(e) => setNewAddrFull(e.target.value)}
                            placeholder="Masalan: Qirguli mavzesi, Mustaqillik ko'chasi, 14-uy"
                            className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                              Xonadon / Ofis
                            </label>
                            <input
                              type="text"
                              value={newAddrApartment}
                              onChange={(e) => setNewAddrApartment(e.target.value)}
                              placeholder="24-xonadon"
                              className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                              Qavat / Podyezd
                            </label>
                            <input
                              type="text"
                              value={newAddrFloor}
                              onChange={(e) => setNewAddrFloor(e.target.value)}
                              placeholder="4-qavat, 2-podyezd"
                              className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                            Kuryer uchun eslatma (domofon kodi va h.k.)
                          </label>
                          <input
                            type="text"
                            value={newAddrComment}
                            onChange={(e) => setNewAddrComment(e.target.value)}
                            placeholder="Domofon kodi 24K, lift ishlaydi"
                            className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="addrDefaultCheck"
                            checked={newAddrIsDefault}
                            onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                            className="rounded bg-black/40 border-white/20 text-amber-500 focus:ring-0"
                          />
                          <label htmlFor="addrDefaultCheck" className="text-xs text-zinc-300 cursor-pointer">
                            Ushbu manzilni asosiy (birlamchi) qilish
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingAddress}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs shadow-md shadow-orange-500/20 hover:from-amber-400 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSubmittingAddress ? 'Saqlanmoqda...' : 'Manzilni Saqlash'}</span>
                        </button>
                      </form>
                    )}

                    {/* Address List */}
                    <div className="space-y-2.5">
                      {currentUser.addresses.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#0f121d] border border-white/5 text-center text-xs text-zinc-400">
                          Hozircha saqlangan manzillar yo'q. Yangi manzil qo'shing va buyurtmani 1-bosishda rasmiylashtiring!
                        </div>
                      ) : (
                        currentUser.addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-4 rounded-2xl bg-[#0f121d] border transition-all flex items-start justify-between gap-3 ${
                              addr.isDefault
                                ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/5 to-transparent'
                                : 'border-white/5 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  addr.label === 'Ishxona'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {addr.label === 'Ishxona' ? (
                                  <Building className="w-4 h-4" />
                                ) : (
                                  <Home className="w-4 h-4" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-white">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                      Asosiy Manzil
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-300">{addr.fullAddress}</p>
                                {(addr.apartment || addr.floor) && (
                                  <p className="text-[11px] text-zinc-400">
                                    {addr.apartment && `${addr.apartment}, `}
                                    {addr.floor && `${addr.floor}`}
                                  </p>
                                )}
                                {addr.comment && (
                                  <p className="text-[11px] text-amber-300/80 italic">
                                    "{addr.comment}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 hover:text-white transition-all"
                                  title="Asosiy manzil qilib belgilash"
                                >
                                  Asosiy qilish
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Manzilni o'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDER HISTORY & 1-CLICK REORDER */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Sizning Buyurtmalar Tarixingiz
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Istalgan avvalgi buyurtmani 1-bosishda qayta buyurtma bering
                      </p>
                    </div>

                    <button
                      onClick={() => fetchUserOrders(currentUser.id)}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Repeat className="w-3 h-3" />
                      <span>Yangilash</span>
                    </button>
                  </div>

                  {isLoadingOrders ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      Buyurtmalar tarixi yuklanmoqda...
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#0f121d] border border-white/5 text-center space-y-3">
                      <ShoppingBag className="w-8 h-8 text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-400">
                        Siz hali buyurtma bermagansiz. Menyumizdagi lazzatli taomlarni tatib ko'ring!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {userOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 sm:p-5 rounded-2xl bg-[#0f121d] border border-white/5 hover:border-white/10 transition-all space-y-3"
                        >
                          {/* Top row */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white font-['Outfit']">
                                #{ord.id}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {new Date(ord.createdAt).toLocaleDateString('uz-UZ', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {/* Status badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : ord.status === 'delivering'
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse'
                                  : ord.status === 'cooking'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                              }`}
                            >
                              {ord.status === 'delivered' && 'Yetkazildi'}
                              {ord.status === 'delivering' && "Kuryer yo'lda"}
                              {ord.status === 'cooking' && 'Pishirilmoqda'}
                              {ord.status === 'received' && 'Qabul qilindi'}
                            </span>
                          </div>

                          {/* Address & delivery type */}
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="truncate">{ord.address}</span>
                          </div>

                          {/* Items list preview */}
                          <div className="bg-[#141824] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-zinc-300">
                                <span>
                                  <span className="font-bold text-amber-400">{item.quantity}x</span>{' '}
                                  {item.name || item.menuItem?.name}
                                  {item.size && (
                                    <span className="text-zinc-500 text-[11px]"> ({item.size})</span>
                                  )}
                                </span>
                                <span className="font-medium text-white">
                                  {formatPrice((item.price || item.unitPrice || 0) * item.quantity)}
                                </span>
                              </div>
                            ))}

                            <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-white text-xs">
                              <span>Jami to'langan:</span>
                              <span className="text-amber-400 font-['Outfit']">
                                {formatPrice(ord.total)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons: 1-Click Reorder & Tracker & Telegram */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onOpenOrderTracker(ord);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Holati</span>
                              </button>

                              <a
                                href={
                                  ord.telegramUrl ||
                                  getTelegramOrderUrl(ord, TELEGRAM_ADMIN_USERNAME)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                                title="Telegram orqali @qahhorvch ga yuborish"
                              >
                                <Send className="w-3.5 h-3.5 fill-[#229ED9]" />
                                <span>Telegram</span>
                              </a>
                            </div>

                            <button
                              onClick={() => handleReorderClick(ord)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <Repeat className="w-3.5 h-3.5" />
                              <span>Qayta Buyurtma</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PERSONALIZED AI RECOMMENDATIONS */}
              {activeTab === 'recommendations' && (
                <div className="space-y-5">
                  {/* Taste Profile banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/30 to-black border border-purple-500/30 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                          AI Ta'm Profilingiz
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Faol Tahlil
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {recTasteProfile?.favoriteFlavor ||
                          "Artisanal Döner & Italiyan Pech Pizzasi Shinavandasi"}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Sizning avvalgi {userOrders.length} ta xaridlaringiz va restoranimizning eng xaridorgir taomlari asosida tuzilgan maxsus tavsiyalar:
                      </p>
                    </div>
                  </div>

                  {isLoadingRecs ? (
                    <div className="py-10 text-center text-xs text-zinc-400">
                      Sun'iy intellekt xaridlaringizni tahlil qilmoqda...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-4 sm:p-5 rounded-2xl bg-[#0f121d] border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                                  {rec.badge}
                                </span>
                                {rec.discountPercent > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black">
                                    -{rec.discountPercent}% Chegirma
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-white font-['Outfit'] mt-1.5">
                                {rec.title}
                              </h4>
                              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                                {rec.reason}
                              </p>
                              {rec.pairingAdvice && (
                                <p className="text-[11px] text-amber-400/90 mt-1 italic">
                                  💡 Oshpaz maslahati: {rec.pairingAdvice}
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs text-zinc-500 line-through block">
                                {formatPrice(rec.originalPrice)}
                              </span>
                              <span className="text-base font-extrabold text-amber-400 font-['Outfit'] block">
                                {formatPrice(rec.discountedPrice)}
                              </span>
                            </div>
                          </div>

                          {/* Taste tags */}
                          {rec.tasteTags && (
                            <div className="flex flex-wrap gap-1.5">
                              {rec.tasteTags.map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-zinc-400 font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                            {rec.promoCode ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400">Promokod:</span>
                                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                                  {rec.promoCode}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400">
                                Shaxsiy chegirma bilan
                              </span>
                            )}

                            <button
                              onClick={() => {
                                if (rec.promoCode && onApplyPromoCode) {
                                  onApplyPromoCode(rec.promoCode);
                                }
                                if (rec.itemIds && rec.itemIds[0] && onAddToCartById) {
                                  onAddToCartById(rec.itemIds[0]);
                                }
                                setReorderSuccessMsg(`"${rec.title}" savatga qo'shildi!`);
                                setTimeout(() => setReorderSuccessMsg(null), 3000);
                              }}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 active:scale-95"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Savatga Qo'shish</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
