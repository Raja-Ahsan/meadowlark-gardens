<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlantType extends Model
{
    protected $fillable = [
        'plant_type_category_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'sort_order',
        'is_published',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PlantTypeCategory::class, 'plant_type_category_id');
    }
}
