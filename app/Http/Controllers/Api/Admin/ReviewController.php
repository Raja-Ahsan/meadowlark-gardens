<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['product', 'user']);

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($r) => ApiFormatter::review($r))
        );
    }

    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $review->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Review status updated.',
            'review' => ApiFormatter::review($review->fresh(['product', 'user'])),
        ]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('body', 'like', "%{$search}%")
                ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"))
                ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('is_wholesale')) {
            $query->where('is_wholesale', filter_var($request->is_wholesale, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }
    }

    protected function allowedSorts(): array
    {
        return ['rating', 'created_at', 'id'];
    }
}
