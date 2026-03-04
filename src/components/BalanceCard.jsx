import { HiArrowSmUp, HiArrowSmDown, HiScale } from 'react-icons/hi'
import { formatCurrency } from '../utils/formatCurrency'

export default function BalanceCard({ balance, totalIncome, totalExpense, currency = 'BDT' }) {
  return (
    <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0 shadow-lg">
      <p className="text-sm font-medium text-primary-100 mb-1 flex items-center gap-1">
        <HiScale className="w-4 h-4" /> Current Balance
      </p>
      <p className="text-4xl font-extrabold tracking-tight">
        {formatCurrency(balance, currency)}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold mb-1">
            <HiArrowSmUp className="w-4 h-4" /> Total Income
          </div>
          <p className="text-lg font-bold">{formatCurrency(totalIncome, currency)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-red-200 text-xs font-semibold mb-1">
            <HiArrowSmDown className="w-4 h-4" /> Total Expenses
          </div>
          <p className="text-lg font-bold">{formatCurrency(totalExpense, currency)}</p>
        </div>
      </div>
    </div>
  )
}
