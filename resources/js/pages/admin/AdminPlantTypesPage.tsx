import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import RichTextEditor from '@/components/admin/RichTextEditor'
import SettingImageUpload from '@/components/admin/SettingImageUpload'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { PlantType } from '@/types'
import type { PaginatedMeta } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  sortOrder: 0,
  isPublished: true,
  metaTitle: '',
  metaDescription: '',
}

const sortKeyMap: Record<string, string> = {
  title: 'title',
  sortOrder: 'sort_order',
  sort_order: 'sort_order',
}

export default function AdminPlantTypesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlantType | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState<PlantType[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({
    currentPage: 1, lastPage: 1, perPage: 15, total: 0, from: null, to: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('sort_order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getAdminPlantTypes({
        page,
        per_page: 15,
        search: search || undefined,
        sort_by: sortKeyMap[sortBy] || sortBy,
        sort_dir: sortDir,
      })
      setData(result.data ?? [])
      if (result.meta) setMeta(result.meta)
    } catch (e) {
      setData([])
      setError(e instanceof Error ? e.message : 'Failed to load plant types.')
    } finally {
      setLoading(false)
    }
  }, [page, search, sortBy, sortDir])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (key: string) => {
    const mapped = sortKeyMap[key] || key
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

  const openEdit = (item: PlantType) => {
    setEditing(item)
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content || '',
      image: item.image || '',
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished,
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
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
      if (editing) await api.updatePlantType(editing.id, form)
      else await api.createPlantType(form)
      setModalOpen(false)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<PlantType>[] = [
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
          <Link
            to={`/plant-information/${item.slug}`}
            target="_blank"
            className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"
            title="View"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button type="button" onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (confirm(`Delete "${item.title}"?`)) {
                await api.deletePlantType(item.id)
                await load()
              }
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
          <h1 className="font-sans font-700 text-2xl text-forest-900">Plant Types</h1>
          <p className="text-sage-600 text-sm mt-1">
            Manage tiles and detail pages shown on Plant Information (e.g. Japanese Maples, Hydrangeas, Roses).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800"
        >
          <Plus className="w-4 h-4" /> Add Plant Type
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-terra-50 text-terra-700 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <div className="flex gap-3 shrink-0">
            {(error.toLowerCase().includes('unauthenticated') || error.toLowerCase().includes('unauthorized')) && (
              <Link to="/admin/login" className="font-600 underline">
                Log in again
              </Link>
            )}
            <button type="button" onClick={load} className="font-600 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search plant types..."
        onClear={() => {
          setSearch('')
          setPage(1)
        }}
      />

      <DataTable
        columns={columns}
        data={data}
        meta={meta}
        onPageChange={setPage}
        sortBy={sortBy === 'sort_order' ? 'sortOrder' : sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        loading={loading}
        emptyMessage="No plant types found. Run the seeder or click Add Plant Type."
        rowKey={item => item.id}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Plant Type' : 'Add Plant Type'}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="auto-from-title"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Excerpt (tile summary)</label>
            <textarea
              rows={2}
              className={inputClass}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <SettingImageUpload
            label="Featured image"
            hint="Shown on the Plant Information tiles and detail page"
            value={form.image}
            onChange={image => setForm(f => ({ ...f, image }))}
            folder="plant-types"
            previewClass="h-24 w-32 object-cover rounded-lg"
          />

          <div>
            <label className={labelClass}>Detail content</label>
            <RichTextEditor
              value={form.content}
              onChange={content => setForm(f => ({ ...f, content }))}
              placeholder="Write plant type details like a blog post..."
              minHeight="260px"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Meta title (SEO)</label>
              <input
                className={inputClass}
                value={form.metaTitle}
                onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Meta description (SEO)</label>
            <input
              className={inputClass}
              value={form.metaDescription}
              onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-sans font-600 text-forest-800">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
            />
            Published (visible on site)
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-sage-600">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
