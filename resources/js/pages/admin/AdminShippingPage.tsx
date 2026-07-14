import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { ShippingZone } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'

export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getShipping().then(r => setZones(r.zones)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const addZone = async () => {
    const name = prompt('Zone name:')
    if (!name) return
    await api.createShippingZone({ name, countries: ['US'], isActive: true })
    load()
  }

  const addMethod = async (zoneId: string) => {
    const name = prompt('Method name:')
    if (!name) return
    await api.createShippingMethod({ shippingZoneId: zoneId, name, type: 'flat_rate', cost: 9.99, isActive: true })
    load()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-sans font-700 text-2xl text-forest-900">Shipping</h1><p className="text-sage-600 text-sm mt-1">Configure shipping zones and methods</p></div>
        <button onClick={addZone} className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600"><Plus className="w-4 h-4" /> Add Zone</button>
      </div>

      {zones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-forest-100 p-12 text-center text-sage-500">No shipping zones configured.</div>
      ) : zones.map(zone => (
        <div key={zone.id} className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-cream-50 border-b border-forest-100">
            <div>
              <h3 className="font-sans font-700 text-forest-900">{zone.name}</h3>
              <p className="text-xs text-sage-500">Countries: {(zone.countries || []).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addMethod(zone.id)} className="px-3 py-1.5 text-sm font-600 text-forest-700 border border-forest-200 rounded-lg hover:bg-white">+ Method</button>
              <button onClick={async () => { if (confirm('Delete zone?')) { await api.deleteShippingZone(zone.id); load() } }} className="p-2 text-terra-600 hover:bg-terra-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="divide-y divide-forest-50">
            {zone.methods.length === 0 ? (
              <p className="px-6 py-4 text-sm text-sage-500">No shipping methods.</p>
            ) : zone.methods.map(m => (
              <div key={m.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="font-600 text-sm text-forest-800">{m.name}</p>
                  <p className="text-xs text-sage-500 capitalize">{m.type.replace('_', ' ')} · {m.estimatedDays || 'No estimate'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-600 text-forest-800">${m.cost.toFixed(2)}</span>
                  {m.wholesaleOnly && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Wholesale</span>}
                  <button onClick={async () => { if (confirm('Delete?')) { await api.deleteShippingMethod(m.id); load() } }} className="p-1.5 text-terra-600 hover:bg-terra-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
