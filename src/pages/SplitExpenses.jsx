import { useState } from 'react'
import { useSplitExpenses } from '../hooks/useSplitExpenses'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiX, HiCheck, HiUserGroup } from 'react-icons/hi'

export default function SplitExpenses() {
  const { splits, loading, addSplit, deleteSplit, toggleSettled, totalOwed, totalSettled } = useSplitExpenses()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle]       = useState('')
  const [total, setTotal]       = useState('')
  const [friendName, setFriend] = useState('')
  const [friends, setFriends]   = useState([])
  const [splitType, setSplitType] = useState('equal') // equal | custom
  const [busy, setBusy]         = useState(false)

  function addFriend() {
    const name = friendName.trim()
    if (!name) return
    if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Friend already added'); return
    }
    setFriends([...friends, { name, customAmount: '' }])
    setFriend('')
  }

  function removeFriend(idx) {
    setFriends(friends.filter((_, i) => i !== idx))
  }

  function updateCustomAmount(idx, amt) {
    setFriends(friends.map((f, i) => i === idx ? { ...f, customAmount: amt } : f))
  }

  function resetForm() {
    setTitle(''); setTotal(''); setFriend(''); setFriends([]); setSplitType('equal')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!total || Number(total) <= 0) { toast.error('Enter a valid amount'); return }
    if (friends.length === 0) { toast.error('Add at least one friend'); return }

    const totalNum = Number(total)
    const peopleCount = friends.length + 1 // include self

    let friendsData
    if (splitType === 'equal') {
      const perPerson = totalNum / peopleCount
      friendsData = friends.map(f => ({ name: f.name, share: Math.round(perPerson * 100) / 100, settled: false }))
    } else {
      const customTotal = friends.reduce((s, f) => s + (Number(f.customAmount) || 0), 0)
      if (customTotal > totalNum) { toast.error('Custom amounts exceed total'); return }
      friendsData = friends.map(f => ({ name: f.name, share: Number(f.customAmount) || 0, settled: false }))
    }

    setBusy(true)
    try {
      await addSplit({
        title: title.trim() || 'Split Expense',
        totalAmount: totalNum,
        splitType,
        friends: friendsData,
      })
      toast.success('Split created!')
      setShowForm(false)
      resetForm()
    } catch (err) {
      toast.error(err.message ?? 'Failed')
    } finally {
      setBusy(false)
    }
  }

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
          <h1 className="text-xl sm:text-2xl font-extrabold">Split Expenses</h1>
          <p className="text-sm text-gray-400 mt-0.5">Split bills with friends & track who owes what</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" /> New Split
        </button>
      </div>

      {/* Stats */}
      {splits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Owed to You', value: formatCurrency(totalOwed, currency), color: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10', border: 'border-amber-100 dark:border-amber-800/30' },
            { label: 'Settled',           value: formatCurrency(totalSettled, currency), color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10', border: 'border-emerald-100 dark:border-emerald-800/30' },
            { label: 'Active Splits',     value: splits.length, color: 'text-primary-600 dark:text-primary-400', bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10', border: 'border-blue-100 dark:border-blue-800/30' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.bg} border ${s.border} p-4 text-center`}>
              <p className="text-xs text-gray-400 mb-1 font-medium">{s.label}</p>
              <p className={`font-extrabold text-sm sm:text-base truncate ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg">New Split</h2>
              <button onClick={() => { setShowForm(false); resetForm() }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="e.g. Dinner at Dhaka Restaurant"
                  value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div>
                <label className="label">Total Amount ({currency})</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="0.00"
                  value={total} onChange={e => setTotal(e.target.value)} required />
              </div>

              <div>
                <label className="label">Split Type</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {['equal', 'custom'].map(t => (
                    <button key={t} type="button" onClick={() => setSplitType(t)}
                      className={`flex-1 py-2 text-sm font-semibold transition-all
                        ${splitType === t ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500'}`}>
                      {t === 'equal' ? '⚖️ Equal' : '✏️ Custom'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add friends */}
              <div>
                <label className="label">Friends</label>
                <div className="flex gap-2">
                  <input className="input" placeholder="Friend's name"
                    value={friendName} onChange={e => setFriend(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFriend() } }} />
                  <button type="button" onClick={addFriend}
                    className="btn-primary px-3 shrink-0"><HiPlus className="w-4 h-4" /></button>
                </div>

                {friends.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {friends.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium flex-1 truncate">{f.name}</span>
                        {splitType === 'custom' && (
                          <input type="number" min="0" step="0.01" placeholder="Amount"
                            className="input !w-24 text-xs py-1.5"
                            value={f.customAmount}
                            onChange={e => updateCustomAmount(i, e.target.value)} />
                        )}
                        {splitType === 'equal' && total && (
                          <span className="text-xs text-gray-400 font-medium">
                            {formatCurrency(Number(total) / (friends.length + 1), currency)}
                          </span>
                        )}
                        <button type="button" onClick={() => removeFriend(i)}
                          className="p-1 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition">
                          <HiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {splitType === 'equal' && total && (
                      <p className="text-xs text-gray-400 mt-1">
                        Your share: <strong>{formatCurrency(Number(total) / (friends.length + 1), currency)}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" disabled={busy}
                className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-60">
                {busy ? 'Creating…' : 'Create Split'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Splits list */}
      {!splits.length ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-4">👥</span>
          <p className="font-semibold text-gray-600 dark:text-gray-400">No splits yet</p>
          <p className="text-sm mt-1">Split a bill with friends and track payments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {splits.map(split => {
            const allSettled = split.friends.every(f => f.settled)
            const settledCount = split.friends.filter(f => f.settled).length
            return (
              <div key={split.id} className={`card space-y-3 ${allSettled ? 'ring-2 ring-emerald-400' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-lg">
                      <HiUserGroup className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{split.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Total: {formatCurrency(split.totalAmount, currency)} · {split.splitType === 'equal' ? 'Equal split' : 'Custom split'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      allSettled
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                      {allSettled ? '✓ All Settled' : `${settledCount}/${split.friends.length} Settled`}
                    </span>
                    <button onClick={() => deleteSplit(split.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 rounded-xl transition">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Friends list */}
                <div className="space-y-1.5">
                  {split.friends.map(f => (
                    <div key={f.name}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                        f.settled ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-gray-50 dark:bg-gray-800/60'
                      }`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {f.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium flex-1 truncate ${f.settled ? 'line-through text-gray-400' : ''}`}>
                        {f.name}
                      </span>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                        {formatCurrency(f.share, currency)}
                      </span>
                      <button
                        onClick={() => toggleSettled(split.id, f.name, !f.settled)}
                        className={`p-1.5 rounded-lg transition text-xs font-semibold ${
                          f.settled
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-primary-100 hover:text-primary-600'
                        }`}>
                        <HiCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {split.createdAt?.toDate && (
                  <p className="text-[11px] text-gray-400">
                    Created {format(split.createdAt.toDate(), 'dd MMM yyyy')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
