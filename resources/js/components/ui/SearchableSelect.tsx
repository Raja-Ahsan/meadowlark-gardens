import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export type SearchableSelectOption = {
  value: string
  label: string
}

interface Props {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
}

/**
 * Select2-style searchable single select (no jQuery).
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found',
  required = false,
  disabled = false,
  className = '',
  id,
  name,
}: Props) {
  const autoId = useId()
  const selectId = id || autoId
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () => options.find(o => o.value === value) ?? null,
    [options, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      o =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Native required support for form validation */}
      <select
        id={selectId}
        name={name}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${selectId}-list`}
        onClick={() => {
          if (disabled) return
          setOpen(v => !v)
          setQuery('')
        }}
        className="w-full px-4 py-3 rounded-xl border border-forest-200 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30 disabled:opacity-50 flex items-center justify-between gap-2"
      >
        <span className={selected ? 'text-forest-900' : 'text-sage-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-sage-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-xl border border-forest-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-forest-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-sage-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm py-1.5 outline-none bg-transparent text-forest-900 placeholder:text-sage-400"
            />
          </div>
          <ul
            id={`${selectId}-list`}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-sage-500">{emptyMessage}</li>
            ) : (
              filtered.map(o => {
                const active = o.value === value
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        active
                          ? 'bg-forest-50 text-forest-800 font-600'
                          : 'text-forest-800 hover:bg-cream-50'
                      }`}
                      onClick={() => {
                        onChange(o.value)
                        setOpen(false)
                        setQuery('')
                      }}
                    >
                      {o.label}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
