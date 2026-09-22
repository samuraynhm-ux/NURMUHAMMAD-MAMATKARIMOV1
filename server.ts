import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory user and orders storage
interface ServerUserAddress {
  id: string;
  label: string;
  fullAddress: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;
  isDefault?: boolean;
}

interface ServerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  addresses: ServerUserAddress[];
  createdAt: string;
  loyaltyPoints: number;
  loyaltyTier: 'Standart' | 'Bronza' | 'Kumush' | 'Oltin VIP';
}

interface ServerOrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  menuItemId?: string;
  addons?: Array<{ id: string; name: string; price: number }>;
}

interface ServerOrder {
  id: string;
  userId?: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryType: 'delivery' | 'takeaway';
  paymentMethod: string;
  items: ServerOrderItem[];
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  total: number;
  status: 'received' | 'cooking' | 'delivering' | 'delivered';
  estimatedDeliveryMinutes: number;
  promoCode?: string;
  notes?: string;
  gpsCoordinates?: { lat: number; lng: number };
  yandexNaviUrl?: string;
  yandexMapsUrl?: string;
}

// Pre-seeded demo user
const usersStore: ServerUser[] = [
  {
    id: 'user-alisher',
    name: 'Alisher Qodirov',
    email: 'alisher@firecrust.uz',
    phone: '+998 90 123 45 67',
    password: 'password123',
    addresses: [
      {
        id: 'addr-1',
        label: 'Uy',
        fullAddress: 'Chilonzor 9-mavze, 14-uy',
        apartment: '24',
        entrance: '2',
        floor: '4',
        comment: 'Domofon 24K, lift ishlaydi',
        isDefault: true,
      },
      {
        id: 'addr-2',
        label: 'Ishxona (IT Park)',
        fullAddress: 'Yakkasaroy tumani, Shota Rustaveli 21-bino',
        apartment: '3-qavat, 302-ofis',
        comment: 'Qabulxonaga qoldirish mumkin',
        isDefault: false,
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    loyaltyPoints: 540,
    loyaltyTier: 'Kumush',
  },
];

// Pre-seeded rich orders history
const ordersStore: ServerOrder[] = [
  {
    id: 'FC-1082',
    userId: 'user-alisher',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    customerName: 'Alisher Qodirov',
    phone: '+998 90 123 45 67',
    address: 'Chilonzor 9-mavze, 14-uy',
    deliveryType: 'delivery',
    paymentMethod: 'click',
    items: [
      {
        name: 'FireCrust Signature Doner Pizza',
        quantity: 1,
        price: 85000,
        size: "O'rta (30 sm)",
        menuItemId: 'pizza-firecrust-special',
      },
      {
        name: "Muzdek Ko'pikli Turk Ayrani (0.4L)",
        quantity: 2,
        price: 9000,
        menuItemId: 'drink-ayran-fresh',
      },
    ],
    subtotal: 103000,
    discount: 0,
    deliveryFee: 0,
    total: 103000,
    status: 'cooking',
    estimatedDeliveryMinutes: 18,
    notes: 'Iltimos, pizzasini issiq holda yetkazing',
  },
  {
    id: 'FC-1045',
    userId: 'user-alisher',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    customerName: 'Alisher Qodirov',
    phone: '+998 90 123 45 67',
    address: 'Chilonzor 9-mavze, 14-uy',
    deliveryType: 'delivery',
    paymentMethod: 'payme',
    items: [
      {
        name: 'Afsonaviy Iskender Döner (Porsiya)',
        quantity: 1,
        price: 58000,
        menuItemId: 'doner-iskender-plate',
      },
      {
        name: "Klassik Mol Go'shtli Lavash",
        quantity: 1,
        price: 38000,
        size: 'Standart (300g)',
        menuItemId: 'doner-beef-classic',
      },
      {
        name: 'Motsarella Pishloqli Sharchalar',
        quantity: 1,
        price: 26000,
        menuItemId: 'snack-cheese-balls',
      },
    ],
    subtotal: 122000,
    discount: 0,
    deliveryFee: 0,
    total: 122000,
    status: 'delivered',
    estimatedDeliveryMinutes: 0,
  },
  {
    id: 'FC-1012',
    userId: 'user-alisher',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    customerName: 'Alisher Qodirov',
    phone: '+998 90 123 45 67',
    address: 'Yakkasaroy tumani, Shota Rustaveli 21-bino',
    deliveryType: 'delivery',
    paymentMethod: 'card',
    items: [
      {
        name: 'Duo Fire Kombo',
        quantity: 1,
        price: 115000,
        menuItemId: 'combo-duo-fire',
      },
      {
        name: 'Maxsus Olovli Qizil Sous',
        quantity: 2,
        price: 5000,
        menuItemId: 'sauce-fire',
      },
    ],
    subtotal: 125000,
    discount: 10000,
    deliveryFee: 0,
    total: 115000,
    status: 'delivered',
    estimatedDeliveryMinutes: 0,
  },
];

// Helper to sanitize user (omit password)
function sanitizeUser(user: ServerUser) {
  const { password, ...rest } = user;
  return rest;
}

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// In-memory cache & circuit breaker for seamless resilience and quota protection
const aiCache = new Map<string, { value: string; expires: number }>();
let geminiQuotaCooldownUntil = 0;

// High-availability models cascade: ultra-fast flash-lite first, then aliases
const GEMINI_TEXT_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

async function generateWithGemini(
  ai: GoogleGenAI,
  prompt: string,
  options?: {
    temperature?: number;
    responseMimeType?: string;
  }
): Promise<string | null> {
  // If quota limit was reached recently, smoothly allow fallback engine to handle requests without delay
  if (Date.now() < geminiQuotaCooldownUntil) {
    return null;
  }

  // Check cache to save Gemini quota
  const cacheKey = `${prompt.trim()}_${options?.temperature ?? 0.7}`;
  const cached = aiCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  for (const model of GEMINI_TEXT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: options?.responseMimeType || 'application/json',
          temperature: options?.temperature ?? 0.7,
        },
      });
      const text = response.text?.trim();
      if (text) {
        // Cache result for 10 minutes to preserve quota
        aiCache.set(cacheKey, { value: text, expires: Date.now() + 10 * 60 * 1000 });
        return text;
      }
    } catch (err: any) {
      const errorMsg = String(err?.message || err);
      const isQuotaError =
        errorMsg.includes('429') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        // Skip straight to next model without retrying an exhausted model
        continue;
      }

      // If it's a 503/high demand transient glitch, try next model
      continue;
    }
  }

  // If all models hit quota or are temporarily in high demand, pause API calls for 2 minutes
  geminiQuotaCooldownUntil = Date.now() + 2 * 60 * 1000;
  return null;
}

function parseJsonFromGemini<T = any>(rawText: string | null): T | null {
  if (!rawText) return null;
  let clean = rawText.trim();
  // Strip markdown code block formatting if present
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(clean) as T;
  } catch (err) {
    console.warn('[Gemini] JSON parsing error, content:', clean.slice(0, 120));
    return null;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AUTHENTICATION & USER APIS
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || (!email && !phone) || !password) {
      return res.status(400).json({ error: 'Ism, telefon/email va parol kiritilishi shart' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim() : '';

    const existing = usersStore.find(
      (u) =>
        (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && u.phone === cleanPhone)
    );

    if (existing) {
      return res.status(400).json({ error: 'Ushbu email yoki telefon raqami allaqachon ro\'yxatdan o\'tgan' });
    }

    const newUserId = `user-${Date.now()}`;
    const initialAddresses: ServerUserAddress[] = [];

    if (address && address.trim()) {
      initialAddresses.push({
        id: `addr-${Date.now()}`,
        label: 'Asosiy Manzil',
        fullAddress: address.trim(),
        isDefault: true,
      });
    }

    const newUser: ServerUser = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail || `${newUserId}@firecrust.uz`,
      phone: cleanPhone || '+998 90 000 00 00',
      password: password,
      addresses: initialAddresses,
      createdAt: new Date().toISOString(),
      loyaltyPoints: 100, // 100 points welcome bonus!
      loyaltyTier: 'Standart',
    };

    usersStore.push(newUser);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token: `fc_token_${newUser.id}`,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik yuz berdi' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Telefon/Email va parol kiritilishi shart' });
    }

    const clean = emailOrPhone.trim().toLowerCase();
    const user = usersStore.find(
      (u) =>
        (u.email.toLowerCase() === clean || u.phone.toLowerCase() === clean) &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Telefon raqam, email yoki parol noto\'g\'ri' });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: `fc_token_${user.id}`,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Tizimga kirishda xatolik yuz berdi' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  if (!userId) {
    return res.status(401).json({ error: 'Foydalanuvchi aniqlanmadi' });
  }

  const user = usersStore.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }

  return res.json({ success: true, user: sanitizeUser(user) });
});

// ADDRESS MANAGEMENT APIS
app.post('/api/user/addresses', (req, res) => {
  try {
    const { userId, address } = req.body;
    if (!userId || !address || !address.fullAddress) {
      return res.status(400).json({ error: 'Manzil ma\'lumotlari yetarli emas' });
    }

    const user = usersStore.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const newAddressId = `addr-${Date.now()}`;
    const isFirst = user.addresses.length === 0;
    const shouldBeDefault = Boolean(address.isDefault || isFirst);

    if (shouldBeDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    const newAddr: ServerUserAddress = {
      id: newAddressId,
      label: address.label || 'Uy',
      fullAddress: address.fullAddress.trim(),
      apartment: address.apartment?.trim(),
      entrance: address.entrance?.trim(),
      floor: address.floor?.trim(),
      comment: address.comment?.trim(),
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddr);
    return res.json({ success: true, addresses: user.addresses, newAddress: newAddr });
  } catch (err) {
    console.error('Add address error:', err);
    return res.status(500).json({ error: 'Manzilni saqlashda xatolik yuz berdi' });
  }
});

app.delete('/api/user/addresses/:addressId', (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = (req.query.userId as string) || (req.body && req.body.userId);

    const user = usersStore.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const deletedIndex = user.addresses.findIndex((a) => a.id === addressId);
    if (deletedIndex === -1) {
      return res.status(404).json({ error: 'Manzil topilmadi' });
    }

    const wasDefault = user.addresses[deletedIndex].isDefault;
    user.addresses.splice(deletedIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    return res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error('Delete address error:', err);
    return res.status(500).json({ error: 'Manzilni o\'chirishda xatolik yuz berdi' });
  }
});

app.put('/api/user/addresses/:addressId/default', (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;

    const user = usersStore.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    user.addresses.forEach((a) => {
      a.isDefault = a.id === addressId;
    });

    return res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error('Set default address error:', err);
    return res.status(500).json({ error: 'Asosiy manzilni o\'zgartirishda xatolik' });
  }
});

// USER ORDERS HISTORY
app.get('/api/user/orders', (req, res) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  if (!userId) {
    return res.json({ orders: [] });
  }

  const userOrders = ordersStore.filter((o) => o.userId === userId);
  return res.json({ orders: userOrders });
});

// Orders APIs
app.get('/api/orders', (req, res) => {
  res.json({ orders: ordersStore });
});

app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    const newOrderId = `FC-${Math.floor(1000 + Math.random() * 9000)}`;

    const lat = orderData.gpsCoordinates?.lat;
    const lng = orderData.gpsCoordinates?.lng;
    const hasGps = typeof lat === 'number' && typeof lng === 'number';

    const yandexNaviUrl =
      orderData.yandexNaviUrl ||
      (hasGps
        ? `https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~${lat}%2C${lng}&rtt=auto&ruri=~&z=16`
        : 'https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~40.376488%2C71.808105&rtt=auto&ruri=~&z=16');
    const yandexMapsUrl =
      orderData.yandexMapsUrl ||
      (hasGps
        ? `https://yandex.uz/maps/10336/fergana/?ll=${lng}%2C${lat}&z=16&pt=${lng},${lat},pm2rdm`
        : 'https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~40.376488%2C71.808105&rtt=auto&ruri=~&z=16');

    const newOrder: ServerOrder = {
      id: newOrderId,
      userId: orderData.userId,
      createdAt: new Date().toISOString(),
      customerName: orderData.customerName || 'Mijoz',
      phone: orderData.phone || '',
      address: orderData.address || "Farg'ona shahar",
      deliveryType: orderData.deliveryType || 'delivery',
      paymentMethod: orderData.paymentMethod || 'cash',
      items: orderData.items || [],
      subtotal: orderData.subtotal || orderData.total || 0,
      discount: orderData.discount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      total: orderData.total || 0,
      status: 'received',
      estimatedDeliveryMinutes: orderData.deliveryType === 'takeaway' ? 15 : 30,
      promoCode: orderData.promoCode,
      notes: orderData.notes,
      gpsCoordinates: hasGps ? { lat, lng } : undefined,
      yandexNaviUrl,
      yandexMapsUrl,
    };

    ordersStore.unshift(newOrder);

    // Format Telegram notification for @qahhorvch with Yandex Navigator
    const adminUsername = process.env.TELEGRAM_ADMIN_USERNAME || 'qahhorvch';
    const restaurantPhone = process.env.RESTAURANT_PHONE || '+998905375444';

    const itemsSummary = newOrder.items
      .map((it, i) => `${i + 1}. ${(it as any).quantity || 1}x ${(it as any).name || (it as any).menuItem?.name || 'Taom'} (${((it as any).price || (it as any).unitPrice || 0).toLocaleString()} so'm)`)
      .join('\n');

    const gpsTextPlain = hasGps
      ? `\n🧭 GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n🚗 Yandex Navigator: ${yandexNaviUrl}\n🗺 Yandex Xarita: ${yandexMapsUrl}`
      : '';

    const telegramMessagePlain = `🍕 YANGI BUYURTMA #${newOrder.id}
━━━━━━━━━━━━━━━━━━
👤 Mijoz: ${newOrder.customerName}
📞 Telefon: ${newOrder.phone}
📍 Manzil: ${newOrder.address}${gpsTextPlain}
🚚 Turi: ${newOrder.deliveryType === 'delivery' ? '🛵 Yetkazib berish' : '🏬 Olib ketish'}
💳 To'lov: ${newOrder.paymentMethod}

📋 Taomlar:
${itemsSummary}
━━━━━━━━━━━━━━━━━━
💰 Jami: ${newOrder.total.toLocaleString()} so'm
${newOrder.notes ? `📝 Izoh: ${newOrder.notes}\n` : ''}
Restoran: AL DONER PIZZA
Tel: +998 (90) 537-54-44
Telegram: @${adminUsername}`;

    const telegramDirectUrl = `https://t.me/${adminUsername}?text=${encodeURIComponent(telegramMessagePlain)}`;

    // If Telegram Bot credentials are provided in env, dispatch automatically
    let botSent = false;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      try {
        // Send main text message
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessagePlain,
            reply_markup: hasGps ? {
              inline_keyboard: [
                [
                  { text: "🚗 Yandex Navigatorda ochish", url: yandexNaviUrl },
                  { text: "🗺 Yandex Xarita", url: yandexMapsUrl }
                ]
              ]
            } : undefined,
          }),
        }).then(() => {
          console.log(`[Telegram] Order #${newOrder.id} successfully sent to Telegram bot chat ${chatId}`);
          // If GPS is present, also drop native Telegram Location pin!
          if (hasGps) {
            fetch(`https://api.telegram.org/bot${botToken}/sendLocation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                latitude: lat,
                longitude: lng,
              }),
            }).catch((locErr) => console.warn('[Telegram] sendLocation error:', locErr));
          }
        }).catch((err) => {
          console.warn('[Telegram] Bot dispatch error:', err);
        });
        botSent = true;
      } catch (tgErr) {
        console.warn('[Telegram] Failed to initiate bot request:', tgErr);
      }
    } else {
      console.log(`[Telegram] Order #${newOrder.id} created. Direct Telegram link generated for @${adminUsername}: ${telegramDirectUrl}`);
    }

    // If order belongs to a user, add loyalty points & maybe upgrade tier
    let updatedUser: ServerUser | undefined;
    if (orderData.userId) {
      const user = usersStore.find((u) => u.id === orderData.userId);
      if (user) {
        const earnedPoints = Math.round(newOrder.total * 0.05); // 5% bonus points
        user.loyaltyPoints += earnedPoints;

        const totalUserOrders = ordersStore.filter((o) => o.userId === user.id).length;
        if (totalUserOrders >= 8) {
          user.loyaltyTier = 'Oltin VIP';
        } else if (totalUserOrders >= 3) {
          user.loyaltyTier = 'Kumush';
        } else if (totalUserOrders >= 1) {
          user.loyaltyTier = 'Bronza';
        }

        updatedUser = user;
      }
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      user: updatedUser ? sanitizeUser(updatedUser) : undefined,
      telegram: {
        adminUsername,
        restaurantPhone,
        directUrl: telegramDirectUrl,
        botSent,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Buyurtmani saqlashda xatolik yuz berdi' });
  }
});

// TELEGRAM BOT WEBHOOK & CONFIG
app.get('/api/telegram/config', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const webAppUrl = `${protocol}://${host}`;

  res.json({
    adminUsername: process.env.TELEGRAM_ADMIN_USERNAME || 'qahhorvch',
    restaurantPhone: process.env.RESTAURANT_PHONE || '+998905375444',
    restaurantPhoneFormatted: '+998 (90) 537-54-44',
    restaurantName: 'AL DONER PIZZA',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'al_doner_pizza_bot',
    webAppUrl,
    hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
});

app.post('/api/telegram/webhook', async (req, res) => {
  const update = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // Telegram bot webhook handling for /start, /menu, etc.
  if (update && update.message && update.message.chat) {
    const chatId = update.message.chat.id;
    const text = update.message.text || '';
    const fromUser = update.message.from?.first_name || 'Mijoz';

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const webAppUrl = `${protocol}://${host}`;

    // Handle /start or /menu command
    if (text.startsWith('/start') || text.startsWith('/menu')) {
      const replyMessage = `🍕 Assalomu alaykum, ${fromUser}!

<b>AL DONER PIZZA</b> restoranining rasmiy botiga xush kelibsiz!

Tandir olovida pishirilgan mazali turkcha dönerlar, qarsildoq Italiyan pitsalari va fast-food taomlarini to'g'ridan-to'g'ri Telegram ichida tanlash uchun quyidagi <b>"🍕 Menyu & Buyurtma (Mini App)"</b> tugmasini bosing:`;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '🍕 Menyu & Buyurtma (Mini App)',
              web_app: { url: webAppUrl },
            },
          ],
          [
            { text: '📞 Qo\'ng\'iroq qilish (+998 90 537-54-44)', url: 'tel:+998905375444' },
            { text: '💬 Admin bilan bog\'lanish', url: 'https://t.me/qahhorvch' },
          ],
        ],
      };

      if (botToken) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: replyMessage,
              parse_mode: 'HTML',
              reply_markup: keyboard,
            }),
          });
        } catch (err) {
          console.warn('[Telegram Webhook] Error sending message:', err);
        }
      }
    }

    // Handle web_app_data (when sent from Telegram WebApp back to bot)
    if (update.message.web_app_data) {
      try {
        const orderData = JSON.parse(update.message.web_app_data.data);
        console.log('[Telegram Webhook] Received WebApp Order data:', orderData);
      } catch (e) {
        console.warn('[Telegram Webhook] Failed to parse web_app_data:', e);
      }
    }
  }

  res.json({ ok: true });
});

// Gemini AI Recommendation & Sommelier API
app.post('/api/ai/consult', async (req, res) => {
  const { query, mood, partySize, budget, dietaryPreference } = req.body;

  try {
    const ai = getGenAI();

    if (ai) {
      const prompt = `
Siz "AL DONER PIZZA" restorani bosh oshpazi va professional ta'm sommelieri "Usta Farhod"siz.
Mijozga do'stona, ishtahani ochadigan va samimiy o'zbek tilida maslahat bering.

Mijoz so'rovi:
- Xabar / Savol: "${query || 'Nima tavsiya qilasiz?'}"
- Kayfiyat yoki holat: "${mood || 'Oddiy tushlik yoki kechki ovqat'}"
- Necha kishi: ${partySize || 1} kishi
- Taxminiy byudjet: ${budget ? budget + " so'm" : 'Cheklanmagan'}
- Afzallik: ${dietaryPreference || 'Barchasi'}

Menyumizdagi asosiy xitlar:
1. "doner-tombik-istanbul": Istanbul Tombik Döner (42 000 so'm, tandir tombik nonda mayin mol go'shti, sabzavotlar, turk sousi)
2. "doner-beef-classic": Klassik Mol Go'shtli Lavash (38 000 so'm, lavash, fri, sarimsoqli sous)
3. "doner-chicken-cheese": Pishloqli Tovuq Döner Dürüm (35 000 so'm, erigan chedder, tovuq)
4. "doner-iskender-plate": Afsonaviy Iskender Döner Porsiya (58 000 so'm, sariyog', pomidor sous, qatiq)
5. "doner-fire-spicy": FireCrust Olovli O'tkir Döner (41 000 so'm, achchiq chili, jalapeno)
6. "pizza-firecrust-special": FireCrust Signature Doner Pizza (85 000 so'm, doner go'shti, motsarella, sarimsoqli spiral)
7. "pizza-pepperoni-classic": Klassik Italiyan Pepperoni (78 000 so'm, boy pishloq, achchiq kolbasa)
8. "pizza-quattro-formaggi": To'rt Pishloq Pizza (82 000 so'm, 4 xil pishloq)
9. "pizza-bbq-chicken": BBQ Dudlangan Tovuq Pizza (79 000 so'm, tovuq, makkajo'xori, BBQ)
10. "pizza-margherita-craft": Margarita Artisanal Napoli (65 000 so'm, bazilik, motsarella)
11. "combo-duo-fire": Duo Fire Kombo (115 000 so'm, O'rta Pizza + Lavash + 2 Ayran)
12. "combo-friends-party": Mega Do'stlar To'plami (195 000 so'm, Katta Pizza + 2 Tombik + Fri + 1.5L Kola)
13. "combo-lunch-box": Tezkor Tushlik (52 000 so'm, Lavash + Fri + 0.5L Kola)
14. "drink-ayran-fresh": Ko'pikli Turk Ayrani (9 000 so'm)
15. "snack-cheese-balls": Motsarella Pishloqli Sharchalar (26 000 so'm)

Iltimos, javobni QAT'IY ravishda toza JSON formatida quyidagi strukturada qaytaring:
{
  "recommendationTitle": "Qisqa, jozibador sarlavha (masalan: 'Do'stona Ziyofat uchun A'lo Tanlov!')",
  "message": "Mijozga 2-3 jumlada nima uchun bu tanlov mos kelishini tushuntirib bering (o'zbek tilida, ishtaha ochuvchi so'zlar bilan)",
  "recommendedItemIds": ["doner-tombik-istanbul", "drink-ayran-fresh"], // Menyu ID lari (faqat yuqoridagi ro'yxatdan)
  "pairingAdvice": "Ushbu taom bilan qaysi ichimlik yoki sous eng ajoyib ketishi haqida maslahat",
  "estimatedTotal": 51000,
  "specialTip": "Oshpazdan maxsus sir yoki maslahat (masalan: 'Iskenderga ozroq achchiq sous qo'shsangiz ta'mi yanada boy bo'ladi!')"
}
`;

      try {
        const rawText = await generateWithGemini(ai, prompt, {
          responseMimeType: 'application/json',
          temperature: 0.7,
        });
        if (rawText) {
          const parsed = parseJsonFromGemini(rawText);
          if (parsed && parsed.recommendationTitle && parsed.message) {
            return res.json(parsed);
          }
        }
      } catch {
        // Smoothly proceed to localized recommendation engine without throwing noisy console errors
      }
    }

    // Smart fallback if API key is not yet set or Gemini is temporarily in high demand
    let recommendedIds = ['combo-duo-fire'];
    let title = "Oshpazimizning Bugungi Tavsiyasi: Duo Fire";
    let message = "Siz uchun maxsus olovda pishgan mazali Döner va Italiyan pizzamizning ajoyib uyg'unligini tavsiya etamiz!";
    let pairingAdvice = "Yoniga albatta muzdek ko'pikli yangi turk ayranini oling!";
    let total = 115000;

    if (dietaryPreference === 'spicy' || (query && query.toLowerCase().includes('achchiq'))) {
      recommendedIds = ['doner-fire-spicy', 'sauce-fire', 'drink-ayran-fresh'];
      title = "Haqiqiy Olovli Ishtaha To'plami";
      message = "O'tkir qalampirli FireCrust doneri va olovli qizil sous tanangizga quvvat va tetiklik bag'ishlaydi!";
      pairingAdvice = "Achchiqni muvozanatlashtirish uchun muzdek ayran ayni muddao!";
      total = 55000;
    } else if (partySize && partySize >= 3) {
      recommendedIds = ['combo-friends-party'];
      title = "Katta Davra va Do'stlar uchun Mega To'plam";
      message = "Hamma uchun yetarli: katta doner pizza, 2 ta yumshoq tombik doner, qarsildoq fri va yaxna kola!";
      pairingAdvice = "Sarimsoqli oq sous bilan fri kartoshkasini tatib ko'ring.";
      total = 195000;
    } else if (budget && budget < 60000) {
      recommendedIds = ['combo-lunch-box'];
      title = "Tejamkor va To'yimli Tushlik";
      message = "Byudjetingizga mos keluvchi mazali lavash, oltinrang kartoshka fri va tetiklantiruvchi ichimlik.";
      pairingAdvice = "Oq sous lavash bilan mukammal mos tushadi.";
      total = 52000;
    } else if (dietaryPreference === 'cheese') {
      recommendedIds = ['pizza-quattro-formaggi', 'snack-cheese-balls'];
      title = "Eritilgan Pishloqlar Ziyofati";
      message = "4 xil oliy navli pishloqlar bilan qoplangan pizza va qarsildoq motsarella sharchalari!";
      pairingAdvice = "Marakuya limonadi pishloqning boy ta'mini ochib beradi.";
      total = 108000;
    }

    return res.json({
      recommendationTitle: title,
      message,
      recommendedItemIds: recommendedIds,
      pairingAdvice,
      estimatedTotal: total,
      specialTip: "Taomingizni buyurtma bergach, oshpazimiz uni olovli pechda maxsus retsept bo'yicha tayyorlaydi!",
    });
  } catch (error) {
    console.error('AI consult error:', error);
    res.status(500).json({
      error: 'AI maslahatchi xizmatida xatolik',
      fallback: {
        recommendationTitle: 'FireCrust Maxsus Taklifi',
        message: 'Bugun sizga eng ko\'p buyurtma beriladigan Istanbul Tombik Doner va Klassik Pepperoni pizzamizni tavsiya qilamiz.',
        recommendedItemIds: ['doner-tombik-istanbul', 'pizza-pepperoni-classic'],
        pairingAdvice: 'Muzdek turk ayrani va sarimsoqli sous bilan ta\'m yanada ajoyib bo\'ladi.',
        estimatedTotal: 120000,
      },
    });
  }
});

// Gemini AI Personalized Recommendations (Order History & Popular Items Analysis)
app.post('/api/ai/personalized', async (req, res) => {
  try {
    const { userId, clientOrderHistory } = req.body;

    // 1. Gather User & Order history
    let userOrders: ServerOrder[] = [];
    let targetUser: ServerUser | undefined;

    if (userId) {
      targetUser = usersStore.find((u) => u.id === userId);
      userOrders = ordersStore.filter((o) => o.userId === userId);
    }

    if (userOrders.length === 0 && Array.isArray(clientOrderHistory) && clientOrderHistory.length > 0) {
      userOrders = clientOrderHistory;
    }

    // Extract item history
    const orderedItemNames: string[] = [];
    const orderedItemIds: string[] = [];
    let totalSpent = 0;

    userOrders.forEach((ord) => {
      totalSpent += ord.total || 0;
      ord.items?.forEach((it) => {
        orderedItemNames.push(it.name);
        if (it.menuItemId) orderedItemIds.push(it.menuItemId);
      });
    });

    const isSpicyFan =
      orderedItemNames.some((n) => n.toLowerCase().includes('achchiq') || n.toLowerCase().includes('olov')) ||
      orderedItemIds.includes('doner-fire-spicy');
    const isCheeseLover =
      orderedItemNames.some((n) => n.toLowerCase().includes('pishloq') || n.toLowerCase().includes('cheese')) ||
      orderedItemIds.includes('snack-cheese-balls') ||
      orderedItemIds.includes('pizza-quattro-formaggi');
    const isDonerFan =
      orderedItemNames.some((n) => n.toLowerCase().includes('doner') || n.toLowerCase().includes('lavash')) ||
      orderedItemIds.includes('doner-tombik-istanbul');
    const isPizzaFan =
      orderedItemNames.some((n) => n.toLowerCase().includes('pizza')) ||
      orderedItemIds.includes('pizza-firecrust-special');

    const customerName = targetUser?.name || 'Hurmatli Mijoz';
    const orderCount = userOrders.length;
    const loyaltyTier = targetUser?.loyaltyTier || 'Standart';

    // 2. Try Gemini AI for hyper-personalized deep reasoning
    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `
Siz "AL DONER PIZZA" restorani bosh sun'iy intellekt tahlilchisi va sommelierisiz.
Mijozning xaridlar tarixi va restoranning eng xaridorgir (hit) taomlarini chuqur tahlil qilib, unga 3 ta SHAXSIY tavsiya tayyorlab bering:
1. Shaxsiy Pizza Tavsiyasi (Mijozning didiga to'liq mos keladigan eng sara pizza)
2. Shaxsiy Kombo Taklifi (Asosiy taom + ichimlik yoki snek juftligi, arzonroq kombo narxda)
3. Shaxsiy Eksklyuziv Taklif / Promokod (Mijozning sodiqlik darajasi va buyurtmalar soni uchun maxsus chegirma)

Mijoz ma'lumotlari:
- Ismi: ${customerName}
- Buyurtmalar soni: ${orderCount} ta buyurtma
- Jami sarflangan summa: ${totalSpent.toLocaleString()} so'm
- Sodiqlik darajasi: ${loyaltyTier}
- Avval buyurtma bergan taomlari: ${orderedItemNames.length > 0 ? orderedItemNames.join(', ') : "Hali buyurtma bermagan (yangi mijoz, ammo xit taomlar qiziqtiradi)"}
- Ta'm afzalliklari: ${isSpicyFan ? "O'tkir/Achchiq taomlar" : ''} ${isCheeseLover ? "Eritilgan pishloqlar" : ''} ${isDonerFan ? "Shirali Turk Donerlari" : ''} ${isPizzaFan ? "Haqiqiy pechda pishgan Pizzalar" : ''}

Restoranimizning eng mashhur va ommabop taomlari:
- "pizza-firecrust-special": FireCrust Signature Doner Pizza (85 000 so'm)
- "pizza-pepperoni-classic": Klassik Italiyan Pepperoni (78 000 so'm)
- "pizza-quattro-formaggi": To'rt Pishloq Artisanal Pizza (82 000 so'm)
- "doner-tombik-istanbul": Istanbul Tombik Döner (42 000 so'm)
- "doner-beef-classic": Klassik Mol Go'shtli Lavash (38 000 so'm)
- "doner-chicken-cheese": Pishloqli Tovuq Döner Dürüm (35 000 so'm)
- "doner-iskender-plate": Afsonaviy Iskender Döner Porsiya (58 000 so'm)
- "doner-fire-spicy": FireCrust Olovli O'tkir Döner (41 000 so'm)
- "combo-duo-fire": Duo Fire Kombo (115 000 so'm)
- "drink-ayran-fresh": Muzdek Ko'pikli Turk Ayrani (9 000 so'm)
- "snack-cheese-balls": Motsarella Pishloqli Sharchalar (26 000 so'm)

Iltimos, javobni QAT'IY ravishda toza JSON massiv formatida (3 ta obyekt) qaytaring:
[
  {
    "id": "rec-pizza",
    "type": "pizza",
    "title": "Masalan: 'Siz uchun Maxsus: FireCrust Signature Doner Pizza'",
    "badge": "Didga Mos Tanlov",
    "reason": "Mijozning avvalgi xaridlariga asoslangan 1-2 jumlali samimiy tushuntirish (o'zbek tilida)",
    "itemIds": ["pizza-firecrust-special"],
    "originalPrice": 85000,
    "discountedPrice": 76500,
    "discountPercent": 10,
    "tasteTags": ["Doner Go'shti", "Motsarella", "Olovli Ta'm"]
  },
  {
    "id": "rec-combo",
    "type": "combo",
    "title": "Masalan: 'Usta Farhod Shaxsiy Gurman Kombosi'",
    "badge": "15% Foydali Juftlik",
    "comboName": "Gurman Mix Kombo",
    "reason": "Nima uchun ushbu juftlik mijozning ta'miga juda mos tushishi haqida",
    "itemIds": ["doner-tombik-istanbul", "snack-cheese-balls", "drink-ayran-fresh"],
    "originalPrice": 77000,
    "discountedPrice": 65000,
    "discountPercent": 15,
    "pairingAdvice": "Muzdek ayran qarsildoq tombik va pishloqli sharchalar bilan ajoyib uyg'unlashadi",
    "tasteTags": ["Tandir Non", "Muzdek Ayran", "Eritilgan Pishloq"]
  },
  {
    "id": "rec-offer",
    "type": "offer",
    "title": "Masalan: 'Doimiy Gurman uchun 15 000 so'm Sovg'a'",
    "badge": "Shaxsiy Promokod",
    "reason": "Mijozning doimiy xaridlari uchun minnatdorchilik taklifi",
    "itemIds": ["pizza-pepperoni-classic"],
    "originalPrice": 78000,
    "discountedPrice": 63000,
    "discountPercent": 20,
    "promoCode": "VIPGURMAN",
    "tasteTags": ["Maxsus Chegirma", "Eksklyuziv Taklif"]
  }
]
`;

        const rawText = await generateWithGemini(ai, prompt, {
          responseMimeType: 'application/json',
          temperature: 0.6,
        });

        if (rawText) {
          const parsed = parseJsonFromGemini(rawText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({
              success: true,
              source: 'gemini-ai',
              customerProfile: {
                name: customerName,
                ordersCount: orderCount,
                loyaltyTier,
                favoriteFlavor: isCheeseLover
                  ? "Eritilgan Pishloq & Shirali Go'sht"
                  : isSpicyFan
                  ? "O'tkir va Olovli Lazzat"
                  : "Artisanal Döner & Italiyan Pech Pizzasi",
              },
              recommendations: parsed,
            });
          }
        }
      } catch {
        // Smoothly proceed to localized recommendation engine without throwing noisy console errors
      }
    }

    // 3. Intelligent Heuristic Rule Engine (Guaranteed Instant & Dependable)
    let pizzaRec = {
      id: 'rec-pizza-1',
      type: 'pizza' as const,
      title: 'Siz uchun: FireCrust Signature Doner Pizza',
      badge: isDonerFan ? 'Sevimli Döneringiz Pizzada' : 'Eng Mashhur Tanlov',
      reason:
        orderCount > 0
          ? `${customerName}, siz avvalgi buyurtmalaringizda shirali döner go'shtini xush ko'rgansiz. Olovli pechda pishgan ushbu pizza sizga unutilmas taassurot qoldiradi!`
          : "Restoranimizning #1 eng mashhur taomi: yangi o'choq xamiri, shirali mol go'shti va oq sarimsoqli spiral sous!",
      itemIds: ['pizza-firecrust-special'],
      originalPrice: 85000,
      discountedPrice: 76500,
      discountPercent: 10,
      tasteTags: ["Doner Go'shti", 'Motsarella', 'Sarimsoqli Spiral'],
    };

    if (isCheeseLover) {
      pizzaRec = {
        id: 'rec-pizza-cheese',
        type: 'pizza' as const,
        title: "Siz uchun: To'rt Pishloq Artisanal Pizza",
        badge: 'Pishloq Shinavandasi',
        reason: `${customerName}, siz eritilgan mayin pishloqli taomlarni yaxshi ko'rganingiz sababli, 4 xil oliy navli pishloq uyg'unligini sizga maxsus 10% chegirmada tavsiya qilamiz!`,
        itemIds: ['pizza-quattro-formaggi'],
        originalPrice: 82000,
        discountedPrice: 73800,
        discountPercent: 10,
        tasteTags: ['Motsarella', 'Chedder', 'Dorblu', 'Parmezan'],
      };
    } else if (isSpicyFan) {
      pizzaRec = {
        id: 'rec-pizza-spicy',
        type: 'pizza' as const,
        title: 'Siz uchun: Olovli Italiyan Pepperoni',
        badge: "O'tkir Ishtaha",
        reason: `${customerName}, o'tkir ta'mlarga bo'lgan muhabbatingiz uchun meksikacha qalampirli va achchiq kolbasali Pepperonimiz mukammal mos keladi!`,
        itemIds: ['pizza-pepperoni-classic'],
        originalPrice: 78000,
        discountedPrice: 70000,
        discountPercent: 10,
        tasteTags: ['Achchiq Pepperoni', 'Jalapeño', 'Qaynoq Pishloq'],
      };
    }

    const comboRec = {
      id: 'rec-combo-1',
      type: 'combo' as const,
      title: 'Usta Farhod Shaxsiy Gurman Kombosi',
      badge: '18% Maxsus Chegirma',
      comboName: 'Istanbul Tombik + Pishloqli Sharchalar + Ayran',
      reason: `${customerName}, sizning xaridlar tarixingiz asosida tuzilgan ideal tushlik juftligi: tandir tombik döner, qarsildoq pishloqli sharchalar va ko'pikli yaxna ayran!`,
      itemIds: ['doner-tombik-istanbul', 'snack-cheese-balls', 'drink-ayran-fresh'],
      originalPrice: 77000,
      discountedPrice: 63000,
      discountPercent: 18,
      pairingAdvice: "Muzdek ayran tombik donerning shirali sariyog'li sousi bilan eng oliy darajada uyg'unlashadi.",
      tasteTags: ['Yumshoq Tombik', 'Pishloqli Sharchalar', 'Muzdek Ayran'],
    };

    const offerRec = {
      id: 'rec-offer-1',
      type: 'offer' as const,
      title: `${loyaltyTier} Mijoz uchun: 20 000 so'm Chegirma`,
      badge: 'Eksklyuziv Promokod',
      reason: `${customerName}, restoranimizga sodiqligingiz (${orderCount} ta buyurtma) uchun sizga keyingi buyurtmangizga maxsus "GURMAN20" promokodini taqdim etamiz!`,
      itemIds: ['combo-duo-fire'],
      originalPrice: 115000,
      discountedPrice: 95000,
      discountPercent: 17,
      promoCode: 'GURMAN20',
      tasteTags: ['Sodiqlik Bonusi', 'Katta Kombo', '-20 000 UZS'],
    };

    return res.json({
      success: true,
      source: 'rule-engine',
      customerProfile: {
        name: customerName,
        ordersCount: orderCount,
        loyaltyTier,
        favoriteFlavor: isCheeseLover
          ? "Eritilgan Pishloq & Shirali Go'sht"
          : isSpicyFan
          ? "O'tkir va Olovli Lazzat"
          : "Artisanal Döner & Italiyan Pech Pizzasi",
      },
      recommendations: [pizzaRec, comboRec, offerRec],
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({ error: 'Shaxsiy tavsiyalarni shakllantirishda xatolik yuz berdi' });
  }
});

// Menu catalogue for Voice Order parsing
const VOICE_MENU_CATALOG = [
  { id: 'al-donner-original', name: 'AL DONNER (Maxsus Yangilik)', basePrice: 44000, category: 'doner', aliases: ['al donner', 'al doner', 'al donir', 'eldoner', 'al-doner', 'yangi doner', 'doner'] },
  { id: 'tandir-beef-doner', name: "Tandir Döner Classic (Go'shtli)", basePrice: 38000, category: 'doner', aliases: ["tandir doner", "goshtli lavash", "tandir lavash", "klassik doner", "mol goshti"] },
  { id: 'tandir-chicken-cheese', name: "Pishloqli Tovuq Döner Dürüm", basePrice: 35000, category: 'doner', aliases: ["tovuqli doner", "pishloqli tovuq", "tovuq lavash", "chiken doner"] },
  { id: 'fire-spicy-doner', name: "FireCrust Olovli O'tkir Döner", basePrice: 41000, category: 'doner', aliases: ["achchiq doner", "otkir doner", "spicy doner", "olovli doner", "fire doner"] },
  { id: 'istanbul-tombik-doner', name: "Istanbul Tombik Döner", basePrice: 42000, category: 'doner', aliases: ["tombik", "istanbul tombik", "tombik doner", "non doner"] },
  { id: 'iskender-plate-doner', name: "Afsonaviy Iskender Döner Porsiya", basePrice: 58000, category: 'doner', aliases: ["iskender", "iskender doner", "iskandar", "iskender porsiya"] },
  { id: 'artisan-pepperoni-pizza', name: "Artisan Pepperoni & Mozzarella Pizza", basePrice: 65000, category: 'pizza', aliases: ["pepperoni", "peperoni", "pepperoni pizza", "kolbasali pizza"] },
  { id: 'firecrust-special-pizza', name: "FireCrust Signature Döner Pizza", basePrice: 72000, category: 'pizza', aliases: ["firecrust pizza", "signature pizza", "goshtli pizza", "doner pizza"] },
  { id: 'quattro-formaggi-pizza', name: "Quattro Formaggi (4 Pishloqli)", basePrice: 68000, category: 'pizza', aliases: ["quattro formaggi", "tort pishloq", "4 pishloq", "pishloqli pizza", "cheese pizza"] },
  { id: 'bbq-chicken-pizza', name: "Smoked BBQ Chicken Pizza", basePrice: 64000, category: 'pizza', aliases: ["bbq pizza", "barbekyu pizza", "tovuqli pizza", "chiken pizza"] },
  { id: 'margherita-di-bufala', name: "Margherita Classica Italiya", basePrice: 52000, category: 'pizza', aliases: ["margarita", "margherita", "oddiy pizza"] },
  { id: 'gourmet-craft-burger', name: "Gourmet Double Cheddar Burger", basePrice: 46000, category: 'burger', aliases: ["cheddar burger", "cheddor burger", "burger", "double burger", "goshtli burger"] },
  { id: 'crispy-chicken-burger', name: "Crispy Gold Chicken Burger", basePrice: 39000, category: 'burger', aliases: ["chiken burger", "tovuqli burger", "crispy burger"] },
  { id: 'super-al-donner-combo', name: "Super AL DONNER Mega Kombo", basePrice: 88000, category: 'combos', aliases: ["super combo", "mega kombo", "al donner kombo", "kombo"] },
  { id: 'duo-fire-combo', name: "Duo Fire Döner Kombo", basePrice: 115000, category: 'combos', aliases: ["duo kombo", "duo fire", "ikki kishilik kombo"] },
  { id: 'crispy-fries-gold', name: "Oltin Qarsildoq Kartoshka Fri", basePrice: 18000, category: 'snacks', aliases: ["kartoshka fri", "fri", "french fries", "kartoshka"] },
  { id: 'cheese-balls-crispy', name: "Eritilgan Motsarella Pishloqli Sharchalar", basePrice: 26000, category: 'snacks', aliases: ["pishloqli sharlar", "cheese balls", "motsarella sharlari"] },
  { id: 'coca-cola-500', name: "Muzdek Coca-Cola Classic (0.5L)", basePrice: 10000, category: 'drinks', aliases: ["coca cola", "coca-cola", "kola", "cola"] },
  { id: 'fanta-orange-500', name: "Muzdek Fanta Orange (0.5L)", basePrice: 10000, category: 'drinks', aliases: ["fanta", "apelsinli fanta", "fanta orange"] },
  { id: 'sprite-lemon-500', name: "Muzdek Sprite Lemon (0.5L)", basePrice: 10000, category: 'drinks', aliases: ["sprite", "sprayt"] },
  { id: 'ayran-turkish-fresh', name: "Muzdek Ko'pikli Turk Ayrani", basePrice: 9000, category: 'drinks', aliases: ["ayran", "turk ayrani", "kopikli ayran"] },
  { id: 'green-tea-lemon', name: "Ko'k Choy Limon va Yalpiz bilan", basePrice: 8000, category: 'drinks', aliases: ["choy", "kok choy", "limonli choy", "choy limon"] },
];

/**
 * Uzbek & Russian speech rule parser for robust offline / quota fallback
 */
function parseVoiceOrderRuleEngine(transcript: string) {
  const text = transcript.toLowerCase();
  const matchedItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    selectedSize?: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }> = [];

  // Quantity words in Uzbek / Russian
  const numMap: Record<string, number> = {
    'bitta': 1, 'bir': 1, '1': 1, 'odin': 1, 'odna': 1,
    'ikkita': 2, 'ikki': 2, '2': 2, 'dva': 2, 'dve': 2,
    'uchta': 3, 'uch': 3, '3': 3, 'tri': 3,
    'to\'rtta': 4, 'torta': 4, 'to\'rt': 4, 'tort': 4, '4': 4, 'chetyre': 4,
    'beshta': 5, 'besh': 5, '5': 5, 'pyat': 5,
    'oltita': 6, 'olti': 6, '6': 6,
    'yettita': 7, 'yetti': 7, '7': 7,
    'sakkizta': 8, 'sakkiz': 8, '8': 8,
    'to\'qqizta': 9, 'toqqizta': 9, 'to\'qqiz': 9, '9': 9,
    'o\'nta': 10, 'onta': 10, 'o\'n': 10, 'on': 10, '10': 10,
  };

  // Check each item
  for (const item of VOICE_MENU_CATALOG) {
    let itemFound = false;
    for (const alias of item.aliases) {
      if (text.includes(alias)) {
        itemFound = true;
        // Search preceding words for quantity
        const aliasIdx = text.indexOf(alias);
        const before = text.slice(Math.max(0, aliasIdx - 20), aliasIdx).trim();
        const beforeWords = before.split(/\s+/);
        let qty = 1;
        for (let i = beforeWords.length - 1; i >= 0; i--) {
          const w = beforeWords[i];
          if (numMap[w]) {
            qty = numMap[w];
            break;
          }
        }

        // Check if size is mentioned
        let size = 'standard';
        if (text.includes('katta') || text.includes('maxi') || text.includes('double')) {
          size = 'large';
        }

        // Avoid adding duplicate if already added
        if (!matchedItems.some((it) => it.menuItemId === item.id)) {
          matchedItems.push({
            menuItemId: item.id,
            name: item.name,
            quantity: qty,
            selectedSize: size,
            unitPrice: item.basePrice,
            totalPrice: item.basePrice * qty,
            notes: text.includes('achchiq') ? "O'tkirroq bo'lsin" : text.includes('piyozsiz') ? 'Piyozsiz' : '',
          });
        }
        break;
      }
    }
  }

  // If no items matched but text mentions general "doner" or "pizza"
  if (matchedItems.length === 0) {
    if (text.includes('doner') || text.includes('al') || text.includes('lavash')) {
      const it = VOICE_MENU_CATALOG[0]; // AL DONNER
      matchedItems.push({
        menuItemId: it.id,
        name: it.name,
        quantity: 1,
        selectedSize: 'standard',
        unitPrice: it.basePrice,
        totalPrice: it.basePrice,
      });
    } else if (text.includes('pizza') || text.includes('pitsa')) {
      const it = VOICE_MENU_CATALOG.find((m) => m.id === 'artisan-pepperoni-pizza') || VOICE_MENU_CATALOG[6];
      matchedItems.push({
        menuItemId: it.id,
        name: it.name,
        quantity: 1,
        selectedSize: 'standard',
        unitPrice: it.basePrice,
        totalPrice: it.basePrice,
      });
    }
  }

  const total = matchedItems.reduce((acc, cur) => acc + cur.totalPrice, 0);

  return {
    success: matchedItems.length > 0,
    rawTranscript: transcript,
    matchedItems,
    estimatedTotal: total,
    summaryNote: matchedItems.length > 0
      ? `${matchedItems.length} xil taom aniqlandi. Iltimos, tekshirib tasdiqlang.`
      : 'Taom nomi to\'liq tushunilmadi. Iltimos, qayta ayting.',
  };
}

// POST /api/voice-order/parse: AI voice order transcript parser
app.post('/api/voice-order/parse', async (req, res) => {
  try {
    const { transcript, audioBase64, mimeType } = req.body;
    let textToAnalyze = (transcript || '').trim();

    const ai = getGenAI();

    // 1. If audioBase64 is passed without transcript, transcribe with Gemini
    if (!textToAnalyze && audioBase64 && ai) {
      try {
        const audioResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64,
              },
            },
            'Ushbu audio yozuvdagi buyurtmani so\'zma-so\'z matn (transcript) ko\'rinishida yozib bering (O\'zbek yoki rus tilida). Faqat aytilgan matnning o\'zini qaytaring.',
          ],
        });
        textToAnalyze = (audioResponse.text || '').trim();
      } catch (err) {
        console.warn('Audio transcription with Gemini failed:', err);
      }
    }

    if (!textToAnalyze) {
      return res.status(400).json({
        success: false,
        error: 'Ovoz yozuvi yoki matn taqdim etilmadi.',
      });
    }

    // 2. Use Gemini to parse into structured JSON matching AL DONNER menu
    if (ai) {
      try {
        const catalogBrief = VOICE_MENU_CATALOG.map(
          (m) => `ID: "${m.id}", Nomi: "${m.name}", Narxi: ${m.basePrice} so'm, Kategoriya: "${m.category}"`
        ).join('\n');

        const prompt = `
Siz AL DONER PIZZA restoranining bosh ovozli buyurtma AI tahlilchisisiz.
Mijoz mikrofon orqali o'zbek yoki rus tilida gapirib taom buyurtma berdi.

Mijoz aytgan matn:
"${textToAnalyze}"

Bizning rasmiy menyu katalogimiz:
${catalogBrief}

Vazifangiz:
1. Mijoz aytgan matndan har bir taomni, uning aniq sonini (1, 2, 3 ta...) va xohishlarini (achchiq, pishloqli, katta, piyozsiz...) aniqlang.
2. Menyudagi eng mos keluvchi taomning ID sini tanlang.
3. Agar aytilgan narsa menyuda bo'lmasa, uni "unrecognizedText" maydoniga yozing.
4. Javobni QAT'IY ravishda toza JSON formatida quyidagicha qaytaring (boshqa so'z qo'shmang):
{
  "matchedItems": [
    {
      "menuItemId": "al-donner-original",
      "name": "AL DONNER (Maxsus Yangilik)",
      "quantity": 2,
      "selectedSize": "standard",
      "unitPrice": 44000,
      "totalPrice": 88000,
      "notes": "Masalan: Achchiqroq"
    }
  ],
  "unrecognizedText": "",
  "summaryNote": "Mijoz uchun xushmuomala 1 jumlali xulosa (o'zbek tilida)"
}
`;

        const responseText = await generateWithGemini(ai, prompt, {
          temperature: 0.2,
          responseMimeType: 'application/json',
        });

        if (responseText) {
          const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
          if (Array.isArray(parsed.matchedItems) && parsed.matchedItems.length > 0) {
            // Re-validate against catalog prices to guarantee accuracy
            const validatedItems = parsed.matchedItems.map((item: any) => {
              const matchedCatalog = VOICE_MENU_CATALOG.find((m) => m.id === item.menuItemId);
              const unitPrice = matchedCatalog ? matchedCatalog.basePrice : Number(item.unitPrice) || 35000;
              const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
              return {
                menuItemId: matchedCatalog ? matchedCatalog.id : item.menuItemId,
                name: matchedCatalog ? matchedCatalog.name : item.name,
                quantity,
                selectedSize: item.selectedSize || 'standard',
                unitPrice,
                totalPrice: unitPrice * quantity,
                notes: item.notes || '',
              };
            });

            const estimatedTotal = validatedItems.reduce((sum: number, it: any) => sum + it.totalPrice, 0);

            return res.json({
              success: true,
              rawTranscript: textToAnalyze,
              matchedItems: validatedItems,
              unrecognizedText: parsed.unrecognizedText || '',
              summaryNote: parsed.summaryNote || `${validatedItems.length} ta mahsulot aniqlandi. Iltimos, xaridni tasdiqlang.`,
              estimatedTotal,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini voice order parse error, falling back to rule engine:', geminiErr);
      }
    }

    // 3. Fallback: Rule engine
    const ruleResult = parseVoiceOrderRuleEngine(textToAnalyze);
    return res.json(ruleResult);
  } catch (error) {
    console.error('Voice order parse error:', error);
    res.status(500).json({
      success: false,
      error: 'Ovozli buyurtmani tahlil qilishda xatolik yuz berdi.',
    });
  }
});

// Static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Vite or static hosting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FireCrust Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
