import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../utils/categories'
import { Timestamp } from 'firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { HiArrowLeft, HiTag, HiX } from 'react-icons/hi'

export default function EditTransaction() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, updateTransaction } = useTransactions()
  const { profile } = useAuth()

  const tx = transactions.find(t => t.id === id)

  const [type, setType]     = useState('expense')
  const [title, setTitle]   = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCat]  = useState('Food')
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes]   = useState('')
  const [tags, setTags]     = useState([])
  const [tagInput, setTagInput] = useState('')
  const [busy, setBusy]     = useState(false)

  useEffect(() => {
    if (!tx) return
    setType(tx.type ?? 'expense')
    setTitle(tx.title ?? '')
    setAmount(String(tx.amount ?? ''))
    setCat(tx.category ?? 'Food')
    setNotes(tx.notes ?? '')
    setTags(tx.tags ?? [])
    const d = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date)
    setDate(format(d, 'yyyy-MM-dd'))
  }, [tx])

  const cats =
    type === 'expense'
      ? CATEGORIES.filter(c => c.type === 'expense')
      : CATEGORIES.filter(c => c.type === 'income')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setBusy(true)
    try {
      await updateTransaction(id, {
        type,
        title:    title.trim() || category,
        amount:   Number(amount),
        category,
        date:     Timestamp.fromDate(new Date(date)),
        notes:    notes.trim(),
        tags: tags.length > 0 ? tags : [],
      })
      toast.success('Transaction updated!')
      navigate('/transactions')
    } catch (err) {
      toast.error(err.message ?? 'Failed to update')
    } finally {
      setBusy(false)
    }
  }

  if (!tx) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <span className="text-4xl">🔍</span>
      <p>Transaction not found.</p>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold">Edit Transaction</h1>
      </div>

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
        {['expense', 'income'].map(t => (
          <button key={t} type="button"
            onClick={() => { setType(t); setCat(t === 'expense' ? 'Food' : 'Salary') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all
              ${type === t
                ? (t === 'income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
            {t === 'expense' ? '💸 Expense' : '💰 Income'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Weekly Groceries"
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount ({profile?.currency ?? 'BDT'})</label>
          <input className="input" type="number" min="0.01" step="0.01" placeholder="0.00"
            value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {cats.map(c => (
              <button key={c.name} type="button" onClick={() => setCat(c.name)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium border transition-all
                  ${category === c.name
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                <span className="text-xl">{c.icon}</span>
                <span className="truncate w-full text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={date}
            onChange={e => setDate(e.target.value)} required />
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input resize-none" rows={2} placeholder="Any extra details…"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags (optional)</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full border border-primary-200 dark:border-primary-700">
                <HiTag className="w-2.5 h-2.5" />{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 transition">
                  <HiX className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <input className="input" placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault()
                const t = tagInput.trim().toLowerCase()
                if (!tags.includes(t)) setTags([...tags, t])
                setTagInput('')
              }
            }} />
        </div>

        {/* Existing receipt */}
        {tx.receiptURL && (
          <div>
            <label className="label">Attached Receipt</label>
            <a href={tx.receiptURL} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary-500 hover:underline">📎 View receipt</a>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold
              hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Cancel
          </button>
          <button type="submit" disabled={busy}
            className={`flex-1 font-semibold py-3 rounded-xl transition-all active:scale-95 text-white
              ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
              disabled:opacity-60`}>
            {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
