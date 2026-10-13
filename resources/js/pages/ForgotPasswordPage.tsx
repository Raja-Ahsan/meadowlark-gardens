import { useState } from 'react'
import { KeyRound, Mail, Send, ArrowLeft, MailCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { AuthShell, AuthField, AuthSubmit, AuthAlert, AuthLinkButton } from '@/components/auth/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError('')
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
    <AuthShell
      icon={sent ? MailCheck : KeyRound}
      title={sent ? 'Check your email' : 'Forgot password?'}
      subtitle={sent ? undefined : "Enter your email and we'll send you a reset link"}
    >
      {sent ? (
        <div className="text-center space-y-6">
          <p className="text-sage-600 text-sm leading-relaxed">
            If an account exists for <span className="font-600 text-forest-800 break-all">{email}</span>, you'll receive a password reset link shortly.
          </p>
          <AuthLinkButton to="/login" icon={ArrowLeft}>Back to sign in</AuthLinkButton>
        </div>
      ) : (
        <>
          {error && <AuthAlert message={error} />}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthField
              id="forgot-email"
              label="Email address"
              icon={Mail}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
            />
            <AuthSubmit loading={loading} icon={Send} label="Send Reset Link" loadingLabel="Sending..." />
          </form>
          <div className="mt-6">
            <AuthLinkButton to="/login" icon={ArrowLeft}>Back to sign in</AuthLinkButton>
          </div>
        </>
      )}
    </AuthShell>
  )
}
