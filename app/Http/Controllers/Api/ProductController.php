<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['categoryRelation', 'brand'])
            ->where('is_active', true);

        $category = $request->input('category');

        if ($category && ! in_array($category, ['All', 'all'], true)) {
            if (in_array($category, ['On sale', 'on-sale'], true)) {
                $query->whereNotNull('sale_price')->where('sale_price', '>', 0);
            } else {
                $query->where(function ($q) use ($category) {
                    $q->where('category', $category)
                        ->orWhereHas('categoryRelation', fn ($cq) => $cq
                            ->where('slug', $category)
                            ->orWhere('name', $category));
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $this->applySort($query, $request);

        $perPage = min((int) $request->input('per_page', 50), 100);
        $products = $request->boolean('paginate')
            ? $query->paginate($perPage)
            : $query->get();

        if ($products instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            return response()->json([
                'data' => $products->getCollection()->map(fn ($p) => ApiFormatter::product($p))->values(),
                'meta' => [
                    'currentPage' => $products->currentPage(),
                    'lastPage' => $products->lastPage(),
                    'total' => $products->total(),
                ],
            ]);
        }

        return response()->json([
            'products' => $products->map(fn ($p) => ApiFormatter::product($p))->values(),
        ]);
    }

    public function categories(): JsonResponse
    {
        $total = Product::where('is_active', true)->count();
        $onSale = Product::where('is_active', true)->whereNotNull('sale_price')->where('sale_price', '>', 0)->count();

        $items = [
            ['name' => 'All', 'slug' => 'all', 'count' => $total],
            ['name' => 'On sale', 'slug' => 'on-sale', 'count' => $onSale],
        ];

        Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->each(function (Category $category) use (&$items) {
                $count = Product::where('is_active', true)
                    ->where('category_id', $category->id)
                    ->count();

                $items[] = [
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'count' => $count,
                ];
            });

        return response()->json(['categories' => $items]);
    }

    public function show($product): JsonResponse
    {
        $model = is_numeric($product)
            ? Product::findOrFail($product)
            : Product::where('slug', $product)->orWhere('id', $product)->firstOrFail();

        $related = Product::with(['categoryRelation', 'brand', 'images'])
            ->where('is_active', true)
            ->where('id', '!=', $model->id)
            ->when($model->category_id, fn ($q) => $q->where('category_id', $model->category_id))
            ->orderByDesc('is_featured')
            ->limit(8)
            ->get();

        $moreFromShop = Product::with(['categoryRelation', 'brand', 'images'])
            ->where('is_active', true)
            ->where('id', '!=', $model->id)
            ->orderByDesc('is_featured')
            ->limit(4)
            ->get();

        return response()->json([
            'product' => ApiFormatter::product($model, true),
            'related' => $related->map(fn ($p) => ApiFormatter::product($p))->values(),
            'moreFromShop' => $moreFromShop->map(fn ($p) => ApiFormatter::product($p))->values(),
        ]);
    }

    private function applySort($query, Request $request): void
    {
        $sort = $request->input('sort', 'relevance');

        match ($sort) {
            'price_asc' => $query->orderByRaw('COALESCE(NULLIF(sale_price, 0), price) ASC'),
            'price_desc' => $query->orderByRaw('COALESCE(NULLIF(sale_price, 0), price) DESC'),
            'reviews' => $query
                ->addSelect([
                    'avg_rating' => Review::selectRaw('COALESCE(AVG(rating), 0)')
                        ->whereColumn('product_id', 'products.id')
                        ->where('status', 'approved'),
                    'review_count' => Review::selectRaw('COUNT(*)')
                        ->whereColumn('product_id', 'products.id')
                        ->where('status', 'approved'),
                ])
                ->orderByDesc('avg_rating')
                ->orderByDesc('review_count')
                ->orderBy('name'),
            'recent' => $query->orderByDesc('created_at')->orderBy('name'),
            default => $this->applyRelevanceSort($query, $request),
        };
    }

    private function applyRelevanceSort($query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $exact = $search;
            $starts = "{$search}%";
            $contains = "%{$search}%";

            $query->orderByRaw(
                'CASE
                    WHEN name = ? THEN 0
                    WHEN name LIKE ? THEN 1
                    WHEN name LIKE ? THEN 2
                    WHEN category LIKE ? THEN 3
                    ELSE 4
                END',
                [$exact, $starts, $contains, $contains]
            )->orderBy('name');
        } else {
            $query->orderByDesc('is_featured')->orderBy('name');
        }
    }
}
