import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  pending: '#e6c24a',
  processing: '#448647',
  shipped: '#336b36',
  delivered: '#2a562d',
  completed: '#244526',
  cancelled: '#e16338',
  refunded: '#af3725',
}

const TYPE_COLORS = ['#336b36', '#608d64', '#67a469']

interface StatusProps {
  data: Record<string, number>
}

export function OrderStatusPieChart({ data }: StatusProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    key: name,
  }))

  if (!chartData.length) {
    return <p className="text-sage-500 text-sm py-12 text-center">No orders yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map(entry => (
            <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? '#98c49a'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #c3ddc4', fontSize: 13 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function OrderTypeBarChart({ data }: StatusProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    orders: value,
  }))

  if (!chartData.length) {
    return <p className="text-sage-500 text-sm py-12 text-center">No order types.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0eee0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#608d64' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#608d64' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #c3ddc4', fontSize: 13 }} />
        <Bar dataKey="orders" radius={[8, 8, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface ProductProps {
  products: { name: string; sold: number; revenue: number }[]
}

export function TopProductsBarChart({ products }: ProductProps) {
  const chartData = products.slice(0, 6).map(p => ({
    name: p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name,
    sold: p.sold,
  }))

  if (!chartData.length) {
    return <p className="text-sage-500 text-sm py-12 text-center">No sales data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 44)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0eee0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#608d64' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#3c5b41' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #c3ddc4', fontSize: 13 }} />
        <Bar dataKey="sold" fill="#336b36" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MonthlyOrdersBarChart({ data }: { data: { month: string; orders: number; revenue: number }[] }) {
  const chartData = data.map(d => ({
    name: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    orders: d.orders,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0eee0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#608d64' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#608d64' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #c3ddc4', fontSize: 13 }} />
        <Bar dataKey="orders" fill="#608d64" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
