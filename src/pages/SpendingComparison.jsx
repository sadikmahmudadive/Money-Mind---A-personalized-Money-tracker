import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { getCategoryMeta } from '../utils/categories'
import { format, subMonths } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function monthLabel(date) { return format(date, 'yyyy-MM') }

export default function SpendingComparison() {
  const { transactions } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => monthLabel(subMonths(now, 5 - i)))
  const [monthA, setMonthA] = useState(months[months.length - 2] ?? months[0])
  const [monthB, setMonthB] = useState(months[months.length - 1] ?? months[0])

  const getTxForMonth = (ym) => transactions.filter(t => {
    const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
    return format(d, 'yyyy-MM') === ym
  })

  const dataA = useMemo(() => getTxForMonth(monthA), [transactions, monthA])
  const dataB = useMemo(() => getTxForMonth(monthB), [transactions, monthB])

  const incomeA = dataA.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const incomeB = dataB.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenseA = dataA.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const expenseB = dataB.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Category comparison
  const categories = useMemo(() => {
    const catSet = new Set()
    ;[...dataA, ...dataB].filter(t => t.type === 'expense').forEach(t => catSet.add(t.category))
    return [...catSet].map(cat => {
      const amtA = dataA.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0)
      const amtB = dataB.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0)
      return { category: cat, ...getCategoryMeta(cat), monthA: amtA, monthB: amtB, diff: amtB - amtA }
    }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
  }, [dataA, dataB])

  const chartData = [
    { name: 'Income', [monthA]: incomeA, [monthB]: incomeB },
    { name: 'Expenses', [monthA]: expenseA, [monthB]: expenseB },
    { name: 'Net', [monthA]: incomeA - expenseA, [monthB]: incomeB - expenseB },
  ]

  const pctChange = (a, b) => {
    if (a === 0) return b > 0 ? '+100%' : '—'
    const pct = ((b - a) / a * 100).toFixed(0)
    return pct > 0 ? `+${pct}%` : `${pct}%`
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-xl sm:text-2xl font-extrabold">Spending Comparison</h1>

      {/* Month selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="label">Month A</label>
          <select className="input" value={monthA} onChange={e => setMonthA(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{format(new Date(m + '-01'), 'MMMM yyyy')}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-2 text-gray-400 font-bold">vs</div>
        <div className="flex-1">
          <label className="label">Month B</label>
          <select className="input" value={monthB} onChange={e => setMonthB(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{format(new Date(m + '-01'), 'MMMM yyyy')}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-4">
          <p className="text-xs text-gray-400 mb-1">Income Change</p>
          <p className={`text-lg font-bold ${incomeB >= incomeA ? 'text-emerald-600' : 'text-red-500'}`}>
            {pctChange(incomeA, incomeB)}
          </p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-gray-400 mb-1">Expense Change</p>
          <p className={`text-lg font-bold ${expenseB <= expenseA ? 'text-emerald-600' : 'text-red-500'}`}>
            {pctChange(expenseA, expenseB)}
          </p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-gray-400 mb-1">Savings Change</p>
          <p className={`text-lg font-bold ${(incomeB - expenseB) >= (incomeA - expenseA) ? 'text-emerald-600' : 'text-red-500'}`}>
            {pctChange(incomeA - expenseA, incomeB - expenseB)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Overview</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => formatCurrency(v, currency)} />
              <Legend />
              <Bar dataKey={monthA} fill="#6366f1" radius={[4, 4, 0, 0]} name={format(new Date(monthA + '-01'), 'MMM yyyy')} />
              <Bar dataKey={monthB} fill="#10b981" radius={[4, 4, 0, 0]} name={format(new Date(monthB + '-01'), 'MMM yyyy')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card">
        <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Category Comparison</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No expense data for selected months</p>
        ) : (
          <div className="space-y-3">
            {categories.map(c => (
              <div key={c.category} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium truncate">{c.category}</span>
                    <span className={`text-xs font-bold ${c.diff > 0 ? 'text-red-500' : c.diff < 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {c.diff > 0 ? '↑' : c.diff < 0 ? '↓' : '='} {formatCurrency(Math.abs(c.diff), currency)}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>{format(new Date(monthA + '-01'), 'MMM')}: {formatCurrency(c.monthA, currency)}</span>
                    <span>→</span>
                    <span>{format(new Date(monthB + '-01'), 'MMM')}: {formatCurrency(c.monthB, currency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
