import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Leaf, Mail, Lock, UserPlus, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthShell, AuthAlert, AuthField, AuthSubmit, AuthDivider, AuthLinkButton, authTextLink } from '@/components/auth/AuthShell'

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <AuthShell
      icon={Leaf}
      title="Welcome back"
      subtitle="Sign in to track orders and manage your account"
      footer="Secure sign in · Your information is protected"
    >
      {error && <AuthAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="login-email"
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          inputMode="email"
        />
        <AuthField
          id="login-password"
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

      <AuthDivider label="New here?" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AuthLinkButton to="/register" icon={UserPlus}>Create account</AuthLinkButton>
        <AuthLinkButton to="/wholesale/login" icon={Building2}>Wholesale login</AuthLinkButton>
      </div>
    </AuthShell>
  )
}
