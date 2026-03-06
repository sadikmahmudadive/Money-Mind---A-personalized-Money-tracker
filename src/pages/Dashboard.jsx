import { Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgets } from '../hooks/useBudgets'
import { useRecurring } from '../hooks/useRecurring'
import { useAuth } from '../context/AuthContext'
import BalanceCard from '../components/BalanceCard'
import MonthlyChart from '../components/MonthlyChart'
import CategoryPie from '../components/CategoryPie'
import TransactionList from '../components/TransactionList'
import BudgetCard from '../components/BudgetCard'
import AIWidget from '../components/AIWidget'
import { HiPlus, HiArrowRight, HiBell, HiExclamation, HiStar, HiChevronUp, HiChevronDown, HiViewGrid } from 'react-icons/hi'
import { useNotifications } from '../hooks/useNotifications'
import { getCategoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/formatCurrency'
import { isInMonth } from '../utils/dateHelpers'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { transactions, loading, deleteTransaction, updateTransaction, totalIncome, totalExpense, balance, addTransaction } = useTransactions()
  const { budgets } = useBudgets()
  const { recurring, getDueSoon, autoApply } = useRecurring()
  const { permission, requestPermission, scheduleBillReminders } = useNotifications()
  const currency = profile?.currency ?? 'BDT'
  const currentMonth = format(new Date(), 'yyyy-MM')

  // Auto-apply recurring on mount
  useEffect(() => {
    if (!loading && recurring.length > 0) {
      autoApply(addTransaction)
      scheduleBillReminders(recurring, getDueSoon)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // This month only
  const thisMonthTx = transactions.filter(t => isInMonth(t.date, currentMonth))

  // Top expense categories this month
  const catTotals = thisMonthTx
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc }, {})
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Budget spent sync
  const budgetsWithSpent = budgets.map(b => {
    const spent = thisMonthTx.filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((s, t) => s + t.amount, 0)
    return { ...b, spent }
  })

  // Bills due in next 7 days
  const dueSoon = getDueSoon(7)

  // Pinned transactions
  const pinnedTx = transactions.filter(t => t.pinned)

  // Over-budget warnings
  const overBudget = budgetsWithSpent.filter(b => b.limit > 0 && b.spent / b.limit >= 0.8)

  // Spending alert toasts (fire once per session)
  useEffect(() => {
    overBudget.forEach(b => {
      const pct = Math.round((b.spent / b.limit) * 100)
      if (pct >= 100) {
        toast.error(`⚠️ ${b.category} budget exceeded (${pct}%)`, { id: `budget-${b.category}` })
      } else {
        toast(`🔔 ${b.category} at ${pct}% of budget`, { id: `budget-warn-${b.category}` })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets.length, thisMonthTx.length])

  // Widget reorder state
  const DEFAULT_ORDER = ['alerts', 'bills', 'pinned', 'charts', 'topSpends', 'budgets', 'ai', 'recent']
  const [widgetOrder, setWidgetOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dashboard_widget_order')) ?? DEFAULT_ORDER }
    catch { return DEFAULT_ORDER }
  })
  const [editLayout, setEditLayout] = useState(false)

  const moveWidget = useCallback((key, dir) => {
    setWidgetOrder(prev => {
      const idx = prev.indexOf(key)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      localStorage.setItem('dashboard_widget_order', JSON.stringify(next))
      return next
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {getGreeting()}, {profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here&apos;s your {format(new Date(), 'MMMM yyyy')} overview
          </p>
        </div>
        <Link to="/add" className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" /> Add
        </Link>
        <button onClick={() => setEditLayout(e => !e)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition ${editLayout ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <HiViewGrid className="w-4 h-4" /> {editLayout ? 'Done' : 'Layout'}
        </button>
      </div>

      {/* Balance — always first */}
      <BalanceCard balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} currency={currency} />

      {/* Reorderable widgets */}
      {widgetOrder.map((key, idx) => {
        const WrapEdit = ({ children, label }) => editLayout ? (
          <div className="relative ring-2 ring-primary-300 dark:ring-primary-700 ring-offset-2 dark:ring-offset-gray-900 rounded-2xl">
            <div className="absolute -top-3 left-3 flex items-center gap-1 z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-500 text-white px-2 py-0.5 rounded-full">{label}</span>
              <button onClick={() => moveWidget(key, -1)} disabled={idx === 0}
                className="p-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <HiChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => moveWidget(key, 1)} disabled={idx === widgetOrder.length - 1}
                className="p-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <HiChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {children}
          </div>
        ) : children

        switch (key) {
          case 'alerts':
            if (overBudget.length === 0) return null
            return (
              <WrapEdit key={key} label="Alerts">
                <div className="card border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <HiExclamation className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Budget Alerts</p>
                  </div>
                  {overBudget.map(b => {
                    const pct = Math.round((b.spent / b.limit) * 100)
                    return (
                      <div key={b.category} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-red-600 dark:text-red-400 font-medium truncate">{b.category}</span>
                        <span className={`font-bold shrink-0 ${pct >= 100 ? 'text-red-600' : 'text-amber-600'}`}>
                          {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)} ({pct}%)
                        </span>
                      </div>
                    )
                  })}
                  <Link to="/budgets" className="text-xs text-red-500 hover:underline">Manage budgets →</Link>
                </div>
              </WrapEdit>
            )

          case 'bills':
            if (dueSoon.length === 0) return null
            return (
              <WrapEdit key={key} label="Bills">
                <div className="card border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3">
                  <HiBell className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Bills due in the next 7 days</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dueSoon.map(r => (
                        <span key={r.id}
                          className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                          {r.title} — {r.dueDay}{r.dueDay === 1 ? 'st' : r.dueDay === 2 ? 'nd' : r.dueDay === 3 ? 'rd' : 'th'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to="/recurring" className="text-xs text-amber-600 hover:underline shrink-0">View all</Link>
                </div>
              </WrapEdit>
            )

          case 'pinned':
            if (pinnedTx.length === 0) return null
            return (
              <WrapEdit key={key} label="Pinned">
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <HiStar className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pinned Transactions</h3>
                  </div>
                  <TransactionList
                    transactions={pinnedTx}
                    onDelete={deleteTransaction}
                    onTogglePin={(id, pinned) => updateTransaction(id, { pinned })}
                    currency={currency}
                  />
                </div>
              </WrapEdit>
            )

          case 'charts':
            return (
              <WrapEdit key={key} label="Charts">
                <div className="grid md:grid-cols-2 gap-6">
                  <MonthlyChart transactions={transactions} />
                  <CategoryPie transactions={thisMonthTx} title="This Month's Spending" />
                </div>
              </WrapEdit>
            )

          case 'topSpends':
            if (topCats.length === 0) return null
            return (
              <WrapEdit key={key} label="Top Spends">
                <div className="card">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">🔥 Top Spends This Month</h3>
                  <div className="space-y-3">
                    {topCats.map(([cat, amt]) => {
                      const { icon, color } = getCategoryMeta(cat)
                      const total = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                      const pct   = total > 0 ? (amt / total) * 100 : 0
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                            style={{ background: color + '22' }}>{icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{cat}</span>
                              <span className="text-gray-500">{formatCurrency(amt, currency)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: color }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </WrapEdit>
            )

          case 'budgets':
            if (budgetsWithSpent.length === 0) return null
            return (
              <WrapEdit key={key} label="Budgets">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Budget Status</h3>
                    <Link to="/budgets" className="text-xs text-primary-500 flex items-center gap-1">
                      View all <HiArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgetsWithSpent.slice(0, 3).map(b => (
                      <BudgetCard key={b.category} {...b} currency={currency} />
                    ))}
                  </div>
                </div>
              </WrapEdit>
            )

          case 'ai':
            return (
              <WrapEdit key={key} label="AI">
                <AIWidget transactions={thisMonthTx} currency={currency} />
              </WrapEdit>
            )

          case 'recent':
            return (
              <WrapEdit key={key} label="Recent">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Recent Transactions</h3>
                    <Link to="/transactions" className="text-xs text-primary-500 flex items-center gap-1">
                      View all <HiArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <TransactionList
                    transactions={transactions}
                    onDelete={deleteTransaction}
                    currency={currency}
                    limit={5}
                  />
                </div>
              </WrapEdit>
            )

          default: return null
        }
      })}
    </div>
  )
}
