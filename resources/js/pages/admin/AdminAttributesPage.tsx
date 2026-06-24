import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Attribute } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm'
const labelClass = 'block text-xs font-600 text-forest-700 mb-1'

export default function AdminAttributesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Attribute | null>(null)
  const [form, setForm] = useState({ name: '', type: 'select', values: [{ value: '', colorCode: '' }] })
  const [saving, setSaving] = useState(false)

  const list = usePaginatedList<Attribute>({ fetcher: api.getAdminAttributes, defaultSort: 'name' })

  const openCreate = () => { setEditing(null); setForm({ name: '', type: 'select', values: [{ value: '', colorCode: '' }] }); setModalOpen(true) }
  const openEdit = (a: Attribute) => {
    setEditing(a)
    setForm({ name: a.name, type: a.type, values: a.values.length ? a.values.map(v => ({ value: v.value, colorCode: v.colorCode || '' })) : [{ value: '', colorCode: '' }] })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, values: form.values.filter(v => v.value) }
      if (editing) await api.updateAttribute(editing.id, payload)
      else await api.createAttribute(payload)
      setModalOpen(false); list.reload()
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  const columns: Column<Attribute>[] = [
    { key: 'name', label: 'Attribute', sortable: true, render: a => <span className="font-600">{a.name}</span> },
    { key: 'type', label: 'Type', render: a => <span className="capitalize">{a.type}</span> },
    { key: 'values', label: 'Values', render: a => <span className="text-sm text-sage-600">{a.values.map(v => v.value).join(', ')}</span> },
    { key: 'isActive', label: 'Status', render: a => <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? 'bg-forest-100 text-forest-700' : 'bg-sage-100'}`}>{a.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: '', render: a => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><Pencil className="w-4 h-4" /></button>
        <button onClick={async () => { if (confirm('Delete?')) { await api.deleteAttribute(a.id); list.reload() } }} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div><h1 className="font-sans font-700 text-2xl text-forest-900">Attributes</h1><p className="text-sage-600 text-sm">Color, size, and custom product attributes</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600"><Plus className="w-4 h-4" /> Add Attribute</button>
      </div>
      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search attributes..." onClear={list.clearFilters} />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={a => a.id} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Attribute' : 'Add Attribute'}>
        <div className="space-y-4">
          <div><label className={labelClass}>Name</label><input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className={labelClass}>Type</label>
            <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="select">Select</option><option value="color">Color</option><option value="text">Text</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Values</label>
            {form.values.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className={inputClass} placeholder="Value" value={v.value} onChange={e => { const vals = [...form.values]; vals[i] = { ...vals[i], value: e.target.value }; setForm(f => ({ ...f, values: vals })) }} />
                {form.type === 'color' && <input className="w-20 px-2 py-2 rounded-xl border" placeholder="#hex" value={v.colorCode} onChange={e => { const vals = [...form.values]; vals[i] = { ...vals[i], colorCode: e.target.value }; setForm(f => ({ ...f, values: vals })) }} />}
              </div>
            ))}
            <button type="button" onClick={() => setForm(f => ({ ...f, values: [...f.values, { value: '', colorCode: '' }] }))} className="text-sm text-forest-600 font-600">+ Add Value</button>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="text-sm text-sage-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
