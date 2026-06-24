<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($log) => [
                'id' => (string) $log->id,
                'action' => $log->action,
                'userName' => $log->user?->name ?? 'System',
                'modelType' => $log->model_type ? class_basename($log->model_type) : null,
                'modelId' => $log->model_id,
                'ipAddress' => $log->ip_address,
                'createdAt' => $log->created_at->toIso8601String(),
            ])
        );
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('action', 'like', "%{$search}%")
            ->orWhere('ip_address', 'like', "%{$search}%");
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->action.'%');
        }
    }

    protected function allowedSorts(): array
    {
        return ['created_at', 'action', 'id'];
    }
}
