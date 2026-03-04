import { getCategoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/formatCurrency'

export default function BudgetCard({ category, limit, spent = 0, currency = 'BDT', onDelete }) {
  const { icon, color } = getCategoryMeta(category)
  const pct        = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const remaining  = limit - spent
  const isOver     = spent > limit

  let barColor = '#10b981'
  if (pct > 85) barColor = '#ef4444'
  else if (pct > 65) barColor = '#f59e0b'

  return (
    <div className="card group">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: color + '22' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{category}</p>
          <p className="text-xs text-gray-400">
            {formatCurrency(spent, currency)} of {formatCurrency(limit, currency)}
          </p>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(category)}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition text-xs p-1">
            ✕
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">{pct.toFixed(0)}% used</span>
        <span className={`text-xs font-semibold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
          {isOver ? `Over by ${formatCurrency(Math.abs(remaining), currency)}` : `${formatCurrency(remaining, currency)} left`}
        </span>
      </div>
    </div>
  )
}
