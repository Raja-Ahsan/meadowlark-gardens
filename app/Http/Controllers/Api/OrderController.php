<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Support\ApiFormatter;
use App\Services\AuditService;
use App\Services\EmailService;
use App\Services\PaymentMethodService;
use App\Services\ShippingQuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function storeRetail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customerName' => ['required', 'string', 'max:255'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'paymentMethod' => ['required', 'string', Rule::in(PaymentMethodService::enabledLabels())],
            'couponCode' => ['nullable', 'string'],
            'orderNotes' => ['nullable', 'string'],
            'billingAddress' => ['nullable', 'array'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingMethod' => ['required', 'array'],
            'shippingMethod.carrier' => ['required', 'string', 'max:32'],
            'shippingMethod.code' => ['required', 'string', 'max:32'],
            'shippingMethod.name' => ['required', 'string', 'max:255'],
            'shippingMethod.cost' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = $this->createOrder($data, 'retail', null, $data['customerName'], $data['customerEmail']);

        return response()->json([
            'message' => 'Order placed successfully!',
            'order' => ApiFormatter::order($order),
        ], 201);
    }

    public function wholesaleIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->where('type', 'wholesale')
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders->map(fn ($o) => ApiFormatter::order($o))->values(),
        ]);
    }

    public function customerIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->where('type', 'retail')
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders->map(fn ($o) => ApiFormatter::order($o))->values(),
        ]);
    }

    public function storeCustomer(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'paymentMethod' => ['required', 'string', Rule::in(PaymentMethodService::enabledLabels())],
            'couponCode' => ['nullable', 'string'],
            'orderNotes' => ['nullable', 'string'],
            'billingAddress' => ['nullable', 'array'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingMethod' => ['required', 'array'],
            'shippingMethod.carrier' => ['required', 'string', 'max:32'],
            'shippingMethod.code' => ['required', 'string', 'max:32'],
            'shippingMethod.name' => ['required', 'string', 'max:255'],
            'shippingMethod.cost' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = $this->createOrder($data, 'retail', $user->id, $user->name, $user->email);

        return response()->json([
            'message' => 'Order placed successfully!',
            'order' => ApiFormatter::order($order),
        ], 201);
    }

    public function storeWholesale(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'paymentMethod' => ['required', 'string', Rule::in(PaymentMethodService::enabledLabels())],
            'couponCode' => ['nullable', 'string'],
            'orderNotes' => ['nullable', 'string'],
            'billingAddress' => ['nullable', 'array'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingMethod' => ['required', 'array'],
            'shippingMethod.carrier' => ['required', 'string', 'max:32'],
            'shippingMethod.code' => ['required', 'string', 'max:32'],
            'shippingMethod.name' => ['required', 'string', 'max:255'],
            'shippingMethod.cost' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = $this->createOrder(
            $data,
            'wholesale',
            $user->id,
            $user->business_name ?? $user->name,
            $user->email,
            true
        );

        return response()->json([
            'message' => 'Wholesale order placed successfully!',
            'order' => ApiFormatter::order($order),
        ], 201);
    }

    private function createOrder(
        array $data,
        string $type,
        ?int $userId,
        string $customerName,
        string $customerEmail,
        bool $enforceWholesaleMin = false
    ): Order {
        return DB::transaction(function () use ($data, $type, $userId, $customerName, $customerEmail, $enforceWholesaleMin) {
            $subtotal = 0;
            $lineItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['productId']);

                $variation = null;
                if (! empty($item['variationId'])) {
                    $variation = ProductVariation::where('id', $item['variationId'])
                        ->where('product_id', $product->id)
                        ->firstOrFail();
                }

                if ($variation) {
                    if ($product->manage_stock && $variation->stock_quantity < $item['quantity'] && ! $product->allow_backorder) {
                        abort(422, "{$product->name} ({$variation->sku}) does not have enough stock.");
                    }
                } elseif (! $product->isInStock()) {
                    abort(422, "{$product->name} is out of stock.");
                }

                if ($enforceWholesaleMin && $item['quantity'] < $product->min_wholesale_qty) {
                    abort(422, "Minimum wholesale quantity for {$product->name} is {$product->min_wholesale_qty}.");
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
                $subtotal += $unitPrice * $item['quantity'];

                $lineItems[] = [
                    'product' => $product,
                    'variation' => $variation,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                ];
            }

            $discount = 0;
            $freeShipping = false;
            $couponCode = $data['couponCode'] ?? null;
            if ($couponCode) {
                $couponRes = app(CouponController::class)->validateCode(new Request([
                    'code' => $couponCode,
                    'cartTotal' => $subtotal,
                    'type' => $type === 'wholesale' ? 'wholesale' : 'retail',
                ]));
                if ($couponRes->getStatusCode() === 200) {
                    $couponData = json_decode($couponRes->getContent(), true);
                    $discount = $couponData['coupon']['discount'] ?? 0;
                    $freeShipping = (bool) ($couponData['coupon']['freeShipping'] ?? false);
                }
            }

            $shipping = app(ShippingQuoteService::class)->resolveShippingCost([
                'shippingAddress' => $data['shippingAddress'] ?? [],
                'items' => $data['items'],
                'subtotal' => $subtotal,
                'type' => $type,
                'freeShipping' => $freeShipping,
                'shippingMethod' => $data['shippingMethod'],
            ]);

            $taxRate = (float) (\App\Models\Setting::get('tax_rate', 9.25));
            $taxable = max(0, $subtotal - $discount);
            $tax = round($taxable * ($taxRate / 100), 2);
            $shippingCost = $shipping['cost'];
            $total = max(0, $subtotal - $discount + $tax + $shippingCost);

            $order = Order::create([
                'order_number' => 'ORD-'.now()->format('Y').'-'.str_pad((string) (Order::count() + 1), 3, '0', STR_PAD_LEFT),
                'user_id' => $userId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'business_name' => $type === 'wholesale' ? $customerName : null,
                'type' => $type,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'shipping_carrier' => $shipping['carrier'],
                'shipping_method_code' => $shipping['code'],
                'shipping_method_name' => $shipping['name'],
                'total' => $total,
                'coupon_code' => $couponCode,
                'billing_address' => $data['billingAddress'] ?? null,
                'shipping_address' => $data['shippingAddress'] ?? null,
                'order_notes' => $data['orderNotes'] ?? null,
                'status' => 'pending',
                'payment_method' => $data['paymentMethod'],
            ]);

            foreach ($lineItems as $line) {
                $order->items()->create([
                    'product_id' => $line['product']->id,
                    'variation_id' => $line['variation']?->id,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                ]);

                if ($line['variation'] && $line['product']->manage_stock) {
                    $line['variation']->decrement('stock_quantity', $line['quantity']);
                } elseif ($line['product']->manage_stock) {
                    $line['product']->decrement('stock_quantity', $line['quantity']);
                    if ($line['product']->fresh()->stock_quantity <= 0) {
                        $line['product']->update(['in_stock' => false]);
                    }
                }
            }

            $order->statusHistories()->create(['status' => 'pending', 'note' => 'Order placed']);

            EmailService::send('order_confirmation', $customerEmail, [
                'name' => $customerName,
                'order_number' => $order->order_number,
                'total' => number_format($order->total, 2),
            ]);

            $adminEmail = \App\Models\Setting::get('site_email', 'admin@meadowlarkgardens.com');
            EmailService::send('new_order_admin', $adminEmail, [
                'order_number' => $order->order_number,
                'total' => number_format($order->total, 2),
            ]);

            AuditService::log('order.created', $order, null, ['total' => $order->total], $userId);

            return $order->load(['items.product', 'user']);
        });
    }
}
