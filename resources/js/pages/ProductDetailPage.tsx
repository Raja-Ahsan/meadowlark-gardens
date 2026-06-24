import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, ChevronLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { useRetailCart } from '@/context/RetailCartContext'
import { useAuth } from '@/context/AuthContext'
import ProductReviewsSection from '@/components/product/ProductReviewsSection'
import ProductImageGallery from '@/components/product/ProductImageGallery'
import ExpandableDescription from '@/components/product/ExpandableDescription'
import ShopSidebar from '@/components/product/ShopSidebar'
import RelatedProductsRow from '@/components/product/RelatedProductsRow'
import { StarRating } from '@/components/product/reviewUtils'
import type { Product, ProductVariation, CustomerReview, ReviewInsights, ShopProfile } from '@/types'
import type { PaginatedMeta } from '@/types/admin'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [moreFromShop, setMoreFromShop] = useState<Product[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [insights, setInsights] = useState<ReviewInsights | null>(null)
  const [reviewMeta, setReviewMeta] = useState<PaginatedMeta | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)
  const [shop, setShop] = useState<ShopProfile | null>(null)
  const [shopReviews, setShopReviews] = useState<CustomerReview[]>([])
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [reviewMsg, setReviewMsg] = useState('')
  const { addItem } = useRetailCart()
  const { isCustomer, isAuthenticated } = useAuth()

  const loadReviews = (page = 1, category = categoryFilter, append = false) => {
    if (!slug) return
    const setLoading = page > 1
    if (setLoading) setLoadingMoreReviews(true)

    api.getProductReviews(slug, page, category || undefined)
      .then(r => {
        setReviews(prev => append ? [...prev, ...r.reviews] : r.reviews)
        setInsights(r.insights)
        setReviewMeta(r.meta)
        setReviewPage(page)
      })
      .catch(() => {})
      .finally(() => setLoadingMoreReviews(false))
  }

  useEffect(() => {
    if (!slug) return
    api.getProduct(slug).then(r => {
      setProduct(r.product)
      setRelated(r.related ?? [])
      setMoreFromShop(r.moreFromShop ?? [])
      if (r.product.variations?.length) setSelectedVariation(r.product.variations[0])
      const imgs = r.product.images?.length ? r.product.images : [{ path: r.product.image, isPrimary: true, id: '1' }]
      setSelectedImage(imgs[0].path)
    }).catch(() => {})
    api.getShopProfile().then(r => setShop(r.shop)).catch(() => {})
    api.getShopReviews(1, 6).then(r => setShopReviews(r.reviews)).catch(() => {})
  }, [slug])

  useEffect(() => {
    if (!slug) return
    loadReviews(1, categoryFilter)
  }, [categoryFilter, slug])

  useEffect(() => {
    if (isAuthenticated && product) {
      api.checkWishlist(product.id).then(r => setInWishlist(r.inWishlist)).catch(() => {})
    }
  }, [isAuthenticated, product])

  const toggleWishlist = async () => {
    if (!product || !isAuthenticated) return
    if (inWishlist) {
      await api.removeFromWishlist(product.id)
      setInWishlist(false)
    } else {
      await api.addToWishlist(product.id)
      setInWishlist(true)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.variations?.length && !selectedVariation) return
    addItem(product, qty, selectedVariation ?? undefined)
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    try {
      await api.submitReview({ productId: product.id, ...reviewForm })
      setReviewMsg('Review submitted for approval!')
      setReviewForm({ rating: 5, title: '', body: '' })
    } catch (err) {
      setReviewMsg(err instanceof Error ? err.message : 'Failed')
    }
  }

  if (!product) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" /></div>
  }

  const price = selectedVariation
    ? (selectedVariation.salePrice ?? selectedVariation.price)
    : (product.salePrice ?? product.price)

  const images = product.images?.length
    ? product.images
    : [{ path: product.image, isPrimary: true, id: '1' }]

  const mainImagePath = selectedVariation?.image || selectedImage || product.image
  const avgRating = insights?.averageRating ?? product.averageRating ?? 0
  const reviewCount = insights?.totalReviews ?? product.reviewCount ?? reviews.length

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-sage-600 hover:text-forest-700 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>

        {/* Product hero */}
        <div className="grid lg:grid-cols-2 gap-10 mb-4">
          <ProductImageGallery
            images={images}
            selectedPath={selectedImage}
            onSelect={path => {
              setSelectedImage(path)
              if (selectedVariation?.image) setSelectedVariation(null)
            }}
            displayPath={mainImagePath}
            alt={product.name}
          />

          <div className="bg-white rounded-2xl border border-forest-100 p-6 lg:p-8 h-fit">
            <p className="text-xs text-sage-500 uppercase tracking-wide mb-1">{product.category}</p>
            <h1 className="font-display font-700 text-3xl text-forest-900 mb-3 leading-tight">{product.name}</h1>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} size="md" />
                <span className="text-sm text-sage-600">{avgRating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-3xl font-sans font-800 text-forest-700">${price.toFixed(2)}</p>
              {product.salePrice && product.salePrice < product.price && (
                <p className="text-lg text-sage-400 line-through">${product.price.toFixed(2)}</p>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-sage-600 mb-4 leading-relaxed">{product.shortDescription}</p>
            )}

            <ExpandableDescription text={product.description} />

            {product.variations && product.variations.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-600 text-forest-800 mb-2">Options</p>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariation(v)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        selectedVariation?.id === v.id
                          ? 'border-forest-600 bg-forest-50 text-forest-800'
                          : 'border-forest-200 hover:border-forest-400'
                      }`}
                    >
                      {Object.values(v.attributeValues || {}).join(' / ') || v.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-forest-200 rounded-xl">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-forest-700">−</button>
                <span className="px-4 font-600">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-forest-700">+</button>
              </div>
              {product.inStock ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-forest-600 text-white rounded-xl font-600 hover:bg-forest-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              ) : (
                <span className="text-terra-600 font-600">Out of Stock</span>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className={`p-3 rounded-xl border ${inWishlist ? 'border-terra-300 bg-terra-50 text-terra-600' : 'border-forest-200 text-sage-500'}`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {product.sku && (
              <p className="text-xs text-sage-500">SKU: {selectedVariation?.sku || product.sku}</p>
            )}
            {product.badge && (
              <span className="inline-block mt-3 px-3 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-600">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Etsy-style reviews */}
        <ProductReviewsSection
          reviews={reviews}
          insights={insights}
          meta={reviewMeta}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onLoadMore={() => loadReviews(reviewPage + 1, categoryFilter, true)}
          loadingMore={loadingMoreReviews}
          sellerName={shop?.owner}
        />

        {/* Write review */}
        {isCustomer && (
          <form onSubmit={submitReview} className="mt-8 bg-white rounded-2xl border border-forest-100 p-6 max-w-lg">
            <h3 className="font-600 text-forest-900 mb-4">Write a Review</h3>
            <div className="mb-3">
              <label className="text-xs font-600 text-sage-600">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={e => setReviewForm(f => ({ ...f, rating: +e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-forest-200 text-sm"
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <input
              placeholder="Title (optional)"
              value={reviewForm.title}
              onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
              className="w-full mb-3 px-3 py-2 rounded-xl border border-forest-200 text-sm"
            />
            <textarea
              required
              rows={3}
              placeholder="Your review..."
              value={reviewForm.body}
              onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
              className="w-full mb-3 px-3 py-2 rounded-xl border border-forest-200 text-sm"
            />
            <button type="submit" className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">
              Submit Review
            </button>
            {reviewMsg && <p className="text-sm text-forest-600 mt-2">{reviewMsg}</p>}
          </form>
        )}

        {/* Shop profile + shop reviews */}
        <ShopSidebar shop={shop} shopReviews={shopReviews} />

        {/* More from shop */}
        <RelatedProductsRow title="More from this shop" products={moreFromShop} />

        {/* You may also like */}
        <RelatedProductsRow title="You may also like" products={related} subtitle="Including similar plants from our nursery" />
      </div>
    </div>
  )
}
