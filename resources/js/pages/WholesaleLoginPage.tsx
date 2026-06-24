import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { LogIn, Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function WholesaleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate(isAdmin ? '/admin' : '/wholesale/portal')
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
      navigate(user?.role === 'admin' ? '/admin' : '/wholesale/portal')
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
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl shadow-xl border border-forest-100 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-700 text-forest-900 text-2xl">Wholesale Portal</h1>
            <p className="text-sage-500 font-body text-sm mt-1">Sign in to access your partner account</p>
          </div>

          <div className="mb-6 p-3 bg-forest-50 rounded-xl border border-forest-200 text-xs font-body text-forest-700">
            <p className="font-sans font-600 mb-1">Demo Credentials:</p>
            <p>Wholesale: <code className="bg-white px-1 rounded">wholesale@demo.com</code></p>
            <p>Admin: <code className="bg-white px-1 rounded">admin@meadowlarkgardens.com</code></p>
            <p className="text-sage-500 mt-1">Password: <code className="bg-white px-1 rounded">password123</code></p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-terra-50 border border-terra-200 rounded-xl mb-5 text-terra-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-600 text-forest-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-forest-200 rounded-xl text-sm font-body text-forest-900 bg-cream-50"
                placeholder="your@business.com"
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
                  className="w-full px-4 py-3 pr-12 border border-forest-200 rounded-xl text-sm font-body text-forest-900 bg-cream-50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 focus-ring rounded"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 disabled:translate-y-0 focus-ring"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sage-500 text-sm font-body mt-6">
            Not a partner yet?{' '}
            <Link to="/wholesale/apply" className="text-forest-600 hover:text-forest-800 font-sans font-600 transition-colors">
              Apply for access →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
