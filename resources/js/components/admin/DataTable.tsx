import { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import Pagination from './Pagination'
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
  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-forest-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-forest-600" />
  }

  return (
    <div className="bg-white rounded-2xl border border-forest-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-cream-50 border-b border-forest-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-sans font-600 text-forest-700 text-xs uppercase tracking-wider ${col.className || ''}`}
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sage-500">
                  <div className="inline-block w-6 h-6 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sage-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr key={rowKey(row)} className="hover:bg-cream-50/50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-forest-800 ${col.className || ''}`}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
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
