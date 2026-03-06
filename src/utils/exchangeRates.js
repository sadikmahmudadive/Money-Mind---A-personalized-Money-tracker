// src/utils/exchangeRates.js
// Uses free exchangerate.host API for live currency conversion

const CACHE_KEY = 'moneymind_exchange_rates'
const CACHE_TTL = 3600000 // 1 hour

function getCachedRates() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { rates, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) return null
    return rates
  } catch { return null }
}

function setCachedRates(rates) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }))
}

/**
 * Fetches live exchange rates with USD as base.
 * Returns an object like { USD: 1, BDT: 110.5, EUR: 0.92, ... }
 */
export async function fetchExchangeRates() {
  const cached = getCachedRates()
  if (cached) return cached

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!res.ok) throw new Error('Rate fetch failed')
    const data = await res.json()
    setCachedRates(data.rates)
    return data.rates
  } catch {
    // Fallback hardcoded rates
    const fallback = {
      USD: 1, BDT: 110.5, EUR: 0.92, GBP: 0.79, JPY: 149.5,
      AUD: 1.53, CAD: 1.36, INR: 83.1,
    }
    return fallback
  }
}

/**
 * Convert an amount from one currency to another.
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount
  const rates = await fetchExchangeRates()
  const fromRate = rates[fromCurrency] ?? 1
  const toRate = rates[toCurrency] ?? 1
  return (amount / fromRate) * toRate
}

/**
 * Get the exchange rate between two currencies.
 */
export async function getRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1
  const rates = await fetchExchangeRates()
  const fromRate = rates[fromCurrency] ?? 1
  const toRate = rates[toCurrency] ?? 1
  return toRate / fromRate
}
