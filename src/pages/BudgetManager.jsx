import { useState } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import BudgetCard from '../components/BudgetCard'
import { CATEGORIES } from '../utils/categories'
import { isInMonth } from '../utils/dateHelpers'
import { formatCurrency } from '../utils/formatCurrency'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { HiPlus } from 'react-icons/hi'

export default function BudgetManager() {
  const { budgets, setBudget, deleteBudget, toggleRollover, loading } = useBudgets()
  const { transactions } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'
  const currentMonth = format(new Date(), 'yyyy-MM')

  const [showForm, setShowForm] = useState(false)
  const [selCat,   setSelCat]   = useState('Food')
  const [limit,    setLimit]    = useState('')

  const expenseCats = CATEGORIES.filter(c => c.type === 'expense')
  const existingCats = new Set(budgets.map(b => b.category))

  const availableCats = expenseCats.filter(c => !existingCats.has(c.name))

  // Compute spent for each budget this month
  const budgetsWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category && isInMonth(t.date, currentMonth))
      .reduce((s, t) => s + t.amount, 0)
    const effectiveLimit = b.limit + (b.rollover ? (b.rolloverAmount ?? 0) : 0)
    return { ...b, spent, effectiveLimit }
  })

  // Budget alerts
  const alerts = budgetsWithSpent.filter(b => b.limit > 0 && (b.spent / b.limit) >= 0.8)

  async function handleAdd(e) {
    e.preventDefault()
    if (!limit || Number(limit) <= 0) { toast.error('Enter a valid limit'); return }
    await setBudget(selCat, limit)
    toast.success(`Budget set for ${selCat}`)
    setLimit('')
    setShowForm(false)
  }

  async function handleDelete(category) {
    if (!confirm(`Delete budget for ${category}?`)) return
    await deleteBudget(category)
    toast.success('Budget removed')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  )

  // Overall budget summary
  const totalLimit = budgetsWithSpent.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.spent, 0)
  const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Budget Manager</h1>
          <p className="text-sm text-gray-400 mt-0.5">Set monthly spending limits per category</p>
        </div>
        {availableCats.length > 0 && (
          <button onClick={() => setShowForm(s => !s)}
            className="btn-primary flex items-center gap-2 text-sm">
            <HiPlus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add Budget'}
          </button>
        )}
      </div>

      {/* Overall summary card */}
      {budgetsWithSpent.length > 0 && (
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#7c3aed 100%)' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Monthly Overview</p>
          <div className="flex items-end justify-between mb-3">
            <p className="text-2xl sm:text-3xl font-extrabold">{formatCurrency(totalSpent, currency)}</p>
            <p className="text-white/70 text-sm">of {formatCurrency(totalLimit, currency)}</p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background: overallPct > 85 ? '#ef4444' : overallPct > 65 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
          <p className="text-xs text-white/60 mt-1.5">{overallPct.toFixed(0)}% of total budget used</p>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-4 space-y-2">
          <p className="font-bold text-orange-700 dark:text-orange-400 text-sm flex items-center gap-1.5">⚠️ Budget Alerts</p>
          {alerts.map(b => {
            const pct = ((b.spent / b.limit) * 100).toFixed(0)
            return (
              <div key={b.category} className="flex items-center justify-between text-xs">
                <span className="font-medium text-orange-700 dark:text-orange-300">{b.category}</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  pct >= 100
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                }`}>{pct}% — {formatCurrency(b.limit - b.spent, currency)} left</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Budget Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4 animate-fadeIn">
          <h3 className="font-semibold">New Budget Limit</h3>
          <div>
            <label className="label">Category</label>
            <select className="input" value={selCat} onChange={e => setSelCat(e.target.value)}>
              {availableCats.map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit ({currency})</label>
            <input className="input" type="number" min="1" placeholder="5000" value={limit}
              onChange={e => setLimit(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full">Set Budget</button>
        </form>
      )}

      {/* Budget cards */}
      {budgetsWithSpent.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-3">🎯</span>
          <p className="font-medium">No budgets set yet</p>
          <p className="text-sm mt-1">Click "Add Budget" to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetsWithSpent.map(b => (
            <div key={b.category} className="space-y-2">
              <BudgetCard {...b} currency={currency} onDelete={handleDelete} />
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs">
                <span className="text-gray-500">Rollover unused</span>
                <button
                  onClick={() => toggleRollover(b.category, !b.rollover)}
                  className={`relative w-9 h-5 rounded-full transition ${b.rollover ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${b.rollover ? 'left-4.5' : 'left-0.5'}`} 
                    style={{ left: b.rollover ? '18px' : '2px' }} />
                </button>
              </div>
              {b.rollover && b.rolloverAmount > 0 && (
                <p className="text-xs text-primary-500 px-3">+{formatCurrency(b.rolloverAmount, currency)} rolled over</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
