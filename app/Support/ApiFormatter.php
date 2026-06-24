<?php

namespace App\Support;

use App\Models\Order;
use App\Models\Product;

class ApiFormatter
{
    public static function product(Product $product): array
    {
        return [
            'id' => (string) $product->id,
            'name' => $product->name,
            'category' => $product->category,
            'price' => (float) $product->price,
            'wholesalePrice' => (float) $product->wholesale_price,
            'image' => $product->image,
            'description' => $product->description,
            'badge' => $product->badge,
            'inStock' => (bool) $product->in_stock,
            'minWholesaleQty' => (int) $product->min_wholesale_qty,
        ];
    }

    public static function user(\App\Models\User $user): array
    {
        return [
            'id' => (string) $user->id,
            'businessName' => $user->business_name ?? $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }

    public static function application(\App\Models\WholesaleApplication $app): array
    {
        return [
            'id' => (string) $app->id,
            'businessName' => $app->business_name,
            'contactName' => $app->contact_name,
            'email' => $app->email,
            'phone' => $app->phone,
            'address' => $app->address,
            'businessType' => $app->business_type,
            'estimatedMonthlyOrder' => $app->estimated_monthly_order,
            'message' => $app->message,
            'status' => $app->status,
            'submittedAt' => $app->submitted_at->toIso8601String(),
        ];
    }

    public static function order(Order $order): array
    {
        $order->loadMissing(['items.product', 'user']);

        return [
            'id' => (string) $order->id,
            'orderNumber' => $order->order_number,
            'userId' => $order->user_id ? (string) $order->user_id : '',
            'businessName' => $order->business_name ?? $order->customer_name ?? '',
            'customerName' => $order->customer_name,
            'customerEmail' => $order->customer_email,
            'type' => $order->type,
            'items' => $order->items->map(fn ($item) => [
                'product' => self::product($item->product),
                'quantity' => $item->quantity,
            ])->values()->all(),
            'total' => (float) $order->total,
            'status' => $order->status,
            'createdAt' => $order->created_at->toIso8601String(),
            'paymentMethod' => $order->payment_method,
        ];
    }
}
