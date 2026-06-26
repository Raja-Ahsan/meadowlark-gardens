<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShippingQuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function quote(Request $request, ShippingQuoteService $quotes): JsonResponse
    {
        $data = $request->validate([
            'shippingAddress' => ['required', 'array'],
            'shippingAddress.addressLine1' => ['nullable', 'string'],
            'shippingAddress.address1' => ['nullable', 'string'],
            'shippingAddress.city' => ['required', 'string'],
            'shippingAddress.state' => ['required', 'string', 'max:16'],
            'shippingAddress.postalCode' => ['required', 'string', 'max:20'],
            'shippingAddress.country' => ['nullable', 'string', 'max:2'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'type' => ['nullable', 'in:retail,wholesale'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'freeShipping' => ['nullable', 'boolean'],
        ]);

        return response()->json($quotes->quote($data));
    }
}
