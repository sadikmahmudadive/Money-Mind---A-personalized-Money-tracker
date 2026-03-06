import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../context/AuthContext'
import TransactionList from '../components/TransactionList'
import { HiPlus, HiSearch, HiFilter, HiUpload } from 'react-icons/hi'
import { CATEGORIES } from '../utils/categories'
import { toDateString } from '../utils/dateHelpers'
import { formatCurrency } from '../utils/formatCurrency'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function Transactions() {
  const { transactions, loading, deleteTransaction, totalIncome, totalExpense, balance, addTransaction } = useTransactions()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'
  const csvRef = useRef()

  const [search, setSearch]     = useState('')
  const [typeFilter, setType]   = useState('all')
  const [catFilter, setCat]     = useState('all')
  const [monthFilter, setMonth] = useState('all')
  const [importing, setImporting] = useState(false)

  // Build unique month options
  const months = useMemo(() => {
    const set = new Set(transactions.map(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }))
    return Array.from(set).sort().reverse()
  }, [transactions])

  const filtered = useMemo(() => transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (catFilter  !== 'all' && t.category !== catFilter) return false
    if (monthFilter !== 'all') {
      const d    = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key !== monthFilter) return false
    }
    if (search) {
      const q = search.toLowerCase()
      return t.title?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)
    }
    return true
  }), [transactions, typeFilter, catFilter, monthFilter, search])

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    toast.success('Transaction deleted')
  }

  async function handleCSVImport(e) {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    try {
      const Papa = (await import('papaparse')).default
      const text = await file.text()
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
      let imported = 0
      for (const row of data) {
        const amount = parseFloat(row.Amount ?? row.amount ?? 0)
        if (!amount || amount <= 0) continue
        const type = (row.Type ?? row.type ?? 'expense').toLowerCase()
        const dateStr = row.Date ?? row.date ?? new Date().toISOString().slice(0, 10)
        await addTransaction({
          type:     type === 'income' ? 'income' : 'expense',
          title:    row.Title ?? row.title ?? row.Description ?? row.description ?? 'Imported',
          amount,
          category: row.Category ?? row.category ?? (type === 'income' ? 'Other Income' : 'Other'),
          notes:    row.Notes ?? row.notes ?? 'Imported from CSV',
          date:     Timestamp.fromDate(new Date(dateStr)),
        })
        imported++
      }
      toast.success(`Imported ${imported} transaction${imported !== 1 ? 's' : ''}!`)
    } catch (err) {
      toast.error('Import failed: ' + (err.message ?? 'Invalid CSV'))
    } finally {
      setImporting(false)
      csvRef.current.value = ''
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
        <h1 className="text-xl sm:text-2xl font-extrabold">Transactions</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => csvRef.current.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">
            <HiUpload className="w-4 h-4" />
            <span className="hidden sm:inline">{importing ? 'Importing…' : 'Import CSV'}</span>
            <span className="sm:hidden">{importing ? '…' : 'CSV'}</span>
          </button>
          <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          <Link to="/add" className="btn-primary flex items-center gap-2 text-sm">
            <HiPlus className="w-4 h-4" /> Add
          </Link>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Balance',  value: balance,       color: 'text-primary-600 dark:text-primary-400', bg: 'from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10', border: 'border-primary-100 dark:border-primary-800/30' },
          { label: 'Income',   value: totalIncome,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10', border: 'border-emerald-100 dark:border-emerald-800/30' },
          { label: 'Expenses', value: totalExpense,  color: 'text-red-500 dark:text-red-400',         bg: 'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10',         border: 'border-red-100 dark:border-red-800/30' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.bg} border ${s.border} p-4 text-center`}>
            <p className="text-xs text-gray-400 mb-1 font-medium">{s.label}</p>
            <p className={`font-extrabold text-base sm:text-lg truncate ${s.color}`}>{formatCurrency(s.value, currency)}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card space-y-3">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="input pl-9"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Type */}
          {['all', 'income', 'expense'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${typeFilter === t ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          {/* Category */}
          <select className="input !w-auto text-xs py-2" value={catFilter} onChange={e => setCat(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
          </select>

          {/* Month */}
          <select className="input !w-auto text-xs py-2" value={monthFilter} onChange={e => setMonth(e.target.value)}>
            <option value="all">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <TransactionList transactions={filtered} onDelete={handleDelete} currency={currency} />
      </div>
    </div>
  )
}
