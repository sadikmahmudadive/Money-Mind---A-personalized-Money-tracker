import { getCategoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/formatCurrency'
import { HiTrash } from 'react-icons/hi'

export default function BudgetCard({ category, limit, spent = 0, currency = 'BDT', onDelete }) {
  const { icon, color } = getCategoryMeta(category)
  const pct        = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const remaining  = limit - spent
  const isOver     = spent > limit

  let barColor = '#10b981'
  if (pct > 85) barColor = '#ef4444'
  else if (pct > 65) barColor = '#f59e0b'

  const statusLabel = isOver
    ? { text: 'Over budget', cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' }
    : pct > 65
      ? { text: 'Near limit',   cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' }
      : { text: 'On track',     cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' }

  return (
    <div className="card group hover:shadow-card-lg transition-shadow duration-200">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: color + '22' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{category}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusLabel.cls}`}>
              {statusLabel.text}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatCurrency(spent, currency)} <span className="text-gray-300 dark:text-gray-600">/</span> {formatCurrency(limit, currency)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{pct.toFixed(0)}% used</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
            {isOver
              ? `⚠ Over by ${formatCurrency(Math.abs(remaining), currency)}`
              : `${formatCurrency(remaining, currency)} left`}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(category)}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30
                         text-red-400 hover:text-red-600 rounded-lg transition"
              title="Remove budget"
            >
              <HiTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
