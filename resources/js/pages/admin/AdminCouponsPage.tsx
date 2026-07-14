import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api } from '@/lib/api'
import type { Coupon } from '@/types/admin'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

export default function AdminCouponsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage' as Coupon['type'], value: 10, minCartValue: 0, maxDiscount: 0, usageLimit: 0, wholesaleOnly: false, retailOnly: false, isActive: true })
  const [saving, setSaving] = useState(false)

  const list = usePaginatedList<Coupon>({ fetcher: api.getAdminCoupons, defaultSort: 'code' })

  const openCreate = () => { setEditing(null); setForm({ code: '', description: '', type: 'percentage', value: 10, minCartValue: 0, maxDiscount: 0, usageLimit: 0, wholesaleOnly: false, retailOnly: false, isActive: true }); setModalOpen(true) }
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, description: c.description || '', type: c.type, value: c.value, minCartValue: c.minCartValue || 0, maxDiscount: c.maxDiscount || 0, usageLimit: c.usageLimit || 0, wholesaleOnly: c.wholesaleOnly, retailOnly: c.retailOnly, isActive: c.isActive }); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, usageLimit: form.usageLimit || undefined, minCartValue: form.minCartValue || undefined, maxDiscount: form.maxDiscount || undefined }
      if (editing) await api.updateCoupon(editing.id, payload)
      else await api.createCoupon(payload)
      setModalOpen(false); list.reload()
    } catch (e) { alert(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const columns: Column<Coupon>[] = [
    { key: 'code', label: 'Code', sortable: true, render: c => <span className="font-mono font-700 text-forest-800">{c.code}</span> },
    { key: 'type', label: 'Type', render: c => <span className="capitalize">{c.type.replace('_', ' ')}</span> },
    { key: 'value', label: 'Value', sortable: true, render: c => c.type === 'percentage' ? `${c.value}%` : `$${c.value}` },
    { key: 'usageCount', label: 'Used', render: c => `${c.usageCount}${c.usageLimit ? `/${c.usageLimit}` : ''}` },
    { key: 'expiresAt', label: 'Expires', render: c => c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never' },
    { key: 'isActive', label: 'Status', render: c => <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${c.isActive ? 'bg-forest-100 text-forest-700' : 'bg-sage-100 text-sage-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: '', render: c => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><Pencil className="w-4 h-4" /></button>
        <button onClick={async () => { if (confirm('Delete?')) { await api.deleteCoupon(c.id); list.reload() } }} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-sans font-700 text-2xl text-forest-900">Coupons</h1><p className="text-sage-600 text-sm mt-1">Discount codes and promotions</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>
      <FilterBar search={list.search} onSearchChange={list.setSearch} placeholder="Search coupons..." filters={[{ key: 'type', label: 'Type', options: [{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed' }, { value: 'free_shipping', label: 'Free Shipping' }] }]} filterValues={list.filters} onFilterChange={list.setFilter} onClear={list.clearFilters} />
      <DataTable columns={columns} data={list.data} meta={list.meta} onPageChange={list.setPage} sortBy={list.sortBy} sortDir={list.sortDir} onSort={list.handleSort} loading={list.loading} rowKey={c => c.id} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={labelClass}>Code *</label><input className={inputClass} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
          <div className="col-span-2"><label className={labelClass}>Description</label><input className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className={labelClass}>Type</label><select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Coupon['type'] }))}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="free_shipping">Free Shipping</option></select></div>
          <div><label className={labelClass}>Value</label><input type="number" className={inputClass} value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} /></div>
          <div><label className={labelClass}>Min Cart Value</label><input type="number" className={inputClass} value={form.minCartValue} onChange={e => setForm(f => ({ ...f, minCartValue: +e.target.value }))} /></div>
          <div><label className={labelClass}>Usage Limit</label><input type="number" className={inputClass} value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: +e.target.value }))} /></div>
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.retailOnly} onChange={e => setForm(f => ({ ...f, retailOnly: e.target.checked }))} /> Retail Only</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.wholesaleOnly} onChange={e => setForm(f => ({ ...f, wholesaleOnly: e.target.checked }))} /> Wholesale Only</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-sage-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
