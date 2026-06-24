<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Support\ApiFormatter;
use App\Support\ReviewInsights;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function profile(): JsonResponse
    {
        $reviews = Review::where('status', 'approved');
        $avgRating = round((float) ($reviews->avg('rating') ?? 0), 1);
        $reviewCount = (int) $reviews->count();
        $salesCount = Order::whereIn('status', ['delivered', 'completed', 'processing', 'shipped'])->count();

        return response()->json([
            'shop' => [
                'name' => Setting::get('shop_name', 'MeadowlarkGardensTN'),
                'displayName' => Setting::get('site_name', 'Meadowlark Gardens'),
                'owner' => Setting::get('shop_owner', 'John Moser'),
                'location' => Setting::get('shop_location', 'Tennessee, United States'),
                'avatar' => Setting::get('shop_avatar', null),
                'rating' => $avgRating > 0 ? $avgRating : 4.9,
                'reviewCount' => $reviewCount > 0 ? $reviewCount : 48,
                'salesCount' => $salesCount > 0 ? $salesCount : 11600,
                'yearsActive' => (int) Setting::get('shop_years_active', '6'),
                'members' => array_filter(array_map('trim', explode(',', Setting::get('shop_members', 'Tracy,John')))),
                'badges' => [
                    ['key' => 'dispatch', 'label' => 'Smooth dispatch', 'description' => 'Has a history of dispatching on time with tracking.'],
                    ['key' => 'replies', 'label' => 'Speedy replies', 'description' => 'Has a history of replying to messages quickly.'],
                    ['key' => 'rave', 'label' => 'Rave reviews', 'description' => 'Average review rating is 4.8 or higher.'],
                ],
                'responseTime' => Setting::get('shop_response_time', 'Typically responds within a few hours'),
            ],
        ]);
    }

    public function reviews(Request $request): JsonResponse
    {
        $query = Review::with(['user', 'product'])
            ->where('status', 'approved');

        if ($request->filled('category')) {
            $query->where('review_category', $request->category);
        }

        $perPage = min((int) $request->input('per_page', $request->input('limit', 6)), 50);
        $reviews = $query->latest()->paginate($perPage);

        return response()->json([
            'reviews' => $reviews->getCollection()->map(fn ($r) => array_merge(ApiFormatter::review($r), [
                'purchasedProduct' => $r->product?->name,
                'purchasedProductSlug' => $r->product?->slug,
            ]))->values(),
            'meta' => [
                'currentPage' => $reviews->currentPage(),
                'lastPage' => $reviews->lastPage(),
                'perPage' => $reviews->perPage(),
                'total' => $reviews->total(),
                'from' => $reviews->firstItem(),
                'to' => $reviews->lastItem(),
            ],
            'insights' => ReviewInsights::forShop(),
        ]);
    }
}
