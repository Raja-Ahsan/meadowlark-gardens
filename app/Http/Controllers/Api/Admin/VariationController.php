<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VariationController extends Controller
{
    public function store(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'sku' => ['nullable', 'string', 'max:100'],
            'barcode' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'salePrice' => ['nullable', 'numeric', 'min:0'],
            'wholesalePrice' => ['nullable', 'numeric', 'min:0'],
            'stockQuantity' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'attributeValues' => ['nullable', 'array'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $product->update(['type' => 'variable']);

        $variation = $product->variations()->create([
            'sku' => $data['sku'] ?? 'VAR-'.strtoupper(Str::random(8)),
            'barcode' => $data['barcode'] ?? null,
            'price' => $data['price'],
            'sale_price' => $data['salePrice'] ?? null,
            'wholesale_price' => $data['wholesalePrice'] ?? null,
            'stock_quantity' => $data['stockQuantity'] ?? 0,
            'image' => $data['image'] ?? null,
            'weight' => $data['weight'] ?? null,
            'attribute_values' => $data['attributeValues'] ?? [],
            'is_active' => $data['isActive'] ?? true,
        ]);

        return response()->json([
            'message' => 'Variation created.',
            'variation' => ApiFormatter::variation($variation),
        ], 201);
    }

    public function update(Request $request, Product $product, ProductVariation $variation): JsonResponse
    {
        if ($variation->product_id !== $product->id) {
            return response()->json(['message' => 'Invalid variation.'], 422);
        }

        $data = $request->validate([
            'sku' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'salePrice' => ['nullable', 'numeric'],
            'wholesalePrice' => ['nullable', 'numeric'],
            'stockQuantity' => ['sometimes', 'integer', 'min:0'],
            'image' => ['nullable', 'string'],
            'attributeValues' => ['nullable', 'array'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $variation->update([
            'sku' => $data['sku'] ?? $variation->sku,
            'price' => $data['price'] ?? $variation->price,
            'sale_price' => $data['salePrice'] ?? $variation->sale_price,
            'wholesale_price' => $data['wholesalePrice'] ?? $variation->wholesale_price,
            'stock_quantity' => $data['stockQuantity'] ?? $variation->stock_quantity,
            'image' => $data['image'] ?? $variation->image,
            'attribute_values' => $data['attributeValues'] ?? $variation->attribute_values,
            'is_active' => $data['isActive'] ?? $variation->is_active,
        ]);

        return response()->json([
            'message' => 'Variation updated.',
            'variation' => ApiFormatter::variation($variation->fresh()),
        ]);
    }

    public function destroy(Product $product, ProductVariation $variation): JsonResponse
    {
        if ($variation->product_id !== $product->id) {
            return response()->json(['message' => 'Invalid variation.'], 422);
        }

        $variation->delete();

        if ($product->variations()->count() === 0) {
            $product->update(['type' => 'simple']);
        }

        return response()->json(['message' => 'Variation deleted.']);
    }
}
