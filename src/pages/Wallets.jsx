import { useState } from 'react'
import { useWallets } from '../hooks/useWallets'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash, HiSwitchHorizontal } from 'react-icons/hi'

const WALLET_TYPES = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank', label: 'Bank Account', icon: '🏦' },
  { value: 'mobile', label: 'Mobile Banking', icon: '📱' },
  { value: 'credit', label: 'Credit Card', icon: '💳' },
  { value: 'savings', label: 'Savings', icon: '🏧' },
]
const COLOR_OPTIONS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6']

export default function Wallets() {
  const { wallets, addWallet, updateWallet, deleteWallet } = useWallets()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [showForm, setShowForm] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('cash')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState('#6366f1')

  // Transfer state
  const [fromWallet, setFromWallet] = useState('')
  const [toWallet, setToWallet] = useState('')
  const [transferAmt, setTransferAmt] = useState('')

  const totalBalance = wallets.reduce((s, w) => s + (w.balance ?? 0), 0)

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Enter wallet name'); return }
    const t = WALLET_TYPES.find(w => w.value === type)
    await addWallet({ name: name.trim(), type, balance: Number(balance) || 0, color, icon: t?.icon || '💳' })
    toast.success('Wallet added!')
    setName(''); setBalance(''); setShowForm(false)
  }

  async function handleTransfer(e) {
    e.preventDefault()
    const amt = Number(transferAmt)
    if (!fromWallet || !toWallet || fromWallet === toWallet) { toast.error('Select different wallets'); return }
    if (amt <= 0) { toast.error('Enter valid amount'); return }
    const from = wallets.find(w => w.id === fromWallet)
    const to = wallets.find(w => w.id === toWallet)
    if (!from || !to) return
    if (from.balance < amt) { toast.error('Insufficient balance'); return }
    await updateWallet(fromWallet, { balance: from.balance - amt })
    await updateWallet(toWallet, { balance: to.balance + amt })
    toast.success(`Transferred ${formatCurrency(amt, currency)}`)
    setTransferAmt(''); setShowTransfer(false)
  }

  async function handleDelete(w) {
    if (!confirm(`Delete wallet "${w.name}"?`)) return
    await deleteWallet(w.id)
    toast.success('Wallet removed')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Wallets & Accounts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your money across accounts</p>
        </div>
        <div className="flex gap-2">
          {wallets.length >= 2 && (
            <button onClick={() => { setShowTransfer(s => !s); setShowForm(false) }}
              className="btn-primary !bg-emerald-500 hover:!bg-emerald-600 flex items-center gap-2 text-sm">
              <HiSwitchHorizontal className="w-4 h-4" />
              Transfer
            </button>
          )}
          <button onClick={() => { setShowForm(s => !s); setShowTransfer(false) }}
            className="btn-primary flex items-center gap-2 text-sm">
            <HiPlus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add'}
          </button>
        </div>
      </div>

      {/* Total balance */}
      <div className="card text-center py-6" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Total Balance</p>
        <p className="text-3xl font-extrabold text-white mt-1">{formatCurrency(totalBalance, currency)}</p>
        <p className="text-sm text-white/60 mt-1">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Transfer form */}
      {showTransfer && (
        <form onSubmit={handleTransfer} className="card space-y-4 animate-fadeIn">
          <h3 className="font-semibold">Transfer Between Wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">From</label>
              <select className="input" value={fromWallet} onChange={e => setFromWallet(e.target.value)} required>
                <option value="">Select...</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">To</label>
              <select className="input" value={toWallet} onChange={e => setToWallet(e.target.value)} required>
                <option value="">Select...</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Amount ({currency})</label>
            <input className="input" type="number" min="1" value={transferAmt}
              onChange={e => setTransferAmt(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full">Transfer</button>
        </form>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4 animate-fadeIn">
          <h3 className="font-semibold">Add Wallet</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="e.g. bKash, City Bank" value={name}
              onChange={e => setName(e.target.value)} maxLength={30} required />
          </div>
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {WALLET_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`p-2 rounded-xl text-center text-xs transition ${type === t.value ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 font-bold' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <span className="text-lg block mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Initial Balance ({currency})</label>
            <input className="input" type="number" min="0" placeholder="0" value={balance}
              onChange={e => setBalance(e.target.value)} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Create Wallet</button>
        </form>
      )}

      {/* Wallet cards */}
      {wallets.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <span className="text-5xl mb-3">💳</span>
          <p className="font-medium">No wallets yet</p>
          <p className="text-sm mt-1">Click "Add" to create your first wallet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map(w => (
            <div key={w.id} className="card relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 opacity-10" style={{ backgroundColor: w.color }} />
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{w.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{w.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{w.type}</p>
                </div>
                <button onClick={() => handleDelete(w)}
                  className="btn-icon opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xl font-extrabold" style={{ color: w.color }}>
                {formatCurrency(w.balance ?? 0, currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
