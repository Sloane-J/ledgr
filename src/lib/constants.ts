// ── APP-WIDE CONSTANTS ──
// Change CURRENCY_SYMBOL here to update it across the entire app

export const CURRENCY_SYMBOL = '₵';
export const TAX_RATE = 0.08; // 8%
export const LOW_STOCK_THRESHOLD = 10;

export const formatCurrency = (value: number): string =>
  `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatShort = (value: number): string => {
  if (value >= 1_000_000) return `${CURRENCY_SYMBOL}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${CURRENCY_SYMBOL}${(value / 1_000).toFixed(1)}k`;
  return `${CURRENCY_SYMBOL}${value.toFixed(0)}`;
};