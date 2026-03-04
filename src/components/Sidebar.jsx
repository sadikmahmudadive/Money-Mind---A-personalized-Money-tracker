import { NavLink } from 'react-router-dom'
import {
  HiViewGrid, HiCash, HiPlusCircle, HiChartPie,
  HiDocumentReport, HiUser, HiX, HiSparkles, HiRefresh, HiFlag,
} from 'react-icons/hi'

const links = [
  { to: '/dashboard',    icon: <HiViewGrid className="w-5 h-5" />,       label: 'Dashboard'       },
  { to: '/transactions', icon: <HiCash className="w-5 h-5" />,           label: 'Transactions'    },
  { to: '/add',          icon: <HiPlusCircle className="w-5 h-5" />,     label: 'Add Transaction' },
  { to: '/budgets',      icon: <HiChartPie className="w-5 h-5" />,       label: 'Budgets'         },
  { to: '/recurring',    icon: <HiRefresh className="w-5 h-5" />,        label: 'Recurring'       },
  { to: '/goals',        icon: <HiFlag className="w-5 h-5" />,           label: 'Savings Goals'   },
  { to: '/reports',      icon: <HiDocumentReport className="w-5 h-5" />, label: 'Reports'         },
  { to: '/ai',           icon: <HiSparkles className="w-5 h-5" />,       label: 'AI Insights'     },
  { to: '/profile',      icon: <HiUser className="w-5 h-5" />,           label: 'Profile'         },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-60 bg-white dark:bg-gray-900
          border-r border-gray-100 dark:border-gray-800
          flex flex-col py-6 px-3 gap-1
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden self-end p-1 mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <HiX className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 px-4 mb-6">
          <span className="text-3xl">💰</span>
          <span className="font-extrabold text-xl text-primary-600 dark:text-primary-400">MoneyMind</span>
        </div>

        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </aside>
    </>
  )
}
