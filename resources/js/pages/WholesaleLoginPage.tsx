import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Building2, Mail, Lock, ClipboardList, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthShell, AuthAlert, AuthField, AuthSubmit, AuthDivider, AuthLinkButton, authTextLink } from '@/components/auth/AuthShell'

export default function WholesaleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, logout, isAuthenticated, isWholesale } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated && isWholesale) {
    navigate('/wholesale/portal')
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

    if (user?.role === 'wholesale') {
      navigate('/wholesale/portal')
      return
    }

    await logout()
    if (user?.role === 'admin') {
      setError('Admin accounts must sign in at /admin/login')
    } else if (user?.role === 'customer') {
      setError('Retail customers should sign in at /login')
    } else {
      setError('You do not have wholesale partner access.')
    }
  }

  return (
    <AuthShell
      icon={Building2}
      title="Wholesale Portal"
      subtitle="Sign in to your partner account"
      footer="Wholesale pricing · Minimum orders of 5 units"
    >
      {error && <AuthAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="wholesale-email"
          label="Business email"
          icon={Mail}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@business.com"
          autoComplete="email"
          inputMode="email"
        />
        <AuthField
          id="wholesale-password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          labelAside={<Link to="/forgot-password" className={authTextLink}>Forgot password?</Link>}
        />
        <AuthSubmit loading={loading} icon={LogIn} label="Sign In" loadingLabel="Signing In..." />
      </form>

      <AuthDivider label="Not a partner yet?" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AuthLinkButton to="/wholesale/apply" icon={ClipboardList}>Apply for access</AuthLinkButton>
        <AuthLinkButton to="/login" icon={User}>Customer login</AuthLinkButton>
      </div>
    </AuthShell>
  )
}
