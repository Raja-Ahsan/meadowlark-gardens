import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign, ShoppingBag, Users, Package, AlertTriangle, Star,
  Download, ClipboardList, ArrowRight, TrendingUp, Box, ExternalLink,
} from 'lucide-react'
import { api } from '@/lib/api'
import type { ExtendedAdminStats } from '@/types/admin'
import DashboardStatCard, { pctChange } from '@/components/admin/dashboard/DashboardStatCard'
import RevenueAreaChart, { DailyRevenueChart } from '@/components/admin/dashboard/RevenueCharts'
import {
  OrderStatusPieChart, OrderTypeBarChart, TopProductsBarChart, MonthlyOrdersBarChart,
} from '@/components/admin/dashboard/ReportCharts'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-forest-100 text-forest-800',
  completed: 'bg-forest-100 text-forest-800',
  cancelled: 'bg-terra-100 text-terra-800',
  refunded: 'bg-sage-100 text-sage-700',
}

function ChartCard({ title, subtitle, children, className = '' }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-forest-50">
        <h2 className="font-sans font-700 text-forest-900">{title}</h2>
        {subtitle && <p className="text-xs text-sage-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<ExtendedAdminStats | null>(null)

  useEffect(() => {
    api.getAdminStats().then(r => setStats(r.stats)).catch(() => {})
  }, [])

  const handleExport = async (type: 'orders' | 'products' | 'customers') => {
    const res = await api.exportData(type)
    const csv = [
      Object.keys(res.data[0] || {}).join(','),
      ...res.data.map(row => Object.values(row).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-export.csv`
    a.click()
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="w-10 h-10 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
        <p className="text-sm text-sage-500">Loading analytics…</p>
      </div>
    )
  }

  const revenueTrend = pctChange(stats.revenueThisMonth, stats.revenueLastMonth)
  const ordersTrend = pctChange(stats.ordersThisMonth, stats.ordersLastMonth)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const alerts = [
    stats.pendingApplications > 0 && { label: `${stats.pendingApplications} wholesale applications pending`, to: '/admin/wholesalers', color: 'text-amber-700 bg-amber-50' },
    stats.lowStockProducts > 0 && { label: `${stats.lowStockProducts} products low on stock`, to: '/admin/products', color: 'text-amber-700 bg-amber-50' },
    stats.outOfStock > 0 && { label: `${stats.outOfStock} products out of stock`, to: '/admin/products', color: 'text-terra-700 bg-terra-50' },
    stats.pendingReviews > 0 && { label: `${stats.pendingReviews} reviews awaiting approval`, to: '/admin/reviews', color: 'text-violet-700 bg-violet-50' },
  ].filter(Boolean) as { label: string; to: string; color: string }[]

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 text-white p-6 lg:p-8 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,#67a469_0%,transparent_50%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-forest-300 text-sm font-sans">{today}</p>
            <h1 className="font-display font-700 text-2xl lg:text-3xl mt-1">Store Analytics</h1>
            <p className="text-forest-200 text-sm mt-2 max-w-xl">
              Real-time overview of revenue, orders, inventory, and customer activity across Meadowlark Gardens.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['orders', 'products', 'customers'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleExport(t)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-sans font-600 transition-colors backdrop-blur-sm"
              >
                <Download className="w-4 h-4" />
                Export {t}
              </button>
            ))}
            <Link
              to="/admin/orders"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-100 text-forest-900 text-sm font-sans font-700 hover:bg-white transition-colors"
            >
              View orders <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-sans font-700 transition-colors"
            >
              Visit website <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={revenueTrend}
          accent="forest"
        />
        <DashboardStatCard
          label="This Month Revenue"
          value={`$${stats.revenueThisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          trend={revenueTrend}
          accent="blue"
        />
        <DashboardStatCard
          label="Total Orders"
          value={String(stats.totalOrders)}
          icon={ShoppingBag}
          trend={ordersTrend}
          accent="violet"
        />
        <DashboardStatCard
          label="Customers"
          value={String(stats.totalCustomers)}
          icon={Users}
          accent="sage"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { icon: Package, label: 'Products', value: stats.totalProducts, color: 'text-forest-700 bg-forest-50' },
          { icon: Users, label: 'Wholesalers', value: stats.activeWholesalers, color: 'text-indigo-700 bg-indigo-50' },
          { icon: AlertTriangle, label: 'Low Stock', value: stats.lowStockProducts, color: 'text-amber-700 bg-amber-50' },
          { icon: Box, label: 'Out of Stock', value: stats.outOfStock, color: 'text-terra-700 bg-terra-50' },
          { icon: Star, label: 'Pending Reviews', value: stats.pendingReviews, color: 'text-violet-700 bg-violet-50' },
          { icon: ClipboardList, label: 'Wholesale Apps', value: stats.pendingApplications, color: 'text-blue-700 bg-blue-50' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-forest-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
              <m.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-sans font-700 text-forest-900 leading-none">{m.value}</p>
              <p className="text-[10px] text-sage-500 mt-1 uppercase tracking-wide font-600">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts strip */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map(a => (
            <Link
              key={a.to}
              to={a.to}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans font-600 ${a.color} hover:opacity-90 transition-opacity`}
            >
              <AlertTriangle className="w-4 h-4" />
              {a.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ))}
        </div>
      )}

      {/* Main charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Revenue Overview" subtitle="Last 12 months" className="lg:col-span-2">
          <RevenueAreaChart data={stats.monthlyRevenue} />
        </ChartCard>
        <ChartCard title="Orders by Status" subtitle="All-time distribution">
          <OrderStatusPieChart data={stats.ordersByStatus} />
        </ChartCard>
      </div>

      {/* Second charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Daily Revenue" subtitle="Last 14 days">
          <DailyRevenueChart data={stats.dailyRevenue} />
        </ChartCard>
        <ChartCard title="Monthly Orders" subtitle="Order volume trend">
          <MonthlyOrdersBarChart data={stats.monthlyRevenue} />
        </ChartCard>
        <ChartCard title="Retail vs Wholesale" subtitle="Orders by channel">
          <OrderTypeBarChart data={stats.ordersByType} />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-5 gap-6">
        <ChartCard title="Top Selling Products" subtitle="By units sold" className="lg:col-span-2">
          <TopProductsBarChart products={stats.topProducts} />
        </ChartCard>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-forest-50 flex items-center justify-between">
            <div>
              <h2 className="font-sans font-700 text-forest-900">Recent Orders</h2>
              <p className="text-xs text-sage-500 mt-0.5">Latest transactions</p>
            </div>
            <Link to="/admin/orders" className="text-sm font-sans font-600 text-forest-700 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-sage-500 border-b border-forest-50">
                  <th className="px-6 py-3 font-600">Order</th>
                  <th className="px-4 py-3 font-600">Customer</th>
                  <th className="px-4 py-3 font-600">Type</th>
                  <th className="px-4 py-3 font-600">Total</th>
                  <th className="px-4 py-3 font-600">Status</th>
                  <th className="px-6 py-3 font-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sage-500">No orders yet.</td>
                  </tr>
                ) : (
                  stats.recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-forest-50 last:border-0 hover:bg-cream-50/50">
                      <td className="px-6 py-3.5 font-mono text-xs text-forest-800">{o.orderNumber}</td>
                      <td className="px-4 py-3.5 text-forest-800 font-600 truncate max-w-[140px]">{o.customer}</td>
                      <td className="px-4 py-3.5 capitalize text-sage-600">{o.type}</td>
                      <td className="px-4 py-3.5 font-700 text-forest-900">${o.total.toFixed(2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-600 capitalize ${statusStyles[o.status] ?? 'bg-sage-100 text-sage-700'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sage-500 text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
