<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginatedResponse(Coupon::query(), $request, fn ($c) => ApiFormatter::coupon($c))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $coupon = Coupon::create($this->validated($request));

        return response()->json([
            'message' => 'Coupon created.',
            'coupon' => ApiFormatter::coupon($coupon),
        ], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $coupon->update($this->validated($request));

        return response()->json([
            'message' => 'Coupon updated.',
            'coupon' => ApiFormatter::coupon($coupon->fresh()),
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('code', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
    }

    protected function allowedSorts(): array
    {
        return ['code', 'value', 'expires_at', 'created_at', 'id'];
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:percentage,fixed,free_shipping'],
            'value' => ['required', 'numeric', 'min:0'],
            'minCartValue' => ['nullable', 'numeric', 'min:0'],
            'maxDiscount' => ['nullable', 'numeric', 'min:0'],
            'usageLimit' => ['nullable', 'integer', 'min:1'],
            'perUserLimit' => ['nullable', 'integer', 'min:1'],
            'wholesaleOnly' => ['nullable', 'boolean'],
            'retailOnly' => ['nullable', 'boolean'],
            'productIds' => ['nullable', 'array'],
            'categoryIds' => ['nullable', 'array'],
            'startsAt' => ['nullable', 'date'],
            'expiresAt' => ['nullable', 'date'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        return [
            'code' => strtoupper($data['code']),
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'value' => $data['value'],
            'min_cart_value' => $data['minCartValue'] ?? null,
            'max_discount' => $data['maxDiscount'] ?? null,
            'usage_limit' => $data['usageLimit'] ?? null,
            'per_user_limit' => $data['perUserLimit'] ?? null,
            'wholesale_only' => $data['wholesaleOnly'] ?? false,
            'retail_only' => $data['retailOnly'] ?? false,
            'product_ids' => $data['productIds'] ?? null,
            'category_ids' => $data['categoryIds'] ?? null,
            'starts_at' => $data['startsAt'] ?? null,
            'expires_at' => $data['expiresAt'] ?? null,
            'is_active' => $data['isActive'] ?? true,
        ];
    }
}
