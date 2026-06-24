<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function storeRetail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customerName' => ['required', 'string', 'max:255'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'paymentMethod' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
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
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders->map(fn ($o) => ApiFormatter::order($o))->values(),
        ]);
    }

    public function storeWholesale(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'paymentMethod' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
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
            $total = 0;
            $lineItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['productId']);

                if (! $product->in_stock) {
                    abort(422, "{$product->name} is out of stock.");
                }

                if ($enforceWholesaleMin && $item['quantity'] < $product->min_wholesale_qty) {
                    abort(422, "Minimum wholesale quantity for {$product->name} is {$product->min_wholesale_qty}.");
                }

                $unitPrice = $type === 'wholesale' ? $product->wholesale_price : $product->price;
                $total += $unitPrice * $item['quantity'];

                $lineItems[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                ];
            }

            $order = Order::create([
                'order_number' => 'ORD-'.now()->format('Y').'-'.str_pad((string) (Order::count() + 1), 3, '0', STR_PAD_LEFT),
                'user_id' => $userId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'business_name' => $type === 'wholesale' ? $customerName : null,
                'type' => $type,
                'total' => $total,
                'status' => 'processing',
                'payment_method' => $data['paymentMethod'],
            ]);

            foreach ($lineItems as $line) {
                $order->items()->create([
                    'product_id' => $line['product']->id,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                ]);
            }

            return $order->load(['items.product', 'user']);
        });
    }
}
