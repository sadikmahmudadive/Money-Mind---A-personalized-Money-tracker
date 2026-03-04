import { format, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval } from 'date-fns'

export { format, parseISO }

export function thisMonthRange() {
  const now = new Date()
  return { start: startOfMonth(now), end: endOfMonth(now) }
}

export function monthLabel(date = new Date()) {
  return format(date, 'MMM yyyy')
}

export function last6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    return { label: format(d, 'MMM'), month: format(d, 'yyyy-MM') }
  })
}

export function toDateString(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return format(d, 'dd MMM yyyy')
}

export function isInMonth(ts, month) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  const [y, m] = month.split('-').map(Number)
  const start = startOfMonth(new Date(y, m - 1))
  const end   = endOfMonth(new Date(y, m - 1))
  return isWithinInterval(d, { start, end })
}
