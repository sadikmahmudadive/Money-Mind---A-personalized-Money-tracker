import { useState } from 'react'
import { useDebts } from '../hooks/useDebts'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiCash } from 'react-icons/hi'

export default function DebtTracker() {
  const { debts, addDebt, makePayment, deleteDebt } = useDebts()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState('borrowed')
  const [interestRate, setInterestRate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const [payDebtId, setPayDebtId] = useState(null)
  const [payAmount, setPayAmount] = useState('')

  const borrowed = debts.filter(d => d.direction === 'borrowed')
  const lent = debts.filter(d => d.direction === 'lent')
  const totalBorrowed = borrowed.reduce((s, d) => s + (d.amount - (d.paid ?? 0)), 0)
  const totalLent = lent.reduce((s, d) => s + (d.amount - (d.paid ?? 0)), 0)

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || Number(amount) <= 0) { toast.error('Fill in required fields'); return }
    await addDebt({ title: title.trim(), person: person.trim(), amount, direction, interestRate, dueDate, notes })
    toast.success('Debt added!')
    setTitle(''); setPerson(''); setAmount(''); setInterestRate(''); setDueDate(''); setNotes(''); setShowForm(false)
  }

  async function handlePayment(e) {
    e.preventDefault()
    if (Number(payAmount) <= 0) { toast.error('Enter valid amount'); return }
    await makePayment(payDebtId, payAmount)
    toast.success('Payment recorded!')
    setPayAmount(''); setPayDebtId(null)
  }

  async function handleDelete(d) {
    if (!confirm(`Delete debt "${d.title}"?`)) return
    await deleteDebt(d.id)
    toast.success('Debt removed')
  }

  function DebtCard({ d }) {
    const remaining = d.amount - (d.paid ?? 0)
    const pct = d.amount > 0 ? ((d.paid ?? 0) / d.amount) * 100 : 0
    const isComplete = remaining <= 0

    return (
      <div className={`card group ${isComplete ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{d.direction === 'borrowed' ? '🔴' : '🟢'}</span>
            <div>
              <p className="font-bold text-sm truncate">{d.title}</p>
              {d.person && <p className="text-xs text-gray-400">{d.direction === 'borrowed' ? 'From' : 'To'}: {d.person}</p>}
            </div>
          </div>
          <button onClick={() => handleDelete(d)}
            className="btn-icon opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
            <HiTrash className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mb-1.5 text-sm">
          <span className="font-bold">{formatCurrency(d.paid ?? 0, currency)} paid</span>
          <span className="text-gray-400 text-xs">of {formatCurrency(d.amount, currency)}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isComplete ? '#10b981' : '#6366f1' }} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{isComplete ? '✅ Settled' : `${formatCurrency(remaining, currency)} remaining`}</span>
          {d.interestRate > 0 && <span>{d.interestRate}% interest</span>}
          {d.dueDate && <span>Due: {d.dueDate}</span>}
        </div>

        {!isComplete && (
          <button onClick={() => setPayDebtId(d.id)}
            className="mt-3 w-full py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
            <HiCash className="w-3.5 h-3.5" /> Record Payment
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Debt Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track loans given & taken</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Debt'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-4 border-l-4 border-red-400">
          <p className="text-xs text-gray-400 mb-1">I Owe (Borrowed)</p>
          <p className="text-lg font-bold text-red-500">{formatCurrency(totalBorrowed, currency)}</p>
        </div>
        <div className="card text-center py-4 border-l-4 border-emerald-400">
          <p className="text-xs text-gray-400 mb-1">Owed to Me (Lent)</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalLent, currency)}</p>
        </div>
      </div>

      {/* Payment form */}
      {payDebtId && (
        <form onSubmit={handlePayment} className="card space-y-3 animate-fadeIn border-2 border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold">Record Payment</h3>
          <input className="input" type="number" min="1" placeholder="Payment amount" value={payAmount}
            onChange={e => setPayAmount(e.target.value)} required />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Record</button>
            <button type="button" onClick={() => setPayDebtId(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4 animate-fadeIn">
          <div className="flex gap-2">
            {['borrowed', 'lent'].map(d => (
              <button key={d} type="button" onClick={() => setDirection(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${direction === d ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {d === 'borrowed' ? '🔴 I Borrowed' : '🟢 I Lent'}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Title / Description</label>
            <input className="input" placeholder="e.g. Home renovation loan" value={title}
              onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">Person / Entity</label>
            <input className="input" placeholder="e.g. Ahmed, Bank XYZ" value={person}
              onChange={e => setPerson(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount ({currency})</label>
              <input className="input" type="number" min="1" placeholder="10000" value={amount}
                onChange={e => setAmount(e.target.value)} required />
            </div>
            <div>
              <label className="label">Interest Rate (%)</label>
              <input className="input" type="number" min="0" step="0.1" placeholder="0" value={interestRate}
                onChange={e => setInterestRate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Due Date (optional)</label>
            <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="Any notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Add Debt</button>
        </form>
      )}

      {/* Debts list */}
      {debts.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <span className="text-5xl mb-3">📋</span>
          <p className="font-medium">No debts tracked</p>
          <p className="text-sm mt-1">Add loans you've given or taken</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {debts.map(d => <DebtCard key={d.id} d={d} />)}
        </div>
      )}
    </div>
  )
}
