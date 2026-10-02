<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

class ShippingQuoteService
{
    public function __construct(private UpsShippingService $ups) {}

    /** @param array<string, mixed> $data */
    public function quote(array $data): array
    {
        $shipTo = $data['shippingAddress'] ?? [];
        $items = $data['items'] ?? [];
        $subtotal = (float) ($data['subtotal'] ?? $this->estimateSubtotal($items, $data['type'] ?? 'retail'));
        $weightLbs = $this->calculateWeightLbs($items);
        $freeShippingCoupon = (bool) ($data['freeShipping'] ?? false);
        $threshold = (float) Setting::get('ups_free_shipping_threshold', 75);

        if ($freeShippingCoupon || ($threshold > 0 && $subtotal >= $threshold)) {
            return $this->response([
                [
                    'carrier' => 'free',
                    'code' => 'FREE',
                    'name' => 'Free Shipping',
                    'cost' => 0.0,
                    'currency' => 'USD',
                    'etaDays' => null,
                ],
            ], 'promotion', $weightLbs, $subtotal);
        }

        if ($this->canQuoteUps($shipTo)) {
            try {
                $rates = $this->ups->getRates($shipTo, $weightLbs);
                if ($rates !== []) {
                    return $this->response($rates, 'ups', $weightLbs, $subtotal);
                }
            } catch (\Throwable $e) {
                Log::warning('UPS quote failed, using fallback', ['message' => $e->getMessage()]);
            }
        }

        return $this->response([$this->fallbackRate()], 'fallback', $weightLbs, $subtotal);
    }

    /** @param array<string, mixed> $data */
    public function resolveShippingCost(array $data): array
    {
        $selection = $data['shippingMethod'] ?? null;
        if (! is_array($selection) || empty($selection['code'])) {
            abort(422, 'Please select a shipping method.');
        }

        $freeShipping = (bool) ($data['freeShipping'] ?? false);
        $selectionCost = (float) ($selection['cost'] ?? 0);

        // Shipping-included / free checkout: never fail on stale rate codes.
        if ($freeShipping || $this->isFreeOrIncludedSelection($selection) || $selectionCost <= 0.0) {
            return [
                'cost' => 0.0,
                'carrier' => 'free',
                'code' => 'FREE',
                'name' => (string) ($selection['name'] ?? 'Free Shipping'),
            ];
        }

        $quote = $this->quote([
            'shippingAddress' => $data['shippingAddress'] ?? [],
            'items' => $data['items'] ?? [],
            'subtotal' => $data['subtotal'] ?? null,
            'type' => $data['type'] ?? 'retail',
            'freeShipping' => false,
        ]);

        $selCode = strtoupper(trim((string) $selection['code']));
        $selCarrier = strtolower(trim((string) ($selection['carrier'] ?? '')));

        $matched = collect($quote['rates'])->first(function ($rate) use ($selCode, $selCarrier) {
            $rateCode = strtoupper(trim((string) $rate['code']));
            $rateCarrier = strtolower(trim((string) $rate['carrier']));

            if ($rateCode !== $selCode) {
                return false;
            }

            // Carrier may be omitted by older clients; code match is enough when unique.
            return $selCarrier === '' || $selCarrier === $rateCarrier;
        });

        if (! $matched) {
            // Reconcile: if only one rate remains, use it instead of hard-failing checkout.
            if (count($quote['rates']) === 1) {
                $matched = $quote['rates'][0];
            } else {
                abort(422, 'Selected shipping method is no longer available. Please refresh rates.');
            }
        }

        $expected = round((float) $matched['cost'], 2);
        $submitted = round((float) ($selection['cost'] ?? $expected), 2);

        if (abs($expected - $submitted) > 0.05) {
            abort(422, 'Shipping cost has changed. Please refresh and try again.');
        }

        return [
            'cost' => $expected,
            'carrier' => $matched['carrier'],
            'code' => $matched['code'],
            'name' => $matched['name'],
        ];
    }

    /** @param array<string, mixed> $selection */
    private function isFreeOrIncludedSelection(array $selection): bool
    {
        $code = strtoupper(trim((string) ($selection['code'] ?? '')));
        $carrier = strtolower(trim((string) ($selection['carrier'] ?? '')));

        return in_array($code, ['FREE', 'INCLUDED'], true)
            || in_array($carrier, ['free', 'included'], true);
    }

    /** @param array<int, array<string, mixed>> $items */
    public function calculateWeightLbs(array $items): float
    {
        $default = (float) config('ups.default_package_weight_lbs', 2);
        $weight = 0.0;

        foreach ($items as $item) {
            $product = Product::find($item['productId'] ?? null);
            if (! $product) {
                $weight += $default * (int) ($item['quantity'] ?? 1);

                continue;
            }

            $unitWeight = $product->weight ? (float) $product->weight : $default;

            if (! empty($item['variationId'])) {
                $variation = ProductVariation::where('id', $item['variationId'])
                    ->where('product_id', $product->id)
                    ->first();
                if ($variation?->weight) {
                    $unitWeight = (float) $variation->weight;
                }
            }

            $weight += $unitWeight * (int) ($item['quantity'] ?? 1);
        }

        return max(0.1, round($weight, 2));
    }

    /** @param array<int, array<string, mixed>> $items */
    private function estimateSubtotal(array $items, string $type): float
    {
        $subtotal = 0.0;

        foreach ($items as $item) {
            $product = Product::findOrFail($item['productId']);
            $variation = null;

            if (! empty($item['variationId'])) {
                $variation = ProductVariation::where('id', $item['variationId'])
                    ->where('product_id', $product->id)
                    ->firstOrFail();
            }

            if ($variation) {
                $unitPrice = $type === 'wholesale'
                    ? (float) ($variation->sale_wholesale_price ?? $variation->wholesale_price ?? $product->getEffectivePrice(true))
                    : (float) ($variation->sale_price ?? $variation->price);
            } else {
                $unitPrice = $type === 'wholesale'
                    ? $product->getEffectivePrice(true)
                    : $product->getEffectivePrice(false);
            }

            $subtotal += $unitPrice * (int) $item['quantity'];
        }

        return round($subtotal, 2);
    }

    private function canQuoteUps(array $shipTo): bool
    {
        if (! $this->ups->isEnabled()) {
            return false;
        }

        $postal = trim($shipTo['postalCode'] ?? $shipTo['postal_code'] ?? '');
        $city = trim($shipTo['city'] ?? '');
        $state = trim($shipTo['state'] ?? '');

        return $postal !== '' && $city !== '' && $state !== '';
    }

    /** @return array{carrier: string, code: string, name: string, cost: float, currency: string, etaDays: null} */
    private function fallbackRate(): array
    {
        return [
            'carrier' => 'flat',
            'code' => 'FLAT',
            'name' => 'Standard Shipping',
            'cost' => round((float) Setting::get('ups_fallback_flat_rate', 9.99), 2),
            'currency' => 'USD',
            'etaDays' => null,
        ];
    }

    /** @param array<int, array<string, mixed>> $rates */
    private function response(array $rates, string $source, float $weightLbs, float $subtotal): array
    {
        return [
            'rates' => $rates,
            'source' => $source,
            'upsEnabled' => $this->ups->isEnabled(),
            'weightLbs' => $weightLbs,
            'subtotal' => $subtotal,
            'taxRate' => (float) Setting::get('tax_rate', 9.25),
            'freeShippingThreshold' => (float) Setting::get('ups_free_shipping_threshold', 75),
        ];
    }
}
