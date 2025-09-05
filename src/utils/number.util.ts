export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatCurrency(amount: number, currency = 'VND'): string {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
}

export function isNumeric(val: any): boolean {
  return !isNaN(parseFloat(val)) && isFinite(val);
}
