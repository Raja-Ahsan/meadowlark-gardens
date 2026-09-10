import { Link } from 'react-router-dom'
import type { CustomerReview } from '@/types'
import { formatReviewDate, StarRating } from '@/components/product/reviewUtils'
import { mediaUrl } from '@/lib/media'

interface Props {
  review: CustomerReview
}

export default function ShopReviewCard({ review }: Props) {
  return (
    <article className="bg-white rounded-xl border border-forest-100 p-5">
      <p className="text-sm text-forest-800 leading-relaxed mb-2">{review.body}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans font-600 text-sm text-forest-900">{review.userName}</span>
        <span className="text-xs text-sage-500">{formatReviewDate(review.createdAt)}</span>
        <StarRating rating={review.rating} />
      </div>
      {review.purchasedProduct && (
        <p className="text-xs text-sage-500 mt-2">
          Purchased:{' '}
          {review.purchasedProductSlug ? (
            <Link to={`/product/${review.purchasedProductSlug}`} className="text-forest-600 hover:underline">
              {review.purchasedProduct}
            </Link>
          ) : review.purchasedProduct}
        </p>
      )}
      {review.images && review.images[0] && (
        <img src={mediaUrl(review.images[0])} alt="" className="w-16 h-16 rounded-lg object-cover mt-3 border border-forest-100" />
      )}
    </article>
  )
}
