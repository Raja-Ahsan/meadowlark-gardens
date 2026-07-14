import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import RichTextEditor from '@/components/admin/RichTextEditor'
import type { LegalPage } from '@/types'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

const SLUGS = [
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-of-service', label: 'Terms of Service' },
  { slug: 'cookies', label: 'Cookies' },
] as const

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[]>([])
  const [activeSlug, setActiveSlug] = useState<string>('privacy-policy')
  const [form, setForm] = useState({
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = () =>
    api.getAdminLegalPages()
      .then(r => setPages(r.pages))
      .catch(() => setMessage('Failed to load legal pages.'))

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const page = pages.find(p => p.slug === activeSlug)
    if (!page) return
    setForm({
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle ?? '',
      metaDescription: page.metaDescription ?? '',
      isPublished: page.isPublished,
    })
  }, [activeSlug, pages])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await api.updateAdminLegalPage(activeSlug, form)
      setPages(prev => prev.map(p => (p.slug === activeSlug ? res.page : p)))
      setMessage('Page saved successfully.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const publicPath = `/${activeSlug}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-700 text-2xl text-forest-900">Legal Pages</h1>
        <p className="text-sage-600 text-sm mt-1">Manage Privacy Policy, Terms of Service, and Cookie Policy content.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-forest-100 pb-0">
        {SLUGS.map(tab => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => setActiveSlug(tab.slug)}
            className={`px-4 py-2.5 text-sm font-sans font-600 border-b-2 -mb-px ${
              activeSlug === tab.slug
                ? 'border-forest-700 text-forest-900'
                : 'border-transparent text-sage-500 hover:text-forest-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-forest-50 text-forest-800 text-sm">{message}</div>
      )}

      {loading ? (
        <p className="text-sm text-sage-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-sans font-600 text-forest-800">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
              />
              Published (visible on site)
            </label>
            <Link
              to={publicPath}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-forest-700 hover:text-forest-900 font-sans font-600"
            >
              View live page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div>
            <label className={labelClass}>Page title</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
              <label className={labelClass}>Meta description (SEO)</label>
              <input
                className={inputClass}
                value={form.metaDescription}
                onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Page content</label>
            <RichTextEditor
              value={form.content}
              onChange={content => setForm(f => ({ ...f, content }))}
              placeholder="Write your legal page content..."
              minHeight="320px"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600 hover:bg-forest-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      )}
    </div>
  )
}
