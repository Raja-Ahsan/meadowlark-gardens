import { Search, X } from 'lucide-react'

interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface FilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  filters?: FilterOption[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  onClear?: () => void
  placeholder?: string
}

export default function FilterBar({
  search, onSearchChange, filters = [], filterValues = {},
  onFilterChange, onClear, placeholder = 'Search...',
}: FilterBarProps) {
  const hasFilters = search || Object.values(filterValues).some(v => v)

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border-b border-forest-100">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500"
        />
      </div>
      {filters.map(f => (
        <select
          key={f.key}
          value={filterValues[f.key] || ''}
          onChange={e => onFilterChange?.(f.key, e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-forest-200 text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        >
          <option value="">{f.label}</option>
          {f.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {hasFilters && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2 text-sm text-sage-600 hover:text-forest-800 font-sans font-600"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      )}
    </div>
  )
}
