<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::orderBy('name')->get();

        return response()->json([
            'products' => $products->map(fn ($p) => ApiFormatter::product($p))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $product = Product::create($data);

        return response()->json([
            'message' => 'Product created.',
            'product' => ApiFormatter::product($product),
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $product->update($this->validated($request));

        return response()->json([
            'message' => 'Product updated.',
            'product' => ApiFormatter::product($product->fresh()),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'wholesalePrice' => ['required', 'numeric', 'min:0'],
            'image' => ['required', 'string'],
            'description' => ['required', 'string'],
            'badge' => ['nullable', 'string', 'max:255'],
            'inStock' => ['required', 'boolean'],
            'minWholesaleQty' => ['required', 'integer', 'min:1'],
        ]);

        return [
            'name' => $data['name'],
            'category' => $data['category'],
            'price' => $data['price'],
            'wholesale_price' => $data['wholesalePrice'],
            'image' => $data['image'],
            'description' => $data['description'],
            'badge' => $data['badge'] ?? null,
            'in_stock' => $data['inStock'],
            'min_wholesale_qty' => $data['minWholesaleQty'],
        ];
    }
}
