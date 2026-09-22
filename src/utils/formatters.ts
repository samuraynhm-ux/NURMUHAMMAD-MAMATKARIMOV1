export function formatPrice(price: number): string {
  return price.toLocaleString('uz-UZ') + " so'm";
}

export function formatTime(minutes: number): string {
  return `${minutes} daqiqa`;
}
