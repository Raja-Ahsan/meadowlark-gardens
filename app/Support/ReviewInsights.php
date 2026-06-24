<?php

namespace App\Support;

use App\Models\Review;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ReviewInsights
{
    public const CATEGORIES = [
        'condition' => 'Condition',
        'delivery_packaging' => 'Delivery & Packaging',
        'description_accuracy' => 'Description accuracy',
        'seller_service' => 'Seller service',
        'ease_of_use' => 'Ease of use',
        'quality' => 'Quality',
        'appearance' => 'Appearance',
        'sizing_fit' => 'Sizing & Fit',
    ];

    private const SUMMARY_KEYWORDS = [
        'Healthy plant' => ['healthy', 'vibrant', 'thriving', 'strong roots', 'lush'],
        'Well packaged' => ['packaged', 'packaging', 'packed', 'secure', 'protected', 'wrapped'],
        'Fast delivery' => ['fast shipping', 'fast delivery', 'arrived quickly', 'arrived on time', 'quick ship'],
        'Love it' => ['love it', 'love this', 'loved it', 'so happy'],
        'Looks great' => ['looks great', 'beautiful', 'gorgeous', 'stunning', 'lovely'],
        'As described' => ['as described', 'exactly as', 'as promised'],
        'Great quality' => ['great quality', 'high quality', 'quality and care'],
    ];

    public static function forProduct(int $productId): array
    {
        $reviews = Review::with('user')
            ->where('product_id', $productId)
            ->where('status', 'approved')
            ->get();

        return self::build($reviews);
    }

    public static function forShop(): array
    {
        $reviews = Review::with('user')->where('status', 'approved')->get();

        return self::build($reviews);
    }

    private static function build(Collection $reviews): array
    {
        $total = $reviews->count();
        $avgRating = $total ? round($reviews->avg('rating'), 1) : 0;

        $quality = self::avgSubRating($reviews, 'quality_rating', 'rating');
        $delivery = self::avgSubRating($reviews, 'delivery_rating', 'rating');
        $service = self::avgSubRating($reviews, 'service_rating', 'rating');

        $recommendPercent = $total
            ? (int) round(($reviews->where('rating', '>=', 4)->count() / $total) * 100)
            : 0;

        $categoryCounts = [];
        foreach (self::CATEGORIES as $key => $label) {
            $count = $reviews->where('review_category', $key)->count();
            if ($count > 0) {
                $categoryCounts[] = ['key' => $key, 'label' => $label, 'count' => $count];
            }
        }

        usort($categoryCounts, fn ($a, $b) => $b['count'] <=> $a['count']);

        return [
            'averageRating' => $avgRating,
            'totalReviews' => $total,
            'summaryTags' => self::summaryTags($reviews),
            'breakdown' => [
                'quality' => $quality,
                'delivery' => $delivery,
                'service' => $service,
            ],
            'recommendPercent' => $recommendPercent,
            'categoryCounts' => $categoryCounts,
            'reviewPhotos' => self::reviewPhotos($reviews),
        ];
    }

    private static function avgSubRating(Collection $reviews, string $column, string $fallback): float
    {
        if ($reviews->isEmpty()) {
            return 0;
        }

        $values = $reviews->map(fn ($r) => (float) ($r->{$column} ?? $r->{$fallback}));

        return round($values->avg(), 1);
    }

    private static function summaryTags(Collection $reviews): array
    {
        if ($reviews->isEmpty()) {
            return [];
        }

        $corpus = Str::lower($reviews->pluck('body')->implode(' '));
        $tags = [];

        foreach (self::SUMMARY_KEYWORDS as $label => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($corpus, Str::lower($keyword))) {
                    $tags[] = $label;
                    break;
                }
            }
        }

        return array_slice(array_values(array_unique($tags)), 0, 6);
    }

    private static function reviewPhotos(Collection $reviews): array
    {
        $photos = [];

        foreach ($reviews as $review) {
            foreach ($review->images ?? [] as $image) {
                $photos[] = [
                    'url' => MediaUrl::normalize(is_string($image) ? $image : ($image['url'] ?? '')),
                    'userName' => $review->user?->name ?? 'Buyer',
                    'reviewId' => (string) $review->id,
                ];
            }
        }

        return array_values(array_filter($photos, fn ($p) => ! empty($p['url'])));
    }
}
