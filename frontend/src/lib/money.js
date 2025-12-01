const CURRENCY = import.meta.env.VITE_CURRENCY_CODE || 'LKR';
const LOCALE = import.meta.env.VITE_CURRENCY_LOCALE || 'en-LK';

export const formatMoney = (value) => {
  const n = Number(value ?? 0);
  try {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 }).format(n);
  } catch {
    // Fallback: prepend currency code
    return `${CURRENCY} ${n.toFixed(2)}`;
  }
};
