import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { api } from '@/lib/api'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const email = params.get('email') || ''
  const token = params.get('token') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await api.resetPassword(email, token, password, confirm)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (!email || !token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-terra-600 mb-4">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-forest-700 font-600">Request a new link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-cream-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-700 text-2xl text-forest-900">Reset Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest-100 shadow-sm p-8 space-y-4">
          {error && <p className="text-terra-600 text-sm bg-terra-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-600 text-forest-700 mb-1">New Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-forest-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-600 text-forest-700 mb-1">Confirm Password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-forest-200 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-forest-700 text-white rounded-xl font-600 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
