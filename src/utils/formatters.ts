/*
 * Financial Formatters for Indian Currency & Metrics
 * ===================================================
 *
 * Implements standard Indian financial numbering system:
 * - Lakhs (L): 1,00,000 (10^5)
 * - Crores (Cr): 1,00,00,000 (10^7)
 * - Negative preservation: "-₹45.58L" (never hides negative signs)
 */

/**
 * Formats a monetary amount into standard Indian currency shorthand (L, Cr, or commas).
 * Preserves negative values explicitly.
 */
export function formatIndianCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';

  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted = '';
  if (abs >= 10000000) {
    // 1 Crore or more
    formatted = `₹${(abs / 10000000).toFixed(2)}Cr`;
  } else if (abs >= 100000) {
    // 1 Lakh or more
    formatted = `₹${(abs / 100000).toFixed(2)}L`;
  } else if (abs >= 1000) {
    // Thousands
    formatted = `₹${Math.round(abs).toLocaleString('en-IN')}`;
  } else {
    // Under 1,000
    formatted = `₹${Math.round(abs)}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/** Formats a full comma-separated Indian rupee amount, e.g. "₹48,30,000" */
export function formatFullIndianRupees(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const str = `₹${abs.toLocaleString('en-IN')}`;
  return isNegative ? `-${str}` : str;
}

/** Formats a decimal ratio into a percentage string, e.g. 0.6797 -> "68.0%" */
export function formatPercentage(ratio: number, decimals: number = 1): string {
  if (!Number.isFinite(ratio)) return '0.0%';
  return `${(ratio * 100).toFixed(decimals)}%`;
}
