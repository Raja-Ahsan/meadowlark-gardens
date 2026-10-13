import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ShieldCheck, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthShell, AuthAlert, AuthField, AuthSubmit } from '@/components/auth/AuthShell'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="font-body antialiased">
      <AuthShell
        variant="dark"
        underNavbar={false}
        icon={ShieldCheck}
        title="Admin Panel"
        subtitle="Authorized staff only"
        footer="Meadowlark Gardens TN · Protected area"
      >
        {error && <AuthAlert message={error} variant="dark" />}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthField
            id="admin-email"
            label="Admin email"
            icon={Mail}
            variant="dark"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@meadowlarkgardens.com"
            autoComplete="email"
            inputMode="email"
          />
          <AuthField
            id="admin-password"
            label="Password"
            icon={Lock}
            variant="dark"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <AuthSubmit loading={loading} icon={Shield} label="Admin Sign In" loadingLabel="Signing In..." />
        </form>
      </AuthShell>
    </div>
  )
}
