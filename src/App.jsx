import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar  from './components/Navbar'
import Sidebar from './components/Sidebar'

import Landing        from './pages/Landing'
import Auth           from './pages/Auth'
import Dashboard      from './pages/Dashboard'
import Transactions   from './pages/Transactions'
import AddTransaction from './pages/AddTransaction'
import EditTransaction from './pages/EditTransaction'
import BudgetManager  from './pages/BudgetManager'
import Reports        from './pages/Reports'
import Profile        from './pages/Profile'
import AIInsights     from './pages/AIInsights'
import Recurring      from './pages/Recurring'
import SavingsGoals   from './pages/SavingsGoals'
import SplitExpenses  from './pages/SplitExpenses'
import YearlySummary  from './pages/YearlySummary'
import CurrencyConverter from './pages/CurrencyConverter'

function AppLayout({ children }) {
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSideOpen(s => !s)} menuOpen={sideOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white text-sm',
              duration: 3000,
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/"     element={<Landing />} />
            <Route path="/auth" element={<Auth />}    />

            {/* Protected — wrapped in AppLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <AppLayout><Transactions /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute>
                <AppLayout><AddTransaction /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <AppLayout><EditTransaction /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/budgets" element={
              <ProtectedRoute>
                <AppLayout><BudgetManager /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/recurring" element={
              <ProtectedRoute>
                <AppLayout><Recurring /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <AppLayout><SavingsGoals /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/splits" element={
              <ProtectedRoute>
                <AppLayout><SplitExpenses /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout><Reports /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai" element={
              <ProtectedRoute>
                <AppLayout><AIInsights /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/yearly" element={
              <ProtectedRoute>
                <AppLayout><YearlySummary /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/converter" element={
              <ProtectedRoute>
                <AppLayout><CurrencyConverter /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
