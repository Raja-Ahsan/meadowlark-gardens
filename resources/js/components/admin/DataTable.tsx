import { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import Pagination from './Pagination'
import { useDragScroll } from '@/hooks/useDragScroll'
import type { PaginatedMeta } from '@/types/admin'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  meta?: PaginatedMeta
  onPageChange?: (page: number) => void
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  loading?: boolean
  emptyMessage?: string
  rowKey: (row: T) => string
}

export default function DataTable<T>({
  columns, data, meta, onPageChange, sortBy, sortDir, onSort,
  loading, emptyMessage = 'No records found.', rowKey,
}: DataTableProps<T>) {
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-forest-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-forest-600" />
  }

  const renderCell = (col: Column<T>, row: T) =>
    col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')

  const firstLabeled = columns.findIndex(c => c.label)
  const leadingCols = firstLabeled > 0 ? columns.slice(0, firstLabeled) : []
  const titleCol = firstLabeled >= 0 ? columns[firstLabeled] : null
  const detailCols = columns.filter((c, i) => i > firstLabeled && c.label)
  const trailingCols = columns.filter((c, i) => i > firstLabeled && !c.label)
  const sortableCols = columns.filter(c => c.sortable)

  const status = loading ? (
    <div className="px-4 py-12 text-center">
      <div className="inline-block w-6 h-6 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
    </div>
  ) : data.length === 0 ? (
    <div className="px-4 py-12 text-center text-sage-500">{emptyMessage}</div>
  ) : null

  return (
    <div className="bg-white rounded-2xl border border-forest-100 overflow-hidden shadow-sm">
      {/* Mobile: card list */}
      <div className="md:hidden">
        {onSort && sortableCols.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-cream-50 border-b border-forest-100">
            <span className="text-xs font-sans font-600 uppercase tracking-wide text-sage-500">Sort</span>
            <select
              value={sortableCols.some(c => c.key === sortBy) ? sortBy : ''}
              onChange={e => e.target.value && onSort(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-forest-200 bg-white text-sm text-forest-800"
            >
              {!sortableCols.some(c => c.key === sortBy) && <option value="">Default</option>}
              {sortableCols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            {sortBy && sortableCols.some(c => c.key === sortBy) && (
              <button
                type="button"
                onClick={() => onSort(sortBy)}
                className="p-2 rounded-lg border border-forest-200 bg-white text-forest-700"
                aria-label={sortDir === 'asc' ? 'Sort descending' : 'Sort ascending'}
              >
                {sortDir === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
        {status ?? (
          <ul className="divide-y divide-forest-100">
            {data.map(row => (
              <li key={rowKey(row)} className="p-4 space-y-2.5">
                {(leadingCols.length > 0 || titleCol) && (
                  <div className="flex items-center gap-3 min-w-0">
                    {leadingCols.map(col => (
                      <div key={col.key} className="shrink-0">{renderCell(col, row)}</div>
                    ))}
                    {titleCol && (
                      <div className="min-w-0 flex-1 text-forest-900 font-600 break-words">{renderCell(titleCol, row)}</div>
                    )}
                  </div>
                )}
                {detailCols.length > 0 && (
                  <dl className="space-y-1.5">
                    {detailCols.map(col => (
                      <div key={col.key} className="flex items-start justify-between gap-4 text-sm">
                        <dt className="shrink-0 pt-0.5 text-[11px] font-sans font-600 uppercase tracking-wide text-sage-500">{col.label}</dt>
                        <dd className="min-w-0 text-right text-forest-800 break-words [&_.truncate]:whitespace-normal [&_.max-w-xs]:max-w-none">
                          {renderCell(col, row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {trailingCols.length > 0 && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-forest-50">
                    {trailingCols.map(col => (
                      <div key={col.key}>{renderCell(col, row)}</div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tablet & desktop: table */}
      <div ref={dragScrollRef} className="hidden md:block scroll-x">
        <table className="w-full text-sm font-body [&_.rounded-full]:whitespace-nowrap [&_td_button]:whitespace-nowrap">
          <thead>
            <tr className="bg-cream-50 border-b border-forest-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-sans font-600 text-forest-700 text-xs uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                >
                  {col.sortable && onSort ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-forest-900"
                    >
                      {col.label}
                      <SortIcon col={col.key} />
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-50">
            {status ? (
              <tr>
                <td colSpan={columns.length}>{status}</td>
              </tr>
            ) : (
              data.map(row => (
                <tr key={rowKey(row)} className="hover:bg-cream-50/50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-forest-800 ${col.className || ''}`}>
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  )
}
