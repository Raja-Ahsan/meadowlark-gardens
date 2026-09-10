import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface Props {
  label: string
  value: string
  icon: LucideIcon
  trend?: number | null
  trendLabel?: string
  accent?: 'forest' | 'blue' | 'violet' | 'amber' | 'terra' | 'sage'
  className?: string
}

const accents = {
  forest: 'from-forest-600 to-forest-800 shadow-forest-900/20',
  blue: 'from-blue-500 to-blue-700 shadow-blue-900/20',
  violet: 'from-violet-500 to-violet-700 shadow-violet-900/20',
  amber: 'from-amber-500 to-amber-600 shadow-amber-900/20',
  terra: 'from-terra-500 to-terra-700 shadow-terra-900/20',
  sage: 'from-sage-500 to-sage-700 shadow-sage-900/20',
}

export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  accent = 'forest',
  className = '',
}: Props) {
  const trendUp = trend !== undefined && trend !== null && trend >= 0

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border border-forest-100 p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${accents[accent]} opacity-10`} />
      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <p className="text-xs font-sans font-600 text-sage-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl lg:text-3xl font-sans font-800 text-forest-900 mt-1 tabular-nums">{value}</p>
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-600 ${trendUp ? 'text-forest-600' : 'text-terra-600'}`}>
              {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend).toFixed(1)}% {trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accents[accent]} shadow-lg flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return ((current - previous) / previous) * 100
}
