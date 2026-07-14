<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingMethod extends Model
{
    protected $fillable = [
        'shipping_zone_id', 'name', 'type', 'cost', 'min_order_amount',
        'estimated_days', 'wholesale_only', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'wholesale_only' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }
}
