import { useState } from 'react'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { format, parseISO, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiX, HiCash } from 'react-icons/hi'

const GOAL_EMOJIS = ['🏠', '🚗', '✈️', '📱', '💍', '🎓', '💻', '🏖️', '👶', '💰', '🏋️', '🎯']
const GOAL_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
]

function GoalCard({ goal, currency, onDelete, onContribute }) {
  const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0
  const remaining = goal.targetAmount - goal.savedAmount
  const daysLeft = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null
  const done = pct >= 100

  return (
    <div className={`card space-y-4 ${done ? 'ring-2 ring-emerald-400' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.emoji ?? '🎯'}</span>
          <div>
            <p className="font-bold">{goal.name}</p>
            {goal.note && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{goal.note}</p>}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 rounded-xl transition shrink-0">
          <HiTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className={`font-semibold ${done ? 'text-emerald-500' : ''}`}>
            {formatCurrency(goal.savedAmount, currency)}
          </span>
          <span className="text-gray-400">{formatCurrency(goal.targetAmount, currency)}</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${goal.color ?? 'bg-primary-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{pct.toFixed(0)}% saved</span>
          {done ? (
            <span className="text-emerald-500 font-semibold">🎉 Goal reached!</span>
          ) : (
            <span>{formatCurrency(remaining, currency)} to go</span>
          )}
        </div>
      </div>

      {/* Deadline + contribute */}
      <div className="flex items-center justify-between">
        <div>
          {goal.deadline && (
            <p className={`text-xs font-medium ${daysLeft != null && daysLeft < 30 ? 'text-amber-500' : 'text-gray-400'}`}>
              📅 {daysLeft != null && daysLeft >= 0
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                : 'Deadline passed'
              } — {format(parseISO(goal.deadline), 'dd MMM yyyy')}
            </p>
          )}
        </div>
        {!done && (
          <button onClick={() => onContribute(goal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-xl transition">
            <HiCash className="w-3.5 h-3.5" /> Add Money
          </button>
        )}
      </div>
    </div>
  )
}

export default function SavingsGoals() {
  const { goals, loading, addGoal, deleteGoal, addContribution } = useSavingsGoals()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  // Add goal form
  const [showAdd, setShowAdd]     = useState(false)
  const [name, setName]           = useState('')
  const [target, setTarget]       = useState('')
  const [deadline, setDeadline]   = useState('')
  const [emoji, setEmoji]         = useState('🎯')
  const [color, setColor]         = useState('bg-primary-500')
  const [note, setNote]           = useState('')
  const [busy, setBusy]           = useState(false)

  // Contribute modal
  const [contribGoal, setContribGoal] = useState(null)
  const [contribAmt, setContribAmt]   = useState('')
  const [contributing, setContrib]    = useState(false)

  function resetAdd() {
    setName(''); setTarget(''); setDeadline(''); setEmoji('🎯'); setColor('bg-primary-500'); setNote('')
  }

  async function handleAddGoal(e) {
    e.preventDefault()
    if (!target || Number(target) <= 0) { toast.error('Enter a valid target amount'); return }
    setBusy(true)
    try {
      await addGoal({ name: name.trim(), targetAmount: target, deadline, emoji, color, note: note.trim() })
      toast.success('Goal created!')
      setShowAdd(false)
      resetAdd()
    } catch (err) {
      toast.error(err.message ?? 'Failed to create goal')
    } finally {
      setBusy(false)
    }
  }

  async function handleContribute(e) {
    e.preventDefault()
    if (!contribAmt || Number(contribAmt) <= 0) { toast.error('Enter a valid amount'); return }
    setContrib(true)
    try {
      await addContribution(contribGoal.id, contribAmt)
      toast.success(`Added ${formatCurrency(contribAmt, currency)} to "${contribGoal.name}"`)
      setContribGoal(null)
      setContribAmt('')
    } catch (err) {
      toast.error(err.message ?? 'Failed to add')
    } finally {
      setContrib(false)
    }
  }

  // Stats
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved  = goals.reduce((s, g) => s + g.savedAmount, 0)
  const completed   = goals.filter(g => g.savedAmount >= g.targetAmount).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Savings Goals</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your financial milestones</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Stats row */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Saved',  value: formatCurrency(totalSaved, currency),  color: 'text-emerald-500' },
            { label: 'Total Target', value: formatCurrency(totalTarget, currency), color: 'text-primary-500' },
            { label: 'Completed',    value: `${completed} / ${goals.length}`,      color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add goal modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg">New Savings Goal</h2>
              <button onClick={() => { setShowAdd(false); resetAdd() }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="p-5 space-y-4">
              <div>
                <label className="label">Goal Name</label>
                <input className="input" placeholder="e.g. New Laptop, Emergency Fund"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setEmoji(em)}
                      className={`text-xl p-1.5 rounded-xl border-2 transition
                        ${emoji === em ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:border-gray-200'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Target Amount ({currency})</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="50000.00"
                  value={target} onChange={e => setTarget(e.target.value)} required />
              </div>

              <div>
                <label className="label">Deadline (optional)</label>
                <input className="input" type="date"
                  value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>

              {/* Color picker */}
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full ${c} transition ring-offset-2 ${color === c ? 'ring-2 ring-primary-500' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Note (optional)</label>
                <input className="input" placeholder="e.g. For family vacation"
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>

              <button type="submit" disabled={busy}
                className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-60">
                {busy ? 'Creating…' : 'Create Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute modal */}
      {contribGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Add Contribution</h2>
              <button onClick={() => { setContribGoal(null); setContribAmt('') }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Adding to <strong className="text-gray-700 dark:text-gray-300">{contribGoal.emoji} {contribGoal.name}</strong>
              {' '}— {formatCurrency(contribGoal.savedAmount, currency)} / {formatCurrency(contribGoal.targetAmount, currency)}
            </p>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="label">Amount ({currency})</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="0.00"
                  value={contribAmt} onChange={e => setContribAmt(e.target.value)} required autoFocus />
              </div>
              <button type="submit" disabled={contributing}
                className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-60">
                {contributing ? 'Saving…' : 'Add Contribution'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Goal cards */}
      {!goals.length ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-4">🎯</span>
          <p className="font-semibold text-gray-600 dark:text-gray-400">No goals yet</p>
          <p className="text-sm mt-1">Set a savings target and track your progress</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              currency={currency}
              onDelete={deleteGoal}
              onContribute={setContribGoal}
            />
          ))}
        </div>
      )}
    </div>
  )
}
