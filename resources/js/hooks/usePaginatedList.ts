import { useState, useEffect, useCallback } from 'react'
import type { ListParams, PaginatedMeta } from '@/types/admin'

interface UsePaginatedListOptions<T> {
  fetcher: (params: ListParams) => Promise<{ data: T[]; meta: PaginatedMeta }>
  defaultSort?: string
  defaultPerPage?: number
  extraFilters?: Record<string, string>
}

export function usePaginatedList<T>({
  fetcher, defaultSort = 'created_at', defaultPerPage = 15, extraFilters = {},
}: UsePaginatedListOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({
    currentPage: 1, lastPage: 1, perPage: defaultPerPage, total: 0, from: null, to: null,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState(defaultSort)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<Record<string, string>>(extraFilters)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetcher({
        page, per_page: defaultPerPage, search: search || undefined,
        sort_by: sortBy, sort_dir: sortDir, ...filters,
      })
      setData(result.data)
      setMeta(result.meta)
    } catch {
      // keep existing
    } finally {
      setLoading(false)
    }
  }, [fetcher, page, search, sortBy, sortDir, filters, defaultPerPage])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
  }

  const setFilter = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setFilters(extraFilters)
    setPage(1)
  }

  return {
    data, meta, loading, search, setSearch, page, setPage,
    sortBy, sortDir, handleSort, filters, setFilter, clearFilters, reload: load,
  }
}
