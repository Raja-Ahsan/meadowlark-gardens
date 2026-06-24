import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Tag, CheckCircle, ArrowLeft } from 'lucide-react'
import { useRetailCart } from '@/context/RetailCartContext'
import { cartLineKey, formatVariationLabel, getCartLineImage, getCartLinePrice } from '@/lib/cart'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'

const inputClass = 'w-full px-4 py-3 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1.5'

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="bg-white border-b border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 font-sans font-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
          <h1
            className="font-display font-700 text-forest-900"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            Checkout
          </h1>
          <p className="text-sage-600 font-body mt-1 text-sm md:text-base">
            Review your order and complete your purchase securely.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </div>
    </div>
  )
}

function OrderSummaryPanel({
  items,
  subtotal,
  discount,
  taxRate,
  tax,
  shipping,
  grandTotal,
  couponCode,
  setCouponCode,
  applyCoupon,
  couponApplied,
  submitting,
  canSubmit,
}: {
  items: ReturnType<typeof useRetailCart>['items']
  subtotal: number
  discount: number
  taxRate: number
  tax: number
  shipping: number
  grandTotal: number
  couponCode: string
  setCouponCode: (v: string) => void
  applyCoupon: () => void
  couponApplied: string
  submitting: boolean
  canSubmit: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-forest-100 p-5 md:p-6 shadow-sm lg:sticky lg:top-28">
      <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Order summary</h2>

      <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
        {items.map(i => {
          const lineKey = cartLineKey(i.product.id, i.variation?.id)
          const price = getCartLinePrice(i)
          const variationLabel = formatVariationLabel(i.variation)
          const image = getCartLineImage(i)

          return (
            <div key={lineKey} className="flex gap-3 text-sm">
              <img
                src={mediaUrl(image)}
                alt={i.product.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-forest-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-forest-800 font-sans font-600 truncate">{i.product.name}</span>
                  <span className="font-600 shrink-0">${(price * i.quantity).toFixed(2)}</span>
                </div>
                <p className="text-xs text-sage-500 mt-0.5">Qty: {i.quantity}</p>
                {variationLabel && (
                  <p className="text-xs text-sage-500 mt-0.5 truncate">{variationLabel}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className={`${inputClass} min-w-0 flex-1`}
          placeholder="Coupon code"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
        />
        <button
          type="button"
          onClick={applyCoupon}
          className="px-4 py-3 bg-forest-100 text-forest-700 rounded-xl text-sm font-600 whitespace-nowrap flex items-center justify-center gap-1 shrink-0"
        >
          <Tag className="w-4 h-4" /> Apply
        </button>
      </div>
      {couponApplied && (
        <p className="text-xs text-forest-600 mb-3">Coupon {couponApplied} applied (-${discount.toFixed(2)})</p>
      )}

      <div className="space-y-2 text-sm border-t border-forest-100 pt-4">
        <div className="flex justify-between"><span className="text-sage-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        {discount > 0 && (
          <div className="flex justify-between text-forest-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>
        )}
        <div className="flex justify-between"><span className="text-sage-600">Tax ({taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between">
          <span className="text-sage-600">Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between font-sans font-700 text-lg text-forest-900 pt-2 border-t border-forest-100">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="hidden lg:block w-full mt-6 py-3.5 bg-forest-700 text-white rounded-xl font-sans font-600 hover:bg-forest-800 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Processing...' : `Place order — $${grandTotal.toFixed(2)}`}
      </button>
    </div>
  )
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useRetailCart()
  const { user, isCustomer } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    company: '',
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
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const taxRate = 9.25
  const shipping = total >= 75 ? 0 : 9.99
  const subtotal = total
  const tax = Math.round((subtotal - discount) * (taxRate / 100) * 100) / 100
  const grandTotal = Math.max(0, subtotal - discount + tax + shipping)

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

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await api.validateCoupon(couponCode, subtotal, 'retail')
      setDiscount(res.coupon.discount)
      setCouponApplied(res.coupon.code)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Invalid coupon')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0 || !form.paymentMethod) return

    setSubmitting(true)
    try {
      const billingAddress = {
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        phone: form.phone, company: form.company, addressLine1: form.address1,
        addressLine2: form.address2, city: form.city, state: form.state,
        postalCode: form.postalCode, country: form.country,
      }
      const shippingAddress = form.sameShipping ? billingAddress : {
        addressLine1: form.shipAddress1, city: form.shipCity,
        state: form.shipState, postalCode: form.shipPostalCode, country: 'US',
      }

      const payload = {
        paymentMethod: form.paymentMethod,
        couponCode: couponApplied || undefined,
        orderNotes: form.orderNotes || undefined,
        billingAddress,
        shippingAddress,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          variationId: i.variation?.id,
        })),
      }

      if (isCustomer) {
        await api.placeCustomerOrder(payload)
      } else {
        await api.placeRetailOrder({
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          customerEmail: form.email,
          ...payload,
        })
      }

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
      <PageShell>
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-forest-100 p-8 md:p-10 shadow-sm">
          <CheckCircle className="w-16 h-16 text-forest-600 mx-auto mb-4" />
          <h2 className="font-display font-700 text-2xl text-forest-900 mb-2">Order placed!</h2>
          <p className="text-sage-600 font-body mb-6">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-forest-700 text-white rounded-xl font-sans font-600 hover:bg-forest-800 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </PageShell>
    )
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-forest-100 p-8 md:p-10 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-sage-400 mx-auto mb-4" />
          <h2 className="font-display font-700 text-xl text-forest-900 mb-2">Your cart is empty</h2>
          <p className="text-sage-600 font-body mb-6">Add some plants to your cart before checking out.</p>
          <Link to="/shop" className="text-forest-700 font-sans font-600 hover:underline">
            Browse products
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        {/* Order summary first on mobile */}
        <div className="lg:col-span-1 order-2 lg:order-2">
          <OrderSummaryPanel
            items={items}
            subtotal={subtotal}
            discount={discount}
            taxRate={taxRate}
            tax={tax}
            shipping={shipping}
            grandTotal={grandTotal}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
            couponApplied={couponApplied}
            submitting={submitting}
            canSubmit={!!form.paymentMethod}
          />
        </div>

        <div className="lg:col-span-2 space-y-6 order-1 lg:order-1">
          <section className="bg-white rounded-2xl border border-forest-100 p-5 md:p-6 shadow-sm">
            <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Billing information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>First name *</label><input required className={inputClass} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div><label className={labelClass}>Last name *</label><input required className={inputClass} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Email *</label><input required type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className={labelClass}>Phone</label><input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className={labelClass}>Company</label><input className={inputClass} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Address *</label><input required className={inputClass} value={form.address1} onChange={e => setForm(f => ({ ...f, address1: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Apartment, suite, etc.</label><input className={inputClass} value={form.address2} onChange={e => setForm(f => ({ ...f, address2: e.target.value }))} /></div>
              <div><label className={labelClass}>City *</label><input required className={inputClass} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><label className={labelClass}>State *</label><input required className={inputClass} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
              <div className="sm:col-span-2 sm:max-w-xs"><label className={labelClass}>ZIP code *</label><input required className={inputClass} value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} /></div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-forest-100 p-5 md:p-6 shadow-sm">
            <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Shipping & notes</h2>
            <label className="flex items-center gap-2 mb-4 text-sm font-sans font-600 text-forest-800">
              <input
                type="checkbox"
                checked={form.sameShipping}
                onChange={e => setForm(f => ({ ...f, sameShipping: e.target.checked }))}
                className="rounded border-forest-300 text-forest-600 focus:ring-forest-500"
              />
              Shipping address same as billing
            </label>
            {!form.sameShipping && (
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2"><label className={labelClass}>Shipping address</label><input className={inputClass} value={form.shipAddress1} onChange={e => setForm(f => ({ ...f, shipAddress1: e.target.value }))} /></div>
                <div><label className={labelClass}>City</label><input className={inputClass} value={form.shipCity} onChange={e => setForm(f => ({ ...f, shipCity: e.target.value }))} /></div>
                <div><label className={labelClass}>State</label><input className={inputClass} value={form.shipState} onChange={e => setForm(f => ({ ...f, shipState: e.target.value }))} /></div>
                <div className="sm:max-w-xs"><label className={labelClass}>ZIP code</label><input className={inputClass} value={form.shipPostalCode} onChange={e => setForm(f => ({ ...f, shipPostalCode: e.target.value }))} /></div>
              </div>
            )}
            <div>
              <label className={labelClass}>Order notes</label>
              <textarea rows={3} className={inputClass} value={form.orderNotes} onChange={e => setForm(f => ({ ...f, orderNotes: e.target.value }))} placeholder="Special delivery instructions, gift message, etc." />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-forest-100 p-5 md:p-6 shadow-sm">
            <h2 className="font-sans font-700 text-lg text-forest-900 mb-4">Payment method</h2>
            {!paymentsLoaded ? (
              <p className="text-sm text-sage-500">Loading payment options...</p>
            ) : paymentMethods.length === 0 ? (
              <p className="text-sm text-terra-600">No payment methods are currently available. Please contact us to complete your order.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map(m => (
                  <label
                    key={m}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.paymentMethod === m ? 'border-forest-600 bg-forest-50' : 'border-forest-200 hover:border-forest-300'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m}
                      checked={form.paymentMethod === m}
                      onChange={() => setForm(f => ({ ...f, paymentMethod: m }))}
                      className="text-forest-600 focus:ring-forest-500"
                    />
                    <span className="text-sm font-sans font-600 text-forest-800">{m}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={submitting || !form.paymentMethod}
            className="lg:hidden w-full py-3.5 bg-forest-700 text-white rounded-xl font-sans font-600 hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Processing...' : `Place order — $${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </form>
    </PageShell>
  )
}
