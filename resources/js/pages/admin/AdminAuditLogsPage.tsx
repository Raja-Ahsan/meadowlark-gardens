import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'

interface AuditEntry { id: string; action: string; userName: string; modelType?: string; ipAddress?: string; createdAt: string }

export default function AdminAuditLogsPage() {
  const list = usePaginatedList<AuditEntry>({ fetcher: api.getAuditLogs, defaultSort: 'created_at' })

  const columns: Column<AuditEntry>[] = [
    { key: 'action', label: 'Action', sortable: true, render: e => <span className="font-mono text-sm text-forest-800">{e.action}</span> },
    { key: 'userName', label: 'User' },
    { key: 'modelType', label: 'Model', render: e => e.modelType || '—' },
    { key: 'ipAddress', label: 'IP', render: e => <span className="font-mono text-xs">{e.ipAddress || '—'}</span> },
    { key: 'createdAt', label: 'Date', sortable: true, render: e => new Date(e.createdAt).toLocaleString() },
  ]

  return (
    <div className="space-y-4">
      <div><h1 className="font-sans font-700 text-2xl text-forest-900">Audit Logs</h1><p className="text-sage-600 text-sm">Security and activity tracking</p></div>
      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search logs..." onClear={list.clearFilters} />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={e => e.id} />
    </div>
  )
}
