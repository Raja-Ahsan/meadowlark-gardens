<?php

namespace App\Support;

class ShippingWeight
{
    /**
     * Convert a raw product weight into pounds for UPS.
     */
    public static function toPounds(float $value, ?string $unit = null): float
    {
        $unit = strtolower(trim((string) ($unit ?: config('ups.weight_unit', 'lb'))));

        return match ($unit) {
            'kg', 'kilogram', 'kilograms' => $value * 2.2046226218,
            'oz', 'ounce', 'ounces' => $value / 16,
            'g', 'gram', 'grams' => $value / 453.59237,
            default => $value, // lb / lbs / pound
        };
    }

    public static function normalizeLbs(float $lbs): float
    {
        return max(0.1, round($lbs, 2));
    }
}
