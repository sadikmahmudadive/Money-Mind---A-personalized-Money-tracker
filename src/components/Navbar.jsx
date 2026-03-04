import { Link, useNavigate } from 'react-router-dom'
import { HiSun, HiMoon, HiBell, HiMenu, HiX } from 'react-icons/hi'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar({ onMenuToggle, menuOpen }) {
  const { dark, toggle } = useTheme()
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const avatar = profile?.photoURL || user?.photoURL
  const initials = (profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        {menuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
      </button>

      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-lg text-primary-600 dark:text-primary-400 select-none">
        <span className="text-2xl">💰</span>
        <span className="hidden sm:block">MoneyMind</span>
      </Link>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
        title={dark ? 'Light mode' : 'Dark mode'}
      >
        {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
      </button>

      {/* Avatar / dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropOpen(d => !d)}
          className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {avatar
            ? <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200" />
            : <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">{initials}</div>
          }
        </button>

        {dropOpen && (
          <div className="absolute right-0 mt-2 w-48 card shadow-xl py-1 animate-fadeIn">
            <p className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
              {profile?.name || user?.displayName || 'User'}
            </p>
            <hr className="border-gray-100 dark:border-gray-800 my-1" />
            <button onClick={() => { navigate('/profile'); setDropOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Profile Settings
            </button>
            <button onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
