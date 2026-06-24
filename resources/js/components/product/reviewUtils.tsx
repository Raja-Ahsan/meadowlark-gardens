import { Star } from 'lucide-react'

export function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-sage-300'}`}
        />
      ))}
    </div>
  )
}

export function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-forest-700 font-sans">{label}</span>
      <div className="flex items-center gap-2">
        <StarRating rating={value} />
        <span className="font-600 text-forest-900 w-8 text-right">{value.toFixed(1)}</span>
      </div>
    </div>
  )
}
