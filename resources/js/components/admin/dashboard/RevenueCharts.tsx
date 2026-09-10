import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { ExtendedAdminStats } from '@/types/admin'

const FOREST = '#336b36'
const FOREST_LIGHT = '#67a469'

function formatMonth(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

interface Props {
  data: ExtendedAdminStats['monthlyRevenue']
}

export default function RevenueAreaChart({ data }: Props) {
  const chartData = data.map(d => ({
    name: formatMonth(d.month),
    revenue: d.revenue,
    orders: d.orders,
  }))

  if (!chartData.length) {
    return <p className="text-sage-500 text-sm py-16 text-center">No revenue data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={FOREST} stopOpacity={0.35} />
            <stop offset="100%" stopColor={FOREST} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0eee0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#608d64' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#608d64' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #c3ddc4', fontSize: 13 }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `$${value.toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Orders',
          ]}
        />
        <Area type="monotone" dataKey="revenue" stroke={FOREST} strokeWidth={2.5} fill="url(#revenueGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DailyRevenueChart({ data }: { data: ExtendedAdminStats['dailyRevenue'] }) {
  const chartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
    orders: d.orders,
  }))

  if (!chartData.length) {
    return <p className="text-sage-500 text-sm py-16 text-center">No recent sales.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={FOREST_LIGHT} stopOpacity={0.4} />
            <stop offset="100%" stopColor={FOREST_LIGHT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0eee0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#608d64' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#608d64' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #c3ddc4', fontSize: 12 }} />
        <Area type="monotone" dataKey="revenue" stroke={FOREST_LIGHT} strokeWidth={2} fill="url(#dailyGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
