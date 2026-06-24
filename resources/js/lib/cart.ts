import type { Product, ProductVariation } from '@/types'

export interface RetailCartItem {
  product: Product
  quantity: number
  variation?: ProductVariation
}

export function cartLineKey(productId: string, variationId?: string): string {
  return `${productId}:${variationId ?? 'base'}`
}

export function getCartLinePrice(item: RetailCartItem): number {
  if (item.variation) {
    return item.variation.salePrice ?? item.variation.price
  }
  return item.product.salePrice ?? item.product.price
}

export function getCartLineImage(item: RetailCartItem): string {
  return item.variation?.image || item.product.image
}

export function getWholesaleLinePrice(item: { product: Product; variation?: ProductVariation }): number {
  if (item.variation?.wholesalePrice != null) {
    return item.variation.wholesalePrice
  }
  if (item.variation) {
    return item.product.wholesalePrice
  }
  return item.product.saleWholesalePrice ?? item.product.wholesalePrice
}

export function minWholesaleQty(product: Product): number {
  return Math.max(1, product.minWholesaleQty ?? 1)
}

export function formatVariationLabel(variation?: ProductVariation): string | null {
  if (!variation?.attributeValues || !Object.keys(variation.attributeValues).length) {
    return variation?.sku ?? null
  }
  return Object.values(variation.attributeValues).join(' / ')
}
