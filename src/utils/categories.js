export const CATEGORIES = [
  { name: 'Food',          icon: '🍔', color: '#f59e0b', type: 'expense' },
  { name: 'Rent',          icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { name: 'Transport',     icon: '🚗', color: '#3b82f6', type: 'expense' },
  { name: 'Health',        icon: '💊', color: '#ec4899', type: 'expense' },
  { name: 'Entertainment', icon: '🎮', color: '#06b6d4', type: 'expense' },
  { name: 'Shopping',      icon: '🛍️', color: '#f97316', type: 'expense' },
  { name: 'Education',     icon: '📚', color: '#6366f1', type: 'expense' },
  { name: 'Utilities',     icon: '💡', color: '#eab308', type: 'expense' },
  { name: 'Travel',        icon: '✈️', color: '#14b8a6', type: 'expense' },
  { name: 'Savings',       icon: '🏦', color: '#10b981', type: 'expense' },
  { name: 'Other',         icon: '📦', color: '#9ca3af', type: 'expense' },
  // income
  { name: 'Salary',        icon: '💼', color: '#10b981', type: 'income' },
  { name: 'Freelance',     icon: '💻', color: '#0ea5e9', type: 'income' },
  { name: 'Gifts',         icon: '🎁', color: '#f43f5e', type: 'income' },
  { name: 'Investment',    icon: '📈', color: '#8b5cf6', type: 'income' },
  { name: 'Other Income',  icon: '💰', color: '#6366f1', type: 'income' },
]

export function getCategoryMeta(name) {
  return CATEGORIES.find(c => c.name === name) ?? { name, icon: '📦', color: '#9ca3af' }
}
