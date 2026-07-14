<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Support\ApiFormatter;
use App\Support\ReviewInsights;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerReviewController extends Controller
{
    public function index(Request $request, Product $product): JsonResponse
    {
        $query = Review::with('user')
            ->where('product_id', $product->id)
            ->where('status', 'approved');

        if ($request->filled('category')) {
            $query->where('review_category', $request->category);
        }

        $reviews = $query->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json([
            'reviews' => $reviews->getCollection()->map(fn ($r) => ApiFormatter::review($r))->values(),
            'meta' => [
                'currentPage' => $reviews->currentPage(),
                'lastPage' => $reviews->lastPage(),
                'perPage' => $reviews->perPage(),
                'total' => $reviews->total(),
                'from' => $reviews->firstItem(),
                'to' => $reviews->lastItem(),
            ],
            'insights' => ReviewInsights::forProduct($product->id),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'productId' => ['required', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'images' => ['nullable', 'array'],
            'reviewCategory' => ['nullable', 'string', 'max:50'],
            'qualityRating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'deliveryRating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'serviceRating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $user = $request->user();
        $verified = Order::where('user_id', $user->id)
            ->whereHas('items', fn ($q) => $q->where('product_id', $data['productId']))
            ->exists();

        $review = Review::create([
            'product_id' => $data['productId'],
            'user_id' => $user->id,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'body' => $data['body'],
            'images' => $data['images'] ?? [],
            'review_category' => $data['reviewCategory'] ?? null,
            'quality_rating' => $data['qualityRating'] ?? $data['rating'],
            'delivery_rating' => $data['deliveryRating'] ?? $data['rating'],
            'service_rating' => $data['serviceRating'] ?? $data['rating'],
            'is_verified_purchase' => $verified,
            'is_wholesale' => $user->isWholesale(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Review submitted for approval.',
            'review' => ApiFormatter::review($review->load('user')),
        ], 201);
    }

    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::with('product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'reviews' => $reviews->map(fn ($r) => ApiFormatter::review($r))->values(),
        ]);
    }
}
