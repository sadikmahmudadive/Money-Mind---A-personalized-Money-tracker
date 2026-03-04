import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { HiEye, HiEyeOff, HiSun, HiMoon } from 'react-icons/hi'
import { FcGoogle } from 'react-icons/fc'

const perks = [
  'Track income & expenses in ৳ BDT',
  'Upload receipts with Cloudinary',
  'AI-powered spending insights',
  'Set budgets per category',
  'Savings goals & recurring bills',
  'Beautiful charts & analytics',
]

export default function Auth() {
  const [params]            = useSearchParams()
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register')
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy]     = useState(false)

  const { register, login, loginWithGoogle, user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (isRegister) {
        if (!name.trim()) { toast.error('Name is required'); return }
        await register(email, pass, name)
        toast.success('Account created! Welcome 🎉')
      } else {
        await login(email, pass)
        toast.success('Welcome back!')
      }
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message ?? 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setBusy(true)
    try {
      await loginWithGoogle()
      toast.success('Signed in with Google!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message ?? 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#7c3aed 60%,#ec4899 100%)' }}
      >
        {/* Blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="text-7xl mb-6 animate-float">💰</div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">MoneyMind</h1>
          <p className="text-white/70 text-base max-w-xs mb-10">
            Your smart personal finance tracker.<br />Know where every taka goes.
          </p>
          <ul className="space-y-3 text-sm text-left">
            {perks.map(t => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950 relative">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="absolute top-4 right-4 btn-icon"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-sm animate-scaleIn">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-5xl">💰</span>
            <h2 className="text-2xl font-extrabold mt-3 text-gray-900 dark:text-white">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {isRegister ? 'Start tracking your money today' : 'Sign in to your dashboard'}
            </p>
          </div>

          {/* Card */}
          <div className="card-glass p-6 shadow-card-lg">

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-900 rounded-xl py-2.5 text-sm font-semibold
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95
                         disabled:opacity-60 shadow-sm mb-5"
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="label">Full Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Rahman Islam"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPw ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full text-center disabled:opacity-60 mt-2 py-3"
              >
                {busy
                  ? (isRegister ? 'Creating account…' : 'Signing in…')
                  : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-5">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setIsRegister(r => !r)}
              className="text-primary-500 font-semibold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
