<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    public const AUDIENCE_RETAIL = 'retail';

    public const AUDIENCE_WHOLESALE = 'wholesale';

    /** Shown on both the retail site and the wholesale portal. */
    public const AUDIENCE_ALL = 'all';

    public const AUDIENCES = [self::AUDIENCE_RETAIL, self::AUDIENCE_WHOLESALE];

    public const STORED_AUDIENCES = [self::AUDIENCE_RETAIL, self::AUDIENCE_WHOLESALE, self::AUDIENCE_ALL];

    protected $fillable = [
        'audience',
        'title',
        'excerpt',
        'content',
        'image',
        'event_date',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    public function scopePublishedFor(Builder $query, string $audience): Builder
    {
        return $query->whereIn('audience', [$audience, self::AUDIENCE_ALL])
            ->where('is_published', true)
            ->latest();
    }
}
