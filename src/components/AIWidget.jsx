import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiSparkles, HiArrowRight } from 'react-icons/hi'
import { getSpendingInsights } from '../utils/ai'
import MarkdownText from './MarkdownText'
import toast from 'react-hot-toast'

export default function AIWidget({ transactions, currency = 'BDT' }) {
  const [result,  setResult]  = useState('')
  const [loading, setLoading] = useState(false)
  const apiKeyMissing = !import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'PASTE_YOUR_GROQ_KEY_HERE'

  async function handleGenerate() {
    if (apiKeyMissing) {
      toast.error('Add VITE_GROQ_API_KEY to .env to use AI features')
      return
    }
    setLoading(true)
    try {
      const text = await getSpendingInsights(transactions, currency)
      setResult(text)
    } catch (err) {
      toast.error(err.message ?? 'AI request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border border-primary-100 dark:border-primary-800/40 bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-900 dark:to-primary-900/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <HiSparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">AI Spending Insights</span>
          <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">Groq · Llama 3.3</span>
        </div>
        <Link to="/ai" className="text-xs text-primary-500 flex items-center gap-1 hover:underline">
          Full report <HiArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!result && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary-200 dark:border-primary-800/50 rounded-xl py-5 text-sm text-gray-400 hover:border-primary-400 hover:text-primary-500 dark:hover:border-primary-600 transition disabled:opacity-60"
        >
          {loading
            ? <><span className="w-4 h-4 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" /> Analyzing your finances…</>
            : <><HiSparkles className="w-4 h-4" /> Analyze this month's spending</>
          }
        </button>
      )}

      {result && (
        <div className="animate-fadeIn">
          <MarkdownText text={result} />
          <button onClick={() => { setResult(''); handleGenerate() }}
            className="mt-3 text-xs text-gray-400 hover:text-primary-500 transition flex items-center gap-1">
            🔄 Regenerate
          </button>
        </div>
      )}
    </div>
  )
}
