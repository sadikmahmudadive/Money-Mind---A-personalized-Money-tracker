import { useState } from 'react'
import { useCustomCategories } from '../hooks/useCustomCategories'
import { CATEGORIES } from '../utils/categories'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash } from 'react-icons/hi'

const EMOJI_OPTIONS = ['📁', '🏠', '🎮', '🐾', '💊', '📱', '🎨', '🔧', '🎵', '📚', '🏋️', '☕', '🚗', '💼', '🎁', '🌿', '🍕', '✈️', '💰', '🛒']
const COLOR_OPTIONS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b']

export default function CustomCategories() {
  const { categories, addCategory, deleteCategory } = useCustomCategories()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📁')
  const [color, setColor] = useState('#6366f1')
  const [type, setType] = useState('expense')

  const allDefaults = CATEGORIES.map(c => c.name.toLowerCase())

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { toast.error('Enter a category name'); return }
    if (allDefaults.includes(trimmed.toLowerCase()) || categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Category already exists')
      return
    }
    await addCategory({ name: trimmed, icon, color, type })
    toast.success(`Category "${trimmed}" added!`)
    setName('')
    setShowForm(false)
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete custom category "${cat.name}"?`)) return
    await deleteCategory(cat.id)
    toast.success('Category removed')
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Custom Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create your own categories for transactions</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4 animate-fadeIn">
          <div>
            <label className="label">Category Name</label>
            <input className="input" placeholder="e.g. Gym, Subscriptions" value={name}
              onChange={e => setName(e.target.value)} maxLength={30} required />
          </div>

          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {['expense', 'income'].map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${type === t ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} type="button" onClick={() => setIcon(e)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${icon === e ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold">{name || 'Category Name'}</span>
            <span className="w-3 h-3 rounded-full ml-auto" style={{ backgroundColor: color }} />
          </div>

          <button type="submit" className="btn-primary w-full">Create Category</button>
        </form>
      )}

      {/* Default categories */}
      <div className="card">
        <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Default Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(c => (
            <div key={c.name} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
              <span>{c.icon}</span>
              <span className="truncate">{c.name}</span>
              <span className={`text-xs ml-auto ${c.type === 'income' ? 'text-emerald-500' : 'text-gray-400'}`}>{c.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom categories */}
      <div className="card">
        <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-3">
          Your Custom Categories ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No custom categories yet. Click "Add" to create one!</p>
        ) : (
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{c.type}</p>
                </div>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <button onClick={() => handleDelete(c)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
