<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Shared admin order listing/export query builder.
 * Keep index filters and spreadsheet export on the same rules.
 */
class AdminOrderQueryService
{
    /**
     * Base query with relationships needed for listing/export.
     *
     * @return Builder<Order>
     */
    public function baseQuery(): Builder
    {
        return Order::query()->with([
            'items.product',
            'items.variation',
            'user',
        ]);
    }

    /**
     * Apply search + filters from an admin request.
     *
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function applyRequestFilters(Builder $query, Request $request): Builder
    {
        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $this->applySearch($query, $search);
        }

        return $this->applyFilters($query, [
            'status' => $request->input('status'),
            'type' => $request->input('type'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ]);
    }

    /**
     * @param  Builder<Order>  $query
     * @param  array{status?: mixed, type?: mixed, date_from?: mixed, date_to?: mixed}  $filters
     * @return Builder<Order>
     */
    public function applyFilters(Builder $query, array $filters): Builder
    {
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function applySearch(Builder $query, string $search): Builder
    {
        $query->where(function ($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_email', 'like', "%{$search}%")
                ->orWhere('business_name', 'like', "%{$search}%");
        });

        return $query;
    }

    /**
     * Restrict to selected IDs that exist (server-side validation).
     *
     * @param  Builder<Order>  $query
     * @param  list<int|string>  $ids
     * @return Builder<Order>
     */
    public function applySelectedIds(Builder $query, array $ids): Builder
    {
        $ids = array_values(array_unique(array_filter(array_map('intval', $ids), fn ($id) => $id > 0)));

        return $query->whereIn('id', $ids);
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function applySort(Builder $query, ?string $sortBy = null, ?string $sortDir = null): Builder
    {
        $allowed = ['order_number', 'total', 'status', 'created_at', 'id'];
        $sortBy = in_array($sortBy, $allowed, true) ? $sortBy : 'created_at';
        $sortDir = $sortDir === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir)->orderBy('id', 'desc');
    }
}
