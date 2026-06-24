import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import SettingImageUpload from '@/components/admin/SettingImageUpload'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

type Tab = 'general' | 'contact' | 'payments' | 'smtp'

const CONTACT_KEYS = [
  'site_email', 'site_phone', 'contact_page_subtitle', 'contact_address',
  'contact_phone_note', 'contact_email_note', 'business_hours_weekday', 'business_hours_sunday',
  'footer_description', 'social_facebook', 'social_instagram', 'social_twitter', 'social_youtube', 'social_pinterest',
] as const

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('general')
  const [settings, setSettings] = useState<Record<string, Record<string, string>>>({})
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.getSettings().then(r => setSettings(r.settings)).catch(() => {})
  }, [])

  const get = (group: string, key: string) => settings[group]?.[key] || ''

  const set = (group: string, key: string, value: string) => {
    setSettings(s => ({ ...s, [group]: { ...s[group], [key]: value } }))
  }

  const save = async (group: string, keys?: readonly string[]) => {
    setSaving(true)
    setMessage('')
    try {
      const payload = keys
        ? Object.fromEntries(keys.map(k => [k, get(group, k)]))
        : (settings[group] || {})
      await api.updateSettings(payload, group)
      setMessage('Settings saved successfully.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      const res = await api.testEmail(testEmail)
      setMessage(res.message)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact & Footer' },
    { id: 'payments', label: 'Payment Gateways' },
    { id: 'smtp', label: 'SMTP' },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="font-sans font-700 text-2xl text-forest-900">Settings</h1><p className="text-sage-600 text-sm mt-1">Configure store settings</p></div>

      <div className="flex gap-2 border-b border-forest-100 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-sans font-600 border-b-2 -mb-px ${tab === t.id ? 'border-forest-700 text-forest-900' : 'border-transparent text-sage-500'}`}>{t.label}</button>
        ))}
      </div>

      {message && <div className="px-4 py-3 rounded-xl bg-forest-50 text-forest-800 text-sm">{message}</div>}

      <div className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm max-w-2xl">
        {tab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-sans font-700 text-forest-900 text-sm mb-4">Website branding</h2>
              <div className="space-y-5">
                <SettingImageUpload
                  label="Header logo"
                  hint="Shown in the site navigation bar. Recommended: PNG or SVG with transparent background, max height ~48px."
                  value={get('general', 'header_logo')}
                  onChange={v => set('general', 'header_logo', v)}
                  previewClass="h-10 max-w-[180px] object-contain"
                />
                <SettingImageUpload
                  label="Footer logo"
                  hint="Shown in the site footer. Can be a lighter version for dark backgrounds."
                  value={get('general', 'footer_logo')}
                  onChange={v => set('general', 'footer_logo', v)}
                  previewClass="h-10 max-w-[180px] object-contain"
                />
                <SettingImageUpload
                  label="Favicon"
                  hint="Browser tab icon. Use a square image (32×32 or 64×64 PNG/ICO)."
                  value={get('general', 'favicon')}
                  onChange={v => set('general', 'favicon', v)}
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp,.ico"
                  previewClass="w-10 h-10 object-contain"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-forest-100">
              <h2 className="font-sans font-700 text-forest-900 text-sm mb-4">Store details</h2>
              <div className="space-y-4">
                {[
                  ['site_name', 'Site Name'],
                  ['tax_rate', 'Tax Rate (%)'], ['currency', 'Currency'],
                ].map(([key, label]) => (
                  <div key={key}><label className={labelClass}>{label}</label>
                    <input className={inputClass} value={get('general', key)} onChange={e => set('general', key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => save('general')} disabled={saving} className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save General Settings'}</button>
          </div>
        )}

        {tab === 'contact' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-sans font-700 text-forest-900 text-sm mb-4">Contact page</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Page subtitle</label>
                  <input className={inputClass} value={get('general', 'contact_page_subtitle')} onChange={e => set('general', 'contact_page_subtitle', e.target.value)} placeholder="We'd love to hear from you..." />
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <textarea rows={3} className={inputClass} value={get('general', 'contact_address')} onChange={e => set('general', 'contact_address', e.target.value)} placeholder={'1247 Meadowlark Lane\nFranklin, TN 37064'} />
                  <p className="text-xs text-sage-500 mt-1">One line per address row (shown on Contact page and footer).</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone number</label>
                    <input className={inputClass} value={get('general', 'site_phone')} onChange={e => set('general', 'site_phone', e.target.value)} placeholder="(615) 555-0182" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone note</label>
                    <input className={inputClass} value={get('general', 'contact_phone_note')} onChange={e => set('general', 'contact_phone_note', e.target.value)} placeholder="Mon–Sat 8am – 5pm" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email address</label>
                    <input type="email" className={inputClass} value={get('general', 'site_email')} onChange={e => set('general', 'site_email', e.target.value)} placeholder="hello@meadowlarkgardens.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Email note</label>
                    <input className={inputClass} value={get('general', 'contact_email_note')} onChange={e => set('general', 'contact_email_note', e.target.value)} placeholder="We reply within 24 hours" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Weekday hours</label>
                    <input className={inputClass} value={get('general', 'business_hours_weekday')} onChange={e => set('general', 'business_hours_weekday', e.target.value)} placeholder="Mon–Sat: 8:00am – 5:30pm" />
                  </div>
                  <div>
                    <label className={labelClass}>Sunday hours</label>
                    <input className={inputClass} value={get('general', 'business_hours_sunday')} onChange={e => set('general', 'business_hours_sunday', e.target.value)} placeholder="Sunday: 10:00am – 3:00pm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest-100">
              <h2 className="font-sans font-700 text-forest-900 text-sm mb-4">Footer</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Footer description</label>
                  <textarea rows={3} className={inputClass} value={get('general', 'footer_description')} onChange={e => set('general', 'footer_description', e.target.value)} placeholder="Short tagline about your business..." />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest-100">
              <h2 className="font-sans font-700 text-forest-900 text-sm mb-4">Social links</h2>
              <p className="text-xs text-sage-500 mb-4">Leave blank to hide an icon. Icons only appear when a URL is set.</p>
              <div className="space-y-4">
                {[
                  ['social_facebook', 'Facebook URL'],
                  ['social_instagram', 'Instagram URL'],
                  ['social_twitter', 'Twitter / X URL'],
                  ['social_youtube', 'YouTube URL'],
                  ['social_pinterest', 'Pinterest URL'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <input type="url" className={inputClass} value={get('general', key)} onChange={e => set('general', key, e.target.value)} placeholder="https://" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => save('general', CONTACT_KEYS)} disabled={saving} className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save Contact & Footer'}</button>
          </div>
        )}

        {tab === 'payments' && (
          <div className="space-y-4">
            {[
              ['stripe_enabled', 'Stripe'], ['paypal_enabled', 'PayPal'],
              ['bank_transfer_enabled', 'Bank Transfer'], ['cod_enabled', 'Cash on Delivery'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-forest-100">
                <span className="font-600 text-sm">{label}</span>
                <input type="checkbox" checked={get('general', key) === 'true'} onChange={e => set('general', key, e.target.checked ? 'true' : 'false')} />
              </label>
            ))}
            <div><label className={labelClass}>Stripe Publishable Key</label><input className={inputClass} value={get('general', 'stripe_key')} onChange={e => set('general', 'stripe_key', e.target.value)} placeholder="pk_live_..." /></div>
            <div><label className={labelClass}>Stripe Secret Key</label><input type="password" className={inputClass} value={get('general', 'stripe_secret')} onChange={e => set('general', 'stripe_secret', e.target.value)} /></div>
            <button onClick={() => save('general')} disabled={saving} className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save Payment Settings'}</button>
          </div>
        )}

        {tab === 'smtp' && (
          <div className="space-y-4">
            {[
              ['smtp_host', 'SMTP Host'], ['smtp_port', 'Port'], ['smtp_username', 'Username'],
              ['smtp_password', 'Password'], ['smtp_encryption', 'Encryption'], ['smtp_from_name', 'From Name'], ['smtp_from_email', 'From Email'],
            ].map(([key, label]) => (
              <div key={key}><label className={labelClass}>{label}</label>
                <input type={key.includes('password') ? 'password' : 'text'} className={inputClass} value={get('smtp', key)} onChange={e => set('smtp', key, e.target.value)} />
              </div>
            ))}
            <button onClick={() => save('smtp')} disabled={saving} className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600">{saving ? 'Saving...' : 'Save SMTP Settings'}</button>
            <div className="pt-4 border-t border-forest-100">
              <label className={labelClass}>Test Email Address</label>
              <div className="flex gap-2">
                <input className={inputClass} value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" />
                <button onClick={handleTestEmail} className="px-4 py-2 border border-forest-200 rounded-xl text-sm font-600 whitespace-nowrap">Send Test</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
