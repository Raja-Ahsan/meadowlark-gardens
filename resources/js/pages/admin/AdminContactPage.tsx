import { Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'

interface ContactMsg { id: string; name: string; email: string; subject: string; message: string; createdAt: string }

export default function AdminContactPage() {
  const list = usePaginatedList<ContactMsg>({ fetcher: api.getContactMessages, defaultSort: 'created_at' })

  const columns: Column<ContactMsg>[] = [
    { key: 'name', label: 'From', sortable: true, render: m => (
      <div><p className="font-600">{m.name}</p><p className="text-xs text-sage-500">{m.email}</p></div>
    )},
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message', render: m => <p className="truncate max-w-xs text-sm">{m.message}</p> },
    { key: 'createdAt', label: 'Date', sortable: true, render: m => new Date(m.createdAt).toLocaleString() },
    { key: 'actions', label: '', render: m => (
      <button onClick={async () => { if (confirm('Delete?')) { await api.deleteContactMessage(m.id); list.reload() } }} className="p-2 text-terra-600 hover:bg-terra-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
    )},
  ]

  return (
    <div className="space-y-4">
      <div><h1 className="font-sans font-700 text-2xl text-forest-900">Contact Messages</h1><p className="text-sage-600 text-sm">Messages from the contact form</p></div>
      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search messages..." onClear={list.clearFilters} />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={m => m.id} />
    </div>
  )
}
