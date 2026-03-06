import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchExchangeRates } from '../utils/exchangeRates'
import { CURRENCIES, getCurrencySymbol, formatCurrency } from '../utils/formatCurrency'
import { HiSwitchHorizontal, HiRefresh } from 'react-icons/hi'
import toast from 'react-hot-toast'

const POPULAR_PAIRS = [
  ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'JPY'], ['USD', 'BDT'],
  ['EUR', 'GBP'], ['GBP', 'INR'], ['USD', 'INR'], ['USD', 'CAD'],
]

export default function CurrencyConverter() {
  const { profile } = useAuth()
  const baseCurrency = profile?.currency ?? 'BDT'

  const [amount, setAmount]     = useState('1')
  const [from, setFrom]         = useState(baseCurrency)
  const [to, setTo]             = useState(from === 'USD' ? 'EUR' : 'USD')
  const [rates, setRates]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function loadRates() {
    setLoading(true)
    try {
      const r = await fetchExchangeRates()
      setRates(r)
      setLastUpdated(new Date())
    } catch {
      toast.error('Failed to load exchange rates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRates() }, [])

  function convert(amt, fromCur, toCur) {
    if (!rates || !amt) return 0
    const fromRate = rates[fromCur] ?? 1
    const toRate   = rates[toCur] ?? 1
    return (Number(amt) / fromRate) * toRate
  }

  function swap() {
    setFrom(to)
    setTo(from)
  }

  const converted = convert(amount, from, to)
  const rate      = convert(1, from, to)

  // All currencies equivalents for the entered amount
  const allEquivalents = CURRENCIES
    .filter(c => c !== from)
    .map(c => ({ code: c, symbol: getCurrencySymbol(c), value: convert(amount, from, c) }))

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-xl sm:text-2xl font-extrabold">Currency Converter</h1>

      {/* Converter card */}
      <div className="card space-y-5">
        {/* Amount input */}
        <div>
          <label className="label">Amount</label>
          <input
            className="input text-2xl font-bold"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {/* From / Swap / To row */}
        <div className="flex items-end gap-2 sm:gap-4">
          {/* From */}
          <div className="flex-1">
            <label className="label">From</label>
            <select className="input font-semibold" value={from} onChange={e => setFrom(e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{getCurrencySymbol(c)} {c}</option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <button
            onClick={swap}
            className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition active:scale-90 shrink-0 mb-0.5"
            title="Swap currencies"
          >
            <HiSwitchHorizontal className="w-5 h-5" />
          </button>

          {/* To */}
          <div className="flex-1">
            <label className="label">To</label>
            <select className="input font-semibold" value={to} onChange={e => setTo(e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{getCurrencySymbol(c)} {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 border border-primary-100 dark:border-primary-800/30 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-400 mb-1">
              {getCurrencySymbol(from)} {Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {from} =
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400">
              {getCurrencySymbol(to)}{converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              1 {from} = {rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} {to}
            </p>
          </div>
        )}

        {/* Last updated + refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading rates…'}
          </p>
          <button onClick={() => {
            localStorage.removeItem('moneymind_exchange_rates')
            loadRates()
            toast.success('Rates refreshed!')
          }}
            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition">
            <HiRefresh className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Quick pairs */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Convert</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_PAIRS.map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => { setFrom(a); setTo(b) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border
                ${from === a && to === b
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
            >
              {getCurrencySymbol(a)} {a} → {getCurrencySymbol(b)} {b}
            </button>
          ))}
        </div>
      </div>

      {/* All currency equivalents */}
      {!loading && amount && Number(amount) > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {getCurrencySymbol(from)}{Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {from} in other currencies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allEquivalents.map(eq => (
              <div
                key={eq.code}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition
                  ${eq.code === to
                    ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                onClick={() => setTo(eq.code)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold w-8 text-center">{eq.symbol}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{eq.code}</span>
                </div>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
                  {eq.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
