import { useState } from 'react'
import { useSharedBudgets } from '../hooks/useSharedBudgets'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiUserAdd, HiCash } from 'react-icons/hi'

export default function SharedBudgets() {
  const { sharedBudgets, createSharedBudget, addMember, addExpense, deleteSharedBudget } = useSharedBudgets()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [category, setCategory] = useState('Food')

  const [addMemberTo, setAddMemberTo] = useState(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [addExpenseTo, setAddExpenseTo] = useState(null)
  const [expenseAmt, setExpenseAmt] = useState('')

  const expenseCats = CATEGORIES.filter(c => c.type === 'expense')

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Enter budget name'); return }
    if (Number(limit) <= 0) { toast.error('Enter valid limit'); return }
    await createSharedBudget({ name: name.trim(), limit, category })
    toast.success('Shared budget created!')
    setName(''); setLimit(''); setShowForm(false)
  }

  async function handleAddMember(e) {
    e.preventDefault()
    if (!memberEmail.trim()) return
    await addMember(addMemberTo, memberEmail.trim())
    toast.success('Member added!')
    setMemberEmail(''); setAddMemberTo(null)
  }

  async function handleAddExpense(e) {
    e.preventDefault()
    if (Number(expenseAmt) <= 0) { toast.error('Enter valid amount'); return }
    await addExpense(addExpenseTo, expenseAmt)
    toast.success('Expense recorded!')
    setExpenseAmt(''); setAddExpenseTo(null)
  }

  async function handleDelete(b) {
    if (!confirm(`Delete shared budget "${b.name}"?`)) return
    await deleteSharedBudget(b.id)
    toast.success('Shared budget removed')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Shared Budgets</h1>
          <p className="text-sm text-gray-400 mt-0.5">Collaborate on budgets with others</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Create'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4 animate-fadeIn">
          <h3 className="font-semibold">New Shared Budget</h3>
          <div>
            <label className="label">Budget Name</label>
            <input className="input" placeholder="e.g. Household Expenses" value={name}
              onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {expenseCats.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit ({currency})</label>
            <input className="input" type="number" min="1" placeholder="10000" value={limit}
              onChange={e => setLimit(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full">Create Shared Budget</button>
        </form>
      )}

      {/* Add member modal */}
      {addMemberTo && (
        <form onSubmit={handleAddMember} className="card space-y-3 animate-fadeIn border-2 border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold">Add Member</h3>
          <input className="input" type="email" placeholder="member@email.com" value={memberEmail}
            onChange={e => setMemberEmail(e.target.value)} required />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Add</button>
            <button type="button" onClick={() => setAddMemberTo(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Add expense modal */}
      {addExpenseTo && (
        <form onSubmit={handleAddExpense} className="card space-y-3 animate-fadeIn border-2 border-emerald-200 dark:border-emerald-800">
          <h3 className="font-semibold">Record Expense</h3>
          <input className="input" type="number" min="1" placeholder="Amount" value={expenseAmt}
            onChange={e => setExpenseAmt(e.target.value)} required />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 !bg-emerald-500">Record</button>
            <button type="button" onClick={() => setAddExpenseTo(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Shared budgets list */}
      {sharedBudgets.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <span className="text-5xl mb-3">👥</span>
          <p className="font-medium">No shared budgets yet</p>
          <p className="text-sm mt-1">Create one and invite members to collaborate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sharedBudgets.map(b => {
            const cat = getCategoryMeta(b.category)
            const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0
            return (
              <div key={b.id} className="card group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: cat.color + '1a' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{b.name}</p>
                    <p className="text-xs text-gray-400">{cat.name} · {b.members?.length ?? 1} member(s)</p>
                  </div>
                  <button onClick={() => handleDelete(b)}
                    className="btn-icon opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-end justify-between mb-1.5 text-sm">
                  <span className="font-bold">{formatCurrency(b.spent ?? 0, currency)}</span>
                  <span className="text-gray-400 text-xs">of {formatCurrency(b.limit, currency)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#10b981' }} />
                </div>

                {/* Members */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(b.members ?? []).map(m => (
                    <span key={m} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{m}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => setAddMemberTo(b.id)}
                    className="flex-1 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
                    <HiUserAdd className="w-3.5 h-3.5" /> Add Member
                  </button>
                  <button onClick={() => setAddExpenseTo(b.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition">
                    <HiCash className="w-3.5 h-3.5" /> Add Expense
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
