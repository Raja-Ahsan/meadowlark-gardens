<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalPage extends Model
{
    protected $fillable = [
        'slug', 'title', 'content', 'meta_title', 'meta_description', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where($field ?? 'slug', $value)->firstOrFail();
    }
}
