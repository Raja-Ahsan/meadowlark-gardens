import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { LogIn, Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, isAdmin, isWholesale, isCustomer } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    if (isAdmin) navigate('/admin')
    else if (isWholesale) navigate('/wholesale/portal')
    else if (isCustomer) navigate('/account')
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
    if (result.success) {
      const stored = localStorage.getItem('mg_user')
      const user = stored ? JSON.parse(stored) : null
      if (user?.role === 'admin') navigate('/admin')
      else if (user?.role === 'wholesale') navigate('/wholesale/portal')
      else navigate('/account')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-forest-100 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-700 text-forest-900 text-2xl">Customer Sign In</h1>
            <p className="text-sage-500 font-body text-sm mt-1">Access your orders and account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-terra-50 border border-terra-200 rounded-xl mb-5 text-terra-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-forest-200 rounded-xl text-sm bg-cream-50"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-forest-200 rounded-xl text-sm bg-cream-50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-forest-600 hover:text-forest-800 font-sans font-600">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-400 text-white font-sans font-700 rounded-xl transition-colors"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sage-500 text-sm font-body mt-6">
            New here?{' '}
            <Link to="/register" className="text-forest-600 hover:text-forest-800 font-sans font-600">
              Create an account →
            </Link>
          </p>
          <p className="text-center text-sage-400 text-xs font-body mt-3">
            Wholesale partner?{' '}
            <Link to="/wholesale/login" className="text-forest-500 hover:text-forest-700 font-sans font-600">
              Wholesale login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
