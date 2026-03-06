import { useState, useMemo } from 'react'
import { useSpendingLimits } from '../hooks/useSpendingLimits'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { startOfDay, startOfWeek, isAfter } from 'date-fns'
import toast from 'react-hot-toast'

export default function SpendingLimits() {
  const { limits, setSpendingLimits } = useSpendingLimits()
  const { transactions } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [daily, setDaily] = useState('')
  const [weekly, setWeekly] = useState('')
  const [editing, setEditing] = useState(false)

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 6 }) // Saturday start for BD

  const todaySpent = useMemo(() =>
    transactions.filter(t => {
      if (t.type !== 'expense') return false
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return isAfter(d, todayStart) || d.getTime() === todayStart.getTime()
    }).reduce((s, t) => s + t.amount, 0)
  , [transactions, todayStart])

  const weekSpent = useMemo(() =>
    transactions.filter(t => {
      if (t.type !== 'expense') return false
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return isAfter(d, weekStart) || d.getTime() === weekStart.getTime()
    }).reduce((s, t) => s + t.amount, 0)
  , [transactions, weekStart])

  const dailyPct = limits.daily > 0 ? Math.min((todaySpent / limits.daily) * 100, 100) : 0
  const weeklyPct = limits.weekly > 0 ? Math.min((weekSpent / limits.weekly) * 100, 100) : 0

  function getBarColor(pct) {
    if (pct >= 90) return '#ef4444'
    if (pct >= 70) return '#f59e0b'
    return '#10b981'
  }

  async function handleSave(e) {
    e.preventDefault()
    await setSpendingLimits(daily || limits.daily, weekly || limits.weekly)
    toast.success('Spending limits updated!')
    setEditing(false)
    setDaily(''); setWeekly('')
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-extrabold">Spending Limits</h1>

      {/* Daily limit card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 dark:text-gray-300">📅 Daily Limit</h2>
          {limits.daily > 0 && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              dailyPct >= 90 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
              dailyPct >= 70 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            }`}>
              {dailyPct.toFixed(0)}%
            </span>
          )}
        </div>
        {limits.daily > 0 ? (
          <>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-extrabold">{formatCurrency(todaySpent, currency)}</span>
              <span className="text-sm text-gray-400">of {formatCurrency(limits.daily, currency)}</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyPct}%`, backgroundColor: getBarColor(dailyPct) }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {limits.daily - todaySpent > 0
                ? `${formatCurrency(limits.daily - todaySpent, currency)} remaining today`
                : '⚠️ Daily limit exceeded!'}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No daily limit set</p>
        )}
      </div>

      {/* Weekly limit card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 dark:text-gray-300">📆 Weekly Limit</h2>
          {limits.weekly > 0 && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              weeklyPct >= 90 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
              weeklyPct >= 70 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            }`}>
              {weeklyPct.toFixed(0)}%
            </span>
          )}
        </div>
        {limits.weekly > 0 ? (
          <>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-extrabold">{formatCurrency(weekSpent, currency)}</span>
              <span className="text-sm text-gray-400">of {formatCurrency(limits.weekly, currency)}</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyPct}%`, backgroundColor: getBarColor(weeklyPct) }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {limits.weekly - weekSpent > 0
                ? `${formatCurrency(limits.weekly - weekSpent, currency)} remaining this week`
                : '⚠️ Weekly limit exceeded!'}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No weekly limit set</p>
        )}
      </div>

      {/* Edit limits */}
      <div className="card">
        {!editing ? (
          <button onClick={() => { setEditing(true); setDaily(limits.daily || ''); setWeekly(limits.weekly || '') }}
            className="btn-primary w-full">
            {limits.daily || limits.weekly ? 'Edit Limits' : 'Set Spending Limits'}
          </button>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 animate-fadeIn">
            <h3 className="font-semibold">Configure Limits</h3>
            <div>
              <label className="label">Daily Limit ({currency})</label>
              <input className="input" type="number" min="0" placeholder="e.g. 500" value={daily}
                onChange={e => setDaily(e.target.value)} />
            </div>
            <div>
              <label className="label">Weekly Limit ({currency})</label>
              <input className="input" type="number" min="0" placeholder="e.g. 3000" value={weekly}
                onChange={e => setWeekly(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
