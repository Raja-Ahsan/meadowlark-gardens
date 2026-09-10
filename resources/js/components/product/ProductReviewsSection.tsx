import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Camera, ChevronDown } from 'lucide-react'
import type { CustomerReview, ReviewInsights } from '@/types'
import type { PaginatedMeta } from '@/types/admin'
import { formatReviewDate, RatingBar, StarRating } from '@/components/product/reviewUtils'
import { mediaUrl } from '@/lib/media'

interface Props {
  reviews: CustomerReview[]
  insights: ReviewInsights | null
  meta: PaginatedMeta | null
  categoryFilter: string
  onCategoryChange: (category: string) => void
  onLoadMore?: () => void
  loadingMore?: boolean
  loading?: boolean
  productAverageRating?: number
  productReviewCount?: number
  sellerName?: string
}

export default function ProductReviewsSection({
  reviews,
  insights,
  meta,
  categoryFilter,
  onCategoryChange,
  onLoadMore,
  loadingMore,
  loading = false,
  productAverageRating,
  productReviewCount,
  sellerName = 'John Moser',
}: Props) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4)
  const avg = insights?.averageRating ?? productAverageRating ?? 0
  const total = insights?.totalReviews ?? productReviewCount ?? meta?.total ?? reviews.length

  return (
    <section className="mt-16 border-t border-forest-100 pt-12">
      <h2 className="font-display font-700 text-2xl text-forest-900 mb-8">Reviews for this item</h2>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Summary sidebar */}
        <aside className="space-y-6">
          {insights && insights.summaryTags.length > 0 && (
            <div>
              <p className="text-xs font-sans font-600 text-sage-500 uppercase tracking-wide mb-2">
                What buyers say, summarised by AI
              </p>
              <div className="flex flex-wrap gap-2">
                {insights.summaryTags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-cream-100 text-forest-800 rounded-full text-xs font-sans font-600 border border-cream-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-cream-50 rounded-2xl border border-forest-100 p-6 text-center">
            <p className="text-4xl font-display font-700 text-forest-900">{avg.toFixed(1)}</p>
            <p className="text-sm text-sage-600 mt-1">Item average</p>
            <div className="flex justify-center mt-2">
              <StarRating rating={avg} size="md" />
            </div>
            <p className="text-sm text-sage-500 mt-2">({total} reviews)</p>
          </div>

          {insights && (
            <div className="space-y-3">
              <RatingBar label="Item quality" value={insights.breakdown.quality} />
              <RatingBar label="Delivery" value={insights.breakdown.delivery} />
              <RatingBar label="Customer service" value={insights.breakdown.service} />
            </div>
          )}

          {insights && insights.recommendPercent > 0 && (
            <div className="bg-forest-50 rounded-xl border border-forest-100 p-4 text-center">
              <p className="text-2xl font-display font-700 text-forest-800">{insights.recommendPercent}%</p>
              <p className="text-sm text-forest-700 font-sans font-600">Buyers recommend</p>
            </div>
          )}

          {insights && insights.categoryCounts.length > 0 && (
            <div>
              <p className="text-sm font-sans font-700 text-forest-900 mb-3">Suggested</p>
              <p className="text-xs text-sage-500 mb-2">Filter by category</p>
              <div className="space-y-1">
                <button
                  onClick={() => onCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !categoryFilter ? 'bg-forest-100 text-forest-800 font-600' : 'text-forest-700 hover:bg-forest-50'
                  }`}
                >
                  All reviews ({total})
                </button>
                {insights.categoryCounts.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => onCategoryChange(cat.key)}
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

        {/* Review list */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-cream-50 rounded-xl border border-forest-100 animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sage-500 py-8">No reviews yet for this filter. Be the first to share your experience!</p>
          ) : (
            visibleReviews.map(review => (
              <article key={review.id} className="border-b border-forest-100 pb-6 last:border-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-sans font-600 text-forest-800">
                        {review.rating} out of 5 stars
                      </span>
                      <span className="text-xs text-sage-500">This item</span>
                    </div>
                    <p className="text-sm font-sans font-600 text-forest-900 mt-1">
                      {review.userName}
                      <span className="font-normal text-sage-500 ml-2">{formatReviewDate(review.createdAt)}</span>
                    </p>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full shrink-0">Verified purchase</span>
                  )}
                </div>

                {review.title && <p className="font-600 text-forest-800 mb-1">{review.title}</p>}
                <p className="text-forest-700 text-sm leading-relaxed whitespace-pre-line">{review.body}</p>

                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {review.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={mediaUrl(img)} alt="" className="w-20 h-20 rounded-lg object-cover border border-forest-100" />
                        <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/50 text-white rounded px-1 py-0.5 text-center truncate">
                          {review.userName} added a photo
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {review.sellerResponse && (
                  <div className="mt-4 ml-4 pl-4 border-l-2 border-forest-200 bg-cream-50 rounded-r-xl p-4">
                    <p className="text-xs font-sans font-600 text-forest-700 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Response from {sellerName}
                    </p>
                    <p className="text-sm text-forest-700">{review.sellerResponse}</p>
                  </div>
                )}
              </article>
            ))
          )}

          {reviews.length > 4 && !showAllReviews && (
            <button
              onClick={() => setShowAllReviews(true)}
              className="text-sm font-sans font-600 text-forest-700 hover:text-forest-900 underline"
            >
              View all reviews for this item
            </button>
          )}

          {meta && meta.currentPage < meta.lastPage && onLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-5 py-2.5 border border-forest-200 rounded-xl text-sm font-sans font-600 text-forest-700 hover:bg-forest-50 disabled:opacity-50"
            >
              <ChevronDown className="w-4 h-4" />
              {loadingMore ? 'Loading...' : 'Load more reviews'}
            </button>
          )}
        </div>
      </div>

      {insights && insights.reviewPhotos.length > 0 && (
        <div className="mt-12 pt-8 border-t border-forest-100">
          <h3 className="font-sans font-700 text-lg text-forest-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-sage-500" />
            Photos from reviews
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {insights.reviewPhotos.map((photo, i) => (
              <div key={`${photo.reviewId}-${i}`} className="shrink-0 w-28">
                <img src={mediaUrl(photo.url)} alt="" className="w-28 h-28 rounded-xl object-cover border border-forest-100" />
                <p className="text-[10px] text-sage-500 mt-1 text-center truncate">{photo.userName} added a photo</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-sage-400 mt-6 flex items-center gap-1">
        Why these reviews? Reviews are from verified buyers and moderated for quality.
      </p>
    </section>
  )
}
