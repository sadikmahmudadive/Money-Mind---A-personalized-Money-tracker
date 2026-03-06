import { HiArrowSmUp, HiArrowSmDown, HiTrendingUp } from 'react-icons/hi'
import { formatCurrency } from '../utils/formatCurrency'

export default function BalanceCard({ balance, totalIncome, totalExpense, currency = 'BDT' }) {
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
  const positiveBalance = balance >= 0

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 border-0 text-white"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 60%, #0ea5e9 100%)',
        backgroundSize: '200% 200%',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative">
        {/* Label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
          Current Balance
        </p>

        {/* Balance */}
        <p className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-none mb-1">
          {formatCurrency(balance, currency)}
        </p>

        {/* Savings rate pill */}
        <div className="flex items-center gap-1.5 mt-2 mb-5">
          <HiTrendingUp className={`w-4 h-4 ${savingsRate >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
          <span className="text-xs text-white/80">
            <span className={`font-bold ${savingsRate >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {savingsRate >= 0 ? '+' : ''}{savingsRate}%
            </span>{' '}savings rate this period
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold uppercase tracking-wide mb-1.5">
              <HiArrowSmUp className="w-4 h-4" /> Income
            </div>
            <p className="text-base font-extrabold">{formatCurrency(totalIncome, currency)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-red-300 text-[11px] font-bold uppercase tracking-wide mb-1.5">
              <HiArrowSmDown className="w-4 h-4" /> Expenses
            </div>
            <p className="text-base font-extrabold">{formatCurrency(totalExpense, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
