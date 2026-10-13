import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CheckCircle, XCircle, FileText, ExternalLink, Search, X, Mail, Phone, MapPin,
  Building2, CalendarDays, ClipboardList, Clock, MessageSquareText, Loader2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { showToastError, showToastSuccess } from '@/lib/toast'
import Modal from '@/components/admin/Modal'
import Pagination from '@/components/admin/Pagination'
import type { WholesaleApplication } from '@/types'
import type { PaginatedMeta } from '@/types/admin'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
type Counts = Record<StatusFilter, number>

const PER_PAGE = 10

const statusStyles: Record<WholesaleApplication['status'], { badge: string; dot: string; accent: string }> = {
  pending: { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500', accent: 'bg-amber-400' },
  approved: { badge: 'bg-forest-50 text-forest-700 ring-forest-200', dot: 'bg-forest-500', accent: 'bg-forest-500' },
  rejected: { badge: 'bg-terra-50 text-terra-700 ring-terra-200', dot: 'bg-terra-500', accent: 'bg-terra-400' },
}

const tabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'

export default function AdminWholesalersPage() {
  const [applications, setApplications] = useState<WholesaleApplication[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({
    currentPage: 1, lastPage: 1, perPage: PER_PAGE, total: 0, from: null, to: null,
  })
  const [counts, setCounts] = useState<Counts>({ all: 0, pending: 0, approved: 0, rejected: 0 })
  const [filter, setFilter] = useState<StatusFilter>(() => {
    const status = new URLSearchParams(window.location.search).get('status')
    return tabs.some(t => t.key === status) ? (status as StatusFilter) : 'all'
  })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const requestId = useRef(0)

  const [previewApp, setPreviewApp] = useState<WholesaleApplication | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(async () => {
    const current = ++requestId.current
    setLoading(true)
    try {
      const result = await api.getAdminApplications({
        page,
        per_page: PER_PAGE,
        search: search || undefined,
        status: filter === 'all' ? undefined : filter,
        sort_by: 'submitted_at',
        sort_dir: 'desc',
      })
      if (current !== requestId.current) return
      setApplications(result.data)
      setMeta(result.meta)
      setCounts(result.counts)
    } catch {
      if (current === requestId.current) showToastError('Failed to load applications')
    } finally {
      if (current === requestId.current) {
        setLoading(false)
        setInitialLoad(false)
      }
    }
  }, [page, search, filter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const changeFilter = (f: StatusFilter) => {
    setFilter(f)
    setPage(1)
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    try {
      const res = await api.updateApplicationStatus(id, status)
      showToastSuccess(res.message)
      await load()
    } catch (error) {
      showToastError(error instanceof Error ? error.message : 'Failed to update application')
    } finally {
      setUpdatingId(null)
    }
  }

  const openLicense = async (app: WholesaleApplication) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewApp(app)
    setPreviewUrl(null)
    setPreviewType('')
    setPreviewError('')
    setPreviewLoading(true)
    try {
      const { url, contentType } = await api.getApplicationLicenseBlob(app.id)
      setPreviewUrl(url)
      setPreviewType(contentType)
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Failed to load document')
    } finally {
      setPreviewLoading(false)
    }
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewApp(null)
    setPreviewUrl(null)
    setPreviewType('')
    setPreviewError('')
  }

  const isImage = previewType.startsWith('image/')
  const isPdf = previewType.includes('pdf')

  const statCards = [
    { label: 'Total', value: counts.all, icon: ClipboardList, tone: 'bg-forest-50 text-forest-700' },
    { label: 'Pending', value: counts.pending, icon: Clock, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Approved', value: counts.approved, icon: CheckCircle, tone: 'bg-forest-50 text-forest-600' },
    { label: 'Rejected', value: counts.rejected, icon: XCircle, tone: 'bg-terra-50 text-terra-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-700 text-2xl text-forest-900">Wholesale Applications</h1>
        <p className="text-sage-600 text-sm mt-1">Review and approve wholesale accounts</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-forest-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-sans font-600 uppercase tracking-wide text-sage-500">{card.label}</p>
              <p className="text-xl font-sans font-700 text-forest-900 leading-tight">{initialLoad ? '–' : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-forest-100">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 p-1 bg-cream-50 rounded-xl border border-forest-100 w-full sm:w-fit">
            {tabs.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => changeFilter(t.key)}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-sans font-600 transition-colors ${
                  filter === t.key ? 'bg-forest-700 text-white shadow-sm' : 'text-forest-700 hover:bg-white'
                }`}
              >
                {t.label}
                <span className={`min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-[11px] leading-none ${
                  filter === t.key ? 'bg-white/20 text-white' : t.key === 'pending' && counts.pending > 0 ? 'bg-amber-100 text-amber-700' : 'bg-forest-100 text-forest-600'
                }`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search business, name, email, phone..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-forest-200 bg-white text-sm text-forest-800 placeholder:text-sage-400 focus:border-forest-400"
            />
            {loading && !initialLoad && searchInput ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-500 animate-spin" />
            ) : searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-sage-400 hover:text-forest-700 hover:bg-forest-50"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className={`relative transition-opacity ${loading && !initialLoad ? 'opacity-60' : ''}`}>
          {initialLoad ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-cream-50 border border-forest-100 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6 text-sage-400" />
              </div>
              <p className="font-sans font-600 text-forest-800">No applications found</p>
              <p className="text-sm text-sage-500 mt-1">
                {search ? `No results for "${search}". Try a different search.` : 'There are no applications in this category yet.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-forest-100">
              {applications.map(app => {
                const style = statusStyles[app.status]
                const busy = updatingId === app.id
                return (
                  <li key={app.id} className="relative p-5 hover:bg-cream-50/60 transition-colors">
                    <span className={`absolute left-0 top-5 bottom-5 w-1 rounded-r-full ${style.accent}`} aria-hidden />
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-forest-700 text-cream-100 flex items-center justify-center font-sans font-700 text-sm shrink-0">
                        {initials(app.businessName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-sans font-700 text-forest-900 truncate">{app.businessName}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-sans font-600 capitalize ring-1 ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm font-sans font-600 text-forest-700 mt-0.5">{app.contactName}</p>

                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 text-sm text-sage-600">
                          <a href={`mailto:${app.email}`} className="flex items-center gap-2 min-w-0 hover:text-forest-800">
                            <Mail className="w-4 h-4 text-sage-400 shrink-0" />
                            <span className="truncate">{app.email}</span>
                          </a>
                          {app.phone && (
                            <a href={`tel:${app.phone}`} className="flex items-center gap-2 min-w-0 hover:text-forest-800">
                              <Phone className="w-4 h-4 text-sage-400 shrink-0" />
                              <span className="truncate">{app.phone}</span>
                            </a>
                          )}
                          {app.address && (
                            <span className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-4 h-4 text-sage-400 shrink-0" />
                              <span className="truncate" title={app.address}>{app.address}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-50 border border-forest-100 text-xs text-forest-700">
                            <Building2 className="w-3.5 h-3.5 text-sage-500" />
                            {app.businessType}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-50 border border-forest-100 text-xs text-forest-700">
                            <CalendarDays className="w-3.5 h-3.5 text-sage-500" />
                            {new Date(app.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {app.licenseDocument && (
                            <button
                              type="button"
                              onClick={() => openLicense(app)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-forest-200 text-xs font-sans font-600 text-forest-700 hover:bg-forest-50 hover:border-forest-300 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View license
                            </button>
                          )}
                        </div>

                        {app.message && (
                          <div className="flex gap-2 mt-3 text-sm text-forest-700 bg-cream-50 border border-forest-100 rounded-xl p-3">
                            <MessageSquareText className="w-4 h-4 text-sage-400 shrink-0 mt-0.5" />
                            <p className="whitespace-pre-line break-words">{app.message}</p>
                          </div>
                        )}
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex lg:flex-col gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateStatus(app.id, 'approved')}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800 disabled:opacity-60 transition-colors"
                          >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateStatus(app.id, 'rejected')}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-terra-300 text-terra-700 rounded-xl text-sm font-sans font-600 hover:bg-terra-50 disabled:opacity-60 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <Modal
        open={!!previewApp}
        onClose={closePreview}
        title={previewApp ? `License — ${previewApp.businessName}` : 'License document'}
        size="xl"
      >
        {previewLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
          </div>
        ) : previewError ? (
          <p className="text-center text-terra-600 py-10">{previewError}</p>
        ) : previewUrl ? (
          <div className="space-y-4">
            {isImage ? (
              <img src={previewUrl} alt="License document" className="max-h-[70vh] mx-auto rounded-xl object-contain" />
            ) : isPdf ? (
              <iframe
                src={previewUrl}
                title="License PDF"
                className="w-full h-[70vh] rounded-xl border border-forest-100 bg-cream-50"
              />
            ) : (
              <div className="text-center py-10 space-y-3">
                <FileText className="w-10 h-10 text-forest-500 mx-auto" />
                <p className="text-sage-600 text-sm">This file type can’t be previewed in the browser.</p>
              </div>
            )}
            <div className="flex justify-center">
              <a
                href={previewUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-700 text-white text-sm font-600 hover:bg-forest-800"
              >
                <ExternalLink className="w-4 h-4" /> Download / Open file
              </a>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
