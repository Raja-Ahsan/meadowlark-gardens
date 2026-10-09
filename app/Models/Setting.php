<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    protected $fillable = ['group', 'key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            if (! Schema::hasTable('settings')) {
                return $default;
            }

            return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
                $setting = static::where('key', $key)->first();

                return $setting?->value ?? $default;
            });
        } catch (\Throwable) {
            return $default;
        }
    }

    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);
        Cache::forget("setting.{$key}");
    }
}
