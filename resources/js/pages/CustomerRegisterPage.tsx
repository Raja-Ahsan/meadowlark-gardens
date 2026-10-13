import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Sprout, User, Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthShell, AuthAlert, AuthField, AuthSubmit, AuthDivider, AuthLinkButton } from '@/components/auth/AuthShell'

export default function CustomerRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated, isCustomer } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated && isCustomer) {
    navigate('/account')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    const result = await register(form.name, form.email, form.password, form.passwordConfirmation)
    setLoading(false)
    if (result.success) navigate('/account')
    else setError(result.message)
  }

  return (
    <AuthShell
      icon={Sprout}
      title="Create your account"
      subtitle="Shop plants, save favorites and track your orders"
      footer="Secure sign up · Your information is protected"
    >
      {error && <AuthAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="register-name"
          label="Full name"
          icon={User}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Jane Smith"
          autoComplete="name"
        />
        <AuthField
          id="register-email"
          label="Email address"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="you@email.com"
          autoComplete="email"
          inputMode="email"
        />
        <AuthField
          id="register-password"
          label="Password"
          icon={Lock}
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="Min. 6 characters"
          autoComplete="new-password"
        />
        <AuthField
          id="register-password-confirm"
          label="Confirm password"
          icon={Lock}
          type="password"
          value={form.passwordConfirmation}
          onChange={e => setForm(f => ({ ...f, passwordConfirmation: e.target.value }))}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
        <AuthSubmit loading={loading} icon={UserPlus} label="Create Account" loadingLabel="Creating Account..." />
      </form>

      <AuthDivider label="Already have an account?" />

      <AuthLinkButton to="/login" icon={LogIn}>Sign in instead</AuthLinkButton>
    </AuthShell>
  )
}
