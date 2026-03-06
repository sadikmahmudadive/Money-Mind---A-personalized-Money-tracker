import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HiSun, HiMoon, HiMenu, HiX, HiChevronDown, HiCog, HiLogout } from 'react-icons/hi'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/add':          'Add Transaction',
  '/budgets':      'Budgets',
  '/recurring':    'Recurring',
  '/goals':        'Savings Goals',
  '/splits':       'Split Expenses',
  '/converter':    'Currency Converter',
  '/reports':      'Reports',
  '/yearly':       'Yearly Summary',
  '/ai':           'AI Insights',
  '/profile':      'Profile',
}

export default function Navbar({ onMenuToggle, menuOpen }) {
  const { dark, toggle } = useTheme()
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'MoneyMind'

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    setDropOpen(false)
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const avatar   = profile?.photoURL || user?.photoURL
  const initials = (profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()
  const name     = profile?.name || user?.displayName || 'User'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 flex items-center px-4 gap-3 shadow-sm">

      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="btn-icon lg:hidden"
        aria-label="Toggle menu"
      >
        {menuOpen
          ? <HiX className="w-5 h-5" />
          : <HiMenu className="w-5 h-5" />}
      </button>

      {/* Logo (mobile only – desktop logo is in sidebar) */}
      <Link
        to="/dashboard"
        className="lg:hidden flex items-center gap-1.5 font-extrabold text-base text-primary-600 dark:text-primary-400 select-none"
      >
        <span className="text-xl">💰</span>
        <span>MoneyMind</span>
      </Link>

      {/* Page title (desktop) */}
      <h1 className="hidden lg:block text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
        {pageTitle}
      </h1>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="btn-icon"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark
          ? <HiSun className="w-5 h-5 text-amber-400" />
          : <HiMoon className="w-5 h-5" />}
      </button>

      {/* Avatar / dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen(d => !d)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
        >
          {avatar
            ? <img
                src={avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-300 dark:ring-primary-700"
              />
            : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {initials}
              </div>
          }
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[90px] truncate">
            {name}
          </span>
          <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropOpen && (
          <div className="absolute right-0 mt-2 w-52 card-glass shadow-card-lg py-1.5 animate-slideDown z-50">
            {/* User info */}
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60 mb-1">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>

            <button
              onClick={() => { navigate('/profile'); setDropOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HiCog className="w-4 h-4 text-gray-400" />
              Profile Settings
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <HiLogout className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
