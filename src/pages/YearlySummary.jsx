import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { getCategoryMeta } from '../utils/categories'
import { HiChevronLeft, HiChevronRight, HiDownload, HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function YearlySummary() {
  const { transactions } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'
  const [year, setYear] = useState(new Date().getFullYear())

  // Available years
  const years = useMemo(() => {
    const set = new Set(transactions.map(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return d.getFullYear()
    }))
    return Array.from(set).sort().reverse()
  }, [transactions])

  // This year's transactions
  const yearTx = useMemo(() => transactions.filter(t => {
    const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
    return d.getFullYear() === year
  }), [transactions, year])

  // Monthly breakdown
  const monthlyData = useMemo(() => MONTHS.map((name, idx) => {
    const monthTx = yearTx.filter(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return d.getMonth() === idx
    })
    const income  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { name, income, expense, savings: income - expense }
  }), [yearTx])

  // Category breakdown for the year
  const catData = useMemo(() => {
    const map = {}
    yearTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, ...getCategoryMeta(name) }))
  }, [yearTx])

  // Annual totals
  const totalIncome  = yearTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = yearTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalSavings = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0

  // Best & worst months
  const bestMonth  = monthlyData.reduce((best, m) => m.savings > best.savings ? m : best, monthlyData[0])
  const worstMonth = monthlyData.reduce((worst, m) => m.savings < worst.savings ? m : worst, monthlyData[0])
  const highestExpenseMonth = monthlyData.reduce((h, m) => m.expense > h.expense ? m : h, monthlyData[0])

  // Export PDF
  async function exportPDF() {
    try {
      const { default: jsPDF } = await import('jspdf')
      await import('jspdf-autotable')
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text(`Yearly Summary - ${year}`, 14, 22)

      doc.setFontSize(12)
      doc.text(`Total Income: ${formatCurrency(totalIncome, currency)}`, 14, 35)
      doc.text(`Total Expenses: ${formatCurrency(totalExpense, currency)}`, 14, 43)
      doc.text(`Net Savings: ${formatCurrency(totalSavings, currency)}`, 14, 51)
      doc.text(`Savings Rate: ${savingsRate}%`, 14, 59)

      // Monthly table
      doc.autoTable({
        startY: 68,
        head: [['Month', 'Income', 'Expenses', 'Savings']],
        body: monthlyData.map(m => [
          m.name,
          formatCurrency(m.income, currency),
          formatCurrency(m.expense, currency),
          formatCurrency(m.savings, currency),
        ]),
        headStyles: { fillColor: [79, 70, 229] },
      })

      // Category table
      const catY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.text('Expense by Category', 14, catY)
      doc.autoTable({
        startY: catY + 5,
        head: [['Category', 'Amount', '% of Total']],
        body: catData.map(c => [
          c.name,
          formatCurrency(c.value, currency),
          totalExpense > 0 ? ((c.value / totalExpense) * 100).toFixed(1) + '%' : '0%',
        ]),
        headStyles: { fillColor: [79, 70, 229] },
      })

      doc.save(`yearly-summary-${year}.pdf`)
      toast.success('PDF exported!')
    } catch {
      toast.error('Failed to export PDF')
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold">Yearly Summary</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-1">
            <button onClick={() => setYear(y => y - 1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
              <HiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-sm font-bold min-w-[4rem] text-center">{year}</span>
            <button onClick={() => setYear(y => y + 1)} disabled={year >= new Date().getFullYear()}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-30">
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <HiDownload className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {yearTx.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <span className="text-5xl mb-4 block opacity-60">📊</span>
          <p className="font-medium">No transactions found for {year}</p>
          <p className="text-xs mt-1">Add transactions to see your yearly summary</p>
        </div>
      ) : (
        <>
          {/* Annual overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Income', value: totalIncome, color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10', icon: '💰' },
              { label: 'Total Expenses', value: totalExpense, color: 'text-red-500 dark:text-red-400', bg: 'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10', icon: '💸' },
              { label: 'Net Savings', value: totalSavings, color: totalSavings >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400', bg: 'from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10', icon: '🏦' },
              { label: 'Savings Rate', value: null, color: 'text-violet-600 dark:text-violet-400', bg: 'from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10', icon: '📈' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.bg} border border-gray-100 dark:border-gray-800/30 p-4`}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xs text-gray-400 mb-0.5 font-medium">{s.label}</p>
                <p className={`font-extrabold text-base sm:text-lg truncate ${s.color}`}>
                  {s.value !== null ? formatCurrency(s.value, currency) : `${savingsRate}%`}
                </p>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="card flex items-center gap-3">
              <HiTrendingUp className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Best Month</p>
                <p className="font-bold text-sm">{bestMonth.name}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">+{formatCurrency(bestMonth.savings, currency)} saved</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <HiTrendingDown className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Worst Month</p>
                <p className="font-bold text-sm">{worstMonth.name}</p>
                <p className="text-xs text-red-600 dark:text-red-400">{formatCurrency(worstMonth.savings, currency)} net</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <span className="text-3xl shrink-0">🔥</span>
              <div>
                <p className="text-xs text-gray-400">Highest Spending</p>
                <p className="font-bold text-sm">{highestExpenseMonth.name}</p>
                <p className="text-xs text-gray-500">{formatCurrency(highestExpenseMonth.expense, currency)}</p>
              </div>
            </div>
          </div>

          {/* Monthly bar chart */}
          <div className="card">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Income vs Expenses</h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={2}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val, currency)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="card">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Expense by Category</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      outerRadius={80} innerRadius={40}>
                      {catData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category list */}
            <div className="card">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Category Breakdown</h3>
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {catData.map(c => {
                  const pct = totalExpense > 0 ? (c.value / totalExpense) * 100 : 0
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                        style={{ background: c.color + '22' }}>{c.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{c.name}</span>
                          <span className="text-gray-500 text-xs">{formatCurrency(c.value, currency)} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: c.color }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Monthly detail table */}
          <div className="card overflow-x-auto">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium text-right">Income</th>
                  <th className="pb-2 font-medium text-right">Expenses</th>
                  <th className="pb-2 font-medium text-right">Savings</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(m => (
                  <tr key={m.name} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-2.5 font-medium">{m.name}</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(m.income, currency)}</td>
                    <td className="py-2.5 text-right text-red-500">{formatCurrency(m.expense, currency)}</td>
                    <td className={`py-2.5 text-right font-semibold ${m.savings >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600'}`}>
                      {formatCurrency(m.savings, currency)}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold text-sm">
                  <td className="pt-3">Total</td>
                  <td className="pt-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome, currency)}</td>
                  <td className="pt-3 text-right text-red-500">{formatCurrency(totalExpense, currency)}</td>
                  <td className={`pt-3 text-right ${totalSavings >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600'}`}>
                    {formatCurrency(totalSavings, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
