import { useState, useEffect } from 'react'
import { useRecurring } from '../hooks/useRecurring'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiTrash, HiRefresh, HiPlus, HiX, HiBell, HiBellSlash } from 'react-icons/hi'
import { useNotifications } from '../hooks/useNotifications'

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)
const ordinal = d => d + (d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th')

export default function Recurring() {
  const { recurring, loading, addRecurring, deleteRecurring, toggleActive, autoApply, getDueSoon } = useRecurring()
  const { addTransaction } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'
  const { supported: notifSupported, permission: notifPerm, requestPermission } = useNotifications()

  const [showForm, setShowForm] = useState(false)
  const [type, setType]         = useState('expense')
  const [title, setTitle]       = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCat]      = useState('Food')
  const [dueDay, setDueDay]     = useState(1)
  const [notes, setNotes]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [applying, setApplying] = useState(false)

  // Auto-apply on mount
  useEffect(() => {
    if (!loading && recurring.length > 0) {
      autoApply(addTransaction)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const cats =
    type === 'expense'
      ? CATEGORIES.filter(c => c.type === 'expense')
      : CATEGORIES.filter(c => c.type === 'income')

  function resetForm() {
    setTitle(''); setAmount(''); setNotes(''); setDueDay(1); setType('expense'); setCat('Food')
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setBusy(true)
    try {
      await addRecurring({ type, title: title.trim() || category, amount, category, dueDay: Number(dueDay), notes })
      toast.success('Recurring transaction saved!')
      setShowForm(false)
      resetForm()
    } catch (err) {
      toast.error(err.message ?? 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  async function handleApplyNow() {
    setApplying(true)
    try {
      await autoApply(addTransaction)
    } finally {
      setApplying(false)
    }
  }

  const dueSoon = getDueSoon(7)

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
          <h1 className="text-xl sm:text-2xl font-extrabold">Recurring</h1>
          <p className="text-sm text-gray-400 mt-0.5">Monthly bills &amp; salary, auto-added each month</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleApplyNow} disabled={applying}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">
            <HiRefresh className={`w-4 h-4 ${applying ? 'animate-spin' : ''}`} />
            Apply Now
          </button>
          <button onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 text-sm">
            <HiPlus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Due soon banner */}
      {dueSoon.length > 0 && (
        <div className="card border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3">
          <HiBell className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Due in the next 7 days</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {dueSoon.map(r => `${r.title} (${ordinal(r.dueDay)})`).join(' · ')}
            </p>
          </div>
          {notifSupported && notifPerm !== 'granted' && (
            <button onClick={async () => {
              const result = await requestPermission()
              if (result === 'granted') toast.success('Notifications enabled!')
              else toast.error('Notification permission denied')
            }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-amber-300 dark:hover:bg-amber-700 transition shrink-0">
              <HiBell className="w-3 h-3" /> Enable Alerts
            </button>
          )}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg">New Recurring Transaction</h2>
              <button onClick={() => { setShowForm(false); resetForm() }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {/* Type */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
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

              <div>
                <label className="label">Title</label>
                <input className="input" placeholder="e.g. House Rent, Salary"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="label">Amount ({currency})</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>

              <div>
                <label className="label">Category</label>
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                  {cats.map(c => (
                    <button key={c.name} type="button" onClick={() => setCat(c.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium border transition-all
                        ${category === c.name
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                      <span className="text-xl">{c.icon}</span>
                      <span className="truncate w-full text-center">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Due Day of Month</label>
                <select className="input" value={dueDay} onChange={e => setDueDay(e.target.value)}>
                  {DAYS.map(d => (
                    <option key={d} value={d}>{ordinal(d)} of each month</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <input className="input" placeholder="e.g. Landlord's account"
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button type="submit" disabled={busy}
                className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-60">
                {busy ? 'Saving…' : 'Add Recurring'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {!recurring.length ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-4">🔄</span>
          <p className="font-semibold text-gray-600 dark:text-gray-400">No recurring transactions yet</p>
          <p className="text-sm mt-1">Add your monthly salary, rent, subscriptions…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map(r => {
            const cat = getCategoryMeta(r.category)
            return (
              <div key={r.id}
                className={`card flex items-center gap-3 sm:gap-4 transition-all ${!r.active ? 'opacity-50' : ''}`}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{ background: cat.color + '22' }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.title}</p>
                  <p className="text-xs text-gray-400">
                    {cat.name} · Due {ordinal(r.dueDay ?? 1)} monthly
                  </p>
                  <p className={`sm:hidden font-bold text-xs mt-0.5 ${r.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount, currency)}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className={`font-bold text-sm ${r.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount, currency)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.lastApplied ? `Applied ${r.lastApplied}` : 'Not yet applied'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(r.id, !r.active)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition
                      ${r.active
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                      }`}>
                    {r.active ? 'Active' : 'Paused'}
                  </button>
                  <button onClick={() => deleteRecurring(r.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-xl transition">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info card */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">💡 How it works</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Active recurring transactions are automatically added once per month on their due date.
          This happens when you open the app. Use "Apply Now" to force-apply immediately.
        </p>
      </div>
    </div>
  )
}
