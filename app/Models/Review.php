<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'product_id', 'user_id', 'order_id', 'rating', 'title', 'body',
        'review_category', 'quality_rating', 'delivery_rating', 'service_rating',
        'seller_response', 'seller_responded_at',
        'images', 'is_verified_purchase', 'is_wholesale', 'status',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'quality_rating' => 'integer',
            'delivery_rating' => 'integer',
            'service_rating' => 'integer',
            'images' => 'array',
            'is_verified_purchase' => 'boolean',
            'is_wholesale' => 'boolean',
            'seller_responded_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
