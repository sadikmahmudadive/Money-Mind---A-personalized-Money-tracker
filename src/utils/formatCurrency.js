const CURRENCY_SYMBOLS = {
  BDT: '৳', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$', INR: '₹',
}

export function getCurrencySymbol(code = 'BDT') {
  return CURRENCY_SYMBOLS[code] ?? code
}

/**
 * Formats an amount with the given currency symbol.
 * Uses a simple prefix-symbol approach for consistent rendering across all locales.
 */
export function formatCurrency(amount, code = 'BDT') {
  const sym = CURRENCY_SYMBOLS[code] ?? code
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sym}${formatted}`
}

export const CURRENCIES = Object.keys(CURRENCY_SYMBOLS)
