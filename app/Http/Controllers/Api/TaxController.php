<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TaxJarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function quote(Request $request, TaxJarService $taxJar): JsonResponse
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
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'shipping' => ['nullable', 'numeric', 'min:0'],
            'type' => ['nullable', 'in:retail,wholesale'],
        ]);

        $result = $taxJar->quote([
            'shippingAddress' => $data['shippingAddress'],
            'items' => $data['items'],
            'subtotal' => $data['subtotal'] ?? null,
            'discount' => $data['discount'] ?? 0,
            'shipping' => $data['shipping'] ?? 0,
            'type' => $data['type'] ?? 'retail',
        ]);

        return response()->json([
            'tax' => $result['tax'],
            'taxRate' => $result['rate'],
            'source' => $result['source'],
            'taxjarEnabled' => $taxJar->isConfigured(),
        ]);
    }
}
