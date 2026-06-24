import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Brand } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

export default function AdminBrandsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form, setForm] = useState({ name: '', logo: '', description: '', metaTitle: '', metaDescription: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const list = usePaginatedList<Brand>({ fetcher: api.getAdminBrands, defaultSort: 'name' })

  const openCreate = () => { setEditing(null); setForm({ name: '', logo: '', description: '', metaTitle: '', metaDescription: '', isActive: true }); setModalOpen(true) }
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, logo: b.logo || '', description: b.description || '', metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '', isActive: b.isActive }); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await api.updateBrand(editing.id, form)
      else await api.createBrand(form)
      setModalOpen(false); list.reload()
    } catch (e) { alert(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const columns: Column<Brand>[] = [
    { key: 'logo', label: '', className: 'w-14', render: b => b.logo ? <img src={b.logo} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-forest-100" /> },
    { key: 'name', label: 'Brand', sortable: true, render: b => <span className="font-600">{b.name}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'productCount', label: 'Products', render: b => b.productCount ?? 0 },
    { key: 'isActive', label: 'Status', render: b => <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${b.isActive ? 'bg-forest-100 text-forest-700' : 'bg-sage-100 text-sage-600'}`}>{b.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: '', render: b => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><Pencil className="w-4 h-4" /></button>
        <button onClick={async () => { if (confirm('Delete?')) { await api.deleteBrand(b.id); list.reload() } }} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-sans font-700 text-2xl text-forest-900">Brands</h1><p className="text-sage-600 text-sm mt-1">Manage product brands</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800"><Plus className="w-4 h-4" /> Add Brand</button>
      </div>
      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search brands..." onClear={list.clearFilters} />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={b => b.id} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Brand' : 'Add Brand'}>
        <div className="space-y-4">
          <div><label className={labelClass}>Name *</label><input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className={labelClass}>Logo URL</label><input className={inputClass} value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} /></div>
          <div><label className={labelClass}>Description</label><textarea rows={3} className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className={labelClass}>Meta Title</label><input className={inputClass} value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-sage-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
