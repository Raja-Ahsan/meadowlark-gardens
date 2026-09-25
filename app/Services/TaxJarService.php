<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaxJarService
{
    public function isConfigured(): bool
    {
        return filled(config('services.taxjar.api_key'));
    }

    public function isSandbox(): bool
    {
        return (bool) config('services.taxjar.sandbox', false);
    }

    public function endpoint(): string
    {
        return $this->isSandbox()
            ? 'https://api.sandbox.taxjar.com/v2/taxes'
            : 'https://api.taxjar.com/v2/taxes';
    }

    /**
     * @param  array{
     *   shippingAddress: array<string, mixed>,
     *   items: array<int, array<string, mixed>>,
     *   subtotal?: float|null,
     *   discount?: float,
     *   shipping?: float,
     *   type?: string
     * }  $data
     * @return array{tax: float, rate: float, source: string, taxable_amount?: float}
     */
    public function quote(array $data): array
    {
        $shipTo = $data['shippingAddress'] ?? [];
        $items = $data['items'] ?? [];
        $discount = max(0, (float) ($data['discount'] ?? 0));
        $shipping = max(0, (float) ($data['shipping'] ?? 0));
        $type = $data['type'] ?? 'retail';

        if ($type === 'wholesale') {
            return [
                'tax' => 0.0,
                'rate' => 0.0,
                'source' => 'exempt',
            ];
        }

        $subtotal = isset($data['subtotal'])
            ? (float) $data['subtotal']
            : $this->estimateSubtotal($items, $type);

        $taxableSubtotal = max(0, $subtotal - $discount);

        if (! $this->canQuote($shipTo)) {
            return $this->fallbackTax($taxableSubtotal, $shipping);
        }

        if (! $this->isConfigured()) {
            return $this->fallbackTax($taxableSubtotal, $shipping);
        }

        $origin = $this->originAddress();
        $destination = $this->normalizeAddress($shipTo);
        $lineItems = $this->buildLineItems($items, $type, $discount, $subtotal);

        $payload = [
            'from_country' => $origin['country'],
            'from_zip' => $origin['postal_code'],
            'from_state' => $origin['state'],
            'from_city' => $origin['city'],
            'from_street' => $origin['street'],
            'to_country' => $destination['country'],
            'to_zip' => $destination['postal_code'],
            'to_state' => $destination['state'],
            'to_city' => $destination['city'],
            'to_street' => $destination['street'],
            'amount' => round($taxableSubtotal, 2),
            'shipping' => round($shipping, 2),
            'line_items' => $lineItems,
        ];

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => 'Bearer '.config('services.taxjar.api_key'),
                    'Content-Type' => 'application/json',
                ])
                ->post($this->endpoint(), $payload);
        } catch (\Throwable $e) {
            Log::warning('TaxJar request failed', ['error' => $e->getMessage()]);

            return $this->fallbackTax($taxableSubtotal, $shipping);
        }

        if (! $response->successful()) {
            Log::warning('TaxJar quote declined', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $this->fallbackTax($taxableSubtotal, $shipping);
        }

        $tax = $response->json('tax') ?? [];
        $amount = round((float) ($tax['amount_to_collect'] ?? 0), 2);
        $rate = round((float) ($tax['rate'] ?? 0) * 100, 4);

        return [
            'tax' => $amount,
            'rate' => $rate,
            'source' => 'taxjar',
            'taxable_amount' => round((float) ($tax['taxable_amount'] ?? $taxableSubtotal + $shipping), 2),
        ];
    }

    /** @param array<int, array<string, mixed>> $items */
    private function buildLineItems(array $items, string $type, float $discount, float $subtotal): array
    {
        $lines = [];
        $index = 1;

        foreach ($items as $item) {
            $product = Product::find($item['productId'] ?? null);
            if (! $product) {
                continue;
            }

            $variation = null;
            if (! empty($item['variationId'])) {
                $variation = ProductVariation::where('id', $item['variationId'])
                    ->where('product_id', $product->id)
                    ->first();
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

            $quantity = (int) ($item['quantity'] ?? 1);
            $lineSubtotal = round($unitPrice * $quantity, 2);
            $lineDiscount = $subtotal > 0 ? round($discount * ($lineSubtotal / $subtotal), 2) : 0;

            $lines[] = [
                'id' => (string) ($variation?->id ?? $product->id),
                'quantity' => $quantity,
                'product_tax_code' => '20010',
                'unit_price' => round($unitPrice, 2),
                'discount' => $lineDiscount,
            ];

            $index++;
        }

        if ($lines === [] && $subtotal > 0) {
            $lines[] = [
                'id' => 'order',
                'quantity' => 1,
                'product_tax_code' => '20010',
                'unit_price' => round(max(0, $subtotal - $discount), 2),
                'discount' => 0,
            ];
        }

        return $lines;
    }

    /** @param array<int, array<string, mixed>> $items */
    private function estimateSubtotal(array $items, string $type): float
    {
        $subtotal = 0.0;

        foreach ($items as $item) {
            $product = Product::find($item['productId'] ?? null);
            if (! $product) {
                continue;
            }

            $variation = null;
            if (! empty($item['variationId'])) {
                $variation = ProductVariation::where('id', $item['variationId'])
                    ->where('product_id', $product->id)
                    ->first();
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

            $subtotal += $unitPrice * (int) ($item['quantity'] ?? 1);
        }

        return round($subtotal, 2);
    }

    /** @return array{street: string, city: string, state: string, postal_code: string, country: string} */
    private function originAddress(): array
    {
        $raw = (string) Setting::get('contact_address', "1247 Meadowlark Lane\nFranklin, TN 37064");

        return $this->parseAddressBlock($raw, 'US');
    }

    /** @param array<string, mixed> $address */
    private function normalizeAddress(array $address): array
    {
        return [
            'street' => trim((string) ($address['addressLine1'] ?? $address['address1'] ?? $address['address_line1'] ?? '')),
            'city' => trim((string) ($address['city'] ?? '')),
            'state' => strtoupper(trim((string) ($address['state'] ?? ''))),
            'postal_code' => trim((string) ($address['postalCode'] ?? $address['postal_code'] ?? '')),
            'country' => strtoupper(trim((string) ($address['country'] ?? 'US'))) ?: 'US',
        ];
    }

    /** @return array{street: string, city: string, state: string, postal_code: string, country: string} */
    private function parseAddressBlock(string $raw, string $defaultCountry = 'US'): array
    {
        $lines = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $raw) ?: [])));

        $street = $lines[0] ?? '';
        $city = '';
        $state = '';
        $postal = '';

        if (isset($lines[1]) && preg_match('/^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i', $lines[1], $m)) {
            $city = trim($m[1]);
            $state = strtoupper(trim($m[2]));
            $postal = trim($m[3]);
        }

        return [
            'street' => $street,
            'city' => $city,
            'state' => $state,
            'postal_code' => $postal,
            'country' => $defaultCountry,
        ];
    }

    /** @param array<string, mixed> $address */
    private function canQuote(array $address): bool
    {
        $normalized = $this->normalizeAddress($address);

        return $normalized['city'] !== ''
            && $normalized['state'] !== ''
            && $normalized['postal_code'] !== '';
    }

    /** @return array{tax: float, rate: float, source: string} */
    private function fallbackTax(float $taxableSubtotal, float $shipping): array
    {
        $rate = (float) Setting::get('tax_rate', 9.25);
        $tax = round($taxableSubtotal * ($rate / 100), 2);

        return [
            'tax' => $tax,
            'rate' => $rate,
            'source' => 'fallback',
        ];
    }
}
