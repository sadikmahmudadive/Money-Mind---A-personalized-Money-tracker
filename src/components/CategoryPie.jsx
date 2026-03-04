import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getCategoryMeta } from '../utils/categories'

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function CategoryPie({ transactions, title = 'Spending by Category' }) {
  const expenses = transactions.filter(t => t.type === 'expense')

  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {})

  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, ...getCategoryMeta(name) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-52 text-gray-400 text-sm">
        No expense data yet
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={90}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => v.toLocaleString()}
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v, entry) => `${entry.payload.icon} ${v}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
