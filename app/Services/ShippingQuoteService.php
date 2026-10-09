<?php

namespace App\Services;

use App\Exceptions\UpsRateException;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\Setting;
use App\Support\ShippingWeight;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShippingQuoteService
{
    public function __construct(private UpsShippingService $ups) {}

    /** @param array<string, mixed> $data */
    public function quote(array $data): array
    {
        $shipTo = $data['shippingAddress'] ?? [];
        $items = $data['items'] ?? [];
        $type = (string) ($data['type'] ?? 'retail');
        $subtotal = (float) ($data['subtotal'] ?? $this->estimateSubtotal($items, $type));
        $weightLbs = $this->calculateWeightLbs($items);
        $freeShippingCoupon = (bool) ($data['freeShipping'] ?? false);
        $threshold = (float) Setting::get('ups_free_shipping_threshold', 75);

        $fingerprint = $this->fingerprint($shipTo, $items, $subtotal, $type, $freeShippingCoupon);

        // Legitimate promotional free shipping only (coupon or configured threshold).
        if ($freeShippingCoupon || ($threshold > 0 && $subtotal >= $threshold)) {
            $rates = [[
                'carrier' => 'free',
                'code' => 'FREE',
                'name' => 'Free Shipping',
                'cost' => 0.0,
                'currency' => 'USD',
                'etaDays' => null,
            ]];

            return $this->storeAndRespond($rates, 'promotion', $weightLbs, $subtotal, $fingerprint);
        }

        if (! $this->ups->isEnabled()) {
            Log::warning('UPS shipping quote blocked: UPS is not enabled or credentials missing');

            return $this->emptyQuoteResponse(
                $weightLbs,
                $subtotal,
                'Shipping rates are temporarily unavailable. Please try again later.',
            );
        }

        if (! $this->canQuoteUps($shipTo)) {
            return $this->emptyQuoteResponse(
                $weightLbs,
                $subtotal,
                'Please complete your shipping address to calculate shipping.',
            );
        }

        try {
            $rates = $this->ups->getRates($shipTo, $weightLbs);

            return $this->storeAndRespond($rates, 'ups', $weightLbs, $subtotal, $fingerprint);
        } catch (UpsRateException $e) {
            Log::warning('UPS quote rejected', [
                'message' => $e->getMessage(),
                'field' => $e->getField(),
                'ups_code' => $e->getUpsCode(),
                'postal' => $shipTo['postalCode'] ?? $shipTo['postal_code'] ?? null,
                'state' => $shipTo['state'] ?? null,
            ]);

            return $this->emptyQuoteResponse(
                $weightLbs,
                $subtotal,
                $e->getUserMessage(),
                $e->getField(),
            );
        } catch (\Throwable $e) {
            Log::warning('UPS quote failed', [
                'message' => $e->getMessage(),
            ]);

            return $this->emptyQuoteResponse(
                $weightLbs,
                $subtotal,
                'Shipping rates are temporarily unavailable. Please try again in a moment.',
            );
        }
    }

    /**
     * Validate a selected shipping method against a cached UPS quote.
     * Never trusts client-submitted cost. Never accepts flat/fallback rates.
     *
     * @param  array<string, mixed>  $data
     * @return array{cost: float, carrier: string, code: string, name: string, currency?: string}
     */
    public function resolveShippingCost(array $data): array
    {
        $selection = $data['shippingMethod'] ?? null;
        if (! is_array($selection) || empty($selection['code'])) {
            abort(422, 'Please select a shipping method.');
        }

        $freeShipping = (bool) ($data['freeShipping'] ?? false);
        $shipTo = $data['shippingAddress'] ?? [];
        $items = $data['items'] ?? [];
        $type = (string) ($data['type'] ?? 'retail');
        $subtotal = (float) ($data['subtotal'] ?? $this->estimateSubtotal($items, $type));

        // Coupon free-shipping is the only path that may skip a UPS quote id.
        if ($freeShipping) {
            return [
                'cost' => 0.0,
                'carrier' => 'free',
                'code' => 'FREE',
                'name' => (string) ($selection['name'] ?? 'Free Shipping'),
                'currency' => 'USD',
            ];
        }

        $postal = trim((string) ($shipTo['postalCode'] ?? $shipTo['postal_code'] ?? ''));
        $city = trim((string) ($shipTo['city'] ?? ''));
        $state = trim((string) ($shipTo['state'] ?? ''));
        if ($postal === '' || $city === '' || $state === '') {
            abort(422, 'Please complete your shipping address so we can calculate shipping.');
        }

        $quoteId = (string) ($data['shippingQuoteId'] ?? $selection['quoteId'] ?? '');
        if ($quoteId === '') {
            abort(422, 'Please calculate shipping before placing your order.');
        }

        $rates = null;
        $source = null;

        $cached = Cache::get($this->quoteCacheKey($quoteId));
        $expectedFp = $this->fingerprint($shipTo, $items, $subtotal, $type, false);
        if (is_array($cached) && ($cached['fingerprint'] ?? null) === $expectedFp) {
            $rates = $cached['rates'] ?? [];
            $source = $cached['source'] ?? null;
        } else {
            Log::info('Shipping quote cache miss or cart/address changed; re-quoting', [
                'quoteId' => $quoteId,
            ]);
        }

        if (! is_array($rates) || $rates === []) {
            $fresh = $this->quote([
                'shippingAddress' => $shipTo,
                'items' => $items,
                'subtotal' => $subtotal,
                'type' => $type,
                'freeShipping' => false,
            ]);
            $rates = $fresh['rates'] ?? [];
            $source = $fresh['source'] ?? null;
            $quoteId = (string) ($fresh['quoteId'] ?? '');

            if ($quoteId === '' || $rates === []) {
                $message = (string) ($fresh['error'] ?? 'Unable to calculate shipping. Please refresh and try again.');
                abort(422, $message);
            }
        }

        // Paid checkout may only use UPS (or promotional free from a valid quote).
        if (! in_array($source, ['ups', 'promotion'], true)) {
            abort(422, 'Valid UPS shipping is required to place this order.');
        }

        $selCode = strtoupper(trim((string) $selection['code']));
        $selCarrier = strtolower(trim((string) ($selection['carrier'] ?? '')));

        $matched = collect($rates)->first(function ($rate) use ($selCode, $selCarrier) {
            $rateCode = strtoupper(trim((string) $rate['code']));
            $rateCarrier = strtolower(trim((string) $rate['carrier']));

            if ($rateCode !== $selCode) {
                return false;
            }

            return $selCarrier === '' || $selCarrier === $rateCarrier;
        });

        if (! $matched) {
            abort(422, 'Selected shipping method is no longer available. Please refresh rates.');
        }

        $matchedCarrier = strtolower((string) $matched['carrier']);
        if ($source === 'ups' && $matchedCarrier !== 'ups') {
            abort(422, 'Valid UPS shipping is required to place this order.');
        }
        if (in_array($matchedCarrier, ['flat', 'fallback'], true) || strtoupper((string) $matched['code']) === 'FLAT') {
            abort(422, 'Valid UPS shipping is required to place this order.');
        }

        // Authoritative cost from server quote — ignore client amount for charging.
        $expected = round((float) $matched['cost'], 2);
        $submitted = round((float) ($selection['cost'] ?? $expected), 2);

        if (abs($expected - $submitted) > 0.05) {
            abort(422, 'Shipping cost has changed. Please refresh and try again.');
        }

        Log::info('Shipping method resolved', [
            'source' => $source,
            'quoteId' => $quoteId !== '' ? $quoteId : null,
            'carrier' => $matched['carrier'],
            'code' => $matched['code'],
            'cost' => $expected,
        ]);

        return [
            'cost' => $expected,
            'carrier' => (string) $matched['carrier'],
            'code' => (string) $matched['code'],
            'name' => (string) $matched['name'],
            'currency' => (string) ($matched['currency'] ?? 'USD'),
        ];
    }

    /** @param array<int, array<string, mixed>> $items */
    public function calculateWeightLbs(array $items): float
    {
        $default = (float) config('ups.default_package_weight_lbs', 2);
        $weight = 0.0;

        foreach ($items as $item) {
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $product = Product::find($item['productId'] ?? null);
            if (! $product) {
                $weight += ShippingWeight::toPounds($default) * $qty;

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

            $weight += ShippingWeight::toPounds($unitWeight) * $qty;
        }

        return ShippingWeight::normalizeLbs($weight);
    }

    /** @param array<int, array<string, mixed>> $items */
    public function estimateSubtotal(array $items, string $type): float
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

            $subtotal += round($unitPrice, 2) * (int) $item['quantity'];
        }

        return round($subtotal, 2);
    }

    public function fingerprint(array $shipTo, array $items, float $subtotal, string $type, bool $freeShipping): string
    {
        $normalizedItems = collect($items)
            ->map(fn ($i) => [
                'p' => (string) ($i['productId'] ?? ''),
                'v' => (string) ($i['variationId'] ?? ''),
                'q' => (int) ($i['quantity'] ?? 0),
            ])
            ->sortBy(fn ($i) => $i['p'].':'.$i['v'])
            ->values()
            ->all();

        return hash('sha256', json_encode([
            'city' => strtolower(trim((string) ($shipTo['city'] ?? ''))),
            'state' => strtoupper(trim((string) ($shipTo['state'] ?? ''))),
            'postal' => trim((string) ($shipTo['postalCode'] ?? $shipTo['postal_code'] ?? '')),
            'country' => strtoupper(trim((string) ($shipTo['country'] ?? 'US'))),
            'line1' => strtolower(trim((string) ($shipTo['addressLine1'] ?? $shipTo['address1'] ?? ''))),
            'items' => $normalizedItems,
            'subtotal' => round($subtotal, 2),
            'type' => $type,
            'free' => $freeShipping,
        ], JSON_THROW_ON_ERROR));
    }

    private function canQuoteUps(array $shipTo): bool
    {
        $postal = trim((string) ($shipTo['postalCode'] ?? $shipTo['postal_code'] ?? ''));
        $city = trim((string) ($shipTo['city'] ?? ''));
        $state = trim((string) ($shipTo['state'] ?? ''));

        return $postal !== '' && $city !== '' && $state !== '';
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyQuoteResponse(
        float $weightLbs,
        float $subtotal,
        string $message,
        ?string $field = null,
    ): array {
        $fieldErrors = [];
        if ($field) {
            $fieldErrors[$field] = $message;
        }

        return [
            'quoteId' => null,
            'rates' => [],
            'source' => 'none',
            'upsEnabled' => $this->ups->isEnabled(),
            'weightLbs' => $weightLbs,
            'subtotal' => $subtotal,
            'taxRate' => (float) Setting::get('tax_rate', 9.25),
            'freeShippingThreshold' => (float) Setting::get('ups_free_shipping_threshold', 75),
            'error' => $message,
            'fieldErrors' => $fieldErrors,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $rates
     * @return array<string, mixed>
     */
    private function storeAndRespond(array $rates, string $source, float $weightLbs, float $subtotal, string $fingerprint): array
    {
        $quoteId = (string) Str::uuid();
        Cache::put($this->quoteCacheKey($quoteId), [
            'rates' => $rates,
            'source' => $source,
            'fingerprint' => $fingerprint,
            'created_at' => now()->toIso8601String(),
        ], (int) config('ups.quote_ttl_seconds', 1800));

        return [
            'quoteId' => $quoteId,
            'rates' => $rates,
            'source' => $source,
            'upsEnabled' => $this->ups->isEnabled(),
            'weightLbs' => $weightLbs,
            'subtotal' => $subtotal,
            'taxRate' => (float) Setting::get('tax_rate', 9.25),
            'freeShippingThreshold' => (float) Setting::get('ups_free_shipping_threshold', 75),
            'error' => null,
            'fieldErrors' => [],
        ];
    }

    private function quoteCacheKey(string $quoteId): string
    {
        return 'shipping.quote.'.$quoteId;
    }
}
