<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
            'cartTotal' => ['required', 'numeric', 'min:0'],
            'type' => ['required', 'in:retail,wholesale'],
        ]);

        $coupon = Coupon::where('code', strtoupper($data['code']))
            ->where('is_active', true)
            ->first();

        if (! $coupon) {
            return response()->json(['message' => 'Invalid coupon code.'], 422);
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            return response()->json(['message' => 'Coupon is not yet active.'], 422);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json(['message' => 'Coupon has expired.'], 422);
        }

        if ($coupon->usage_limit && $coupon->usage_count >= $coupon->usage_limit) {
            return response()->json(['message' => 'Coupon usage limit reached.'], 422);
        }

        if ($coupon->wholesale_only && $data['type'] !== 'wholesale') {
            return response()->json(['message' => 'This coupon is for wholesale orders only.'], 422);
        }

        if ($coupon->retail_only && $data['type'] !== 'retail') {
            return response()->json(['message' => 'This coupon is for retail orders only.'], 422);
        }

        if ($coupon->min_cart_value && $data['cartTotal'] < $coupon->min_cart_value) {
            return response()->json([
                'message' => 'Minimum cart value of $'.number_format($coupon->min_cart_value, 2).' required.',
            ], 422);
        }

        $discount = match ($coupon->type) {
            'percentage' => $data['cartTotal'] * ($coupon->value / 100),
            'fixed' => $coupon->value,
            'free_shipping' => 0,
            default => 0,
        };

        if ($coupon->max_discount && $discount > $coupon->max_discount) {
            $discount = (float) $coupon->max_discount;
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'discount' => round($discount, 2),
                'freeShipping' => $coupon->type === 'free_shipping',
            ],
        ]);
    }
}
