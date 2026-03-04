import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { HiEye, HiEyeOff, HiSun, HiMoon } from 'react-icons/hi'
import { FcGoogle } from 'react-icons/fc'

export default function Auth() {
  const [params]           = useSearchParams()
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register')
  const [name, setName]    = useState('')
  const [email, setEmail]  = useState('')
  const [pass, setPass]    = useState('')
  const [showPw, setShowPw]= useState(false)
  const [busy, setBusy]    = useState(false)

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
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-purple-600 flex-col items-center justify-center p-12 text-white">
        <div className="text-6xl mb-6">💰</div>
        <h1 className="text-4xl font-extrabold mb-3">MoneyMind</h1>
        <p className="text-primary-100 text-center text-lg max-w-xs">
          Your smart personal finance tracker. Know where every taka goes.
        </p>
        <ul className="mt-10 space-y-3 text-sm text-primary-100">
          {['Track income & expenses', 'Upload receipts with Cloudinary', 'Beautiful charts & analytics', 'Set budgets per category', 'Dark mode & multi-currency'].map(t => (
            <li key={t} className="flex items-center gap-2">✅ {t}</li>
          ))}
        </ul>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950">
        {/* Theme toggle */}
        <button onClick={toggle} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition text-gray-500">
          {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-sm animate-fadeIn">
          <div className="text-center mb-8">
            <span className="text-5xl">💰</span>
            <h2 className="text-2xl font-extrabold mt-3">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p className="text-gray-400 text-sm mt-1">{isRegister ? 'Start tracking your money today' : 'Sign in to your dashboard'}</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition mb-5"
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
                <input className="input" type="text" placeholder="John Doe" value={name}
                  onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={pass} onChange={e => setPass(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy}
              className="btn-primary w-full text-center disabled:opacity-60 mt-2">
              {busy ? (isRegister ? 'Creating account…' : 'Signing in…') : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsRegister(r => !r)} className="text-primary-500 font-semibold hover:underline">
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
