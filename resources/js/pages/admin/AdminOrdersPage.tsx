import { useState } from 'react'
import { Eye } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminOrderDetailModal from '@/components/admin/AdminOrderDetailModal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Order } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-forest-100 text-forest-700',
  completed: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-sage-100 text-sage-600',
  refunded: 'bg-terra-100 text-terra-700',
}

const statuses = ['pending', 'processing', 'paid', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']

export default function AdminOrdersPage() {
  const list = usePaginatedList<Order>({ fetcher: api.getAdminOrders, defaultSort: 'created_at' })
  const [viewOrderId, setViewOrderId] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    await api.updateOrderStatus(id, status)
    list.reload()
  }

  const columns: Column<Order>[] = [
    { key: 'orderNumber', label: 'Order #', sortable: true, render: o => <span className="font-mono font-600">{o.orderNumber}</span> },
    { key: 'customerName', label: 'Customer', render: o => (
      <div><p className="font-600">{o.customerName || o.businessName}</p>
      <p className="text-xs text-sage-500">{o.customerEmail}</p></div>
    )},
    { key: 'type', label: 'Type', render: o => <span className="capitalize text-xs font-600 px-2 py-0.5 rounded-full bg-cream-200">{o.type}</span> },
    { key: 'total', label: 'Total', sortable: true, render: o => `$${o.total.toFixed(2)}` },
    { key: 'createdAt', label: 'Date', sortable: true, render: o => new Date(o.createdAt).toLocaleDateString() },
    { key: 'status', label: 'Status', sortable: true, render: o => (
      <select
        value={o.status}
        onChange={e => updateStatus(o.id, e.target.value)}
        className={`text-xs font-600 px-2 py-1 rounded-lg border-0 cursor-pointer ${statusColors[o.status] || 'bg-sage-100'}`}
      >
        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    { key: 'actions', label: '', render: o => (
      <button
        type="button"
        onClick={() => setViewOrderId(o.id)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 text-forest-700 bg-forest-50 hover:bg-forest-100 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>
    )},
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-sans font-700 text-2xl text-forest-900">Orders</h1>
        <p className="text-sage-600 text-sm mt-1">Manage and track all orders — click View for full billing, shipping, and product details.</p>
      </div>
      <FilterBar
        search={list.search} onSearchChange={list.setSearch} placeholder="Search orders..."
        filters={[
          { key: 'status', label: 'Status', options: statuses.map(s => ({ value: s, label: s })) },
          { key: 'type', label: 'Type', options: [{ value: 'retail', label: 'Retail' }, { value: 'wholesale', label: 'Wholesale' }] },
        ]}
        filterValues={list.filters} onFilterChange={list.setFilter} onClear={list.clearFilters}
      />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={o => o.id} />

      <AdminOrderDetailModal
        orderId={viewOrderId}
        open={!!viewOrderId}
        onClose={() => setViewOrderId(null)}
        onUpdated={list.reload}
      />
    </div>
  )
}
