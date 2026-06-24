import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Mail } from 'lucide-react'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-cream-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-700 text-2xl text-forest-900">Forgot Password</h1>
          <p className="text-sage-600 text-sm mt-2">Enter your email to receive a reset link</p>
        </div>
        <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <Mail className="w-10 h-10 text-forest-500 mx-auto mb-4" />
              <p className="text-forest-800 font-600 mb-2">Check your email</p>
              <p className="text-sage-600 text-sm">If an account exists for {email}, you'll receive a reset link shortly.</p>
              <Link to="/login" className="inline-block mt-6 text-forest-700 font-600 text-sm hover:underline">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-forest-700 mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-forest-700 text-white rounded-xl font-sans font-600 hover:bg-forest-800 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-sage-500">
                <Link to="/login" className="text-forest-700 font-600 hover:underline">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
