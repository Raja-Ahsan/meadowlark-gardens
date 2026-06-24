<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiFormatter;
use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['categoryRelation', 'brand', 'images', 'variations']);

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($p) => ApiFormatter::product($p))
        );
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['categoryRelation', 'brand', 'images', 'variations']);

        return response()->json([
            'product' => ApiFormatter::product($product),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);
        $images = $validated['images'] ?? [];
        $variations = $validated['variations'] ?? [];
        unset($validated['images'], $validated['variations']);

        $product = Product::create($validated);
        $this->syncImages($product, $images);
        $this->syncVariations($product, $variations);

        return response()->json([
            'message' => 'Product created.',
            'product' => ApiFormatter::product($product->fresh(['categoryRelation', 'brand', 'images', 'variations'])),
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $this->validated($request, $product);
        $images = $validated['images'] ?? null;
        $variations = $validated['variations'] ?? null;
        unset($validated['images'], $validated['variations']);

        $product->update($validated);

        if ($images !== null) {
            $this->syncImages($product, $images);
        }
        if ($variations !== null) {
            $this->syncVariations($product, $variations);
        }

        return response()->json([
            'message' => 'Product updated.',
            'product' => ApiFormatter::product($product->fresh(['categoryRelation', 'brand', 'images', 'variations'])),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%");
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('in_stock')) {
            $query->where('in_stock', filter_var($request->in_stock, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->has('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('stock_status')) {
            match ($request->stock_status) {
                'low' => $query->where('manage_stock', true)->whereColumn('stock_quantity', '<=', 'low_stock_threshold'),
                'out' => $query->where('manage_stock', true)->where('stock_quantity', 0)->where('allow_backorder', false),
                'in' => $query->where(function ($q) {
                    $q->where('manage_stock', false)->where('in_stock', true)
                        ->orWhere(function ($q2) {
                            $q2->where('manage_stock', true)->where('stock_quantity', '>', 0);
                        });
                }),
                default => null,
            };
        }
    }

    protected function allowedSorts(): array
    {
        return ['name', 'price', 'stock_quantity', 'created_at', 'id'];
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'in:simple,variable'],
            'category' => ['nullable', 'string', 'max:255'],
            'categoryId' => ['nullable', 'integer', 'exists:categories,id'],
            'brandId' => ['nullable', 'integer', 'exists:brands,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'salePrice' => ['nullable', 'numeric', 'min:0'],
            'wholesalePrice' => ['required', 'numeric', 'min:0'],
            'saleWholesalePrice' => ['nullable', 'numeric', 'min:0'],
            'image' => ['required', 'string'],
            'description' => ['required', 'string'],
            'shortDescription' => ['nullable', 'string'],
            'badge' => ['nullable', 'string', 'max:255'],
            'inStock' => ['required', 'boolean'],
            'stockQuantity' => ['nullable', 'integer', 'min:0'],
            'lowStockThreshold' => ['nullable', 'integer', 'min:0'],
            'manageStock' => ['nullable', 'boolean'],
            'allowBackorder' => ['nullable', 'boolean'],
            'minWholesaleQty' => ['required', 'integer', 'min:1'],
            'tags' => ['nullable', 'array'],
            'isFeatured' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*.path' => ['required_with:images', 'string'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
            'images.*.isPrimary' => ['nullable', 'boolean'],
            'variations' => ['nullable', 'array'],
            'variations.*.sku' => ['nullable', 'string', 'max:100'],
            'variations.*.price' => ['required_with:variations', 'numeric', 'min:0'],
            'variations.*.salePrice' => ['nullable', 'numeric', 'min:0'],
            'variations.*.wholesalePrice' => ['nullable', 'numeric', 'min:0'],
            'variations.*.stockQuantity' => ['nullable', 'integer', 'min:0'],
            'variations.*.image' => ['nullable', 'string'],
            'variations.*.weight' => ['nullable', 'numeric', 'min:0'],
            'variations.*.attributeValues' => ['nullable', 'array'],
            'variations.*.isActive' => ['nullable', 'boolean'],
        ]);

        $type = $data['type'] ?? 'simple';
        $slug = $data['slug'] ?? Str::slug($data['name']);
        $categoryName = $data['category'] ?? null;

        if (! empty($data['categoryId'])) {
            $categoryName = \App\Models\Category::find($data['categoryId'])?->name ?? $categoryName;
        }

        $result = [
            'name' => $data['name'],
            'slug' => $slug,
            'sku' => $data['sku'] ?? ($product?->sku ?? 'SKU-'.strtoupper(Str::random(8))),
            'type' => $type,
            'category' => $categoryName ?? 'Uncategorized',
            'category_id' => $data['categoryId'] ?? null,
            'brand_id' => $data['brandId'] ?? null,
            'price' => $data['price'],
            'sale_price' => $data['salePrice'] ?? null,
            'wholesale_price' => $data['wholesalePrice'],
            'sale_wholesale_price' => $data['saleWholesalePrice'] ?? null,
            'image' => MediaUrl::normalize($data['image']),
            'description' => $data['description'],
            'short_description' => $data['shortDescription'] ?? null,
            'badge' => $data['badge'] ?? null,
            'in_stock' => $data['inStock'],
            'stock_quantity' => $data['stockQuantity'] ?? 0,
            'low_stock_threshold' => $data['lowStockThreshold'] ?? 5,
            'manage_stock' => $data['manageStock'] ?? ($type === 'simple'),
            'allow_backorder' => $data['allowBackorder'] ?? false,
            'min_wholesale_qty' => $data['minWholesaleQty'],
            'tags' => $data['tags'] ?? [],
            'is_featured' => $data['isFeatured'] ?? false,
            'is_active' => $data['isActive'] ?? true,
            'weight' => $data['weight'] ?? null,
            'meta_title' => $data['metaTitle'] ?? null,
            'meta_description' => $data['metaDescription'] ?? null,
        ];

        if (array_key_exists('images', $data)) {
            $result['images'] = $data['images'] ?? [];
        }

        if (array_key_exists('variations', $data)) {
            $result['variations'] = $data['variations'] ?? [];
            if ($type === 'variable' && ! empty($data['variations'])) {
                $result['stock_quantity'] = collect($data['variations'])->sum('stockQuantity');
                $result['price'] = collect($data['variations'])->min('price') ?? $data['price'];
            }
        }

        return $result;
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        if (empty($images) && $product->image) {
            $product->images()->create([
                'path' => MediaUrl::normalize($product->image),
                'is_primary' => true,
                'sort_order' => 0,
            ]);

            return;
        }

        foreach ($images as $index => $img) {
            $product->images()->create([
                'path' => MediaUrl::normalize($img['path']),
                'alt' => $img['alt'] ?? null,
                'is_primary' => $img['isPrimary'] ?? ($index === 0),
                'sort_order' => $index,
            ]);
        }

        $primary = collect($images)->first(fn ($img) => ! empty($img['isPrimary'])) ?? ($images[0] ?? null);
        if ($primary) {
            $product->update(['image' => MediaUrl::normalize($primary['path'])]);
        }
    }

    private function syncVariations(Product $product, array $variations): void
    {
        $product->variations()->delete();

        if (empty($variations)) {
            if ($product->type === 'variable') {
                $product->update(['type' => 'simple']);
            }

            return;
        }

        $product->update(['type' => 'variable']);

        foreach ($variations as $variation) {
            $product->variations()->create([
                'sku' => $variation['sku'] ?? 'VAR-'.strtoupper(Str::random(8)),
                'price' => $variation['price'],
                'sale_price' => $variation['salePrice'] ?? null,
                'wholesale_price' => $variation['wholesalePrice'] ?? null,
                'stock_quantity' => $variation['stockQuantity'] ?? 0,
                'image' => MediaUrl::normalize($variation['image'] ?? null),
                'weight' => $variation['weight'] ?? null,
                'attribute_values' => $variation['attributeValues'] ?? [],
                'is_active' => $variation['isActive'] ?? true,
            ]);
        }

        $totalStock = $product->variations()->sum('stock_quantity');
        $minPrice = $product->variations()->min('price');
        $product->update([
            'stock_quantity' => $totalStock,
            'price' => $minPrice ?? $product->price,
            'in_stock' => $totalStock > 0,
        ]);
    }
}
