export type CategoryId = 'all' | 'burger' | 'doner' | 'pizza' | 'snacks' | 'drinks' | 'combos';

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  basePrice: number;
  image: string;
  calories: number;
  prepTimeMinutes: number;
  spicyLevel?: 0 | 1 | 2 | 3;
  isPopular?: boolean;
  isNew?: boolean;
  isChefChoice?: boolean;
  isVegetarian?: boolean;
  sizes?: {
    name: string;
    label: string;
    priceMultiplier: number;
  }[];
  allowedAddons?: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedSize?: string;
  selectedAddons: {
    id: string;
    name: string;
    price: number;
  }[];
  customIngredients?: string[];
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 'received' | 'cooking' | 'delivering' | 'delivered';

export interface UserAddress {
  id: string;
  label: string; // e.g. "Uy", "Ishxona", "Ota-onam"
  fullAddress: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;
  isDefault?: boolean;
  gpsCoordinates?: { lat: number; lng: number };
  yandexNaviUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: UserAddress[];
  createdAt: string;
  loyaltyPoints: number;
  loyaltyTier: 'Standart' | 'Bronza' | 'Kumush' | 'Oltin VIP';
}

export interface OrderItem {
  cartItemId?: string;
  menuItemId?: string;
  name?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  size?: string;
  selectedSize?: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryType: 'delivery' | 'takeaway';
  paymentMethod: 'cash' | 'click' | 'payme' | 'card';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  estimatedDeliveryMinutes: number;
  promoCode?: string;
  notes?: string;
  telegramUrl?: string;
  telegramAdmin?: string;
  gpsCoordinates?: { lat: number; lng: number };
  yandexNaviUrl?: string;
  yandexMapsUrl?: string;
}

export interface PersonalizedAIRecommendation {
  id: string;
  type: 'pizza' | 'combo' | 'offer';
  title: string;
  badge: string;
  reason: string;
  itemIds: string[];
  comboName?: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  promoCode?: string;
  pairingAdvice?: string;
  tasteTags: string[];
}

export interface AIRecommendationRequest {
  query?: string;
  mood?: string;
  partySize?: number;
  budget?: number;
  dietaryPreference?: 'all' | 'spicy' | 'cheese' | 'meat' | 'light';
}

export interface AIRecommendationResponse {
  recommendationTitle: string;
  message: string;
  recommendedItemIds: string[];
  pairingAdvice: string;
  estimatedTotal: number;
  specialTip?: string;
}

export interface VoiceOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  selectedSize?: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  image?: string;
  category?: string;
}

export interface VoiceOrderAnalysisResult {
  success: boolean;
  rawTranscript: string;
  matchedItems: VoiceOrderItem[];
  unrecognizedText?: string;
  notes?: string;
  summaryNote?: string;
  estimatedTotal: number;
}

