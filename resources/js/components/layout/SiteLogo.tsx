import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { mediaUrl } from '@/lib/media'

interface Props {
  siteName: string
  logo?: string | null
  variant: 'header' | 'footer' | 'admin'
  className?: string
  scrolled?: boolean
  isHome?: boolean
  settingsReady?: boolean
}

export default function SiteLogo({
  siteName,
  logo,
  variant,
  className = '',
  scrolled = false,
  isHome = false,
  settingsReady = true,
}: Props) {
  const isFooter = variant === 'footer'
  const isAdmin = variant === 'admin'

  const headerLogoClass = isHome && !scrolled
    ? 'w-full max-w-[120px] p-[5px] rounded-[20px] bg-[#f3f4ed]'
    : 'w-full max-w-[80px] p-[5px] rounded-[20px] bg-transparent'

  const footerLogoClass = 'w-full max-w-[150px] p-[5px] rounded-[20px] bg-[#f3f4ed] object-contain'
  const adminLogoClass = 'w-full max-w-[70px] h-[70px] p-[5px] rounded-[50px] bg-[#f3f4ed] object-contain'

  const [primary, ...rest] = siteName.split(' ')
  const secondary = rest.join(' ') || 'Gardens TN'

  if (!settingsReady) {
    return (
      <div
        className={`inline-block rounded-[20px] bg-forest-100/40 animate-pulse ${
          isFooter ? 'h-10 w-[150px]' : isAdmin ? 'h-10 w-full' : 'h-10 w-[120px]'
        } ${className}`}
        aria-hidden
      />
    )
  }

  if (logo) {
    if (isAdmin) {
      return (
        <Link to="/" className={`flex items-center gap-3 focus-ring rounded-lg ${className}`}>
          <img src={mediaUrl(logo)} alt={siteName} className={`${adminLogoClass} shrink-0`} />
          <div className="min-w-0">
            <span className="font-sans font-700 text-cream-100 block leading-tight truncate text-[10px]">{siteName}</span>
            <span className="text-forest-400 text-xs font-body">Admin Panel</span>
          </div>
        </Link>
      )
    }

    return (
      <Link to="/" className={`inline-flex items-center focus-ring rounded-lg ${className}`}>
        <img
          src={mediaUrl(logo)}
          alt={siteName}
          className={
            isFooter
              ? footerLogoClass
              : `object-contain transition-all duration-300 ${headerLogoClass}`
          }
        />
      </Link>
    )
  }

  if (isAdmin) {
    return (
      <Link to="/" className={`flex items-center gap-3 group focus-ring rounded-lg ${className}`}>
        <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-cream-100" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <span className="font-sans font-700 text-cream-100 text-sm block leading-tight truncate">{siteName}</span>
          <span className="text-forest-400 text-xs font-body">Admin Panel</span>
        </div>
      </Link>
    )
  }

  return (
    <Link to="/" className={`flex items-center gap-2 group focus-ring rounded-lg ${className}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
        isFooter ? 'bg-forest-600' : 'bg-forest-600 group-hover:bg-forest-700'
      }`}>
        <Leaf className="w-5 h-5 text-cream-100" strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <span className={`font-display font-bold block leading-none ${
          isFooter ? 'text-cream-100 text-base' : 'text-forest-800 text-base'
        }`}>
          {primary}
        </span>
        <span className={`text-[10px] font-sans font-500 tracking-widest uppercase block ${
          isFooter ? 'text-sage-400' : 'text-sage-600'
        }`}>
          {secondary}
        </span>
      </div>
    </Link>
  )
}
