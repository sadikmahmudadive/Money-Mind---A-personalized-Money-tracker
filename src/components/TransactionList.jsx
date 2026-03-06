import { Link } from 'react-router-dom'
import { HiTrash, HiExternalLink, HiPencil, HiTag, HiStar } from 'react-icons/hi'
import { getCategoryMeta } from '../utils/categories'
import { toDateString } from '../utils/dateHelpers'
import { formatCurrency } from '../utils/formatCurrency'

export default function TransactionList({ transactions, onDelete, onTogglePin, currency = 'BDT', limit }) {
  const items = limit ? transactions.slice(0, limit) : transactions

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-gray-400">
        <span className="text-5xl mb-4 opacity-60">📭</span>
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs mt-1 text-gray-300 dark:text-gray-600">Add your first transaction to get started</p>
      </div>
    )
  }

  return (
    <ul className="space-y-1">
      {items.map(tx => {
        const cat = getCategoryMeta(tx.category)
        const isIncome = tx.type === 'income'
        return (
          <li
            key={tx.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 px-3 rounded-xl group
                       hover:bg-gray-50 dark:hover:bg-gray-800/60
                       transition-all duration-150 cursor-default"
          >
            {/* Category icon */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner-sm"
              style={{ background: cat.color + '1a', color: cat.color }}
            >
              {cat.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">
                {tx.title}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <span
                  className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                  style={{ background: cat.color + '15', color: cat.color }}
                >
                  {cat.name}
                </span>
                <span>·</span>
                <span>{toDateString(tx.date)}</span>
              </p>
              {tx.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tx.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded-full">
                      <HiTag className="w-2 h-2" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Amount + actions row */}
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              {/* Amount badge */}
              <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold
                ${ isIncome
                  ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-900/25 text-red-600 dark:text-red-400'
                }`}
              >
                {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
              </div>

              {/* Action buttons — visible on hover (desktop) or always visible (mobile) */}
              <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                {onTogglePin && (
                  <button
                    onClick={() => onTogglePin(tx.id, !tx.pinned)}
                    className={`btn-icon ${tx.pinned ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'}`}
                    title={tx.pinned ? 'Unpin' : 'Pin'}
                  >
                    <HiStar className="w-3.5 h-3.5" />
                  </button>
                )}
                {tx.receiptURL && (
                  <a
                    href={tx.receiptURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon text-blue-500"
                    title="View receipt"
                  >
                    <HiExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  to={`/edit/${tx.id}`}
                  className="btn-icon text-amber-500"
                  title="Edit"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="btn-icon text-red-500"
                    title="Delete"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
