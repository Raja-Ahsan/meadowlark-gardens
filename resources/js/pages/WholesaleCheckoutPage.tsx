import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Tag, CheckCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { api, type ShippingRate } from '@/lib/api'
import WholesalePortalHeader from '@/components/wholesale/WholesalePortalHeader'
import ShippingMethodSelector from '@/components/checkout/ShippingMethodSelector'
import {
  cartLineKey,
  formatVariationLabel,
  getWholesaleLinePrice,
} from '@/lib/cart'

const inputClass = 'w-full px-4 py-3 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1.5'

export default function WholesaleCheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const nameParts = (user?.name || '').trim().split(/\s+/)
  const [form, setForm] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.businessName || '',
    address1: '',
    address2: '',
    city: '',
    state: 'TN',
    postalCode: '',
    country: 'US',
    sameShipping: true,
    shipAddress1: '',
    shipCity: '',
    shipState: 'TN',
    shipPostalCode: '',
    orderNotes: '',
    paymentMethod: '',
  })

  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [paymentsLoaded, setPaymentsLoaded] = useState(false)

  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState('')
  const [freeShippingCoupon, setFreeShippingCoupon] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null)
  const [taxRate, setTaxRate] = useState(9.25)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const subtotal = total
  const shipping = selectedShipping?.cost ?? 0
  const tax = Math.round((subtotal - discount) * (taxRate / 100) * 100) / 100
  const grandTotal = Math.max(0, subtotal - discount + tax + shipping)

  const cartItems = items.map(i => ({
    productId: i.product.id,
    quantity: i.quantity,
    variationId: i.variation?.id,
  }))

  const getShippingAddress = () => {
    if (form.sameShipping) {
      return {
        firstName: form.firstName,
        lastName: form.lastName,
        addressLine1: form.address1,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      }
    }
    return {
      addressLine1: form.shipAddress1,
      city: form.shipCity,
      state: form.shipState,
      postalCode: form.shipPostalCode,
      country: 'US',
    }
  }

  useEffect(() => {
    api.getPaymentConfig()
      .then(config => {
        const methods = config.methods ?? []
        setPaymentMethods(methods)
        if (methods.length > 0) {
          setForm(f => ({ ...f, paymentMethod: methods[0] }))
        }
      })
      .catch(() => setPaymentMethods([]))
      .finally(() => setPaymentsLoaded(true))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/wholesale/login')
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await api.validateCoupon(couponCode, subtotal, 'wholesale')
      setDiscount(res.coupon.discount)
      setCouponApplied(res.coupon.code)
      setFreeShippingCoupon(res.coupon.freeShipping)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Invalid coupon')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0 || !form.paymentMethod || !selectedShipping) return

    setSubmitting(true)
    try {
      const billingAddress = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        company: form.company,
        addressLine1: form.address1,
        addressLine2: form.address2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      }
      const shippingAddress = form.sameShipping
        ? billingAddress
        : {
            addressLine1: form.shipAddress1,
            city: form.shipCity,
            state: form.shipState,
            postalCode: form.shipPostalCode,
            country: 'US',
          }

      await api.placeWholesaleOrder({
        paymentMethod: form.paymentMethod,
        couponCode: couponApplied || undefined,
        orderNotes: form.orderNotes || undefined,
        billingAddress,
        shippingAddress,
        shippingMethod: {
          carrier: selectedShipping.carrier,
          code: selectedShipping.code,
          name: selectedShipping.name,
          cost: selectedShipping.cost,
        },
        items: cartItems,
      })

      clearCart()
      setSuccess(true)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream-50">
        <WholesalePortalHeader onLogout={handleLogout} />
        <div className="max-w-lg mx-auto py-20 text-center px-4">
          <CheckCircle className="w-16 h-16 text-forest-600 mx-auto mb-4" />
          <h1 className="font-sans font-700 text-2xl text-forest-900 mb-2">Order Placed!</h1>
          <p className="text-sage-600 mb-6">Your wholesale order has been received. You will receive a confirmation email shortly.</p>
          <Link
            to="/wholesale/portal?tab=orders"
            className="inline-block px-6 py-3 bg-forest-700 text-white rounded-xl font-sans font-600"
          >
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50">
        <WholesalePortalHeader onLogout={handleLogout} />
        <div className="max-w-lg mx-auto py-20 text-center px-4">
          <ShoppingBag className="w-12 h-12 text-sage-400 mx-auto mb-4" />
          <h1 className="font-sans font-700 text-xl text-forest-900 mb-2">Your cart is empty</h1>
          <Link to="/wholesale/portal" className="text-forest-700 font-600 hover:underline">Browse products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <WholesalePortalHeader onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link to="/wholesale/portal?tab=cart" className="text-sm text-forest-600 hover:text-forest-800 font-600 mb-6 inline-block">
          ← Back to cart
        </Link>
        <h1 className="font-sans font-700 text-3xl text-forest-900 mb-8">Wholesale Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm">
              <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Business & billing</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>First name *</label><input required className={inputClass} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
                <div><label className={labelClass}>Last name *</label><input required className={inputClass} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Business name *</label><input required className={inputClass} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Email *</label><input required type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><label className={labelClass}>Phone</label><input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Billing address *</label><input required className={inputClass} value={form.address1} onChange={e => setForm(f => ({ ...f, address1: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Apartment, suite, etc.</label><input className={inputClass} value={form.address2} onChange={e => setForm(f => ({ ...f, address2: e.target.value }))} /></div>
                <div><label className={labelClass}>City *</label><input required className={inputClass} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div><label className={labelClass}>State *</label><input required className={inputClass} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
                <div><label className={labelClass}>ZIP code *</label><input required className={inputClass} value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} /></div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm">
              <label className="flex items-center gap-2 mb-4 text-sm font-600">
                <input type="checkbox" checked={form.sameShipping} onChange={e => setForm(f => ({ ...f, sameShipping: e.target.checked }))} />
                Shipping address same as billing
              </label>
              {!form.sameShipping && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className={labelClass}>Shipping address</label><input className={inputClass} value={form.shipAddress1} onChange={e => setForm(f => ({ ...f, shipAddress1: e.target.value }))} /></div>
                  <div><label className={labelClass}>City</label><input className={inputClass} value={form.shipCity} onChange={e => setForm(f => ({ ...f, shipCity: e.target.value }))} /></div>
                  <div><label className={labelClass}>State</label><input className={inputClass} value={form.shipState} onChange={e => setForm(f => ({ ...f, shipState: e.target.value }))} /></div>
                  <div><label className={labelClass}>ZIP</label><input className={inputClass} value={form.shipPostalCode} onChange={e => setForm(f => ({ ...f, shipPostalCode: e.target.value }))} /></div>
                </div>
              )}
              <div className="mt-4"><label className={labelClass}>Order notes</label><textarea rows={2} className={inputClass} value={form.orderNotes} onChange={e => setForm(f => ({ ...f, orderNotes: e.target.value }))} /></div>
            </section>

            <section className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm">
              <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Shipping method</h2>
              <ShippingMethodSelector
                shippingAddress={getShippingAddress()}
                items={cartItems}
                subtotal={subtotal - discount}
                type="wholesale"
                freeShipping={freeShippingCoupon}
                selected={selectedShipping}
                onSelect={setSelectedShipping}
                onQuote={q => setTaxRate(q.taxRate)}
              />
            </section>

            <section className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm">
              <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Payment method</h2>
              {!paymentsLoaded ? (
                <p className="text-sm text-sage-500">Loading payment options...</p>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-terra-600">No payment methods are currently available. Please contact us to complete your order.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {paymentMethods.map(m => (
                    <label key={m} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${form.paymentMethod === m ? 'border-forest-600 bg-forest-50' : 'border-forest-200'}`}>
                      <input type="radio" name="payment" value={m} checked={form.paymentMethod === m} onChange={() => setForm(f => ({ ...f, paymentMethod: m }))} />
                      <span className="text-sm font-600">{m}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm sticky top-4">
              <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Order summary</h2>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map(i => {
                  const lineKey = cartLineKey(i.product.id, i.variation?.id)
                  const price = getWholesaleLinePrice(i)
                  const variationLabel = formatVariationLabel(i.variation)
                  return (
                    <div key={lineKey} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-forest-800 min-w-0">{i.product.name} × {i.quantity}</span>
                        <span className="font-600 shrink-0">${(price * i.quantity).toFixed(2)}</span>
                      </div>
                      {variationLabel && <p className="text-xs text-sage-500 mt-0.5">{variationLabel}</p>}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2 mb-4">
                <input className={inputClass} placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                <button type="button" onClick={applyCoupon} className="px-4 py-2 bg-forest-100 text-forest-700 rounded-xl text-sm font-600 whitespace-nowrap flex items-center gap-1">
                  <Tag className="w-4 h-4" /> Apply
                </button>
              </div>
              {couponApplied && <p className="text-xs text-forest-600 mb-3">Coupon {couponApplied} applied (-${discount.toFixed(2)})</p>}

              <div className="space-y-2 text-sm border-t border-forest-100 pt-4">
                <div className="flex justify-between"><span className="text-sage-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-forest-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-sage-600">Tax ({taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-sage-600">Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-sans font-700 text-lg text-forest-900 pt-2 border-t border-forest-100">
                  <span>Total</span><span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting || !form.paymentMethod || !selectedShipping} className="w-full mt-6 py-3.5 bg-forest-700 text-white rounded-xl font-sans font-600 hover:bg-forest-800 disabled:opacity-50">
                {submitting ? 'Processing...' : `Place Order — $${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
