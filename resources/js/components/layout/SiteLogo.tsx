import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { mediaUrl } from '@/lib/media'

interface Props {
  siteName: string
  logo?: string | null
  variant: 'header' | 'footer'
  className?: string
}

export default function SiteLogo({ siteName, logo, variant, className = '' }: Props) {
  const isFooter = variant === 'footer'

  if (logo) {
    return (
      <Link to="/" className={`inline-flex items-center focus-ring rounded-lg ${className}`}>
        <img
          src={mediaUrl(logo)}
          alt={siteName}
          className={isFooter ? 'h-10 max-w-[200px] object-contain' : 'h-10 md:h-11 max-w-[220px] object-contain'}
        />
      </Link>
    )
  }

  const [primary, ...rest] = siteName.split(' ')
  const secondary = rest.join(' ') || 'Gardens TN'

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
