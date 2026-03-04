import { Link } from 'react-router-dom'
import { HiTrash, HiExternalLink, HiPencil } from 'react-icons/hi'
import { getCategoryMeta } from '../utils/categories'
import { toDateString } from '../utils/dateHelpers'
import { formatCurrency } from '../utils/formatCurrency'

export default function TransactionList({ transactions, onDelete, currency = 'BDT', limit }) {
  const items = limit ? transactions.slice(0, limit) : transactions

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <span className="text-4xl mb-3">📭</span>
        <p className="text-sm">No transactions found</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map(tx => {
        const cat = getCategoryMeta(tx.category)
        return (
          <li key={tx.id} className="flex items-center gap-3 py-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 transition-colors">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{ background: cat.color + '22' }}
            >
              {cat.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{tx.title}</p>
              <p className="text-xs text-gray-400">{cat.name} · {toDateString(tx.date)}</p>
              {tx.notes && <p className="text-xs text-gray-400 truncate">{tx.notes}</p>}
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {tx.receiptURL && (
                <a href={tx.receiptURL} target="_blank" rel="noopener noreferrer"
                   className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 transition">
                  <HiExternalLink className="w-4 h-4" />
                </a>
              )}
              <Link to={`/edit/${tx.id}`}
                className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-500 transition">
                <HiPencil className="w-4 h-4" />
              </Link>
              {onDelete && (
                <button onClick={() => onDelete(tx.id)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition">
                  <HiTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
