import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, ChevronLeft, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import ProductImageGallery from '@/components/product/ProductImageGallery'
import ExpandableDescription from '@/components/product/ExpandableDescription'
import { StarRating } from '@/components/product/reviewUtils'
import WholesalePortalHeader from '@/components/wholesale/WholesalePortalHeader'
import { mediaUrl } from '@/lib/media'
import {
  formatVariationLabel,
  getWholesaleLinePrice,
  minWholesaleQty,
} from '@/lib/cart'
import type { Product, ProductVariation } from '@/types'

function wholesaleUnitPrice(product: Product, variation?: ProductVariation | null): number {
  return getWholesaleLinePrice({ product, variation: variation ?? undefined })
}

export default function WholesaleProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState('')

  useEffect(() => {
    if (!slug) return
    api.getProduct(slug).then(r => {
      setProduct(r.product)
      setRelated(r.related ?? [])
      const min = minWholesaleQty(r.product)
      setQty(min)
      if (r.product.variations?.length) {
        setSelectedVariation(r.product.variations[0])
      }
      const imgs = r.product.images?.length
        ? r.product.images
        : [{ path: r.product.image, isPrimary: true, id: '1' }]
      setSelectedImage(imgs[0].path)
    }).catch(() => {})
  }, [slug])

  const handleLogout = async () => {
    await logout()
    navigate('/wholesale/login')
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.variations?.length && !selectedVariation) return
    const min = minWholesaleQty(product)
    if (qty < min) {
      alert(`Minimum order for this product is ${min} units.`)
      return
    }
    addItem(product, qty, selectedVariation ?? undefined)
    setAddedMsg('Added to cart!')
    setTimeout(() => setAddedMsg(''), 2500)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
      </div>
    )
  }

  const unitPrice = wholesaleUnitPrice(product, selectedVariation)
  const min = minWholesaleQty(product)
  const images = product.images?.length
    ? product.images
    : [{ path: product.image, isPrimary: true, id: '1' }]
  const mainImagePath = selectedVariation?.image || selectedImage || product.image
  const avgRating = product.averageRating ?? 0
  const reviewCount = product.reviewCount ?? 0

  return (
    <div className="min-h-screen bg-cream-50">
      <WholesalePortalHeader onLogout={handleLogout} />

      <div className="bg-forest-50 border-b border-forest-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/wholesale/portal"
            className="inline-flex items-center gap-1 text-sm text-forest-700 hover:text-forest-900 font-sans font-600"
          >
            <ChevronLeft className="w-4 h-4" /> Back to wholesale catalog
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
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

          <div className="bg-white rounded-2xl border border-forest-100 p-6 lg:p-8 h-fit shadow-sm">
            <p className="text-xs text-sage-500 uppercase tracking-wide mb-1">{product.category}</p>
            <h1 className="font-display font-700 text-3xl text-forest-900 mb-3 leading-tight">{product.name}</h1>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} size="md" />
                <span className="text-sm text-sage-600">{avgRating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-2">
              <p className="text-3xl font-sans font-800 text-forest-700">${unitPrice.toFixed(2)}</p>
              <span className="text-lg text-sage-400 line-through">${product.price.toFixed(2)}</span>
              <span className="text-xs font-sans font-600 text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
                wholesale / unit
              </span>
            </div>
            <p className="text-sm text-sage-600 mb-4 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Minimum order: <span className="font-600 text-forest-800">{min} units</span>
            </p>

            {product.shortDescription && (
              <p className="text-sage-600 mb-4 leading-relaxed">{product.shortDescription}</p>
            )}

            <ExpandableDescription text={product.description} />

            {product.variations && product.variations.length > 0 && (
              <div className="mb-6 mt-6">
                <p className="text-sm font-600 text-forest-800 mb-2">Select option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map(v => {
                    const vPrice = wholesaleUnitPrice(product, v)
                    const label = formatVariationLabel(v) || v.sku
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariation(v)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors text-left ${
                          selectedVariation?.id === v.id
                            ? 'border-forest-600 bg-forest-50 text-forest-800'
                            : 'border-forest-200 hover:border-forest-400'
                        }`}
                      >
                        <span className="block font-600">{label}</span>
                        <span className="block text-xs text-sage-500 mt-0.5">${vPrice.toFixed(2)} / unit</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <div className="flex items-center border border-forest-200 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(min, q - 1))}
                  className="px-3 py-2 text-forest-700"
                >−</button>
                <span className="px-4 font-600 min-w-[3rem] text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 py-2 text-forest-700"
                >+</button>
              </div>
              {product.inStock ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-forest-600 text-white rounded-xl font-600 hover:bg-forest-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart — ${(unitPrice * qty).toFixed(2)}
                </button>
              ) : (
                <span className="text-terra-600 font-600 py-3">Out of Stock</span>
              )}
            </div>

            {addedMsg && (
              <p className="text-sm text-forest-700 bg-forest-50 border border-forest-200 rounded-xl px-4 py-2 mb-4">
                {addedMsg}{' '}
                <Link to="/wholesale/portal?tab=cart" className="font-600 underline">View cart</Link>
              </p>
            )}

            <p className="text-xs text-sage-500">
              SKU: {selectedVariation?.sku || product.sku || '—'}
            </p>
            {product.badge && (
              <span className="inline-block mt-3 px-3 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-600">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-t border-forest-100 pt-12">
            <h2 className="font-display font-700 text-xl text-forest-900 mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link
                  key={p.id}
                  to={`/wholesale/portal/product/${p.slug || p.id}`}
                  className="bg-white rounded-2xl border border-forest-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square overflow-hidden bg-cream-100">
                    <img
                      src={mediaUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-sans font-600 text-forest-800 line-clamp-2">{p.name}</h3>
                    <p className="font-sans font-700 text-forest-700 mt-2">${p.wholesalePrice.toFixed(2)}</p>
                    <p className="text-xs text-sage-500">Min. {minWholesaleQty(p)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
