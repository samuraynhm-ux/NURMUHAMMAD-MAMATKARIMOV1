import { Order } from '../types';
import { formatPrice } from './formatters';

export const TELEGRAM_ADMIN_USERNAME = 'qahhorvch';
export const TELEGRAM_BOT_USERNAME = 'al_doner_pizza_bot';
export const RESTAURANT_PHONE = '+998905375444';
export const RESTAURANT_PHONE_FORMATTED = '+998 (90) 537-54-44';
export const RESTAURANT_NAME = 'AL DONNER';
export const RESTAURANT_ADDRESS_FULL = "Farg'ona shahar, Al-Farg'oniy shoh ko'chasi 45 (Sayilgoh)";

/**
 * Returns the Telegram WebApp instance if available
 */
export function getTelegramWebApp(): any {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp;
  }
  return null;
}

/**
 * Checks if the current app is running inside Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  const tg = getTelegramWebApp();
  return Boolean(tg && (tg.initData || tg.platform || window.location.hash.includes('tgWebAppData')));
}

/**
 * Retrieves the current Telegram user profile if launched via Telegram Bot WebApp
 */
export function getTelegramUser(): {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
} | null {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }
  return null;
}

/**
 * Initializes Telegram WebApp settings: expands viewport, sets theme colors
 */
export function initTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      // Set header color and background to match our dark premium theme
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#0f1115');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#0f1115');
      }
      // Enable closing confirmation to prevent accidental closing during checkout
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.warn('Telegram WebApp init error:', e);
    }
  }
}

/**
 * Triggers Telegram Haptic Feedback on button clicks or checkout events
 */
export function triggerTelegramHaptic(
  type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning' = 'light'
): void {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      if (type === 'error' || type === 'success' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    } catch {
      // Haptics unavailable on some platforms
    }
  }
}

/**
 * Safely opens Telegram links (handles Telegram WebApp openTelegramLink vs window.open)
 */
export function openTelegramLink(url: string): void {
  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink && url.includes('t.me')) {
    tg.openTelegramLink(url);
  } else if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}

/**
 * Sends order data back to Telegram bot if WebApp was opened via keyboard button
 */
export function sendTelegramData(data: string | object): boolean {
  const tg = getTelegramWebApp();
  if (tg?.sendData) {
    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      tg.sendData(payload);
      return true;
    } catch (err) {
      console.warn('sendData error:', err);
    }
  }
  return false;
}

/**
 * Formats an order into a clean, easy-to-read text message for Telegram
 */
export function formatOrderForTelegram(order: Order): string {
  const dateStr = new Date(order.createdAt).toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deliveryTypeLabel =
    order.deliveryType === 'delivery'
      ? '🛵 Yetkazib berish (30 daqiqa)'
      : '🏬 Restorandan olib ketish (-10%)';

  const paymentLabel =
    order.paymentMethod === 'cash'
      ? '💵 Naqd pul'
      : order.paymentMethod === 'click'
      ? '🔹 Click orqali'
      : order.paymentMethod === 'payme'
      ? '🟢 Payme orqali'
      : '💳 Plastik karta';

  const itemsList = order.items
    .map((item, index) => {
      const name = item.menuItem?.name || item.name || 'Taom';
      const sizeStr = item.size || item.selectedSize ? ` (${item.size || item.selectedSize})` : '';
      const price = item.price || item.unitPrice || 0;
      const totalItemPrice = price * item.quantity;
      return `${index + 1}. <b>${item.quantity}x ${name}</b>${sizeStr} — ${formatPrice(totalItemPrice)}`;
    })
    .join('\n');

  const gpsInfoHtml = order.gpsCoordinates
    ? `\n🧭 <b>GPS:</b> <code>${order.gpsCoordinates.lat.toFixed(6)}, ${order.gpsCoordinates.lng.toFixed(6)}</code>\n🚗 <b>Yandex Navigator (Kur'er marshruti):</b> <a href="${order.yandexNaviUrl || `https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~${order.gpsCoordinates.lat}%2C${order.gpsCoordinates.lng}&rtt=auto&ruri=~&z=16`}">Navigatorda ochish</a>\n🗺 <b>Yandex Xarita:</b> <a href="${order.yandexMapsUrl || `https://yandex.uz/maps/10336/fergana/?ll=${order.gpsCoordinates.lng}%2C${order.gpsCoordinates.lat}&z=16&pt=${order.gpsCoordinates.lng},${order.gpsCoordinates.lat},pm2rdm`}">Xaritada ko'rish</a>`
    : '';

  const text = `🍕 <b>YANGI BUYURTMA #${order.id}</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> ${order.customerName}
📞 <b>Telefon:</b> ${order.phone}
📍 <b>Manzil / Filial:</b> ${order.address}${gpsInfoHtml}
🚚 <b>Turi:</b> ${deliveryTypeLabel}
💳 <b>To'lov:</b> ${paymentLabel}
⏰ <b>Sana:</b> ${dateStr}

📋 <b>Taomlar ro'yxati:</b>
${itemsList}
━━━━━━━━━━━━━━━━━━
💰 <b>Taomlar summasi:</b> ${formatPrice(order.subtotal)}
🛵 <b>Yetkazib berish:</b> ${order.deliveryFee === 0 ? 'Tekin' : formatPrice(order.deliveryFee)}
${order.discount > 0 ? `🎁 <b>Chegirma:</b> -${formatPrice(order.discount)} ${order.promoCode ? `(${order.promoCode})` : ''}\n` : ''}💵 <b>JAMI TO'LOV:</b> <b>${formatPrice(order.total)}</b>
${order.notes ? `\n📝 <b>Mijoz izohi:</b> <i>${order.notes}</i>\n` : ''}
📍 <b>Restoran:</b> ${RESTAURANT_NAME}
📞 <b>Bog'lanish:</b> ${RESTAURANT_PHONE_FORMATTED}
💬 <b>Admin Telegram:</b> @${TELEGRAM_ADMIN_USERNAME}`;

  return text;
}

/**
 * Returns plain text version for standard URI encoding (without HTML tags)
 */
export function formatOrderForTelegramPlain(order: Order): string {
  const dateStr = new Date(order.createdAt).toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deliveryTypeLabel =
    order.deliveryType === 'delivery'
      ? '🛵 Yetkazib berish (30 daqiqa)'
      : '🏬 Restorandan olib ketish (-10%)';

  const paymentLabel =
    order.paymentMethod === 'cash'
      ? '💵 Naqd pul'
      : order.paymentMethod === 'click'
      ? '🔹 Click'
      : order.paymentMethod === 'payme'
      ? '🟢 Payme'
      : '💳 Karta';

  const itemsList = order.items
    .map((item, index) => {
      const name = item.menuItem?.name || item.name || 'Taom';
      const sizeStr = item.size || item.selectedSize ? ` (${item.size || item.selectedSize})` : '';
      const price = item.price || item.unitPrice || 0;
      const totalItemPrice = price * item.quantity;
      return `${index + 1}. ${item.quantity}x ${name}${sizeStr} — ${formatPrice(totalItemPrice)}`;
    })
    .join('\n');

  const gpsInfoPlain = order.gpsCoordinates
    ? `\n🧭 GPS: ${order.gpsCoordinates.lat.toFixed(6)}, ${order.gpsCoordinates.lng.toFixed(6)}\n🚗 Yandex Navigator: ${order.yandexNaviUrl || `https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~${order.gpsCoordinates.lat}%2C${order.gpsCoordinates.lng}&rtt=auto&ruri=~&z=16`}\n🗺 Yandex Xarita: ${order.yandexMapsUrl || `https://yandex.uz/maps/10336/fergana/?ll=${order.gpsCoordinates.lng}%2C${order.gpsCoordinates.lat}&z=16&pt=${order.gpsCoordinates.lng},${order.gpsCoordinates.lat},pm2rdm`}`
    : '';

  return `🍕 YANGI BUYURTMA #${order.id}
━━━━━━━━━━━━━━━━━━
👤 Mijoz: ${order.customerName}
📞 Telefon: ${order.phone}
📍 Manzil: ${order.address}${gpsInfoPlain}
🚚 Turi: ${deliveryTypeLabel}
💳 To'lov: ${paymentLabel}
⏰ Sana: ${dateStr}

📋 Taomlar:
${itemsList}
━━━━━━━━━━━━━━━━━━
💰 Taomlar summasi: ${formatPrice(order.subtotal)}
🛵 Yetkazish: ${order.deliveryFee === 0 ? 'Tekin' : formatPrice(order.deliveryFee)}
${order.discount > 0 ? `🎁 Chegirma: -${formatPrice(order.discount)} ${order.promoCode ? `(${order.promoCode})` : ''}\n` : ''}💵 JAMI TO'LOV: ${formatPrice(order.total)}
${order.notes ? `\n📝 Izoh: ${order.notes}\n` : ''}
📍 Restoran: ${RESTAURANT_NAME}
📞 Tel: ${RESTAURANT_PHONE_FORMATTED}
💬 Telegram: @${TELEGRAM_ADMIN_USERNAME}`;
}

/**
 * Generates direct t.me link pre-filled with the order text for @qahhorvch
 */
export function getTelegramOrderUrl(order: Order, username: string = TELEGRAM_ADMIN_USERNAME): string {
  const plainText = formatOrderForTelegramPlain(order);
  return `https://t.me/${username}?text=${encodeURIComponent(plainText)}`;
}

/**
 * Copies text to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Clipboard copy error:', err);
    return false;
  }
}
