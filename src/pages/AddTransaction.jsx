import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../utils/categories'
import { uploadToCloudinary } from '../cloudinary'
import { suggestCategory } from '../utils/ai'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { HiX, HiPhotograph, HiSparkles } from 'react-icons/hi'

export default function AddTransaction() {
  const navigate = useNavigate()
  const { addTransaction } = useTransactions()
  const { profile } = useAuth()

  const [type, setType]       = useState('expense')
  const [title, setTitle]     = useState('')
  const [amount, setAmount]   = useState('')
  const [category, setCat]    = useState('Food')
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes]     = useState('')
  const [receipt, setReceipt]       = useState(null)
  const [preview, setPreview]         = useState(null)
  const [busy, setBusy]               = useState(false)
  const [aiSuggesting, setAiSugg]     = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const fileRef                         = useRef()
  const titleTimer                      = useRef(null)

  // Debounced AI category suggestion on title change
  async function handleTitleChange(e) {
    const val = e.target.value
    setTitle(val)
    setAiSuggestion(null)
    clearTimeout(titleTimer.current)
    if (val.trim().length < 3 || !import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'PASTE_YOUR_GROQ_KEY_HERE') return
    titleTimer.current = setTimeout(async () => {
      setAiSugg(true)
      try {
        const suggested = await suggestCategory(val, type)
        if (suggested) setAiSuggestion(suggested)
      } catch (_) { /* silent */ } finally {
        setAiSugg(false)
      }
    }, 800)
  }

  const expenseCategories = CATEGORIES.filter(c => c.type === 'expense')
  const incomeCategories  = CATEGORIES.filter(c => c.type === 'income')
  const cats = type === 'expense' ? expenseCategories : incomeCategories

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('File too large (max 5 MB)'); return }
    setReceipt(f)
    setPreview(URL.createObjectURL(f))
  }

  function removeReceipt() {
    setReceipt(null)
    setPreview(null)
    fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setBusy(true)
    try {
      let receiptURL = ''
      if (receipt) {
        toast.loading('Uploading receipt…', { id: 'upload' })
        receiptURL = await uploadToCloudinary(receipt, 'receipts')
        toast.dismiss('upload')
      }

      await addTransaction({
        type,
        title:      title.trim() || category,
        amount:     Number(amount),
        category,
        date:       Timestamp.fromDate(new Date(date)),
        notes:      notes.trim(),
        receiptURL,
      })
      toast.success('Transaction added!')
      navigate('/transactions')
    } catch (err) {
      toast.error(err.message ?? 'Failed to add transaction')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-fadeIn">
      <h1 className="text-2xl font-extrabold mb-6">Add Transaction</h1>

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
        {['expense', 'income'].map(t => (
          <button key={t} onClick={() => { setType(t); setCat(t === 'expense' ? 'Food' : 'Salary') }}
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
          <div className="relative">
            <input className="input" placeholder="e.g. Weekly Groceries" value={title}
              onChange={handleTitleChange} />
            {aiSuggesting && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-400 border-t-transparent animate-spin inline-block" />
              </span>
            )}
          </div>
          {aiSuggestion && aiSuggestion !== category && (
            <button type="button"
              onClick={() => { setCat(aiSuggestion); setAiSuggestion(null) }}
              className="mt-1.5 flex items-center gap-1.5 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 px-2.5 py-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition">
              <HiSparkles className="w-3 h-3" />
              AI suggests: <strong>{aiSuggestion}</strong> — click to apply
            </button>
          )}
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
              <button key={c.name} type="button"
                onClick={() => setCat(c.name)}
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

        {/* Receipt upload */}
        <div>
          <label className="label">Receipt / Bill Image (optional)</label>
          {preview ? (
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={preview} alt="receipt" className="w-full max-h-48 object-contain bg-gray-50 dark:bg-gray-800" />
              <button type="button" onClick={removeReceipt}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                <HiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current.click()}
              className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition">
              <HiPhotograph className="w-7 h-7" />
              <span className="text-sm">Click to upload receipt</span>
              <span className="text-xs">PNG, JPG up to 5 MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Submit */}
        <button type="submit" disabled={busy}
          className={`w-full font-semibold py-3 rounded-xl transition-all active:scale-95 text-white
            ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
            disabled:opacity-60`}>
          {busy ? 'Saving…' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </form>
    </div>
  )
}
