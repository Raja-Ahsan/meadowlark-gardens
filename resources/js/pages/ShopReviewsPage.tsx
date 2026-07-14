import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Star, Users } from 'lucide-react'
import { api } from '@/lib/api'
import type { CustomerReview, ReviewInsights, ShopProfile } from '@/types'
import type { PaginatedMeta } from '@/types/admin'
import ShopReviewCard from '@/components/product/ShopReviewCard'
import { RatingBar, StarRating } from '@/components/product/reviewUtils'
import { mediaUrl } from '@/lib/media'

export default function ShopReviewsPage() {
  const [shop, setShop] = useState<ShopProfile | null>(null)
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [insights, setInsights] = useState<ReviewInsights | null>(null)
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    api.getShopProfile().then(r => setShop(r.shop)).catch(() => {})
  }, [])

  const loadReviews = (pageNum: number, category: string, append: boolean) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    api.getShopReviews(pageNum, 20, category || undefined)
      .then(r => {
        setReviews(prev => append ? [...prev, ...r.reviews] : r.reviews)
        setInsights(r.insights)
        setMeta(r.meta)
        setPage(pageNum)
      })
      .catch(() => {
        if (!append) setReviews([])
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }

  useEffect(() => {
    loadReviews(1, categoryFilter, false)
  }, [categoryFilter])

  const total = meta?.total ?? insights?.totalReviews ?? shop?.reviewCount ?? 0
  const hasMore = meta ? page < meta.lastPage : false

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="bg-white border-b border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 font-sans font-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
          <h1
            className="font-display font-700 text-forest-900"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            All reviews from this shop
          </h1>
          <p className="text-sage-600 font-body mt-1">
            {total.toLocaleString()} reviews from Meadowlark Gardens customers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 items-start">
          <aside className="space-y-6 lg:sticky lg:top-28">
            {shop && (
              <div className="bg-white rounded-2xl border border-forest-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  {shop.avatar ? (
                    <img src={mediaUrl(shop.avatar)} alt={shop.displayName} className="w-12 h-12 rounded-full object-cover border border-forest-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-display font-700">
                      {shop.displayName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-sans font-700 text-forest-900">{shop.name}</p>
                    <p className="text-xs text-sage-600">{shop.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-600 text-forest-900">{shop.rating.toFixed(1)}</span>
                  <span className="text-sage-500">({shop.reviewCount.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sage-600 mt-2">
                  <Users className="w-3.5 h-3.5" />
                  {shop.members.join(' · ')}
                </div>
              </div>
            )}

            {insights && insights.summaryTags.length > 0 && (
              <div className="bg-white rounded-2xl border border-forest-100 p-5 shadow-sm">
                <p className="text-xs font-sans font-600 text-sage-500 uppercase tracking-wide mb-2">
                  What buyers say
                </p>
                <div className="flex flex-wrap gap-2">
                  {insights.summaryTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-cream-100 text-forest-800 rounded-full text-xs font-sans font-600 border border-cream-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insights && (
              <div className="bg-white rounded-2xl border border-forest-100 p-5 shadow-sm space-y-3">
                <div className="text-center pb-3 border-b border-forest-100">
                  <p className="text-3xl font-display font-700 text-forest-900">{insights.averageRating.toFixed(1)}</p>
                  <div className="flex justify-center mt-1">
                    <StarRating rating={insights.averageRating} size="md" />
                  </div>
                  <p className="text-sm text-sage-500 mt-1">Shop average</p>
                </div>
                <RatingBar label="Item quality" value={insights.breakdown.quality} />
                <RatingBar label="Delivery" value={insights.breakdown.delivery} />
                <RatingBar label="Customer service" value={insights.breakdown.service} />
                {insights.recommendPercent > 0 && (
                  <p className="text-sm text-center text-forest-700 font-sans font-600 pt-2">
                    {insights.recommendPercent}% of buyers recommend this shop
                  </p>
                )}
              </div>
            )}

            {insights && insights.categoryCounts.length > 0 && (
              <div className="bg-white rounded-2xl border border-forest-100 p-5 shadow-sm">
                <p className="text-sm font-sans font-700 text-forest-900 mb-3">Filter by category</p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !categoryFilter ? 'bg-forest-100 text-forest-800 font-600' : 'text-forest-700 hover:bg-forest-50'
                    }`}
                  >
                    All reviews ({total.toLocaleString()})
                  </button>
                  {insights.categoryCounts.map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategoryFilter(cat.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        categoryFilter === cat.key ? 'bg-forest-100 text-forest-800 font-600' : 'text-forest-700 hover:bg-forest-50'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-white rounded-xl border border-forest-100 animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sage-500 py-12 text-center">No reviews found for this filter.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ShopReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => loadReviews(page + 1, categoryFilter, true)}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-forest-700 text-white rounded-xl font-sans font-600 hover:bg-forest-800 disabled:opacity-50 transition-colors"
                    >
                      {loadingMore ? 'Loading...' : `Load more reviews (${reviews.length} of ${total.toLocaleString()})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
