import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Star, ImagePlus } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Modal from '@/components/admin/Modal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { api, ProductPayload, ProductImagePayload, VariationPayload } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { Product } from '@/types'
import type { Attribute, Brand, Category } from '@/types/admin'

const emptyForm: ProductPayload = {
  name: '', type: 'simple', price: 0, wholesalePrice: 0, image: '', description: '',
  inStock: true, minWholesaleQty: 5, stockQuantity: 0, isActive: true, isFeatured: false,
  images: [], variations: [],
}

const emptyVariation = (): VariationPayload => ({
  sku: '', price: 0, wholesalePrice: 0, stockQuantity: 0, attributeValues: {}, isActive: true,
})

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

function productToForm(p: Product): ProductPayload {
  const images: ProductImagePayload[] = (p.images?.length
    ? p.images.map(img => ({ path: mediaUrl(img.path), alt: img.alt, isPrimary: img.isPrimary }))
    : p.image ? [{ path: mediaUrl(p.image), isPrimary: true }] : [])

  const primary = images.find(i => i.isPrimary) ?? images[0]

  return {
    name: p.name,
    type: (p.type as 'simple' | 'variable') || 'simple',
    category: p.category,
    categoryId: p.categoryId,
    brandId: p.brandId,
    price: p.price,
    salePrice: p.salePrice,
    wholesalePrice: p.wholesalePrice,
    saleWholesalePrice: p.saleWholesalePrice,
    image: primary?.path || p.image,
    description: p.description,
    shortDescription: p.shortDescription,
    badge: p.badge,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    minWholesaleQty: p.minWholesaleQty,
    isFeatured: p.isFeatured,
    isActive: p.isActive ?? true,
    sku: p.sku,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    images,
    variations: p.variations?.map(v => ({
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      wholesalePrice: v.wholesalePrice,
      stockQuantity: v.stockQuantity,
      image: v.image,
      attributeValues: v.attributeValues ?? {},
      isActive: v.isActive,
    })) ?? [],
  }
}

export default function AdminProductsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductPayload>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [galleryUrl, setGalleryUrl] = useState('')

  const list = usePaginatedList<Product>({
    fetcher: api.getAdminProducts,
    defaultSort: 'name',
  })

  useEffect(() => {
    Promise.all([api.getAllCategories(), api.getAllBrands(), api.getAllAttributes()])
      .then(([c, b, a]) => {
        setCategories(c.categories)
        setBrands(b.brands)
        setAttributes(a.attributes)
      })
      .catch(() => {})
  }, [])

  const isVariable = form.type === 'variable'
  const gallery = form.images ?? []
  const variations = form.variations ?? []

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setGalleryUrl('')
    setModalOpen(true)
  }

  const openEdit = async (p: Product) => {
    setEditing(p)
    setGalleryUrl('')
    setForm(productToForm(p))
    setModalOpen(true)
    try {
      const { product } = await api.getAdminProduct(p.id)
      setForm(productToForm(product))
    } catch {
      // keep list data if detail fetch fails
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const res = await api.uploadFile(file, 'products')
    return mediaUrl(res.url)
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm(f => {
        const imgs = f.images ?? []
        const hasPrimary = imgs.some(i => i.isPrimary)
        const next = hasPrimary
          ? [...imgs, { path: url, isPrimary: false }]
          : [{ path: url, isPrimary: true }, ...imgs]
        return { ...f, image: hasPrimary ? f.image : url, images: next }
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage))
      setForm(f => {
        const imgs = [...(f.images ?? [])]
        urls.forEach(url => imgs.push({ path: url, isPrimary: imgs.length === 0 }))
        const primary = imgs.find(i => i.isPrimary) ?? imgs[0]
        return {
          ...f,
          images: imgs,
          image: primary?.path || f.image,
        }
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const addGalleryUrl = () => {
    const url = galleryUrl.trim()
    if (!url) return
    setForm(f => {
      const imgs = [...(f.images ?? [])]
      imgs.push({ path: url, isPrimary: imgs.length === 0 })
      const primary = imgs.find(i => i.isPrimary) ?? imgs[0]
      return { ...f, images: imgs, image: primary?.path || url }
    })
    setGalleryUrl('')
  }

  const removeGalleryImage = (index: number) => {
    setForm(f => {
      const imgs = [...(f.images ?? [])]
      const removed = imgs.splice(index, 1)[0]
      if (removed?.isPrimary && imgs.length) imgs[0].isPrimary = true
      const primary = imgs.find(i => i.isPrimary) ?? imgs[0]
      return { ...f, images: imgs, image: primary?.path || '' }
    })
  }

  const setPrimaryImage = (index: number) => {
    setForm(f => {
      const imgs = (f.images ?? []).map((img, i) => ({ ...img, isPrimary: i === index }))
      return { ...f, images: imgs, image: imgs[index]?.path || f.image }
    })
  }

  const addVariation = () => {
    setForm(f => ({
      ...f,
      type: 'variable',
      variations: [...(f.variations ?? []), emptyVariation()],
    }))
  }

  const updateVariation = (index: number, patch: Partial<VariationPayload>) => {
    setForm(f => {
      const vars = [...(f.variations ?? [])]
      vars[index] = { ...vars[index], ...patch }
      return { ...f, variations: vars }
    })
  }

  const updateVariationAttr = (index: number, attrName: string, value: string) => {
    setForm(f => {
      const vars = [...(f.variations ?? [])]
      vars[index] = {
        ...vars[index],
        attributeValues: { ...(vars[index].attributeValues ?? {}), [attrName]: value },
      }
      return { ...f, variations: vars }
    })
  }

  const removeVariation = (index: number) => {
    setForm(f => ({
      ...f,
      variations: (f.variations ?? []).filter((_, i) => i !== index),
    }))
  }

  const handleVariationImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      updateVariation(index, { image: url })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      alert('Name and description are required.')
      return
    }
    if (isVariable && variations.length === 0) {
      alert('Variable products need at least one variation.')
      return
    }

    const images = gallery.length
      ? gallery
      : form.image ? [{ path: form.image, isPrimary: true }] : []

    if (!images.length) {
      alert('Add at least one product image.')
      return
    }

    const primary = images.find(i => i.isPrimary) ?? images[0]
    const minVarPrice = isVariable && variations.length
      ? Math.min(...variations.map(v => v.price))
      : form.price

    const payload: ProductPayload = {
      ...form,
      type: isVariable ? 'variable' : 'simple',
      price: minVarPrice,
      image: primary.path,
      images,
      variations: isVariable ? variations : [],
    }

    setSaving(true)
    try {
      if (editing) await api.updateProduct(editing.id, payload)
      else await api.createProduct(payload)
      setModalOpen(false)
      list.reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await api.deleteProduct(id)
    list.reload()
  }

  const columns: Column<Product>[] = [
    {
      key: 'image', label: '', className: 'w-14',
      render: p => <img src={mediaUrl(p.image)} alt="" className="w-10 h-10 rounded-lg object-cover bg-forest-50" />,
    },
    { key: 'name', label: 'Product', sortable: true, render: p => (
      <div>
        <p className="font-600 text-forest-900">{p.name}</p>
        <p className="text-xs text-sage-500">{p.sku || p.category}</p>
      </div>
    )},
    { key: 'type', label: 'Type', render: p => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${
        p.type === 'variable' ? 'bg-violet-100 text-violet-700' : 'bg-sage-100 text-sage-700'
      }`}>{p.type === 'variable' ? 'Variable' : 'Simple'}</span>
    )},
    { key: 'price', label: 'Price', sortable: true, render: p => (
      p.type === 'variable' && p.variations?.length
        ? <span>From ${Math.min(...p.variations.map(v => v.price)).toFixed(2)}</span>
        : `$${p.price.toFixed(2)}`
    )},
    { key: 'wholesalePrice', label: 'Wholesale', render: p => `$${p.wholesalePrice.toFixed(2)}` },
    { key: 'stockQuantity', label: 'Stock', sortable: true, render: p => {
      const qty = p.stockQuantity ?? 0
      return <span className={qty <= 5 ? 'text-amber-600 font-600' : ''}>{qty}</span>
    }},
    { key: 'inStock', label: 'Status', render: p => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${
        p.inStock ? 'bg-forest-100 text-forest-700' : 'bg-terra-100 text-terra-700'
      }`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
    )},
    { key: 'actions', label: '', render: p => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-600"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-terra-50 text-terra-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-700 text-2xl text-forest-900">Products</h1>
          <p className="text-sage-600 text-sm mt-1">Manage simple products with galleries or variable products with variations</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <FilterBar
        search={list.search}
        onSearchChange={list.setSearch}
        placeholder="Search products..."
        filters={[
          { key: 'type', label: 'Type', options: [
            { value: 'simple', label: 'Simple' }, { value: 'variable', label: 'Variable' },
          ]},
          { key: 'stock_status', label: 'Stock Status', options: [
            { value: 'in', label: 'In Stock' }, { value: 'low', label: 'Low Stock' }, { value: 'out', label: 'Out of Stock' },
          ]},
          { key: 'is_active', label: 'Active', options: [
            { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' },
          ]},
        ]}
        filterValues={list.filters}
        onFilterChange={list.setFilter}
        onClear={list.clearFilters}
      />

      <DataTable
        columns={columns}
        data={list.data}
        meta={list.meta}
        onPageChange={list.setPage}
        sortBy={list.sortBy}
        sortDir={list.sortDir}
        onSort={list.handleSort}
        loading={list.loading}
        rowKey={p => p.id}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="xl">
        <div className="space-y-6">
          {/* Product type */}
          <div>
            <label className={labelClass}>Product Type</label>
            <div className="flex gap-3">
              {(['simple', 'variable'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`px-4 py-2 rounded-xl text-sm font-600 border transition-colors ${
                    form.type === t
                      ? 'bg-forest-700 text-white border-forest-700'
                      : 'bg-white text-forest-700 border-forest-200 hover:bg-forest-50'
                  }`}
                >
                  {t === 'simple' ? 'Simple Product' : 'Variable Product'}
                </button>
              ))}
            </div>
            <p className="text-xs text-sage-500 mt-1">
              {isVariable
                ? 'Variable products use variations (e.g. Size, Color) with their own price and stock.'
                : 'Simple products have one price and stock level. You can add multiple gallery images.'}
            </p>
          </div>

          {/* General */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Product Name *</label>
              <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>SKU</label>
              <input className={inputClass} value={form.sku || ''} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <input className={inputClass} value={form.badge || ''} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="e.g. Native, Bestseller" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.categoryId || ''} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Brand</label>
              <select className={inputClass} value={form.brandId || ''} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}>
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {/* Gallery */}
          <div className="border border-forest-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-600 text-forest-900 text-sm">Product Gallery</h3>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-100 text-forest-700 rounded-lg text-xs font-600 cursor-pointer hover:bg-forest-200">
                <ImagePlus className="w-3.5 h-3.5" />
                {uploading ? 'Uploading...' : 'Upload Images'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-sage-500">Add multiple images. Click the star to set the main product image.</p>

            {gallery.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {gallery.map((img, i) => (
                  <div key={`${img.path}-${i}`} className="relative group">
                    <img src={mediaUrl(img.path)} alt="" className="w-full aspect-square rounded-lg object-cover border border-forest-100 bg-forest-50" />
                    <div className="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/40 rounded-lg transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => setPrimaryImage(i)} className="p-1.5 bg-white rounded-lg" title="Set as primary">
                        <Star className={`w-4 h-4 ${img.isPrimary ? 'fill-amber-400 text-amber-400' : 'text-forest-600'}`} />
                      </button>
                      <button type="button" onClick={() => removeGalleryImage(i)} className="p-1.5 bg-white rounded-lg" title="Remove">
                        <Trash2 className="w-4 h-4 text-terra-600" />
                      </button>
                    </div>
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-400 text-forest-900 text-[10px] font-700 rounded">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input className={inputClass} value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)} placeholder="Or paste image URL" />
              <button type="button" onClick={addGalleryUrl} className="px-4 py-2 bg-forest-100 text-forest-700 rounded-xl text-sm font-600 hover:bg-forest-200 shrink-0">Add URL</button>
            </div>

            <div>
              <label className={labelClass}>Main Image URL</label>
              <div className="flex gap-3 items-start">
                {form.image && <img src={mediaUrl(form.image)} alt="" className="w-16 h-16 rounded-lg object-cover border bg-forest-50" />}
                <div className="flex-1 space-y-2">
                  <input className={inputClass} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Primary image URL" />
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-100 text-forest-700 rounded-lg text-xs font-600 cursor-pointer hover:bg-forest-200">
                    {uploading ? 'Uploading...' : 'Upload Main Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing - simple only */}
          {!isVariable && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Retail Price *</label>
                <input type="number" step="0.01" className={inputClass} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Sale Price</label>
                <input type="number" step="0.01" className={inputClass} value={form.salePrice || ''} onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value || undefined }))} />
              </div>
              <div>
                <label className={labelClass}>Wholesale Price *</label>
                <input type="number" step="0.01" className={inputClass} value={form.wholesalePrice} onChange={e => setForm(f => ({ ...f, wholesalePrice: +e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Min Wholesale Qty</label>
                <input type="number" className={inputClass} value={form.minWholesaleQty} onChange={e => setForm(f => ({ ...f, minWholesaleQty: +e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Stock Quantity</label>
                <input type="number" className={inputClass} value={form.stockQuantity ?? 0} onChange={e => setForm(f => ({ ...f, stockQuantity: +e.target.value }))} />
              </div>
            </div>
          )}

          {/* Wholesale for variable parent */}
          {isVariable && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Base Wholesale Price *</label>
                <input type="number" step="0.01" className={inputClass} value={form.wholesalePrice} onChange={e => setForm(f => ({ ...f, wholesalePrice: +e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Min Wholesale Qty</label>
                <input type="number" className={inputClass} value={form.minWholesaleQty} onChange={e => setForm(f => ({ ...f, minWholesaleQty: +e.target.value }))} />
              </div>
            </div>
          )}

          {/* Variations */}
          {isVariable && (
            <div className="border border-violet-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-600 text-forest-900 text-sm">Variations</h3>
                  <p className="text-xs text-sage-500">Define options like Size or Color. Create attributes first under Admin → Attributes.</p>
                </div>
                <button type="button" onClick={addVariation} className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-xs font-600 hover:bg-violet-200">
                  <Plus className="w-3.5 h-3.5" /> Add Variation
                </button>
              </div>

              {attributes.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  No attributes found. Go to <strong>Attributes</strong> and create attributes (e.g. Size, Color) with values first.
                </p>
              )}

              {variations.length === 0 ? (
                <p className="text-sm text-sage-500 text-center py-4">No variations yet. Click &quot;Add Variation&quot; to start.</p>
              ) : (
                <div className="space-y-4">
                  {variations.map((v, i) => (
                    <div key={i} className="border border-forest-100 rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-600 text-forest-700">Variation {i + 1}</span>
                        <button type="button" onClick={() => removeVariation(i)} className="text-terra-600 hover:text-terra-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      {attributes.length > 0 && (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {attributes.map(attr => (
                            <div key={attr.id}>
                              <label className={labelClass}>{attr.name}</label>
                              <select
                                className={inputClass}
                                value={v.attributeValues?.[attr.name] || ''}
                                onChange={e => updateVariationAttr(i, attr.name, e.target.value)}
                              >
                                <option value="">Select {attr.name}</option>
                                {attr.values.map(val => (
                                  <option key={val.id} value={val.value}>{val.value}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className={labelClass}>SKU</label>
                          <input className={inputClass} value={v.sku || ''} onChange={e => updateVariation(i, { sku: e.target.value })} />
                        </div>
                        <div>
                          <label className={labelClass}>Price *</label>
                          <input type="number" step="0.01" className={inputClass} value={v.price} onChange={e => updateVariation(i, { price: +e.target.value })} />
                        </div>
                        <div>
                          <label className={labelClass}>Sale Price</label>
                          <input type="number" step="0.01" className={inputClass} value={v.salePrice || ''} onChange={e => updateVariation(i, { salePrice: +e.target.value || undefined })} />
                        </div>
                        <div>
                          <label className={labelClass}>Wholesale</label>
                          <input type="number" step="0.01" className={inputClass} value={v.wholesalePrice || ''} onChange={e => updateVariation(i, { wholesalePrice: +e.target.value || undefined })} />
                        </div>
                        <div>
                          <label className={labelClass}>Stock</label>
                          <input type="number" className={inputClass} value={v.stockQuantity ?? 0} onChange={e => updateVariation(i, { stockQuantity: +e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Variation Image</label>
                          <div className="flex gap-2 items-center">
                            {v.image && <img src={mediaUrl(v.image)} alt="" className="w-10 h-10 rounded object-cover border bg-forest-50" />}
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-100 text-forest-700 rounded-lg text-xs font-600 cursor-pointer hover:bg-forest-200">
                              Upload
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleVariationImageUpload(i, e)} disabled={uploading} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description & SEO */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Short Description</label>
              <input className={inputClass} value={form.shortDescription || ''} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea rows={3} className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Meta Title (SEO)</label>
              <input className={inputClass} value={form.metaTitle || ''} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Meta Description (SEO)</label>
              <textarea rows={2} className={inputClass} value={form.metaDescription || ''} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} />
            </div>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} /> In Stock</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-forest-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-sans font-600 text-sage-600 hover:bg-forest-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || uploading} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-800 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
