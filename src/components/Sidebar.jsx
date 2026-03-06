import { NavLink, Link } from 'react-router-dom'
import {
  HiViewGrid, HiCash, HiPlusCircle, HiChartPie,
  HiDocumentReport, HiUser, HiX, HiSparkles, HiRefresh, HiFlag,
  HiUserGroup, HiCalendar, HiCurrencyDollar, HiHeart, HiShieldCheck,
  HiSwitchHorizontal, HiTag, HiCreditCard, HiLightningBolt, HiScale,
  HiClipboardList, HiTrendingUp,
} from 'react-icons/hi'

const sections = [
  {
    label: 'Main',
    links: [
      { to: '/dashboard',    icon: <HiViewGrid className="w-4.5 h-4.5" />,    label: 'Dashboard'    },
      { to: '/transactions', icon: <HiCash className="w-4.5 h-4.5" />,        label: 'Transactions' },
      { to: '/add',          icon: <HiPlusCircle className="w-4.5 h-4.5" />,  label: 'Add Transaction' },
      { to: '/templates',    icon: <HiLightningBolt className="w-4.5 h-4.5" />, label: 'Templates' },
    ],
  },
  {
    label: 'Manage',
    links: [
      { to: '/budgets',        icon: <HiChartPie className="w-4.5 h-4.5" />,       label: 'Budgets'      },
      { to: '/shared-budgets', icon: <HiUserGroup className="w-4.5 h-4.5" />,      label: 'Shared Budgets' },
      { to: '/spending-limits',icon: <HiScale className="w-4.5 h-4.5" />,          label: 'Spending Limits'},
      { to: '/recurring',      icon: <HiRefresh className="w-4.5 h-4.5" />,        label: 'Recurring'    },
      { to: '/calendar',       icon: <HiCalendar className="w-4.5 h-4.5" />,       label: 'Bill Calendar'},
      { to: '/goals',          icon: <HiFlag className="w-4.5 h-4.5" />,           label: 'Savings Goals'},
      { to: '/wallets',        icon: <HiCreditCard className="w-4.5 h-4.5" />,     label: 'Wallets'},
      { to: '/splits',         icon: <HiSwitchHorizontal className="w-4.5 h-4.5" />, label: 'Split Expenses'},
      { to: '/categories',     icon: <HiTag className="w-4.5 h-4.5" />,            label: 'Categories'},
      { to: '/debts',          icon: <HiClipboardList className="w-4.5 h-4.5" />,  label: 'Debt Tracker'},
      { to: '/investments',    icon: <HiTrendingUp className="w-4.5 h-4.5" />,     label: 'Investments'},
      { to: '/converter',      icon: <HiCurrencyDollar className="w-4.5 h-4.5" />, label: 'Converter'},
    ],
  },
  {
    label: 'Insights',
    links: [
      { to: '/reports',    icon: <HiDocumentReport className="w-4.5 h-4.5" />, label: 'Reports'     },
      { to: '/yearly',     icon: <HiCalendar className="w-4.5 h-4.5" />,       label: 'Yearly Summary'},
      { to: '/comparison', icon: <HiSwitchHorizontal className="w-4.5 h-4.5" />, label: 'Comparison'},
      { to: '/health',     icon: <HiHeart className="w-4.5 h-4.5" />,          label: 'Health Score'},
      { to: '/ai',         icon: <HiSparkles className="w-4.5 h-4.5" />,       label: 'AI Insights' },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/profile', icon: <HiUser className="w-4.5 h-4.5" />,         label: 'Profile' },
      { to: '/backup',  icon: <HiShieldCheck className="w-4.5 h-4.5" />,  label: 'Backup & Restore' },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-60
          bg-white dark:bg-gray-900
          border-r border-gray-100 dark:border-gray-800/80
          flex flex-col
          shadow-xl lg:shadow-none
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-extrabold text-lg text-primary-600 dark:text-primary-400 select-none"
            onClick={onClose}
          >
            <span className="text-2xl leading-none">💰</span>
            <span>MoneyMind</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden btn-icon"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 flex flex-col gap-0.5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="sidebar-group-label">{section.label}</p>
              {section.links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="shrink-0">{l.icon}</span>
                  <span className="truncate">{l.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/80 shrink-0">
          <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center select-none">
            MoneyMind · personal finance
          </p>
        </div>
      </aside>
    </>
  )
}
