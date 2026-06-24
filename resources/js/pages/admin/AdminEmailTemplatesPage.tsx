import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import { api } from '@/lib/api'
import type { EmailTemplate } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [form, setForm] = useState({ subject: '', body: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const load = () => api.getEmailTemplates().then(r => setTemplates(r.templates)).catch(() => {})

  useEffect(() => { load() }, [])

  const openEdit = (t: EmailTemplate) => {
    setEditing(t)
    setForm({ subject: t.subject, body: t.body, isActive: t.isActive })
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await api.updateEmailTemplate(editing.id, form)
      setEditing(null)
      load()
    } catch (e) { alert(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div><h1 className="font-sans font-700 text-2xl text-forest-900">Email Templates</h1><p className="text-sage-600 text-sm mt-1">Customize automated email notifications</p></div>

      <div className="grid gap-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-forest-100 p-5 flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-700 text-forest-900">{t.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? 'bg-forest-100 text-forest-700' : 'bg-sage-100 text-sage-600'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-sm text-sage-600 mt-1">Subject: {t.subject}</p>
              <p className="text-xs text-sage-400 mt-0.5 font-mono">{t.slug}</p>
            </div>
            <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><Pencil className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit: ${editing?.name}`} size="lg">
        <div className="space-y-4">
          <div><label className={labelClass}>Subject</label><input className={inputClass} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
          <div><label className={labelClass}>Body (use {'{{variable}}'} placeholders)</label><textarea rows={8} className={inputClass} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-sage-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save Template'}</button>
        </div>
      </Modal>
    </div>
  )
}
