import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedMeta } from '@/types/admin'

interface PaginationProps {
  meta: PaginatedMeta
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.lastPage <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, meta.currentPage - 2)
  const end = Math.min(meta.lastPage, meta.currentPage + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-forest-100 bg-white">
      <p className="text-sm text-sage-600 font-body">
        Showing <span className="font-600 text-forest-800">{meta.from ?? 0}</span>–
        <span className="font-600 text-forest-800">{meta.to ?? 0}</span> of{' '}
        <span className="font-600 text-forest-800">{meta.total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(meta.currentPage - 1)}
          disabled={meta.currentPage <= 1}
          className="p-2 rounded-lg hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-sans font-600 transition-colors ${
              p === meta.currentPage
                ? 'bg-forest-700 text-white'
                : 'text-forest-700 hover:bg-forest-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(meta.currentPage + 1)}
          disabled={meta.currentPage >= meta.lastPage}
          className="p-2 rounded-lg hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
