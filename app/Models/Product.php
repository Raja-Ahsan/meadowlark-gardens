<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'sku', 'type', 'category', 'category_id', 'brand_id',
        'price', 'sale_price', 'wholesale_price', 'sale_wholesale_price',
        'image', 'description', 'short_description', 'badge',
        'in_stock', 'stock_quantity', 'low_stock_threshold', 'manage_stock',
        'allow_backorder', 'tags', 'is_featured', 'is_active', 'weight',
        'meta_title', 'meta_description', 'min_wholesale_qty',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'wholesale_price' => 'decimal:2',
            'sale_wholesale_price' => 'decimal:2',
            'weight' => 'decimal:2',
            'in_stock' => 'boolean',
            'manage_stock' => 'boolean',
            'allow_backorder' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'tags' => 'array',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'min_wholesale_qty' => 'integer',
        ];
    }

    public function categoryRelation(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getEffectivePrice(bool $wholesale = false): float
    {
        if ($wholesale) {
            return (float) ($this->sale_wholesale_price ?? $this->wholesale_price);
        }

        return (float) ($this->sale_price ?? $this->price);
    }

    public function isInStock(): bool
    {
        if (! $this->manage_stock) {
            return (bool) $this->in_stock;
        }

        return $this->stock_quantity > 0 || $this->allow_backorder;
    }

    /**
     * Push out-of-stock products after available ones while preserving later orderBy clauses.
     * Mirrors isInStock() at the SQL level so pagination stays correct.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<\App\Models\Product>  $query
     * @return \Illuminate\Database\Eloquent\Builder<\App\Models\Product>
     */
    public function scopeOrderByAvailability($query)
    {
        return $query->orderByRaw(
            'CASE
                WHEN manage_stock = 0 AND in_stock = 1 THEN 0
                WHEN manage_stock = 1 AND (stock_quantity > 0 OR allow_backorder = 1) THEN 0
                ELSE 1
            END ASC'
        );
    }

    public function resolveRouteBinding($value, $field = null): ?self
    {
        if ($field) {
            return parent::resolveRouteBinding($value, $field);
        }

        return static::query()
            ->where('slug', $value)
            ->when(is_numeric($value), fn ($q) => $q->orWhere('id', $value))
            ->firstOrFail();
    }
}
