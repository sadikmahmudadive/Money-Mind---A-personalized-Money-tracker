import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgets } from '../hooks/useBudgets'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { getSpendingInsights } from '../utils/ai'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const GRADE_META = [
  { min: 80, label: 'Excellent', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', emoji: '🏆' },
  { min: 60, label: 'Good',      color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-600 dark:text-blue-400',    emoji: '👍' },
  { min: 40, label: 'Fair',      color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-600 dark:text-amber-400',  emoji: '⚠️' },
  { min: 0,  label: 'Needs Work',color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-500 dark:text-red-400',      emoji: '🔴' },
]

function getGrade(score) {
  return GRADE_META.find(g => score >= g.min) ?? GRADE_META[3]
}

export default function HealthScore() {
  const { transactions } = useTransactions()
  const { budgets } = useBudgets()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [aiTips, setAiTips] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)

  // Calculate scores
  const scores = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    // 1. Savings Rate (0-30 pts) - what % of income is saved
    let savingsRate = income > 0 ? ((income - expense) / income) : 0
    savingsRate = Math.max(0, Math.min(1, savingsRate))
    const savingsScore = Math.round(savingsRate * 30)

    // 2. Budget Adherence (0-25 pts) - how many budgets under limit
    let budgetScore = 25 // default full if no budgets
    if (budgets.length > 0) {
      const underBudget = budgets.filter(b => (b.spent ?? 0) <= (b.limit ?? 0)).length
      budgetScore = Math.round((underBudget / budgets.length) * 25)
    }

    // 3. Income Diversity (0-15 pts) - multiple income categories
    const incomeCategories = new Set(transactions.filter(t => t.type === 'income').map(t => t.category))
    const diversityScore = Math.min(15, incomeCategories.size * 5)

    // 4. Expense Control (0-15 pts) - no single category > 50% of expenses
    let expenseControlScore = 15
    if (expense > 0) {
      const byCategory = {}
      transactions.filter(t => t.type === 'expense').forEach(t => {
        byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount
      })
      const maxPct = Math.max(...Object.values(byCategory).map(v => v / expense))
      if (maxPct > 0.5) expenseControlScore = 5
      else if (maxPct > 0.35) expenseControlScore = 10
    }

    // 5. Consistency (0-15 pts) - has both income and expenses logged
    let consistencyScore = 0
    if (income > 0) consistencyScore += 8
    if (expense > 0) consistencyScore += 4
    if (transactions.length >= 10) consistencyScore += 3

    const total = savingsScore + budgetScore + diversityScore + expenseControlScore + consistencyScore

    return {
      total,
      breakdown: [
        { label: 'Savings Rate', score: savingsScore, max: 30, detail: `${(savingsRate * 100).toFixed(0)}% of income saved` },
        { label: 'Budget Discipline', score: budgetScore, max: 25, detail: budgets.length ? `${budgets.filter(b => b.spent <= b.limit).length}/${budgets.length} under budget` : 'No budgets set' },
        { label: 'Income Diversity', score: diversityScore, max: 15, detail: `${incomeCategories.size} income source(s)` },
        { label: 'Expense Control', score: expenseControlScore, max: 15, detail: 'Category concentration check' },
        { label: 'Tracking Consistency', score: consistencyScore, max: 15, detail: `${transactions.length} transactions logged` },
      ],
      income,
      expense,
    }
  }, [transactions, budgets])

  const grade = getGrade(scores.total)

  const gaugeData = [
    { value: scores.total },
    { value: 100 - scores.total },
  ]

  async function handleGetTips() {
    setLoadingAi(true)
    try {
      const tips = await getSpendingInsights(transactions, currency)
      setAiTips(tips)
    } catch {
      toast.error('Could not get AI tips')
    } finally {
      setLoadingAi(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-xl sm:text-2xl font-extrabold">Financial Health Score</h1>

      {/* Main Score */}
      <div className={`card flex flex-col items-center py-8 ${grade.bg}`}>
        <div className="relative w-40 h-40">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={gaugeData} innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                <Cell fill={grade.color} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black">{scores.total}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>
        <p className={`text-lg font-bold mt-2 ${grade.text}`}>{grade.emoji} {grade.label}</p>
        <p className="text-sm text-gray-500 mt-1">Based on your current month data</p>
      </div>

      {/* Breakdown */}
      <div className="card space-y-4">
        <h2 className="font-bold text-gray-700 dark:text-gray-300">Score Breakdown</h2>
        {scores.breakdown.map(b => {
          const pct = b.max > 0 ? (b.score / b.max) * 100 : 0
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{b.label}</span>
                <span className="text-xs text-gray-400">{b.score}/{b.max}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{b.detail}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-4">
          <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(scores.income, currency)}</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-gray-400 mb-1">Monthly Expenses</p>
          <p className="text-lg font-bold text-red-500">{formatCurrency(scores.expense, currency)}</p>
        </div>
      </div>

      {/* AI Tips */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 dark:text-gray-300">AI Improvement Tips</h2>
          <button onClick={handleGetTips} disabled={loadingAi}
            className="btn-primary text-xs !py-1.5 !px-3 disabled:opacity-50">
            {loadingAi ? 'Analyzing...' : aiTips ? 'Refresh' : 'Get Tips'}
          </button>
        </div>
        {aiTips ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-400">{aiTips}</div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Click "Get Tips" for AI-powered improvement suggestions</p>
        )}
      </div>
    </div>
  )
}
