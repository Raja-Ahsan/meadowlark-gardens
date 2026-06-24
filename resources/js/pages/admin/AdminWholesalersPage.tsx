import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { WholesaleApplication } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-forest-100 text-forest-700',
  rejected: 'bg-terra-100 text-terra-700',
}

export default function AdminWholesalersPage() {
  const [applications, setApplications] = useState<WholesaleApplication[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getAdminApplications().then(r => setApplications(r.applications)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await api.updateApplicationStatus(id, status)
    load()
  }

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-sans font-700 text-2xl text-forest-900">Wholesale Applications</h1>
        <p className="text-sage-600 text-sm mt-1">Review and approve wholesale accounts</p>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-sans font-600 capitalize ${filter === f ? 'bg-forest-700 text-white' : 'bg-white border border-forest-200 text-forest-700'}`}>
            {f} {f === 'pending' && applications.filter(a => a.status === 'pending').length > 0 && `(${applications.filter(a => a.status === 'pending').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-forest-100 p-12 text-center text-sage-500">No applications found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-sans font-700 text-forest-900">{app.businessName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${statusColors[app.status]}`}>{app.status}</span>
                  </div>
                  <p className="text-sm text-sage-600">{app.contactName} · {app.email} · {app.phone}</p>
                  <p className="text-sm text-sage-500 mt-1">{app.address}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-sage-600">
                    <span>Type: <strong>{app.businessType}</strong></span>
                    <span>Est. Monthly: <strong>{app.estimatedMonthlyOrder}</strong></span>
                    <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>
                  {app.message && <p className="mt-3 text-sm text-forest-700 bg-cream-50 rounded-xl p-3">{app.message}</p>}
                </div>
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(app.id, 'approved')} className="flex items-center gap-1.5 px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-600 hover:bg-forest-800">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => updateStatus(app.id, 'rejected')} className="flex items-center gap-1.5 px-4 py-2 border border-terra-300 text-terra-700 rounded-xl text-sm font-600 hover:bg-terra-50">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
