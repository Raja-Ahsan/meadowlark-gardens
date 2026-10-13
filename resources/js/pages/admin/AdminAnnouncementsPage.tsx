import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Store, Building2, Check } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import RichTextEditor from '@/components/admin/RichTextEditor'
import SettingImageUpload from '@/components/admin/SettingImageUpload'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import { formatAnnouncementDate } from '@/lib/announcements'
import { showToastError, showToastSuccess } from '@/lib/toast'
import type { Announcement, AnnouncementAudience, AnnouncementSide } from '@/types'
import type { PaginatedMeta } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

const AUDIENCES: { id: AnnouncementSide; label: string; hint: string; icon: typeof Store }[] = [
  { id: 'retail', label: 'Retail', hint: 'Shown on the public Announcements page. Includes announcements sent to both sides.', icon: Store },
  { id: 'wholesale', label: 'Wholesale', hint: 'Shown only to approved wholesalers in the Wholesale Portal. Includes announcements sent to both sides.', icon: Building2 },
]

const sidesFromAudience = (audience: AnnouncementAudience): AnnouncementSide[] =>
  audience === 'all' ? ['retail', 'wholesale'] : [audience]

const audienceFromSides = (sides: AnnouncementSide[]): AnnouncementAudience =>
  sides.length > 1 ? 'all' : sides[0]

const emptyForm = (side: AnnouncementSide) => ({
  sides: [side] as AnnouncementSide[],
  title: '',
  excerpt: '',
  content: '',
  image: '',
  eventDate: '',
  isPublished: true,
})

const sortKeyMap: Record<string, string> = {
  title: 'title',
  eventDate: 'event_date',
  createdAt: 'created_at',
}

export default function AdminAnnouncementsPage() {
  const [audience, setAudience] = useState<AnnouncementSide>('retail')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState(emptyForm('retail'))
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState<Announcement[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({
    currentPage: 1, lastPage: 1, perPage: 15, total: 0, from: null, to: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getAdminAnnouncements({
        page,
        per_page: 15,
        audience,
        search: search || undefined,
        sort_by: sortKeyMap[sortBy] || sortBy,
        sort_dir: sortDir,
      })
      setData(result.data ?? [])
      if (result.meta) setMeta(result.meta)
    } catch (e) {
      setData([])
      setError(e instanceof Error ? e.message : 'Failed to load announcements.')
    } finally {
      setLoading(false)
    }
  }, [page, audience, search, sortBy, sortDir])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search, audience])

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
    setForm(emptyForm(audience))
    setModalOpen(true)
  }

  const openEdit = (item: Announcement) => {
    setEditing(item)
    setForm({
      sides: sidesFromAudience(item.audience),
      title: item.title,
      excerpt: item.excerpt || '',
      content: item.content || '',
      image: item.image || '',
      eventDate: item.eventDate || '',
      isPublished: item.isPublished,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (form.sides.length === 0) {
      showToastError('Select at least one side to show this announcement on')
      return
    }
    if (!form.title.trim()) {
      showToastError('Title is required')
      return
    }
    setSaving(true)
    try {
      const { sides, ...rest } = form
      const payload = { ...rest, audience: audienceFromSides(sides), eventDate: form.eventDate || null }
      if (editing) await api.updateAnnouncement(editing.id, payload)
      else await api.createAnnouncement(payload)
      showToastSuccess(editing ? 'Announcement updated' : 'Announcement created')
      setModalOpen(false)
      if (!sides.includes(audience)) setAudience(sides[0])
      else await load()
    } catch (e) {
      showToastError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Announcement>[] = [
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
    {
      key: 'audience',
      label: 'Shown on',
      render: item => (
        <div className="flex flex-wrap gap-1">
          {sidesFromAudience(item.audience).map(side => (
            <span
              key={side}
              className={`px-2 py-0.5 rounded-full text-xs font-600 whitespace-nowrap ${
                side === 'retail' ? 'bg-cream-100 text-forest-700' : 'bg-forest-100 text-forest-800'
              }`}
            >
              {side === 'retail' ? 'Retail' : 'Wholesale'}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'eventDate',
      label: 'Date',
      sortable: true,
      render: item => item.eventDate
        ? formatAnnouncementDate(item.eventDate)
        : <span className="text-sage-400">—</span>,
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
          <button type="button" onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={async () => {
              if (!confirm(`Delete "${item.title}"?`)) return
              try {
                await api.deleteAnnouncement(item.id)
                showToastSuccess('Announcement deleted')
                await load()
              } catch (e) {
                showToastError(e instanceof Error ? e.message : 'Delete failed')
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

  const activeAudience = AUDIENCES.find(a => a.id === audience)!

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-sans font-700 text-2xl text-forest-900">Announcements</h1>
          <p className="text-sage-600 text-sm mt-1">
            Announcements and upcoming events. Retail and wholesale entries are kept separate.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="self-start sm:self-auto shrink-0 flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800"
        >
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>

      <div className="grid grid-cols-2 sm:flex gap-2">
        {AUDIENCES.map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAudience(a.id)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-600 border transition-colors ${
              audience === a.id
                ? 'bg-forest-700 text-white border-forest-700'
                : 'bg-white text-forest-700 border-forest-200 hover:bg-forest-50'
            }`}
          >
            <a.icon className="w-4 h-4" />
            {a.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-sage-500 -mt-1">{activeAudience.hint}</p>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-terra-50 text-terra-700 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={load} className="font-600 underline">
            Retry
          </button>
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder={`Search ${activeAudience.label.toLowerCase()} announcements...`}
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
        sortBy={sortBy === 'event_date' ? 'eventDate' : sortBy === 'created_at' ? 'createdAt' : sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        loading={loading}
        emptyMessage={`No ${activeAudience.label.toLowerCase()} announcements yet. Click "Add Announcement".`}
        rowKey={item => item.id}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Announcement' : 'Add Announcement'}
        size="xl"
      >
        <div className="space-y-4">
          <div role="group" aria-labelledby="announcement-sides-label">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1.5">
              <span id="announcement-sides-label" className="text-xs font-sans font-600 text-forest-700">Show on *</span>
              <span className="text-xs text-sage-500">Select one side, or both to send to everyone.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AUDIENCES.map(a => {
                const selected = form.sides.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() =>
                      setForm(f => ({
                        ...f,
                        sides: selected ? f.sides.filter(s => s !== a.id) : [...f.sides, a.id],
                      }))
                    }
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans font-600 border-2 text-left transition-colors ${
                      selected
                        ? 'bg-forest-50 text-forest-800 border-forest-600'
                        : 'bg-white text-sage-600 border-forest-100 hover:border-forest-300 hover:bg-forest-50/50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                        selected ? 'bg-forest-600 border-forest-600 text-white' : 'bg-white border-forest-200'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </span>
                    <a.icon className="w-4 h-4 shrink-0" />
                    <span className="min-w-0">{a.label} side</span>
                  </button>
                )
              })}
            </div>
            {form.sides.length === 0 && (
              <p className="text-xs text-terra-600 mt-1.5">Select at least one side.</p>
            )}
            {form.sides.length > 1 && (
              <p className="text-xs text-forest-600 mt-1.5">Will appear on the retail site and in the wholesale portal.</p>
            )}
          </div>

          <div className="grid sm:grid-cols-[1fr_12rem] gap-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Date (optional)</label>
              <input
                type="date"
                className={inputClass}
                value={form.eventDate}
                onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Short summary</label>
            <textarea
              rows={2}
              className={inputClass}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <SettingImageUpload
            label="Image (optional)"
            value={form.image}
            onChange={image => setForm(f => ({ ...f, image }))}
            folder="announcements"
            previewClass="h-24 w-32 object-cover rounded-lg"
          />

          <div>
            <label className={labelClass}>Details</label>
            <RichTextEditor
              value={form.content}
              onChange={content => setForm(f => ({ ...f, content }))}
              placeholder="Write the announcement details..."
              minHeight="220px"
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
