import { useEffect, useState } from 'react'
import { ExternalLink, Package } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import { api, getToken } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { Order, ProductVariation } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-forest-100 text-forest-700',
  completed: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-sage-100 text-sage-600',
  refunded: 'bg-terra-100 text-terra-700',
}

const statuses = ['pending', 'processing', 'paid', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

function formatAddress(addr?: Record<string, string> | null): string[] {
  if (!addr) return []
  const lines: string[] = []
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ')
  if (name) lines.push(name)
  if (addr.company) lines.push(addr.company)
  const street = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ')
  if (street) lines.push(street)
  const cityLine = [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')
  if (cityLine) lines.push(cityLine)
  if (addr.country) lines.push(addr.country)
  if (addr.phone) lines.push(`Phone: ${addr.phone}`)
  if (addr.email) lines.push(`Email: ${addr.email}`)
  return lines
}

function variationLabel(v?: ProductVariation | null): string | null {
  if (!v?.attributeValues || !Object.keys(v.attributeValues).length) return null
  return Object.entries(v.attributeValues).map(([k, val]) => `${k}: ${val}`).join(' · ')
}

interface Props {
  orderId: string | null
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

export default function AdminOrderDetailModal({ orderId, open, onClose, onUpdated }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [statusHistory, setStatusHistory] = useState<{ status: string; note?: string; userName?: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [statusForm, setStatusForm] = useState({ status: '', note: '', trackingNumber: '' })

  useEffect(() => {
    if (!open || !orderId) return
    setLoading(true)
    setMessage('')
    api.getAdminOrder(orderId)
      .then(res => {
        setOrder(res.order)
        setStatusHistory(res.statusHistory)
        setStatusForm({
          status: res.order.status,
          note: '',
          trackingNumber: res.order.trackingNumber || '',
        })
      })
      .catch(() => setMessage('Failed to load order details.'))
      .finally(() => setLoading(false))
  }, [open, orderId])

  const saveStatus = async () => {
    if (!order) return
    setSaving(true)
    setMessage('')
    try {
      const res = await api.updateOrderStatus(
        order.id,
        statusForm.status,
        statusForm.note || undefined,
        statusForm.trackingNumber || undefined,
      )
      setOrder(res.order)
      const detail = await api.getAdminOrder(order.id)
      setStatusHistory(detail.statusHistory)
      setStatusForm(f => ({ ...f, note: '' }))
      setMessage('Order updated. Customer email sent if SMTP is configured for this status.')
      onUpdated?.()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const printInvoice = async () => {
    if (!order) return
    const token = getToken()
    const res = await fetch(`/api/orders/${order.id}/invoice`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const html = await res.text()
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
    }
  }

  const billingLines = formatAddress(order?.billingAddress ?? null)
  const shippingLines = formatAddress(order?.shippingAddress ?? null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? `Order ${order.orderNumber}` : 'Order details'}
      size="xl"
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
        </div>
      ) : !order ? (
        <p className="text-sage-500 text-sm text-center py-12">Order not found.</p>
      ) : (
        <div className="space-y-6">
          {message && (
            <div className="px-4 py-3 rounded-xl bg-forest-50 text-forest-800 text-sm">{message}</div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cream-50 rounded-xl p-4 border border-forest-100">
              <p className="text-xs text-sage-500 uppercase tracking-wide font-600">Customer</p>
              <p className="font-600 text-forest-900 mt-1">{order.customerName || order.businessName}</p>
              <p className="text-sm text-sage-600">{order.customerEmail}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-4 border border-forest-100">
              <p className="text-xs text-sage-500 uppercase tracking-wide font-600">Type</p>
              <p className="font-600 text-forest-900 mt-1 capitalize">{order.type}</p>
              <p className="text-sm text-sage-600 capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-4 border border-forest-100">
              <p className="text-xs text-sage-500 uppercase tracking-wide font-600">Placed</p>
              <p className="font-600 text-forest-900 mt-1">
                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-sm text-sage-600">
                {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
            <div className="bg-cream-50 rounded-xl p-4 border border-forest-100">
              <p className="text-xs text-sage-500 uppercase tracking-wide font-600">Status</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-600 capitalize ${statusColors[order.status] || 'bg-sage-100'}`}>
                {order.status}
              </span>
              {order.couponCode && <p className="text-xs text-sage-500 mt-2">Coupon: {order.couponCode}</p>}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-forest-100 p-4">
              <h3 className="font-sans font-700 text-forest-900 text-sm mb-3">Billing address</h3>
              {billingLines.length ? (
                <div className="text-sm text-sage-700 space-y-0.5">
                  {billingLines.map(line => <p key={line}>{line}</p>)}
                </div>
              ) : (
                <p className="text-sm text-sage-500">No billing address on file.</p>
              )}
            </div>
            <div className="rounded-xl border border-forest-100 p-4">
              <h3 className="font-sans font-700 text-forest-900 text-sm mb-3">Shipping address</h3>
              {shippingLines.length ? (
                <div className="text-sm text-sage-700 space-y-0.5">
                  {shippingLines.map(line => <p key={line}>{line}</p>)}
                </div>
              ) : (
                <p className="text-sm text-sage-500">No shipping address on file.</p>
              )}
            </div>
          </div>

          {order.orderNotes && (
            <div className="rounded-xl border border-forest-100 p-4 bg-amber-50/50">
              <h3 className="font-sans font-700 text-forest-900 text-sm mb-2">Customer notes</h3>
              <p className="text-sm text-sage-700 whitespace-pre-wrap">{order.orderNotes}</p>
            </div>
          )}

          <div className="rounded-xl border border-forest-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-forest-100 bg-cream-50 flex items-center justify-between">
              <h3 className="font-sans font-700 text-forest-900 text-sm">Line items</h3>
              <span className="text-xs text-sage-500">{order.items.length} product(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-sage-500 border-b border-forest-50">
                    <th className="px-4 py-3 font-600">Product</th>
                    <th className="px-4 py-3 font-600">Variation</th>
                    <th className="px-4 py-3 font-600">SKU</th>
                    <th className="px-4 py-3 font-600 text-center">Qty</th>
                    <th className="px-4 py-3 font-600 text-right">Unit</th>
                    <th className="px-4 py-3 font-600 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => {
                    const variationText = variationLabel(item.variation)
                    const sku = item.variation?.sku || item.product.sku || '—'
                    const unitPrice = item.unitPrice ?? item.product.price
                    const lineTotal = item.lineTotal ?? unitPrice * item.quantity
                    return (
                      <tr key={`${item.product.id}-${idx}`} className="border-b border-forest-50 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            {item.product.image ? (
                              <img
                                src={mediaUrl(item.product.image)}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-forest-100 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-forest-50 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-forest-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-600 text-forest-900">{item.product.name}</p>
                              {item.product.brandName && (
                                <p className="text-xs text-sage-500">{item.product.brandName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sage-600 text-xs">
                          {variationText || <span className="text-sage-400">—</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-sage-600">{sku}</td>
                        <td className="px-4 py-3 text-center font-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">${unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-700 text-forest-900">${lineTotal.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-4 border-t border-forest-100 bg-cream-50/50 space-y-1 text-sm">
              <div className="flex justify-between text-sage-600"><span>Subtotal</span><span>${(order.subtotal ?? order.total).toFixed(2)}</span></div>
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-${order.discount!.toFixed(2)}</span></div>
              )}
              {(order.tax ?? 0) > 0 && (
                <div className="flex justify-between text-sage-600"><span>Tax</span><span>${order.tax!.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between text-sage-600">
                <span>Shipping</span>
                <span>{(order.shippingCost ?? 0) > 0 ? `$${order.shippingCost!.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between font-700 text-forest-900 text-base pt-2 border-t border-forest-100">
                <span>Grand total</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-forest-100 p-4 space-y-4">
              <h3 className="font-sans font-700 text-forest-900 text-sm">Update status</h3>
              <p className="text-xs text-sage-500">Changing status sends the matching email template to the customer (when SMTP is configured).</p>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={statusForm.status}
                  onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tracking number</label>
                <input
                  className={inputClass}
                  value={statusForm.trackingNumber}
                  onChange={e => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))}
                  placeholder="Used in shipping email"
                />
              </div>
              <div>
                <label className={labelClass}>Internal note (optional)</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={statusForm.note}
                  onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Visible in status history"
                />
              </div>
              <button
                onClick={saveStatus}
                disabled={saving}
                className="px-5 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save status & notify customer'}
              </button>
            </div>

            <div className="rounded-xl border border-forest-100 p-4">
              <h3 className="font-sans font-700 text-forest-900 text-sm mb-3">Status history</h3>
              {statusHistory.length === 0 ? (
                <p className="text-sm text-sage-500">No status changes recorded.</p>
              ) : (
                <ol className="space-y-3 max-h-64 overflow-y-auto">
                  {statusHistory.map((h, i) => (
                    <li key={`${h.createdAt}-${i}`} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-forest-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-600 capitalize text-forest-800">{h.status}</p>
                        <p className="text-xs text-sage-500">
                          {new Date(h.createdAt).toLocaleString()}
                          {h.userName ? ` · ${h.userName}` : ''}
                        </p>
                        {h.note && <p className="text-xs text-sage-600 mt-0.5">{h.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={printInvoice}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-forest-200 text-sm font-600 text-forest-700 hover:bg-forest-50"
            >
              Print invoice <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
