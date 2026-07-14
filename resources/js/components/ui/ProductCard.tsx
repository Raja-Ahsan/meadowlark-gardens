import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ShoppingCart, Tag } from 'lucide-react'
import { Product } from '@/types'
import { mediaUrl } from '@/lib/media'
import { truncateWords } from '@/lib/text'

interface Props {
  product: Product
  isWholesale?: boolean
  onAddToCart?: (product: Product, qty: number) => void
  onViewDetails?: (product: Product) => void
}

const NAME_WORD_LIMIT = 6
const DESCRIPTION_WORD_LIMIT = 14

const badgeColors: Record<string, string> = {
  Native: 'bg-forest-100 text-forest-700 border border-forest-200',
  Bestseller: 'bg-cream-100 text-cream-700 border border-cream-300',
  Pollinator: 'bg-purple-100 text-purple-700 border border-purple-200',
}

export default function ProductCard({ product, isWholesale = false, onAddToCart, onViewDetails }: Props) {
  const price = isWholesale ? product.wholesalePrice : product.price
  const displayName = truncateWords(product.name, NAME_WORD_LIMIT)
  const displayDescription = truncateWords(
    product.shortDescription || product.description,
    DESCRIPTION_WORD_LIMIT,
  )

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(36,69,38,0.12)' }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl overflow-hidden border border-forest-100 shadow-sm flex flex-col group"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={mediaUrl(product.image)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-sans font-600 px-2.5 py-1 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-100 text-gray-700'}`}>
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white text-gray-600 font-sans font-600 text-sm px-3 py-1 rounded-full border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1 min-h-[7.5rem]">
          <p className="text-xs text-sage-500 font-sans font-500 uppercase tracking-wide mb-1 truncate">{product.category}</p>
          <Link to={`/product/${product.slug || product.id}`} title={product.name}>
            <h3 className="font-display font-700 text-forest-800 text-lg leading-snug mb-2 line-clamp-2 min-h-[3.25rem] hover:text-forest-600 transition-colors">
              {displayName}
            </h3>
          </Link>
          <p className="text-sage-600 text-sm font-body leading-relaxed line-clamp-2 min-h-[2.75rem]" title={product.shortDescription || product.description}>
            {displayDescription}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-sans font-800 text-xl text-forest-700">${price.toFixed(2)}</p>
            {isWholesale && (
              <p className="text-xs text-sage-500 font-sans flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Min. {product.minWholesaleQty} units
              </p>
            )}
          </div>
          {product.inStock && (
            <button
              onClick={() => onAddToCart ? onAddToCart(product, product.minWholesaleQty) : onViewDetails?.(product)}
              className="flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-sm font-sans font-600 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-ring"
            >
              <ShoppingCart className="w-4 h-4" />
              {isWholesale ? 'Add' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}