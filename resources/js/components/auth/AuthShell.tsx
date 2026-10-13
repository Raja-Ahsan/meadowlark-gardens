import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import LeafCanvas from '@/components/ui/LeafCanvas'

export type AuthVariant = 'light' | 'dark'

interface ShellProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  variant?: AuthVariant
  /** Adds top padding for pages rendered under the fixed site navbar. */
  underNavbar?: boolean
  maxWidth?: string
}

export function AuthShell({
  icon: Icon, title, subtitle, children, footer, variant = 'light', underNavbar = true, maxWidth = 'max-w-md',
}: ShellProps) {
  const dark = variant === 'dark'

  return (
    <div
      className={`relative min-h-screen overflow-hidden flex items-center justify-center px-4 ${underNavbar ? 'pt-24 pb-12' : 'py-12'} ${
        dark ? 'bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950' : 'bg-gradient-to-br from-cream-50 via-forest-50 to-cream-100'
      }`}
    >
      <LeafCanvas variant={variant} />
      <div
        className={`absolute inset-0 pointer-events-none ${
          dark
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(15,31,17,0)_0%,rgba(15,31,17,0.55)_75%)]'
            : 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_60%)]'
        }`}
      />

      <div className={`relative w-full ${maxWidth}`}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`relative backdrop-blur-xl rounded-3xl overflow-hidden ${
            dark
              ? 'bg-forest-900/80 border border-forest-700/60 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)]'
              : 'bg-white/85 border border-white/70 ring-1 ring-forest-100 shadow-[0_24px_60px_-20px_rgba(30,57,32,0.35)]'
          }`}
        >
          <div className="h-1.5 bg-gradient-to-r from-forest-400 via-forest-600 to-terra-400" />

          <div className="p-6 sm:p-9">
            <div className="text-center mb-8">
              <motion.div
                initial={{ rotate: -12, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                className="relative w-16 h-16 mx-auto mb-5"
              >
                <div className="absolute inset-0 rounded-2xl bg-forest-400/30 blur-lg" />
                <div
                  className={`relative w-16 h-16 bg-gradient-to-br from-forest-500 to-forest-700 rounded-2xl flex items-center justify-center shadow-lg ring-4 ${
                    dark ? 'ring-forest-800' : 'ring-white'
                  }`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h1 className={`font-display font-700 text-2xl sm:text-3xl ${dark ? 'text-cream-100' : 'text-forest-900'}`}>{title}</h1>
              {subtitle && <p className={`font-body text-sm mt-1.5 ${dark ? 'text-forest-300' : 'text-sage-500'}`}>{subtitle}</p>}
            </div>

            {children}
          </div>
        </motion.div>

        {footer && (
          <div className={`relative text-center text-xs font-body mt-6 ${dark ? 'text-forest-400' : 'text-sage-500'}`}>{footer}</div>
        )}
      </div>
    </div>
  )
}

export function AuthAlert({ message, tone = 'error', variant = 'light' }: { message: string; tone?: 'error' | 'success'; variant?: AuthVariant }) {
  const dark = variant === 'dark'
  const styles = tone === 'success'
    ? (dark ? 'bg-forest-800/70 border-forest-600 text-forest-200' : 'bg-forest-50 border-forest-200 text-forest-800')
    : (dark ? 'bg-terra-900/40 border-terra-700 text-terra-300' : 'bg-terra-50 border-terra-200 text-terra-700')
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 p-3 border rounded-xl mb-5 text-sm ${styles}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  )
}

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string
  label: string
  icon: LucideIcon
  variant?: AuthVariant
  /** Rendered on the right of the label, e.g. a "Forgot password?" link. */
  labelAside?: ReactNode
  hint?: string
}

export function AuthField({ id, label, icon: Icon, variant = 'light', labelAside, hint, type = 'text', ...props }: FieldProps) {
  const dark = variant === 'dark'
  const isPassword = type === 'password'
  const [show, setShow] = useState(false)

  const inputClass = dark
    ? 'bg-forest-800/70 border-forest-700 text-cream-100 placeholder:text-forest-500 focus:bg-forest-800 focus:border-forest-400 focus:ring-forest-400/20'
    : 'bg-white/80 border-forest-200 text-forest-900 placeholder:text-sage-400 focus:bg-white focus:border-forest-500 focus:ring-forest-500/15'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label htmlFor={id} className={`block text-sm font-sans font-600 ${dark ? 'text-forest-200' : 'text-forest-700'}`}>{label}</label>
        {labelAside}
      </div>
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${dark ? 'text-forest-400' : 'text-sage-400'}`} />
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className={`w-full pl-11 ${isPassword ? 'pr-12' : 'pr-4'} py-3 border rounded-xl text-base sm:text-sm font-body transition-all focus:outline-none focus:ring-4 ${inputClass}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              dark ? 'text-forest-400 hover:text-cream-100 hover:bg-forest-700/60' : 'text-sage-400 hover:text-forest-700 hover:bg-forest-50'
            }`}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className={`text-xs mt-1.5 ${dark ? 'text-forest-400' : 'text-sage-500'}`}>{hint}</p>}
    </div>
  )
}

export function AuthSubmit({ loading, icon: Icon, label, loadingLabel }: { loading: boolean; icon: LucideIcon; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 disabled:from-forest-400 disabled:to-forest-400 disabled:cursor-not-allowed text-white font-sans font-700 rounded-xl shadow-lg shadow-forest-700/25 hover:shadow-xl hover:shadow-forest-700/30 transition-all focus-ring"
    >
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon className="w-4 h-4" />}
      {loading ? loadingLabel : label}
    </button>
  )
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-forest-100" />
      <span className="text-xs font-sans font-600 text-sage-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-forest-100" />
    </div>
  )
}

export function AuthLinkButton({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-forest-200 bg-white/70 text-forest-700 text-sm font-sans font-600 whitespace-nowrap hover:border-forest-400 hover:bg-forest-50 transition-colors"
    >
      <Icon className="w-4 h-4 shrink-0" />
      {children}
    </Link>
  )
}

export const authTextLink = 'text-xs text-forest-600 hover:text-forest-800 font-sans font-600'
