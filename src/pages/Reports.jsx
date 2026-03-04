import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import CategoryPie from '../components/CategoryPie'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { isInMonth, last6Months } from '../utils/dateHelpers'
import { formatCurrency } from '../utils/formatCurrency'
import { format, subMonths, startOfYear } from 'date-fns'
import { getCategoryMeta } from '../utils/categories'
import toast from 'react-hot-toast'

// PDF / CSV exports
async function exportCSV(transactions, currency) {
  const Papa = (await import('papaparse')).default
  const rows = transactions.map(t => ({
    Date:     t.date?.toDate ? format(t.date.toDate(), 'yyyy-MM-dd') : t.date,
    Title:    t.title,
    Type:     t.type,
    Category: t.category,
    Amount:   t.amount,
    Currency: currency,
    Notes:    t.notes ?? '',
    Receipt:  t.receiptURL ?? '',
  }))
  const csv  = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'transactions.csv'; a.click()
  URL.revokeObjectURL(url)
}

async function exportPDF(transactions, currency) {
  const { jsPDF }       = await import('jspdf')
  const autoTable       = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('MoneyMind — Transaction Report', 14, 18)
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 14, 26)
  autoTable(doc, {
    startY: 32,
    head: [['Date','Title','Type','Category','Amount','Notes']],
    body: transactions.map(t => [
      t.date?.toDate ? format(t.date.toDate(), 'dd MMM yyyy') : t.date,
      t.title, t.type, t.category,
      formatCurrency(t.amount, currency),
      t.notes ?? '',
    ]),
    styles: { fontSize: 8 },
  })
  doc.save('transactions.pdf')
}

export default function Reports() {
  const { transactions, loading } = useTransactions()
  const { profile }               = useAuth()
  const currency = profile?.currency ?? 'BDT'
  const [period, setPeriod]       = useState('6m')   // 6m | 12m | ytd | all
  const [exporting, setExporting] = useState(false)

  const filtered = useMemo(() => {
    const now = new Date()
    if (period === '6m')  return transactions.filter(t => isInMonth(t.date, format(subMonths(now, 5), 'yyyy-MM')) || true)
    if (period === 'ytd') {
      const soy = startOfYear(now)
      return transactions.filter(t => {
        const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
        return d >= soy
      })
    }
    if (period === '12m') {
      const start = subMonths(now, 11)
      return transactions.filter(t => {
        const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
        return d >= start
      })
    }
    return transactions
  }, [transactions, period])

  // Monthly line data
  const months6 = last6Months()
  const lineData = months6.map(({ label, month }) => {
    const inc = transactions.filter(t => t.type === 'income'  && isInMonth(t.date, month)).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t => t.type === 'expense' && isInMonth(t.date, month)).reduce((s,t)=>s+t.amount,0)
    return { name: label, Income: inc, Expenses: exp, Net: inc - exp }
  })

  // Category breakdown
  const catTotals = filtered.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc
  }, {})
  const catList = Object.entries(catTotals).sort((a, b) => b[1] - a[1])

  const totalIncome  = filtered.filter(t => t.type === 'income') .reduce((s,t) => s+t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0)
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0

  async function handleExport(type) {
    setExporting(true)
    try {
      if (type === 'csv') await exportCSV(filtered, currency)
      else               await exportPDF(filtered, currency)
      toast.success(`Exported as ${type.toUpperCase()}`)
    } catch(e) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} disabled={exporting}
            className="btn-secondary text-sm disabled:opacity-60">📥 CSV</button>
          <button onClick={() => handleExport('pdf')} disabled={exporting}
            className="btn-secondary text-sm disabled:opacity-60">📄 PDF</button>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 flex-wrap">
        {[['6m','Last 6 Months'],['12m','Last 12 Months'],['ytd','Year to Date'],['all','All Time']].map(([v,l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition
              ${period === v ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Income',   val: formatCurrency(totalIncome,  currency), color: 'text-emerald-500' },
          { label: 'Total Expenses', val: formatCurrency(totalExpense, currency), color: 'text-red-500'     },
          { label: 'Net Savings',    val: formatCurrency(totalIncome - totalExpense, currency), color: totalIncome >= totalExpense ? 'text-primary-500' : 'text-red-500' },
          { label: 'Savings Rate',   val: `${savingsRate}%`, color: 'text-purple-500' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`font-bold text-lg ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Income vs Expenses Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="Income"   stroke="#10b981" strokeWidth={2} dot={{ r:3 }} />
            <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r:3 }} />
            <Line type="monotone" dataKey="Net"      stroke="#0ea5e9" strokeWidth={2} dot={{ r:3 }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown + pie */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Expense Breakdown</h3>
          {catList.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No expense data</p>
          ) : (
            <ul className="space-y-2">
              {catList.map(([cat, amt]) => {
                const { icon, color } = getCategoryMeta(cat)
                const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0
                return (
                  <li key={cat} className="flex items-center gap-2 text-sm">
                    <span>{icon}</span>
                    <span className="flex-1 truncate">{cat}</span>
                    <span className="text-gray-400 text-xs">{pct.toFixed(1)}%</span>
                    <span className="font-semibold">{formatCurrency(amt, currency)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <CategoryPie transactions={filtered} title="Category Distribution" />
      </div>
    </div>
  )
}
