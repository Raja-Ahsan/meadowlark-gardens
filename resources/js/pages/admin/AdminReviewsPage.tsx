import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Review } from '@/types/admin'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-forest-100 text-forest-700',
  rejected: 'bg-terra-100 text-terra-700',
}

export default function AdminReviewsPage() {
  const list = usePaginatedList<Review>({ fetcher: api.getAdminReviews, defaultSort: 'created_at' })

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await api.updateReviewStatus(id, status)
    list.reload()
  }

  const columns: Column<Review>[] = [
    { key: 'productName', label: 'Product', render: r => <span className="font-600">{r.productName}</span> },
    { key: 'userName', label: 'Customer', render: r => r.userName },
    { key: 'rating', label: 'Rating', sortable: true, render: r => (
      <div className="flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-sage-300'}`} />
      ))}</div>
    )},
    { key: 'body', label: 'Review', render: r => <p className="truncate max-w-xs text-sm">{r.body}</p> },
    { key: 'status', label: 'Status', render: r => <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${statusColors[r.status]}`}>{r.status}</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-1">
        {r.status === 'pending' && <>
          <button onClick={() => updateStatus(r.id, 'approved')} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><CheckCircle className="w-4 h-4" /></button>
          <button onClick={() => updateStatus(r.id, 'rejected')} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><XCircle className="w-4 h-4" /></button>
        </>}
        <button onClick={async () => { if (confirm('Delete?')) { await api.deleteReview(r.id); list.reload() } }} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div><h1 className="font-sans font-700 text-2xl text-forest-900">Reviews</h1><p className="text-sage-600 text-sm mt-1">Moderate customer product reviews</p></div>
      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search reviews..." filters={[
        { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] },
        { key: 'rating', label: 'Rating', options: [1,2,3,4,5].map(n => ({ value: String(n), label: `${n} Star${n>1?'s':''}` })) },
      ]} filterValues={list.filters} onFilterChange={list.setFilter} onClear={list.clearFilters} />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={r => r.id} />
    </div>
  )
}
