import { useState } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import BudgetCard from '../components/BudgetCard'
import { CATEGORIES } from '../utils/categories'
import { isInMonth } from '../utils/dateHelpers'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { HiPlus } from 'react-icons/hi'

export default function BudgetManager() {
  const { budgets, setBudget, deleteBudget, loading } = useBudgets()
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
    return { ...b, spent }
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Budget Manager</h1>
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

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm">⚠️ Budget Alerts</p>
          {alerts.map(b => (
            <p key={b.category} className="text-xs text-orange-600 dark:text-orange-300">
              {b.category}: {((b.spent / b.limit) * 100).toFixed(0)}% used — only {(b.limit - b.spent).toLocaleString()} left
            </p>
          ))}
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
            <BudgetCard key={b.category} {...b} currency={currency} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
