<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ShipmentOrdersExport;
use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AdminOrderQueryService;
use App\Services\OrderEmailService;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OrderController extends Controller
{
    use HandlesPaginatedListing;

    public function __construct(
        private readonly AdminOrderQueryService $orderQuery,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->orderQuery->baseQuery();

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
        $order->load(['items.product', 'items.variation']);
        OrderEmailService::sendForStatus($order, $data['status'], $previousStatus);

        return response()->json([
            'message' => 'Order status updated.',
            'order' => ApiFormatter::order($order->fresh(['items.product', 'items.variation', 'user', 'statusHistories'])),
        ]);
    }

    /**
     * Export orders for shipment spreadsheet upload.
     */
    public function export(Request $request): BinaryFileResponse|JsonResponse
    {
        $data = $request->validate([
            'mode' => ['required', Rule::in(['all', 'selected', 'filtered'])],
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer', 'distinct'],
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:64'],
            'type' => ['nullable', 'string', 'max:32'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'sort_by' => ['nullable', 'string', 'max:64'],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
        ]);

        try {
            $query = $this->orderQuery->baseQuery();

            if ($data['mode'] === 'selected') {
                $ids = $data['ids'] ?? [];
                if ($ids === []) {
                    throw ValidationException::withMessages([
                        'ids' => 'Please select at least one order to export.',
                    ]);
                }
                $this->orderQuery->applySelectedIds($query, $ids);
                // Ensure selected IDs actually exist / remain after validation.
                if (! (clone $query)->exists()) {
                    throw ValidationException::withMessages([
                        'ids' => 'No valid orders found for the selected IDs.',
                    ]);
                }
                $filename = 'shipment-orders-selected-'.now()->format('Y-m-d').'.xlsx';
            } elseif ($data['mode'] === 'filtered') {
                $this->orderQuery->applyRequestFilters($query, $request);
                if (! (clone $query)->exists()) {
                    throw ValidationException::withMessages([
                        'filters' => 'No orders match the current filters.',
                    ]);
                }
                $filename = 'shipment-orders-filtered-'.now()->format('Y-m-d').'.xlsx';
            } else {
                // all — ignore filters/selection
                if (! (clone $query)->exists()) {
                    throw ValidationException::withMessages([
                        'orders' => 'There are no orders to export.',
                    ]);
                }
                $filename = 'shipment-orders-'.now()->format('Y-m-d').'.xlsx';
            }

            $this->orderQuery->applySort(
                $query,
                $data['sort_by'] ?? 'created_at',
                $data['sort_dir'] ?? 'desc'
            );

            Log::info('Admin orders shipment export started', [
                'admin_id' => $request->user()?->id,
                'mode' => $data['mode'],
                'count' => (clone $query)->count(),
            ]);

            return Excel::download(new ShipmentOrdersExport($query), $filename);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Admin orders shipment export failed', [
                'admin_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to export orders. Please try again.',
            ], 500);
        }
    }

    // Shared with listing via HandlesPaginatedListing + AdminOrderQueryService.
    protected function applySearch($query, string $search): void
    {
        $this->orderQuery->applySearch($query, $search);
    }

    protected function applyFilters($query, Request $request): void
    {
        // applyRequestFilters also applies search — listing already applied search separately.
        $this->orderQuery->applyFilters($query, [
            'status' => $request->input('status'),
            'type' => $request->input('type'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ]);
    }

    protected function allowedSorts(): array
    {
        return ['order_number', 'total', 'status', 'created_at', 'id'];
    }
}
