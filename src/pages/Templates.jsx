import { useState } from 'react'
import { useTemplates } from '../hooks/useTemplates'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiLightningBolt } from 'react-icons/hi'

export default function Templates() {
  const { templates, addTemplate, deleteTemplate } = useTemplates()
  const { addTransaction } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [notes, setNotes] = useState('')

  const cats = CATEGORIES.filter(c => c.type === type)

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) { toast.error('Enter template name'); return }
    await addTemplate({ title: title.trim(), amount: Number(amount) || 0, type, category, notes, currency })
    toast.success('Template saved!')
    setTitle(''); setAmount(''); setNotes(''); setShowForm(false)
  }

  async function handleUseTemplate(tpl) {
    try {
      await addTransaction({
        title: tpl.title,
        amount: tpl.amount,
        type: tpl.type,
        category: tpl.category,
        currency: tpl.currency || currency,
        notes: tpl.notes || '',
        date: new Date(),
        tags: [],
      })
      toast.success(`Transaction "${tpl.title}" added!`)
    } catch {
      toast.error('Failed to add transaction')
    }
  }

  async function handleDelete(tpl) {
    if (!confirm(`Delete template "${tpl.title}"?`)) return
    await deleteTemplate(tpl.id)
    toast.success('Template removed')
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Transaction Templates</h1>
          <p className="text-sm text-gray-400 mt-0.5">Quick-add frequent transactions</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4 animate-fadeIn">
          <div className="flex gap-2">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => { setType(t); setCategory(t === 'expense' ? 'Food' : 'Salary') }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${type === t ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="e.g. Morning Coffee" value={title}
              onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">Amount ({currency})</label>
            <input className="input" type="number" min="0" step="any" placeholder="0" value={amount}
              onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {cats.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="Quick note" value={notes}
              onChange={e => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Save Template</button>
        </form>
      )}

      {/* Templates list */}
      {templates.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <span className="text-5xl mb-3">⚡</span>
          <p className="font-medium">No templates yet</p>
          <p className="text-sm mt-1">Create templates for your frequent transactions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(tpl => {
            const cat = getCategoryMeta(tpl.category)
            return (
              <div key={tpl.id} className="card flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: cat.color + '1a', color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tpl.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={tpl.type === 'income' ? 'text-emerald-500' : 'text-red-400'}>{tpl.type}</span>
                    <span>·</span>
                    <span>{cat.name}</span>
                    {tpl.amount > 0 && <><span>·</span><span>{formatCurrency(tpl.amount, currency)}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleUseTemplate(tpl)}
                    className="btn-icon text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    title="Use template">
                    <HiLightningBolt className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(tpl)}
                    className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition"
                    title="Delete template">
                    <HiTrash className="w-4 h-4" />
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
