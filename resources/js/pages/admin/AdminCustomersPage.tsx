import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Customer } from '@/types/admin'

export default function AdminCustomersPage() {
  const list = usePaginatedList<Customer>({ fetcher: api.getAdminCustomers, defaultSort: 'name' })

  const toggleApproved = async (c: Customer) => {
    await api.updateCustomer(c.id, { approved: !c.approved })
    list.reload()
  }

  const columns: Column<Customer>[] = [
    { key: 'name', label: 'Name', sortable: true, render: c => (
      <div><p className="font-600">{c.name}</p><p className="text-xs text-sage-500">{c.email}</p></div>
    )},
    { key: 'role', label: 'Role', render: c => <span className="capitalize text-xs font-600 px-2 py-0.5 rounded-full bg-cream-200">{c.role}</span> },
    { key: 'phone', label: 'Phone', render: c => c.phone || '—' },
    { key: 'orderCount', label: 'Orders', render: c => c.orderCount ?? 0 },
    { key: 'approved', label: 'Status', render: c => (
      <button onClick={() => toggleApproved(c)} className={`text-xs font-600 px-2 py-1 rounded-full ${c.approved ? 'bg-forest-100 text-forest-700' : 'bg-amber-100 text-amber-700'}`}>
        {c.approved ? 'Approved' : 'Pending'}
      </button>
    )},
    { key: 'createdAt', label: 'Joined', sortable: true, render: c => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-sans font-700 text-2xl text-forest-900">Customers</h1>
        <p className="text-sage-600 text-sm mt-1">Manage retail and wholesale customers</p>
      </div>
      <FilterBar
        search={list.search} onSearchChange={list.setSearch} placeholder="Search customers..."
        filters={[
          { key: 'role', label: 'Role', options: [{ value: 'customer', label: 'Customer' }, { value: 'wholesale', label: 'Wholesale' }] },
          { key: 'approved', label: 'Approval', options: [{ value: 'true', label: 'Approved' }, { value: 'false', label: 'Pending' }] },
        ]}
        filterValues={list.filters} onFilterChange={list.setFilter} onClear={list.clearFilters}
      />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={c => c.id} />
    </div>
  )
}
