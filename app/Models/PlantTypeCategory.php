<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlantTypeCategory extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'image',
        'sort_order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function plantTypes(): HasMany
    {
        return $this->hasMany(PlantType::class)->orderBy('sort_order')->orderBy('title');
    }

    public function publishedPlantTypes(): HasMany
    {
        return $this->plantTypes()->where('is_published', true);
    }
}
