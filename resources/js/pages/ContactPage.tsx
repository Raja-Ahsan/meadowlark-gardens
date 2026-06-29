import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { splitSettingLines } from '@/components/layout/SocialLinks'

export default function ContactPage() {
  const {
    siteEmail,
    sitePhone,
    contactPageSubtitle,
    contactAddress,
    contactPhoneNote,
    contactEmailNote,
    businessHoursWeekday,
    businessHoursSunday,
  } = useSiteSettings()

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const addressLines = splitSettingLines(contactAddress)
  const phoneLines = [sitePhone, contactPhoneNote].filter(Boolean)
  const emailLines = [siteEmail, contactEmailNote].filter(Boolean)
  const hoursLines = [businessHoursWeekday, businessHoursSunday].filter(Boolean)

  const contactItems = [
    addressLines.length > 0 && { icon: MapPin, label: 'Located at', lines: addressLines },
    phoneLines.length > 0 && { icon: Phone, label: 'Call Us', lines: phoneLines },
    emailLines.length > 0 && { icon: Mail, label: 'Email Us', lines: emailLines },
    hoursLines.length > 0 && { icon: Clock, label: 'Hours', lines: hoursLines },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; lines: string[] }[]

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Your name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.subject.trim()) e.subject = 'Please add a subject'
    if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    setSubmitError('')
    try {
      await api.submitContact(form)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="bg-white border-b border-forest-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display font-700 text-forest-900"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Get in Touch
          </motion.h1>
          {contactPageSubtitle && (
            <p className="text-sage-600 font-body mt-2">{contactPageSubtitle}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            {contactItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex gap-4 p-5 bg-white rounded-2xl border border-forest-100 shadow-sm"
              >
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="font-sans font-700 text-forest-800 text-sm">{item.label}</p>
                  {item.lines.map(l => (
                    <p key={l} className="text-sage-600 text-sm font-body">{l}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-forest-100 shadow-sm p-8"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-forest-600" />
                </div>
                <h3 className="font-display font-700 text-forest-900 text-2xl mb-2">Message Sent!</h3>
                <p className="text-sage-600 font-body">Thank you for reaching out. We'll get back to you within one business day.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="mt-6 px-5 py-2.5 bg-forest-600 text-white font-sans font-600 rounded-xl hover:bg-forest-700 transition-colors focus-ring"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display font-700 text-forest-900 text-2xl mb-6">Send Us a Message</h2>
                {submitError && (
                  <p className="mb-4 text-sm text-terra-600 bg-terra-50 border border-terra-200 rounded-xl px-4 py-3">{submitError}</p>
                )}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
                        Your Name <span className="text-terra-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors ${errors.name ? 'border-terra-400 bg-terra-50' : 'border-forest-200 bg-cream-50'}`}
                        placeholder="Jane Smith"
                      />
                      {errors.name && <p className="text-terra-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
                        Email Address <span className="text-terra-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors ${errors.email ? 'border-terra-400 bg-terra-50' : 'border-forest-200 bg-cream-50'}`}
                        placeholder="jane@email.com"
                      />
                      {errors.email && <p className="text-terra-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
                      Subject <span className="text-terra-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors ${errors.subject ? 'border-terra-400 bg-terra-50' : 'border-forest-200 bg-cream-50'}`}
                      placeholder="Question about native plants..."
                    />
                    {errors.subject && <p className="text-terra-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">
                      Message <span className="text-terra-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-body text-forest-900 transition-colors resize-none ${errors.message ? 'border-terra-400 bg-terra-50' : 'border-forest-200 bg-cream-50'}`}
                      placeholder="Tell us how we can help..."
                    />
                    {errors.message && <p className="text-terra-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:translate-y-0 focus-ring"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
