import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { PlantType } from '@/types'

export default function PlantTypeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<PlantType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    api.getPlantType(slug)
      .then(res => {
        setPage(res.plantType)
        if (res.plantType.metaTitle) document.title = res.plantType.metaTitle
        else document.title = `${res.plantType.title} | Meadowlark Gardens`
      })
      .catch(() => setError('This plant type could not be found.'))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {page?.image && !loading && !error && (
        <div className="relative h-56 md:h-72 overflow-hidden bg-forest-900">
          <img
            src={mediaUrl(page.image)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-950/50" />
        </div>
      )}

      <div className="bg-white border-b border-forest-100">
        <div className="max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Link
            to="/plant-information"
            className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 font-sans font-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plant Information
          </Link>
          {loading ? (
            <div className="h-10 w-64 bg-forest-100/60 rounded-lg animate-pulse" />
          ) : error ? (
            <h1 className="font-display font-700 text-2xl text-forest-900">{error}</h1>
          ) : (
            <>
              <h1
                className="font-display font-700 text-forest-900"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
              >
                {page?.title}
              </h1>
              {page?.excerpt && (
                <p className="mt-3 text-sage-600 font-body text-lg leading-relaxed max-w-3xl">
                  {page.excerpt}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading && (
          <div className="bg-white rounded-2xl border border-forest-100 p-8 space-y-4 animate-pulse">
            <div className="h-4 bg-forest-100 rounded w-full" />
            <div className="h-4 bg-forest-100 rounded w-5/6" />
            <div className="h-4 bg-forest-100 rounded w-4/6" />
          </div>
        )}

        {!loading && !error && page && (
          <article
            className="legal-content bg-white rounded-2xl border border-forest-100 p-6 md:p-10 shadow-sm"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {!loading && error && (
          <Link
            to="/plant-information"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800"
          >
            Return to Plant Information
          </Link>
        )}
      </div>
    </div>
  )
}
