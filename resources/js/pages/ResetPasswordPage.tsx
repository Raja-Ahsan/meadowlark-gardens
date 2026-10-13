import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, Check, ArrowLeft, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { AuthShell, AuthField, AuthSubmit, AuthAlert, AuthLinkButton } from '@/components/auth/AuthShell'

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
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
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
      <AuthShell icon={AlertTriangle} title="Invalid reset link" subtitle="This link is missing information or has expired.">
        <AuthLinkButton to="/forgot-password" icon={KeyRound}>Request a new link</AuthLinkButton>
      </AuthShell>
    )
  }

  return (
    <AuthShell icon={KeyRound} title="Set a new password" subtitle={`For ${email}`}>
      {error && <AuthAlert message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="reset-password"
          label="New password"
          icon={Lock}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          autoComplete="new-password"
        />
        <AuthField
          id="reset-password-confirm"
          label="Confirm password"
          icon={Lock}
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
        <AuthSubmit loading={loading} icon={Check} label="Reset Password" loadingLabel="Resetting..." />
      </form>
      <div className="mt-6">
        <AuthLinkButton to="/login" icon={ArrowLeft}>Back to sign in</AuthLinkButton>
      </div>
    </AuthShell>
  )
}
