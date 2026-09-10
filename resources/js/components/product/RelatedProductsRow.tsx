import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { mediaUrl } from '@/lib/media'
import { useRetailCart } from '@/context/RetailCartContext'

interface Props {
  title: string
  products: Product[]
  subtitle?: string
}

export default function RelatedProductsRow({ title, products, subtitle }: Props) {
  const { addItem } = useRetailCart()

  if (!products.length) return null

  return (
    <section className="mt-16 border-t border-forest-100 pt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display font-700 text-xl text-forest-900">{title}</h2>
          {subtitle && <p className="text-sm text-sage-500 mt-1">{subtitle}</p>}
        </div>
        {title.includes('shop') && (
          <Link to="/shop" className="text-sm font-sans font-600 text-forest-700 hover:underline">Visit shop</Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => {
          const price = product.salePrice ?? product.price
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-forest-100 overflow-hidden group">
              <Link to={`/product/${product.slug || product.id}`} className="block aspect-square overflow-hidden bg-cream-100">
                <img
                  src={mediaUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.slug || product.id}`}>
                  <h3 className="text-sm font-sans font-600 text-forest-800 line-clamp-2 min-h-[2.5rem] hover:text-forest-600">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans font-700 text-forest-700">${price.toFixed(2)}</p>
                  {product.inStock && (
                    <button
                      onClick={() => addItem(product)}
                      className="p-2 rounded-lg bg-forest-600 text-white hover:bg-forest-700 transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
