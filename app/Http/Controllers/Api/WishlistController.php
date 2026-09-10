<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::with('product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'wishlist' => $items->map(fn ($w) => [
                'id' => (string) $w->id,
                'product' => ApiFormatter::product($w->product),
                'addedAt' => $w->created_at->toIso8601String(),
            ])->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'productId' => ['required', 'exists:products,id'],
        ]);

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $data['productId'],
        ]);

        return response()->json([
            'message' => 'Added to wishlist.',
            'id' => (string) $wishlist->id,
        ], 201);
    }

    public function destroy(Request $request, string $productId): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }

    public function check(Request $request, Product $product): JsonResponse
    {
        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json(['inWishlist' => $exists]);
    }
}
