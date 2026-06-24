<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['items.product', 'user'])->latest()->get();

        return response()->json([
            'orders' => $orders->map(fn ($o) => ApiFormatter::order($o))->values(),
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:processing,shipped,delivered,cancelled'],
        ]);

        $order->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Order status updated.',
            'order' => ApiFormatter::order($order->fresh(['items.product', 'user'])),
        ]);
    }
}
