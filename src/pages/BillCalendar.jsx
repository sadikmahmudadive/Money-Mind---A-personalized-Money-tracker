import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useRecurring } from '../hooks/useRecurring'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import { getCategoryMeta } from '../utils/categories'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns'

export default function BillCalendar() {
  const { transactions } = useTransactions()
  const { recurring } = useRecurring()
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'BDT'

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0=Sun

  // Transactions mapped by day
  const txByDay = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      const key = format(d, 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [transactions])

  // Recurring bills mapped by day-of-month
  const recurringByDay = useMemo(() => {
    const map = {}
    recurring.filter(r => r.active).forEach(r => {
      const day = r.dueDay ?? 1
      if (!map[day]) map[day] = []
      map[day].push(r)
    })
    return map
  }, [recurring])

  const selectedKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null
  const selectedTx = selectedKey ? (txByDay[selectedKey] ?? []) : []
  const selectedBills = selectedDay ? (recurringByDay[selectedDay.getDate()] ?? []) : []
  const isCurrentMonth = format(currentDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  // Monthly totals
  const monthTx = useMemo(() => {
    const ym = format(currentDate, 'yyyy-MM')
    return transactions.filter(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return format(d, 'yyyy-MM') === ym
    })
  }, [transactions, currentDate])

  const monthIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-xl sm:text-2xl font-extrabold">Bill Calendar</h1>

      {/* Month navigation + summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold min-w-[160px] text-center">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-semibold">
            +{formatCurrency(monthIncome, currency)}
          </span>
          <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg font-semibold">
            -{formatCurrency(monthExpense, currency)}
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card p-2 sm:p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Empty padding for start of month */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTx = txByDay[key] ?? []
            const dayBills = recurringByDay[day.getDate()] ?? []
            const hasExpense = dayTx.some(t => t.type === 'expense')
            const hasIncome = dayTx.some(t => t.type === 'income')
            const hasBill = dayBills.length > 0
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const dayTotal = dayTx.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition relative
                  ${isSelected ? 'bg-primary-500 text-white ring-2 ring-primary-300' :
                    isToday ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800' :
                    'hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
              >
                <span className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-white' : isToday ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {format(day, 'd')}
                </span>
                {/* Indicators */}
                <div className="flex items-center gap-0.5">
                  {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {hasBill && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Income</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500" /> Expense</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-500" /> Recurring Bill</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="card animate-fadeIn">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
          </h3>

          {/* Recurring bills for this day */}
          {selectedBills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">📅 Recurring Bills</p>
              {selectedBills.map(r => {
                const cat = getCategoryMeta(r.category)
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2 px-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg mb-1">
                    <span className="text-lg">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-gray-400">{cat.name}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{formatCurrency(r.amount, currency)}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Transactions on this day */}
          {selectedTx.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 mb-2">💳 Transactions</p>
              {selectedTx.map(t => {
                const cat = getCategoryMeta(t.category)
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ background: cat.color + '1a', color: cat.color }}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">{cat.name}</p>
                    </div>
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : selectedBills.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No transactions on this day</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
