<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function index(): JsonResponse
    {
        $zones = ShippingZone::with('methods')->orderBy('name')->get();

        return response()->json([
            'zones' => $zones->map(fn ($z) => ApiFormatter::shippingZone($z))->values(),
        ]);
    }

    public function storeZone(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'countries' => ['nullable', 'array'],
            'states' => ['nullable', 'array'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $zone = ShippingZone::create([
            'name' => $data['name'],
            'countries' => $data['countries'] ?? ['US'],
            'states' => $data['states'] ?? null,
            'is_active' => $data['isActive'] ?? true,
        ]);

        return response()->json([
            'message' => 'Shipping zone created.',
            'zone' => ApiFormatter::shippingZone($zone),
        ], 201);
    }

    public function updateZone(Request $request, ShippingZone $zone): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'countries' => ['nullable', 'array'],
            'states' => ['nullable', 'array'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $zone->update([
            'name' => $data['name'] ?? $zone->name,
            'countries' => $data['countries'] ?? $zone->countries,
            'states' => $data['states'] ?? $zone->states,
            'is_active' => $data['isActive'] ?? $zone->is_active,
        ]);

        return response()->json([
            'message' => 'Zone updated.',
            'zone' => ApiFormatter::shippingZone($zone->fresh('methods')),
        ]);
    }

    public function destroyZone(ShippingZone $zone): JsonResponse
    {
        $zone->delete();

        return response()->json(['message' => 'Zone deleted.']);
    }

    public function storeMethod(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shippingZoneId' => ['required', 'integer', 'exists:shipping_zones,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:flat_rate,free_shipping,local_delivery,weight_based,price_based'],
            'cost' => ['required', 'numeric', 'min:0'],
            'minOrderAmount' => ['nullable', 'numeric', 'min:0'],
            'estimatedDays' => ['nullable', 'string', 'max:100'],
            'wholesaleOnly' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $method = ShippingMethod::create([
            'shipping_zone_id' => $data['shippingZoneId'],
            'name' => $data['name'],
            'type' => $data['type'],
            'cost' => $data['cost'],
            'min_order_amount' => $data['minOrderAmount'] ?? null,
            'estimated_days' => $data['estimatedDays'] ?? null,
            'wholesale_only' => $data['wholesaleOnly'] ?? false,
            'is_active' => $data['isActive'] ?? true,
        ]);

        return response()->json([
            'message' => 'Shipping method created.',
            'method' => ApiFormatter::shippingMethod($method),
        ], 201);
    }

    public function updateMethod(Request $request, ShippingMethod $method): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:flat_rate,free_shipping,local_delivery,weight_based,price_based'],
            'cost' => ['sometimes', 'numeric', 'min:0'],
            'minOrderAmount' => ['nullable', 'numeric', 'min:0'],
            'estimatedDays' => ['nullable', 'string', 'max:100'],
            'wholesaleOnly' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $method->update([
            'name' => $data['name'] ?? $method->name,
            'type' => $data['type'] ?? $method->type,
            'cost' => $data['cost'] ?? $method->cost,
            'min_order_amount' => $data['minOrderAmount'] ?? $method->min_order_amount,
            'estimated_days' => $data['estimatedDays'] ?? $method->estimated_days,
            'wholesale_only' => $data['wholesaleOnly'] ?? $method->wholesale_only,
            'is_active' => $data['isActive'] ?? $method->is_active,
        ]);

        return response()->json([
            'message' => 'Method updated.',
            'method' => ApiFormatter::shippingMethod($method->fresh()),
        ]);
    }

    public function destroyMethod(ShippingMethod $method): JsonResponse
    {
        $method->delete();

        return response()->json(['message' => 'Method deleted.']);
    }
}
