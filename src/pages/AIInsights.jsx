import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgets } from '../hooks/useBudgets'
import { useAuth } from '../context/AuthContext'
import MarkdownText from '../components/MarkdownText'
import {
  getSpendingInsights,
  getMonthlyComparison,
  getBudgetRisk,
  getSavingsTips,
  getFullReport,
} from '../utils/ai'
import { isInMonth } from '../utils/dateHelpers'
import { format, subMonths } from 'date-fns'
import { HiSparkles, HiRefresh, HiLockClosed } from 'react-icons/hi'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'insights',    label: '📊 Insights',     desc: 'This month\'s key spending patterns'   },
  { id: 'comparison',  label: '📅 Comparison',   desc: 'This month vs last month'              },
  { id: 'budget-risk', label: '🎯 Budget Risk',  desc: 'AI assessment of your budget health'  },
  { id: 'tips',        label: '💡 Saving Tips',  desc: 'Personalized tips for Bangladesh'     },
  { id: 'report',      label: '📄 Full Report',  desc: 'Complete AI financial health report'  },
]

function AICard({ title, desc, onGenerate, result, loading }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60 active:scale-95"
        >
          {loading
            ? <><span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> Thinking…</>
            : <><HiSparkles className="w-3.5 h-3.5" /> Generate</>
          }
        </button>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/10 dark:to-purple-900/10 rounded-xl p-4 border border-primary-100 dark:border-primary-800/30 animate-fadeIn">
          <MarkdownText text={result} />
        </div>
      )}

      {!result && !loading && (
        <div className="flex items-center justify-center py-8 text-gray-300 dark:text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-xs">Click "Generate" to get AI insights</p>
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
            <p className="text-xs text-gray-400">Gemini is analyzing your data…</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIInsights() {
  const { transactions, loading: txLoading } = useTransactions()
  const { budgets, loading: budgetLoading }  = useBudgets()
  const { profile }                          = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [activeTab, setActiveTab] = useState('insights')
  const [results,   setResults]   = useState({})
  const [loadingTab, setLoadingTab] = useState(null)

  const currentMonth = format(new Date(), 'yyyy-MM')
  const lastMonthKey = format(subMonths(new Date(), 1), 'yyyy-MM')

  const thisMonthTx = useMemo(() => transactions.filter(t => isInMonth(t.date, currentMonth)), [transactions, currentMonth])
  const lastMonthTx = useMemo(() => transactions.filter(t => isInMonth(t.date, lastMonthKey)), [transactions, lastMonthKey])

  const budgetsWithSpent = useMemo(() => budgets.map(b => {
    const spent = thisMonthTx.filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((s, t) => s + t.amount, 0)
    return { ...b, spent }
  }), [budgets, thisMonthTx])

  const apiKeyMissing = !import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'PASTE_YOUR_GROQ_KEY_HERE'

  async function generate(tab) {
    setLoadingTab(tab)
    try {
      let result
      if (tab === 'insights')    result = await getSpendingInsights(thisMonthTx, currency)
      if (tab === 'comparison')  result = await getMonthlyComparison(thisMonthTx, lastMonthTx, currency)
      if (tab === 'budget-risk') result = await getBudgetRisk(budgetsWithSpent, thisMonthTx, currency)
      if (tab === 'tips')        result = await getSavingsTips(thisMonthTx, currency)
      if (tab === 'report')      result = await getFullReport(thisMonthTx, budgetsWithSpent, currency)
      setResults(r => ({ ...r, [tab]: result }))
    } catch (err) {
      toast.error(err.message ?? 'AI request failed')
    } finally {
      setLoadingTab(null)
    }
  }

  if (txLoading || budgetLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
          <HiSparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">AI Insights</h1>
          <p className="text-sm text-gray-400">Powered by Groq · Llama 3.3 70B</p>
        </div>
      </div>

      {/* API Key missing warning */}
      {apiKeyMissing && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex gap-3">
          <HiLockClosed className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">Gemini API key required</p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
              Get a free key at{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                className="underline font-semibold">console.groq.com/keys</a>
              {' '}and add <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_GROQ_API_KEY=your_key</code> to your <strong>.env</strong> file, then restart the dev server.
            </p>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <p className="text-2xl font-extrabold text-primary-500">{thisMonthTx.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Transactions this month</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-extrabold text-emerald-500">{budgetsWithSpent.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Active budgets</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-extrabold text-purple-500">5</p>
          <p className="text-xs text-gray-400 mt-0.5">AI features</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition
              ${activeTab === t.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {TABS.map(t => activeTab === t.id && (
        <AICard
          key={t.id}
          title={t.label}
          desc={t.desc}
          onGenerate={() => generate(t.id)}
          result={results[t.id]}
          loading={loadingTab === t.id}
        />
      ))}

      {/* Generate all button */}
      <div className="flex justify-center">
        <button
          disabled={!!loadingTab || apiKeyMissing}
          onClick={async () => {
            for (const t of TABS) {
              setLoadingTab(t.id)
              try {
                let result
                if (t.id === 'insights')    result = await getSpendingInsights(thisMonthTx, currency)
                if (t.id === 'comparison')  result = await getMonthlyComparison(thisMonthTx, lastMonthTx, currency)
                if (t.id === 'budget-risk') result = await getBudgetRisk(budgetsWithSpent, thisMonthTx, currency)
                if (t.id === 'tips')        result = await getSavingsTips(thisMonthTx, currency)
                if (t.id === 'report')      result = await getFullReport(thisMonthTx, budgetsWithSpent, currency)
                setResults(r => ({ ...r, [t.id]: result }))
              } catch (err) {
                toast.error(`${t.label}: ${err.message}`)
              }
            }
            setLoadingTab(null)
            toast.success('All AI insights generated!')
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50 shadow-lg active:scale-95"
        >
          <HiSparkles className="w-4 h-4" />
          {loadingTab ? 'Generating…' : 'Generate All Insights'}
        </button>
      </div>
    </div>
  )
}
