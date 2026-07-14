<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\ApiFormatter;
use App\Services\OrderEmailService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product', 'user']);

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($o) => ApiFormatter::order($o))
        );
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items.product', 'items.variation', 'user', 'statusHistories.user']);

        return response()->json([
            'order' => ApiFormatter::order($order),
            'statusHistory' => $order->statusHistories->map(fn ($h) => [
                'status' => $h->status,
                'note' => $h->note,
                'userName' => $h->user?->name,
                'createdAt' => $h->created_at->toIso8601String(),
            ])->values(),
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,processing,paid,packed,shipped,delivered,completed,cancelled,refunded'],
            'note' => ['nullable', 'string'],
            'trackingNumber' => ['nullable', 'string', 'max:255'],
        ]);

        $previousStatus = $order->status;

        $order->update([
            'status' => $data['status'],
            'tracking_number' => $data['trackingNumber'] ?? $order->tracking_number,
            'paid_at' => $data['status'] === 'paid' ? now() : $order->paid_at,
        ]);

        $order->statusHistories()->create([
            'status' => $data['status'],
            'note' => $data['note'] ?? null,
            'user_id' => $request->user()->id,
        ]);

        $order->refresh();
        OrderEmailService::sendForStatus($order, $data['status'], $previousStatus);

        return response()->json([
            'message' => 'Order status updated.',
            'order' => ApiFormatter::order($order->fresh(['items.product', 'user'])),
        ]);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_email', 'like', "%{$search}%")
                ->orWhere('business_name', 'like', "%{$search}%");
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
    }

    protected function allowedSorts(): array
    {
        return ['order_number', 'total', 'status', 'created_at', 'id'];
    }
}
