import { Link } from 'react-router-dom'
import { Star, MessageCircle, Truck, Sparkles, Users } from 'lucide-react'
import type { CustomerReview, ShopProfile } from '@/types'
import ShopReviewCard from '@/components/product/ShopReviewCard'
import { mediaUrl } from '@/lib/media'

const badgeIcons: Record<string, typeof Truck> = {
  dispatch: Truck,
  replies: MessageCircle,
  rave: Sparkles,
}

interface Props {
  shop: ShopProfile | null
  shopReviews: CustomerReview[]
}

export default function ShopSidebar({ shop, shopReviews }: Props) {
  if (!shop) return null

  return (
    <section className="mt-16 border-t border-forest-100 pt-12">
      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        {/* Shop card */}
        <div className="bg-white rounded-2xl border border-forest-100 p-6 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-3 mb-4">
            {shop.avatar ? (
              <img src={mediaUrl(shop.avatar)} alt={shop.displayName} className="w-14 h-14 rounded-full object-cover border border-forest-100" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-display font-700 text-lg">
                {shop.displayName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-sans font-700 text-forest-900">{shop.name}</p>
              <p className="text-sm text-sage-600">{shop.owner}</p>
            </div>
          </div>

          <p className="text-sm text-sage-600 mb-4">{shop.displayName} · {shop.location}</p>

          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-600 text-forest-900">{shop.rating.toFixed(1)}</span>
            <span className="text-sm text-sage-500">({shop.reviewCount.toLocaleString()})</span>
            <span className="text-sage-300">·</span>
            <span className="text-sm text-sage-600">{shop.salesCount.toLocaleString()} sales</span>
          </div>

          <p className="text-sm text-sage-600 mb-4">{shop.yearsActive} years on Meadowlark Gardens</p>

          <div className="flex items-center gap-2 text-sm text-sage-600 mb-6">
            <Users className="w-4 h-4" />
            {shop.members.join(' · ')} · {shop.members.length} shop members
          </div>

          <div className="flex gap-2 mb-6">
            <Link to="/contact" className="flex-1 py-2.5 text-center bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800">
              Message seller
            </Link>
            <Link to="/shop" className="flex-1 py-2.5 text-center border border-forest-200 text-forest-700 rounded-xl text-sm font-sans font-600 hover:bg-forest-50">
              Visit shop
            </Link>
          </div>

          <p className="text-xs text-sage-500 mb-4">{shop.responseTime}</p>

          <div className="space-y-3">
            {shop.badges.map(badge => {
              const Icon = badgeIcons[badge.key] ?? Sparkles
              return (
                <div key={badge.key} className="flex gap-3">
                  <Icon className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-sans font-600 text-forest-800">{badge.label}</p>
                    <p className="text-xs text-sage-500">{badge.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shop reviews */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-xl text-forest-900">
              All reviews from this shop ({shop.reviewCount.toLocaleString()})
            </h2>
            <Link to="/shop/reviews" className="text-sm font-sans font-600 text-forest-700 hover:underline">Show all</Link>
          </div>

          <div className="space-y-5">
            {shopReviews.map(review => (
              <ShopReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
