import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Category } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

export default function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', parentId: '', isActive: true, sortOrder: 0, image: '', metaTitle: '', metaDescription: '' })
  const [saving, setSaving] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  const list = usePaginatedList<Category>({ fetcher: api.getAdminCategories, defaultSort: 'sort_order', defaultPerPage: 15 })

  const loadAll = () => api.getAllCategories().then(r => setAllCategories(r.categories)).catch(() => {})

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', parentId: '', isActive: true, sortOrder: 0, image: '', metaTitle: '', metaDescription: '' })
    loadAll()
    setModalOpen(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, description: c.description || '', parentId: c.parentId || '', isActive: c.isActive, sortOrder: c.sortOrder, image: c.image || '', metaTitle: c.metaTitle || '', metaDescription: c.metaDescription || '' })
    loadAll()
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, parentId: form.parentId || null }
      if (editing) await api.updateCategory(editing.id, payload)
      else await api.createCategory(payload)
      setModalOpen(false)
      list.reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Category>[] = [
    { key: 'name', label: 'Name', sortable: true, render: c => (
      <div>
        <p className="font-600">{c.name}</p>
        {c.parentName && <p className="text-xs text-sage-500">Parent: {c.parentName}</p>}
      </div>
    )},
    { key: 'slug', label: 'Slug' },
    { key: 'productCount', label: 'Products', render: c => c.productCount ?? 0 },
    { key: 'isActive', label: 'Status', render: c => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${c.isActive ? 'bg-forest-100 text-forest-700' : 'bg-sage-100 text-sage-600'}`}>
        {c.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: '', render: c => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><Pencil className="w-4 h-4" /></button>
        <button onClick={async () => { if (confirm('Delete?')) { await api.deleteCategory(c.id); list.reload() } }} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-700 text-2xl text-forest-900">Categories</h1>
          <p className="text-sage-600 text-sm mt-1">Organize products into categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search categories..." onClear={list.clearFilters} />

      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={c => c.id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div><label className={labelClass}>Name *</label><input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className={labelClass}>Parent Category</label>
            <select className={inputClass} value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
              <option value="">None (Top Level)</option>
              {allCategories.filter(c => c.id !== editing?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Description</label><textarea rows={3} className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className={labelClass}>Image URL</label><input className={inputClass} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} /></div>
          <div><label className={labelClass}>Meta Title</label><input className={inputClass} value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} /></div>
          <div><label className={labelClass}>Meta Description</label><textarea rows={2} className={inputClass} value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm text-sage-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
