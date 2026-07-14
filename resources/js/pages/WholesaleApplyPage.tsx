import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Tag, Truck, BarChart3, Send, CheckCircle, ArrowRight, ClipboardList } from 'lucide-react'
import { api } from '@/lib/api'

const benefits = [
  { icon: Tag, title: 'Up to 40% Off', desc: 'Significantly reduced pricing across our entire catalog for approved partners.' },
  { icon: Truck, title: 'Priority Fulfillment', desc: 'Wholesale orders are fulfilled within 3 business days with dedicated logistics.' },
  { icon: BarChart3, title: 'Order Tracking', desc: 'Full portal access to manage orders, view invoices, and track deliveries.' },
]

export default function WholesaleApplyPage() {
  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    address: '', businessType: '', estimatedMonthlyOrder: '', message: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.businessName.trim()) e.businessName = 'Business name is required'
    if (!form.contactName.trim()) e.contactName = 'Contact name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.businessType) e.businessType = 'Please select a business type'
    if (!form.estimatedMonthlyOrder) e.estimatedMonthlyOrder = 'Please select an estimated order'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    try {
      await api.submitWholesaleApplication(form)
      setSubmitted(true)
    } catch (error) {
      setErrors({ businessName: error instanceof Error ? error.message : 'Submission failed' })
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
        {label} <span className="text-terra-500">*</span>
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors ${errors[key] ? 'border-terra-400 bg-terra-50' : 'border-forest-200 bg-cream-50'}`}
        placeholder={placeholder}
      />
      {errors[key] && <p className="text-terra-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Header */}
      <div className="bg-forest-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=40")', backgroundSize: 'cover' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700"
          >
            For Businesses
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="font-display font-700 text-cream-50 mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            Apply for Wholesale Access
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sage-300 font-body text-lg"
          >
            Join 85+ nurseries, landscapers, and garden centers who partner with Meadowlark Gardens TN.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-sage-400 text-sm font-body"
          >
            Already a partner?{' '}
            <Link to="/wholesale/login" className="text-forest-300 hover:text-forest-100 underline transition-colors">
              Sign in to your portal →
            </Link>
          </motion.p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-forest-100 shadow-sm"
            >
              <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-forest-600" />
              </div>
              <div>
                <h3 className="font-sans font-700 text-forest-800 mb-1">{b.title}</h3>
                <p className="text-sage-600 text-sm font-body">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-forest-100 shadow-sm p-10 text-center"
            >
              <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-forest-600" />
              </div>
              <h2 className="font-display font-700 text-forest-900 text-2xl mb-3">Application Submitted!</h2>
              <p className="text-sage-600 font-body mb-6 max-w-md mx-auto">
                We've received your wholesale application for <strong className="text-forest-800">{form.businessName}</strong>. Our team will review it within 2–3 business days and reach out to <strong className="text-forest-800">{form.email}</strong>.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-3 bg-forest-600 text-white font-sans font-600 rounded-xl hover:bg-forest-700 transition-colors"
              >
                Back to Home <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-2xl border border-forest-100 shadow-sm p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <h2 className="font-display font-700 text-forest-900 text-xl">Wholesale Application</h2>
                  <p className="text-sage-500 text-sm font-body">All fields marked with * are required</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {field('Business Name', 'businessName', 'text', 'Green Valley Nursery')}
                  {field('Contact Person', 'contactName', 'text', 'Jane Smith')}
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  {field('Business Email', 'email', 'email', 'jane@business.com')}
                  {field('Phone Number', 'phone', 'tel', '(615) 555-0000')}
                </div>
                {field('Business Address', 'address', 'text', '123 Garden St, Nashville, TN 37201')}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
                      Business Type <span className="text-terra-500">*</span>
                    </label>
                    <select
                      value={form.businessType}
                      onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors bg-cream-50 ${errors.businessType ? 'border-terra-400' : 'border-forest-200'}`}
                    >
                      <option value="">Select type...</option>
                      <option>Retail Nursery</option>
                      <option>Landscaping Company</option>
                      <option>Garden Center</option>
                      <option>Florist</option>
                      <option>Home Improvement Store</option>
                      <option>Other</option>
                    </select>
                    {errors.businessType && <p className="text-terra-500 text-xs mt-1">{errors.businessType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
                      Est. Monthly Order <span className="text-terra-500">*</span>
                    </label>
                    <select
                      value={form.estimatedMonthlyOrder}
                      onChange={e => setForm(f => ({ ...f, estimatedMonthlyOrder: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors bg-cream-50 ${errors.estimatedMonthlyOrder ? 'border-terra-400' : 'border-forest-200'}`}
                    >
                      <option value="">Select range...</option>
                      <option>Under $500</option>
                      <option>$500 - $1,000</option>
                      <option>$1,000 - $2,000</option>
                      <option>$2,000 - $5,000</option>
                      <option>$5,000 - $10,000</option>
                      <option>$10,000+</option>
                    </select>
                    {errors.estimatedMonthlyOrder && <p className="text-terra-500 text-xs mt-1">{errors.estimatedMonthlyOrder}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">Additional Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-forest-200 rounded-xl text-sm font-body text-forest-900 bg-cream-50 resize-none"
                    placeholder="Any specific plant categories you're interested in, or questions about the program..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 disabled:translate-y-0 focus-ring"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Application</>
                  )}
                </button>
                <p className="text-sage-500 text-xs text-center font-body">
                  Applications are reviewed within 2–3 business days. Approved partners receive login credentials via email.
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}