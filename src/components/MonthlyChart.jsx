import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { last6Months, isInMonth } from '../utils/dateHelpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card text-xs shadow-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function MonthlyChart({ transactions }) {
  const months = last6Months()

  const data = months.map(({ label, month }) => {
    const inc = transactions
      .filter(t => t.type === 'income'  && isInMonth(t.date, month))
      .reduce((s, t) => s + t.amount, 0)
    const exp = transactions
      .filter(t => t.type === 'expense' && isInMonth(t.date, month))
      .reduce((s, t) => s + t.amount, 0)
    return { name: label, Income: inc, Expenses: exp }
  })

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">6-Month Overview</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
          <YAxis tick={{ fontSize: 11 }} width={45} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Income"   fill="#10b981" radius={[4,4,0,0]} />
          <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
