<?php

namespace App\Services;

use App\Models\Order;

class OrderEmailService
{
    /** @var array<string, string> */
    private const STATUS_TEMPLATES = [
        'processing' => 'order_processing',
        'paid' => 'payment_confirmation',
        'packed' => 'order_packed',
        'shipped' => 'shipping_confirmation',
        'delivered' => 'delivery_confirmation',
        'completed' => 'order_completed',
        'cancelled' => 'order_cancelled',
        'refunded' => 'order_refunded',
    ];

    public static function sendForStatus(Order $order, string $newStatus, ?string $previousStatus = null): bool
    {
        if ($previousStatus !== null && $previousStatus === $newStatus) {
            return false;
        }

        $slug = self::STATUS_TEMPLATES[$newStatus] ?? null;
        if (! $slug) {
            return false;
        }

        $email = $order->customer_email;
        if (! $email) {
            return false;
        }

        return EmailService::send($slug, $email, [
            'name' => $order->customer_name ?? 'Customer',
            'order_number' => $order->order_number,
            'total' => number_format((float) $order->total, 2),
            'tracking_number' => $order->tracking_number ?: 'Not available yet',
            'status' => ucfirst(str_replace('_', ' ', $newStatus)),
        ]);
    }
}
