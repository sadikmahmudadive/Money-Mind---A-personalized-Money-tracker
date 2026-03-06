import { useState, useMemo } from 'react'
import { useInvestments } from '../hooks/useInvestments'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi'

const ASSET_TYPES = [
  { value: 'stock', label: 'Stock', icon: '📈' },
  { value: 'crypto', label: 'Crypto', icon: '🪙' },
  { value: 'mutual_fund', label: 'Mutual Fund', icon: '📊' },
  { value: 'bond', label: 'Bond', icon: '🏦' },
  { value: 'gold', label: 'Gold', icon: '🥇' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '💼' },
]
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6']

export default function Investments() {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestments()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('stock')
  const [buyPrice, setBuyPrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [buyDate, setBuyDate] = useState('')
  const [notes, setNotes] = useState('')

  const totals = useMemo(() => {
    const totalInvested = investments.reduce((s, i) => s + (i.buyPrice * (i.quantity || 1)), 0)
    const totalCurrent = investments.reduce((s, i) => s + (i.currentPrice * (i.quantity || 1)), 0)
    const totalGain = totalCurrent - totalInvested
    const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
    return { totalInvested, totalCurrent, totalGain, gainPct }
  }, [investments])

  const pieData = useMemo(() => {
    const byType = {}
    investments.forEach(i => {
      const key = i.type || 'other'
      byType[key] = (byType[key] || 0) + (i.currentPrice * (i.quantity || 1))
    })
    return Object.entries(byType).map(([key, value]) => ({
      name: ASSET_TYPES.find(t => t.value === key)?.label || key,
      value,
    }))
  }, [investments])

  function resetForm() {
    setName(''); setType('stock'); setBuyPrice(''); setCurrentPrice(''); setQuantity('1'); setBuyDate(''); setNotes('')
    setEditId(null); setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Enter asset name'); return }
    if (Number(buyPrice) <= 0) { toast.error('Enter buy price'); return }

    const data = { name: name.trim(), type, buyPrice, currentPrice: currentPrice || buyPrice, quantity, buyDate, notes }

    if (editId) {
      await updateInvestment(editId, data)
      toast.success('Investment updated!')
    } else {
      await addInvestment(data)
      toast.success('Investment added!')
    }
    resetForm()
  }

  function handleEdit(inv) {
    setEditId(inv.id)
    setName(inv.name)
    setType(inv.type)
    setBuyPrice(inv.buyPrice)
    setCurrentPrice(inv.currentPrice)
    setQuantity(inv.quantity)
    setBuyDate(inv.buyDate || '')
    setNotes(inv.notes || '')
    setShowForm(true)
  }

  async function handleDelete(inv) {
    if (!confirm(`Delete "${inv.name}"?`)) return
    await deleteInvestment(inv.id)
    toast.success('Investment removed')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Investment Portfolio</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your investments and returns</p>
        </div>
        <button onClick={() => { showForm ? resetForm() : setShowForm(true) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {/* Portfolio summary */}
      <div className="card py-6" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div className="grid grid-cols-3 text-center text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Invested</p>
            <p className="text-lg font-extrabold mt-1">{formatCurrency(totals.totalInvested, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Current Value</p>
            <p className="text-lg font-extrabold mt-1">{formatCurrency(totals.totalCurrent, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Gain/Loss</p>
            <p className={`text-lg font-extrabold mt-1 ${totals.totalGain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {totals.totalGain >= 0 ? '+' : ''}{formatCurrency(totals.totalGain, currency)}
            </p>
            <p className="text-xs text-white/60">({totals.gainPct.toFixed(1)}%)</p>
          </div>
        </div>
      </div>

      {/* Allocation pie */}
      {pieData.length > 0 && (
        <div className="card flex flex-col items-center">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-3 self-start">Asset Allocation</h2>
          <div className="w-48 h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-fadeIn">
          <h3 className="font-semibold">{editId ? 'Edit Investment' : 'Add Investment'}</h3>
          <div>
            <label className="label">Asset Type</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {ASSET_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`p-2 rounded-xl text-center text-xs transition ${type === t.value ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 font-bold' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <span className="text-lg block mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Name / Ticker</label>
            <input className="input" placeholder="e.g. AAPL, Bitcoin, Gold Bar" value={name}
              onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Buy Price</label>
              <input className="input" type="number" min="0" step="any" value={buyPrice}
                onChange={e => setBuyPrice(e.target.value)} required />
            </div>
            <div>
              <label className="label">Current Price</label>
              <input className="input" type="number" min="0" step="any" value={currentPrice}
                onChange={e => setCurrentPrice(e.target.value)} />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input className="input" type="number" min="0.001" step="any" value={quantity}
                onChange={e => setQuantity(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Buy Date</label>
              <input className="input" type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Optional" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">{editId ? 'Update' : 'Add Investment'}</button>
        </form>
      )}

      {/* Investments list */}
      {investments.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <span className="text-5xl mb-3">📈</span>
          <p className="font-medium">No investments yet</p>
          <p className="text-sm mt-1">Start tracking your portfolio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map(inv => {
            const invested = inv.buyPrice * (inv.quantity || 1)
            const current = inv.currentPrice * (inv.quantity || 1)
            const gain = current - invested
            const gainPct = invested > 0 ? (gain / invested) * 100 : 0
            const assetType = ASSET_TYPES.find(t => t.value === inv.type)

            return (
              <div key={inv.id} className="card flex items-center gap-3 group">
                <span className="text-2xl shrink-0">{assetType?.icon || '💼'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{inv.name}</p>
                    <span className="text-xs text-gray-400 capitalize">{assetType?.label}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                    <span>Qty: {inv.quantity}</span>
                    <span>Buy: {formatCurrency(inv.buyPrice, currency)}</span>
                    <span>Now: {formatCurrency(inv.currentPrice, currency)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {gain >= 0 ? '+' : ''}{formatCurrency(gain, currency)}
                  </p>
                  <p className={`text-xs ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gainPct.toFixed(1)}%
                  </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(inv)} className="btn-icon text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                    <HiPencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(inv)} className="btn-icon text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <HiTrash className="w-3.5 h-3.5" />
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
