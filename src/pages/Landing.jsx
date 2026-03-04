import { Link } from 'react-router-dom'
import { HiCheckCircle, HiChartBar, HiLockClosed, HiUpload, HiLightningBolt, HiRefresh, HiFlag, HiSparkles } from 'react-icons/hi'
import { useTheme } from '../context/ThemeContext'
import { HiSun, HiMoon } from 'react-icons/hi'

const features = [
  { icon: '📊', color: 'from-primary-400 to-primary-600',   title: 'Real-time Analytics',    desc: 'Beautiful charts and instant dashboards that update as you track.' },
  { icon: '📎', color: 'from-emerald-400 to-emerald-600',   title: 'Receipt Upload',          desc: 'Attach photos of receipts to any transaction via Cloudinary.' },
  { icon: '🔒', color: 'from-purple-400 to-purple-600',     title: 'Secure & Private',        desc: 'Per-user Firestore isolation. Your data, only yours.' },
  { icon: '🔔', color: 'from-orange-400 to-orange-600',     title: 'Budget Alerts',           desc: 'Get notified before you overspend any category.' },
  { icon: '🤖', color: 'from-pink-400 to-rose-500',         title: 'AI Insights',             desc: 'Llama-powered analysis of your spending patterns.' },
  { icon: '🔁', color: 'from-cyan-400 to-cyan-600',         title: 'Recurring Transactions',  desc: 'Auto-apply monthly bills and subscriptions.' },
  { icon: '🎯', color: 'from-amber-400 to-amber-600',       title: 'Savings Goals',           desc: 'Set targets and watch your progress bar grow.' },
  { icon: '📤', color: 'from-indigo-400 to-indigo-600',     title: 'CSV Import',              desc: 'Bulk import transactions from any bank export.' },
]

const stats = [
  { label: 'Users Tracking',       value: '10K+' },
  { label: 'Transactions Logged',  value: '500K+' },
  { label: 'Categories',           value: '16+'  },
  { label: 'Currencies Supported', value: '7+'   },
]

export default function Landing() {
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-xl text-primary-600 dark:text-primary-400">
            <span className="text-3xl leading-none">💰</span> MoneyMind
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="btn-icon"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <Link to="/auth" className="btn-secondary text-sm">Login</Link>
            <Link to="/auth?mode=register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-28 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/40 dark:bg-primary-800/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-200/40 dark:bg-purple-800/20 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            🚀 Smart Personal Finance for Bangladesh
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
            Take Control of<br />
            <span className="gradient-text">Your Money</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            Log income &amp; expenses in ৳ BDT, upload receipts, set budgets,
            and get AI-powered insights — all in one beautiful dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?mode=register" className="btn-primary text-base px-8 py-3 rounded-xl">
              Start for Free →
            </Link>
            <Link to="/auth" className="btn-secondary text-base px-8 py-3 rounded-xl">
              Sign In
            </Link>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative mt-20 max-w-4xl w-full mx-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-slideUp">
          <div className="bg-gray-800 dark:bg-gray-950 px-4 py-2.5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="flex-1 text-center text-gray-500 text-xs font-mono">moneymind.app/dashboard</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Balance card */}
            <div className="sm:col-span-3 rounded-xl text-white p-5"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)' }}
            >
              <p className="text-white/60 text-xs mb-1 uppercase tracking-widest font-semibold">Current Balance (BDT)</p>
              <p className="text-4xl font-extrabold">৳42,350.00</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-emerald-200 text-[11px] font-bold uppercase tracking-wide mb-1">↑ Income</p>
                  <p className="font-bold text-lg">৳75,000</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-red-200 text-[11px] font-bold uppercase tracking-wide mb-1">↓ Expenses</p>
                  <p className="font-bold text-lg">৳32,650</p>
                </div>
              </div>
            </div>
            {['🍔 Food — ৳8,200', '🏠 Rent — ৳15,000', '🚗 Transport — ৳3,500'].map(t => (
              <div key={t} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="text-white/70 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">Features</p>
          <h2 className="text-3xl font-extrabold text-center mb-3 text-gray-900 dark:text-white">Everything you need</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Powerful features wrapped in a delightful interface
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div
                key={f.title}
                className="group card-hover p-5 flex flex-col gap-3 hover:border-primary-200 dark:hover:border-primary-700"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl shadow-sm`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 to-purple-600 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to master your money?</h2>
        <p className="text-white/70 mb-8 text-lg">Join thousands of Bangladeshis tracking smarter.</p>
        <Link
          to="/auth?mode=register"
          className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-xl
                     hover:bg-primary-50 transition-all active:scale-95 shadow-lg text-lg"
        >
          Create Free Account →
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-500 text-center py-6 text-sm">
        © {new Date().getFullYear()} MoneyMind. Built with ❤️ using React, Firebase &amp; Cloudinary.
      </footer>
    </div>
  )
}
      {/* Navbar */}
      <nav className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-xl text-primary-600 dark:text-primary-400">
            <span className="text-3xl">💰</span> MoneyMind
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500">
              {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <Link to="/auth" className="btn-secondary text-sm">Login</Link>
            <Link to="/auth?mode=register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-3xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🚀 Smart Personal Finance Tracker
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Take Control of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
              Your Money
            </span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto text-balance">
            Log income & expenses, upload receipts, set budgets, and visualize your financial
            health — all in one beautiful, real-time dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?mode=register" className="btn-primary text-base px-8 py-3">
              Start for Free →
            </Link>
            <Link to="/auth" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="mt-20 max-w-4xl w-full mx-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2.5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="flex-1 text-center text-gray-400 text-xs">moneymind.app/dashboard</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white p-5">
              <p className="text-primary-100 text-sm mb-1">💰 Current Balance (BDT)</p>
              <p className="text-4xl font-extrabold">৳42,350.00</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-emerald-200 text-xs mb-1">↑ Income</p>
                  <p className="font-bold">৳75,000</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-red-200 text-xs mb-1">↓ Expenses</p>
                  <p className="font-bold">৳32,650</p>
                </div>
              </div>
            </div>
            {['🍔 Food — ৳8,200', '🏠 Rent — ৳15,000', '🚗 Transport — ৳3,500'].map(t => (
              <div key={t} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 dark:bg-primary-800 py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="text-primary-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-3">Everything you need</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Powerful features wrapped in a delightful interface
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="card flex gap-4">
                <div className="shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 to-purple-600 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-4">Ready to master your money?</h2>
        <p className="text-primary-100 mb-8 text-lg">Join thousands of Bangladeshis tracking smarter.</p>
        <Link to="/auth?mode=register" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-xl hover:bg-primary-50 transition-all active:scale-95 shadow-lg text-lg">
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © {new Date().getFullYear()} MoneyMind. Built with ❤️ using React, Firebase & Cloudinary.
      </footer>
    </div>
  )
}
