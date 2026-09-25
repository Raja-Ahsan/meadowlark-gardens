import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import SettingImageUpload from '@/components/admin/SettingImageUpload'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { PlantTypeCategory } from '@/types'
import type { PaginatedMeta } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  image: '',
  sortOrder: 0,
  isPublished: true,
}

export default function AdminPlantTypeCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlantTypeCategory | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState<PlantTypeCategory[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({
    currentPage: 1, lastPage: 1, perPage: 15, total: 0, from: null, to: null,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('sort_order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.getAdminPlantTypeCategories({
        page,
        per_page: 15,
        search: search || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
      })
      setData(result.data ?? [])
      if (result.meta) setMeta(result.meta)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, search, sortBy, sortDir])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (key: string) => {
    const mapped = key === 'sortOrder' ? 'sort_order' : key
    if (sortBy === mapped) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(mapped)
      setSortDir('asc')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item: PlantTypeCategory) => {
    setEditing(item)
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      image: item.image || '',
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Title is required')
      return
    }
    setSaving(true)
    try {
      if (editing) await api.updatePlantTypeCategory(editing.id, form)
      else await api.createPlantTypeCategory(form)
      setModalOpen(false)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<PlantTypeCategory>[] = [
    {
      key: 'image',
      label: '',
      className: 'w-14',
      render: item =>
        item.image ? (
          <img src={mediaUrl(item.image)} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-forest-100" />
        ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: item => <span className="font-600">{item.title}</span>,
    },
    { key: 'slug', label: 'Slug' },
    {
      key: 'typeCount',
      label: 'Types',
      render: item => item.typeCount ?? 0,
    },
    {
      key: 'sortOrder',
      label: 'Order',
      sortable: true,
      render: item => item.sortOrder ?? 0,
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: item => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-600 ${
            item.isPublished ? 'bg-forest-100 text-forest-700' : 'bg-sage-100 text-sage-600'
          }`}
        >
          {item.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: item => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              if (!confirm('Delete this category? Types under it will become uncategorized.')) return
              await api.deletePlantTypeCategory(item.id)
              await load()
            }}
            className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-700 text-2xl text-forest-900">Plant Type Categories</h1>
          <p className="text-sage-600 text-sm mt-1">Tabs shown on the Plant Information page (Roses, Hydrangeas, etc.)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search categories..." onClear={() => setSearch('')} />

      <DataTable
        columns={columns}
        data={data}
        meta={meta}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        loading={loading}
        rowKey={c => c.id}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input className={inputClass} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto from title" />
          </div>
          <div>
            <label className={labelClass}>Excerpt</label>
            <textarea rows={3} className={inputClass} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
          </div>
          <div>
            <SettingImageUpload
              label="Image"
              value={form.image}
              onChange={url => setForm(f => ({ ...f, image: url }))}
              folder="plant-types"
            />
          </div>
          <div>
            <label className={labelClass}>Sort order</label>
            <input type="number" min={0} className={inputClass} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) || 0 }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
            Published
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm text-sage-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
