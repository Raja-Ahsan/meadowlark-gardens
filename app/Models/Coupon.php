<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'description', 'type', 'value', 'min_cart_value', 'max_discount',
        'usage_limit', 'usage_count', 'per_user_limit', 'wholesale_only', 'retail_only',
        'product_ids', 'category_ids', 'starts_at', 'expires_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_cart_value' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'usage_limit' => 'integer',
            'usage_count' => 'integer',
            'per_user_limit' => 'integer',
            'wholesale_only' => 'boolean',
            'retail_only' => 'boolean',
            'product_ids' => 'array',
            'category_ids' => 'array',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
