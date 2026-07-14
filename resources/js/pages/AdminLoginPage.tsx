import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Shield, Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated && isAdmin) {
    navigate('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(email, password)
    setLoading(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    const stored = localStorage.getItem('mg_user')
    const user = stored ? JSON.parse(stored) : null

    if (user?.role === 'admin') {
      navigate('/admin')
      return
    }

    await logout()
    if (user?.role === 'wholesale') {
      setError('Wholesale accounts must sign in at the wholesale portal.')
    } else if (user?.role === 'customer') {
      setError('Customer accounts cannot access the admin panel.')
    } else {
      setError('You do not have admin access.')
    }
  }

  return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center px-4 font-body antialiased">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-forest-900 rounded-3xl shadow-2xl border border-forest-800 p-8 font-sans"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-700 text-cream-100 text-2xl">Admin Panel</h1>
            <p className="text-forest-400 font-body text-sm mt-1">Authorized staff only</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-terra-900/40 border border-terra-700 rounded-xl mb-5 text-terra-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-600 text-forest-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-forest-700 rounded-xl text-sm font-body text-cream-100 bg-forest-800 placeholder:text-forest-500"
                placeholder="admin@meadowlarkgardens.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-sans font-600 text-forest-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-forest-700 rounded-xl text-sm font-body text-cream-100 bg-forest-800"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-200"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-600 hover:bg-forest-500 disabled:bg-forest-700 text-white font-sans font-700 rounded-xl transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Signing In...' : 'Admin Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
