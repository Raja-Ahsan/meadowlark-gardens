import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Loader2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminOrderDetailModal from '@/components/admin/AdminOrderDetailModal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import { showToastError, showToastSuccess } from '@/lib/toast'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setSelectedIds(new Set())
  }, [list.search, list.filters, list.sortBy, list.sortDir])

  const pageIds = useMemo(() => list.data.map(o => o.id), [list.data])
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id))
  const somePageSelected = pageIds.some(id => selectedIds.has(id)) && !allPageSelected
  const hasActiveFilters = Boolean(
    list.search.trim() || Object.values(list.filters).some(v => Boolean(v)),
  )

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllPage = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allPageSelected) {
        pageIds.forEach(id => next.delete(id))
      } else {
        pageIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await api.updateOrderStatus(id, status)
      showToastSuccess(res.message || 'Order status updated.')
      list.reload()
    } catch (e) {
      showToastError(e instanceof Error ? e.message : 'Unable to update order status.')
      list.reload()
    }
  }

  const runExport = async (mode: 'all' | 'selected' | 'filtered') => {
    if (exporting) return

    if (mode === 'selected' && selectedIds.size === 0) {
      showToastError('Please select at least one order to export.')
      setExportOpen(false)
      return
    }

    setExporting(true)
    setExportOpen(false)
    try {
      await api.exportAdminOrders({
        mode,
        ids: mode === 'selected' ? [...selectedIds] : undefined,
        search: mode === 'filtered' ? (list.search || undefined) : undefined,
        status: mode === 'filtered' ? (list.filters.status || undefined) : undefined,
        type: mode === 'filtered' ? (list.filters.type || undefined) : undefined,
        date_from: mode === 'filtered' ? (list.filters.date_from || undefined) : undefined,
        date_to: mode === 'filtered' ? (list.filters.date_to || undefined) : undefined,
        sort_by: list.sortBy,
        sort_dir: list.sortDir,
      })
      showToastSuccess('Orders exported successfully.')
    } catch (e) {
      showToastError(e instanceof Error ? e.message : 'Unable to export orders. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const columns: Column<Order>[] = [
    {
      key: 'select',
      label: '',
      className: 'w-10',
      render: o => (
        <input
          type="checkbox"
          checked={selectedIds.has(o.id)}
          onChange={() => toggleOne(o.id)}
          className="rounded border-forest-300 text-forest-600 focus:ring-forest-500"
          aria-label={`Select order ${o.orderNumber}`}
        />
      ),
    },
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

  // Custom header cell for select-all — DataTable uses column.label as string.
  // We inject select-all via a small bar above the table instead of hacking DataTable.
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-sans font-700 text-2xl text-forest-900">Orders</h1>
          <p className="text-sage-600 text-sm mt-1">Manage and track all orders — click View for full billing, shipping, and product details.</p>
        </div>

        <div className="relative">
          <button
            type="button"
            disabled={exporting}
            onClick={() => setExportOpen(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 text-white text-sm font-sans font-600 hover:bg-forest-800 disabled:opacity-60 transition-colors"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting…' : 'Export Orders'}
          </button>

          {exportOpen && !exporting && (
            <>
              <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close export menu" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 mt-2 z-20 w-64 rounded-xl border border-forest-100 bg-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => runExport('selected')}
                  className="w-full text-left px-4 py-3 text-sm text-forest-800 hover:bg-cream-50 border-b border-forest-50"
                >
                  <span className="font-600">Export Selected</span>
                  <span className="block text-xs text-sage-500 mt-0.5">{selectedIds.size} selected</span>
                </button>
                <button
                  type="button"
                  onClick={() => runExport('filtered')}
                  className="w-full text-left px-4 py-3 text-sm text-forest-800 hover:bg-cream-50 border-b border-forest-50"
                >
                  <span className="font-600">Export Filtered Orders</span>
                  <span className="block text-xs text-sage-500 mt-0.5">
                    {hasActiveFilters ? 'Uses current search & filters' : 'No filters — same as all'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => runExport('all')}
                  className="w-full text-left px-4 py-3 text-sm text-forest-800 hover:bg-cream-50"
                >
                  <span className="font-600">Export All</span>
                  <span className="block text-xs text-sage-500 mt-0.5">Every order in the system</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FilterBar
        search={list.search} onSearchChange={list.setSearch} placeholder="Search orders..."
        filters={[
          { key: 'status', label: 'Status', options: statuses.map(s => ({ value: s, label: s })) },
          { key: 'type', label: 'Type', options: [{ value: 'retail', label: 'Retail' }, { value: 'wholesale', label: 'Wholesale' }] },
        ]}
        filterValues={list.filters} onFilterChange={list.setFilter} onClear={list.clearFilters}
      />

      <div className="flex flex-wrap items-center gap-3 px-1">
        <label className="inline-flex items-center gap-2 text-sm text-forest-700 font-sans font-600">
          <input
            type="checkbox"
            checked={allPageSelected}
            ref={el => {
              if (el) el.indeterminate = somePageSelected
            }}
            onChange={toggleAllPage}
            className="rounded border-forest-300 text-forest-600 focus:ring-forest-500"
          />
          Select all on this page
        </label>
        {selectedIds.size > 0 && (
          <span className="text-sm font-sans font-600 text-forest-700 bg-forest-50 px-3 py-1 rounded-lg">
            {selectedIds.size} order{selectedIds.size === 1 ? '' : 's'} selected
          </span>
        )}
      </div>

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
