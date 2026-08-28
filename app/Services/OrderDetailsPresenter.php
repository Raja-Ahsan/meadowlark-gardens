<?php

namespace App\Services;

use App\Models\Order;

class OrderDetailsPresenter
{
    /**
     * Structured order payload for HTML email templates.
     *
     * @return array<string, mixed>
     */
    public static function structured(Order $order): array
    {
        $order->loadMissing(['items.product', 'items.variation']);

        $items = [];
        foreach ($order->items as $item) {
            $name = $item->product?->name ?? 'Product';
            $variant = null;
            if ($item->variation) {
                $attrs = $item->variation->attribute_values ?? [];
                if (is_array($attrs) && $attrs !== []) {
                    $parts = [];
                    foreach ($attrs as $key => $value) {
                        $parts[] = is_string($key) ? "{$key}: {$value}" : (string) $value;
                    }
                    $variant = implode(', ', $parts);
                }
            }

            $qty = (int) $item->quantity;
            $unit = (float) $item->unit_price;
            $items[] = [
                'name' => $name,
                'variant' => $variant,
                'quantity' => $qty,
                'unit_price' => number_format($unit, 2),
                'line_total' => number_format(round($unit * $qty, 2), 2),
            ];
        }

        $discount = (float) ($order->discount ?? 0);
        $shippingAddress = self::addressLines($order->shipping_address);
        $billingAddress = self::addressLines($order->billing_address);
        $sameAddress = $shippingAddress === $billingAddress;

        return [
            'number' => (string) $order->order_number,
            'date' => optional($order->created_at)->format('F j, Y') ?: '',
            'status' => ucfirst(str_replace('_', ' ', (string) $order->status)),
            'payment_method' => (string) ($order->payment_method ?: ''),
            'shipping_method' => (string) ($order->shipping_method_name ?: ''),
            'tracking_number' => filled($order->tracking_number) ? (string) $order->tracking_number : null,
            'items' => $items,
            'subtotal' => number_format((float) ($order->subtotal ?? $order->total), 2),
            'discount' => $discount > 0 ? number_format($discount, 2) : null,
            'tax' => number_format((float) ($order->tax ?? 0), 2),
            'shipping' => number_format((float) ($order->shipping_cost ?? 0), 2),
            'total' => number_format((float) $order->total, 2),
            'shipping_address' => $shippingAddress,
            'billing_address' => $sameAddress ? null : $billingAddress,
            'customer_name' => (string) ($order->customer_name ?: ''),
            'customer_email' => (string) ($order->customer_email ?: ''),
        ];
    }

    /**
     * Flat vars kept for DB subject-line placeholders.
     *
     * @return array<string, string>
     */
    public static function forEmail(Order $order): array
    {
        $data = self::structured($order);

        return [
            'order_number' => $data['number'],
            'total' => $data['total'],
            'subtotal' => $data['subtotal'],
            'discount' => $data['discount'] ?? '0.00',
            'tax' => $data['tax'],
            'shipping' => $data['shipping'],
            'shipping_method' => $data['shipping_method'] ?: 'N/A',
            'payment_method' => $data['payment_method'] ?: 'N/A',
            'tracking_number' => $data['tracking_number'] ?? 'Not available yet',
            'status' => $data['status'],
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'name' => $data['customer_name'] ?: 'Customer',
        ];
    }

    /**
     * @param  array<string, mixed>|null  $address
     * @return list<string>
     */
    private static function addressLines(?array $address): array
    {
        if (! $address) {
            return [];
        }

        return array_values(array_filter([
            trim(($address['firstName'] ?? '').' '.($address['lastName'] ?? '')),
            $address['company'] ?? null,
            $address['addressLine1'] ?? ($address['address_line1'] ?? null),
            $address['addressLine2'] ?? ($address['address_line2'] ?? null),
            trim(implode(', ', array_filter([
                $address['city'] ?? null,
                $address['state'] ?? null,
                $address['postalCode'] ?? ($address['postal_code'] ?? null),
            ]))),
            $address['country'] ?? null,
            isset($address['phone']) && $address['phone'] ? 'Phone: '.$address['phone'] : null,
        ], fn ($v) => filled($v)));
    }
}
