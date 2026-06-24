<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HandlesPaginatedListing
{
    protected function paginatedResponse(Builder $query, Request $request, ?callable $transform = null): array
    {
        $perPage = min((int) $request->input('per_page', 15), 100);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc';
        $search = $request->input('search');

        if ($search && method_exists($this, 'applySearch')) {
            $this->applySearch($query, $search);
        }

        if (method_exists($this, 'applyFilters')) {
            $this->applyFilters($query, $request);
        }

        $allowedSorts = method_exists($this, 'allowedSorts') ? $this->allowedSorts() : ['created_at', 'id', 'name'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $paginator = $query->orderBy($sortBy, $sortDir)->paginate($perPage);

        $items = $paginator->getCollection();
        if ($transform) {
            $items = $items->map($transform);
        }

        return [
            'data' => $items->values()->all(),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ];
    }
}
