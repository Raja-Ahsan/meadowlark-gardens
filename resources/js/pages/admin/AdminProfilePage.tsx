import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import SettingImageUpload from '@/components/admin/SettingImageUpload'

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: '',
    business_name: '',
    phone: '',
    avatar: '',
  })

  const [pwForm, setPwForm] = useState({ current: '', password: '', confirm: '' })

  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name || '',
      business_name: user.businessName || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
    })
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.updateProfile({
        name: profileForm.name,
        business_name: profileForm.business_name,
        phone: profileForm.phone || undefined,
        avatar: profileForm.avatar || null,
      })
      await refreshUser()
      setMessage(res.message || 'Profile updated.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (pwForm.password !== pwForm.confirm) {
      setError('New passwords do not match.')
      return
    }
    setPwSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.updatePassword(pwForm.current, pwForm.password, pwForm.confirm)
      setMessage(res.message || 'Password updated.')
      setPwForm({ current: '', password: '', confirm: '' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update password')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sans font-700 text-2xl text-forest-900">My Profile</h1>
        <p className="text-sage-600 text-sm mt-1">Update your photo, account details, and password.</p>
      </div>

      {message && <div className="px-4 py-3 rounded-xl bg-forest-50 text-forest-800 text-sm">{message}</div>}
      {error && <div className="px-4 py-3 rounded-xl bg-terra-50 text-terra-800 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-forest-100">
          <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-forest-600" />
          </div>
          <div>
            <h2 className="font-sans font-700 text-forest-900">Profile information</h2>
            <p className="text-xs text-sage-500">Shown in the admin sidebar and your account.</p>
          </div>
        </div>

        <SettingImageUpload
          label="Profile photo"
          hint="Square image recommended. JPG or PNG, max 5 MB."
          value={profileForm.avatar}
          onChange={v => setProfileForm(f => ({ ...f, avatar: v }))}
          folder="avatars"
          accept="image/jpeg,image/png,image/webp,image/gif"
          previewClass="w-24 h-24 rounded-full object-cover"
        />

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              className={inputClass}
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass}>Display name</label>
            <input
              className={inputClass}
              value={profileForm.business_name}
              onChange={e => setProfileForm(f => ({ ...f, business_name: e.target.value }))}
              placeholder="Shown in admin panel"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={profileForm.phone}
              onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="(615) 555-0100"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={`${inputClass} bg-cream-50 text-sage-500`} value={user?.email || ''} disabled />
            <p className="text-xs text-sage-500 mt-1">Email cannot be changed here.</p>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-sans font-700 text-forest-900">Change password</h2>
          <p className="text-xs text-sage-500 mt-1">Use at least 6 characters.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Current password</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.current}
              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.password}
              onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
        </div>
        <button
          onClick={changePassword}
          disabled={pwSaving || !pwForm.current || !pwForm.password || !pwForm.confirm}
          className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-600 disabled:opacity-60"
        >
          {pwSaving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}
